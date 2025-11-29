from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from django.db import transaction
from django.db.models import Avg, Sum, Count, Q, F, Max
from django.utils.text import slugify
from collections import defaultdict
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from datetime import datetime, timedelta
from math import ceil
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
import random

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, UserProfileSerializer,
    LessonSerializer, LessonProgressSerializer, PracticeSessionSerializer,
    VocabularyWordSerializer, AchievementSerializer, UserAchievementSerializer,
    KidsLessonSerializer, KidsProgressSerializer, KidsAchievementSerializer, KidsCertificateSerializer, KidsTrophySerializer,
    WaitlistSerializer, DailyProgressSerializer, WeeklyStatsSerializer, UserStatsSerializer,
    UserNotificationSerializer, AdminNotificationSerializer, SurveyStepResponseSerializer, PlatformSettingsSerializer,
    CookieConsentDetailSerializer, CookieConsentPreferencesSerializer,
    StoryEnrollmentSerializer, StoryWordSerializer, StoryPhraseSerializer, KidsFavoriteSerializer,
    KidsVocabularyPracticeSerializer, KidsPronunciationPracticeSerializer, KidsGameSessionSerializer,
    ParentalControlSettingsSerializer, TeenProgressSerializer, TeenStoryProgressSerializer,
    TeenVocabularyPracticeSerializer, TeenPronunciationPracticeSerializer, TeenFavoriteSerializer,
    TeenAchievementSerializer, TeenGameSessionSerializer, TeenCertificateSerializer,
    PageEligibilitySerializer, CategoryProgressSerializer, AggregatedProgressSerializer,
    VideoLessonSerializer, PracticeCommentSerializer,
    CommonLessonSerializer, CommonLessonEnrollmentSerializer, WeeklyChallengeSerializer,
    UserWeeklyChallengeSerializer, LearningGoalSerializer, PersonalizedRecommendationSerializer,
    SpacedRepetitionItemSerializer, MicrolearningModuleSerializer, MicrolearningProgressSerializer,
    ProgressAnalyticsSerializer,
    # New serializers for adults features
    DictionaryEntrySerializer, UserDictionarySerializer,
    FlashcardDeckSerializer, FlashcardSerializer, FlashcardReviewSerializer,
    DailyGoalSerializer, UserToolbarPreferenceSerializer,
    MultiModePracticeSessionSerializer,
    EmailTemplateSerializer, EmailPracticeSessionSerializer,
    PronunciationPracticeSerializer,
    CulturalIntelligenceModuleSerializer, CulturalIntelligenceProgressSerializer,
    SearchHistorySerializer
)
from .models import (
    UserProfile, Lesson, LessonProgress, PracticeSession,
    VocabularyWord, Achievement, UserAchievement,
    KidsLesson, KidsProgress, KidsAchievement, KidsCertificate, KidsTrophy, WaitlistEntry,
    EmailVerificationToken, UserNotification, AdminNotification, SurveyStepResponse, PlatformSettings,
    CookieConsent,
    StoryEnrollment, StoryWord, StoryPhrase, KidsFavorite,
    KidsVocabularyPractice, KidsPronunciationPractice, KidsGameSession,
    ParentalControlSettings, TeenProgress, TeenStoryProgress,
    TeenVocabularyPractice, TeenPronunciationPractice, TeenFavorite,
    TeenAchievement, TeenGameSession, TeenCertificate,
    PageEligibility, CategoryProgress, VideoLesson,
    VideoEngagement, ChannelSubscription, PracticeComment, VideoShareEvent,
    CommonLesson, CommonLessonEnrollment, WeeklyChallenge, UserWeeklyChallenge,
    LearningGoal, PersonalizedRecommendation, SpacedRepetitionItem,
    MicrolearningModule, MicrolearningProgress, ProgressAnalytics,
    # New models for adults features
    DictionaryEntry, UserDictionary, FlashcardDeck, Flashcard, FlashcardReview,
    DailyGoal, UserToolbarPreference, MultiModePracticeSession,
    EmailTemplate, EmailPracticeSession, PronunciationPractice,
    CulturalIntelligenceModule, CulturalIntelligenceProgress, SearchHistory
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


def get_category_from_lesson_type(lesson_type: str) -> str:
    """Map lesson type to category"""
    mapping = {
        'kids_4_10': 'young_kids',
        'kids_11_17': 'teen_kids',
        'beginner': 'adults_beginner',
        'intermediate': 'adults_intermediate',
        'advanced': 'adults_advanced',
        'ielts': 'ielts_pte',
        'pte': 'ielts_pte',
    }
    return mapping.get(lesson_type, 'adults_beginner')


def sync_category_progress(user, category, category_progress):
    """Sync category progress with existing progress data from source tables - SAVES TO MYSQL"""
    try:
        from django.utils import timezone
        
        logger.debug(f"Syncing category progress for user {user.id}, category {category}")
        
        if category == 'young_kids':
            kids_progress = KidsProgress.objects.filter(user=user).first()
            logger.debug(f"YoungKids: Found KidsProgress: {kids_progress is not None}")
            if kids_progress:
                logger.debug(f"YoungKids: Points={kids_progress.points}, Streak={kids_progress.streak}")
                category_progress.total_points = kids_progress.points or 0
                category_progress.total_streak = kids_progress.streak or 0
                details = kids_progress.details or {}
                
                # Count completed stories
                story_enrollments = details.get('storyEnrollments', [])
                if not story_enrollments:
                    # Also check StoryEnrollment table
                    story_enrollments_db = StoryEnrollment.objects.filter(user=user, completed=True)
                    stories_count = story_enrollments_db.count()
                    logger.debug(f"YoungKids: Found {stories_count} completed stories from StoryEnrollment table")
                    category_progress.stories_completed = stories_count
                else:
                    stories_completed_count = len([
                        s for s in story_enrollments
                        if s.get('completed', False)
                    ])
                    logger.debug(f"YoungKids: Found {stories_completed_count} completed stories from details")
                    category_progress.stories_completed = stories_completed_count
                category_progress.lessons_completed = category_progress.stories_completed  # Also set lessons_completed for consistency
                
                # Count vocabulary words
                vocab_dict = details.get('vocabulary', {})
                if not vocab_dict:
                    # Also check KidsVocabularyPractice table
                    vocab_count = KidsVocabularyPractice.objects.filter(user=user).count()
                    logger.debug(f"YoungKids: Found {vocab_count} vocabulary words from KidsVocabularyPractice table")
                    category_progress.vocabulary_words = vocab_count
                else:
                    vocab_count = len(vocab_dict)
                    logger.debug(f"YoungKids: Found {vocab_count} vocabulary words from details")
                    category_progress.vocabulary_words = vocab_count
                
                # Count pronunciation attempts
                pron_dict = details.get('pronunciation', {})
                if not pron_dict:
                    # Also check KidsPronunciationPractice table
                    pron_count = KidsPronunciationPractice.objects.filter(user=user).count()
                    logger.debug(f"YoungKids: Found {pron_count} pronunciation attempts from KidsPronunciationPractice table")
                    category_progress.pronunciation_attempts = pron_count
                else:
                    pron_count = len(pron_dict)
                    logger.debug(f"YoungKids: Found {pron_count} pronunciation attempts from details")
                    category_progress.pronunciation_attempts = pron_count
                
                # Count games
                games_dict = details.get('games', {})
                if games_dict:
                    games_count = games_dict.get('attempts', 0)
                    logger.debug(f"YoungKids: Found {games_count} games from details")
                    category_progress.games_completed = games_count
                else:
                    # Also check KidsGameSession table
                    games_count = KidsGameSession.objects.filter(user=user, completed=True).count()
                    logger.info(f"YoungKids: Found {games_count} games from KidsGameSession table")
                    category_progress.games_completed = games_count
                
                # Update last activity if there's any progress
                if category_progress.total_points > 0 or category_progress.stories_completed > 0:
                    category_progress.last_activity = timezone.now()
                
                # Calculate average score from practice sessions
                if category_progress.pronunciation_attempts > 0:
                    pron_practices = KidsPronunciationPractice.objects.filter(user=user)
                    if pron_practices.exists():
                        scores = [p.best_score for p in pron_practices if p.best_score > 0]
                        if scores:
                            category_progress.average_score = sum(scores) / len(scores)
                            logger.info(f"YoungKids: Calculated average score: {category_progress.average_score}")
                
                # Calculate practice time from various sources
                practice_time_minutes = 0
                
                # 1. From game sessions (duration_seconds converted to minutes)
                game_sessions = KidsGameSession.objects.filter(user=user)
                game_time_seconds = sum(g.duration_seconds for g in game_sessions if g.duration_seconds)
                practice_time_minutes += game_time_seconds // 60
                logger.info(f"YoungKids: Game sessions time: {game_time_seconds // 60} minutes")
                
                # 2. Estimate from pronunciation attempts (2 minutes per attempt)
                if category_progress.pronunciation_attempts > 0:
                    pron_time = category_progress.pronunciation_attempts * 2
                    practice_time_minutes += pron_time
                    logger.info(f"YoungKids: Pronunciation time estimate: {pron_time} minutes")
                
                # 3. Estimate from story completions (5 minutes per story)
                if category_progress.stories_completed > 0:
                    story_time = category_progress.stories_completed * 5
                    practice_time_minutes += story_time
                    logger.info(f"YoungKids: Story time estimate: {story_time} minutes")
                
                # 4. Estimate from vocabulary practice (1 minute per word)
                if category_progress.vocabulary_words > 0:
                    vocab_time = min(category_progress.vocabulary_words * 1, 60)  # Cap at 60 minutes
                    practice_time_minutes += vocab_time
                    logger.info(f"YoungKids: Vocabulary time estimate: {vocab_time} minutes")
                
                category_progress.practice_time_minutes = practice_time_minutes
                logger.info(f"YoungKids: Total practice time: {practice_time_minutes} minutes")
                
                logger.info(f"YoungKids: Saving - Points={category_progress.total_points}, Stories={category_progress.stories_completed}, Vocab={category_progress.vocabulary_words}, Time={practice_time_minutes}min")
                category_progress.save()  # ← SAVE TO MYSQL
            else:
                logger.warning(f"YoungKids: No KidsProgress found for user {user.id}")
        
        elif category == 'teen_kids':
            teen_progress = TeenProgress.objects.filter(user=user).first()
            logger.info(f"TeenKids: Found TeenProgress: {teen_progress is not None}")
            if teen_progress:
                logger.info(f"TeenKids: Points={teen_progress.points}, Streak={teen_progress.streak}, Missions={teen_progress.missions_completed}")
                category_progress.total_points = teen_progress.points or 0
                category_progress.total_streak = teen_progress.streak or 0
                category_progress.stories_completed = teen_progress.missions_completed or 0
                category_progress.lessons_completed = teen_progress.missions_completed or 0  # Also set lessons_completed for consistency
                category_progress.vocabulary_words = teen_progress.vocabulary_attempts or 0
                category_progress.pronunciation_attempts = teen_progress.pronunciation_attempts or 0
                category_progress.games_completed = teen_progress.games_attempts or 0
                
                # Calculate average score from practice sessions
                if category_progress.pronunciation_attempts > 0:
                    pron_practices = TeenPronunciationPractice.objects.filter(user=user)
                    if pron_practices.exists():
                        scores = [p.best_score for p in pron_practices if p.best_score > 0]
                        if scores:
                            category_progress.average_score = sum(scores) / len(scores)
                            logger.info(f"TeenKids: Calculated average score: {category_progress.average_score}")
                
                # Calculate practice time from various sources
                practice_time_minutes = 0
                
                # 1. From game sessions (if TeenGameSession exists, use it; otherwise estimate)
                # Check if TeenGameSession model exists
                try:
                    from api.models import TeenGameSession
                    game_sessions = TeenGameSession.objects.filter(user=user)
                    if hasattr(TeenGameSession, 'duration_seconds'):
                        game_time_seconds = sum(g.duration_seconds for g in game_sessions if g.duration_seconds)
                        practice_time_minutes += game_time_seconds // 60
                        logger.info(f"TeenKids: Game sessions time: {game_time_seconds // 60} minutes")
                except (ImportError, AttributeError):
                    # If TeenGameSession doesn't exist, estimate from games_attempts
                    if category_progress.games_completed > 0:
                        game_time = category_progress.games_completed * 3  # 3 minutes per game
                        practice_time_minutes += game_time
                        logger.info(f"TeenKids: Game time estimate: {game_time} minutes")
                
                # 2. Estimate from pronunciation attempts (2.5 minutes per attempt for teens)
                if category_progress.pronunciation_attempts > 0:
                    pron_time = category_progress.pronunciation_attempts * 2.5
                    practice_time_minutes += int(pron_time)
                    logger.info(f"TeenKids: Pronunciation time estimate: {int(pron_time)} minutes")
                
                # 3. Estimate from story/mission completions (7 minutes per mission for teens)
                if category_progress.stories_completed > 0:
                    story_time = category_progress.stories_completed * 7
                    practice_time_minutes += story_time
                    logger.info(f"TeenKids: Mission time estimate: {story_time} minutes")
                
                # 4. Estimate from vocabulary practice (1.5 minutes per word for teens)
                if category_progress.vocabulary_words > 0:
                    vocab_time = min(int(category_progress.vocabulary_words * 1.5), 90)  # Cap at 90 minutes
                    practice_time_minutes += vocab_time
                    logger.info(f"TeenKids: Vocabulary time estimate: {vocab_time} minutes")
                
                category_progress.practice_time_minutes = practice_time_minutes
                logger.info(f"TeenKids: Total practice time: {practice_time_minutes} minutes")
                
                # Update last activity
                if category_progress.total_points > 0 or category_progress.stories_completed > 0:
                    category_progress.last_activity = timezone.now()
                
                logger.info(f"TeenKids: Saving - Points={category_progress.total_points}, Missions={category_progress.stories_completed}, Vocab={category_progress.vocabulary_words}, Time={practice_time_minutes}min")
                category_progress.save()  # ← SAVE TO MYSQL
            else:
                logger.warning(f"TeenKids: No TeenProgress found for user {user.id}")
        
        # For adult categories, sync from LessonProgress
        elif category in ['adults_beginner', 'adults_intermediate', 'adults_advanced']:
            lesson_type_map = {
                'adults_beginner': 'beginner',
                'adults_intermediate': 'intermediate',
                'adults_advanced': 'advanced'
            }
            lesson_type = lesson_type_map.get(category)
            if lesson_type:
                lessons = LessonProgress.objects.filter(
                    user=user,
                    lesson__lesson_type=lesson_type
                )
                completed_lessons = lessons.filter(completed=True)
                category_progress.lessons_completed = completed_lessons.count()
                
                # Calculate points from completed lessons
                points_from_lessons = 0
                for lesson in completed_lessons:
                    if lesson.score:
                        points_from_lessons += int(lesson.score / 10)
                        if lesson.score == 100:
                            points_from_lessons += 20  # Perfect score bonus
                    points_from_lessons += min(10, lesson.time_spent_minutes // 5)  # Time bonus
                
                category_progress.total_points = points_from_lessons
                category_progress.practice_time_minutes = sum(l.time_spent_minutes for l in lessons)
                
                # Calculate average score
                scores = [l.score for l in completed_lessons if l.score > 0]
                if scores:
                    category_progress.average_score = sum(scores) / len(scores)
                
                # Count vocabulary words for this level
                vocab_count = VocabularyWord.objects.filter(user=user).count()
                category_progress.vocabulary_words = vocab_count
                
                # Update last activity
                if category_progress.lessons_completed > 0:
                    last_lesson = completed_lessons.order_by('-last_attempt').first()
                    if last_lesson:
                        category_progress.last_activity = last_lesson.last_attempt
                    else:
                        category_progress.last_activity = timezone.now()
                
                category_progress.save()  # ← SAVE TO MYSQL
        
        # For IELTS/PTE category
        elif category == 'ielts_pte':
            # Check if user has any IELTS/PTE lessons
            ielts_lessons = LessonProgress.objects.filter(
                user=user,
                lesson__lesson_type__in=['ielts', 'pte']
            )
            completed_ielts = ielts_lessons.filter(completed=True)
            category_progress.lessons_completed = completed_ielts.count()
            
            if completed_ielts.exists():
                points_from_lessons = 0
                for lesson in completed_ielts:
                    if lesson.score:
                        points_from_lessons += int(lesson.score / 10)
                    points_from_lessons += min(10, lesson.time_spent_minutes // 5)
                
                category_progress.total_points = points_from_lessons
                category_progress.practice_time_minutes = sum(l.time_spent_minutes for l in ielts_lessons)
                
                scores = [l.score for l in completed_ielts if l.score > 0]
                if scores:
                    category_progress.average_score = sum(scores) / len(scores)
                
                last_lesson = completed_ielts.order_by('-last_attempt').first()
                if last_lesson:
                    category_progress.last_activity = last_lesson.last_attempt
                else:
                    category_progress.last_activity = timezone.now()
                
                category_progress.save()  # ← SAVE TO MYSQL
        
        logger.info(f"Synced category progress for user {user.id}, category {category}")
    except Exception as e:
        logger.error(f"Error syncing category progress: {str(e)}")
        import traceback
        traceback.print_exc()


def update_category_progress_from_activity(
    user,
    category: str,
    points: int = 0,
    time_minutes: int = 0,
    score: float = 0,
    lessons: int = 0,
    stories: int = 0,
    vocabulary_words: int = 0,
    pronunciation_attempts: int = 0,
    games: int = 0,
    streak: int = None
):
    """
    Update CategoryProgress in MySQL database from any activity.
    This function ensures all progress is saved to the database.
    """
    try:
        category_progress, created = CategoryProgress.objects.get_or_create(
            user=user,
            category=category,
            defaults={
                'total_points': 0,
                'total_streak': 0,
                'lessons_completed': 0,
                'practice_time_minutes': 0,
                'average_score': 0.0,
                'progress_percentage': 0.0,
                'level': 1,
                'stories_completed': 0,
                'vocabulary_words': 0,
                'pronunciation_attempts': 0,
                'games_completed': 0,
            }
        )
        
        # If newly created, sync with existing data first
        if created:
            sync_category_progress(user, category, category_progress)
            # Reload to get synced data
            category_progress.refresh_from_db()
        
        # Update metrics - ALL CHANGES ARE SAVED TO MYSQL
        from django.utils import timezone
        
        if points > 0:
            category_progress.total_points = (category_progress.total_points or 0) + points
        if time_minutes > 0:
            category_progress.practice_time_minutes = (category_progress.practice_time_minutes or 0) + time_minutes
        if lessons > 0:
            category_progress.lessons_completed = (category_progress.lessons_completed or 0) + lessons
        if stories > 0:
            category_progress.stories_completed = (category_progress.stories_completed or 0) + stories
        if vocabulary_words > 0:
            category_progress.vocabulary_words = (category_progress.vocabulary_words or 0) + vocabulary_words
        if pronunciation_attempts > 0:
            category_progress.pronunciation_attempts = (category_progress.pronunciation_attempts or 0) + pronunciation_attempts
        if games > 0:
            category_progress.games_completed = (category_progress.games_completed or 0) + games
        if streak is not None:
            category_progress.total_streak = max(category_progress.total_streak or 0, streak)
        
        # Update average score if score provided
        if score > 0:
            # Ensure details is a dict (safety check)
            if not isinstance(category_progress.details, dict):
                category_progress.details = {}
            total_scores = category_progress.details.get('total_scores', 0) + 1
            current_avg = category_progress.average_score or 0.0
            # Calculate new average: (old_avg * (n-1) + new_score) / n
            if total_scores == 1:
                category_progress.average_score = score
            else:
                category_progress.average_score = ((current_avg * (total_scores - 1)) + score) / total_scores
            category_progress.details['total_scores'] = total_scores
        
        # Always update last activity timestamp
        category_progress.last_activity = timezone.now()
        
        # SAVE TO MYSQL DATABASE - This executes UPDATE SQL statement
        category_progress.save()  # ← WRITES TO MYSQL DATABASE TABLE
        
        logger.info(f"CategoryProgress updated for user {user.id}, category {category}: {points} points, {lessons} lessons")
        
    except Exception as e:
        logger.error(f"Error updating CategoryProgress: {str(e)}")
        # Don't fail the main operation if category progress update fails
        pass


def calculate_level(points):
    """Calculate user level from points"""
    import math
    return math.floor(math.sqrt(points / 100)) + 1


def create_or_update_user_notification(
    user,
    *,
    notification_type='system',
    title='',
    message='',
    icon='',
    action_url='',
    event_key='',
    metadata=None,
):
    """
    Create or update a user notification while respecting event deduplication.
    Returns a tuple of (notification, created_or_updated_flag).
    """
    if not title or not message:
        logger.warning("Skipping notification with missing title or message (event_key=%s)", event_key)
        return None, False

    metadata = metadata or {}

    try:
        with transaction.atomic():
            if event_key:
                notification, created = UserNotification.objects.get_or_create(
                    user=user,
                    event_key=event_key,
                    defaults={
                        'notification_type': notification_type,
                        'title': title,
                        'message': message,
                        'icon': icon or '',
                        'action_url': action_url or '',
                        'metadata': metadata,
                    }
                )

                if created:
                    return notification, True

                updated_fields = []

                if notification.notification_type != notification_type:
                    notification.notification_type = notification_type
                    updated_fields.append('notification_type')

                if notification.title != title:
                    notification.title = title
                    updated_fields.append('title')

                if notification.message != message:
                    notification.message = message
                    updated_fields.append('message')

                if icon is not None and notification.icon != (icon or ''):
                    notification.icon = icon or ''
                    updated_fields.append('icon')

                if action_url is not None and notification.action_url != (action_url or ''):
                    notification.action_url = action_url or ''
                    updated_fields.append('action_url')

                if metadata and notification.metadata != metadata:
                    notification.metadata = metadata
                    updated_fields.append('metadata')

                if updated_fields:
                    notification.save(update_fields=updated_fields + ['updated_at'])
                    return notification, True

                return notification, False

            notification = UserNotification.objects.create(
                user=user,
                notification_type=notification_type,
                title=title,
                message=message,
                icon=icon or '',
                action_url=action_url or '',
                event_key='',
                metadata=metadata,
            )
            return notification, True

    except Exception as exc:
        logger.error("Failed to create/update user notification (event_key=%s): %s", event_key, exc)

    return None, False


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
            # Handle survey_completed_at - set it only if survey is being completed
            data = request.data.copy()
            
            # Handle practice_start_time - convert string to Time object if provided
            if 'practice_start_time' in data and data.get('practice_start_time'):
                practice_time_str = data.get('practice_start_time')
                if isinstance(practice_time_str, str):
                    try:
                        # Parse time string (format: "HH:MM" or "HH:MM:SS")
                        from datetime import datetime
                        time_obj = datetime.strptime(practice_time_str, '%H:%M').time()
                        data['practice_start_time'] = time_obj
                    except (ValueError, TypeError):
                        try:
                            # Try with seconds
                            time_obj = datetime.strptime(practice_time_str, '%H:%M:%S').time()
                            data['practice_start_time'] = time_obj
                        except (ValueError, TypeError):
                            logger.warning(f"Invalid time format for practice_start_time: {practice_time_str}")
                            data['practice_start_time'] = None
            
            # If survey_completed_at is provided, ensure it's set correctly
            # This happens when personalization is completed (final survey step)
            if 'survey_completed_at' in data:
                survey_completed_at_value = data.get('survey_completed_at')
                
                # Verify that key survey fields are present to ensure this is a complete survey
                has_survey_data = (
                    data.get('age_range') or profile.age_range or
                    data.get('native_language') or profile.native_language or
                    data.get('english_level') or profile.english_level or
                    data.get('learning_purpose') or (profile.learning_purpose and len(profile.learning_purpose) > 0)
                )
                
                if survey_completed_at_value and has_survey_data:
                    # Survey is being completed - ensure timestamp is set
                    # If it's already a datetime string, keep it; otherwise use current time
                    # timezone is already imported at the top of the file
                    if not survey_completed_at_value or survey_completed_at_value == '':
                        data['survey_completed_at'] = timezone.now()
                    # If it's a valid ISO string, the serializer will handle it
                elif survey_completed_at_value is None or survey_completed_at_value == '':
                    # Explicitly clearing survey_completed_at
                    data['survey_completed_at'] = None
                # If no survey data but survey_completed_at is being set, allow it
                # (this handles cases where survey data was already saved in previous steps)
            
            serializer = UserProfileSerializer(profile, data=data, partial=(request.method == 'PATCH'))
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Profile updated for user {request.user.username}: survey_completed_at={data.get('survey_completed_at', 'not set')}")
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_survey_step(request):
    """Save individual survey step response to MySQL"""
    try:
        step_name = request.data.get('step_name')
        step_number = request.data.get('step_number')
        response_data = request.data.get('response_data', {})
        
        if not step_name or step_number is None:
            return Response({
                "message": "step_name and step_number are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Save individual step response
        step_response = SurveyStepResponse.objects.create(
            user=request.user,
            step_name=step_name,
            step_number=step_number,
            response_data=response_data
        )
        
        serializer = SurveyStepResponseSerializer(step_response)
        logger.info(f"Survey step {step_number} ({step_name}) saved for user {request.user.username}")
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Survey step save error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_survey_steps(request):
    """Get all survey step responses for current user"""
    try:
        step_responses = SurveyStepResponse.objects.filter(user=request.user).order_by('step_number', '-completed_at')
        serializer = SurveyStepResponseSerializer(step_responses, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Get survey steps error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
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
            
            # Update CategoryProgress in MySQL database
            category = get_category_from_lesson_type(lesson.lesson_type)
            update_category_progress_from_activity(
                user=request.user,
                category=category,
                points=points,
                time_minutes=time_spent,
                score=score,
                lessons=1 if request.data.get('completed', False) else 0,
                streak=profile.current_streak
            )
            
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
    """Record a practice session to MySQL database"""
    try:
        user = request.user
        data = request.data.copy()
        
        # Extract all fields with defaults
        session_type = data.get('session_type', '')
        lesson_id = data.get('lesson')
        duration_minutes = int(data.get('duration_minutes', 0))
        score = float(data.get('score', 0))
        points_earned = int(data.get('points_earned', 0))
        words_practiced = int(data.get('words_practiced', 0))
        sentences_practiced = int(data.get('sentences_practiced', 0))
        mistakes_count = int(data.get('mistakes_count', 0))
        details = data.get('details', {})
        
        # Validate required fields
        if not session_type:
            return Response({
                "message": "session_type is required",
                "success": False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate session_type is one of the allowed values
        allowed_types = ['pronunciation', 'conversation', 'vocabulary', 'grammar', 
                        'listening', 'reading', 'exam_practice']
        if session_type not in allowed_types:
            return Response({
                "message": f"Invalid session_type. Must be one of: {', '.join(allowed_types)}",
                "success": False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get lesson if provided
        lesson = None
        if lesson_id:
            try:
                lesson = Lesson.objects.get(id=lesson_id)
            except Lesson.DoesNotExist:
                logger.warning(f"Lesson {lesson_id} not found, creating session without lesson")
        
        # Create practice session directly to ensure all fields are saved to MySQL
        practice_session = PracticeSession.objects.create(
            user=user,
            session_type=session_type,
            lesson=lesson,
            duration_minutes=duration_minutes,
            score=score,
            points_earned=points_earned,
            words_practiced=words_practiced,
            sentences_practiced=sentences_practiced,
            mistakes_count=mistakes_count,
            details=details
        )
        
        # Log successful save
        logger.info(f"Practice session saved to MySQL: ID={practice_session.id}, User={user.id}, "
                   f"Type={session_type}, Score={score}, Duration={duration_minutes}min")
        
        # Serialize and return
        serializer = PracticeSessionSerializer(practice_session)
        return Response({
            "message": "Practice session recorded successfully",
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    except ValueError as e:
        logger.error(f"Practice session validation error: {str(e)}")
        return Response({
            "message": f"Invalid data: {str(e)}",
            "success": False
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Practice session error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred while saving practice session",
            "success": False,
            "error": str(e)
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


# ============= Parental Controls Helpers =============
def _get_parental_settings(user):
    settings_obj, _ = ParentalControlSettings.objects.get_or_create(user=user)
    return settings_obj


def _build_parental_usage_stats(user):
    now = timezone.now()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_week = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)

    daily_seconds = KidsGameSession.objects.filter(
        user=user,
        created_at__gte=start_of_today,
    ).aggregate(total=Sum('duration_seconds'))['total'] or 0

    weekly_seconds = KidsGameSession.objects.filter(
        user=user,
        created_at__gte=start_of_week,
    ).aggregate(total=Sum('duration_seconds'))['total'] or 0

    words_learned = KidsVocabularyPractice.objects.filter(user=user).count()
    stories_completed = StoryEnrollment.objects.filter(user=user, completed=True).count()
    games_played = KidsGameSession.objects.filter(user=user, created_at__gte=start_of_week).count()

    last_activity_candidates = [
        KidsGameSession.objects.filter(user=user).aggregate(last_seen=Max('updated_at'))['last_seen'],
        KidsVocabularyPractice.objects.filter(user=user).aggregate(last_seen=Max('last_practiced'))['last_seen'],
        KidsPronunciationPractice.objects.filter(user=user).aggregate(last_seen=Max('last_practiced'))['last_seen'],
        StoryEnrollment.objects.filter(user=user).aggregate(last_seen=Max('updated_at'))['last_seen'],
        KidsProgress.objects.filter(user=user).aggregate(last_seen=Max('updated_at'))['last_seen'],
    ]

    fallback_last_active = user.last_login or user.date_joined
    last_active = max([ts for ts in last_activity_candidates if ts] or [fallback_last_active])

    return {
        "totalMinutesToday": int(ceil(daily_seconds / 60)) if daily_seconds else 0,
        "totalMinutesWeek": int(ceil(weekly_seconds / 60)) if weekly_seconds else 0,
        "wordsLearned": words_learned,
        "storiesCompleted": stories_completed,
        "gamesPlayed": games_played,
        "lastActive": last_active.isoformat(),
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_parental_controls_overview(request):
    settings_obj = _get_parental_settings(request.user)
    settings_data = ParentalControlSettingsSerializer(settings_obj).data
    stats_data = _build_parental_usage_stats(request.user)
    return Response({
        "settings": settings_data,
        "stats": stats_data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_parental_controls_unlock(request):
    settings_obj = _get_parental_settings(request.user)
    if not settings_obj.has_pin:
        return Response({
            "success": True,
            "unlocked": True,
            "message": "PIN not configured; controls are open.",
        })

    provided_pin = (request.data.get('pin') or "").strip()
    if not provided_pin:
        return Response({
            "success": False,
            "unlocked": False,
            "message": "PIN is required.",
        }, status=status.HTTP_400_BAD_REQUEST)

    if check_password(provided_pin, settings_obj.pin_hash):
        return Response({
            "success": True,
            "unlocked": True,
        })

    return Response({
        "success": False,
        "unlocked": False,
        "message": "Incorrect PIN. Please try again.",
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def kids_parental_controls_settings(request):
    settings_obj = _get_parental_settings(request.user)
    new_limit = request.data.get('daily_limit_minutes')

    try:
        if new_limit is None:
            raise ValueError("daily_limit_minutes is required")
        new_limit = int(new_limit)
    except (TypeError, ValueError):
        return Response({
            "success": False,
            "message": "daily_limit_minutes must be a valid number.",
        }, status=status.HTTP_400_BAD_REQUEST)

    if new_limit < 5 or new_limit > 600:
        return Response({
            "success": False,
            "message": "Daily limit must be between 5 and 600 minutes.",
        }, status=status.HTTP_400_BAD_REQUEST)

    settings_obj.daily_limit_minutes = new_limit
    settings_obj.save(update_fields=['daily_limit_minutes', 'updated_at'])

    serializer = ParentalControlSettingsSerializer(settings_obj)
    return Response({
        "success": True,
        "settings": serializer.data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_parental_controls_pin(request):
    settings_obj = _get_parental_settings(request.user)
    action = (request.data.get('action') or 'set').lower()

    if action == 'reset':
        current_pin = (request.data.get('current_pin') or "").strip()
        if settings_obj.has_pin and not current_pin:
            return Response({
                "success": False,
                "message": "Current PIN is required to reset.",
            }, status=status.HTTP_400_BAD_REQUEST)
        if settings_obj.has_pin and not check_password(current_pin, settings_obj.pin_hash):
            return Response({
                "success": False,
                "message": "Current PIN is incorrect.",
            }, status=status.HTTP_400_BAD_REQUEST)

        settings_obj.pin_hash = ""
        settings_obj.last_pin_update = timezone.now()
        settings_obj.save(update_fields=['pin_hash', 'last_pin_update', 'updated_at'])
        serializer = ParentalControlSettingsSerializer(settings_obj)
        return Response({
            "success": True,
            "settings": serializer.data,
            "message": "PIN has been cleared.",
        })

    new_pin = (request.data.get('new_pin') or "").strip()
    confirm_pin = (request.data.get('confirm_pin') or "").strip()
    current_pin = (request.data.get('current_pin') or "").strip()

    if settings_obj.has_pin and (not current_pin or not check_password(current_pin, settings_obj.pin_hash)):
        return Response({
            "success": False,
            "message": "Current PIN is incorrect.",
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(new_pin) < 4 or len(new_pin) > 6 or not new_pin.isdigit():
        return Response({
            "success": False,
            "message": "PIN must be 4-6 digits.",
        }, status=status.HTTP_400_BAD_REQUEST)

    if new_pin != confirm_pin:
        return Response({
            "success": False,
            "message": "PINs do not match.",
        }, status=status.HTTP_400_BAD_REQUEST)

    settings_obj.pin_hash = make_password(new_pin)
    settings_obj.last_pin_update = timezone.now()
    settings_obj.save(update_fields=['pin_hash', 'last_pin_update', 'updated_at'])
    serializer = ParentalControlSettingsSerializer(settings_obj)
    return Response({
        "success": True,
        "settings": serializer.data,
        "message": "PIN saved successfully.",
    })


# ============= Teen Helper Functions =============
def _get_or_create_teen_progress(user, for_update: bool = False) -> TeenProgress:
    qs = TeenProgress.objects
    if for_update:
        qs = qs.select_for_update()
    progress, _ = qs.get_or_create(user=user)
    return progress


def _update_teen_streak(progress: TeenProgress) -> int:
    """Update teen engagement streak based on last engagement date."""
    today = timezone.now().date()
    if progress.last_engagement == today:
        return progress.streak

    yesterday = today - timedelta(days=1)
    if progress.last_engagement == yesterday:
        progress.streak = (progress.streak or 0) + 1
    else:
        progress.streak = 1

    progress.last_engagement = today
    return progress.streak


def _parse_score(score_value) -> float:
    """Parse and validate score value, returning 0 if invalid."""
    try:
        return float(score_value)
    except (TypeError, ValueError):
        return 0.0


def _parse_points(points_value, default: int = 0) -> int:
    """Parse and validate points value, returning default if invalid."""
    try:
        parsed = int(points_value)
        return max(0, parsed) if parsed else default
    except (TypeError, ValueError):
        return default


def _sync_teen_achievements(user, progress: TeenProgress, favorites_count: int):
    definitions = [
        {
            'key': 'advanced_learner',
            'name': 'Advanced Learner',
            'emoji': '🌟',
            'description': f"{progress.points}/2500 points",
            'current': progress.points,
            'target': 2500,
        },
        {
            'key': 'story_strategist',
            'name': 'Story Strategist',
            'emoji': '📖',
            'description': f"{favorites_count}/10 stories saved",
            'current': favorites_count,
            'target': 10,
        },
        {
            'key': 'speaking_pro',
            'name': 'Speaking Pro',
            'emoji': '🎤',
            'description': f"{progress.pronunciation_attempts} practiced",
            'current': progress.pronunciation_attempts,
            'target': 20,
        },
        {
            'key': 'vocabulary_expert',
            'name': 'Vocabulary Expert',
            'emoji': '🧠',
            'description': f"{progress.vocabulary_attempts} words mastered",
            'current': progress.vocabulary_attempts,
            'target': 20,
        },
        {
            'key': 'challenge_champion',
            'name': 'Challenge Champion',
            'emoji': '🏆',
            'description': f"{min(progress.games_attempts, 4)}/4 challenges",
            'current': progress.games_attempts,
            'target': 4,
        },
    ]

    achievements = []
    for definition in definitions:
        target = definition['target'] or 1
        current = max(0, definition['current'])
        percent = min(100.0, round((current / target) * 100, 2))
        unlocked = percent >= 100

        record, _ = TeenAchievement.objects.get_or_create(user=user, key=definition['key'])
        updates = {}
        if abs(record.progress - percent) > 0.01:
            record.progress = percent
            updates['progress'] = percent
        if unlocked and not record.unlocked:
            record.unlocked = True
            record.unlocked_at = timezone.now()
            updates['unlocked'] = True
            updates['unlocked_at'] = record.unlocked_at
        if updates:
            record.save(update_fields=list(updates.keys()))

        achievements.append({
            'key': definition['key'],
            'name': definition['name'],
            'emoji': definition['emoji'],
            'description': definition['description'],
            'progress': percent,
            'unlocked': record.unlocked or unlocked,
        })

    return achievements


def _build_teen_dashboard_payload(user) -> dict:
    progress = _get_or_create_teen_progress(user)
    favorites = list(TeenFavorite.objects.filter(user=user).values_list('story_id', flat=True))
    favorites_count = len(favorites)

    if progress.favorites_count != favorites_count:
        progress.favorites_count = favorites_count
        progress.save(update_fields=['favorites_count', 'updated_at'])

    story_progress_qs = TeenStoryProgress.objects.filter(user=user)
    completed_story_ids = [
        story.story_id for story in story_progress_qs if story.status == 'completed'
    ]

    achievements = _sync_teen_achievements(
        user,
        progress,
        favorites_count=favorites_count,
    )

    story_progress_data = TeenStoryProgressSerializer(story_progress_qs, many=True).data

    return {
        'points': progress.points,
        'streak': progress.streak,
        'last_engagement': progress.last_engagement,
        'vocabulary_attempts': progress.vocabulary_attempts,
        'pronunciation_attempts': progress.pronunciation_attempts,
        'games_attempts': progress.games_attempts,
        'missions_started': progress.missions_started,
        'missions_completed': progress.missions_completed,
        'favorites': favorites,
        'favorites_count': favorites_count,
        'completed_story_ids': completed_story_ids,
        'story_progress': story_progress_data,
        'achievements': achievements,
        'progress': TeenProgressSerializer(progress).data,
    }


# ============= Teen Endpoints =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teen_dashboard(request):
    # Sync CategoryProgress with TeenProgress to ensure data is always in sync
    try:
        category_progress, created = CategoryProgress.objects.get_or_create(
            user=request.user,
            category='teen_kids',
            defaults={
                'total_points': 0,
                'total_streak': 0,
                'lessons_completed': 0,
                'practice_time_minutes': 0,
                'average_score': 0.0,
                'progress_percentage': 0.0,
                'level': 1,
                'stories_completed': 0,
                'vocabulary_words': 0,
                'pronunciation_attempts': 0,
                'games_completed': 0,
            }
        )
        # Always sync to ensure data is up to date
        sync_category_progress(request.user, 'teen_kids', category_progress)
        category_progress.save()
        logger.info(f"Synced teen_kids CategoryProgress for user {request.user.id}: {category_progress.total_points} points, {category_progress.stories_completed} stories")
    except Exception as e:
        logger.error(f"Error syncing teen_kids CategoryProgress: {str(e)}")
        # Continue even if sync fails
        import traceback
        traceback.print_exc()
    
    payload = _build_teen_dashboard_payload(request.user)
    return Response(payload)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teen_story_start(request):
    story_id = request.data.get('story_id')
    story_title = request.data.get('story_title')
    story_type = request.data.get('story_type', '')

    if not story_id or not story_title:
        return Response(
            {'message': 'story_id and story_title are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    with transaction.atomic():
        progress = _get_or_create_teen_progress(request.user, for_update=True)
        story_qs = TeenStoryProgress.objects.select_for_update()
        story_progress, _ = story_qs.get_or_create(
            user=request.user,
            story_id=story_id,
            defaults={
                'story_title': story_title,
                'story_type': story_type,
                'status': 'started',
                'attempts': 0,
            }
        )

        # Update story progress fields (always update for data consistency)
        story_progress.story_title = story_title
        story_progress.story_type = story_type
        story_progress.status = 'started'
        story_progress.attempts = (story_progress.attempts or 0) + 1
        story_progress.last_started_at = timezone.now()
        story_progress.save()

        # No points awarded for starting - points only come from completing stories, vocabulary, and pronunciation practice
        progress.missions_started = (progress.missions_started or 0) + 1
        _update_teen_streak(progress)
        progress.save()

    payload = _build_teen_dashboard_payload(request.user)
    payload['reward'] = {'points_awarded': 0}
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teen_story_complete(request):
    story_id = request.data.get('story_id')
    story_title = request.data.get('story_title')
    story_type = request.data.get('story_type', '')
    score = request.data.get('score', 0)

    if not story_id or not story_title:
        return Response(
            {'message': 'story_id and story_title are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    score = _parse_score(score)
    base_points = max(0, round(score / 8))
    completion_bonus = 60
    points_to_add = base_points + completion_bonus

    with transaction.atomic():
        progress = _get_or_create_teen_progress(request.user, for_update=True)
        story_qs = TeenStoryProgress.objects.select_for_update()
        story_progress, _ = story_qs.get_or_create(
            user=request.user,
            story_id=story_id,
            defaults={
                'story_title': story_title,
                'story_type': story_type,
                'status': 'started',
            }
        )

        # Update story progress fields (always update for data consistency)
        story_progress.story_title = story_title
        story_progress.story_type = story_type
        story_progress.status = 'completed'
        story_progress.best_score = max(story_progress.best_score or 0, score)
        story_progress.total_points_earned = (story_progress.total_points_earned or 0) + points_to_add
        story_progress.completed_at = timezone.now()
        story_progress.save()

        progress.points = max(0, (progress.points or 0) + points_to_add)
        progress.missions_completed = (progress.missions_completed or 0) + 1
        _update_teen_streak(progress)
        progress.save()
        
        # Update CategoryProgress in MySQL database
        update_category_progress_from_activity(
            user=request.user,
            category='teen_kids',
            points=points_to_add,
            score=score,
            stories=1,
            streak=progress.streak or 0
        )

    payload = _build_teen_dashboard_payload(request.user)
    payload['reward'] = {'points_awarded': points_to_add}
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teen_vocabulary_practice(request):
    word = request.data.get('word')
    story_id = request.data.get('story_id', '')
    story_title = request.data.get('story_title', '')
    score = request.data.get('score', 0)

    if not word:
        return Response({'message': 'word is required'}, status=status.HTTP_400_BAD_REQUEST)

    score = _parse_score(score)
    points_awarded = _parse_points(request.data.get('points_awarded', 25), default=25)

    with transaction.atomic():
        progress = _get_or_create_teen_progress(request.user, for_update=True)
        practice_qs = TeenVocabularyPractice.objects.select_for_update()
        practice, _ = practice_qs.get_or_create(
            user=request.user,
            word=word,
            defaults={
                'story_id': story_id,
                'story_title': story_title,
                'attempts': 0,
            }
        )

        # Update practice record (always update for data consistency)
        practice.story_id = story_id
        practice.story_title = story_title
        practice.attempts = (practice.attempts or 0) + 1
        practice.best_score = max(practice.best_score or 0, score)
        practice.last_practiced = timezone.now()
        practice.save()

        # Update progress metrics
        progress.vocabulary_attempts = (progress.vocabulary_attempts or 0) + 1
        progress.points = max(0, (progress.points or 0) + points_awarded)
        _update_teen_streak(progress)
        progress.save()
        
        # Update CategoryProgress in MySQL database
        update_category_progress_from_activity(
            user=request.user,
            category='teen_kids',
            points=points_awarded,
            score=score,
            vocabulary_words=1,
            streak=progress.streak or 0
        )
        
        # Also save to PracticeSession table for admin portal visibility
        try:
            PracticeSession.objects.create(
                user=request.user,
                session_type='vocabulary',
                duration_minutes=2,  # Estimated duration for vocabulary practice
                score=score,
                points_earned=points_awarded,
                words_practiced=1,
                sentences_practiced=0,
                mistakes_count=0 if score >= 80 else 1,
                details={
                    'source': 'teen_kids',
                    'word': word,
                    'story_id': story_id,
                    'story_title': story_title,
                    'practice_id': practice.id,
                    'attempts': practice.attempts
                }
            )
            logger.info(f"Teen vocabulary practice synced to PracticeSession for user {request.user.id}")
        except Exception as e:
            logger.error(f"Failed to sync teen vocabulary practice to PracticeSession: {str(e)}")

    payload = _build_teen_dashboard_payload(request.user)
    payload['reward'] = {'points_awarded': points_awarded}
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teen_pronunciation_practice(request):
    phrase = request.data.get('phrase')
    story_id = request.data.get('story_id', '')
    story_title = request.data.get('story_title', '')
    score = request.data.get('score', 0)

    if not phrase:
        return Response({'message': 'phrase is required'}, status=status.HTTP_400_BAD_REQUEST)

    score = _parse_score(score)
    points_awarded = _parse_points(request.data.get('points_awarded', 35), default=35)

    with transaction.atomic():
        progress = _get_or_create_teen_progress(request.user, for_update=True)
        practice_qs = TeenPronunciationPractice.objects.select_for_update()
        practice, _ = practice_qs.get_or_create(
            user=request.user,
            phrase=phrase,
            defaults={
                'story_id': story_id,
                'story_title': story_title,
                'attempts': 0,
            }
        )

        # Update practice record (always update for data consistency)
        practice.story_id = story_id
        practice.story_title = story_title
        practice.attempts = (practice.attempts or 0) + 1
        practice.best_score = max(practice.best_score or 0, score)
        practice.last_practiced = timezone.now()
        practice.save()

        # Update progress metrics
        progress.pronunciation_attempts = (progress.pronunciation_attempts or 0) + 1
        progress.points = max(0, (progress.points or 0) + points_awarded)
        _update_teen_streak(progress)
        progress.save()
        
        # Update CategoryProgress in MySQL database
        update_category_progress_from_activity(
            user=request.user,
            category='teen_kids',
            points=points_awarded,
            score=score,
            pronunciation_attempts=1,
            streak=progress.streak or 0
        )
        
        # Also save to PracticeSession table for admin portal visibility
        try:
            PracticeSession.objects.create(
                user=request.user,
                session_type='pronunciation',
                duration_minutes=3,  # Estimated duration for pronunciation practice
                score=score,
                points_earned=points_awarded,
                words_practiced=0,
                sentences_practiced=1,
                mistakes_count=0 if score >= 80 else 1,
                details={
                    'source': 'teen_kids',
                    'phrase': phrase[:100],  # Truncate if too long
                    'story_id': story_id,
                    'story_title': story_title,
                    'practice_id': practice.id,
                    'attempts': practice.attempts
                }
            )
            logger.info(f"Teen pronunciation practice synced to PracticeSession for user {request.user.id}")
        except Exception as e:
            logger.error(f"Failed to sync teen pronunciation practice to PracticeSession: {str(e)}")

    payload = _build_teen_dashboard_payload(request.user)
    payload['reward'] = {'points_awarded': points_awarded}
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teen_toggle_favorite(request):
    story_id = request.data.get('story_id')
    add = request.data.get('add', True)

    if not story_id:
        return Response({'message': 'story_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        progress = _get_or_create_teen_progress(request.user, for_update=True)
        if add:
            TeenFavorite.objects.get_or_create(user=request.user, story_id=story_id)
        else:
            TeenFavorite.objects.filter(user=request.user, story_id=story_id).delete()

        favorites_count = TeenFavorite.objects.filter(user=request.user).count()
        progress.favorites_count = favorites_count
        progress.save(update_fields=['favorites_count', 'updated_at'])

    payload = _build_teen_dashboard_payload(request.user)
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teen_quick_action(request):
    action = request.data.get('action')
    delta_points = request.data.get('delta_points')
    increment_games = request.data.get('increment_games', False)

    # No points awarded for quick actions - points only come from completing stories, vocabulary, and pronunciation practice
    # Quick actions are just navigation/engagement tracking, not actual practice
    delta_points = 0

    with transaction.atomic():
        progress = _get_or_create_teen_progress(request.user, for_update=True)
        if increment_games:
            progress.games_attempts = (progress.games_attempts or 0) + 1
        _update_teen_streak(progress)
        progress.save()

    payload = _build_teen_dashboard_payload(request.user)
    payload['reward'] = {'points_awarded': 0}
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def teen_game_session(request):
    """Get or record a teen game session"""
    if request.method == 'GET':
        # Get all game sessions for the user
        sessions = TeenGameSession.objects.filter(user=request.user).order_by('-created_at')
        serializer = TeenGameSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # POST - Record a game session
    game_type = request.data.get('game_type')
    game_title = request.data.get('game_title', '')
    score = request.data.get('score', 0)
    points_earned = request.data.get('points_earned', 0)
    rounds = request.data.get('rounds', 0)
    difficulty = request.data.get('difficulty', 'beginner')
    duration_seconds = request.data.get('duration_seconds', 0)
    completed = request.data.get('completed', False)
    details = request.data.get('details', {})
    
    if not game_type:
        return Response(
            {"message": "game_type is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    session = TeenGameSession.objects.create(
        user=request.user,
        game_type=game_type,
        game_title=game_title,
        score=score,
        points_earned=points_earned,
        rounds=rounds,
        difficulty=difficulty,
        duration_seconds=duration_seconds,
        completed=completed,
        details=details
    )
    
    # Also save to PracticeSession table for admin portal visibility
    try:
        # Map game types to session types
        session_type_map = {
            'pronunciation-challenge': 'pronunciation',
            'conversation-practice': 'conversation',
            'word-chain': 'vocabulary',
            'tongue-twister': 'pronunciation',
            'debate-club': 'conversation',
            'critical-thinking': 'conversation',
            'research-challenge': 'reading',
            'presentation-master': 'conversation',
            'ethics-discussion': 'conversation',
        }
        practice_session_type = session_type_map.get(game_type, 'conversation')
        duration_minutes = max(1, int(duration_seconds / 60)) if duration_seconds > 0 else 5
        
        PracticeSession.objects.create(
            user=request.user,
            session_type=practice_session_type,
            duration_minutes=duration_minutes,
            score=score,
            points_earned=points_earned,
            words_practiced=rounds if 'word' in game_type or 'vocabulary' in game_type else 0,
            sentences_practiced=rounds if 'sentence' in game_type or 'conversation' in game_type or 'debate' in game_type else 0,
            mistakes_count=max(0, rounds - int(score / 100 * rounds)) if rounds > 0 else 0,
            details={
                'source': 'teen_kids',
                'game_type': game_type,
                'game_title': game_title,
                'game_session_id': session.id,
                'rounds': rounds,
                'difficulty': difficulty,
                'completed': completed
            }
        )
        logger.info(f"Teen game session synced to PracticeSession for user {request.user.id}")
    except Exception as e:
        logger.error(f"Failed to sync teen game session to PracticeSession: {str(e)}")
    
    # Update CategoryProgress in MySQL database
    time_minutes = round(duration_seconds / 60) if duration_seconds else 0
    update_category_progress_from_activity(
        user=request.user,
        category='teen_kids',
        points=points_earned,
        time_minutes=time_minutes,
        score=score,
        games=1 if completed else 0
    )
    
    serializer = TeenGameSessionSerializer(session)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def teen_issue_certificate(request):
    """Issue a certificate for teen user"""
    cert_id = request.data.get('cert_id')
    title = request.data.get('title', '')
    file_url = request.data.get('file_url', '')
    
    if not cert_id:
        return Response(
            {"message": "cert_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    obj, _ = TeenCertificate.objects.get_or_create(
        user=request.user,
        cert_id=cert_id,
        defaults={
            'title': title,
            'file_url': file_url,
        }
    )
    
    return Response(TeenCertificateSerializer(obj).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teen_my_certificates(request):
    """Get all certificates for teen user"""
    qs = TeenCertificate.objects.filter(user=request.user).order_by('-issued_at')
    return Response(TeenCertificateSerializer(qs, many=True).data)


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
        
        # Update CategoryProgress in MySQL database
        # Sync all data from KidsProgress to CategoryProgress
        details = obj.details or {}
        stories_completed = len([
            s for s in details.get('storyEnrollments', [])
            if s.get('completed', False)
        ])
        vocabulary_words = len(details.get('vocabulary', {}))
        pronunciation_attempts = len(details.get('pronunciation', {}))
        
        update_category_progress_from_activity(
            user=request.user,
            category='young_kids',
            points=obj.points or 0,
            streak=obj.streak or 0,
            stories=stories_completed,
            vocabulary_words=vocabulary_words,
            pronunciation_attempts=pronunciation_attempts
        )
        
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
    audience = request.data.get('audience', 'young')  # Default to 'young' for backward compatibility
    file_url = request.data.get('file_url', '')
    if not cert_id or not title:
        return Response({"message": "cert_id and title are required"}, status=status.HTTP_400_BAD_REQUEST)
    if audience not in ['young', 'teen']:
        return Response({"message": "audience must be 'young' or 'teen'"}, status=status.HTTP_400_BAD_REQUEST)
    obj, _ = KidsCertificate.objects.get_or_create(
        user=request.user, 
        cert_id=cert_id, 
        audience=audience,
        defaults={
            'title': title,
            'file_url': file_url,
            'audience': audience
        }
    )
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

    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    action_url = f"{frontend_url}/kids/certificates"
    notification_title = f"{obj.title} certificate unlocked"
    notification_message = "Your certificate is ready to download and celebrate. Keep exploring new stories!"
    create_or_update_user_notification(
        request.user,
        notification_type='certificate',
        title=notification_title,
        message=notification_message,
        icon='📜',
        action_url=action_url,
        event_key=f"certificate:{obj.cert_id}",
        metadata={
            'cert_id': obj.cert_id,
            'title': obj.title,
            'file_url': obj.file_url,
        }
    )

    return Response(KidsCertificateSerializer(obj).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_my_certificates(request):
    qs = KidsCertificate.objects.filter(user=request.user).order_by('-issued_at')
    return Response(KidsCertificateSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_unlock_trophy(request):
    """Record an unlocked trophy."""
    trophy_id = request.data.get('trophy_id')
    title = request.data.get('title')
    audience = request.data.get('audience', 'young')  # Default to 'young' for backward compatibility
    
    if not trophy_id or not title:
        return Response({"message": "trophy_id and title are required"}, status=status.HTTP_400_BAD_REQUEST)
    if audience not in ['young', 'teen']:
        return Response({"message": "audience must be 'young' or 'teen'"}, status=status.HTTP_400_BAD_REQUEST)
    
    obj, created = KidsTrophy.objects.get_or_create(
        user=request.user, 
        trophy_id=trophy_id, 
        audience=audience,
        defaults={
            'title': title,
            'audience': audience
        }
    )
    
    # Update title if provided later
    if title and obj.title != title:
        obj.title = title
        obj.save()
    
    # Create notification if newly created
    if created:
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        action_url = f"{frontend_url}/certificates"
        create_or_update_user_notification(
            request.user,
            notification_type='trophy',
            title=f"{obj.title} trophy unlocked",
            message="You just earned a trophy! Keep the momentum going!",
            icon='🏆',
            action_url=action_url,
            event_key=f"trophy:{obj.trophy_id}",
            metadata={
                'trophy_id': obj.trophy_id,
                'title': obj.title,
            }
        )
    
    return Response(KidsTrophySerializer(obj).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


# ============= Kids Story Management Endpoints =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_story_enrollments(request):
    """Get all story enrollments for the user"""
    enrollments = StoryEnrollment.objects.filter(user=request.user).order_by('-completed_at', '-created_at')
    serializer = StoryEnrollmentSerializer(enrollments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_story_enroll(request):
    """Enroll user in a story (mark as completed)"""
    story_id = request.data.get('story_id')
    story_title = request.data.get('story_title')
    story_type = request.data.get('story_type')
    score = request.data.get('score', 0)
    
    if not all([story_id, story_title, story_type]):
        return Response(
            {"message": "story_id, story_title, and story_type are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    enrollment, created = StoryEnrollment.objects.get_or_create(
        user=request.user,
        story_id=story_id,
        defaults={
            'story_title': story_title,
            'story_type': story_type,
            'completed': True,
            'completed_at': timezone.now(),
            'score': score,
            'words_extracted': True
        }
    )
    
    if not created:
        enrollment.completed = True
        enrollment.completed_at = timezone.now()
        enrollment.score = max(enrollment.score, score)
        enrollment.words_extracted = True
        enrollment.save()
    
    # Update CategoryProgress in MySQL database
    # Calculate points from story completion
    points_awarded = max(0, round(score / 10)) + 50  # Base points + completion bonus
    update_category_progress_from_activity(
        user=request.user,
        category='young_kids',
        points=points_awarded if created else 0,  # Only add points if newly completed
        score=score,
        stories=1 if created else 0
    )
    
    serializer = StoryEnrollmentSerializer(enrollment)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_story_words(request):
    """Get vocabulary words from enrolled stories"""
    story_id = request.query_params.get('story_id', None)
    
    # Get enrolled story IDs for the user
    enrollments = StoryEnrollment.objects.filter(
        user=request.user,
        completed=True,
        words_extracted=True
    )
    
    if story_id and story_id != 'all':
        enrolled_story_ids = [story_id]
    else:
        enrolled_story_ids = list(enrollments.values_list('story_id', flat=True))
    
    words = StoryWord.objects.filter(story_id__in=enrolled_story_ids).order_by('story_id', 'word')
    serializer = StoryWordSerializer(words, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kids_story_phrases(request):
    """Get phrases from enrolled stories for pronunciation practice"""
    story_id = request.query_params.get('story_id', None)
    
    # Get enrolled story IDs for the user
    enrollments = StoryEnrollment.objects.filter(
        user=request.user,
        completed=True,
        words_extracted=True
    )
    
    if story_id and story_id != 'all':
        enrolled_story_ids = [story_id]
    else:
        enrolled_story_ids = list(enrollments.values_list('story_id', flat=True))
    
    phrases = StoryPhrase.objects.filter(story_id__in=enrolled_story_ids).order_by('story_id', 'phrase')
    serializer = StoryPhraseSerializer(phrases, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def kids_favorites(request):
    """Get, add, or remove favorite stories"""
    if request.method == 'GET':
        favorites = KidsFavorite.objects.filter(user=request.user).order_by('-created_at')
        serializer = KidsFavoriteSerializer(favorites, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        story_id = request.data.get('story_id')
        if not story_id:
            return Response(
                {"message": "story_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        favorite, created = KidsFavorite.objects.get_or_create(
            user=request.user,
            story_id=story_id
        )
        serializer = KidsFavoriteSerializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        story_id = request.data.get('story_id')
        if not story_id:
            return Response(
                {"message": "story_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted = KidsFavorite.objects.filter(user=request.user, story_id=story_id).delete()
        return Response(
            {"message": "Favorite removed", "deleted": deleted[0]},
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_vocabulary_practice(request):
    """Record vocabulary word practice"""
    word = request.data.get('word')
    story_id = request.data.get('story_id', '')
    score = request.data.get('score', 100)
    
    if not word:
        return Response(
            {"message": "word is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    practice, created = KidsVocabularyPractice.objects.get_or_create(
        user=request.user,
        word=word,
        defaults={
            'story_id': story_id,
            'best_score': score,
            'attempts': 1
        }
    )
    
    if not created:
        practice.best_score = max(practice.best_score, score)
        practice.attempts += 1
        practice.save()
    
    # Update CategoryProgress in MySQL database
    points_awarded = 25 if created else 0  # Award points for new vocabulary word
    update_category_progress_from_activity(
        user=request.user,
        category='young_kids',
        points=points_awarded,
        score=score,
        vocabulary_words=1 if created else 0
    )
    
    # Also save to PracticeSession table for admin portal visibility
    try:
        PracticeSession.objects.create(
            user=request.user,
            session_type='vocabulary',
            duration_minutes=2,  # Estimated duration for vocabulary practice
            score=score,
            points_earned=points_awarded,
            words_practiced=1,
            sentences_practiced=0,
            mistakes_count=0 if score >= 80 else 1,
            details={
                'source': 'young_kids',
                'word': word,
                'story_id': story_id,
                'practice_id': practice.id,
                'is_new_word': created
            }
        )
        logger.info(f"Kids vocabulary practice synced to PracticeSession for user {request.user.id}")
    except Exception as e:
        logger.error(f"Failed to sync kids vocabulary practice to PracticeSession: {str(e)}")
    
    serializer = KidsVocabularyPracticeSerializer(practice)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def kids_pronunciation_practice(request):
    """Record pronunciation phrase practice"""
    phrase = request.data.get('phrase')
    story_id = request.data.get('story_id', '')
    score = request.data.get('score', 100)
    
    if not phrase:
        return Response(
            {"message": "phrase is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    practice, created = KidsPronunciationPractice.objects.get_or_create(
        user=request.user,
        phrase=phrase,
        defaults={
            'story_id': story_id,
            'best_score': score,
            'attempts': 1
        }
    )
    
    if not created:
        practice.best_score = max(practice.best_score, score)
        practice.attempts += 1
        practice.save()
    
    # Update CategoryProgress in MySQL database
    points_awarded = 30 if created else 0  # Award points for new pronunciation practice
    update_category_progress_from_activity(
        user=request.user,
        category='young_kids',
        points=points_awarded,
        score=score,
        pronunciation_attempts=1 if created else 0
    )
    
    # Also save to PracticeSession table for admin portal visibility
    try:
        PracticeSession.objects.create(
            user=request.user,
            session_type='pronunciation',
            duration_minutes=3,  # Estimated duration for pronunciation practice
            score=score,
            points_earned=points_awarded,
            words_practiced=0,
            sentences_practiced=1,
            mistakes_count=0 if score >= 80 else 1,
            details={
                'source': 'young_kids',
                'phrase': phrase[:100],  # Truncate if too long
                'story_id': story_id,
                'practice_id': practice.id,
                'is_new_phrase': created
            }
        )
        logger.info(f"Kids pronunciation practice synced to PracticeSession for user {request.user.id}")
    except Exception as e:
        logger.error(f"Failed to sync kids pronunciation practice to PracticeSession: {str(e)}")
    
    serializer = KidsPronunciationPracticeSerializer(practice)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def kids_game_session(request):
    """Get, record, or delete a game session"""
    if request.method == 'GET':
        # Get all game sessions for the user
        sessions = KidsGameSession.objects.filter(user=request.user).order_by('-created_at')
        serializer = KidsGameSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    if request.method == 'DELETE':
        # Delete a game session (history only, points are preserved)
        session_id = request.data.get('session_id') or request.query_params.get('session_id')
        if not session_id:
            return Response(
                {"message": "session_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Extract numeric ID if it's in format "server-123"
            numeric_id = int(session_id.replace('server-', '')) if isinstance(session_id, str) and session_id.startswith('server-') else int(session_id)
            session = KidsGameSession.objects.get(id=numeric_id, user=request.user)
            
            # Delete the session (history only - points are stored separately in CategoryProgress)
            session.delete()
            
            logger.info(f"Game session {numeric_id} deleted for user {request.user.id} (points preserved)")
            return Response(
                {"message": "Game session deleted successfully (points preserved)"},
                status=status.HTTP_200_OK
            )
        except KidsGameSession.DoesNotExist:
            return Response(
                {"message": "Game session not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError:
            return Response(
                {"message": "Invalid session_id format"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # POST - Record a game session
    game_type = request.data.get('game_type')
    game_title = request.data.get('game_title', '')
    score = request.data.get('score', 0)
    points_earned = request.data.get('points_earned', 0)
    rounds = request.data.get('rounds', 0)
    difficulty = request.data.get('difficulty', 'beginner')
    duration_seconds = request.data.get('duration_seconds', 0)
    completed = request.data.get('completed', False)
    details = request.data.get('details', {})
    
    if not game_type:
        return Response(
            {"message": "game_type is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    session = KidsGameSession.objects.create(
        user=request.user,
        game_type=game_type,
        game_title=game_title,
        score=score,
        points_earned=points_earned,
        rounds=rounds,
        difficulty=difficulty,
        duration_seconds=duration_seconds,
        completed=completed,
        details=details
    )
    
    # Also save to PracticeSession table for admin portal visibility
    try:
        # Map game types to session types
        session_type_map = {
            'pronunciation-challenge': 'pronunciation',
            'conversation-practice': 'conversation',
            'word-chain': 'vocabulary',
            'tongue-twister': 'pronunciation',
            'rhyme': 'vocabulary',
            'sentence': 'grammar',
            'echo': 'pronunciation',
            'memory': 'vocabulary',
            'word_match': 'vocabulary',
        }
        practice_session_type = session_type_map.get(game_type, 'conversation')
        duration_minutes = max(1, int(duration_seconds / 60)) if duration_seconds > 0 else 5
        
        PracticeSession.objects.create(
            user=request.user,
            session_type=practice_session_type,
            duration_minutes=duration_minutes,
            score=score,
            points_earned=points_earned,
            words_practiced=rounds if 'word' in game_type or 'vocabulary' in game_type else 0,
            sentences_practiced=rounds if 'sentence' in game_type or 'conversation' in game_type else 0,
            mistakes_count=max(0, rounds - int(score / 100 * rounds)) if rounds > 0 else 0,
            details={
                'source': 'young_kids',
                'game_type': game_type,
                'game_title': game_title,
                'game_session_id': session.id,
                'rounds': rounds,
                'difficulty': difficulty,
                'completed': completed
            }
        )
        logger.info(f"Kids game session synced to PracticeSession for user {request.user.id}")
    except Exception as e:
        logger.error(f"Failed to sync kids game session to PracticeSession: {str(e)}")
    
    # Update CategoryProgress in MySQL database
    time_minutes = round(duration_seconds / 60) if duration_seconds else 0
    update_category_progress_from_activity(
        user=request.user,
        category='young_kids',
        points=points_earned,
        time_minutes=time_minutes,
        score=score,
        games=1 if completed else 0
    )
    
    serializer = KidsGameSessionSerializer(session)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def kids_game_session_delete(request, session_id):
    """Delete a game session (history only, points are preserved)"""
    try:
        session = KidsGameSession.objects.get(id=session_id, user=request.user)
        
        # Delete the session (history only - points are stored separately in CategoryProgress)
        session.delete()
        
        logger.info(f"Game session {session_id} deleted for user {request.user.id} (points preserved)")
        return Response(
            {"message": "Game session deleted successfully (points preserved)"},
            status=status.HTTP_200_OK
        )
    except KidsGameSession.DoesNotExist:
        return Response(
            {"message": "Game session not found"},
            status=status.HTTP_404_NOT_FOUND
        )


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
        
        # Determine age group for more targeted prompts
        if age <= 6:
            age_group = "preschool/kindergarten"
            complexity = "very simple"
        elif age <= 8:
            age_group = "early elementary"
            complexity = "simple"
        else:
            age_group = "elementary"
            complexity = "moderate"
        
        base_prompt = f"""You are a warm, friendly, and encouraging AI teacher playing fun educational games with a {age}-year-old child (age group: {age_group}) learning English. The child's level is {level}. 

CRITICAL GUIDELINES:
- Use ONLY {complexity} words and short sentences appropriate for ages 4-10
- Be EXTREMELY patient, positive, and enthusiastic - use exclamation marks for excitement!
- Speak like you're talking to a friend, not a teacher - be fun and playful
- LISTEN carefully to what the child says and UNDERSTAND THE MEANING, even if grammar isn't perfect
- Always respond naturally and conversationally - never sound robotic
- Vary your questions and content - don't repeat the same prompts
- IMPORTANT: Do NOT use any emojis (no 🎉, 🌟, 🎤, 👋, 🤔, etc.) - emojis will be read aloud and sound strange
- IMPORTANT: Do NOT use any markdown formatting like **, *, __, _, `, # etc. Use only plain text.
- NEVER wrap your JSON response in code blocks (no ```json or ```). Return pure JSON only.
- Always return valid JSON that can be parsed directly"""
        
        # Game-specific prompts - comprehensive and age-appropriate for 4-10 year olds
        game_prompts = {
            'tongue-twister': f"""{base_prompt}

You are playing a FUN Tongue Twister game with a {age}-year-old child. Make it exciting and playful!

AGE-APPROPRIATE TONGUE TWISTERS:
- For ages 4-5: "Red bug, red bug" / "Big pig, big pig" / "Fun sun, fun sun" / "Cat hat, cat hat" / "Dog log, dog log"
- For ages 6-7: "Red lorry, yellow lorry" / "Toy boat, toy boat" / "Big bug bit" / "Sheep sleep" / "Fish wish"
- For ages 8-9: "She sells seashells" / "Peter Piper picked" / "How much wood" / "Betty Botter bought" / "Fuzzy Wuzzy was"
- For ages 9-10: "Six slippery snails" / "Unique New York" / "Three free throws" / "Red leather, yellow leather"

VARIETY IS KEY - Use different tongue twisters each time! Rotate through:
- Animal tongue twisters (cats, dogs, pigs, bugs, fish)
- Color tongue twisters (red, yellow, blue, green)
- Food tongue twisters (cookies, cakes, bread)
- Action tongue twisters (run, jump, play, swim)
- Nature tongue twisters (sun, moon, stars, trees)

GAME FLOW:
1. First, introduce the tongue twister with excitement: "Ready for a fun challenge? Here's your tongue twister: [phrase]! Try saying it 3 times fast!"
2. After the child attempts it, give SPECIFIC, ENCOURAGING feedback:
   - If they did well: "Wow! You said that so clearly! Great job!"
   - If they struggled: "Good try! Let's practice together. Say it slowly: [word by word breakdown]"
   - Always be positive and supportive

GAME ENDING:
- The game automatically ends after 8 minutes of play time from when the user started
- If the child asks to end the game (says things like "end game", "finish", "stop", "done", "done for today", "I'm done", "let's stop", "finish game", "end this game"), you should END THE GAME immediately
- When ending the game (either by time or user request), give a warm, encouraging summary: "Great job practicing today! You did amazing with [number] tongue twisters! We'll play again soon!"
- Set "gameEnd": true in your JSON response when ending the game

IMPORTANT: Award points (15-50) ONLY AFTER the child attempts the tongue twister, NOT when giving the initial tongue twister.
IMPORTANT: Do NOT use any emojis in your responses - they will be read aloud and sound strange.

Format your response as JSON:
For first prompt: {{ "content": "Ready for a fun challenge? Here's your tongue twister: [age-appropriate phrase]! Try saying it 3 times fast!", "gameInstruction": "Say this tongue twister 3 times: [phrase]" }}
After child attempts: {{ "content": "[Encouraging, specific feedback WITHOUT emojis]", "points": [15-50 based on performance], "feedback": "[Additional encouragement]" }}
When ending game: {{ "content": "[Warm ending message summarizing their progress]", "gameEnd": true, "points": [final points] }}""",
            
            'word-chain': f"""{base_prompt}

You are playing an EXCITING Word Chain game with a {age}-year-old child. Make it like a fun word adventure!

AGE-APPROPRIATE WORD CATEGORIES:
- For ages 4-6: Simple nouns (cat, dog, sun, moon, ball, car, hat, cup, toy, boy, girl, mom, dad)
- For ages 7-8: Common words (bird, tree, fish, book, bus, bag, box, pig, cow, duck, frog, bee)
- For ages 9-10: More varied vocabulary (animal, color, food, friend, happy, school, water, flower, music, dance)

VARIETY IS KEY - Use different word categories each round:
- Animals: cat → tiger → rabbit → turtle → elephant
- Colors: red → dark → king → green → night
- Food: apple → egg → grape → eat → tomato
- Nature: sun → nest → tree → earth → house
- Actions: run → nap → play → yes → swim
- Body parts: hand → dog → girl → leg → game
- Toys: ball → leg → game → egg → gift

GAME FLOW:
1. Start with an exciting word: "Let's play Word Chain! I'll say a word, then you say a word that starts with the last letter! Ready? My word is: [word]! What word starts with [letter]?"
2. After each word, celebrate and continue: "Awesome! [Their word] ends with [letter], so I'll say [new word]! Now you say a word starting with [new letter]!"
3. Keep the energy high and make it feel like a game, not a test

GAME ENDING:
- The game automatically ends after 8 minutes of play time from when the user started
- If the child asks to end the game (says things like "end game", "finish", "stop", "done", "done for today", "I'm done", "let's stop", "finish game", "end this game"), you should END THE GAME immediately
- When ending the game (either by time or user request), give a warm, encouraging summary: "Wonderful word chain game! You connected [number] words together! Great vocabulary practice!"
- Set "gameEnd": true in your JSON response when ending the game

IMPORTANT: Always award points (20-45) for correct word chains. If they make a mistake, gently help: "Hmm, that word starts with [letter], but we need a word starting with [correct letter]. Can you think of one?"
IMPORTANT: Do NOT use any emojis in your responses - they will be read aloud and sound strange.

Format your response as JSON:
{{ "gameInstruction": "Say a word starting with the letter [X]", "content": "Great! I said [word]. Now you say a word starting with [letter]! What can you think of?", "feedback": "Excellent! That's a perfect word!", "points": 30 }}
When ending game: {{ "content": "[Warm ending message summarizing their progress]", "gameEnd": true, "points": [final points] }}""",
            
            'story-telling': f"""{base_prompt}

You are playing a CREATIVE Story Telling game with a {age}-year-old child. Make storytelling magical and fun!

STORY THEMES TO ROTATE (age-appropriate):
- For ages 4-6: Talking animals, magical toys, friendly monsters, colorful adventures, simple quests
- For ages 7-8: Superhero adventures, space explorers, underwater worlds, treasure hunts, time travel
- For ages 9-10: Mystery solving, fantasy kingdoms, science experiments, friendship stories, discovery quests

STORY STARTER IDEAS (vary each time):
1. "Once upon a time, there was a little [animal/character] who loved [activity]. One sunny day, [character] discovered..."
2. "In a magical forest, a brave [character] found a mysterious [object]. When [character] touched it..."
3. "Deep in the ocean, a friendly [sea creature] was looking for [something]. Suddenly, [character] saw..."
4. "On a faraway planet, a curious [character] met a [creature]. Together, they decided to..."
5. "In a magical garden, a tiny [character] found a glowing [object]. The [object] could..."

STORY ELEMENTS TO INCLUDE:
- Characters: animals, kids, magical creatures, superheroes, robots, fairies, dinosaurs
- Settings: forests, oceans, space, castles, gardens, schools, playgrounds, magical lands
- Problems: finding something, helping a friend, solving a puzzle, going on an adventure, learning something new
- Solutions: working together, being brave, using creativity, asking for help, discovering something special

GAME FLOW:
1. Start with an exciting story beginning (2-3 sentences max): "Let me start a magical story for you! [Story beginning with simple words]"
2. Ask engaging questions: "What happens next? What does [character] do? What do you think [character] finds?"
3. Build on their ideas: "Wow! That's so creative! So [character] [their idea]... and then what?"
4. Keep the story flowing naturally - don't correct grammar harshly, just model correct language

GAME ENDING:
- The game automatically ends after 8 minutes of play time from when the user started
- If the child asks to end the game (says things like "end game", "finish", "stop", "done", "done for today", "I'm done", "let's stop", "finish game", "end this game"), you should END THE GAME immediately
- When ending the game (either by time or user request), give a warm, encouraging summary: "What an amazing story we created together! You're such a creative storyteller! Let's save this story and continue another time!"
- Set "gameEnd": true in your JSON response when ending the game

IMPORTANT: Always award points (25-50) for creative story contributions. Celebrate their imagination!
IMPORTANT: Do NOT use any emojis in your responses - they will be read aloud and sound strange.

Format your response as JSON:
{{ "gameInstruction": "Continue the story! What happens next?", "content": "Once upon a time, there was a brave little [character] who loved [activity]. One day, [character] went on an adventure to [place] and discovered something amazing... What do you think [character] found?", "nextStep": "Tell me what happens next in the story!", "feedback": "What an exciting story! I love your creativity!", "points": 40 }}
When ending game: {{ "content": "[Warm ending message summarizing their story]", "gameEnd": true, "points": [final points] }}""",
            
            'pronunciation-challenge': f"""{base_prompt}

You are playing a FUN Pronunciation Challenge game with a {age}-year-old child. Make it feel like a game, not a test!

AGE-APPROPRIATE WORD LISTS (rotate through different categories):

For ages 4-6 (Beginner - CVC words):
- Animals: Cat, Dog, Pig, Cow, Duck, Bee, Ant, Bug
- Objects: Ball, Car, Bus, Cup, Hat, Bag, Box, Pen, Key, Toy
- Actions: Run, Jump, Hop, Sit, Stand, Clap, Wave
- Colors: Red, Blue, Green, Yellow, Pink, Black, White
- Body: Hand, Foot, Eye, Ear, Nose, Leg, Arm

For ages 7-8 (Intermediate):
- Animals: Bird, Fish, Frog, Bear, Lion, Tiger, Rabbit, Turtle
- Objects: Book, Tree, Star, Moon, Sun, Flower, Water, Music
- Actions: Dance, Sing, Play, Read, Write, Draw, Swim, Fly
- Nature: Cloud, Rain, Wind, Snow, Fire, Earth, Sky, Ocean
- Food: Apple, Bread, Cookie, Candy, Pizza, Banana, Orange

For ages 9-10 (Advanced - challenging sounds):
- Th sounds: Three, Thumb, Think, Thank, Throw, Through
- Ch sounds: Chair, Cheese, Church, Choose, Change
- Sh sounds: Shoe, Ship, Shop, Shine, Share, Shout
- R blends: Frog, Tree, Train, Truck, Brush, Crash
- L blends: Blue, Clap, Flag, Glass, Plant, Slide

VARIETY IS KEY - Rotate through:
- Different word categories (animals, colors, actions, objects, nature)
- Different sound patterns (beginning sounds, ending sounds, blends)
- Different difficulty levels based on their performance

GAME FLOW:
1. Introduce the word with excitement: "Let's practice saying this word: [WORD]! Can you say it 3 times? Ready? [WORD]!"
2. After they attempt, give SPECIFIC feedback:
   - If correct: "Perfect! You said [word] so clearly! Great pronunciation!"
   - If needs work: "Good try! Let's practice together. Say it slowly: [break down sounds]. Now try again!"
   - Always be encouraging and break words into sounds if needed

GAME ENDING:
- The game automatically ends after 8 minutes of play time from when the user started
- If the child asks to end the game (says things like "end game", "finish", "stop", "done", "done for today", "I'm done", "let's stop", "finish game", "end this game"), you should END THE GAME immediately
- When ending the game (either by time or user request), give a warm, encouraging summary: "Excellent pronunciation practice today! You practiced [number] words and your speaking is getting better and better!"
- Set "gameEnd": true in your JSON response when ending the game

IMPORTANT: ONLY award points (15-45) AFTER hearing the child's pronunciation attempt. For the INITIAL prompt, give the word WITHOUT feedback or points.
IMPORTANT: Do NOT use any emojis in your responses - they will be read aloud and sound strange.

Format your response as JSON:
For initial word: {{ "gameInstruction": "Say this word 3 times clearly", "content": "Let's practice pronunciation! Here's your word: [WORD]! Can you say it 3 times? Ready? [WORD]!" }}
After child speaks: {{ "content": "[Specific, encouraging feedback about their pronunciation WITHOUT emojis]", "feedback": "[Additional tips if needed]", "points": [15-45 based on quality] }}
When ending game: {{ "content": "[Warm ending message summarizing their progress]", "gameEnd": true, "points": [final points] }}""",
            
            'conversation-practice': f"""{base_prompt}

You are having a WARM, FRIENDLY conversation with a {age}-year-old child. Make it feel like chatting with a friend!

CONVERSATION TOPICS TO ROTATE (age-appropriate):

For ages 4-6:
- Favorite things: "What's your favorite color? What's your favorite animal? What's your favorite food?"
- Daily life: "What did you do today? What's your favorite toy? Do you have a pet?"
- Family: "Tell me about your family! Do you have brothers or sisters? What do you like to do with your family?"
- Play: "What games do you like to play? What's your favorite thing to do outside? Do you like to draw?"

For ages 7-8:
- Interests: "What's your favorite subject in school? What sports do you like? What's your favorite book or movie?"
- Friends: "Tell me about your friends! What do you like to do together? What makes a good friend?"
- Hobbies: "What do you like to do in your free time? Do you play any instruments? What's your favorite hobby?"
- Dreams: "What do you want to be when you grow up? If you could have any superpower, what would it be?"

For ages 9-10:
- School: "What's your favorite subject? What's the most interesting thing you learned recently? What do you like about school?"
- Activities: "What clubs or activities are you in? What's your favorite sport or game? What do you do on weekends?"
- Opinions: "What's your favorite book and why? What's the best movie you've seen? What makes you happy?"
- Future: "What are you excited about? What would you like to learn? What's your biggest dream?"

VARIETY IS KEY - Ask different questions each time:
- Mix personal questions with creative questions
- Ask follow-up questions based on their answers
- Show genuine interest in their responses
- Connect their answers to new questions

GAME FLOW:
1. Start with an enthusiastic greeting and question: "Hi there! I'm so excited to chat with you! Let me ask you something fun: [question]"
2. Listen carefully to their response and show interest: "Wow, that's so cool! Tell me more about [their answer]!"
3. Ask follow-up questions naturally: "That sounds amazing! What do you like most about [their answer]?"
4. Keep the conversation flowing - don't just ask questions, share reactions and build on their answers

GAME ENDING:
- The game automatically ends after 8 minutes of play time from when the user started
- If the child asks to end the game (says things like "end game", "finish", "stop", "done", "done for today", "I'm done", "let's stop", "finish game", "end this game"), you should END THE GAME immediately
- When ending the game (either by time or user request), give a warm, encouraging summary: "It was so nice chatting with you today! You shared such interesting things! Let's talk again soon!"
- Set "gameEnd": true in your JSON response when ending the game

IMPORTANT: Always award points (20-40) for engaging responses. Understand their meaning even if grammar isn't perfect. Gently model correct language without being critical.
IMPORTANT: Do NOT use any emojis in your responses - they will be read aloud and sound strange.

Format your response as JSON:
{{ "content": "Hi there! I'm so excited to chat with you! Let me ask you something fun: [age-appropriate question]? What do you think?", "feedback": "That's so interesting! Tell me more!", "points": 25 }}
When ending game: {{ "content": "[Warm ending message]", "gameEnd": true, "points": [final points] }}""",

            'debate-club': f"""{base_prompt}

You are coaching a DEBATE CLUB style conversation for a {age}-year-old learner (upper elementary / early teen).

FLOW:
1. Introduce the motion and clearly explain what "for" and "against" mean.
2. Ask the learner to pick a side (or assign them one) and give 2 reasons.
3. Offer a counterargument and invite a rebuttal.
4. Encourage them to summarize their stance with a confident closing sentence.

COACHING STYLE:
- Encourage evidence, examples, or personal experiences.
- Suggest advanced vocabulary ("beneficial", "consequence", "perspective").
- Stay positive; phrase corrections as questions: "What about...?"

POINTS:
- Award 25-45 points for clear arguments, creative rebuttals, or thoughtful conclusions.
- Give bonus points for empathy ("I understand the other side...").

ENDING:
- Summarize their strongest point and suggest one improvement for next time.
- Set "gameEnd": true when ending.

FORMAT:
{{ "gameInstruction": "Argue FOR longer school breaks.", "content": "Here’s your topic...", "feedback": "Great reasoning because...", "points": 35 }}""",

            'critical-thinking': f"""{base_prompt}

You are facilitating a CRITICAL THINKING challenge for a {age}-year-old learner ready for deeper puzzles.

FLOW:
1. Present a short scenario or puzzle that needs logic, prediction, or strategy.
2. Ask them to explain their reasoning, not just the answer.
3. Offer a twist (new evidence, different rule, another viewpoint) to extend thinking.
4. Celebrate creative reasoning and ask reflective questions.

POINTS:
- Award 20-40 points based on clarity, creativity, and persistence.
- Provide hints rather than saying "wrong".

ENDING:
- Summarize the strategies they used and suggest another brain teaser for later.

FORMAT:
{{ "content": "Puzzle: You have two ropes that each take 1 hour to burn...", "feedback": "Nice logic! You noticed...", "nextStep": "What if you had three ropes?", "points": 30 }}""",

            'research-challenge': f"""{base_prompt}

You are guiding a RESEARCH CHALLENGE for a {age}-year-old learner who wants to explore academic topics.

FLOW:
1. Present a concise research prompt (space travel, renewable energy, famous inventions).
2. Ask what they already know and what they need to find out.
3. Provide key facts (mention sources or credible organizations) and ask them to structure the info (intro → evidence → conclusion).
4. Encourage them to include one statistic or quote.

POINTS:
- Award 25-45 points for organized summaries, clear evidence, or thoughtful comparisons.

ENDING:
- Suggest a follow-up question or a source to read later.

FORMAT:
{{ "gameInstruction": "Explain why coral reefs matter.", "content": "Start with why they are important...", "feedback": "Great use of evidence!", "points": 35 }}""",

            'presentation-master': f"""{base_prompt}

You are coaching a PRESENTATION MASTER session for a {age}-year-old learner preparing speeches or pitches.

FLOW:
1. Ask for topic and audience.
2. Help craft a powerful hook, organize 2-3 key points, and end with a memorable call-to-action.
3. Give feedback on tone, pacing, vocabulary, and transitions.
4. Encourage them to repeat improved sentences in their own voice.

POINTS:
- Award 20-40 points per section for structure, clarity, and confidence.

ENDING:
- Highlight strengths and provide one actionable improvement.

FORMAT:
{{ "gameInstruction": "Give your opening hook about green energy.", "content": "Try starting with a surprising fact...", "feedback": "Fantastic energy! Next, outline two key points.", "points": 30 }}""",

            'ethics-discussion': f"""{base_prompt}

You are hosting an ETHICS DISCUSSION for a {age}-year-old learner exploring values and choices.

FLOW:
1. Present an age-appropriate dilemma (AI art ownership, social media privacy, fair play in sports).
2. Ask who benefits, who might be harmed, and what values conflict.
3. Encourage them to explore multiple sides before choosing a stance.
4. Use “What if...?” prompts to deepen empathy and reasoning.

POINTS:
- Award 25-40 points for nuanced reasoning, empathy, or creative compromises.

ENDING:
- Summarize their viewpoint and suggest a reflective journal prompt.

FORMAT:
{{ "content": "Scenario: Your school wants AI to grade essays...", "feedback": "Thoughtful point about fairness!", "nextStep": "Consider how teachers might feel.", "points": 35 }}""",

            'innovation-lab': f"""{base_prompt}

You are running an INNOVATION LAB challenge for a {age}-year-old learner ready to design solutions.

FLOW:
1. Present a problem to solve (reduce cafeteria waste, build a focus gadget, design a greener city).
2. Ask them to describe users, features, and what makes the idea unique.
3. Encourage iteration ("How would version 2.0 be better?").
4. Invite them to pitch the idea in two sentences.

POINTS:
- Award 25-45 points for originality, empathy for users, or practical thinking.

ENDING:
- Summarize why the idea matters and suggest a prototype step.

FORMAT:
{{ "gameInstruction": "Invent a tool that helps teens stay organized.", "content": "Describe the features, users, and how it helps.", "feedback": "Great idea! Consider adding...", "points": 40 }}""",

            'leadership-challenge': f"""{base_prompt}

You are guiding a LEADERSHIP CHALLENGE scenario for a {age}-year-old learner.

FLOW:
1. Present the leadership situation (leading a club, managing a project, resolving a conflict).
2. Ask what leadership style they would use and why.
3. Introduce hurdles (time crunch, disagreements, limited resources) and ask how they'd respond.
4. Encourage reflection on lessons learned and how they'd support teammates.

POINTS:
- Award 20-40 points for thoughtful decisions, empathy, and clear plans.

ENDING:
- Highlight their leadership strengths and suggest one new strategy to try.

FORMAT:
{{ "content": "Scenario: You lead the robotics team and two members disagree...", "feedback": "Great idea to hold a listening session.", "nextStep": "How will you assign tasks afterward?", "points": 30 }}"""
        }
        
        system_prompt = game_prompts.get(game_type, base_prompt)
        
        # Build user message - initial prompts for each game type (varied and age-appropriate)
        if not user_input:
            # Vary initial prompts to keep games fresh and engaging
            tongue_twister_prompts = [
                "Hi! I'm ready to play tongue twisters! Give me a fun one that's perfect for kids my age!",
                "Yay! Tongue twisters are so fun! Can you give me a cool one to practice?",
                "Hello! Let's play tongue twisters! I'm excited to try a new one!",
                "Hi there! I love tongue twisters! Give me a fun challenge!",
                "Ready to play! Give me an awesome tongue twister to practice!"
            ]
            
            word_chain_prompts = [
                "Hi! Let's play word chain! I'm ready to connect words together!",
                "Yay! Word chain is my favorite! Give me a word to start!",
                "Hello! Let's play word chain! What word should we begin with?",
                "Hi there! I'm excited to play word chain! Give me a simple word!",
                "Ready! Let's play word chain! What's our first word?"
            ]
            
            story_telling_prompts = [
                "Hi! Let's create an amazing story together! Start something exciting!",
                "Yay! Story time! Can you start a magical adventure for me?",
                "Hello! I love stories! Let's make up a fun one together!",
                "Hi there! Let's tell a story! Start with something cool!",
                "Ready! I want to hear a story! Can you begin an adventure?"
            ]
            
            pronunciation_prompts = [
                "Hi! Let's practice pronunciation! Give me a word to practice saying!",
                "Yay! Pronunciation practice! What word should I try?",
                "Hello! I'm ready to practice! Give me a fun word!",
                "Hi there! Let's practice saying words! What should I try?",
                "Ready! I want to practice pronunciation! Give me a word!"
            ]
            
            conversation_prompts = [
                "Hi! Let's have a fun chat! Ask me something interesting!",
                "Yay! I love talking! What would you like to know about me?",
                "Hello! Let's chat! Ask me a fun question!",
                "Hi there! I'm excited to talk! What do you want to know?",
                "Ready! Let's have a conversation! Ask me something cool!"
            ]
            
            debate_prompts = [
                "Give me a debate topic and tell me which side to take!",
                "I'm ready to debate! What's the motion today?",
                "Coach me through a quick debate topic!"
            ]
            
            critical_prompts = [
                "Challenge me with a tricky scenario that needs logical thinking!",
                "Give me a brain teaser or a puzzle to solve!",
                "I'm ready for a critical thinking question!"
            ]
            
            research_prompts = [
                "Assign me a quick research topic to summarize!",
                "Give me something interesting to research and explain!",
                "What's a science or tech topic I can break down?"
            ]
            
            presentation_prompts = [
                "Help me rehearse a presentation opening!",
                "I need to practice a speech—can you guide me?",
                "Coach me through presenting a project!"
            ]
            
            ethics_prompts = [
                "Give me an ethics dilemma to think about.",
                "Let's discuss a tricky decision with pros and cons!",
                "What values are in conflict in this situation?"
            ]
            
            innovation_prompts = [
                "Challenge me to invent something new!",
                "Give me a problem to solve with a creative product.",
                "Let's design the next big idea—what's the mission?"
            ]
            
            leadership_prompts = [
                "Give me a leadership scenario to solve!",
                "I'm ready to manage a team challenge—what's happening?",
                "Coach me through a leadership dilemma."
            ]
            
            initial_prompts = {
                'tongue-twister': random.choice(tongue_twister_prompts),
                'word-chain': random.choice(word_chain_prompts),
                'story-telling': random.choice(story_telling_prompts),
                'pronunciation-challenge': random.choice(pronunciation_prompts),
                'conversation-practice': random.choice(conversation_prompts),
                'debate-club': random.choice(debate_prompts),
                'critical-thinking': random.choice(critical_prompts),
                'research-challenge': random.choice(research_prompts),
                'presentation-master': random.choice(presentation_prompts),
                'ethics-discussion': random.choice(ethics_prompts),
                'innovation-lab': random.choice(innovation_prompts),
                'leadership-challenge': random.choice(leadership_prompts)
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
                    "message": "Your Gamer temporarily unavailable. Please try again later.",
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
                was_unlocked = ach.unlocked
                serializer = KidsAchievementSerializer(ach, data=data, partial=True)
                if serializer.is_valid():
                    updated_achievement = serializer.save()
                    result = {
                        'entity': 'KidsAchievement',
                        'entity_id': ach.id,
                        'operation': 'created' if created else 'updated',
                        'data': serializer.data
                    }
                    target = updated_achievement if isinstance(updated_achievement, KidsAchievement) else ach
                    is_now_unlocked = bool(target.unlocked)
                    if not was_unlocked and is_now_unlocked:
                        slug = slugify(target.name or 'achievement')
                        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
                        action_url = f"{frontend_url}/profile#overview"
                        notification_title = f"{target.name} achievement unlocked"
                        notification_message = "Fantastic progress! You've just unlocked a new achievement — keep the momentum going."
                        create_or_update_user_notification(
                            request.user,
                            notification_type='achievement',
                            title=notification_title,
                            message=notification_message,
                            icon=target.icon or '🌟',
                            action_url=action_url,
                            event_key=f"achievement:{slug}",
                            metadata={
                                'name': target.name,
                                'progress': target.progress,
                                'icon': target.icon,
                            }
                        )
        
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


# ============= Privacy & Compliance =============
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def cookie_consent_view(request):
    """Retrieve or persist cookie consent preferences."""
    try:
        if request.method == 'GET':
            consent_id = (request.query_params.get('consent_id') or '').strip()

            if not consent_id and not request.user.is_authenticated:
                return Response({
                    "message": "consent_id is required for anonymous users."
                }, status=status.HTTP_400_BAD_REQUEST)

            consent = None
            if consent_id:
                consent = CookieConsent.objects.filter(consent_id=consent_id).first()

            if not consent and request.user.is_authenticated:
                consent = (
                    CookieConsent.objects.filter(user=request.user)
                    .order_by('-updated_at')
                    .first()
                )

            if not consent:
                return Response({
                    "consent_id": consent_id,
                    "accepted": False,
                    "preferences": {
                        "functional": True,
                        "statistics": False,
                        "marketing": False,
                    },
                    "accepted_at": None,
                    "created_at": None,
                    "updated_at": None,
                }, status=status.HTTP_200_OK)

            serializer = CookieConsentDetailSerializer(consent)
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = CookieConsentPreferencesSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "message": "Validation error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        preferences = data['preferences']
        consent_id = data['consent_id']
        accepted = data.get('accepted', True)

        forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
        ip_candidates = [ip.strip() for ip in forwarded_for.split(',') if ip.strip()]
        ip_address = ip_candidates[0] if ip_candidates else request.META.get('REMOTE_ADDR')

        user_agent = (request.META.get('HTTP_USER_AGENT') or '')[:512]

        consent, created = CookieConsent.objects.get_or_create(
            consent_id=consent_id,
            defaults={
                'accepted': accepted,
                'functional': True,
                'statistics': preferences['statistics'],
                'marketing': preferences['marketing'],
                'accepted_at': timezone.now() if accepted else None,
                'user_agent': user_agent,
                'ip_address': ip_address,
            }
        )

        if not created:
            consent.accepted = accepted
            consent.statistics = preferences['statistics']
            consent.marketing = preferences['marketing']
            consent.accepted_at = timezone.now() if accepted else None
            consent.user_agent = user_agent
            consent.ip_address = ip_address

        if request.user.is_authenticated:
            consent.user = request.user

        consent.save()

        serializer = CookieConsentDetailSerializer(consent)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as exc:
        logger.error("Cookie consent error: %s", exc, exc_info=True)
        return Response({
            "message": "Unable to process cookie consent at this time.",
            "error": str(exc)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Admin Views =============
def is_admin_user(user):
    """Check if user is admin/staff"""
    return user.is_authenticated and (user.is_staff or user.is_superuser)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def admin_settings(request):
    """Get or update platform settings (admin only)."""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)

    settings_obj, _ = PlatformSettings.objects.get_or_create(id=1)

    if request.method == 'GET':
        serializer = PlatformSettingsSerializer(settings_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = PlatformSettingsSerializer(settings_obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({
        'message': 'Validation error',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_avatar_upload(request):
    """Upload or remove admin profile avatar"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        if request.method == 'POST':
            # Handle avatar upload - accept base64 or URL
            avatar_data = request.data.get('avatar')
            
            if not avatar_data:
                return Response({
                    'message': 'Avatar data is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate base64 data format (should start with data:image)
            if isinstance(avatar_data, str) and avatar_data.startswith('data:image'):
                # Truncate if too long (max 255 chars for CharField, but we'll store full base64)
                # For now, we'll store the full base64 data
                # In production, you might want to save to a file and store the URL
                profile.avatar = avatar_data
                profile.save()
                
                logger.info(f"Avatar uploaded for admin user {request.user.username}")
                
                return Response({
                    'message': 'Avatar updated successfully',
                    'avatar': profile.avatar
                }, status=status.HTTP_200_OK)
            else:
                # If it's a URL, store it directly
                profile.avatar = avatar_data
                profile.save()
                
                return Response({
                    'message': 'Avatar updated successfully',
                    'avatar': profile.avatar
                }, status=status.HTTP_200_OK)
        
        elif request.method == 'DELETE':
            # Remove avatar
            profile.avatar = None
            profile.save()
            
            logger.info(f"Avatar removed for admin user {request.user.username}")
            
            return Response({
                'message': 'Avatar removed successfully'
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Avatar upload error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred while processing avatar",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_activity_detail(request, activity_id):
    """Get detailed information for a specific activity (user registration or lesson progress)"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Parse activity ID to determine type (user_{id} or progress_{id})
        activity_data = None
        
        if activity_id.startswith('user_'):
            # User registration activity
            try:
                user_id = int(activity_id.replace('user_', ''))
                user = User.objects.select_related('profile').get(id=user_id)
                
                profile = getattr(user, 'profile', None)
                
                # Determine status
                if user.is_active and profile and hasattr(profile, 'survey_completed_at') and profile.survey_completed_at:
                    user_status = 'completed'
                elif user.is_active:
                    user_status = 'in_process'
                elif not user.is_active:
                    user_status = 'need_info'
                else:
                    user_status = 'unassigned'
                
                # Get user's lesson progress summary
                lesson_progress_count = LessonProgress.objects.filter(user=user).count()
                completed_lessons = LessonProgress.objects.filter(user=user, completed=True).count()
                total_score = LessonProgress.objects.filter(user=user).aggregate(
                    avg_score=Avg('score')
                )['avg_score'] or 0
                
                # Get practice sessions summary
                practice_sessions = PracticeSession.objects.filter(user=user)
                total_practice_time = practice_sessions.aggregate(
                    total=Sum('duration_minutes')
                )['total'] or 0
                total_practice_sessions = practice_sessions.count()
                
                activity_data = {
                    'id': activity_id,
                    'type': 'user_registration',
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_active': user.is_active,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'mrn': f'USR{user.id:04d}',
                    'status': user_status,
                    'profile': {
                        'level': profile.level if profile else None,
                        'points': profile.points if profile else 0,
                        'current_streak': profile.current_streak if profile else 0,
                        'longest_streak': profile.longest_streak if profile else 0,
                        'age_range': profile.age_range if profile else None,
                        'native_language': profile.native_language if profile else None,
                        'english_level': profile.english_level if profile else None,
                        'learning_purpose': profile.learning_purpose if profile else [],
                        'interests': profile.interests if profile else [],
                        'survey_completed_at': profile.survey_completed_at.isoformat() if profile and profile.survey_completed_at else None,
                        'notifications_enabled': profile.notifications_enabled if profile else False,
                        'created_at': profile.created_at.isoformat() if profile and profile.created_at else None,
                        'updated_at': profile.updated_at.isoformat() if profile and profile.updated_at else None,
                    } if profile else None,
                    'lesson_progress': {
                        'total_lessons': lesson_progress_count,
                        'completed_lessons': completed_lessons,
                        'average_score': round(total_score, 2),
                    },
                    'practice_summary': {
                        'total_sessions': total_practice_sessions,
                        'total_time_minutes': total_practice_time,
                        'total_time_hours': round(total_practice_time / 60, 2),
                    },
                }
            except User.DoesNotExist:
                return Response({
                    "message": "User not found",
                    "error": "User not found"
                }, status=status.HTTP_404_NOT_FOUND)
            except ValueError:
                return Response({
                    "message": "Invalid activity ID format",
                    "error": "Invalid activity ID"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        elif activity_id.startswith('progress_'):
            # Lesson progress activity
            try:
                progress_id = int(activity_id.replace('progress_', ''))
                progress = LessonProgress.objects.select_related('user', 'lesson').get(id=progress_id)
                
                user = progress.user
                lesson = progress.lesson
                
                activity_data = {
                    'id': activity_id,
                    'type': 'lesson_progress',
                    'progress_id': progress.id,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    },
                    'lesson': {
                        'id': lesson.id if lesson else None,
                        'title': lesson.title if lesson else 'Unknown Lesson',
                        'slug': lesson.slug if lesson else None,
                        'lesson_type': lesson.lesson_type if lesson else None,
                        'content_type': lesson.content_type if lesson else None,
                        'difficulty_level': lesson.difficulty_level if lesson else None,
                        'duration_minutes': lesson.duration_minutes if lesson else None,
                        'description': lesson.description if lesson else None,
                    } if lesson else None,
                    'progress': {
                        'completed': progress.completed,
                        'score': progress.score,
                        'time_spent_minutes': progress.time_spent_minutes,
                        'attempts': progress.attempts,
                        'pronunciation_score': progress.pronunciation_score,
                        'fluency_score': progress.fluency_score,
                        'accuracy_score': progress.accuracy_score,
                        'grammar_score': progress.grammar_score,
                        'notes': progress.notes,
                        'details': progress.details,
                        'last_attempt': progress.last_attempt.isoformat() if progress.last_attempt else None,
                        'created_at': progress.created_at.isoformat() if progress.created_at else None,
                        'updated_at': progress.updated_at.isoformat() if progress.updated_at else None,
                    },
                    'mrn': f'LSN{lesson.id if lesson else 0:04d}',
                    'status': 'completed' if progress.completed else 'in_process',
                    'service_date': lesson.created_at.isoformat() if lesson and lesson.created_at else None,
                    'assigned_date': progress.updated_at.isoformat() if progress.updated_at else None,
                }
            except LessonProgress.DoesNotExist:
                return Response({
                    "message": "Lesson progress not found",
                    "error": "Lesson progress not found"
                }, status=status.HTTP_404_NOT_FOUND)
            except ValueError:
                return Response({
                    "message": "Invalid activity ID format",
                    "error": "Invalid activity ID"
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                "message": "Invalid activity ID format",
                "error": "Activity ID must start with 'user_' or 'progress_'"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not activity_data:
            return Response({
                "message": "Activity not found",
                "error": "Activity not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(activity_data)
    
    except Exception as e:
        logger.error(f"Admin activity detail error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred while loading activity details",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_notifications(request):
    """List notifications for the authenticated user or create a new one."""
    try:
        if request.method == 'GET':
            unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
            limit = int(request.query_params.get('limit', 50))

            queryset = UserNotification.objects.filter(user=request.user)
            if unread_only:
                queryset = queryset.filter(is_read=False)

            notifications = queryset.order_by('-created_at')[:limit]
            serializer = UserNotificationSerializer(notifications, many=True)

            unread_count = UserNotification.objects.filter(
                user=request.user,
                is_read=False
            ).count()

            return Response({
                'notifications': serializer.data,
                'unread_count': unread_count,
                'total': queryset.count()
            })

        elif request.method == 'POST':
            serializer = UserNotificationSerializer(data=request.data)
            if serializer.is_valid():
                event_key = serializer.validated_data.get('event_key', '')
                if event_key:
                    existing = UserNotification.objects.filter(
                        user=request.user,
                        event_key=event_key
                    ).first()
                    if existing:
                        updated = False
                        for field in ['title', 'message', 'icon', 'action_url', 'metadata', 'notification_type']:
                            new_value = serializer.validated_data.get(field)
                            if new_value is not None and getattr(existing, field) != new_value:
                                setattr(existing, field, new_value)
                                updated = True
                        if updated:
                            existing.save(update_fields=['title', 'message', 'icon', 'action_url', 'metadata', 'notification_type', 'updated_at'])
                        return Response(
                            UserNotificationSerializer(existing).data,
                            status=status.HTTP_200_OK
                        )

                notification = UserNotification.objects.create(
                    user=request.user,
                    **serializer.validated_data
                )
                return Response(
                    UserNotificationSerializer(notification).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"User notifications error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_notifications_unread_count(request):
    """Return unread notification count for the current user."""
    try:
        unread_count = UserNotification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': unread_count})
    except Exception as e:
        logger.error(f"Unread notifications count error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_notification_mark_read(request, notification_id):
    """Mark or unmark a notification as read."""
    try:
        mark_as_read = request.data.get('is_read', True)
        notification = UserNotification.objects.filter(
            id=notification_id,
            user=request.user
        ).first()

        if not notification:
            return Response({
                "message": "Notification not found"
            }, status=status.HTTP_404_NOT_FOUND)

        if mark_as_read and not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
        elif not mark_as_read and notification.is_read:
            notification.is_read = False
            notification.read_at = None
            notification.save(update_fields=['is_read', 'read_at', 'updated_at'])

        return Response({
            "message": "Notification updated",
            "notification": UserNotificationSerializer(notification).data
        })

    except Exception as e:
        logger.error(f"Mark user notification read error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_notifications_mark_all_read(request):
    """Mark all notifications as read for the current user."""
    try:
        updated = UserNotification.objects.filter(
            user=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now(),
            updated_at=timezone.now()
        )
        return Response({
            "message": f"{updated} notifications marked as read",
            "count": updated
        })
    except Exception as e:
        logger.error(f"Mark all user notifications read error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def user_notification_delete(request, notification_id):
    """Delete a user notification."""
    try:
        notification = UserNotification.objects.filter(
            id=notification_id,
            user=request.user
        ).first()

        if not notification:
            return Response({
                "message": "Notification not found"
            }, status=status.HTTP_404_NOT_FOUND)

        notification.delete()
        return Response({
            "message": "Notification deleted successfully"
        }, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        logger.error(f"Delete user notification error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
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
    """Get comprehensive analytics data for admin including Practice analytics"""
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
        
        # Daily practice sessions with detailed metrics
        daily_sessions = defaultdict(int)
        daily_practice_time = defaultdict(int)
        daily_practice_scores = defaultdict(list)
        sessions = PracticeSession.objects.filter(
            session_date__date__gte=start_date,
            session_date__date__lte=end_date
        )
        for session in sessions:
            date_str = session.session_date.date().isoformat()
            daily_sessions[date_str] += 1
            daily_practice_time[date_str] += session.duration_minutes or 0
            # Score is required in model, but include it anyway
            if hasattr(session, 'score') and session.score is not None:
                daily_practice_scores[date_str].append(session.score)
        
        # Build time series data with practice metrics
        time_series = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.isoformat()
            scores = daily_practice_scores.get(date_str, [])
            avg_score = sum(scores) / len(scores) if scores else 0
            time_series.append({
                'date': date_str,
                'registrations': int(daily_registrations.get(date_str, 0)),
                'completions': int(daily_completions.get(date_str, 0)),
                'sessions': int(daily_sessions.get(date_str, 0)),
                'practice_time_minutes': int(daily_practice_time.get(date_str, 0)),
                'avg_score': float(round(avg_score, 2))
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
        
        # ============= Practice Analytics =============
        # Overall practice statistics
        total_sessions = PracticeSession.objects.count()
        total_practice_time = PracticeSession.objects.aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0
        avg_session_duration = PracticeSession.objects.aggregate(
            avg=Avg('duration_minutes')
        )['avg'] or 0
        avg_practice_score = PracticeSession.objects.aggregate(
            avg=Avg('score')
        )['avg'] or 0
        
        # Practice sessions in the selected period
        period_sessions = PracticeSession.objects.filter(
            session_date__date__gte=start_date,
            session_date__date__lte=end_date
        )
        period_total_sessions = period_sessions.count()
        period_total_time = period_sessions.aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0
        period_avg_score = period_sessions.aggregate(
            avg=Avg('score')
        )['avg'] or 0
        
        # Practice sessions by type distribution
        practice_type_dist = period_sessions.values('session_type').annotate(
            count=Count('id'),
            avg_score=Avg('score'),
            avg_duration=Avg('duration_minutes'),
            total_time=Sum('duration_minutes')
        ).order_by('-count')
        
        # Active users (users who practiced in the period)
        active_users = period_sessions.values('user_id').distinct().count()
        
        # Top performing practice types
        top_practice_types = period_sessions.values('session_type').annotate(
            count=Count('id'),
            avg_score=Avg('score')
        ).order_by('-avg_score')[:5]
        
        # Practice session trends (daily averages)
        practice_trends = []
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.isoformat()
            day_sessions = PracticeSession.objects.filter(
                session_date__date=current_date
            )
            day_count = day_sessions.count()
            # Calculate average score, handling cases where score might be 0 or missing
            day_avg_score = day_sessions.aggregate(avg=Avg('score'))['avg']
            day_avg_score = round(day_avg_score, 2) if day_avg_score is not None else 0
            day_total_time = day_sessions.aggregate(total=Sum('duration_minutes'))['total'] or 0
            day_active_users = day_sessions.values('user_id').distinct().count()
            
            practice_trends.append({
                'date': date_str,
                'sessions': int(day_count),
                'avg_score': float(day_avg_score),
                'total_time_minutes': int(day_total_time or 0),
                'active_users': int(day_active_users)
            })
            current_date += timedelta(days=1)
        
        # User engagement metrics
        total_users_practiced = PracticeSession.objects.values('user_id').distinct().count()
        period_users_practiced = period_sessions.values('user_id').distinct().count()
        
        # Practice session quality metrics (handle null scores)
        high_score_sessions = period_sessions.filter(score__gte=80).count()
        medium_score_sessions = period_sessions.filter(score__gte=60, score__lt=80).count()
        low_score_sessions = period_sessions.filter(score__lt=60).count()
        # Sessions without scores (if any)
        no_score_sessions = period_sessions.filter(score__isnull=True).count()
        
        return Response({
            'time_series': time_series,
            'lesson_type_distribution': list(lesson_type_dist),
            'content_type_distribution': list(content_type_dist),
            'top_lessons': top_lessons_data,
            # Practice Analytics
            'practice': {
                'overall': {
                    'total_sessions': total_sessions,
                    'total_time_minutes': total_practice_time,
                    'total_time_hours': round(total_practice_time / 60, 2),
                    'avg_session_duration': round(avg_session_duration, 2),
                    'avg_score': round(avg_practice_score, 2),
                    'total_users_practiced': total_users_practiced
                },
                'period': {
                    'total_sessions': period_total_sessions,
                    'total_time_minutes': period_total_time,
                    'total_time_hours': round(period_total_time / 60, 2),
                    'avg_score': round(period_avg_score, 2),
                    'active_users': active_users,
                    'users_practiced': period_users_practiced
                },
                'type_distribution': list(practice_type_dist),
                'top_types': list(top_practice_types),
                'trends': practice_trends,
                'quality_metrics': {
                    'high_score': high_score_sessions,
                    'medium_score': medium_score_sessions,
                    'low_score': low_score_sessions,
                    'no_score': no_score_sessions
                }
            }
        })
    
    except Exception as e:
        logger.error(f"Admin analytics error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Admin Lessons Management =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_lessons_list(request):
    """Get all lessons for admin management with filtering and pagination"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Query parameters
        lesson_type = request.query_params.get('lesson_type')
        content_type = request.query_params.get('content_type')
        is_active = request.query_params.get('is_active')
        search = request.query_params.get('search', '').strip()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))
        
        # Build queryset - include all lessons (not just active) for admin
        queryset = Lesson.objects.all()
        
        # Apply filters
        if lesson_type:
            queryset = queryset.filter(lesson_type=lesson_type)
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(slug__icontains=search)
            )
        
        # Get total count before pagination
        total_count = queryset.count()
        
        # Order by lesson_type, order, then difficulty
        queryset = queryset.order_by('lesson_type', 'order', 'difficulty_level')
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        lessons = queryset[start:end]
        
        # Serialize lessons
        serializer = LessonSerializer(lessons, many=True)
        
        # Get progress statistics for each lesson
        lessons_data = []
        for lesson_data in serializer.data:
            lesson_id = lesson_data['id']
            progress_count = LessonProgress.objects.filter(lesson_id=lesson_id).count()
            completed_count = LessonProgress.objects.filter(lesson_id=lesson_id, completed=True).count()
            avg_score = LessonProgress.objects.filter(lesson_id=lesson_id).aggregate(
                avg=Avg('score')
            )['avg'] or 0
            
            lessons_data.append({
                **lesson_data,
                'progress_count': progress_count,
                'completed_count': completed_count,
                'avg_score': round(avg_score, 2)
            })
        
        return Response({
            'lessons': lessons_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total_count,
                'pages': (total_count + page_size - 1) // page_size
            }
        })
    
    except Exception as e:
        logger.error(f"Admin lessons list error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_lessons_stats(request):
    """Get comprehensive statistics about lessons for admin dashboard"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Overall stats
        total_lessons = Lesson.objects.count()
        active_lessons = Lesson.objects.filter(is_active=True).count()
        inactive_lessons = total_lessons - active_lessons
        
        # Stats by lesson type with detailed analytics
        by_type = {}
        for lesson_type, label in Lesson.LESSON_TYPE_CHOICES:
            lessons_qs = Lesson.objects.filter(lesson_type=lesson_type)
            count = lessons_qs.count()
            active_count = lessons_qs.filter(is_active=True).count()
            
            # Get progress stats for this lesson type
            lesson_ids = list(lessons_qs.values_list('id', flat=True))
            type_progress = LessonProgress.objects.filter(lesson_id__in=lesson_ids)
            type_total_progress = type_progress.count()
            type_completed = type_progress.filter(completed=True).count()
            type_avg_score = type_progress.aggregate(avg=Avg('score'))['avg'] or 0
            
            by_type[lesson_type] = {
                'total': count,
                'active': active_count,
                'inactive': count - active_count,
                'progress': {
                    'total': type_total_progress,
                    'completed': type_completed,
                    'completion_rate': round((type_completed / type_total_progress * 100) if type_total_progress > 0 else 0, 2),
                    'avg_score': round(type_avg_score, 2)
                }
            }
        
        # Stats by content type with progress
        by_content = {}
        for content_type, label in Lesson.CONTENT_TYPE_CHOICES:
            lessons_qs = Lesson.objects.filter(content_type=content_type)
            count = lessons_qs.count()
            lesson_ids = list(lessons_qs.values_list('id', flat=True))
            content_progress = LessonProgress.objects.filter(lesson_id__in=lesson_ids)
            content_completed = content_progress.filter(completed=True).count()
            
            by_content[content_type] = {
                'total': count,
                'completed': content_completed,
                'progress_count': content_progress.count()
            }
        
        # Overall progress stats
        total_progress = LessonProgress.objects.count()
        completed_progress = LessonProgress.objects.filter(completed=True).count()
        completion_rate = round((completed_progress / total_progress * 100) if total_progress > 0 else 0, 2)
        avg_score = LessonProgress.objects.aggregate(avg=Avg('score'))['avg'] or 0
        
        # Recent lessons (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_lessons = Lesson.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # Top performing lessons
        top_lessons = Lesson.objects.annotate(
            completion_count=Count('lessonprogress', filter=Q(lessonprogress__completed=True))
        ).order_by('-completion_count')[:5]
        
        top_lessons_data = [{
            'id': lesson.id,
            'title': lesson.title,
            'lesson_type': lesson.lesson_type,
            'completions': lesson.completion_count
        } for lesson in top_lessons]
        
        # Average difficulty distribution
        difficulty_dist = {}
        for i in range(1, 11):
            difficulty_dist[i] = Lesson.objects.filter(difficulty_level=i).count()
        
        return Response({
            'overall': {
                'total': total_lessons,
                'active': active_lessons,
                'inactive': inactive_lessons,
                'recent': recent_lessons
            },
            'by_type': by_type,
            'by_content': by_content,
            'progress': {
                'total': total_progress,
                'completed': completed_progress,
                'completion_rate': completion_rate,
                'avg_score': round(avg_score, 2)
            },
            'top_lessons': top_lessons_data,
            'difficulty_distribution': difficulty_dist
        })
    
    except Exception as e:
        logger.error(f"Admin lessons stats error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_lesson_detail(request, lesson_id):
    """Get, update, or delete a specific lesson"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return Response({
            "message": "Lesson not found"
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = LessonSerializer(lesson)
        
        # Add progress stats
        progress_count = LessonProgress.objects.filter(lesson=lesson).count()
        completed_count = LessonProgress.objects.filter(lesson=lesson, completed=True).count()
        avg_score = LessonProgress.objects.filter(lesson=lesson).aggregate(
            avg=Avg('score')
        )['avg'] or 0
        
        data = serializer.data
        data['progress_count'] = progress_count
        data['completed_count'] = completed_count
        data['avg_score'] = round(avg_score, 2)
        
        return Response(data)
    
    elif request.method == 'PUT':
        data = request.data.copy()
        
        # Validate lesson_type if provided
        if 'lesson_type' in data:
            valid_lesson_types = [choice[0] for choice in Lesson.LESSON_TYPE_CHOICES]
            if data['lesson_type'] not in valid_lesson_types:
                return Response({
                    "message": f"Invalid lesson_type. Must be one of: {', '.join(valid_lesson_types)}"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate content_type if provided
        if 'content_type' in data:
            valid_content_types = [choice[0] for choice in Lesson.CONTENT_TYPE_CHOICES]
            if data['content_type'] not in valid_content_types:
                return Response({
                    "message": f"Invalid content_type. Must be one of: {', '.join(valid_content_types)}"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate difficulty_level if provided
        if 'difficulty_level' in data:
            difficulty = int(data['difficulty_level'])
            if difficulty < 1 or difficulty > 10:
                return Response({
                    "message": "difficulty_level must be between 1 and 10"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Auto-generate slug from title if title changed but slug not provided
        if 'title' in data and not data.get('slug'):
            from django.utils.text import slugify
            base_slug = slugify(data['title'])
            slug = base_slug
            counter = 1
            while Lesson.objects.filter(slug=slug).exclude(id=lesson_id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            data['slug'] = slug
        
        serializer = LessonSerializer(lesson, data=data, partial=True)
        if serializer.is_valid():
            updated_lesson = serializer.save()
            # Add progress stats
            progress_count = LessonProgress.objects.filter(lesson=updated_lesson).count()
            completed_count = LessonProgress.objects.filter(lesson=updated_lesson, completed=True).count()
            avg_score = LessonProgress.objects.filter(lesson=updated_lesson).aggregate(
                avg=Avg('score')
            )['avg'] or 0
            
            result = LessonSerializer(updated_lesson).data
            result['progress_count'] = progress_count
            result['completed_count'] = completed_count
            result['avg_score'] = round(avg_score, 2)
            return Response(result)
        return Response({
            "message": "Validation failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Don't actually delete, just deactivate
        lesson.is_active = False
        lesson.save()
        return Response({
            "message": "Lesson deactivated successfully"
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_lesson_create(request):
    """Create a new lesson with validation"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        data = request.data.copy()
        
        # Auto-generate slug from title if not provided
        if not data.get('slug') and data.get('title'):
            from django.utils.text import slugify
            base_slug = slugify(data['title'])
            slug = base_slug
            counter = 1
            while Lesson.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            data['slug'] = slug
        
        # Validate lesson_type
        valid_lesson_types = [choice[0] for choice in Lesson.LESSON_TYPE_CHOICES]
        if data.get('lesson_type') and data['lesson_type'] not in valid_lesson_types:
            return Response({
                "message": f"Invalid lesson_type. Must be one of: {', '.join(valid_lesson_types)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate content_type
        valid_content_types = [choice[0] for choice in Lesson.CONTENT_TYPE_CHOICES]
        if data.get('content_type') and data['content_type'] not in valid_content_types:
            return Response({
                "message": f"Invalid content_type. Must be one of: {', '.join(valid_content_types)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate difficulty_level
        if data.get('difficulty_level'):
            difficulty = int(data['difficulty_level'])
            if difficulty < 1 or difficulty > 10:
                return Response({
                    "message": "difficulty_level must be between 1 and 10"
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = LessonSerializer(data=data)
        if serializer.is_valid():
            lesson = serializer.save()
            # Add progress stats (will be 0 for new lesson)
            result = LessonSerializer(lesson).data
            result['progress_count'] = 0
            result['completed_count'] = 0
            result['avg_score'] = 0
            return Response(result, status=status.HTTP_201_CREATED)
        return Response({
            "message": "Validation failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Admin lesson create error: {str(e)}")
        return Response({
            "message": "An error occurred while creating the lesson",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Admin Practice Sessions =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_practice_list(request):
    """Get list of practice sessions for admin"""
    logger.info(f"Admin practice list request from user: {request.user.username} (ID: {request.user.id}, is_staff: {request.user.is_staff}, is_superuser: {request.user.is_superuser})")
    
    if not is_admin_user(request.user):
        logger.warning(f"Unauthorized admin practice list request from user: {request.user.username}")
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        session_type = request.query_params.get('session_type', '')
        user_id = request.query_params.get('user_id', '')
        date_from = request.query_params.get('date_from', '')
        date_to = request.query_params.get('date_to', '')
        
        # Log total count before filtering
        total_before_filter = PracticeSession.objects.count()
        logger.info(f"Total practice sessions in database: {total_before_filter}")
        
        queryset = PracticeSession.objects.select_related('user', 'lesson').all()
        
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(lesson__title__icontains=search) |
                Q(session_type__icontains=search)
            )
        
        if session_type:
            queryset = queryset.filter(session_type=session_type)
        
        if user_id:
            try:
                queryset = queryset.filter(user_id=int(user_id))
            except ValueError:
                pass
        
        if date_from:
            try:
                from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                queryset = queryset.filter(session_date__gte=from_date)
            except (ValueError, AttributeError):
                pass
        
        if date_to:
            try:
                to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                queryset = queryset.filter(session_date__lte=to_date)
            except (ValueError, AttributeError):
                pass
        
        # Order by most recent first
        queryset = queryset.order_by('-session_date')
        
        # Pagination
        total = queryset.count()
        logger.info(f"Practice sessions after filtering: {total}")
        start = (page - 1) * page_size
        end = start + page_size
        sessions = queryset[start:end]
        logger.info(f"Returning sessions {start} to {end} (page {page}, page_size {page_size})")
        
        serializer = PracticeSessionSerializer(sessions, many=True)
        
        # Add user info to each session
        result_data = []
        for session_data in serializer.data:
            # Get the session object for additional user info
            session_obj = next((s for s in sessions if s.id == session_data['id']), None)
            if session_obj:
                session_data['user'] = {
                    'id': session_obj.user.id,
                    'username': session_obj.user.username,
                    'email': session_obj.user.email,
                    'name': f"{session_obj.user.first_name} {session_obj.user.last_name}".strip() or session_obj.user.username
                }
            else:
                # Fallback to serializer data
                session_data['user'] = {
                    'id': session_data.get('user'),
                    'username': session_data.get('user_username', ''),
                    'email': session_data.get('user_email', ''),
                    'name': session_data.get('user_username', 'Unknown')
                }
            result_data.append(session_data)
        
        return Response({
            'sessions': result_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': (total + page_size - 1) // page_size if total > 0 else 1
            }
        })
    
    except Exception as e:
        logger.error(f"Admin practice list error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_practice_stats(request):
    """Get practice session statistics for admin"""
    logger.info(f"Admin practice stats request from user: {request.user.username} (ID: {request.user.id})")
    
    if not is_admin_user(request.user):
        logger.warning(f"Unauthorized admin practice stats request from user: {request.user.username}")
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        today = timezone.now().date()
        last7 = today - timedelta(days=7)
        last30 = today - timedelta(days=30)
        
        # Overall stats
        total_sessions = PracticeSession.objects.count()
        logger.info(f"Calculating stats for {total_sessions} total practice sessions")
        total_time = PracticeSession.objects.aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0
        avg_score_result = PracticeSession.objects.aggregate(
            avg=Avg('score')
        )['avg']
        avg_score = float(avg_score_result) if avg_score_result is not None else 0.0
        avg_duration_result = PracticeSession.objects.aggregate(
            avg=Avg('duration_minutes')
        )['avg']
        avg_duration = float(avg_duration_result) if avg_duration_result is not None else 0.0
        
        # Recent stats
        sessions_last_7 = PracticeSession.objects.filter(session_date__date__gte=last7).count()
        sessions_last_30 = PracticeSession.objects.filter(session_date__date__gte=last30).count()
        time_last_7 = PracticeSession.objects.filter(session_date__date__gte=last7).aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0
        time_last_30 = PracticeSession.objects.filter(session_date__date__gte=last30).aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0
        
        # Active users
        active_users_7 = PracticeSession.objects.filter(
            session_date__date__gte=last7
        ).values('user_id').distinct().count()
        active_users_30 = PracticeSession.objects.filter(
            session_date__date__gte=last30
        ).values('user_id').distinct().count()
        
        # Session type distribution
        type_distribution = PracticeSession.objects.values('session_type').annotate(
            count=Count('id'),
            avg_score=Avg('score'),
            total_time=Sum('duration_minutes')
        ).order_by('-count')
        
        # Daily stats for last 30 days
        daily_stats = []
        for i in range(30):
            date = last30 + timedelta(days=i)
            day_sessions = PracticeSession.objects.filter(session_date__date=date)
            daily_stats.append({
                'date': date.isoformat(),
                'sessions': day_sessions.count(),
                'total_time': day_sessions.aggregate(total=Sum('duration_minutes'))['total'] or 0,
                'avg_score': day_sessions.aggregate(avg=Avg('score'))['avg'] or 0,
                'active_users': day_sessions.values('user_id').distinct().count()
            })
        
        # Get active users with practice statistics
        active_users_data = []
        users_with_sessions = User.objects.filter(
            practice_sessions__isnull=False
        ).distinct().select_related('profile')
        
        for user in users_with_sessions:
            user_sessions = PracticeSession.objects.filter(user=user)
            user_total_sessions = user_sessions.count()
            user_total_time = user_sessions.aggregate(total=Sum('duration_minutes'))['total'] or 0
            user_avg_score = user_sessions.aggregate(avg=Avg('score'))['avg']
            user_avg_score = float(user_avg_score) if user_avg_score is not None else 0.0
            
            # Recent activity (last 30 days)
            user_sessions_30 = user_sessions.filter(session_date__date__gte=last30)
            user_sessions_30_count = user_sessions_30.count()
            user_time_30 = user_sessions_30.aggregate(total=Sum('duration_minutes'))['total'] or 0
            
            # Last session date
            last_session = user_sessions.order_by('-session_date').first()
            last_session_date = last_session.session_date if last_session else None
            
            profile = getattr(user, 'profile', None)
            active_users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'last_session_date': last_session_date.isoformat() if last_session_date else None,
                'profile': {
                    'level': profile.level if profile else 'beginner',
                    'age_range': profile.age_range if profile else None,
                    'points': profile.points if profile else 0,
                    'current_streak': profile.current_streak if profile else 0,
                } if profile else None,
                'practice_stats': {
                    'total_sessions': user_total_sessions,
                    'total_time_minutes': int(user_total_time),
                    'total_time_hours': round(float(user_total_time) / 60, 2) if user_total_time > 0 else 0.0,
                    'avg_score': round(user_avg_score, 2),
                    'sessions_last_30': user_sessions_30_count,
                    'time_last_30_minutes': int(user_time_30),
                    'time_last_30_hours': round(float(user_time_30) / 60, 2) if user_time_30 > 0 else 0.0,
                }
            })
        
        # Sort by total sessions (descending)
        active_users_data.sort(key=lambda x: x['practice_stats']['total_sessions'], reverse=True)
        
        return Response({
            'overall': {
                'total_sessions': total_sessions,
                'total_time_minutes': int(total_time),
                'total_time_hours': round(float(total_time) / 60, 2) if total_time > 0 else 0.0,
                'avg_score': round(avg_score, 2),
                'avg_duration_minutes': round(avg_duration, 2)
            },
            'recent': {
                'sessions_last_7': sessions_last_7,
                'sessions_last_30': sessions_last_30,
                'time_last_7_minutes': int(time_last_7),
                'time_last_7_hours': round(float(time_last_7) / 60, 2) if time_last_7 > 0 else 0.0,
                'time_last_30_minutes': int(time_last_30),
                'time_last_30_hours': round(float(time_last_30) / 60, 2) if time_last_30 > 0 else 0.0,
                'active_users_7': active_users_7,
                'active_users_30': active_users_30
            },
            'type_distribution': list(type_distribution),
            'daily_stats': daily_stats,
            'active_users': active_users_data
        })
    
    except Exception as e:
        logger.error(f"Admin practice stats error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_practice_detail(request, session_id):
    """Get detailed information about a specific practice session"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        session = PracticeSession.objects.select_related('user', 'lesson').get(id=session_id)
        serializer = PracticeSessionSerializer(session)
        
        result = serializer.data
        result['user'] = {
            'id': session.user.id,
            'username': session.user.username,
            'email': session.user.email,
            'name': f"{session.user.first_name} {session.user.last_name}".strip() or session.user.username,
            'first_name': session.user.first_name,
            'last_name': session.user.last_name,
            'date_joined': session.user.date_joined.isoformat() if session.user.date_joined else None
        }
        
        if session.lesson:
            result['lesson'] = {
                'id': session.lesson.id,
                'title': session.lesson.title,
                'slug': session.lesson.slug,
                'lesson_type': session.lesson.lesson_type,
                'content_type': session.lesson.content_type
            }
        
        return Response(result)
    
    except PracticeSession.DoesNotExist:
        return Response({
            "message": "Practice session not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Admin practice detail error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Admin Progress Tracking =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_progress_list(request):
    """Get list of lesson progress for admin"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        user_id = request.query_params.get('user_id', '')
        lesson_id = request.query_params.get('lesson_id', '')
        lesson_type = request.query_params.get('lesson_type', '')
        content_type = request.query_params.get('content_type', '')
        completed = request.query_params.get('completed', '')
        date_from = request.query_params.get('date_from', '')
        date_to = request.query_params.get('date_to', '')
        
        queryset = LessonProgress.objects.select_related('user', 'lesson').all()
        
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(lesson__title__icontains=search) |
                Q(lesson__slug__icontains=search)
            )
        
        if user_id:
            try:
                queryset = queryset.filter(user_id=int(user_id))
            except ValueError:
                pass
        
        if lesson_id:
            try:
                queryset = queryset.filter(lesson_id=int(lesson_id))
            except ValueError:
                pass
        
        if lesson_type:
            queryset = queryset.filter(lesson__lesson_type=lesson_type)
        
        if content_type:
            queryset = queryset.filter(lesson__content_type=content_type)
        
        if completed == 'true':
            queryset = queryset.filter(completed=True)
        elif completed == 'false':
            queryset = queryset.filter(completed=False)
        
        if date_from:
            try:
                from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                queryset = queryset.filter(last_attempt__gte=from_date)
            except (ValueError, AttributeError):
                pass
        
        if date_to:
            try:
                to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                queryset = queryset.filter(last_attempt__lte=to_date)
            except (ValueError, AttributeError):
                pass
        
        # Order by most recent first
        queryset = queryset.order_by('-last_attempt')
        
        # Pagination
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        progress_records = queryset[start:end]
        
        serializer = LessonProgressSerializer(progress_records, many=True)
        
        # Add user and lesson info to each record
        result_data = []
        for progress_data in serializer.data:
            progress_obj = next((p for p in progress_records if p.id == progress_data['id']), None)
            if progress_obj:
                progress_data['user'] = {
                    'id': progress_obj.user.id,
                    'username': progress_obj.user.username,
                    'email': progress_obj.user.email,
                    'name': f"{progress_obj.user.first_name} {progress_obj.user.last_name}".strip() or progress_obj.user.username
                }
                if progress_obj.lesson:
                    progress_data['lesson'] = {
                        'id': progress_obj.lesson.id,
                        'title': progress_obj.lesson.title,
                        'slug': progress_obj.lesson.slug,
                        'lesson_type': progress_obj.lesson.lesson_type,
                        'content_type': progress_obj.lesson.content_type,
                        'difficulty_level': progress_obj.lesson.difficulty_level
                    }
            result_data.append(progress_data)
        
        return Response({
            'progress': result_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': (total + page_size - 1) // page_size if total > 0 else 1
            }
        })
    
    except Exception as e:
        logger.error(f"Admin progress list error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_progress_stats(request):
    """Get lesson progress statistics for admin"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        today = timezone.now().date()
        last7 = today - timedelta(days=7)
        last30 = today - timedelta(days=30)
        
        # Overall stats
        total_progress = LessonProgress.objects.count()
        completed_progress = LessonProgress.objects.filter(completed=True).count()
        in_progress = LessonProgress.objects.filter(completed=False).count()
        
        avg_score = LessonProgress.objects.aggregate(
            avg=Avg('score')
        )['avg'] or 0
        
        avg_time = LessonProgress.objects.aggregate(
            avg=Avg('time_spent_minutes')
        )['avg'] or 0
        
        total_time = LessonProgress.objects.aggregate(
            total=Sum('time_spent_minutes')
        )['total'] or 0
        
        total_attempts = LessonProgress.objects.aggregate(
            total=Sum('attempts')
        )['total'] or 0
        
        # Recent stats
        progress_last_7 = LessonProgress.objects.filter(last_attempt__date__gte=last7).count()
        progress_last_30 = LessonProgress.objects.filter(last_attempt__date__gte=last30).count()
        completed_last_7 = LessonProgress.objects.filter(
            completed=True, last_attempt__date__gte=last7
        ).count()
        completed_last_30 = LessonProgress.objects.filter(
            completed=True, last_attempt__date__gte=last30
        ).count()
        
        time_last_7 = LessonProgress.objects.filter(last_attempt__date__gte=last7).aggregate(
            total=Sum('time_spent_minutes')
        )['total'] or 0
        time_last_30 = LessonProgress.objects.filter(last_attempt__date__gte=last30).aggregate(
            total=Sum('time_spent_minutes')
        )['total'] or 0
        
        # Active users with progress
        active_users_7 = LessonProgress.objects.filter(
            last_attempt__date__gte=last7
        ).values('user_id').distinct().count()
        active_users_30 = LessonProgress.objects.filter(
            last_attempt__date__gte=last30
        ).values('user_id').distinct().count()
        
        # Lesson type distribution
        lesson_type_dist = LessonProgress.objects.filter(
            lesson__isnull=False
        ).values('lesson__lesson_type').annotate(
            count=Count('id'),
            avg_score=Avg('score'),
            completed_count=Count('id', filter=Q(completed=True))
        ).order_by('-count')
        
        # Content type distribution
        content_type_dist = LessonProgress.objects.filter(
            lesson__isnull=False
        ).values('lesson__content_type').annotate(
            count=Count('id'),
            avg_score=Avg('score'),
            completed_count=Count('id', filter=Q(completed=True))
        ).order_by('-count')
        
        # Score distribution
        score_ranges = [
            {'min': 90, 'max': 100, 'label': '90-100%'},
            {'min': 80, 'max': 89, 'label': '80-89%'},
            {'min': 70, 'max': 79, 'label': '70-79%'},
            {'min': 60, 'max': 69, 'label': '60-69%'},
            {'min': 0, 'max': 59, 'label': '0-59%'},
        ]
        score_distribution = []
        for range_item in score_ranges:
            count = LessonProgress.objects.filter(
                score__gte=range_item['min'],
                score__lte=range_item['max']
            ).count()
            score_distribution.append({
                'range': range_item['label'],
                'count': count
            })
        
        # Daily stats for last 30 days
        daily_stats = []
        for i in range(30):
            date = last30 + timedelta(days=i)
            day_progress = LessonProgress.objects.filter(last_attempt__date=date)
            daily_stats.append({
                'date': date.isoformat(),
                'total': day_progress.count(),
                'completed': day_progress.filter(completed=True).count(),
                'avg_score': day_progress.aggregate(avg=Avg('score'))['avg'] or 0,
                'total_time': day_progress.aggregate(total=Sum('time_spent_minutes'))['total'] or 0,
                'active_users': day_progress.values('user_id').distinct().count()
            })
        
        # Top lessons by progress count
        top_lessons = LessonProgress.objects.filter(
            lesson__isnull=False
        ).values('lesson__id', 'lesson__title', 'lesson__lesson_type', 'lesson__content_type').annotate(
            total_progress=Count('id'),
            completed_progress=Count('id', filter=Q(completed=True)),
            avg_score=Avg('score')
        ).order_by('-total_progress')[:10]
        
        return Response({
            'overall': {
                'total_progress': total_progress,
                'completed_progress': completed_progress,
                'in_progress': in_progress,
                'completion_rate': round((completed_progress / total_progress * 100) if total_progress > 0 else 0, 2),
                'avg_score': round(avg_score, 2),
                'avg_time_minutes': round(avg_time, 2),
                'total_time_minutes': total_time,
                'total_time_hours': round(total_time / 60, 2),
                'total_attempts': total_attempts
            },
            'recent': {
                'progress_last_7': progress_last_7,
                'progress_last_30': progress_last_30,
                'completed_last_7': completed_last_7,
                'completed_last_30': completed_last_30,
                'time_last_7_minutes': time_last_7,
                'time_last_7_hours': round(time_last_7 / 60, 2),
                'time_last_30_minutes': time_last_30,
                'time_last_30_hours': round(time_last_30 / 60, 2),
                'active_users_7': active_users_7,
                'active_users_30': active_users_30
            },
            'lesson_type_distribution': list(lesson_type_dist),
            'content_type_distribution': list(content_type_dist),
            'score_distribution': score_distribution,
            'daily_stats': daily_stats,
            'top_lessons': list(top_lessons)
        })
    
    except Exception as e:
        logger.error(f"Admin progress stats error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_progress_detail(request, progress_id):
    """Get detailed information about a specific lesson progress"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        progress = LessonProgress.objects.select_related('user', 'lesson').get(id=progress_id)
        serializer = LessonProgressSerializer(progress)
        
        result = serializer.data
        result['user'] = {
            'id': progress.user.id,
            'username': progress.user.username,
            'email': progress.user.email,
            'name': f"{progress.user.first_name} {progress.user.last_name}".strip() or progress.user.username,
            'first_name': progress.user.first_name,
            'last_name': progress.user.last_name,
            'date_joined': progress.user.date_joined.isoformat() if progress.user.date_joined else None
        }
        
        if progress.lesson:
            result['lesson'] = {
                'id': progress.lesson.id,
                'title': progress.lesson.title,
                'slug': progress.lesson.slug,
                'lesson_type': progress.lesson.lesson_type,
                'content_type': progress.lesson.content_type,
                'difficulty_level': progress.lesson.difficulty_level,
                'duration_minutes': progress.lesson.duration_minutes,
                'description': progress.lesson.description
            }
        
        return Response(result)
    
    except LessonProgress.DoesNotExist:
        return Response({
            "message": "Lesson progress not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Admin progress detail error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Admin Vocabulary Management =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_vocabulary_list(request):
    """Get list of vocabulary words for admin"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        user_id = request.query_params.get('user_id', '')
        category = request.query_params.get('category', '')
        difficulty = request.query_params.get('difficulty', '')
        mastery_min = request.query_params.get('mastery_min', '')
        mastery_max = request.query_params.get('mastery_max', '')
        date_from = request.query_params.get('date_from', '')
        date_to = request.query_params.get('date_to', '')
        
        queryset = VocabularyWord.objects.select_related('user').all()
        
        if search:
            queryset = queryset.filter(
                Q(word__icontains=search) |
                Q(definition__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(category__icontains=search)
            )
        
        if user_id:
            try:
                queryset = queryset.filter(user_id=int(user_id))
            except ValueError:
                pass
        
        if category:
            queryset = queryset.filter(category=category)
        
        if difficulty:
            try:
                queryset = queryset.filter(difficulty=int(difficulty))
            except ValueError:
                pass
        
        if mastery_min:
            try:
                queryset = queryset.filter(mastery_level__gte=float(mastery_min))
            except ValueError:
                pass
        
        if mastery_max:
            try:
                queryset = queryset.filter(mastery_level__lte=float(mastery_max))
            except ValueError:
                pass
        
        if date_from:
            try:
                from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                queryset = queryset.filter(last_practiced__gte=from_date)
            except (ValueError, AttributeError):
                pass
        
        if date_to:
            try:
                to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                queryset = queryset.filter(last_practiced__lte=to_date)
            except (ValueError, AttributeError):
                pass
        
        # Order by most recently practiced first
        queryset = queryset.order_by('-last_practiced')
        
        # Pagination
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        words = queryset[start:end]
        
        serializer = VocabularyWordSerializer(words, many=True)
        
        # Add user info to each word
        result_data = []
        for word_data in serializer.data:
            word_obj = next((w for w in words if w.id == word_data['id']), None)
            if word_obj:
                word_data['user'] = {
                    'id': word_obj.user.id,
                    'username': word_obj.user.username,
                    'email': word_obj.user.email,
                    'name': f"{word_obj.user.first_name} {word_obj.user.last_name}".strip() or word_obj.user.username
                }
            result_data.append(word_data)
        
        return Response({
            'vocabulary': result_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': (total + page_size - 1) // page_size if total > 0 else 1
            }
        })
    
    except Exception as e:
        logger.error(f"Admin vocabulary list error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_vocabulary_stats(request):
    """Get vocabulary statistics for admin"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        today = timezone.now().date()
        last7 = today - timedelta(days=7)
        last30 = today - timedelta(days=30)
        
        # Overall stats
        total_words = VocabularyWord.objects.count()
        unique_users = VocabularyWord.objects.values('user_id').distinct().count()
        avg_mastery = VocabularyWord.objects.aggregate(
            avg=Avg('mastery_level')
        )['avg'] or 0
        total_practiced = VocabularyWord.objects.aggregate(
            total=Sum('times_practiced')
        )['total'] or 0
        total_correct = VocabularyWord.objects.aggregate(
            total=Sum('times_correct')
        )['total'] or 0
        
        # Recent stats
        words_last_7 = VocabularyWord.objects.filter(last_practiced__date__gte=last7).count()
        words_last_30 = VocabularyWord.objects.filter(last_practiced__date__gte=last30).count()
        new_words_7 = VocabularyWord.objects.filter(first_learned__date__gte=last7).count()
        new_words_30 = VocabularyWord.objects.filter(first_learned__date__gte=last30).count()
        
        # Active users
        active_users_7 = VocabularyWord.objects.filter(
            last_practiced__date__gte=last7
        ).values('user_id').distinct().count()
        active_users_30 = VocabularyWord.objects.filter(
            last_practiced__date__gte=last30
        ).values('user_id').distinct().count()
        
        # Category distribution
        category_distribution = VocabularyWord.objects.values('category').annotate(
            count=Count('id'),
            avg_mastery=Avg('mastery_level'),
            total_practiced=Sum('times_practiced')
        ).order_by('-count')[:10]
        
        # Difficulty distribution
        difficulty_distribution = VocabularyWord.objects.values('difficulty').annotate(
            count=Count('id'),
            avg_mastery=Avg('mastery_level')
        ).order_by('difficulty')
        
        # Mastery level distribution
        mastery_distribution = [
            {'range': '0-25%', 'count': VocabularyWord.objects.filter(mastery_level__lt=25).count()},
            {'range': '25-50%', 'count': VocabularyWord.objects.filter(mastery_level__gte=25, mastery_level__lt=50).count()},
            {'range': '50-75%', 'count': VocabularyWord.objects.filter(mastery_level__gte=50, mastery_level__lt=75).count()},
            {'range': '75-100%', 'count': VocabularyWord.objects.filter(mastery_level__gte=75).count()},
        ]
        
        # Top words by practice count
        top_words = VocabularyWord.objects.order_by('-times_practiced')[:10]
        top_words_data = [{
            'id': word.id,
            'word': word.word,
            'user': word.user.username,
            'times_practiced': word.times_practiced,
            'mastery_level': word.mastery_level
        } for word in top_words]
        
        # Daily stats for last 30 days
        daily_stats = []
        for i in range(30):
            date = last30 + timedelta(days=i)
            day_words = VocabularyWord.objects.filter(last_practiced__date=date)
            daily_stats.append({
                'date': date.isoformat(),
                'words_practiced': day_words.count(),
                'new_words': VocabularyWord.objects.filter(first_learned__date=date).count(),
                'active_users': day_words.values('user_id').distinct().count()
            })
        
        accuracy_rate = (total_correct / total_practiced * 100) if total_practiced > 0 else 0
        
        return Response({
            'overall': {
                'total_words': total_words,
                'unique_users': unique_users,
                'avg_mastery': round(avg_mastery, 2),
                'total_practiced': total_practiced,
                'total_correct': total_correct,
                'accuracy_rate': round(accuracy_rate, 2)
            },
            'recent': {
                'words_practiced_7': words_last_7,
                'words_practiced_30': words_last_30,
                'new_words_7': new_words_7,
                'new_words_30': new_words_30,
                'active_users_7': active_users_7,
                'active_users_30': active_users_30
            },
            'category_distribution': list(category_distribution),
            'difficulty_distribution': list(difficulty_distribution),
            'mastery_distribution': mastery_distribution,
            'top_words': top_words_data,
            'daily_stats': daily_stats
        })
    
    except Exception as e:
        logger.error(f"Admin vocabulary stats error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_vocabulary_detail(request, word_id):
    """Get detailed information about a specific vocabulary word"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        word = VocabularyWord.objects.select_related('user').get(id=word_id)
        serializer = VocabularyWordSerializer(word)
        
        result = serializer.data
        result['user'] = {
            'id': word.user.id,
            'username': word.user.username,
            'email': word.user.email,
            'name': f"{word.user.first_name} {word.user.last_name}".strip() or word.user.username,
            'first_name': word.user.first_name,
            'last_name': word.user.last_name,
            'date_joined': word.user.date_joined.isoformat() if word.user.date_joined else None
        }
        
        # Calculate accuracy
        accuracy = (word.times_correct / word.times_practiced * 100) if word.times_practiced > 0 else 0
        result['accuracy'] = round(accuracy, 2)
        
        return Response(result)
    
    except VocabularyWord.DoesNotExist:
        return Response({
            "message": "Vocabulary word not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Admin vocabulary detail error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Admin Achievements Management =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_achievements_list(request):
    """Get list of achievements for admin management"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        category = request.query_params.get('category', '')
        tier = request.query_params.get('tier', '')
        is_active = request.query_params.get('is_active', '')
        
        queryset = Achievement.objects.all()
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(achievement_id__icontains=search)
            )
        
        if category:
            queryset = queryset.filter(category=category)
        
        if tier:
            queryset = queryset.filter(tier=tier)
        
        if is_active:
            if is_active.lower() == 'true':
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() == 'false':
                queryset = queryset.filter(is_active=False)
        
        # Count total before pagination
        total = queryset.count()
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        achievements = queryset.order_by('-created_at')[start:end]
        
        serializer = AchievementSerializer(achievements, many=True)
        
        # Get user achievement counts for each achievement
        achievements_data = []
        serializer_data = serializer.data
        for idx, achievement in enumerate(achievements):
            ach_data = serializer_data[idx].copy()
            
            # Count users who unlocked this achievement
            unlocked_count = UserAchievement.objects.filter(
                achievement=achievement,
                unlocked=True
            ).count()
            
            # Count total users with this achievement (including in progress)
            total_users = UserAchievement.objects.filter(
                achievement=achievement
            ).count()
            
            ach_data['unlocked_count'] = unlocked_count
            ach_data['total_users'] = total_users
            achievements_data.append(ach_data)
        
        return Response({
            'achievements': achievements_data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': (total + page_size - 1) // page_size
            }
        })
    
    except Exception as e:
        logger.error(f"Admin achievements list error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_achievements_stats(request):
    """Get achievement statistics for admin dashboard"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        total_achievements = Achievement.objects.count()
        active_achievements = Achievement.objects.filter(is_active=True).count()
        inactive_achievements = Achievement.objects.filter(is_active=False).count()
        
        # Category distribution
        category_distribution = Achievement.objects.values('category').annotate(
            count=Count('id')
        ).order_by('category')
        
        # Tier distribution
        tier_distribution = Achievement.objects.values('tier').annotate(
            count=Count('id')
        ).order_by('tier')
        
        # Total unlocked achievements across all users
        total_unlocked = UserAchievement.objects.filter(unlocked=True).count()
        
        # Users who have unlocked at least one achievement
        users_with_achievements = UserAchievement.objects.filter(unlocked=True).values('user_id').distinct().count()
        total_users = User.objects.count()
        
        # Most unlocked achievements
        top_achievements = UserAchievement.objects.filter(unlocked=True).values(
            'achievement__id',
            'achievement__title',
            'achievement__category',
            'achievement__tier'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Recent unlocks (last 30 days)
        last_30_days = timezone.now() - timedelta(days=30)
        recent_unlocks = UserAchievement.objects.filter(
            unlocked=True,
            unlocked_at__gte=last_30_days
        ).count()
        
        # Unlocks in last 7 days
        last_7_days = timezone.now() - timedelta(days=7)
        recent_unlocks_7 = UserAchievement.objects.filter(
            unlocked=True,
            unlocked_at__gte=last_7_days
        ).count()
        
        return Response({
            'total_achievements': total_achievements,
            'active_achievements': active_achievements,
            'inactive_achievements': inactive_achievements,
            'total_unlocked': total_unlocked,
            'users_with_achievements': users_with_achievements,
            'total_users': total_users,
            'engagement_rate': round((users_with_achievements / total_users * 100) if total_users > 0 else 0, 2),
            'category_distribution': list(category_distribution),
            'tier_distribution': list(tier_distribution),
            'top_achievements': list(top_achievements),
            'recent_unlocks_30': recent_unlocks,
            'recent_unlocks_7': recent_unlocks_7
        })
    
    except Exception as e:
        logger.error(f"Admin achievements stats error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_achievement_detail(request, achievement_id):
    """Get, update, or delete a specific achievement"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        achievement = Achievement.objects.get(id=achievement_id)
    except Achievement.DoesNotExist:
        return Response({
            "message": "Achievement not found"
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = AchievementSerializer(achievement)
        
        # Get statistics for this achievement
        unlocked_count = UserAchievement.objects.filter(
            achievement=achievement,
            unlocked=True
        ).count()
        total_users = UserAchievement.objects.filter(achievement=achievement).count()
        
        result = serializer.data
        result['unlocked_count'] = unlocked_count
        result['total_users'] = total_users
        
        return Response(result)
    
    elif request.method == 'PUT':
        serializer = AchievementSerializer(achievement, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Soft delete - set is_active to False instead of actually deleting
        achievement.is_active = False
        achievement.save()
        return Response({
            "message": "Achievement deactivated successfully"
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_achievement_create(request):
    """Create a new achievement"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        serializer = AchievementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Admin achievement create error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_achievements(request):
    """Get user achievements for admin (filterable by user or achievement)"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        user_id = request.query_params.get('user_id', '')
        achievement_id = request.query_params.get('achievement_id', '')
        unlocked = request.query_params.get('unlocked', '')
        
        queryset = UserAchievement.objects.select_related('user', 'achievement').all()
        
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(achievement__title__icontains=search)
            )
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if achievement_id:
            queryset = queryset.filter(achievement_id=achievement_id)
        
        if unlocked:
            if unlocked.lower() == 'true':
                queryset = queryset.filter(unlocked=True)
            elif unlocked.lower() == 'false':
                queryset = queryset.filter(unlocked=False)
        
        # Count total before pagination
        total = queryset.count()
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        user_achievements = queryset.order_by('-unlocked_at', '-id')[start:end]
        
        serializer = UserAchievementSerializer(user_achievements, many=True)
        
        # Enhance with user and achievement details
        results = []
        serializer_data = serializer.data
        for idx, ua in enumerate(user_achievements):
            data = serializer_data[idx].copy()
            data['user'] = {
                'id': ua.user.id,
                'username': ua.user.username,
                'email': ua.user.email,
                'name': f"{ua.user.first_name} {ua.user.last_name}".strip() or ua.user.username,
            }
            results.append(data)
        
        return Response({
            'user_achievements': results,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': (total + page_size - 1) // page_size
            }
        })
    
    except Exception as e:
        logger.error(f"Admin user achievements error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Admin Surveys =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_surveys_list(request):
    """Get list of user surveys for admin"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        search = request.query_params.get('search', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        completed_filter = request.query_params.get('completed', '')
        age_range = request.query_params.get('age_range', '')
        english_level = request.query_params.get('english_level', '')
        native_language = request.query_params.get('native_language', '')
        date_from = request.query_params.get('date_from', '')
        date_to = request.query_params.get('date_to', '')
        
        # Get ALL users with profiles (including incomplete surveys)
        # This ensures we show all users who have started or completed surveys
        queryset = User.objects.select_related('profile').filter(profile__isnull=False)
        
        # Filter by completion status
        if completed_filter.lower() == 'true':
            queryset = queryset.filter(profile__survey_completed_at__isnull=False)
        elif completed_filter.lower() == 'false':
            queryset = queryset.filter(profile__survey_completed_at__isnull=True)
        
        # Search filter
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(profile__native_language__icontains=search)
            )
        
        # Age range filter
        if age_range:
            queryset = queryset.filter(profile__age_range=age_range)
        
        # English level filter
        if english_level:
            queryset = queryset.filter(profile__english_level=english_level)
        
        # Native language filter
        if native_language:
            queryset = queryset.filter(profile__native_language__icontains=native_language)
        
        # Date filters
        if date_from:
            try:
                from_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                queryset = queryset.filter(profile__survey_completed_at__gte=from_date)
            except (ValueError, AttributeError):
                pass
        
        if date_to:
            try:
                to_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                queryset = queryset.filter(profile__survey_completed_at__lte=to_date)
            except (ValueError, AttributeError):
                pass
        
        # Order by completion date (completed first, then by join date)
        queryset = queryset.order_by('-profile__survey_completed_at', '-date_joined')
        
        # Pagination
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        users = queryset[start:end]
        
        # Build response data
        surveys = []
        for user in users:
            profile = user.profile
            surveys.append({
                'id': user.id,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                    'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                },
                'age_range': profile.age_range,
                'native_language': profile.native_language,
                'english_level': profile.english_level,
                'learning_purpose': profile.learning_purpose if profile.learning_purpose else [],
                'interests': profile.interests if profile.interests else [],
                'completed': profile.survey_completed_at is not None,
                'completed_at': profile.survey_completed_at.isoformat() if profile.survey_completed_at else None,
                'created_at': profile.created_at.isoformat() if profile.created_at else None,
            })
        
        return Response({
            'surveys': surveys,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': (total + page_size - 1) // page_size if total > 0 else 1
            }
        })
    
    except Exception as e:
        logger.error(f"Admin surveys list error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_surveys_stats(request):
    """Get survey statistics for admin"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        today = timezone.now().date()
        last7 = today - timedelta(days=7)
        last30 = today - timedelta(days=30)
        
        # Overall stats
        total_profiles = UserProfile.objects.count()
        completed_surveys = UserProfile.objects.filter(survey_completed_at__isnull=False).count()
        incomplete_surveys = total_profiles - completed_surveys
        completion_rate = round((completed_surveys / total_profiles * 100) if total_profiles > 0 else 0, 2)
        
        # Recent completions
        completed_last_7 = UserProfile.objects.filter(
            survey_completed_at__isnull=False,
            survey_completed_at__date__gte=last7
        ).count()
        completed_last_30 = UserProfile.objects.filter(
            survey_completed_at__isnull=False,
            survey_completed_at__date__gte=last30
        ).count()
        
        # Age range distribution
        age_distribution = {}
        for profile in UserProfile.objects.exclude(age_range__isnull=True).exclude(age_range=''):
            age = profile.age_range
            age_distribution[age] = age_distribution.get(age, 0) + 1
        
        # English level distribution
        level_distribution = {}
        for profile in UserProfile.objects.exclude(english_level__isnull=True).exclude(english_level=''):
            level = profile.english_level
            level_distribution[level] = level_distribution.get(level, 0) + 1
        
        # Native language distribution (top 10)
        language_distribution = {}
        for profile in UserProfile.objects.exclude(native_language__isnull=True).exclude(native_language=''):
            lang = profile.native_language
            language_distribution[lang] = language_distribution.get(lang, 0) + 1
        top_languages = sorted(language_distribution.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Learning purpose distribution
        purpose_distribution = {}
        for profile in UserProfile.objects.exclude(learning_purpose__isnull=True):
            purposes = profile.learning_purpose if profile.learning_purpose else []
            if isinstance(purposes, list):
                for purpose in purposes:
                    purpose_distribution[purpose] = purpose_distribution.get(purpose, 0) + 1
        
        return Response({
            'overall': {
                'total_profiles': total_profiles,
                'completed_surveys': completed_surveys,
                'incomplete_surveys': incomplete_surveys,
                'completion_rate': completion_rate,
            },
            'recent': {
                'completed_last_7': completed_last_7,
                'completed_last_30': completed_last_30,
            },
            'age_distribution': age_distribution,
            'level_distribution': level_distribution,
            'language_distribution': dict(top_languages),
            'purpose_distribution': purpose_distribution,
        })
    
    except Exception as e:
        logger.error(f"Admin surveys stats error: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_survey_detail(request, user_id):
    """Get detailed survey information for a specific user"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.select_related('profile').get(id=user_id)
        profile = user.profile
        
        return Response({
            'id': user.id,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'is_active': user.is_active,
            },
            'survey': {
                'age_range': profile.age_range,
                'native_language': profile.native_language,
                'english_level': profile.english_level,
                'learning_purpose': profile.learning_purpose if profile.learning_purpose else [],
                'interests': profile.interests if profile.interests else [],
                'completed': profile.survey_completed_at is not None,
                'completed_at': profile.survey_completed_at.isoformat() if profile.survey_completed_at else None,
            },
            'profile': {
                'level': profile.level,
                'points': profile.points,
                'current_streak': profile.current_streak,
                'longest_streak': profile.longest_streak,
                'created_at': profile.created_at.isoformat() if profile.created_at else None,
                'updated_at': profile.updated_at.isoformat() if profile.updated_at else None,
            }
        })
    
    except User.DoesNotExist:
        return Response({
            "message": "User not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Admin survey detail error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_survey_update(request, user_id):
    """Update survey data for a specific user (admin only)"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.select_related('profile').get(id=user_id)
        profile = user.profile
        
        # Update survey fields
        data = request.data
        if 'age_range' in data:
            profile.age_range = data['age_range'] or None
        if 'native_language' in data:
            profile.native_language = data['native_language'] or None
        if 'english_level' in data:
            profile.english_level = data['english_level'] or None
        if 'learning_purpose' in data:
            profile.learning_purpose = data['learning_purpose'] if isinstance(data['learning_purpose'], list) else []
        if 'interests' in data:
            profile.interests = data['interests'] if isinstance(data['interests'], list) else []
        
        # Handle survey completion status
        if 'mark_complete' in data:
            if data['mark_complete']:
                # Only mark as complete if essential fields are present
                has_required_fields = (
                    profile.age_range or 
                    profile.native_language or 
                    profile.english_level or 
                    (profile.learning_purpose and len(profile.learning_purpose) > 0)
                )
                if has_required_fields:
                    profile.survey_completed_at = timezone.now()
                else:
                    return Response({
                        "message": "Cannot mark as complete. Required survey fields are missing."
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                profile.survey_completed_at = None
        
        # If survey_completed_at is explicitly set
        if 'survey_completed_at' in data:
            if data['survey_completed_at']:
                profile.survey_completed_at = timezone.now()
            else:
                profile.survey_completed_at = None
        
        profile.save()
        logger.info(f"Survey updated for user {user.username} by admin {request.user.username}")
        
        return Response({
            "message": "Survey updated successfully",
            "survey": {
                'age_range': profile.age_range,
                'native_language': profile.native_language,
                'english_level': profile.english_level,
                'learning_purpose': profile.learning_purpose if profile.learning_purpose else [],
                'interests': profile.interests if profile.interests else [],
                'completed': profile.survey_completed_at is not None,
                'completed_at': profile.survey_completed_at.isoformat() if profile.survey_completed_at else None,
            }
        })
    
    except User.DoesNotExist:
        return Response({
            "message": "User not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Admin survey update error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_survey_delete(request, user_id):
    """Delete/reset survey data for a specific user (admin only)"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.select_related('profile').get(id=user_id)
        profile = user.profile
        
        # Reset survey fields
        profile.age_range = None
        profile.native_language = None
        profile.english_level = None
        profile.learning_purpose = []
        profile.interests = []
        profile.survey_completed_at = None
        profile.save()
        
        # Also delete individual survey step responses
        from .models import SurveyStepResponse
        SurveyStepResponse.objects.filter(user=user).delete()
        
        logger.info(f"Survey data deleted for user {user.username} by admin {request.user.username}")
        
        return Response({
            "message": "Survey data deleted successfully"
        })
    
    except User.DoesNotExist:
        return Response({
            "message": "User not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Admin survey delete error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_survey_steps(request, user_id):
    """Get all survey step responses for a specific user (admin only)"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        from .models import SurveyStepResponse
        from .serializers import SurveyStepResponseSerializer
        
        step_responses = SurveyStepResponse.objects.filter(user=user).order_by('step_number', '-completed_at')
        serializer = SurveyStepResponseSerializer(step_responses, many=True)
        
        return Response({
            "steps": serializer.data,
            "total_steps": len(serializer.data)
        })
    
    except User.DoesNotExist:
        return Response({
            "message": "User not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Admin survey steps error: {str(e)}")
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
    """Save kids listening analytics to MySQL database"""
    try:
        data = request.data or {}
        # Accept both user_id (for backward compat) and authenticated user
        if 'user_id' not in data and 'session_data' not in data and 'stats' not in data:
            return Response({
                "message": "user_id and session_data are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        
        # Handle both old format (session_data) and new format (stats)
        stats = data.get('stats') or {}
        session_data = data.get('session_data')
        
        # If we have session_data, save it as a practice session
        if session_data:
            # Calculate duration from timestamps
            duration_minutes = 0
            if session_data.get('startTime') and session_data.get('endTime'):
                duration_ms = session_data.get('endTime', 0) - session_data.get('startTime', 0)
                duration_minutes = max(1, int(duration_ms / 1000 / 60))
            
            # Save listening session as PracticeSession to MySQL
            PracticeSession.objects.create(
                user=user,
                session_type='listening',
                duration_minutes=duration_minutes,
                score=session_data.get('score', 0),
                points_earned=session_data.get('starsEarned', 0),
                words_practiced=session_data.get('totalQuestions', 0),
                sentences_practiced=session_data.get('correctAnswers', 0),
                mistakes_count=max(0, session_data.get('totalQuestions', 0) - session_data.get('correctAnswers', 0)),
                details={
                    'storyId': session_data.get('storyId'),
                    'storyTitle': session_data.get('storyTitle'),
                    'firstAttemptCorrect': session_data.get('firstAttemptCorrect', 0),
                    'totalReplays': session_data.get('totalReplays', 0),
                    'attempts': session_data.get('attempts', [])
                }
            )
            logger.info(f"Kids listening session saved to MySQL for user {user.id}")
        
        # If we have aggregate stats, log them (aggregated from practice sessions)
        if stats and stats.get('totalStoriesCompleted', 0) > 0:
            logger.info(f"Kids listening analytics stats for user {user.id}: {stats.get('totalStoriesCompleted', 0)} stories completed")
        
        return Response({ 
            "ok": True,
            "message": "Analytics saved to MySQL"
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Kids analytics error: {str(e)}")
        return Response({
            "message": "An error occurred"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Page Eligibility Views =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_page_eligibility(request, page_path):
    """Get eligibility status for a specific page"""
    try:
        user = request.user
        page_path_decoded = page_path.replace('%2F', '/')
        
        # Get or create eligibility record
        eligibility, created = PageEligibility.objects.get_or_create(
            user=user,
            page_path=page_path_decoded,
            defaults={
                'required_criteria': {},
                'current_progress': {},
                'is_unlocked': False
            }
        )
        
        # If newly created, set default criteria based on page
        if created:
            default_criteria = get_default_eligibility_criteria(page_path_decoded)
            eligibility.required_criteria = default_criteria
            eligibility.save()
        
        # Get user progress data
        progress_data = get_user_progress_data(user, page_path_decoded)
        
        # Check eligibility
        is_eligible, progress_details = eligibility.check_eligibility(progress_data)
        
        # Update current progress
        eligibility.current_progress = progress_details
        
        # If eligible and not yet unlocked, unlock it
        if is_eligible and not eligibility.is_unlocked:
            eligibility.is_unlocked = True
            eligibility.unlocked_at = timezone.now()
        
        eligibility.save()
        
        serializer = PageEligibilitySerializer(eligibility)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Page eligibility error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_page_eligibilities(request):
    """Get eligibility status for all pages"""
    try:
        user = request.user
        eligibilities = PageEligibility.objects.filter(user=user)
        
        # Get user progress data once
        progress_data = get_user_progress_data(user, None)
        
        # Update all eligibilities
        results = []
        for eligibility in eligibilities:
            is_eligible, progress_details = eligibility.check_eligibility(progress_data)
            eligibility.current_progress = progress_details
            
            if is_eligible and not eligibility.is_unlocked:
                eligibility.is_unlocked = True
                eligibility.unlocked_at = timezone.now()
            
            eligibility.save()
            serializer = PageEligibilitySerializer(eligibility)
            results.append(serializer.data)
        
        return Response(results)
    
    except Exception as e:
        logger.error(f"All page eligibilities error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_page_eligibility(request, page_path):
    """Check and update eligibility for a page (called after progress updates)"""
    try:
        user = request.user
        page_path_decoded = page_path.replace('%2F', '/')
        
        eligibility, created = PageEligibility.objects.get_or_create(
            user=user,
            page_path=page_path_decoded,
            defaults={
                'required_criteria': get_default_eligibility_criteria(page_path_decoded),
                'current_progress': {},
                'is_unlocked': False
            }
        )
        
        # Get fresh progress data
        progress_data = get_user_progress_data(user, page_path_decoded)
        
        # Check eligibility
        is_eligible, progress_details = eligibility.check_eligibility(progress_data)
        eligibility.current_progress = progress_details
        
        if is_eligible and not eligibility.is_unlocked:
            eligibility.is_unlocked = True
            eligibility.unlocked_at = timezone.now()
        
        eligibility.save()
        
        serializer = PageEligibilitySerializer(eligibility)
        return Response(serializer.data)
    
    except Exception as e:
        logger.error(f"Check page eligibility error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_default_eligibility_criteria(page_path: str) -> dict:
    """Get default eligibility criteria for a page"""
    criteria_map = {
        '/kids/young': {
            'stories_completed': 0,  # Always unlocked (entry point)
        },
        '/kids/teen': {
            'stories_completed': 3,  # Complete 3 stories in YoungKids
            'points': 200,
        },
        '/adults/beginners': {
            'points': 0,  # Unlocked after survey
        },
        '/adults/intermediates': {
            'points': 500,  # Earn 500 points in beginners
        },
        '/adults/advanced': {
            'points': 1000,  # Earn 1000 points in intermediates
        },
        '/ielts-pte': {
            'points': 0,  # Unlocked if survey indicates exam prep
        },
    }
    return criteria_map.get(page_path, {})


def get_user_progress_data(user: User, page_path: str = None) -> dict:
    """Get user's progress data for eligibility checking"""
    try:
        data = {}
        
        # Get kids progress if checking kids pages
        if page_path and '/kids' in page_path:
            try:
                kids_progress = KidsProgress.objects.filter(user=user).first()
                if kids_progress:
                    details = kids_progress.details or {}
                    
                    # Count completed stories
                    story_enrollments = details.get('storyEnrollments', [])
                    completed_stories = sum(1 for s in story_enrollments if s.get('completed', False))
                    
                    data['stories_completed'] = completed_stories
                    data['points'] = kids_progress.points or 0
                    data['streak'] = kids_progress.streak or 0
                    data['vocabulary_words'] = len(details.get('vocabulary', {}))
                    data['pronunciation_practices'] = len(details.get('pronunciation', {}))
                    data['games_played'] = details.get('games', {}).get('attempts', 0)
            except Exception as e:
                logger.warn(f"Error getting kids progress: {e}")
        
        # Get teen progress if checking teen pages
        if page_path and '/kids/teen' in page_path:
            try:
                teen_progress = TeenProgress.objects.filter(user=user).first()
                if teen_progress:
                    data['stories_completed'] = teen_progress.stories_completed or 0
                    data['points'] = teen_progress.points or 0
                    data['streak'] = teen_progress.streak or 0
                    data['vocabulary_words'] = teen_progress.vocabulary_words_practiced or 0
                    data['pronunciation_practices'] = teen_progress.pronunciation_practices or 0
            except Exception as e:
                logger.warn(f"Error getting teen progress: {e}")
        
        # Get general progress for adults pages
        if page_path and '/adults' in page_path:
            try:
                profile = UserProfile.objects.filter(user=user).first()
                if profile:
                    data['points'] = profile.points or 0
                    data['streak'] = profile.current_streak or 0
                
                # Count lessons completed
                lessons_completed = LessonProgress.objects.filter(
                    user=user,
                    completed=True
                ).count()
                data['lessons_completed'] = lessons_completed
                
                # Count vocabulary words
                vocab_count = VocabularyWord.objects.filter(user=user).count()
                data['vocabulary_words'] = vocab_count
            except Exception as e:
                logger.warn(f"Error getting adult progress: {e}")
        
        return data
    
    except Exception as e:
        logger.error(f"Error getting user progress data: {e}")
        return {}


# ============= Multi-Category Progress Views =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_category_progress(request):
    """Get progress for all learning categories - Automatically syncs and creates records from existing data"""
    try:
        user = request.user
        logger.debug(f"Getting category progress for user: {user.id} ({user.username})")
        
        # Get all existing CategoryProgress records
        try:
            existing_categories = CategoryProgress.objects.filter(user=user)
            existing_category_names = set(c.category for c in existing_categories)
            logger.debug(f"Found {len(existing_categories)} existing category progress records")
        except Exception as e:
            logger.error(f"Error querying CategoryProgress: {str(e)}")
            # If table doesn't exist, return empty array with error message
            return Response({
                "message": "CategoryProgress table not found. Please run migrations.",
                "error": str(e),
                "data": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Define all possible categories
        all_categories = [
            'young_kids',
            'teen_kids',
            'adults_beginner',
            'adults_intermediate',
            'adults_advanced',
            'ielts_pte'
        ]
        
        # For each category, ensure a record exists and is synced with latest data
        for category in all_categories:
            try:
                if category not in existing_category_names:
                    # Create new CategoryProgress record
                    logger.info(f"Creating new CategoryProgress for category: {category}")
                    category_progress, created = CategoryProgress.objects.get_or_create(
                        user=user,
                        category=category,
                        defaults={
                            'total_points': 0,
                            'total_streak': 0,
                            'lessons_completed': 0,
                            'practice_time_minutes': 0,
                            'average_score': 0.0,
                            'progress_percentage': 0.0,
                            'level': 1,
                            'stories_completed': 0,
                            'vocabulary_words': 0,
                            'pronunciation_attempts': 0,
                            'games_completed': 0,
                        }
                    )
                    # Sync with existing data
                    logger.debug(f"Syncing data for category: {category}")
                    sync_category_progress(user, category, category_progress)
                    logger.debug(f"Synced {category}: {category_progress.total_points} points, {category_progress.stories_completed} stories")
                else:
                    # Update existing record with latest data from source tables
                    logger.debug(f"Updating existing CategoryProgress for category: {category}")
                    category_progress = CategoryProgress.objects.get(user=user, category=category)
                    sync_category_progress(user, category, category_progress)
                    category_progress.save()  # Save synced data to MySQL
                    logger.debug(f"Updated {category}: {category_progress.total_points} points, {category_progress.stories_completed} stories")
            except Exception as e:
                logger.error(f"Error processing category {category}: {str(e)}")
                import traceback
                traceback.print_exc()
                # Continue with other categories even if one fails
        
        # Get all categories (including newly created ones)
        try:
            categories = CategoryProgress.objects.filter(user=user).order_by('-last_activity', '-total_points')
            logger.info(f"Returning {categories.count()} category progress records")
            serializer = CategoryProgressSerializer(categories, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error serializing category progress: {str(e)}")
            return Response({
                "message": "Error retrieving category progress",
                "error": str(e),
                "data": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Error getting category progress: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_category_progress(request, category):
    """Get progress for a specific category"""
    try:
        user = request.user
        category_progress, created = CategoryProgress.objects.get_or_create(
            user=user,
            category=category,
            defaults={
                'total_points': 0,
                'total_streak': 0,
                'lessons_completed': 0,
                'practice_time_minutes': 0,
                'average_score': 0.0,
                'progress_percentage': 0.0,
                'level': 1
            }
        )
        
        # Sync with existing progress data if newly created
        if created:
            sync_category_progress(user, category, category_progress)
        
        serializer = CategoryProgressSerializer(category_progress)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error getting category progress: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_category_progress(request, category):
    """Update progress for a specific category - SAVES TO MYSQL DATABASE"""
    try:
        user = request.user
        data = request.data
        
        # Use the helper function which ensures MySQL save
        update_category_progress_from_activity(
            user=user,
            category=category,
            points=int(data.get('points', 0)),
            time_minutes=int(data.get('time_minutes', 0)),
            score=float(data.get('score', 0)),
            lessons=int(data.get('lessons', 0)),
            stories=int(data.get('stories_completed', 0)),
            vocabulary_words=int(data.get('vocabulary_words', 0)),
            pronunciation_attempts=int(data.get('pronunciation_attempts', 0)),
            games=int(data.get('games_completed', 0)),
            streak=int(data.get('streak', 0)) if 'streak' in data else None
        )
        
        # Get the updated progress to return
        category_progress = CategoryProgress.objects.get(user=user, category=category)
        serializer = CategoryProgressSerializer(category_progress)
        return Response(serializer.data)
    except CategoryProgress.DoesNotExist:
        # If doesn't exist, the helper function should have created it
        category_progress = CategoryProgress.objects.get(user=user, category=category)
        serializer = CategoryProgressSerializer(category_progress)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error updating category progress: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_aggregated_progress(request):
    """Get aggregated progress across all categories with recommendations"""
    try:
        user = request.user
        categories = CategoryProgress.objects.filter(user=user)
        
        # Calculate aggregated metrics
        total_points = sum(c.total_points for c in categories)
        total_streak = max((c.total_streak for c in categories), default=0)
        # For kids categories, count stories_completed; for others, count lessons_completed
        total_lessons = sum(
            (c.stories_completed if c.category in ['young_kids', 'teen_kids'] else c.lessons_completed)
            for c in categories
        )
        # Use actual practice time from PracticeSession table instead of estimated times
        # This ensures consistency with admin portal
        # ALWAYS use PracticeSession data as the source of truth
        from django.db.models import Sum
        practice_sessions_time = PracticeSession.objects.filter(user=user).aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0
        
        # ALWAYS use PracticeSession time, even if 0 (it's the accurate source)
        # Only fallback to estimates if user has NO practice sessions at all
        total_time = practice_sessions_time
        if practice_sessions_time == 0:
            # Check if user actually has any sessions
            has_sessions = PracticeSession.objects.filter(user=user).exists()
            if not has_sessions:
                # User has no sessions, use estimated time as fallback
                estimated_time = sum(c.practice_time_minutes for c in categories)
                total_time = estimated_time
            # If has_sessions is True but time is 0, keep total_time as 0 (valid data)
        
        # Calculate average score
        scores = [c.average_score for c in categories if c.average_score > 0]
        avg_score = sum(scores) / len(scores) if scores else 0.0
        
        # Find most active category
        most_active = None
        if categories:
            most_active = max(categories, key=lambda c: c.last_activity or c.first_access)
            most_active = most_active.category if most_active.last_activity else None
        
        # Get recommended category
        recommended = get_recommended_category(user, categories)
        
        # Count active categories (have activity in last 30 days)
        from django.utils import timezone
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_categories = [c for c in categories if c.last_activity and c.last_activity >= thirty_days_ago]
        
        # Log the practice time to help debug frontend issues
        logger.info(f"Aggregated progress for user {user.id} ({user.email}): practice_time={total_time} minutes (from PracticeSession table)")
        if total_time != practice_sessions_time:
            logger.warning(f"Practice time mismatch for user {user.id}: PracticeSession={practice_sessions_time}, returned={total_time}")
        
        data = {
            'total_points': total_points,
            'total_streak': total_streak,
            'total_lessons_completed': total_lessons,
            'total_practice_time': total_time,  # This should be 172 minutes from PracticeSession table
            'average_score': avg_score,
            'categories_count': categories.count(),
            'active_categories_count': len(active_categories),
            'categories': CategoryProgressSerializer(categories, many=True).data,
            'most_active_category': most_active,
            'recommended_category': recommended
        }
        
        serializer = AggregatedProgressSerializer(data)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error getting aggregated progress: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




def get_recommended_category(user, categories):
    """Get recommended next category based on user progress"""
    try:
        # Category progression order
        progression = [
            'young_kids',
            'teen_kids',
            'adults_beginner',
            'adults_intermediate',
            'adults_advanced',
            'ielts_pte'
        ]
        
        # Find user's current highest category
        category_map = {c.category: c for c in categories}
        
        # Check if user has completed prerequisites for next category
        for i, cat in enumerate(progression):
            if cat not in category_map:
                # Category not started, check if prerequisites met
                if i == 0:
                    return cat  # Always recommend starting category
                
                prev_cat = progression[i - 1]
                if prev_cat in category_map:
                    prev_progress = category_map[prev_cat]
                    # Check if ready for next level
                    if prev_progress.lessons_completed >= 5 or prev_progress.total_points >= 200:
                        return cat
        
        # If all categories started, recommend based on performance
        # Find category with lowest completion or highest engagement
        if categories:
            # Recommend category with good progress but room for improvement
            for cat in progression:
                if cat in category_map:
                    progress = category_map[cat]
                    if progress.average_score >= 70 and progress.progress_percentage < 80:
                        return cat
            
            # Default to most active category
            most_active = max(categories, key=lambda c: c.last_activity or c.first_access)
            return most_active.category
        
        return 'young_kids'  # Default recommendation
    except Exception as e:
        logger.error(f"Error getting recommended category: {str(e)}")
        return None


# ============= Admin Video Lessons Management =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_videos_list(request):
    """Get all video lessons for admin management with filtering and pagination"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get query parameters
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 50))
        search = request.GET.get('search', '').strip()
        difficulty = request.GET.get('difficulty', '').strip()
        category = request.GET.get('category', '').strip()
        is_active = request.GET.get('is_active', '').strip()
        
        # Build queryset
        queryset = VideoLesson.objects.all()
        
        # Apply filters
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(slug__icontains=search)
            )
        
        if difficulty and difficulty != 'all':
            queryset = queryset.filter(difficulty=difficulty)
        
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        if is_active and is_active != 'all':
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Get total count before pagination
        total = queryset.count()
        
        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        videos = queryset[start:end]
        
        # Serialize
        serializer = VideoLessonSerializer(videos, many=True, context={'request': request})
        
        return Response({
            'videos': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'pages': ceil(total / page_size) if total > 0 else 0
            }
        })
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(f"Admin videos list error: {str(e)}")
        logger.error(f"Traceback: {error_traceback}")
        return Response({
            "message": "An error occurred while fetching videos",
            "error": str(e),
            "detail": error_traceback if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_videos_stats(request):
    """Get comprehensive statistics about video lessons for admin dashboard"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        total_videos = VideoLesson.objects.count()
        active_videos = VideoLesson.objects.filter(is_active=True).count()
        inactive_videos = VideoLesson.objects.filter(is_active=False).count()
        
        # Recent videos (last 30 days)
        from datetime import timedelta
        recent_videos = VideoLesson.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Difficulty distribution
        difficulty_dist = VideoLesson.objects.values('difficulty').annotate(
            count=Count('id')
        ).order_by('difficulty')
        
        # Category distribution
        category_dist = VideoLesson.objects.values('category').annotate(
            count=Count('id')
        ).order_by('category')
        
        # Total views
        total_views = VideoLesson.objects.aggregate(
            total=Sum('views')
        )['total'] or 0
        
        # Average rating
        avg_rating = VideoLesson.objects.aggregate(
            avg=Avg('rating')
        )['avg'] or 0
        
        return Response({
            'overall': {
                'total': total_videos,
                'active': active_videos,
                'inactive': inactive_videos,
                'recent': recent_videos
            },
            'engagement': {
                'total_views': total_views,
                'avg_rating': round(avg_rating, 2)
            },
            'difficulty_distribution': list(difficulty_dist),
            'category_distribution': list(category_dist)
        })
    except Exception as e:
        logger.error(f"Admin videos stats error: {str(e)}")
        return Response({
            "message": "An error occurred",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_video_detail(request, video_id):
    """Get, update, or delete a specific video lesson"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        video = VideoLesson.objects.get(id=video_id)
    except VideoLesson.DoesNotExist:
        return Response({
            "message": "Video lesson not found"
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = VideoLessonSerializer(video, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Build a mutable dict without deep-copying file streams
        # For FormData, request.data is a QueryDict - convert to regular dict
        if hasattr(request.data, 'dict'):
            data = request.data.dict()
        else:
            # Fallback: manually extract non-file fields
            data = {}
            for key in request.data:
                if key not in ['thumbnail', 'video_file']:  # Skip file fields
                    value = request.data.get(key)
                    # Handle list values
                    if isinstance(value, list) and len(value) == 1:
                        data[key] = value[0]
                    else:
                        data[key] = value
        
        # Handle file uploads from request.FILES
        if 'thumbnail' in request.FILES:
            data['thumbnail'] = request.FILES['thumbnail']
        if 'video_file' in request.FILES:
            data['video_file'] = request.FILES['video_file']
        
        # Auto-generate slug from title if not provided and title changed
        if 'title' in data and data['title'] != video.title:
            if not data.get('slug') or data.get('slug') == video.slug:
                from django.utils.text import slugify
                base_slug = slugify(data['title'])
                slug = base_slug
                counter = 1
                while VideoLesson.objects.filter(slug=slug).exclude(id=video_id).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                data['slug'] = slug
        
        # Parse tags, hashtags, and chapters (same as create function)
        # Parse tags if it's a string
        if 'tags' in data:
            if isinstance(data['tags'], str):
                try:
                    import json
                    data['tags'] = json.loads(data['tags'])
                except (json.JSONDecodeError, ValueError):
                    if data['tags'].strip():
                        data['tags'] = [tag.strip() for tag in data['tags'].split(',') if tag.strip()]
                    else:
                        data['tags'] = []
            elif not isinstance(data['tags'], list):
                data['tags'] = []
        
        # Parse hashtags if it's a string
        if 'hashtags' in data:
            if isinstance(data['hashtags'], str):
                try:
                    import json
                    data['hashtags'] = json.loads(data['hashtags'])
                except (json.JSONDecodeError, ValueError):
                    if data['hashtags'].strip():
                        data['hashtags'] = [tag.strip().lstrip('#') for tag in data['hashtags'].split(',') if tag.strip()]
                    else:
                        data['hashtags'] = []
            elif not isinstance(data['hashtags'], list):
                data['hashtags'] = []
        
        # Parse chapters if it's a string
        if 'chapters' in data:
            if isinstance(data['chapters'], str):
                try:
                    import json
                    data['chapters'] = json.loads(data['chapters'])
                except (json.JSONDecodeError, ValueError):
                    data['chapters'] = []
            elif not isinstance(data['chapters'], list):
                data['chapters'] = []
        
        serializer = VideoLessonSerializer(video, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({
            "message": "Validation failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        video.delete()
        return Response({
            "message": "Video lesson deleted successfully"
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_video_create(request):
    """Create a new video lesson with file upload support"""
    if not is_admin_user(request.user):
        return Response({
            "message": "Unauthorized. Admin access required."
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Build a mutable dict without deep-copying file streams
        # For FormData, request.data is a QueryDict - convert to regular dict
        if hasattr(request.data, 'dict'):
            data = request.data.dict()
        else:
            # Fallback: manually extract non-file fields
            data = {}
            for key in request.data:
                if key not in ['thumbnail', 'video_file']:  # Skip file fields
                    value = request.data.get(key)
                    # Handle list values (like tags as JSON string)
                    if isinstance(value, list) and len(value) == 1:
                        data[key] = value[0]
                    else:
                        data[key] = value
        
        # Attach uploaded files explicitly from request.FILES
        if 'thumbnail' in request.FILES:
            data['thumbnail'] = request.FILES['thumbnail']
        if 'video_file' in request.FILES:
            data['video_file'] = request.FILES['video_file']
        
        # Convert empty strings to None for optional fields (but not slug - it will be auto-generated)
        for field in ['description', 'video_url']:
            if field in data and data[field] == '':
                data[field] = None
        
        # Validate title is provided first
        if not data.get('title') or not data.get('title').strip():
            return Response({
                "message": "Title is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Auto-generate slug from title if not provided or empty
        if not data.get('slug') or (isinstance(data.get('slug'), str) and not data.get('slug').strip()):
            from django.utils.text import slugify
            base_slug = slugify(data['title'])
            if not base_slug:  # If slugify returns empty, use a default
                base_slug = 'video-lesson'
            slug = base_slug
            counter = 1
            while VideoLesson.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            data['slug'] = slug
        
        # Convert numeric fields
        numeric_fields = {
            'duration': int,
            'speaking_exercises': int,
            'rating': float,
            'views': int,
            'order': int
        }
        for field, field_type in numeric_fields.items():
            if field in data:
                try:
                    if data[field] == '' or data[field] is None:
                        data[field] = 0 if field_type == int else 0.0
                    else:
                        data[field] = field_type(data[field])
                except (ValueError, TypeError):
                    data[field] = 0 if field_type == int else 0.0
        
        # Convert boolean fields
        if 'is_active' in data:
            if isinstance(data['is_active'], str):
                data['is_active'] = data['is_active'].lower() in ('true', '1', 'yes')
            elif data['is_active'] is None:
                data['is_active'] = True
        
        # Validate difficulty
        valid_difficulties = [choice[0] for choice in VideoLesson.DIFFICULTY_CHOICES]
        if data.get('difficulty') and data['difficulty'] not in valid_difficulties:
            return Response({
                "message": f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate category
        valid_categories = [choice[0] for choice in VideoLesson.CATEGORY_CHOICES]
        if data.get('category') and data['category'] not in valid_categories:
            return Response({
                "message": f"Invalid category. Must be one of: {', '.join(valid_categories)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse tags if it's a string
        if 'tags' in data:
            if isinstance(data['tags'], str):
                try:
                    # Try to parse as JSON first
                    import json
                    data['tags'] = json.loads(data['tags'])
                except (json.JSONDecodeError, ValueError):
                    # If not JSON, split by comma
                    if data['tags'].strip():
                        data['tags'] = [tag.strip() for tag in data['tags'].split(',') if tag.strip()]
                    else:
                        data['tags'] = []
            elif not isinstance(data['tags'], list):
                data['tags'] = []
        
        # Parse hashtags if it's a string
        if 'hashtags' in data:
            if isinstance(data['hashtags'], str):
                try:
                    import json
                    data['hashtags'] = json.loads(data['hashtags'])
                except (json.JSONDecodeError, ValueError):
                    if data['hashtags'].strip():
                        # Remove # if present and split by comma
                        data['hashtags'] = [tag.strip().lstrip('#') for tag in data['hashtags'].split(',') if tag.strip()]
                    else:
                        data['hashtags'] = []
            elif not isinstance(data['hashtags'], list):
                data['hashtags'] = []
        
        # Parse chapters if it's a string
        if 'chapters' in data:
            if isinstance(data['chapters'], str):
                try:
                    import json
                    data['chapters'] = json.loads(data['chapters'])
                except (json.JSONDecodeError, ValueError):
                    data['chapters'] = []
            elif not isinstance(data['chapters'], list):
                data['chapters'] = []
        
        serializer = VideoLessonSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            video = serializer.save()
            return Response(
                VideoLessonSerializer(video, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response({
            "message": "Validation failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        error_message = str(e)
        logger.error(f"Admin video create error: {error_message}")
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(f"Traceback: {error_traceback}")
        return Response({
            "message": "An error occurred while creating the video lesson",
            "error": error_message,
            "detail": error_traceback if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Public Video Lessons Endpoint =============
@api_view(['GET'])
@permission_classes([AllowAny])
def videos_list(request):
    """Get all active video lessons for public viewing (adults/videos page)"""
    try:
        # Get query parameters
        difficulty = request.GET.get('difficulty', '').strip()
        category = request.GET.get('category', '').strip()
        search = request.GET.get('search', '').strip()
        
        # Build queryset - only active videos
        queryset = VideoLesson.objects.filter(is_active=True)
        
        # Apply filters
        if difficulty and difficulty != 'all':
            queryset = queryset.filter(difficulty=difficulty)
        
        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        if search:
            # Search in title, description, and tags (JSONField)
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        # Order by order field, then by creation date
        videos = queryset.order_by('order', '-created_at')
        
        # Serialize
        serializer = VideoLessonSerializer(videos, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'videos': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Videos list error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            "success": False,
            "message": "An error occurred while fetching video lessons",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def video_detail(request, slug):
    """Get a specific video lesson by slug for public viewing"""
    try:
        video = VideoLesson.objects.get(slug=slug, is_active=True)
        serializer = VideoLessonSerializer(video, context={'request': request})
        return Response({
            'success': True,
            'video': serializer.data
        })
    except VideoLesson.DoesNotExist:
        return Response({
            "success": False,
            "message": "Video lesson not found"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Video detail error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            "success": False,
            "message": "An error occurred while fetching the video lesson",
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def video_engagement(request, slug):
    """Get or update engagement stats (likes, saves, playlist, shares) for a video"""
    try:
        video = VideoLesson.objects.get(slug=slug, is_active=True)
    except VideoLesson.DoesNotExist:
        return Response({"message": "Video lesson not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def serialize_response():
        engagements = VideoEngagement.objects.filter(video=video)
        likes = engagements.filter(liked=True).count()
        saves = engagements.filter(saved=True).count()
        playlists = engagements.exclude(playlist_name__isnull=True).exclude(playlist_name__exact='').count()
        shares = video.share_events.count()
        user_state = {
            'liked': False,
            'saved': False,
            'playlist_name': None,
        }
        if request.user.is_authenticated:
            engagement = engagements.filter(user=request.user).first()
            if engagement:
                user_state = {
                    'liked': engagement.liked,
                    'saved': engagement.saved,
                    'playlist_name': engagement.playlist_name,
                }
        subscriber_count = ChannelSubscription.objects.filter(channel_slug='elora-english', is_active=True).count()
        is_subscribed = False
        if request.user.is_authenticated:
            is_subscribed = ChannelSubscription.objects.filter(
                user=request.user,
                channel_slug='elora-english',
                is_active=True
            ).exists()
        
        return {
            'video_id': video.id,
            'counts': {
                'likes': likes,
                'saves': saves,
                'playlists': playlists,
                'shares': shares,
                'subscribers': subscriber_count,
            },
            'user_state': user_state,
            'subscribed': is_subscribed,
        }
    
    if request.method == 'GET':
        return Response({'success': True, **serialize_response()})
    
    if not request.user.is_authenticated:
        return Response({"message": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    action = request.data.get('action')
    playlist_name = request.data.get('playlist_name', '').strip() or None
    
    engagement, _ = VideoEngagement.objects.get_or_create(user=request.user, video=video)
    
    if action == 'like':
        engagement.liked = not engagement.liked
    elif action == 'save':
        engagement.saved = not engagement.saved
    elif action == 'playlist':
        if engagement.playlist_name and playlist_name is None:
            # toggle off existing playlist
            engagement.playlist_name = None
        else:
            engagement.playlist_name = playlist_name or 'Watch Later'
    elif action == 'share':
        method = request.data.get('method')
        VideoShareEvent.objects.create(video=video, user=request.user, method=method)
    else:
        return Response({"message": "Unknown engagement action"}, status=status.HTTP_400_BAD_REQUEST)
    
    engagement.save()
    return Response({'success': True, **serialize_response()})


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def channel_subscription(request):
    """Get or toggle channel subscription for the authenticated user"""
    channel_slug = request.data.get('channel_slug') or request.GET.get('channel_slug') or 'elora-english'
    channel_name = request.data.get('channel_name') or 'Elora English'
    
    total = ChannelSubscription.objects.filter(channel_slug=channel_slug, is_active=True).count()
    is_subscribed = False
    if request.user.is_authenticated:
        is_subscribed = ChannelSubscription.objects.filter(
            user=request.user,
            channel_slug=channel_slug,
            is_active=True
        ).exists()
    
    if request.method == 'GET':
        return Response({
            'success': True,
            'channel_slug': channel_slug,
            'channel_name': channel_name,
            'subscribers': total,
            'subscribed': is_subscribed,
        })
    
    if not request.user.is_authenticated:
        return Response({"message": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    subscribe = request.data.get('subscribe')
    record, _ = ChannelSubscription.objects.get_or_create(
        user=request.user,
        channel_slug=channel_slug,
        defaults={'channel_name': channel_name}
    )
    
    if subscribe is False or (subscribe is None and record.is_active):
        record.is_active = False
        record.unsubscribed_at = timezone.now()
    else:
        record.is_active = True
        record.channel_name = channel_name
        record.unsubscribed_at = None
    record.save()
    
    total = ChannelSubscription.objects.filter(channel_slug=channel_slug, is_active=True).count()
    return Response({
        'success': True,
        'subscribed': record.is_active,
        'subscribers': total,
    })


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def video_practice_comments(request, slug):
    """List or create practice comments for a video"""
    try:
        video = VideoLesson.objects.get(slug=slug, is_active=True)
    except VideoLesson.DoesNotExist:
        return Response({"message": "Video lesson not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        comments = PracticeComment.objects.filter(video=video)
        if not request.user.is_authenticated:
            comments = comments.filter(is_approved=True)
        elif not request.user.is_staff:
            comments = comments.filter(Q(is_approved=True) | Q(user=request.user))
        serializer = PracticeCommentSerializer(
            comments.order_by('-created_at')[:50],
            many=True,
            context={'request': request}
        )
        return Response({'success': True, 'comments': serializer.data})
    
    if not request.user.is_authenticated:
        return Response({"message": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    content = request.data.get('content', '').strip()
    if not content:
        return Response({"message": "Comment cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)
    
    comment = PracticeComment.objects.create(
        video=video,
        user=request.user,
        content=content,
        is_approved=True  # auto-approve for now
    )
    serializer = PracticeCommentSerializer(comment, context={'request': request})
    return Response({'success': True, 'comment': serializer.data}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def video_share_event(request, slug):
    """Record a share event for analytics purposes"""
    try:
        video = VideoLesson.objects.get(slug=slug, is_active=True)
    except VideoLesson.DoesNotExist:
        return Response({"message": "Video lesson not found"}, status=status.HTTP_404_NOT_FOUND)
    
    method = request.data.get('method')
    user = request.user if request.user.is_authenticated else None
    VideoShareEvent.objects.create(video=video, user=user, method=method)
    return Response({'success': True, 'message': 'Share recorded'})


# ============= Adults Common Features API Endpoints =============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_common_lessons(request):
    """Get all common lessons available for adults"""
    try:
        category = request.GET.get('category', '').strip()
        difficulty = request.GET.get('difficulty', '').strip()
        search = request.GET.get('search', '').strip()
        
        queryset = CommonLesson.objects.filter(is_active=True)
        
        if category:
            queryset = queryset.filter(category=category)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        lessons = queryset.order_by('order', '-created_at')
        serializer = CommonLessonSerializer(lessons, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'lessons': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Adults common lessons error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred while fetching common lessons',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_common_lesson_detail(request, lesson_id):
    """Get details of a specific common lesson"""
    try:
        lesson = CommonLesson.objects.get(id=lesson_id, is_active=True)
        serializer = CommonLessonSerializer(lesson, context={'request': request})
        
        # Get user's enrollment if exists
        enrollment = CommonLessonEnrollment.objects.filter(
            user=request.user, lesson=lesson
        ).first()
        enrollment_data = CommonLessonEnrollmentSerializer(enrollment).data if enrollment else None
        
        return Response({
            'success': True,
            'lesson': serializer.data,
            'enrollment': enrollment_data
        })
    except CommonLesson.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Lesson not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Adults common lesson detail error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_common_lesson_enroll(request, lesson_id):
    """Enroll in a common lesson"""
    try:
        lesson = CommonLesson.objects.get(id=lesson_id, is_active=True)
        enrollment, created = CommonLessonEnrollment.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'enrolled_at': timezone.now()}
        )
        
        if not created:
            return Response({
                'success': True,
                'message': 'Already enrolled',
                'enrollment': CommonLessonEnrollmentSerializer(enrollment).data
            })
        
        # Update lesson views
        lesson.views += 1
        lesson.save(update_fields=['views'])
        
        serializer = CommonLessonEnrollmentSerializer(enrollment)
        return Response({
            'success': True,
            'message': 'Successfully enrolled',
            'enrollment': serializer.data
        }, status=status.HTTP_201_CREATED)
    except CommonLesson.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Lesson not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Adults common lesson enroll error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_common_lesson_enrollments(request):
    """Get user's common lesson enrollments"""
    try:
        enrollments = CommonLessonEnrollment.objects.filter(user=request.user).order_by('-enrolled_at')
        serializer = CommonLessonEnrollmentSerializer(enrollments, many=True)
        
        return Response({
            'success': True,
            'enrollments': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Adults common lesson enrollments error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_common_lesson_progress(request, lesson_id):
    """Update progress for a common lesson"""
    try:
        lesson = CommonLesson.objects.get(id=lesson_id, is_active=True)
        enrollment = CommonLessonEnrollment.objects.get(user=request.user, lesson=lesson)
        
        progress = request.data.get('progress_percentage', enrollment.progress_percentage)
        score = request.data.get('score', enrollment.score)
        time_spent = request.data.get('time_spent_minutes', 0)
        completed = request.data.get('completed', False)
        
        enrollment.progress_percentage = min(100, max(0, float(progress)))
        enrollment.score = max(0, min(100, float(score)))
        enrollment.time_spent_minutes += int(time_spent)
        enrollment.attempts += 1
        
        if completed and not enrollment.completed:
            enrollment.completed = True
            enrollment.completed_at = timezone.now()
            lesson.completion_count += 1
            
            # Update average score
            total_completions = lesson.completion_count
            current_avg = lesson.average_score
            lesson.average_score = ((current_avg * (total_completions - 1)) + score) / total_completions
            lesson.save(update_fields=['completion_count', 'average_score'])
        
        if not enrollment.started_at:
            enrollment.started_at = timezone.now()
        
        enrollment.save()
        
        serializer = CommonLessonEnrollmentSerializer(enrollment)
        return Response({
            'success': True,
            'enrollment': serializer.data
        })
    except (CommonLesson.DoesNotExist, CommonLessonEnrollment.DoesNotExist) as e:
        return Response({
            'success': False,
            'message': 'Lesson or enrollment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Adults common lesson progress error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_weekly_challenges(request):
    """Get active weekly challenges"""
    try:
        today = timezone.now().date()
        challenges = WeeklyChallenge.objects.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        ).order_by('-start_date')
        
        serializer = WeeklyChallengeSerializer(challenges, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'challenges': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Adults weekly challenges error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_weekly_challenge_enroll(request, challenge_id):
    """Enroll in a weekly challenge"""
    try:
        challenge = WeeklyChallenge.objects.get(id=challenge_id, is_active=True)
        enrollment, created = UserWeeklyChallenge.objects.get_or_create(
            user=request.user,
            challenge=challenge,
            defaults={
                'enrolled_at': timezone.now(),
                'started_at': timezone.now()
            }
        )
        
        if not created:
            return Response({
                'success': True,
                'message': 'Already enrolled',
                'enrollment': UserWeeklyChallengeSerializer(enrollment).data
            })
        
        serializer = UserWeeklyChallengeSerializer(enrollment)
        return Response({
            'success': True,
            'message': 'Successfully enrolled in challenge',
            'enrollment': serializer.data
        }, status=status.HTTP_201_CREATED)
    except WeeklyChallenge.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Challenge not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Adults weekly challenge enroll error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_my_weekly_challenges(request):
    """Get user's weekly challenges"""
    try:
        enrollments = UserWeeklyChallenge.objects.filter(user=request.user).order_by('-enrolled_at')
        serializer = UserWeeklyChallengeSerializer(enrollments, many=True)
        
        return Response({
            'success': True,
            'challenges': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Adults my weekly challenges error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_weekly_challenge_update_progress(request, challenge_id):
    """Update progress for a weekly challenge"""
    try:
        challenge = WeeklyChallenge.objects.get(id=challenge_id, is_active=True)
        enrollment = UserWeeklyChallenge.objects.get(user=request.user, challenge=challenge)
        
        progress_increment = request.data.get('progress_increment', 0)
        enrollment.current_progress += int(progress_increment)
        
        # Calculate progress percentage
        if challenge.requirement_value > 0:
            enrollment.progress_percentage = min(100, (enrollment.current_progress / challenge.requirement_value) * 100)
        
        # Check if completed
        if enrollment.current_progress >= challenge.requirement_value and not enrollment.completed:
            enrollment.completed = True
            enrollment.completed_at = timezone.now()
            enrollment.points_earned = challenge.points_reward
            
            # Award points to user profile
            profile = request.user.profile
            profile.points += challenge.points_reward
            profile.save(update_fields=['points'])
        
        enrollment.save()
        
        serializer = UserWeeklyChallengeSerializer(enrollment)
        return Response({
            'success': True,
            'enrollment': serializer.data
        })
    except (WeeklyChallenge.DoesNotExist, UserWeeklyChallenge.DoesNotExist) as e:
        return Response({
            'success': False,
            'message': 'Challenge or enrollment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Adults weekly challenge update progress error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def adults_learning_goals(request):
    """Get or create learning goals"""
    if request.method == 'GET':
        try:
            is_active = request.GET.get('is_active', 'true').lower() == 'true'
            goals = LearningGoal.objects.filter(user=request.user, is_active=is_active).order_by('-created_at')
            serializer = LearningGoalSerializer(goals, many=True)
            
            return Response({
                'success': True,
                'goals': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            logger.error(f"Adults learning goals GET error: {str(e)}")
            return Response({
                'success': False,
                'message': 'An error occurred',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        try:
            data = request.data.copy()
            data['user'] = request.user.id
            serializer = LearningGoalSerializer(data=data)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'goal': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Adults learning goal create error: {str(e)}")
            return Response({
                'success': False,
                'message': 'An error occurred',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_learning_goal_create(request):
    """Create a new learning goal"""
    return adults_learning_goals(request)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def adults_learning_goal_detail(request, goal_id):
    """Get, update, or delete a learning goal"""
    try:
        goal = LearningGoal.objects.get(id=goal_id, user=request.user)
    except LearningGoal.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Goal not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = LearningGoalSerializer(goal)
        return Response({
            'success': True,
            'goal': serializer.data
        })
    
    elif request.method == 'PUT':
        serializer = LearningGoalSerializer(goal, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'goal': serializer.data
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        goal.delete()
        return Response({
            'success': True,
            'message': 'Goal deleted'
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_learning_goal_update(request, goal_id):
    """Update a learning goal"""
    return adults_learning_goal_detail(request, goal_id)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_recommendations(request):
    """Get personalized recommendations for user"""
    try:
        # Get active, non-dismissed recommendations
        recommendations = PersonalizedRecommendation.objects.filter(
            user=request.user,
            dismissed=False
        ).exclude(
            expires_at__lt=timezone.now()
        ).order_by('-priority', '-created_at')[:10]
        
        serializer = PersonalizedRecommendationSerializer(recommendations, many=True)
        
        return Response({
            'success': True,
            'recommendations': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Adults recommendations error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_recommendation_view(request, recommendation_id):
    """Mark a recommendation as viewed"""
    try:
        recommendation = PersonalizedRecommendation.objects.get(
            id=recommendation_id,
            user=request.user
        )
        recommendation.viewed = True
        recommendation.viewed_at = timezone.now()
        recommendation.save()
        
        return Response({
            'success': True,
            'message': 'Recommendation marked as viewed'
        })
    except PersonalizedRecommendation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Recommendation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_recommendation_accept(request, recommendation_id):
    """Accept a recommendation"""
    try:
        recommendation = PersonalizedRecommendation.objects.get(
            id=recommendation_id,
            user=request.user
        )
        recommendation.accepted = True
        recommendation.accepted_at = timezone.now()
        recommendation.viewed = True
        recommendation.viewed_at = timezone.now()
        recommendation.save()
        
        return Response({
            'success': True,
            'message': 'Recommendation accepted'
        })
    except PersonalizedRecommendation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Recommendation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_recommendation_dismiss(request, recommendation_id):
    """Dismiss a recommendation"""
    try:
        recommendation = PersonalizedRecommendation.objects.get(
            id=recommendation_id,
            user=request.user
        )
        recommendation.dismissed = True
        recommendation.dismissed_at = timezone.now()
        recommendation.save()
        
        return Response({
            'success': True,
            'message': 'Recommendation dismissed'
        })
    except PersonalizedRecommendation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Recommendation not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_spaced_repetition_items(request):
    """Get all spaced repetition items for user"""
    try:
        item_type = request.GET.get('item_type', '').strip()
        queryset = SpacedRepetitionItem.objects.filter(user=request.user)
        
        if item_type:
            queryset = queryset.filter(item_type=item_type)
        
        items = queryset.order_by('next_review_date')
        serializer = SpacedRepetitionItemSerializer(items, many=True)
        
        return Response({
            'success': True,
            'items': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Adults spaced repetition items error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_spaced_repetition_due(request):
    """Get items due for review today"""
    try:
        today = timezone.now().date()
        items = SpacedRepetitionItem.objects.filter(
            user=request.user,
            next_review_date__lte=today
        ).order_by('next_review_date')
        
        serializer = SpacedRepetitionItemSerializer(items, many=True)
        
        return Response({
            'success': True,
            'items': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Adults spaced repetition due error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_spaced_repetition_review(request, item_id):
    """Record a review session for spaced repetition"""
    try:
        item = SpacedRepetitionItem.objects.get(id=item_id, user=request.user)
        quality = request.data.get('quality', 3)  # 0-5 scale
        
        # SM-2 Algorithm implementation
        if quality < 3:
            # Incorrect answer
            item.repetitions = 0
            item.interval_days = 1
            item.times_incorrect += 1
        else:
            # Correct answer
            item.times_correct += 1
            if item.repetitions == 0:
                item.interval_days = 1
            elif item.repetitions == 1:
                item.interval_days = 6
            else:
                item.interval_days = int(item.interval_days * item.ease_factor)
            
            item.repetitions += 1
            
            # Update ease factor
            item.ease_factor = max(1.3, item.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
        
        # Update next review date
        from datetime import timedelta
        item.next_review_date = timezone.now().date() + timedelta(days=item.interval_days)
        item.times_reviewed += 1
        item.last_reviewed = timezone.now()
        
        # Calculate mastery level
        if item.times_reviewed > 0:
            item.mastery_level = (item.times_correct / item.times_reviewed) * 100
        
        item.save()
        
        serializer = SpacedRepetitionItemSerializer(item)
        return Response({
            'success': True,
            'item': serializer.data
        })
    except SpacedRepetitionItem.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Item not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Adults spaced repetition review error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_microlearning_modules(request):
    """Get microlearning modules"""
    try:
        category = request.GET.get('category', '').strip()
        queryset = MicrolearningModule.objects.filter(is_active=True)
        
        if category:
            queryset = queryset.filter(category=category)
        
        modules = queryset.order_by('-is_featured', 'order', '-created_at')
        serializer = MicrolearningModuleSerializer(modules, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'modules': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Adults microlearning modules error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_microlearning_featured(request):
    """Get featured microlearning modules"""
    try:
        modules = MicrolearningModule.objects.filter(
            is_active=True,
            is_featured=True
        ).order_by('order', '-created_at')[:5]
        
        serializer = MicrolearningModuleSerializer(modules, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'modules': serializer.data,
            'count': len(serializer.data)
        })
    except Exception as e:
        logger.error(f"Adults microlearning featured error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_microlearning_module_detail(request, module_id):
    """Get details of a microlearning module"""
    try:
        module = MicrolearningModule.objects.get(id=module_id, is_active=True)
        serializer = MicrolearningModuleSerializer(module, context={'request': request})
        
        # Get user progress
        progress = MicrolearningProgress.objects.filter(
            user=request.user, module=module
        ).first()
        progress_data = MicrolearningProgressSerializer(progress).data if progress else None
        
        return Response({
            'success': True,
            'module': serializer.data,
            'progress': progress_data
        })
    except MicrolearningModule.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Module not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Adults microlearning module detail error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adults_microlearning_complete(request, module_id):
    """Mark a microlearning module as completed"""
    try:
        module = MicrolearningModule.objects.get(id=module_id, is_active=True)
        progress, created = MicrolearningProgress.objects.get_or_create(
            user=request.user,
            module=module
        )
        
        score = request.data.get('score', 0)
        time_spent = request.data.get('time_spent_minutes', 0)
        
        progress.score = max(0, min(100, float(score)))
        progress.time_spent_minutes += int(time_spent)
        progress.attempts += 1
        progress.completed = True
        progress.completed_at = timezone.now()
        progress.save()
        
        # Update module stats
        module.completion_count += 1
        module.views += 1
        module.save(update_fields=['completion_count', 'views'])
        
        # Award points
        profile = request.user.profile
        profile.points += module.points_reward
        profile.save(update_fields=['points'])
        
        serializer = MicrolearningProgressSerializer(progress)
        return Response({
            'success': True,
            'progress': serializer.data
        })
    except MicrolearningModule.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Module not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Adults microlearning complete error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_progress_analytics(request):
    """Get progress analytics for user"""
    try:
        category = request.GET.get('category', '').strip()
        period_type = request.GET.get('period_type', 'weekly').strip()
        
        # Calculate period dates
        today = timezone.now().date()
        if period_type == 'weekly':
            period_start = today - timedelta(days=7)
            period_end = today
        elif period_type == 'monthly':
            period_start = today - timedelta(days=30)
            period_end = today
        else:
            period_start = today - timedelta(days=7)
            period_end = today
        
        queryset = ProgressAnalytics.objects.filter(
            user=request.user,
            period_start=period_start,
            period_end=period_end,
            period_type=period_type
        )
        
        if category:
            queryset = queryset.filter(category=category)
        
        analytics = queryset.first()
        
        if not analytics:
            # Create default analytics if none exists
            analytics = ProgressAnalytics.objects.create(
                user=request.user,
                category=category or 'adults_beginner',
                period_start=period_start,
                period_end=period_end,
                period_type=period_type
            )
        
        serializer = ProgressAnalyticsSerializer(analytics)
        return Response({
            'success': True,
            'analytics': serializer.data
        })
    except Exception as e:
        logger.error(f"Adults progress analytics error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _get_adults_analytics_summary(user):
    """Helper function to get summary analytics across all adult categories"""
    try:
        # Get progress for all adult categories
        categories = ['adults_beginner', 'adults_intermediate', 'adults_advanced']
        summary = {}
        
        for category in categories:
            progress = CategoryProgress.objects.filter(
                user=user,
                category=category
            ).first()
            
            if progress:
                summary[category] = {
                    'total_points': progress.total_points,
                    'lessons_completed': progress.lessons_completed,
                    'practice_time_minutes': progress.practice_time_minutes,
                    'average_score': progress.average_score,
                    'progress_percentage': progress.progress_percentage,
                    'streak': progress.total_streak
                }
            else:
                summary[category] = {
                    'total_points': 0,
                    'lessons_completed': 0,
                    'practice_time_minutes': 0,
                    'average_score': 0,
                    'progress_percentage': 0,
                    'streak': 0
                }
        
        # Calculate totals
        total_points = sum(s['total_points'] for s in summary.values())
        total_lessons = sum(s['lessons_completed'] for s in summary.values())
        total_time = sum(s['practice_time_minutes'] for s in summary.values())
        avg_score = sum(s['average_score'] for s in summary.values()) / len(categories) if categories else 0
        
        return {
            'summary': summary,
            'totals': {
                'total_points': total_points,
                'total_lessons': total_lessons,
                'total_time_minutes': total_time,
                'average_score': avg_score
            }
        }
    except Exception as e:
        logger.error(f"Adults analytics summary error: {str(e)}")
        return {
            'summary': {},
            'totals': {
                'total_points': 0,
                'total_lessons': 0,
                'total_time_minutes': 0,
                'average_score': 0
            }
        }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_analytics_summary(request):
    """Get summary analytics across all adult categories"""
    try:
        result = _get_adults_analytics_summary(request.user)
        return Response({
            'success': True,
            **result
        })
    except Exception as e:
        logger.error(f"Adults analytics summary error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adults_dashboard(request):
    """Get comprehensive dashboard data for adults page"""
    try:
        # Get all relevant data
        from django.db.models import Sum, Avg, Count
        
        # Common lessons enrollments
        common_enrollments = CommonLessonEnrollment.objects.filter(user=request.user)
        common_lessons_count = common_enrollments.count()
        common_lessons_completed = common_enrollments.filter(completed=True).count()
        
        # Weekly challenges
        today = timezone.now().date()
        active_challenges = WeeklyChallenge.objects.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        ).count()
        user_challenges = UserWeeklyChallenge.objects.filter(user=request.user)
        challenges_completed = user_challenges.filter(completed=True).count()
        
        # Learning goals
        active_goals = LearningGoal.objects.filter(user=request.user, is_active=True, completed=False).count()
        completed_goals = LearningGoal.objects.filter(user=request.user, completed=True).count()
        
        # Recommendations
        recommendations_count = PersonalizedRecommendation.objects.filter(
            user=request.user,
            dismissed=False
        ).exclude(expires_at__lt=timezone.now()).count()
        
        # Spaced repetition
        due_items = SpacedRepetitionItem.objects.filter(
            user=request.user,
            next_review_date__lte=today
        ).count()
        
        # Microlearning
        microlearning_completed = MicrolearningProgress.objects.filter(
            user=request.user,
            completed=True
        ).count()
        
        # Progress summary
        analytics_data = _get_adults_analytics_summary(request.user)
        analytics_summary = analytics_data.get('summary', {})
        
        # Get user's current streak from profile
        try:
            profile = UserProfile.objects.get(user=request.user)
            current_streak = profile.current_streak or 0
        except UserProfile.DoesNotExist:
            current_streak = 0
        
        return Response({
            'success': True,
            'dashboard': {
                'common_lessons': {
                    'total': common_lessons_count,
                    'completed': common_lessons_completed
                },
                'weekly_challenges': {
                    'active': active_challenges,
                    'completed': challenges_completed
                },
                'learning_goals': {
                    'active': active_goals,
                    'completed': completed_goals
                },
                'recommendations': {
                    'pending': recommendations_count
                },
                'spaced_repetition': {
                    'due_items': due_items
                },
                'microlearning': {
                    'completed': microlearning_completed
                },
                'progress_summary': analytics_summary,
                'current_streak': current_streak
            }
        })
    except Exception as e:
        logger.error(f"Adults dashboard error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'message': 'An error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Dictionary Endpoints =============
@api_view(['GET'])
@permission_classes([AllowAny])
def dictionary_search(request):
    """Search dictionary entries"""
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'success': False, 'error': 'Query required'}, status=status.HTTP_400_BAD_REQUEST)
    
    entries = list(DictionaryEntry.objects.filter(
        word__icontains=query, is_active=True
    )[:20])

    serializer = DictionaryEntrySerializer(entries, many=True, context={'request': request})
    return Response({'success': True, 'data': serializer.data})


@api_view(['GET'])
@permission_classes([AllowAny])
def dictionary_lookup(request, word):
    """Lookup word details"""
    try:
        entry = DictionaryEntry.objects.get(word__iexact=word, is_active=True)
        serializer = DictionaryEntrySerializer(entry, context={'request': request})
        return Response({'success': True, 'data': serializer.data})
    except DictionaryEntry.DoesNotExist:
        return Response({'success': False, 'error': 'Word not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_dictionary(request):
    """Get user's personal dictionary"""
    entries = list(UserDictionary.objects.filter(user=request.user).order_by('-added_at'))
    serializer = UserDictionarySerializer(entries, many=True, context={'request': request})
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_dictionary(request):
    """Add word to personal dictionary"""
    word = request.data.get('word', '').strip()
    dictionary_entry_id = request.data.get('dictionary_entry_id')
    
    if not word and not dictionary_entry_id:
        return Response({'success': False, 'error': 'Word or dictionary_entry_id required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        if dictionary_entry_id:
            entry = DictionaryEntry.objects.get(id=dictionary_entry_id, is_active=True)
        else:
            entry = DictionaryEntry.objects.get(word__iexact=word, is_active=True)
        
        user_dict, created = UserDictionary.objects.get_or_create(
            user=request.user,
            dictionary_entry=entry,
            defaults={'mastery_level': 0.0}
        )
        
        serializer = UserDictionarySerializer(user_dict, context={'request': request})
        return Response({
            'success': True,
            'data': serializer.data,
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    except DictionaryEntry.DoesNotExist:
        return Response({'success': False, 'error': 'Word not found in dictionary'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_dictionary(request, entry_id):
    """Remove word from personal dictionary"""
    try:
        user_dict = UserDictionary.objects.get(user=request.user, id=entry_id)
        user_dict.delete()
        return Response({'success': True, 'message': 'Removed from dictionary'})
    except UserDictionary.DoesNotExist:
        return Response({'success': False, 'error': 'Entry not found'}, status=status.HTTP_404_NOT_FOUND)


# ============= Flashcards Endpoints =============
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def flashcard_decks(request):
    """Get user's flashcard decks or create new deck"""
    if request.method == 'GET':
        decks = FlashcardDeck.objects.filter(user=request.user, is_active=True)
        serializer = FlashcardDeckSerializer(decks, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})
    else:  # POST
        title = request.data.get('title', '').strip()
        if not title:
            return Response({'success': False, 'error': 'Title required'}, status=status.HTTP_400_BAD_REQUEST)
        
        deck = FlashcardDeck.objects.create(
            user=request.user,
            title=title,
            description=request.data.get('description', ''),
            is_default=request.data.get('is_default', False)
        )
        serializer = FlashcardDeckSerializer(deck, context={'request': request})
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flashcard_deck_detail(request, deck_id):
    """Get deck details with cards"""
    try:
        deck = FlashcardDeck.objects.get(user=request.user, id=deck_id)
        cards = Flashcard.objects.filter(deck=deck).order_by('next_review_date')
        deck_serializer = FlashcardDeckSerializer(deck, context={'request': request})
        cards_serializer = FlashcardSerializer(cards, many=True, context={'request': request})
        return Response({
            'success': True,
            'deck': deck_serializer.data,
            'cards': cards_serializer.data
        })
    except FlashcardDeck.DoesNotExist:
        return Response({'success': False, 'error': 'Deck not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flashcards_due_for_review(request):
    """Get flashcards due for review"""
    today = timezone.now().date()
    deck_id = request.GET.get('deck_id')
    
    query = Flashcard.objects.filter(deck__user=request.user, next_review_date__lte=today)
    if deck_id:
        query = query.filter(deck_id=deck_id)
    
    cards = query.order_by('next_review_date')[:20]
    serializer = FlashcardSerializer(cards, many=True, context={'request': request})
    return Response({'success': True, 'data': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_flashcard_review(request):
    """Submit flashcard review result"""
    flashcard_id = request.data.get('flashcard_id')
    quality = request.data.get('quality', 3)  # 0-5 scale
    time_spent = request.data.get('time_spent_seconds', 0)
    
    try:
        flashcard = Flashcard.objects.get(deck__user=request.user, id=flashcard_id)
        
        # Create review record
        was_correct = quality >= 3
        FlashcardReview.objects.create(
            flashcard=flashcard,
            user=request.user,
            quality=quality,
            was_correct=was_correct,
            time_spent_seconds=time_spent
        )
        
        # Update flashcard using SM-2 algorithm (simplified)
        flashcard.times_reviewed += 1
        if was_correct:
            flashcard.times_correct += 1
            flashcard.repetitions += 1
            flashcard.interval_days = flashcard.interval_days * 2
            flashcard.next_review_date = timezone.now().date() + timedelta(days=flashcard.interval_days)
        else:
            flashcard.times_incorrect += 1
            flashcard.repetitions = 0
            flashcard.interval_days = 1
            flashcard.next_review_date = timezone.now().date() + timedelta(days=1)
        
        flashcard.last_reviewed = timezone.now()
        flashcard.mastery_level = (flashcard.times_correct / flashcard.times_reviewed * 100) if flashcard.times_reviewed > 0 else 0
        flashcard.save()
        
        serializer = FlashcardSerializer(flashcard, context={'request': request})
        return Response({'success': True, 'data': serializer.data})
    except Flashcard.DoesNotExist:
        return Response({'success': False, 'error': 'Flashcard not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_flashcards_from_vocabulary(request):
    """Auto-generate flashcards from user's vocabulary"""
    return Response({'success': False, 'error': 'Not implemented yet'}, status=status.HTTP_501_NOT_IMPLEMENTED)


# ============= Daily Goals Endpoints =============
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def daily_goals(request):
    """Get or create daily goals"""
    today = timezone.now().date()
    
    if request.method == 'GET':
        goals = DailyGoal.objects.filter(user=request.user, goal_date=today)
        serializer = DailyGoalSerializer(goals, many=True)
        return Response({'success': True, 'data': serializer.data})
    else:  # POST
        goal_type = request.data.get('goal_type')
        target_value = request.data.get('target_value')
        
        if not goal_type or not target_value:
            return Response({'success': False, 'error': 'goal_type and target_value required'}, status=status.HTTP_400_BAD_REQUEST)
        
        goal, created = DailyGoal.objects.get_or_create(
            user=request.user,
            goal_type=goal_type,
            goal_date=today,
            defaults={'target_value': target_value, 'current_value': 0}
        )
        
        serializer = DailyGoalSerializer(goal)
        return Response({
            'success': True,
            'data': serializer.data,
            'created': created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_daily_goal(request, goal_id):
    """Update daily goal progress"""
    try:
        goal = DailyGoal.objects.get(user=request.user, id=goal_id)
        goal.current_value = request.data.get('current_value', goal.current_value)
        
        if goal.current_value >= goal.target_value and not goal.completed:
            goal.completed = True
            goal.completed_at = timezone.now()
        
        goal.save()
        serializer = DailyGoalSerializer(goal)
        return Response({'success': True, 'data': serializer.data})
    except DailyGoal.DoesNotExist:
        return Response({'success': False, 'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_goals_history(request):
    """Get daily goals history"""
    days = int(request.GET.get('days', 7))
    start_date = timezone.now().date() - timedelta(days=days)
    
    goals = DailyGoal.objects.filter(
        user=request.user,
        goal_date__gte=start_date
    ).order_by('-goal_date')
    
    serializer = DailyGoalSerializer(goals, many=True)
    return Response({'success': True, 'data': serializer.data})


# ============= Toolbar Preferences =============
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def toolbar_preferences(request):
    """Get or update toolbar preferences"""
    preference, created = UserToolbarPreference.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserToolbarPreferenceSerializer(preference)
        return Response({'success': True, 'data': serializer.data})
    else:  # PUT
        serializer = UserToolbarPreferenceSerializer(preference, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


# ============= Multi-Mode Practice =============
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_multi_mode_practice(request):
    """Start multi-mode practice session"""
    mode = request.data.get('mode')
    if not mode or mode not in ['listening', 'speaking', 'reading', 'writing']:
        return Response({'success': False, 'error': 'Valid mode required'}, status=status.HTTP_400_BAD_REQUEST)
    
    session = MultiModePracticeSession.objects.create(
        user=request.user,
        mode=mode,
        content_type=request.data.get('content_type', ''),
        content_id=request.data.get('content_id', ''),
        details=request.data.get('details', {})
    )
    
    serializer = MultiModePracticeSessionSerializer(session, context={'request': request})
    return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_multi_mode_practice(request, session_id):
    """Complete multi-mode practice session"""
    try:
        session = MultiModePracticeSession.objects.get(user=request.user, id=session_id)
        session.score = request.data.get('score', 0.0)
        session.points_earned = request.data.get('points_earned', 0)
        session.duration_minutes = request.data.get('duration_minutes', 0)
        session.items_completed = request.data.get('items_completed', 0)
        session.items_correct = request.data.get('items_correct', 0)
        session.items_incorrect = request.data.get('items_incorrect', 0)
        session.completed_at = timezone.now()
        session.details.update(request.data.get('details', {}))
        session.save()
        
        serializer = MultiModePracticeSessionSerializer(session, context={'request': request})
        return Response({'success': True, 'data': serializer.data})
    except MultiModePracticeSession.DoesNotExist:
        return Response({'success': False, 'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def multi_mode_practice_history(request):
    """Get multi-mode practice history"""
    mode = request.GET.get('mode')
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    sessions = MultiModePracticeSession.objects.filter(
        user=request.user,
        started_at__gte=start_date
    )
    
    if mode:
        sessions = sessions.filter(mode=mode)
    
    sessions = sessions.order_by('-started_at')[:50]
    serializer = MultiModePracticeSessionSerializer(sessions, many=True, context={'request': request})
    return Response({'success': True, 'data': serializer.data})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_multi_mode_practice_session(request, session_id):
    """Delete a specific multi-mode practice session"""
    try:
        session = MultiModePracticeSession.objects.get(id=session_id, user=request.user)
        session.delete()
        return Response({'success': True, 'message': 'Session deleted successfully'})
    except MultiModePracticeSession.DoesNotExist:
        return Response({'success': False, 'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_multi_mode_practice_sessions(request):
    """Delete multiple multi-mode practice sessions (bulk delete)"""
    session_ids = request.data.get('session_ids', [])
    delete_old = request.data.get('delete_old', False)
    days_old = int(request.data.get('days_old', 30))
    
    try:
        if delete_old:
            # Delete sessions older than specified days
            cutoff_date = timezone.now() - timedelta(days=days_old)
            deleted_count = MultiModePracticeSession.objects.filter(
                user=request.user,
                started_at__lt=cutoff_date
            ).delete()[0]
            return Response({
                'success': True,
                'message': f'Deleted {deleted_count} old session(s)',
                'deleted_count': deleted_count
            })
        elif session_ids:
            # Delete specific sessions
            deleted_count = MultiModePracticeSession.objects.filter(
                id__in=session_ids,
                user=request.user
            ).delete()[0]
            return Response({
                'success': True,
                'message': f'Deleted {deleted_count} session(s)',
                'deleted_count': deleted_count
            })
        else:
            return Response({
                'success': False,
                'error': 'No sessions specified for deletion'
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error deleting sessions: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to delete sessions'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Business Email Coach =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def email_templates(request):
    """Get email templates"""
    template_type = request.GET.get('type')
    difficulty = request.GET.get('difficulty')
    
    templates = EmailTemplate.objects.filter(is_active=True)
    if template_type:
        templates = templates.filter(template_type=template_type)
    if difficulty:
        templates = templates.filter(difficulty=difficulty)
    
    templates = templates.order_by('order')[:50]
    serializer = EmailTemplateSerializer(templates, many=True, context={'request': request})
    return Response({'success': True, 'data': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def email_template_detail(request, template_id):
    """Get email template details"""
    try:
        template = EmailTemplate.objects.get(id=template_id, is_active=True)
        template.usage_count += 1
        template.save()
        serializer = EmailTemplateSerializer(template, context={'request': request})
        return Response({'success': True, 'data': serializer.data})
    except EmailTemplate.DoesNotExist:
        return Response({'success': False, 'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_email_practice(request):
    """Submit email for AI feedback"""
    template_id = request.data.get('template_id')
    subject = request.data.get('subject', '')
    body = request.data.get('body', '')
    
    try:
        template = EmailTemplate.objects.get(id=template_id, is_active=True)
        
        # TODO: Add AI feedback logic here
        session = EmailPracticeSession.objects.create(
            user=request.user,
            template=template,
            subject=subject,
            body=body,
            grammar_score=75.0,
            tone_score=80.0,
            clarity_score=70.0,
            overall_score=75.0,
            feedback={'message': 'AI feedback will be implemented'},
            suggestions=[]
        )
        
        serializer = EmailPracticeSessionSerializer(session, context={'request': request})
        return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)
    except EmailTemplate.DoesNotExist:
        return Response({'success': False, 'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def email_practice_history(request):
    """Get email practice history"""
    sessions = EmailPracticeSession.objects.filter(user=request.user).order_by('-created_at')[:20]
    serializer = EmailPracticeSessionSerializer(sessions, many=True, context={'request': request})
    return Response({'success': True, 'data': serializer.data})


# ============= Pronunciation Analyzer =============
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_pronunciation_practice(request):
    """Submit pronunciation recording for analysis"""
    import base64
    import os
    from django.core.files.base import ContentFile
    from django.conf import settings
    
    target_text = request.data.get('target_text', '').strip()
    user_audio_data = request.data.get('user_audio_url', '')  # Base64 encoded audio
    user_audio_duration = float(request.data.get('user_audio_duration', 0.0))
    
    if not target_text:
        return Response({'success': False, 'error': 'target_text required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save audio file if provided
    audio_file_path = None
    if user_audio_data and user_audio_data.startswith('data:audio'):
        try:
            # Extract base64 data
            header, encoded = user_audio_data.split(',', 1)
            audio_data = base64.b64decode(encoded)
            
            # Create media directory if it doesn't exist
            audio_dir = os.path.join(settings.MEDIA_ROOT, 'pronunciation_recordings')
            os.makedirs(audio_dir, exist_ok=True)
            
            # Generate unique filename
            filename = f"pronunciation_{request.user.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.webm"
            file_path = os.path.join(audio_dir, filename)
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(audio_data)
            
            # Store relative path for URL
            audio_file_path = f'/media/pronunciation_recordings/{filename}'
        except Exception as e:
            logger.error(f"Error saving audio file: {str(e)}")
            # Continue without audio file
    
    # Basic pronunciation analysis
    # In production, integrate with speech recognition API (e.g., Google Cloud Speech-to-Text, Azure, etc.)
    target_lower = target_text.lower()
    word_count = len(target_text.split())
    
    # Calculate basic scores (can be enhanced with actual speech recognition)
    # For now, provide reasonable default scores that can be improved with real analysis
    base_score = 75.0
    accuracy_score = base_score
    pronunciation_score = base_score + 5.0  # Slightly higher default
    fluency_score = base_score - 5.0  # Slightly lower default
    
    # Adjust scores based on text complexity
    if word_count > 10:
        # Longer sentences are harder
        accuracy_score -= 5
        pronunciation_score -= 3
    elif word_count < 5:
        # Shorter phrases are easier
        accuracy_score += 5
        pronunciation_score += 3
    
    # Generate phonetic representation (basic - can use phonemizer library)
    target_phonetic = target_text  # Placeholder - can integrate phonemizer
    
    # Generate feedback and suggestions
    feedback_parts = []
    suggestions = []
    mistakes = []
    
    if pronunciation_score >= 80:
        feedback_parts.append("Great pronunciation! You're speaking clearly and accurately.")
    elif pronunciation_score >= 60:
        feedback_parts.append("Good effort! Your pronunciation is mostly clear with room for improvement.")
        suggestions.append("Practice speaking more slowly to improve clarity")
        suggestions.append("Focus on enunciating each word clearly")
    else:
        feedback_parts.append("Keep practicing! Focus on the fundamentals of pronunciation.")
        mistakes.append("Some words need clearer articulation")
        suggestions.append("Break down longer sentences into smaller phrases")
        suggestions.append("Listen to native speakers and mimic their pronunciation")
        suggestions.append("Practice tongue twisters to improve articulation")
    
    if fluency_score < 70:
        suggestions.append("Work on maintaining a steady pace while speaking")
        suggestions.append("Practice pausing at natural breaks in sentences")
    
    feedback = " ".join(feedback_parts) if feedback_parts else "Continue practicing to improve your pronunciation skills."
    
    # Create practice record
    practice = PronunciationPractice.objects.create(
        user=request.user,
        target_text=target_text,
        target_phonetic=target_phonetic,
        target_audio_url=request.data.get('target_audio_url', ''),
        user_audio_url=audio_file_path or '',
        user_audio_duration=user_audio_duration,
        accuracy_score=round(accuracy_score, 2),
        pronunciation_score=round(pronunciation_score, 2),
        fluency_score=round(fluency_score, 2),
        phonetic_analysis={
            'word_count': word_count,
            'character_count': len(target_text),
            'estimated_difficulty': 'medium' if word_count > 5 else 'easy'
        },
        mistakes=mistakes,
        feedback=feedback,
        suggestions=suggestions,
        attempts=1,
        difficulty_level=min(10, max(1, word_count // 2))
    )
    
    # Update user progress for all adult categories
    try:
        from .models import CategoryProgress
        adult_categories = ['adults_beginner', 'adults_intermediate', 'adults_advanced']
        
        for category in adult_categories:
            progress, _ = CategoryProgress.objects.get_or_create(
                user=request.user,
                category=category,
                defaults={'progress_percentage': 0}
            )
            # Increment pronunciation attempts
            progress.pronunciation_attempts = (progress.pronunciation_attempts or 0) + 1
            progress.last_activity = timezone.now()
            progress.save()
    except Exception as e:
        logger.error(f"Error updating pronunciation progress: {str(e)}")
    
    serializer = PronunciationPracticeSerializer(practice, context={'request': request})
    return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pronunciation_practice_history(request):
    """Get pronunciation practice history"""
    practices = PronunciationPractice.objects.filter(user=request.user).order_by('-practiced_at')[:20]
    serializer = PronunciationPracticeSerializer(practices, many=True, context={'request': request})
    return Response({'success': True, 'data': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pronunciation_statistics(request):
    """Get pronunciation statistics"""
    practices = PronunciationPractice.objects.filter(user=request.user)
    
    total_practices = practices.count()
    avg_accuracy = practices.aggregate(avg=Avg('accuracy_score'))['avg'] or 0
    avg_pronunciation = practices.aggregate(avg=Avg('pronunciation_score'))['avg'] or 0
    
    return Response({
        'success': True,
        'data': {
            'total_practices': total_practices,
            'average_accuracy': round(avg_accuracy, 2),
            'average_pronunciation': round(avg_pronunciation, 2)
        }
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_pronunciation_practice(request, practice_id):
    """Delete a specific pronunciation practice session"""
    try:
        practice = PronunciationPractice.objects.get(id=practice_id, user=request.user)
        practice.delete()
        return Response({'success': True, 'message': 'Practice session deleted successfully'})
    except PronunciationPractice.DoesNotExist:
        return Response({'success': False, 'error': 'Practice session not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_pronunciation_practices(request):
    """Delete multiple pronunciation practice sessions (bulk delete)"""
    practice_ids = request.data.get('practice_ids', [])
    delete_old = request.data.get('delete_old', False)
    days_old = int(request.data.get('days_old', 30))
    
    try:
        if delete_old:
            # Delete practices older than specified days
            cutoff_date = timezone.now() - timedelta(days=days_old)
            deleted_count = PronunciationPractice.objects.filter(
                user=request.user,
                practiced_at__lt=cutoff_date
            ).delete()[0]
            return Response({
                'success': True,
                'message': f'Deleted {deleted_count} old practice session(s)',
                'deleted_count': deleted_count
            })
        elif practice_ids:
            # Delete specific practices
            deleted_count = PronunciationPractice.objects.filter(
                id__in=practice_ids,
                user=request.user
            ).delete()[0]
            return Response({
                'success': True,
                'message': f'Deleted {deleted_count} practice session(s)',
                'deleted_count': deleted_count
            })
        else:
            return Response({
                'success': False,
                'error': 'No practices specified for deletion'
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error deleting pronunciation practices: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to delete practices'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============= Cultural Intelligence =============
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cultural_modules(request):
    """Get cultural intelligence modules"""
    category = request.GET.get('category')
    region = request.GET.get('region')
    
    modules = CulturalIntelligenceModule.objects.filter(is_active=True)
    if category:
        modules = modules.filter(category=category)
    if region:
        modules = modules.filter(region=region)
    
    modules = modules.order_by('order')[:50]
    serializer = CulturalIntelligenceModuleSerializer(modules, many=True, context={'request': request})
    return Response({'success': True, 'data': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cultural_module_detail(request, slug):
    """Get cultural module details"""
    try:
        module = CulturalIntelligenceModule.objects.get(slug=slug, is_active=True)
        module.views += 1
        module.save()
        serializer = CulturalIntelligenceModuleSerializer(module, context={'request': request})
        return Response({'success': True, 'data': serializer.data})
    except CulturalIntelligenceModule.DoesNotExist:
        return Response({'success': False, 'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def cultural_progress(request):
    """Get or update cultural intelligence progress"""
    module_id = request.data.get('module_id') if request.method == 'POST' else request.GET.get('module_id')
    
    if request.method == 'GET':
        progress_list = CulturalIntelligenceProgress.objects.filter(user=request.user)
        if module_id:
            progress_list = progress_list.filter(module_id=module_id)
        
        serializer = CulturalIntelligenceProgressSerializer(progress_list, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})
    else:  # POST
        try:
            module = CulturalIntelligenceModule.objects.get(id=module_id)
            progress, created = CulturalIntelligenceProgress.objects.get_or_create(
                user=request.user,
                module=module,
                defaults={'score': 0.0}
            )
            
            progress.score = request.data.get('score', progress.score)
            progress.quiz_score = request.data.get('quiz_score', progress.quiz_score)
            progress.time_spent_minutes = request.data.get('time_spent_minutes', progress.time_spent_minutes)
            
            if request.data.get('completed'):
                progress.completed = True
                progress.completed_at = timezone.now()
                module.completion_count += 1
                module.save()
            
            progress.save()
            serializer = CulturalIntelligenceProgressSerializer(progress, context={'request': request})
            return Response({
                'success': True,
                'data': serializer.data,
                'created': created
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except CulturalIntelligenceModule.DoesNotExist:
            return Response({'success': False, 'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)


# ============= Search =============
@api_view(['POST'])
@permission_classes([AllowAny])
def save_search(request):
    """Save search query"""
    query = request.data.get('query', '').strip()
    search_type = request.data.get('search_type', 'all')
    results_count = request.data.get('results_count', 0)
    clicked_result = request.data.get('clicked_result', '')
    
    if query:
        SearchHistory.objects.create(
            user=request.user if request.user.is_authenticated else None,
            query=query,
            search_type=search_type,
            results_count=results_count,
            clicked_result=clicked_result
        )
    
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_suggestions(request):
    """Get search suggestions based on history"""
    query = request.GET.get('q', '').strip()
    
    suggestions = SearchHistory.objects.filter(
        query__icontains=query
    ).values('query').distinct()[:10]
    
    return Response({
        'success': True,
        'data': [s['query'] for s in suggestions]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_history(request):
    """Get user search history"""
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)
    
    searches = SearchHistory.objects.filter(
        user=request.user,
        searched_at__gte=start_date
    ).order_by('-searched_at')[:50]
    
    serializer = SearchHistorySerializer(searches, many=True)
    return Response({'success': True, 'data': serializer.data})