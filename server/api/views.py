from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Avg, Sum, Count, Q, F
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from datetime import datetime, timedelta
import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.urls import reverse
from django.template.loader import render_to_string
from django.core.cache import cache
from decouple import config
import google.oauth2.id_token
import google.auth.transport.requests
import requests
import json
import re

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, UserProfileSerializer,
    LessonSerializer, LessonProgressSerializer, PracticeSessionSerializer,
    VocabularyWordSerializer, AchievementSerializer, UserAchievementSerializer,
    KidsLessonSerializer, KidsProgressSerializer, KidsAchievementSerializer, KidsCertificateSerializer,
    WaitlistSerializer, DailyProgressSerializer, WeeklyStatsSerializer, UserStatsSerializer
)
from .models import (
    UserProfile, Lesson, LessonProgress, PracticeSession,
    VocabularyWord, Achievement, UserAchievement,
    KidsLesson, KidsProgress, KidsAchievement, KidsCertificate, WaitlistEntry,
    EmailVerificationToken
)

logger = logging.getLogger(__name__)


# ============= Helper Functions =============
def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'token': str(refresh.access_token),
    }


def calculate_level(points):
    """Calculate user level from points"""
    import math
    return math.floor(math.sqrt(points / 100)) + 1


# ============= Authentication Views =============
def send_verification_email(user, verification_token):
    """Send verification email to user"""
    try:
        # Create verification URL - dynamically determine frontend URL
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        verification_url = f"{frontend_url}/verify-email/{verification_token.token}/"
        
        # Email content
        subject = "Activate to learn with Elora"
        
        # Plain text message (fallback for email clients that don't support HTML)
        plain_message = f"""Welcome to Elora! 👋

Please click the following link to activate your account:

{verification_url}

IMPORTANT: This activation link will expire in 24 hours for security purposes.

We are excited to help you achieve your language learning goals!

If you have any questions or need assistance, please contact us at +94750363903 and our support team will be happy to help you.

Best regards,
The Elora Team

---
This is an automated email. Please do not reply to this message.
© 2025 Elora. All rights reserved."""
        
        # Render HTML email template
        html_message = render_to_string('email/verification_email.html', {
            'verification_url': verification_url,
        })
        
        # Create email message with both plain text and HTML versions
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_message, "text/html")
        
        # Send the email
        result = msg.send(fail_silently=False)
        
        logger.info(f"Verification email sent successfully to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
        return False


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    try:
        logger.info(f"Registration request received for email: {request.data.get('email', 'unknown')}")
        
        email = request.data.get('email')
        
        # Check if user with this email already exists
        if User.objects.filter(email=email).exists():
            existing_user = User.objects.get(email=email)
            
            # If user exists and is active, return error
            if existing_user.is_active:
                logger.warning(f"Registration attempt with already active email: {email}")
                return Response({
                    "message": "This email is already registered and activated. Please login instead.",
                    "email_exists": True,
                    "user_active": True
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # If user exists but is inactive, handle reactivation
            if not existing_user.is_active:
                logger.info(f"Resending verification email for inactive account: {email}")
                
                # Verify password before proceeding
                serializer_data = request.data.copy()
                if not authenticate(username=existing_user.username, password=serializer_data.get('password')):
                    return Response({
                        "message": "Incorrect password. Please use the same password you registered with.",
                        "email_exists": True,
                        "user_active": False
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Update user password if provided
                if 'password' in serializer_data:
                    existing_user.set_password(serializer_data['password'])
                    existing_user.save()
                
                # Generate new verification token
                verification_token = EmailVerificationToken.generate_token(existing_user)
                logger.info(f"Generated new verification token for inactive user {existing_user.email}")
                
                # Send verification email
                email_sent = send_verification_email(existing_user, verification_token)
                
                user_serializer = UserSerializer(existing_user)
                
                response_message = "We've sent a new verification email to your inbox. Please check your email (including spam folder) and click the activation link to verify your account."
                if not email_sent:
                    logger.warning(f"Verification email not sent to inactive user {existing_user.email}")
                    response_message = "We couldn't send the verification email. Please contact support at elora.toinfo@gmail.com with your email address to activate your account."
                
                return Response({
                    "success": True,
                    "message": response_message,
                    "user": user_serializer.data,
                    "verified": False,
                    "email_sent": email_sent,
                    "reactivated": True
                }, status=status.HTTP_200_OK)
        
        # If email doesn't exist, proceed with normal registration
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Check if profile already exists
            if not UserProfile.objects.filter(user=user).exists():
                UserProfile.objects.create(user=user)
            
            # Create verification token
            verification_token = EmailVerificationToken.generate_token(user)
            logger.info(f"Created verification token for user {user.email}")
            
            # Send verification email
            email_sent = send_verification_email(user, verification_token)
            
            # Serialize user with profile
            user_serializer = UserSerializer(user)
            
            response_message = "Account created successfully! We've sent a verification email to your inbox. Please check your email (including spam folder) and click the activation link to verify your account. You won't be able to login until you verify your email."
            if not email_sent:
                logger.warning(f"Registration successful but email not sent to {user.email}")
                response_message = "Account created successfully! However, we couldn't send the verification email. Please contact support at elora.toinfo@gmail.com with your email address to activate your account."
            
            return Response({
                "success": True,
                "message": response_message,
                "user": user_serializer.data,
                "verified": False,
                "email_sent": email_sent
            }, status=status.HTTP_201_CREATED)
        
        logger.warning(f"Registration validation failed: {serializer.errors}")
        return Response({
            "message": "Registration failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred during registration",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """Authenticate user with Google OAuth token"""
    try:
        token = request.data.get('token')
        
        if not token:
            return Response({
                "message": "Google token is required",
                "success": False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the Google token
        try:
            request_obj = google.auth.transport.requests.Request()
            id_info = google.oauth2.id_token.verify_oauth2_token(
                token, request_obj, config('GOOGLE_CLIENT_ID', default='')
            )
            
            # Verify the token is for our app
            if id_info['aud'] != config('GOOGLE_CLIENT_ID', default=''):
                raise ValueError('Token audience mismatch')
            
            # Extract user information from Google token
            google_id = id_info['sub']
            email = id_info.get('email')
            first_name = id_info.get('given_name', '')
            last_name = id_info.get('family_name', '')
            name = id_info.get('name', f"{first_name} {last_name}".strip() or email.split('@')[0])
            picture = id_info.get('picture', '')
            
            if not email:
                return Response({
                    "message": "Email not provided by Google",
                    "success": False
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user exists by email
            try:
                user = User.objects.get(email=email)
                # Update user info if needed
                if not user.first_name and first_name:
                    user.first_name = first_name
                if not user.last_name and last_name:
                    user.last_name = last_name
                user.last_login = timezone.now()
                user.save()
            except User.DoesNotExist:
                # Create new user from Google account
                username = email.split('@')[0]
                # Ensure username is unique
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True,  # Google verified users don't need email verification
                    last_login=timezone.now()
                )
                user.save()
                
                # Create user profile
                UserProfile.objects.create(
                    user=user,
                    level='beginner',
                    points=0,
                    streak=0
                )
                
                logger.info(f"New user created via Google OAuth: {email}")
            
            # Generate JWT tokens
            tokens = get_tokens_for_user(user)
            user_serializer = UserSerializer(user)
            
            return Response({
                "message": "Google authentication successful",
                "success": True,
                "user": user_serializer.data,
                "token": tokens['token'],
                "refresh": tokens['refresh']
            })
            
        except ValueError as e:
            logger.error(f"Google token verification failed: {str(e)}")
            return Response({
                "message": "Invalid Google token",
                "success": False,
                "error": str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Google authentication error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred during Google authentication",
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user"""
    try:
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                "message": "Invalid input",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                "message": "Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if email is verified BEFORE authentication
        if not user.is_active:
            # Verify password to avoid revealing if user exists
            temp_auth = authenticate(username=user.username, password=password)
            if temp_auth is None:
                return Response({
                    "message": "Invalid email or password"
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response({
                "message": "Please verify your email before logging in. Check your inbox for the verification link.",
                "verified": False,
                "email": user.email
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Now authenticate the active user
        user = authenticate(username=user.username, password=password)
        
        if user is not None:
            # Update last_login timestamp in database (MySQL/SQLite)
            user.last_login = timezone.now()
            user.save()
            
            tokens = get_tokens_for_user(user)
            user_serializer = UserSerializer(user)
            
            return Response({
                "message": "Login successful",
                "user": user_serializer.data,
                "token": tokens['token'],
                "refresh": tokens['refresh']
            })
        else:
            return Response({
                "message": "Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response({
            "message": "An error occurred during login"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    """Verify user email with token"""
    try:
        # Find the token
        try:
            verification_token = EmailVerificationToken.objects.get(token=token, is_used=False)
        except EmailVerificationToken.DoesNotExist:
            return Response({
                "message": "Invalid or expired verification token",
                "success": False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if token is still valid
        if not verification_token.is_valid():
            return Response({
                "message": "Verification token has expired. Please request a new one.",
                "success": False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Activate user account
        user = verification_token.user
        user.is_active = True
        user.save()
        
        # Mark token as used
        verification_token.is_used = True
        verification_token.save()
        
        logger.info(f"Email verification successful for user {user.email}")
        
        return Response({
            "message": "Email verified successfully! You can now log in.",
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Email verification error: {str(e)}")
        return Response({
            "message": "An error occurred during verification",
            "success": False,
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get or update user profile"""
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            serializer = UserProfileSerializer(profile, data=request.data, partial=(request.method == 'PATCH'))
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Profile error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """Get current user information"""
    try:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"User info error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Lesson Views =============
@api_view(['GET'])
@permission_classes([AllowAny])
def lessons_list(request):
    """Get all lessons, optionally filtered"""
    try:
        lesson_type = request.query_params.get('type')  # kids, beginner, intermediate, advanced, ielts, pte
        content_type = request.query_params.get('content')  # vocabulary, pronunciation, etc.
        
        queryset = Lesson.objects.filter(is_active=True)
        
        if lesson_type:
            queryset = queryset.filter(lesson_type=lesson_type)
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        
        serializer = LessonSerializer(queryset, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Lessons list error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def lesson_detail(request, slug):
    """Get specific lesson by slug"""
    try:
        lesson = Lesson.objects.get(slug=slug, is_active=True)
        serializer = LessonSerializer(lesson)
        return Response(serializer.data)
    except Lesson.DoesNotExist:
        return Response({
            "message": "Lesson not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Lesson detail error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Progress Tracking Views =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_progress(request):
    """Get user's lesson progress"""
    try:
        lesson_type = request.query_params.get('type')
        
        queryset = LessonProgress.objects.filter(user=request.user)
        if lesson_type:
            queryset = queryset.filter(lesson__lesson_type=lesson_type)
        
        serializer = LessonProgressSerializer(queryset, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Progress error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_lesson_progress(request):
    """Record or update lesson progress"""
    try:
        lesson_id = request.data.get('lesson')
        
        if not lesson_id:
            return Response({
                "message": "Lesson ID is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({
                "message": "Lesson not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get or create progress
        progress, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson
        )
        
        serializer = LessonProgressSerializer(progress, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Update user profile points and streak
            profile = request.user.profile
            score = request.data.get('score', 0)
            time_spent = request.data.get('time_spent_minutes', 0)
            
            # Calculate points
            points = int(score / 10) + min(10, time_spent // 5)
            if score == 100:
                points += 20  # Perfect score bonus
            
            profile.points += points
            
            # Update streak logic (simplified)
            today = timezone.now().date()
            last_session = PracticeSession.objects.filter(user=request.user).order_by('-session_date').first()
            
            if last_session:
                last_date = last_session.session_date.date()
                yesterday = today - timedelta(days=1)
                
                if last_date == yesterday:
                    profile.current_streak += 1
                elif last_date != today:
                    profile.current_streak = 1
            else:
                profile.current_streak = 1
            
            profile.longest_streak = max(profile.longest_streak, profile.current_streak)
            profile.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Record progress error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_practice_session(request):
    """Record a practice session"""
    try:
        # Add user to request data
        data = request.data.copy()
        
        serializer = PracticeSessionSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Practice session error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def practice_history(request):
    """Get practice session history"""
    try:
        limit = int(request.query_params.get('limit', 50))
        session_type = request.query_params.get('type')
        
        queryset = PracticeSession.objects.filter(user=request.user)
        
        if session_type:
            queryset = queryset.filter(session_type=session_type)
        
        queryset = queryset[:limit]
        serializer = PracticeSessionSerializer(queryset, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Practice history error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Vocabulary Views =============
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def vocabulary(request):
    """Get user's vocabulary or add new word"""
    try:
        if request.method == 'GET':
            category = request.query_params.get('category')
            min_mastery = request.query_params.get('min_mastery')
            
            queryset = VocabularyWord.objects.filter(user=request.user)
            
            if category:
                queryset = queryset.filter(category=category)
            if min_mastery:
                queryset = queryset.filter(mastery_level__gte=float(min_mastery))
            
            serializer = VocabularyWordSerializer(queryset, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            word = request.data.get('word', '').lower()
            
            # Check if word already exists
            vocab, created = VocabularyWord.objects.get_or_create(
                user=request.user,
                word=word,
                defaults={
                    'definition': request.data.get('definition', ''),
                    'example_sentence': request.data.get('example_sentence', ''),
                    'difficulty': request.data.get('difficulty', 1),
                    'category': request.data.get('category', ''),
                }
            )
            
            if not created:
                # Update existing word
                vocab.times_practiced += 1
                is_correct = request.data.get('is_correct', True)
                
                if is_correct:
                    vocab.times_correct += 1
                else:
                    vocab.times_incorrect += 1
                
                # Update mastery level
                accuracy = vocab.times_correct / max(vocab.times_practiced, 1)
                vocab.mastery_level = min(100, accuracy * 100)
                vocab.save()
            
            serializer = VocabularyWordSerializer(vocab)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Vocabulary error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def vocabulary_detail(request, word_id):
    """Get, update, or delete specific vocabulary word"""
    try:
        vocab = VocabularyWord.objects.get(id=word_id, user=request.user)
        
        if request.method == 'GET':
            serializer = VocabularyWordSerializer(vocab)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = VocabularyWordSerializer(vocab, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            vocab.delete()
            return Response({"message": "Word deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
    except VocabularyWord.DoesNotExist:
        return Response({
            "message": "Word not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Vocabulary detail error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Achievement Views =============
@api_view(['GET'])
@permission_classes([AllowAny])
def achievements_list(request):
    """Get all available achievements"""
    try:
        queryset = Achievement.objects.filter(is_active=True)
        category = request.query_params.get('category')
        tier = request.query_params.get('tier')
        
        if category:
            queryset = queryset.filter(category=category)
        if tier:
            queryset = queryset.filter(tier=tier)
        
        serializer = AchievementSerializer(queryset, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Achievements list error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_achievements(request):
    """Get user's achievements with progress"""
    try:
        # Get all achievements with user's progress
        all_achievements = Achievement.objects.filter(is_active=True)
        user_achievements = {}
        
        for user_achievement in UserAchievement.objects.filter(user=request.user):
            user_achievements[user_achievement.achievement_id] = user_achievement
        
        results = []
        for achievement in all_achievements:
            user_ach = user_achievements.get(achievement.id)
            
            ach_data = AchievementSerializer(achievement).data
            if user_ach:
                ach_data['progress'] = user_ach.progress
                ach_data['unlocked'] = user_ach.unlocked
                ach_data['unlocked_at'] = user_ach.unlocked_at
            else:
                ach_data['progress'] = 0
                ach_data['unlocked'] = False
                ach_data['unlocked_at'] = None
            
            results.append(ach_data)
        
        return Response(results)
    
    except Exception as e:
        logger.error(f"My achievements error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_achievements(request):
    """Check and update achievements based on current progress"""
    try:
        profile = request.user.profile
        
        # Get user statistics
        lessons_completed = LessonProgress.objects.filter(user=request.user, completed=True).count()
        practice_time = PracticeSession.objects.filter(user=request.user).aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0
        
        # Check all achievements
        unlocked_achievements = []
        all_achievements = Achievement.objects.filter(is_active=True)
        
        for achievement in all_achievements:
            user_ach, created = UserAchievement.objects.get_or_create(
                user=request.user,
                achievement=achievement
            )
            
            if user_ach.unlocked:
                continue
            
            # Calculate progress based on requirement
            current_value = 0
            metric = achievement.requirement_metric
            
            if metric == 'lessonsCompleted':
                current_value = lessons_completed
            elif metric == 'currentStreak':
                current_value = profile.current_streak
            elif metric == 'practiceTime':
                current_value = practice_time
            elif metric == 'wordsLearned':
                current_value = VocabularyWord.objects.filter(user=request.user).count()
            
            # Update progress
            progress = min(100, (current_value / achievement.requirement_target) * 100)
            user_ach.progress = progress
            
            # Check if unlocked
            if current_value >= achievement.requirement_target:
                user_ach.unlocked = True
                user_ach.unlocked_at = timezone.now()
                profile.points += achievement.points
                unlocked_achievements.append(AchievementSerializer(achievement).data)
            
            user_ach.save()
        
        if unlocked_achievements:
            profile.save()
        
        return Response({
            "unlocked": unlocked_achievements,
            "message": f"{len(unlocked_achievements)} new achievement(s) unlocked!"
        })
    
    except Exception as e:
        logger.error(f"Check achievements error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Statistics Views =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Get comprehensive user statistics"""
    try:
        profile = request.user.profile
        
        # Calculate statistics
        lessons_completed = LessonProgress.objects.filter(user=request.user, completed=True).count()
        practice_time = PracticeSession.objects.filter(user=request.user).aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0
        
        avg_score = PracticeSession.objects.filter(user=request.user).aggregate(
            avg=Avg('score')
        )['avg'] or 0
        
        vocabulary_count = VocabularyWord.objects.filter(user=request.user).count()
        achievements_unlocked = UserAchievement.objects.filter(user=request.user, unlocked=True).count()
        
        stats = {
            'total_points': profile.points,
            'level': calculate_level(profile.points),
            'current_streak': profile.current_streak,
            'longest_streak': profile.longest_streak,
            'lessons_completed': lessons_completed,
            'practice_time_minutes': practice_time,
            'vocabulary_count': vocabulary_count,
            'achievements_unlocked': achievements_unlocked,
            'average_score': round(avg_score, 2)
        }
        
        serializer = UserStatsSerializer(stats)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"User stats error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_progress(request):
    """Get daily progress for the last N days"""
    try:
        days = int(request.query_params.get('days', 30))
        
        # Calculate daily stats
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get sessions grouped by date
        sessions = PracticeSession.objects.filter(
            user=request.user,
            session_date__date__gte=start_date,
            session_date__date__lte=end_date
        )
        
        daily_stats = {}
        for session in sessions:
            date_str = session.session_date.date().isoformat()
            if date_str not in daily_stats:
                daily_stats[date_str] = {
                    'date': date_str,
                    'lessons_completed': 0,
                    'practice_time': 0,
                    'points': session.points_earned,
                    'scores': []
                }
            
            daily_stats[date_str]['lessons_completed'] += 1
            daily_stats[date_str]['practice_time'] += session.duration_minutes
            daily_stats[date_str]['points'] += session.points_earned
            daily_stats[date_str]['scores'].append(session.score)
        
        # Calculate averages
        result = []
        for data in daily_stats.values():
            scores = data.pop('scores')
            data['average_score'] = sum(scores) / len(scores) if scores else 0
            result.append(data)
        
        result.sort(key=lambda x: x['date'])
        serializer = DailyProgressSerializer(result, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Daily progress error: {str(e)}")
    return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Kids Endpoints (Keep existing) =============
@api_view(['GET'])
@permission_classes([AllowAny])
def kids_lessons(request):
    qs = KidsLesson.objects.filter(is_active=True).order_by('id')
    serializer = KidsLessonSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_progress_get(request):
    obj, _ = KidsProgress.objects.get_or_create(user=request.user)
    serializer = KidsProgressSerializer(obj)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_progress_update(request):
    obj, _ = KidsProgress.objects.get_or_create(user=request.user)
    serializer = KidsProgressSerializer(instance=obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_achievements_list(request):
    qs = KidsAchievement.objects.filter(user=request.user).order_by('name')
    serializer = KidsAchievementSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_issue_certificate(request):
    """Record an issued certificate (optional file_url for share)."""
    cert_id = request.data.get('cert_id')
    title = request.data.get('title')
    file_url = request.data.get('file_url', '')
    if not cert_id or not title:
        return Response({"message": "cert_id and title are required"}, status=status.HTTP_400_BAD_REQUEST)
    obj, _ = KidsCertificate.objects.get_or_create(user=request.user, cert_id=cert_id, defaults={
        'title': title,
        'file_url': file_url
    })
    # Update title/url if provided later
    updated = False
    if title and obj.title != title:
        obj.title = title
        updated = True
    if file_url and obj.file_url != file_url:
        obj.file_url = file_url
        updated = True
    if updated:
        obj.save()
    return Response(KidsCertificateSerializer(obj).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_my_certificates(request):
    qs = KidsCertificate.objects.filter(user=request.user).order_by('-issued_at')
    return Response(KidsCertificateSerializer(qs, many=True).data)


# ============= Gemini AI Games =============
@api_view(['POST'])
@permission_classes([AllowAny])  # Allow unauthenticated requests - API key is server-side
def kids_gemini_game(request):
    """
    Proxy endpoint for Gemini API - generates AI-powered games for kids.
    API key is stored server-side, never exposed to clients.
    Works with both authenticated and local users.
    """
    try:
        # Get Gemini API key from environment
        gemini_api_key = config('GEMINI_API_KEY', default=None)
        
        if not gemini_api_key:
            logger.error("GEMINI_API_KEY not configured in environment")
            logger.error("Please set GEMINI_API_KEY in your .env file or environment variables")
            return Response({
                "message": "AI service not configured. Please set GEMINI_API_KEY in your server configuration.",
                "error": "API_KEY_MISSING",
                "details": "The GEMINI_API_KEY environment variable is not set. Please configure it to enable AI games."
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        # Extract request data
        game_type = request.data.get('gameType', 'interactive')
        
        logger.info(f"Gemini API key found, generating game for type: {game_type}")
        user_input = request.data.get('userInput', '')
        conversation_history = request.data.get('conversationHistory', [])
        context = request.data.get('context', {})
        
        # Build system prompt
        age = context.get('age', 7)
        level = context.get('level', 'beginner')
        base_prompt = f"You are a friendly and encouraging AI teacher playing fun educational games with a {age}-year-old child learning English. The child's level is {level}. Be patient, positive, and make learning fun! IMPORTANT: Do NOT use any markdown formatting like **, *, __, _, `, # etc. Use only plain text. NEVER wrap your JSON response in code blocks (no ```json or ```). Return pure JSON only."
        
        # Game-specific prompts for original 5 game categories - optimized for little kids
        game_prompts = {
            'tongue-twister': f"""{base_prompt}

You are playing a Tongue Twister game with a {age}-year-old child.
Give them SIMPLE, SHORT tongue twisters that are perfect for little kids.
Examples: 'Red lorry, yellow lorry' (for 5-7 years)
Examples: 'Big bug bit' (for 4-6 years)
Examples: 'Toy boat, toy boat' (for 7-9 years)
Examples: 'She sells seashells' (for 8+ years)
Keep them age-appropriate, fun, and easy to remember.
LISTEN to what the child says and UNDERSTAND THE MEANING of their response.
After they try to say it, give them encouraging feedback naturally in your response.
If they said something wrong or with mistakes, gently correct them but be positive.
IMPORTANT: Award points (10-50) ONLY AFTER the child attempts the tongue twister, NOT when giving the initial tongue twister.
Format your response as JSON with fields:
For first prompt: {{ "content": "Here's your tongue twister: [phrase]" }}
After child attempts: {{ "content": "[Encouraging response like 'Great try!' or 'Excellent! Keep practicing!']", "points": 25 }}""",
            
            'word-chain': f"""{base_prompt}

You are playing a Word Chain game with a {age}-year-old child.
Give them SIMPLE words they know (like cat, dog, sun, fun, run, big, red).
Start with a word and ask them to say another word that starts with the last letter.
LISTEN to what the child says and UNDERSTAND THE MEANING.
If they say a word correctly, celebrate!
If they say something wrong, gently help them understand.
Keep it fun and simple!
Give encouraging feedback after each word.
ALWAYS award points (15-40) for correct word chains.
Format your response as JSON with:
{{ "gameInstruction": "Say a word starting with the letter [X]", "content": "Great! I said [word]. Now you say a word starting with [letter]!", "feedback": "Excellent! That's a great word!", "points": 30 }}""",
            
            'story-telling': f"""{base_prompt}

You are playing a Story Telling game with a {age}-year-old child.
Start a SHORT, EXCITING, and age-appropriate story (2-3 sentences).
Use simple words they understand.
Themes: animals, adventures, magic, friends, toys.
LISTEN carefully to what the child says to continue the story.
UNDERSTAND THE MEANING of their words and respond naturally.
If they make mistakes, gently guide them but keep the story flowing!
ALWAYS award points (20-50) for creative contributions.
Format your response as JSON with:
{{ "gameInstruction": "Continue the story! What happens next?", "content": "Once upon a time, there was a brave little [character] who loved [something fun]. One day, [character] went on an adventure to [fun place]...", "nextStep": "What happens next? Tell me!", "feedback": "What an exciting story! Keep going!", "points": 35 }}""",
            
            'pronunciation-challenge': f"""{base_prompt}

You are playing a Pronunciation Challenge game with a {age}-year-old child.
Give them STANDARD, age-appropriate words for kids aged 4-10.
Examples: Cat, Dog, Sun, Moon, Star, Ball, Car, Tree, Bird, Fish, Book, Hat, Cup, Bus, Bag, Box, Pig, Cow, Duck, Frog, Bee, Fly, Ant, Bug, Pen, Cup, Key, Toy, Boy, Girl, Mom, Dad, Yes, No, Up, Down, Run, Jump, Big, Small, Red, Blue, Green, Yellow.
For beginners (4-6 years): Give simple CVC words (3 letters, like Cat, Dog, Bus).
For intermediates (7-8 years): Give slightly harder words (like Bird, Frog, Jump).
For advanced (9-10 years): Give challenging sounds (like Thumb, Three, Throw).
ALWAYS capitalize the first letter of the word.
IMPORTANT: ONLY award points and give feedback AFTER hearing the child's pronunciation attempt.
For the INITIAL prompt, give the word to practice WITHOUT any feedback or points.
After they try, listen carefully and give encouraging feedback or gentle corrections.
Use simple, clear words - no puns or wordplay.
ALWAYS award points (10-40) based on pronunciation quality, but ONLY after they speak.
Format your response as JSON:
For initial word: {{ "gameInstruction": "Say this word 3 times", "content": "Let's practice saying: [word]\n\nRepeat after me: [word]!" }}
After child speaks: {{ "content": "[Simple feedback like 'Perfect!' or 'Try again, focus on the [sound] sound']", "feedback": "", "points": 25 }}""",
            
            'conversation-practice': f"""{base_prompt}

You are having a friendly conversation with a {age}-year-old child.
Ask them SIMPLE questions about their favorite things (like 'What's your favorite color?', 'Do you have a pet?', 'What's your favorite food?').
LISTEN carefully to their responses and UNDERSTAND THE MEANING of what they're saying.
Even if their grammar isn't perfect, understand their meaning and respond naturally.
If they make mistakes, gently model correct language but keep the conversation flowing smoothly.
ALWAYS award points (15-35) for engaging responses.
Format your response as JSON with:
{{ "content": "Hi! Let's chat! What's your favorite animal?", "feedback": "That's so cool! Tell me more!", "points": 20 }}"""
        }
        
        system_prompt = game_prompts.get(game_type, base_prompt)
        
        # Build user message - initial prompts for each game type (optimized for little kids)
        if not user_input:
            initial_prompts = {
                'tongue-twister': "Hi! Let's play tongue twisters! Give me a fun tongue twister that's perfect for little kids like me!",
                'word-chain': "Hi! Let's play word chain! Give me a simple word to start the chain.",
                'story-telling': "Hi! Let's tell a story together! Start an exciting story for me with simple words.",
                'pronunciation-challenge': "Hi! Let's practice pronunciation! Give me simple words to practice saying.",
                'conversation-practice': "Hi! Let's have a conversation. Ask me something fun about my favorite things!"
            }
            user_input = initial_prompts.get(game_type, 'Let\'s play a fun English learning game together!')
        
        # Build messages for Gemini API (correct format)
        # Gemini API expects contents array with alternating user/model messages
        contents = []
        
        # Add conversation history if provided (with proper role mapping)
        if conversation_history and len(conversation_history) > 0:
            for msg in conversation_history[-10:]:  # Last 10 messages for context
                role = msg.get('role', 'user')
                # Map 'assistant' to 'model' for Gemini API
                gemini_role = 'model' if role == 'assistant' else 'user'
                contents.append({
                    'role': gemini_role,
                    'parts': [{'text': str(msg.get('content', ''))}]
                })
        
        # Combine system prompt and user input into the user message
        combined_text = f"{system_prompt}\n\n{user_input}"
        contents.append({
            'role': 'user',
            'parts': [{'text': combined_text}]
        })
        
        # Call Gemini API - using Gemini 2.5 Flash (stable and fast)
        model_name = 'gemini-2.5-flash'
        
        # Build payload
        payload = {
            'contents': contents,
            'generationConfig': {
                'temperature': 0.8,
                'topK': 40,
                'topP': 0.95,
                'maxOutputTokens': 1024,
            },
            'safetySettings': [
                {
                    'category': 'HARM_CATEGORY_HARASSMENT',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    'category': 'HARM_CATEGORY_HATE_SPEECH',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ]
        }
        
        # Try v1 API first (more stable), fallback to v1beta if needed
        api_versions_to_try = ['v1', 'v1beta']
        response = None
        last_error = None
        
        for api_version in api_versions_to_try:
            try:
                api_url = f"https://generativelanguage.googleapis.com/{api_version}/models/{model_name}:generateContent?key={gemini_api_key}"
                
                logger.info(f"Calling Gemini API: {api_version}/models/{model_name}")
                
                response = requests.post(api_url, json=payload, timeout=30)
                
                if response.status_code == 200:
                    logger.info(f"Success with {api_version}/models/{model_name}")
                    break
                elif response.status_code == 404:
                    # Model not found in this version, try next version
                    logger.warning(f"Model {model_name} not found in {api_version}, trying v1beta")
                    last_error = {
                        'status': response.status_code,
                        'error': response.json() if response.text else {}
                    }
                    response = None
                    continue
                else:
                    # Other error
                    last_error = {
                        'status': response.status_code,
                        'error': response.json() if response.text else {}
                    }
                    logger.error(f"Gemini API error: {response.status_code} - {last_error.get('error', {})}")
                    break
            except requests.exceptions.RequestException as e:
                last_error = {'status': 0, 'error': {'message': str(e)}}
                logger.error(f"Request exception with {api_version}: {str(e)}")
                response = None
                continue
        
        # Check if we got a successful response
        if not response or response.status_code != 200:
            if last_error:
                error_data = last_error.get('error', {})
                error_message = error_data.get('message', 'Unknown error') if isinstance(error_data, dict) else str(error_data)
                status_code = last_error.get('status', 500)
            elif response:
                error_data = response.json() if response.text else {}
                error_message = error_data.get('error', {}).get('message', 'Unknown error')
                status_code = response.status_code
            else:
                error_message = 'Failed to connect to Gemini API'
                status_code = 503
                
            logger.error(f"Gemini API error: {status_code} - {error_message}")
            
            # Provide more helpful error message
            if status_code == 400:
                return Response({
                    "message": f"Invalid API request: {error_message}. Please check configuration.",
                    "error": "API_ERROR",
                    "details": error_message
                }, status=status.HTTP_400_BAD_REQUEST)
            elif status_code == 401 or status_code == 403:
                return Response({
                    "message": "AI service authentication failed. Please check API key configuration.",
                    "error": "AUTH_ERROR",
                    "details": error_message
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            else:
                return Response({
                    "message": "Yor Gamer temporarily unavailable. Please try again later.",
                    "error": "API_ERROR",
                    "details": error_message
                }, status=status.HTTP_502_BAD_GATEWAY)
        
        data = response.json()
        content = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'Sorry, I could not generate a response.')
        
        # Helper function to clean markdown formatting
        def clean_markdown(text):
            if not text:
                return text
            # Remove common markdown formatting - order matters!
            text = text.replace('**', '')  # Remove bold
            text = text.replace('*', '')  # Remove any remaining asterisks
            text = text.replace('__', '')  # Remove underline
            text = text.replace('_', '')  # Remove any remaining underscores
            text = text.replace('`', '')  # Remove code formatting
            text = text.replace('#', '')  # Remove headers
            # Don't remove parentheses as they might be part of the text
            # Don't remove brackets to preserve readability
            return text.strip()
        
        # Try to parse JSON from response
        parsed_response = {
            'content': content.strip(),
            'gameInstruction': None,
            'questions': None,
            'feedback': None,
            'nextStep': None,
            'points': 0
        }
        
        # Try to extract JSON from response
        try:
            json_match = content.strip().replace('```json', '').replace('```', '').strip()
            if json_match.startswith('{'):
                parsed = json.loads(json_match)
                
                # Build natural language content from JSON fields
                # For tongue-twister game, only use content field (no gameInstruction or feedback)
                message_parts = []
                
                # Add main content if available (always use this)
                if parsed.get('content'):
                    message_parts.append(parsed.get('content'))
                
                # For other games, add feedback and nextStep if available
                game_type = request.data.get('gameType', 'interactive')
                if game_type != 'tongue-twister':
                    # Add feedback if available (not for tongue-twister)
                    if parsed.get('feedback'):
                        message_parts.append(parsed.get('feedback'))
                    
                    # Add nextStep if available
                    if parsed.get('nextStep'):
                        message_parts.append(parsed.get('nextStep'))
                
                # Combine into a single natural message
                combined_content = '\n\n'.join(filter(None, message_parts))
                
                parsed_response.update({
                    'content': clean_markdown(combined_content if combined_content else parsed.get('content', parsed_response['content'])),
                    'gameInstruction': clean_markdown(parsed.get('gameInstruction') if parsed.get('gameInstruction') else None),
                    'questions': parsed.get('questions'),
                    'feedback': clean_markdown(parsed.get('feedback') if parsed.get('feedback') else None),
                    'nextStep': clean_markdown(parsed.get('nextStep') if parsed.get('nextStep') else None),
                    'points': parsed.get('points', 0)
                })
        except (json.JSONDecodeError, AttributeError):
            # If JSON parsing fails, clean up raw content to remove JSON markers
            cleaned_content = content.strip()
            # Remove JSON code blocks if present
            if '```json' in cleaned_content:
                # Try to extract just the text content
                parts = cleaned_content.split('```')
                if len(parts) > 1:
                    # Get the part outside code blocks
                    text_parts = [p.strip() for p in parts if p.strip() and not p.strip().startswith('json')]
                    cleaned_content = '\n\n'.join(text_parts) if text_parts else cleaned_content
            
            # If cleaned_content still looks like raw JSON, try to extract text from it
            if cleaned_content.startswith('{') and ('content' in cleaned_content or 'feedback' in cleaned_content):
                # Try to extract plain text by removing JSON structure
                # Find all string values in JSON
                matches = re.findall(r'"([^"]+)":\s*"([^"]+)"', cleaned_content)
                text_parts = []
                for key, value in matches:
                    # Only include non-metadata fields (not points or other JSON keys)
                    if key in ['content', 'feedback', 'nextStep', 'gameInstruction']:
                        text_parts.append(value)
                if text_parts:
                    cleaned_content = ' '.join(text_parts)
            
            parsed_response['content'] = clean_markdown(cleaned_content)
        
        return Response(parsed_response, status=status.HTTP_200_OK)
    
    except requests.exceptions.Timeout:
        logger.error("Gemini API timeout")
        return Response({
            "message": "AI service took too long to respond. Please try again.",
            "error": "TIMEOUT"
        }, status=status.HTTP_504_GATEWAY_TIMEOUT)
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Gemini API request error: {str(e)}")
        return Response({
            "message": "Failed to connect to AI service. Please check your internet connection.",
            "error": "CONNECTION_ERROR"
        }, status=status.HTTP_502_BAD_GATEWAY)
    
    except Exception as e:
        logger.error(f"Gemini game error: {str(e)}")
        return Response({
            "message": "An unexpected error occurred. Please try again later.",
            "error": "INTERNAL_ERROR"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Waitlist Views =============
@api_view(['POST'])
@permission_classes([AllowAny])
def waitlist_signup(request):
    """Add user to waitlist"""
    try:
        serializer = WaitlistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Successfully added to waitlist!",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "message": "Failed to add to waitlist",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Waitlist signup error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Sync & Offline Support =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sync_changes(request):
    """
    Get changes since last sync (for offline-first synchronization)
    Returns all entities that have been modified since the given timestamp
    """
    try:
        since = request.query_params.get('since')
        
        if since:
            try:
                since_dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
                if since_dt.tzinfo is None:
                    since_dt = timezone.make_aware(since_dt)
            except (ValueError, AttributeError):
                since_dt = timezone.now() - timedelta(days=30)  # Default to 30 days
        else:
            since_dt = timezone.now() - timedelta(days=30)
        
        changes = []
        
        # Get all entities that were updated after the given timestamp
        # Profile changes
        profiles = UserProfile.objects.filter(
            user=request.user,
            updated_at__gte=since_dt
        )
        for profile in profiles:
            serializer = UserProfileSerializer(profile)
            changes.append({
                'entity': 'UserProfile',
                'entity_id': profile.id,
                'operation': 'update',
                'data': serializer.data,
                'updated_at': profile.updated_at.isoformat()
            })
        
        # Lesson progress changes
        progress_items = LessonProgress.objects.filter(
            user=request.user,
            updated_at__gte=since_dt
        )
        for item in progress_items:
            serializer = LessonProgressSerializer(item)
            changes.append({
                'entity': 'LessonProgress',
                'entity_id': item.id,
                'operation': 'update',
                'data': serializer.data,
                'updated_at': item.updated_at.isoformat()
            })
        
        # Practice sessions changes
        sessions = PracticeSession.objects.filter(
            user=request.user,
            session_date__gte=since_dt
        )
        for session in sessions:
            serializer = PracticeSessionSerializer(session)
            changes.append({
                'entity': 'PracticeSession',
                'entity_id': session.id,
                'operation': 'update',
                'data': serializer.data,
                'updated_at': session.session_date.isoformat()
            })
        
        # Vocabulary changes
        vocab_items = VocabularyWord.objects.filter(
            user=request.user,
            last_practiced__gte=since_dt
        )
        for vocab in vocab_items:
            serializer = VocabularyWordSerializer(vocab)
            changes.append({
                'entity': 'VocabularyWord',
                'entity_id': vocab.id,
                'operation': 'update',
                'data': serializer.data,
                'updated_at': vocab.last_practiced.isoformat()
            })
        
        # Kids progress changes
        kids_progress = KidsProgress.objects.filter(
            user=request.user,
            updated_at__gte=since_dt
        )
        for progress in kids_progress:
            serializer = KidsProgressSerializer(progress)
            changes.append({
                'entity': 'KidsProgress',
                'entity_id': progress.id,
                'operation': 'update',
                'data': serializer.data,
                'updated_at': progress.updated_at.isoformat()
            })
        
        # Kids achievements changes
        kids_achievements = KidsAchievement.objects.filter(
            user=request.user,
            updated_at__gte=since_dt
        )
        for ach in kids_achievements:
            serializer = KidsAchievementSerializer(ach)
            changes.append({
                'entity': 'KidsAchievement',
                'entity_id': ach.id,
                'operation': 'update',
                'data': serializer.data,
                'updated_at': ach.updated_at.isoformat()
            })
        
        return Response({
            'changes': changes,
            'total': len(changes),
            'since': since or since_dt.isoformat(),
            'next_cursor': timezone.now().isoformat()
        })
    
    except Exception as e:
        logger.error(f"Sync changes error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def idempotent_upsert(request):
    """
    Idempotent upsert endpoint for offline sync
    Uses Idempotency-Key header to prevent duplicate processing
    """
    try:
        # Check for idempotency key
        idempotency_key = request.headers.get('Idempotency-Key')
        if not idempotency_key:
            return Response({
                "error": "Idempotency-Key header is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check cache for duplicate request
        cache_key = f"sync_{request.user.id}_{idempotency_key}"
        cached_response = cache.get(cache_key)
        
        if cached_response:
            logger.info(f"Returning cached response for idempotency key: {idempotency_key}")
            return Response(cached_response)
        
        # Process the request
        entity_type = request.data.get('entity_type')
        entity_id = request.data.get('entity_id')
        operation = request.data.get('operation')  # 'create' or 'update'
        data = request.data.get('data', {})
        
        if not entity_type or operation not in ['create', 'update']:
            return Response({
                "error": "entity_type and operation are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Route to appropriate handler
        result = None
        
        if entity_type == 'LessonProgress' and data.get('lesson'):
            # Upsert lesson progress
            try:
                from .models import Lesson
                lesson = Lesson.objects.get(id=data['lesson'])
                progress, created = LessonProgress.objects.get_or_create(
                    user=request.user,
                    lesson=lesson
                )
                
                # Update fields
                for key, value in data.items():
                    if key != 'lesson' and hasattr(progress, key):
                        setattr(progress, key, value)
                progress.save()
                
                result = {
                    'entity': 'LessonProgress',
                    'entity_id': progress.id,
                    'operation': 'created' if created else 'updated',
                    'data': LessonProgressSerializer(progress).data
                }
            except Exception as e:
                return Response({
                    "error": str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        elif entity_type == 'PracticeSession':
            # Upsert practice session
            serializer = PracticeSessionSerializer(data=data)
            if serializer.is_valid():
                instance = serializer.save(user=request.user)
                result = {
                    'entity': 'PracticeSession',
                    'entity_id': instance.id,
                    'operation': 'created',
                    'data': PracticeSessionSerializer(instance).data
                }
            else:
                return Response({
                    "error": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
        elif entity_type == 'VocabularyWord':
            # Upsert vocabulary word
            word = data.get('word', '').lower()
            vocab, created = VocabularyWord.objects.get_or_create(
                user=request.user,
                word=word,
                defaults=data
            )
            if not created:
                # Update existing
                for key, value in data.items():
                    if hasattr(vocab, key) and key != 'word':
                        setattr(vocab, key, value)
                vocab.save()
            
            result = {
                'entity': 'VocabularyWord',
                'entity_id': vocab.id,
                'operation': 'created' if created else 'updated',
                'data': VocabularyWordSerializer(vocab).data
            }
        
        elif entity_type == 'KidsProgress':
            # Upsert kids progress
            obj, created = KidsProgress.objects.get_or_create(user=request.user)
            serializer = KidsProgressSerializer(obj, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                result = {
                    'entity': 'KidsProgress',
                    'entity_id': obj.id,
                    'operation': 'updated',
                    'data': serializer.data
                }
            else:
                return Response({
                    "error": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
        elif entity_type == 'KidsAchievement':
            # Upsert kids achievement
            name = data.get('name')
            if name:
                ach, created = KidsAchievement.objects.get_or_create(
                    user=request.user,
                    name=name
                )
                serializer = KidsAchievementSerializer(ach, data=data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    result = {
                        'entity': 'KidsAchievement',
                        'entity_id': ach.id,
                        'operation': 'created' if created else 'updated',
                        'data': serializer.data
                    }
        
        if result:
            # Cache the response for 24 hours
            cache.set(cache_key, result, 86400)  # 24 hours
            return Response(result, status=status.HTTP_201_CREATED if result['operation'] == 'created' else status.HTTP_200_OK)
        else:
            return Response({
                "error": f"Unknown entity type: {entity_type}"
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Idempotent upsert error: {str(e)}")
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Health Check =============
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """API health check"""
    return Response({
        "status": "healthy",
        "message": "Elora API is running",
        "version": "1.0.0"
    })


# ============= Kids Analytics (Listening) =============
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_analytics(request):
    """Accept listening analytics sessions from client.
    For now, this endpoint stores nothing persistently; it validates payload shape and returns 201.
    """
    try:
        data = request.data or {}
        # Basic validation of expected keys
        if 'user_id' not in data or 'session_data' not in data:
            return Response({
                "message": "user_id and session_data are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Optionally, attach request.user for server-side correlation
        _ = request.user.id  # touch to ensure auth path exercised

        # In future, persist to a model or analytics store.
        return Response({ "ok": True }, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Kids analytics error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

