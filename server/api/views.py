from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Avg, Sum, Count, Q, F
from collections import defaultdict
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
    WaitlistSerializer, DailyProgressSerializer, WeeklyStatsSerializer, UserStatsSerializer,
    AdminNotificationSerializer
)
from .models import (
    UserProfile, Lesson, LessonProgress, PracticeSession,
    VocabularyWord, Achievement, UserAchievement,
    KidsLesson, KidsProgress, KidsAchievement, KidsCertificate, WaitlistEntry,
    EmailVerificationToken, AdminNotification
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
        
        # Debug logging
        logger.info(f"DEBUG: user_input = '{user_input}'")
        logger.info(f"DEBUG: conversation_history length = {len(conversation_history) if conversation_history else 0}")
        if conversation_history:
            for idx, msg in enumerate(conversation_history[-3:]):  # Last 3 messages
                logger.info(f"DEBUG: History[{idx}]: role={msg.get('role')}, content={str(msg.get('content', ''))[:50]}...")
        
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
        
        # Debug logging for payload construction
        logger.info(f"DEBUG: Adding user_input to payload: '{user_input[:100]}...'")
        logger.info(f"DEBUG: Total contents count: {len(contents)}")
        for idx, msg in enumerate(contents):
            logger.info(f"DEBUG: Contents[{idx}]: role={msg.get('role')}, text={str(msg.get('parts', [{}])[0].get('text', ''))[:100]}...")
        
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


# ============= Admin Views =============
def is_admin_user(user):
    """Check if user is admin/staff"""
    return user.is_authenticated and (user.is_staff or user.is_superuser)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """Get admin dashboard statistics"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Optional timeframe for growth (months)
        try:
            months = int(request.query_params.get('months', 12))
            months = max(6, min(24, months))
        except (TypeError, ValueError):
            months = 12

        # User statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        new_users_today = User.objects.filter(date_joined__date=timezone.now().date()).count()
        new_users_this_month = User.objects.filter(
            date_joined__gte=timezone.now().replace(day=1)
        ).count()
        
        # User growth by month (last N months)
        user_growth = []
        for i in range(months - 1, -1, -1):
            month_start = (timezone.now() - timedelta(days=30*i)).replace(day=1)
            if i == 0:
                month_end = timezone.now()
            else:
                next_month = month_start + timedelta(days=32)
                month_end = next_month.replace(day=1) - timedelta(days=1)
            
            count = User.objects.filter(
                date_joined__gte=month_start,
                date_joined__lte=month_end
            ).count()
            
            user_growth.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%B %Y'),
                'count': count
            })
        
        # Lesson statistics
        total_lessons = Lesson.objects.count()
        active_lessons = Lesson.objects.filter(is_active=True).count()
        total_progress = LessonProgress.objects.count()
        completed_lessons = LessonProgress.objects.filter(completed=True).count()
        # recent completion windows
        today = timezone.now().date()
        last7 = today - timedelta(days=7)
        last30 = today - timedelta(days=30)
        completed_last_7 = LessonProgress.objects.filter(completed=True, updated_at__date__gte=last7).count()
        completed_last_30 = LessonProgress.objects.filter(completed=True, updated_at__date__gte=last30).count()
        
        # Practice statistics
        total_sessions = PracticeSession.objects.count()
        total_practice_time = PracticeSession.objects.aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0

        # Engagement (common dashboard KPIs)
        # Engagement windows reuse last7/last30 above
        dau_7 = PracticeSession.objects.filter(session_date__date__gte=last7).values('user_id').distinct().count()
        dau_30 = PracticeSession.objects.filter(session_date__date__gte=last30).values('user_id').distinct().count()
        avg_session_minutes = PracticeSession.objects.aggregate(avg=Avg('duration_minutes'))['avg'] or 0
        avg_score = PracticeSession.objects.aggregate(avg=Avg('score'))['avg'] or 0

        # Verification & surveys
        verified_users = User.objects.filter(is_active=True).count()
        verification_rate = round((verified_users / total_users * 100) if total_users > 0 else 0, 2)
        survey_completed = UserProfile.objects.filter(survey_completed_at__isnull=False).count()
        survey_completion_rate = round((survey_completed / UserProfile.objects.count() * 100) if UserProfile.objects.count() > 0 else 0, 2)

        # Detailed level distribution
        # Categories: kids_4_10, kids_11_17, adults_beginner, adults_intermediate, adults_advanced, ielts, pte
        detailed = {
            'kids_4_10': 0,
            'kids_11_17': 0,
            'adults_beginner': 0,
            'adults_intermediate': 0,
            'adults_advanced': 0,
            'ielts': 0,
            'pte': 0,
            'unspecified': 0,
        }
        for p in UserProfile.objects.all().only('age_range', 'level', 'learning_purpose'):
            age = (p.age_range or '').lower()
            purposes = []
            try:
                purposes = [str(x).lower() for x in (p.learning_purpose or [])]
            except Exception:
                purposes = []
            if 'ielts' in purposes:
                detailed['ielts'] += 1
            if 'pte' in purposes:
                detailed['pte'] += 1
            # Age-based kids buckets
            if any(x in age for x in ['4-10', '4 – 10', '4 to 10', '4–10']):
                detailed['kids_4_10'] += 1
                continue
            if any(x in age for x in ['11-17', '11 – 17', '11 to 17', '11–17']):
                detailed['kids_11_17'] += 1
                continue
            # Adults by profile level
            lvl = (p.level or '').lower()
            if lvl == 'beginner':
                detailed['adults_beginner'] += 1
            elif lvl == 'intermediate':
                detailed['adults_intermediate'] += 1
            elif lvl == 'advanced':
                detailed['adults_advanced'] += 1
            else:
                detailed['unspecified'] += 1
        
        # Recent activity (last 50 activities)
        recent_activities = []
        
        # Recent user registrations
        recent_users = User.objects.order_by('-date_joined')[:10]
        for user in recent_users:
            recent_activities.append({
                'type': 'user_registered',
                'title': f'New user registered: {user.username}',
                'user': user.username,
                'timestamp': user.date_joined.isoformat(),
                'icon': 'user-plus'
            })
        
        # Recent lesson completions
        recent_completions = LessonProgress.objects.filter(
            completed=True
        ).order_by('-updated_at')[:10]
        for progress in recent_completions:
            recent_activities.append({
                'type': 'lesson_completed',
                'title': f'{progress.user.username} completed {progress.lesson.title}',
                'user': progress.user.username,
                'timestamp': progress.updated_at.isoformat(),
                'icon': 'check-circle'
            })

        # Recent practice sessions
        recent_sessions = PracticeSession.objects.order_by('-session_date')[:10]
        for s in recent_sessions:
            recent_activities.append({
                'type': 'practice_session',
                'title': f'{s.user.username} practiced {s.session_type} ({s.duration_minutes}m)',
                'user': s.user.username,
                'timestamp': s.session_date.isoformat(),
                'icon': 'clock'
            })
        
        # Sort by timestamp
        recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activities = recent_activities[:50]
        
        # Level distribution
        level_distribution = UserProfile.objects.values('level').annotate(
            count=Count('id')
        ).order_by('level')
        
        stats = {
            'users': {
                'total': total_users,
                'active': active_users,
                'new_today': new_users_today,
                'new_this_month': new_users_this_month,
                'growth_by_month': user_growth,
                'level_distribution': list(level_distribution)
            },
            'lessons': {
                'total': total_lessons,
                'active': active_lessons,
                'total_progress': total_progress,
                'completed': completed_lessons,
                'completed_last_7': completed_last_7,
                'completed_last_30': completed_last_30,
                'completion_rate': round((completed_lessons / total_progress * 100) if total_progress > 0 else 0, 2)
            },
            'practice': {
                'total_sessions': total_sessions,
                'total_time_minutes': total_practice_time,
                'total_time_hours': round(total_practice_time / 60, 2)
            },
            'engagement': {
                'dau_7': dau_7,
                'dau_30': dau_30,
                'avg_session_minutes': round(avg_session_minutes, 2),
                'avg_score': round(avg_score, 2)
            },
            'verification': {
                'verified_users': verified_users,
                'verification_rate': verification_rate,
                'survey_completed': survey_completed,
                'survey_completion_rate': survey_completion_rate
            },
            'levels': detailed,
            'recent_activities': recent_activities[:20]
        }
        
        return Response(stats)
    
    except Exception as e:
        logger.error(f"Admin dashboard stats error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """Get list of users for admin"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        level_filter = request.query_params.get('level', '')
        active_filter = request.query_params.get('active', '')
        
        queryset = User.objects.select_related('profile').all()
        
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        if active_filter:
            if active_filter.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif active_filter.lower() == 'false':
                queryset = queryset.filter(is_active=False)
        
        if level_filter:
            # Handle new category filters
            if level_filter == 'kids-4-10':
                # Filter kids aged 4-10 (check age_range in profile)
                queryset = queryset.filter(
                    profile__age_range__in=['4-10', '4-7', '8-10', 'kids-4-10', 'young']
                )
            elif level_filter == 'kids-10-17':
                # Filter kids aged 10-17 (teen/kids)
                queryset = queryset.filter(
                    profile__age_range__in=['10-17', '11-17', '12-17', 'kids-10-17', 'teen']
                )
            elif level_filter == 'adults-beginner':
                queryset = queryset.filter(profile__level='beginner')
            elif level_filter == 'adults-intermediate':
                queryset = queryset.filter(profile__level='intermediate')
            elif level_filter == 'adults-advanced':
                queryset = queryset.filter(profile__level='advanced')
            elif level_filter == 'ielts-pte':
                # Filter for IELTS/PTE - check learning_purpose or interests (JSONField)
                # For JSONField, we need to check if the value exists in the array
                queryset = queryset.filter(
                    Q(profile__learning_purpose__contains=['ielts']) |
                    Q(profile__learning_purpose__contains=['pte']) |
                    Q(profile__learning_purpose__contains=['exam']) |
                    Q(profile__interests__contains=['ielts']) |
                    Q(profile__interests__contains=['pte'])
                )
            else:
                # Fallback to old level filter for backward compatibility
                queryset = queryset.filter(profile__level=level_filter)
        
        total = queryset.count()
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        users = queryset[start:end]
        
        users_data = []
        for user in users:
            profile = getattr(user, 'profile', None)
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'profile': {
                    'level': profile.level if profile else 'beginner',
                    'points': profile.points if profile else 0,
                    'current_streak': profile.current_streak if profile else 0,
                    'longest_streak': profile.longest_streak if profile else 0,
                    'age_range': profile.age_range if profile else None,
                    'learning_purpose': profile.learning_purpose if profile else [],
                } if profile else None,
                'lessons_completed': LessonProgress.objects.filter(user=user, completed=True).count(),
                'total_sessions': PracticeSession.objects.filter(user=user).count(),
                'vocabulary_count': VocabularyWord.objects.filter(user=user).count()
            })
        
        return Response({
            'users': users_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': (total + page_size - 1) // page_size
            }
        })
    
    except Exception as e:
        logger.error(f"Admin users list error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    """Get, update, or delete a specific user"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        
        if request.method == 'GET':
            profile = getattr(user, 'profile', None)
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'profile': UserProfileSerializer(profile).data if profile else None,
                'stats': {
                    'lessons_completed': LessonProgress.objects.filter(user=user, completed=True).count(),
                    'total_sessions': PracticeSession.objects.filter(user=user).count(),
                    'total_practice_time': PracticeSession.objects.filter(user=user).aggregate(
                        total=Sum('duration_minutes')
                    )['total'] or 0,
                    'vocabulary_count': VocabularyWord.objects.filter(user=user).count(),
                    'achievements_unlocked': UserAchievement.objects.filter(user=user, unlocked=True).count(),
                }
            }
            return Response(user_data)
        
        elif request.method == 'PUT':
            # Update user
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.email = request.data.get('email', user.email)
            user.is_active = request.data.get('is_active', user.is_active)
            user.is_staff = request.data.get('is_staff', user.is_staff)
            user.is_superuser = request.data.get('is_superuser', user.is_superuser)
            user.save()
            
            # Update profile if provided
            if 'profile' in request.data:
                profile = getattr(user, 'profile', None)
                if not profile:
                    profile, _ = UserProfile.objects.get_or_create(user=user)
                profile_data = request.data['profile']
                if isinstance(profile_data, dict):
                    profile.level = profile_data.get('level', profile.level)
                    profile.points = profile_data.get('points', profile.points)
                    # allow admin to set age range and purposes
                    if 'age_range' in profile_data:
                        profile.age_range = profile_data.get('age_range') or profile.age_range
                    if 'english_level' in profile_data:
                        profile.english_level = profile_data.get('english_level') or profile.english_level
                    if 'learning_purpose' in profile_data:
                        try:
                            profile.learning_purpose = profile_data.get('learning_purpose') or profile.learning_purpose
                        except Exception:
                            pass
                    profile.save()
            
            return Response({
                "message": "User updated successfully",
                "user": UserSerializer(user).data
            })
        
        elif request.method == 'DELETE':
            # Don't actually delete, just deactivate
            user.is_active = False
            user.save()
            return Response({
                "message": "User deactivated successfully"
            })
    
    except User.DoesNotExist:
        return Response({
            "message": "User not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Admin user detail error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_superuser(request):
    """Create a new superuser"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        if not username or not email or not password:
            return Response({
                "message": "Username, email, and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({
                "message": "Username already exists"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({
                "message": "Email already exists"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
        
        # Create profile
        UserProfile.objects.create(user=user)
        
        return Response({
            "message": "Superuser created successfully",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Create superuser error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_activities_list(request):
    """Get filtered list of admin activities (user registrations, lesson completions, etc.)"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get filter parameters
        status_filter = request.query_params.get('status', 'all')  # all, in_process, completed, need_info, unassigned
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        search = request.query_params.get('search', '').strip()
        try:
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 50))
            if page < 1:
                page = 1
            if page_size < 1 or page_size > 100:
                page_size = 50
        except (ValueError, TypeError):
            page = 1
            page_size = 50
        
        activities = []
        
        # Helper function to get date range
        def get_date_range(year_str, month_str=None):
            """Get start and end datetime for year/month filter"""
            if not year_str:
                return None, None
            try:
                year_int = int(year_str)
                if month_str:
                    month_names = ['January', 'February', 'March', 'April', 'May', 'June',
                                 'July', 'August', 'September', 'October', 'November', 'December']
                    try:
                        month_num = month_names.index(month_str) + 1
                        month_start = timezone.make_aware(datetime(year_int, month_num, 1))
                        if month_num == 12:
                            month_end = timezone.make_aware(datetime(year_int + 1, 1, 1))
                        else:
                            month_end = timezone.make_aware(datetime(year_int, month_num + 1, 1))
                        return month_start, month_end
                    except ValueError:
                        return None, None
                else:
                    year_start = timezone.make_aware(datetime(year_int, 1, 1))
                    year_end = timezone.make_aware(datetime(year_int + 1, 1, 1))
                    return year_start, year_end
            except (ValueError, TypeError):
                return None, None
        
        # Get user registrations
        user_query = User.objects.all()
        
        # Apply search filter
        if search:
            user_query = user_query.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Apply date filter for users
        date_start, date_end = get_date_range(year, month)
        if date_start and date_end:
            user_query = user_query.filter(date_joined__gte=date_start, date_joined__lt=date_end)
        
        # Determine status mapping
        status_map = {
            'in_process': 'in_process',
            'completed': 'completed',
            'need_info': 'need_info',
            'unassigned': 'unassigned',
            'all': 'all'
        }
        
        # Map status to user/activity states
        if status_filter == 'in_process':
            # Active users who haven't completed profile
            user_query = user_query.filter(is_active=True)
            user_query = user_query.filter(Q(profile__survey_completed_at__isnull=True) | Q(profile__isnull=True))
        elif status_filter == 'completed':
            # Users with completed profiles or verified
            user_query = user_query.filter(is_active=True, profile__survey_completed_at__isnull=False)
        elif status_filter == 'need_info':
            # Inactive users who need verification
            user_query = user_query.filter(is_active=False)
        elif status_filter == 'unassigned':
            # Users without profiles
            user_query = user_query.filter(profile__isnull=True)
        
        # Get recent users based on filters
        # Note: We'll apply pagination after combining with lesson progress
        recent_users = list(user_query.order_by('-date_joined')[:1000])  # Limit to prevent memory issues
        
        for user in recent_users:
            try:
                profile = getattr(user, 'profile', None)
            except Exception:
                profile = None
            
            # Determine status
            if user.is_active and profile and hasattr(profile, 'survey_completed_at') and profile.survey_completed_at:
                user_status = 'completed'
            elif user.is_active:
                user_status = 'in_process'
            elif not user.is_active:
                user_status = 'need_info'
            else:
                user_status = 'unassigned'
            
            activities.append({
                'id': f'user_{user.id}',
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'type': 'user_registration',
                'email': user.email,
                'date_of_birth': None,  # Not stored in current model
                'mrn': f'USR{user.id:04d}',  # User reference number
                'service_date': user.date_joined.strftime('%m/%d/%Y') if user.date_joined else None,
                'assigned_date': user.date_joined.strftime('%m/%d/%Y') if user.date_joined else None,
                'status': user_status,
                'document_id': f'usr_{user.id}'
            })
        
        # Also include lesson progress entries
        if status_filter in ['all', 'completed', 'in_process']:
            progress_query = LessonProgress.objects.select_related('user', 'lesson')
            
            # Apply search filter
            if search:
                progress_query = progress_query.filter(
                    Q(user__username__icontains=search) |
                    Q(user__email__icontains=search) |
                    Q(lesson__title__icontains=search)
                )
            
            # Apply date filter (reuse the same date range helper)
            if date_start and date_end:
                progress_query = progress_query.filter(updated_at__gte=date_start, updated_at__lt=date_end)
            
            # Apply status filter
            if status_filter == 'completed':
                progress_query = progress_query.filter(completed=True)
            elif status_filter == 'in_process':
                progress_query = progress_query.filter(completed=False)
            
            # Get recent progress (limit to prevent memory issues)
            recent_progress = list(progress_query.order_by('-updated_at')[:1000])
            
            for progress in recent_progress:
                try:
                    full_name = f"{progress.user.first_name or ''} {progress.user.last_name or ''}".strip()
                    user_email = progress.user.email
                    user_username = progress.user.username
                except Exception:
                    full_name = ''
                    user_email = ''
                    user_username = 'Unknown'
                
                try:
                    lesson_id = progress.lesson.id if progress.lesson else 0
                    lesson_created = progress.lesson.created_at if progress.lesson and progress.lesson.created_at else None
                except Exception:
                    lesson_id = 0
                    lesson_created = None
                
                activities.append({
                    'id': f'progress_{progress.id}',
                    'name': full_name or user_username,
                    'type': 'lesson_progress',
                    'email': user_email,
                    'date_of_birth': None,
                    'mrn': f'LSN{lesson_id:04d}',
                    'service_date': lesson_created.strftime('%m/%d/%Y') if lesson_created else None,
                    'assigned_date': progress.updated_at.strftime('%m/%d/%Y') if progress.updated_at else None,
                    'status': 'completed' if progress.completed else 'in_process',
                    'document_id': f'prg_{progress.id}'
                })
        
        # Sort by date (most recent first)
        # Handle None dates gracefully
        def sort_key(x):
            date_str = x.get('assigned_date', '')
            if not date_str or date_str == 'None' or date_str == 'N/A':
                return ''
            try:
                # Convert MM/DD/YYYY to sortable format
                parts = date_str.split('/')
                if len(parts) == 3:
                    return f"{parts[2]}-{parts[0].zfill(2)}-{parts[1].zfill(2)}"
                return date_str
            except:
                return date_str
        
        activities.sort(key=sort_key, reverse=True)
        
        # Pagination
        total = len(activities)
        start = (page - 1) * page_size
        end = start + page_size
        paginated_activities = activities[start:end]
        
        return Response({
            'activities': paginated_activities,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': (total + page_size - 1) // page_size
            }
        })
    
    except ValueError as e:
        logger.error(f"Admin activities list validation error: {str(e)}")
        return Response({
            "message": f"Invalid filter parameters: {str(e)}",
            "error": str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Admin activities list error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred while loading activities",
            "error": str(e),
            "activities": [],
            "pagination": {
                "page": 1,
                "page_size": 50,
                "total": 0,
                "pages": 0
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_notifications_list(request):
    """Get list of notifications for admin or create new notification"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        if request.method == 'GET':
            # Get query parameters
            unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
            limit = int(request.query_params.get('limit', 50))
            notification_type = request.query_params.get('type', '')
            
            # Filter notifications for this admin (user-specific or global)
            queryset = AdminNotification.objects.filter(
                Q(user=request.user) | Q(user__isnull=True)
            ).filter(expires_at__gt=timezone.now())  # Only non-expired
            
            if unread_only:
                queryset = queryset.filter(is_read=False)
            
            if notification_type:
                queryset = queryset.filter(notification_type=notification_type)
            
            notifications = queryset[:limit]
            serializer = AdminNotificationSerializer(notifications, many=True)
            
            # Get unread count
            unread_count = AdminNotification.objects.filter(
                Q(user=request.user) | Q(user__isnull=True),
                is_read=False,
                expires_at__gt=timezone.now()
            ).count()
            
            return Response({
                'notifications': serializer.data,
                'unread_count': unread_count,
                'total': queryset.count()
            })
        
        elif request.method == 'POST':
            # Create new notification (for system/automated use)
            serializer = AdminNotificationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Admin notifications error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_notification_mark_read(request, notification_id):
    """Mark a specific notification as read"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        notification = AdminNotification.objects.filter(
            id=notification_id
        ).filter(
            Q(user=request.user) | Q(user__isnull=True)
        ).first()
        
        if not notification:
            return Response({
                "message": "Notification not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.read_by = request.user
            notification.save()
        
        return Response({
            "message": "Notification marked as read",
            "notification": AdminNotificationSerializer(notification).data
        })
    
    except Exception as e:
        logger.error(f"Mark notification read error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_test_notification(request):
    """Create a test notification for testing dynamic updates"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        notification_type = request.data.get('type', 'info')
        priority = request.data.get('priority', 'normal')
        title = request.data.get('title', 'Test Notification')
        message = request.data.get('message', 'This is a test notification to verify dynamic updates are working.')
        link = request.data.get('link', '') or None
        
        notification = AdminNotification.objects.create(
            user=None,  # Global notification for all admins
            notification_type=notification_type,
            priority=priority,
            title=title,
            message=message,
            link=link,
            metadata={'test': True, 'created_by': request.user.username}
        )
        
        serializer = AdminNotificationSerializer(notification)
        
        return Response({
            "message": "Test notification created successfully",
            "notification": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Create test notification error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_notifications_mark_all_read(request):
    """Mark all notifications as read for the current admin"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        updated = AdminNotification.objects.filter(
            Q(user=request.user) | Q(user__isnull=True),
            is_read=False,
            expires_at__gt=timezone.now()
        ).update(
            is_read=True,
            read_at=timezone.now(),
            read_by=request.user
        )
        
        return Response({
            "message": f"{updated} notifications marked as read",
            "count": updated
        })
    
    except Exception as e:
        logger.error(f"Mark all notifications read error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_notification_delete(request, notification_id):
    """Delete a specific notification"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        notification = AdminNotification.objects.filter(
            id=notification_id
        ).filter(
            Q(user=request.user) | Q(user__isnull=True)
        ).first()
        
        if not notification:
            return Response({
                "message": "Notification not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        notification.delete()
        
        return Response({
            "message": "Notification deleted successfully"
        })
    
    except Exception as e:
        logger.error(f"Delete notification error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_notifications_bulk_delete(request):
    """Delete multiple notifications"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        notification_ids = request.data.get('ids', [])
        if not notification_ids:
            return Response({
                "message": "No notification IDs provided"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        deleted = AdminNotification.objects.filter(
            id__in=notification_ids
        ).filter(
            Q(user=request.user) | Q(user__isnull=True)
        ).delete()
        
        return Response({
            "message": f"{deleted[0]} notifications deleted successfully",
            "count": deleted[0]
        })
    
    except Exception as e:
        logger.error(f"Bulk delete notifications error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_notifications_unread_count(request):
    """Get only unread count (lightweight endpoint for polling)"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        unread_count = AdminNotification.objects.filter(
            Q(user=request.user) | Q(user__isnull=True),
            is_read=False,
            expires_at__gt=timezone.now()
        ).count()
        
        return Response({
            "unread_count": unread_count
        })
    
    except Exception as e:
        logger.error(f"Get unread count error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    """Get analytics data for admin"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Daily user registrations
        daily_registrations = defaultdict(int)
        registrations = User.objects.filter(
            date_joined__date__gte=start_date,
            date_joined__date__lte=end_date
        )
        for user in registrations:
            date_str = user.date_joined.date().isoformat()
            daily_registrations[date_str] += 1
        
        # Daily lesson completions
        daily_completions = defaultdict(int)
        completions = LessonProgress.objects.filter(
            completed=True,
            updated_at__date__gte=start_date,
            updated_at__date__lte=end_date
        )
        for progress in completions:
            date_str = progress.updated_at.date().isoformat()
            daily_completions[date_str] += 1
        
        # Daily practice sessions
        daily_sessions = defaultdict(int)
        sessions = PracticeSession.objects.filter(
            session_date__date__gte=start_date,
            session_date__date__lte=end_date
        )
        for session in sessions:
            date_str = session.session_date.date().isoformat()
            daily_sessions[date_str] += 1
        
        # Build time series data
        time_series = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.isoformat()
            time_series.append({
                'date': date_str,
                'registrations': daily_registrations.get(date_str, 0),
                'completions': daily_completions.get(date_str, 0),
                'sessions': daily_sessions.get(date_str, 0)
            })
            current_date += timedelta(days=1)
        
        # Lesson type distribution
        lesson_type_dist = Lesson.objects.values('lesson_type').annotate(
            count=Count('id')
        ).order_by('lesson_type')
        
        # Content type distribution
        content_type_dist = Lesson.objects.values('content_type').annotate(
            count=Count('id')
        ).order_by('content_type')
        
        # Top lessons by completions
        top_lessons = Lesson.objects.annotate(
            completion_count=Count('lessonprogress', filter=Q(lessonprogress__completed=True))
        ).order_by('-completion_count')[:10]
        
        top_lessons_data = [{
            'id': lesson.id,
            'title': lesson.title,
            'lesson_type': lesson.lesson_type,
            'completions': lesson.completion_count
        } for lesson in top_lessons]
        
        return Response({
            'time_series': time_series,
            'lesson_type_distribution': list(lesson_type_dist),
            'content_type_distribution': list(content_type_dist),
            'top_lessons': top_lessons_data
        })
    
    except Exception as e:
        logger.error(f"Admin analytics error: {str(e)}")
        return Response({
            "message": "An error occurred",
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

