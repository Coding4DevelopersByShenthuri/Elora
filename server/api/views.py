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

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, UserProfileSerializer,
    LessonSerializer, LessonProgressSerializer, PracticeSessionSerializer,
    VocabularyWordSerializer, AchievementSerializer, UserAchievementSerializer,
    KidsLessonSerializer, KidsProgressSerializer, KidsAchievementSerializer,
    WaitlistSerializer, DailyProgressSerializer, WeeklyStatsSerializer, UserStatsSerializer
)
from .models import (
    UserProfile, Lesson, LessonProgress, PracticeSession,
    VocabularyWord, Achievement, UserAchievement,
    KidsLesson, KidsProgress, KidsAchievement, WaitlistEntry,
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


@api_view(['GET'])
@permission_classes([AllowAny])
def test_email_send(request):
    """Test email sending"""
    try:
        test_email = request.query_params.get('email', 'shenthurim123@gmail.com')
        verification_url = "http://localhost:5173/verify-email/test-token-123/"
        
        subject = "Test Email - Activate to learn with Elora"
        message = f"""Welcome to Elora! 👋

Please click the following link to activate your account:

{verification_url}

We are excited to have you on board and help you in your learning journey!

Please feel free to contact us at +94750363903 with any additional questions.

Best regards,
The Elora Team"""
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[test_email],
            fail_silently=False,
        )
        
        return Response({
            "success": True,
            "message": f"Test email sent successfully to {test_email}",
            "result": result
        })
        
    except Exception as e:
        logger.error(f"Test email error: {str(e)}")
        return Response({
            "success": False,
            "message": f"Failed to send test email: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
