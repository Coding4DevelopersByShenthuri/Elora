from rest_framework import serializers
from django.contrib.auth.models import User
import os
from django.conf import settings
from .models import (
    UserProfile, Lesson, LessonProgress, PracticeSession,
    VocabularyWord, Achievement, UserAchievement,
    KidsLesson, KidsProgress, KidsAchievement, KidsCertificate, KidsTrophy, WaitlistEntry,
    UserNotification, AdminNotification, SurveyStepResponse, PlatformSettings,
    CookieConsent,
    StoryEnrollment, StoryWord, StoryPhrase, KidsFavorite,
    KidsVocabularyPractice, KidsPronunciationPractice, KidsGameSession,
    ParentalControlSettings, TeenProgress, TeenStoryProgress,
    TeenVocabularyPractice, TeenPronunciationPractice, TeenFavorite,
    TeenAchievement, TeenGameSession, TeenCertificate,
    PageEligibility, CategoryProgress, VideoLesson,
    PracticeComment, CommonLesson, CommonLessonEnrollment, WeeklyChallenge,
    UserWeeklyChallenge, LearningGoal, PersonalizedRecommendation,
    SpacedRepetitionItem, MicrolearningModule, MicrolearningProgress,
    ProgressAnalytics,
    # New models for adults features
    DictionaryEntry, UserDictionary, FlashcardDeck, Flashcard, FlashcardReview,
    DailyGoal, UserToolbarPreference, MultiModePracticeSession,
    EmailTemplate, EmailPracticeSession, PronunciationPractice,
    CulturalIntelligenceModule, CulturalIntelligenceProgress, SearchHistory
)
from django.contrib.auth.password_validation import validate_password


# ============= Authentication Serializers =============
class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile data"""
    class Meta:
        model = UserProfile
        fields = [
            'level', 'points', 'current_streak', 'longest_streak', 'avatar',
            'age_range', 'native_language', 'english_level', 'learning_purpose',
            'interests', 'survey_completed_at', 'practice_goal_minutes', 'practice_start_time',
            'voice_speed', 'difficulty', 'notifications_enabled', 'auto_play', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = [
            'platform_name', 'support_email', 'maintenance_mode', 'allow_registrations',
            'ga_id', 'clarity_id', 'analytics_enabled',
            'require_email_verification', 'two_factor_admin', 'session_timeout_minutes',
            'default_theme',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class CookieConsentDetailSerializer(serializers.ModelSerializer):
    preferences = serializers.SerializerMethodField()

    class Meta:
        model = CookieConsent
        fields = [
            'consent_id',
            'accepted',
            'preferences',
            'accepted_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['consent_id', 'accepted_at', 'created_at', 'updated_at']

    def get_preferences(self, obj):
        return {
            'functional': True,
            'statistics': obj.statistics,
            'marketing': obj.marketing,
        }


class CookieConsentPreferencesSerializer(serializers.Serializer):
    consent_id = serializers.CharField(max_length=64)
    accepted = serializers.BooleanField(default=True)
    preferences = serializers.DictField(child=serializers.BooleanField(), required=True)

    def validate_consent_id(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Consent identifier is required.")
        return value

    def validate_preferences(self, value):
        functional = value.get('functional', True)
        if functional is False:
            raise serializers.ValidationError("Functional cookies must remain enabled.")
        value['functional'] = True
        value['statistics'] = bool(value.get('statistics', False))
        value['marketing'] = bool(value.get('marketing', False))
        return value


class SurveyStepResponseSerializer(serializers.ModelSerializer):
    """Serializer for survey step responses"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = SurveyStepResponse
        fields = [
            'id', 'user', 'user_username', 'user_email', 'step_name', 'step_number',
            'response_data', 'completed_at'
        ]
        read_only_fields = ['id', 'completed_at', 'user']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data with profile"""
    profile = UserProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'profile', 'date_joined', 'last_login', 'is_staff', 'is_superuser', 'is_active']
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_staff', 'is_superuser', 'is_active']
    
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False, allow_blank=True)  # Make username optional

    class Meta:
        model = User
        fields = ('name', 'username', 'email', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Create username from email if not provided
        if not attrs.get('username') or attrs.get('username') == '':
            attrs['username'] = attrs['email'].split('@')[0]
    
        
        # Check if username already exists
        if User.objects.filter(username=attrs['username']).exists():
            # Append a random number to make it unique
            import random
            attrs['username'] = f"{attrs['username']}{random.randint(1000, 9999)}"
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        name = validated_data.pop('name')
        name_parts = name.split(' ', 1)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=name_parts[0],
            last_name=name_parts[1] if len(name_parts) > 1 else '',
            is_active=False  # User needs to verify email before activation
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


# ============= Learning Content Serializers =============
class LessonSerializer(serializers.ModelSerializer):
    """Serializer for lessons"""
    class Meta:
        model = Lesson
        fields = [
            'id', 'slug', 'title', 'description', 'lesson_type', 'content_type',
            'difficulty_level', 'duration_minutes', 'payload', 'is_active',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    """Serializer for lesson progress"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_slug = serializers.CharField(source='lesson.slug', read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'lesson', 'lesson_title', 'lesson_slug', 'completed', 'score',
            'time_spent_minutes', 'attempts', 'last_attempt', 'pronunciation_score',
            'fluency_score', 'accuracy_score', 'grammar_score', 'notes', 'details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class PracticeSessionSerializer(serializers.ModelSerializer):
    """Serializer for practice sessions"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True, allow_null=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = PracticeSession
        fields = [
            'id', 'user', 'user_username', 'user_email', 'session_type', 'lesson', 'lesson_title', 
            'duration_minutes', 'score', 'points_earned', 'words_practiced', 'sentences_practiced',
            'mistakes_count', 'details', 'session_date'
        ]
        read_only_fields = ['session_date', 'user']


# ============= Vocabulary Serializers =============
class VocabularyWordSerializer(serializers.ModelSerializer):
    """Serializer for vocabulary words"""
    class Meta:
        model = VocabularyWord
        fields = [
            'id', 'word', 'definition', 'example_sentence', 'mastery_level',
            'times_practiced', 'times_correct', 'times_incorrect',
            'first_learned', 'last_practiced', 'difficulty', 'category'
        ]
        read_only_fields = ['first_learned', 'last_practiced']


# ============= Achievement Serializers =============
class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for achievements"""
    requirement = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = [
            'id', 'achievement_id', 'title', 'description', 'icon',
            'category', 'tier', 'points', 'requirement', 
            'requirement_type', 'requirement_target', 'requirement_metric',
            'is_active', 'created_at'
        ]
        read_only_fields = ['requirement', 'created_at']
    
    def get_requirement(self, obj):
        return {
            'type': obj.requirement_type,
            'target': obj.requirement_target,
            'metric': obj.requirement_metric
        }


class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for user achievements"""
    achievement_details = AchievementSerializer(source='achievement', read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = [
            'id', 'achievement', 'achievement_details', 'progress',
            'unlocked', 'unlocked_at'
        ]
        read_only_fields = ['unlocked_at']


# ============= Teen Serializers =============
class TeenProgressSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = TeenProgress
        fields = [
            'user_id', 'points', 'streak', 'last_engagement',
            'vocabulary_attempts', 'pronunciation_attempts',
            'games_attempts', 'missions_started', 'missions_completed',
            'favorites_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TeenStoryProgressSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = TeenStoryProgress
        fields = [
            'id', 'user_id', 'story_id', 'story_title', 'story_type',
            'status', 'attempts', 'best_score', 'total_points_earned',
            'last_started_at', 'completed_at'
        ]
        read_only_fields = ['last_started_at', 'completed_at']


class TeenVocabularyPracticeSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = TeenVocabularyPractice
        fields = [
            'id', 'user_id', 'word', 'story_id', 'story_title',
            'attempts', 'best_score', 'last_practiced', 'created_at'
        ]
        read_only_fields = ['last_practiced', 'created_at']


class TeenPronunciationPracticeSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = TeenPronunciationPractice
        fields = [
            'id', 'user_id', 'phrase', 'story_id', 'story_title',
            'attempts', 'best_score', 'last_practiced', 'created_at'
        ]
        read_only_fields = ['last_practiced', 'created_at']


class TeenFavoriteSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = TeenFavorite
        fields = ['id', 'user_id', 'story_id', 'created_at']
        read_only_fields = ['created_at']


class TeenAchievementSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = TeenAchievement
        fields = ['id', 'user_id', 'key', 'progress', 'unlocked', 'unlocked_at', 'updated_at']
        read_only_fields = ['unlocked_at', 'updated_at']


class TeenGameSessionSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = TeenGameSession
        fields = [
            'id', 'user_id', 'game_type', 'game_title', 'score', 'points_earned',
            'rounds', 'difficulty', 'duration_seconds', 'completed', 'details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TeenCertificateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = TeenCertificate
        fields = ['id', 'user_id', 'cert_id', 'title', 'file_url', 'issued_at']
        read_only_fields = ['issued_at']


# ============= Kids Serializers (Keep existing) =============
class KidsLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = KidsLesson
        fields = ["id", "slug", "title", "lesson_type", "payload", "is_active", "created_at", "updated_at"]


class KidsProgressSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = KidsProgress
        fields = ["user_id", "points", "streak", "details", "updated_at"]


class KidsAchievementSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = KidsAchievement
        fields = ["user_id", "name", "icon", "progress", "unlocked", "updated_at"]


class KidsTrophySerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = KidsTrophy
        fields = ['id', 'user_id', 'trophy_id', 'audience', 'title', 'unlocked_at']
        read_only_fields = ['unlocked_at']


class KidsCertificateSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = KidsCertificate
        fields = ["user_id", "cert_id", "audience", "title", "file_url", "issued_at"]


# ============= Kids Story Management Serializers =============
class StoryEnrollmentSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = StoryEnrollment
        fields = [
            "id", "user_id", "story_id", "story_title", "story_type",
            "completed", "completed_at", "score", "words_extracted",
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]


class StoryWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryWord
        fields = [
            "id", "story_id", "story_title", "word", "hint", "emoji",
            "difficulty", "category", "created_at"
        ]
        read_only_fields = ["created_at"]


class StoryPhraseSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryPhrase
        fields = [
            "id", "story_id", "story_title", "phrase", "phonemes", "emoji",
            "difficulty", "created_at"
        ]
        read_only_fields = ["created_at"]


class KidsFavoriteSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = KidsFavorite
        fields = ["id", "user_id", "story_id", "created_at"]
        read_only_fields = ["created_at"]


class KidsVocabularyPracticeSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = KidsVocabularyPractice
        fields = [
            "id", "user_id", "word", "story_id", "best_score", "attempts",
            "last_practiced", "created_at"
        ]
        read_only_fields = ["last_practiced", "created_at"]


class KidsPronunciationPracticeSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = KidsPronunciationPractice
        fields = [
            "id", "user_id", "phrase", "story_id", "best_score", "attempts",
            "last_practiced", "created_at"
        ]
        read_only_fields = ["last_practiced", "created_at"]


class KidsGameSessionSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = KidsGameSession
        fields = [
            "id", "user_id", "game_type", "game_title", "score", "points_earned",
            "rounds", "difficulty", "duration_seconds", "completed", "details", 
            "created_at", "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]


class ParentalControlSettingsSerializer(serializers.ModelSerializer):
    has_pin = serializers.SerializerMethodField()

    class Meta:
        model = ParentalControlSettings
        fields = ["daily_limit_minutes", "has_pin", "updated_at"]
        read_only_fields = ["has_pin", "updated_at"]

    def get_has_pin(self, obj):
        return bool(obj.pin_hash)


# ============= Waitlist Serializer =============
class WaitlistSerializer(serializers.ModelSerializer):
    """Serializer for waitlist entries"""
    class Meta:
        model = WaitlistEntry
        fields = ['id', 'email', 'name', 'interest', 'source', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


# ============= User Notification Serializers =============
class UserNotificationSerializer(serializers.ModelSerializer):
    """Serializer for end-user notifications."""
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)

    class Meta:
        model = UserNotification
        fields = [
            'id', 'notification_type', 'type_display', 'title', 'message', 'icon',
            'action_url', 'is_read', 'read_at', 'event_key', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'read_at']


# ============= Admin Notification Serializer =============
class AdminNotificationSerializer(serializers.ModelSerializer):
    """Serializer for admin notifications"""
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = AdminNotification
        fields = [
            'id', 'user', 'notification_type', 'type_display', 'priority', 'priority_display',
            'title', 'message', 'link', 'is_read', 'read_at', 'read_by', 'metadata',
            'created_at', 'expires_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'read_by']


# ============= Stats & Analytics Serializers =============
class DailyProgressSerializer(serializers.Serializer):
    """Serializer for daily progress stats"""
    date = serializers.DateField()
    lessons_completed = serializers.IntegerField()
    practice_time = serializers.IntegerField()
    points = serializers.IntegerField()
    average_score = serializers.FloatField()


class WeeklyStatsSerializer(serializers.Serializer):
    """Serializer for weekly statistics"""
    week_start = serializers.DateField()
    week_end = serializers.DateField()
    total_lessons = serializers.IntegerField()
    total_time = serializers.IntegerField()
    total_points = serializers.IntegerField()
    average_score = serializers.FloatField()
    streak = serializers.IntegerField()
    days_active = serializers.IntegerField()


class UserStatsSerializer(serializers.Serializer):
    """Comprehensive user statistics"""
    total_points = serializers.IntegerField()
    level = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    lessons_completed = serializers.IntegerField()
    practice_time_minutes = serializers.IntegerField()
    vocabulary_count = serializers.IntegerField()
    achievements_unlocked = serializers.IntegerField()
    average_score = serializers.FloatField()


# ============= Category Progress Serializers =============
class CategoryProgressSerializer(serializers.ModelSerializer):
    """Serializer for category progress tracking"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    last_activity_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = CategoryProgress
        fields = [
            'id', 'category', 'category_display', 'total_points', 'total_streak',
            'lessons_completed', 'practice_time_minutes', 'average_score',
            'last_activity', 'last_activity_formatted', 'first_access',
            'days_active', 'progress_percentage', 'level',
            'stories_completed', 'vocabulary_words', 'pronunciation_attempts',
            'games_completed', 'details', 'updated_at'
        ]
        read_only_fields = [
            'id', 'first_access', 'last_activity', 'last_activity_formatted',
            'updated_at', 'category_display'
        ]
    
    def get_last_activity_formatted(self, obj):
        """Format last activity timestamp"""
        if not obj.last_activity:
            return None
        return obj.last_activity.isoformat()


class AggregatedProgressSerializer(serializers.Serializer):
    """Serializer for aggregated progress across all categories"""
    total_points = serializers.IntegerField()
    total_streak = serializers.IntegerField()
    total_lessons_completed = serializers.IntegerField()
    total_practice_time = serializers.IntegerField()
    average_score = serializers.FloatField()
    categories_count = serializers.IntegerField()
    active_categories_count = serializers.IntegerField()
    categories = CategoryProgressSerializer(many=True)
    most_active_category = serializers.CharField(allow_null=True)
    recommended_category = serializers.CharField(allow_null=True)


# ============= Page Eligibility Serializers =============
class PageEligibilitySerializer(serializers.ModelSerializer):
    """Serializer for page eligibility tracking"""
    progress_percent = serializers.SerializerMethodField()
    
    class Meta:
        model = PageEligibility
        fields = [
            'id', 'page_path', 'required_criteria', 'current_progress',
            'is_unlocked', 'unlocked_at', 'created_at', 'updated_at',
            'progress_percent'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'unlocked_at', 'progress_percent']
    
    def get_progress_percent(self, obj):
        """Calculate overall progress percentage"""
        if not obj.current_progress:
            return 0
        
        progress_values = [
            p.get('progress_percent', 0) 
            for p in obj.current_progress.values() 
            if isinstance(p, dict)
        ]
        
        if not progress_values:
            return 0
        
        return sum(progress_values) / len(progress_values)


# ============= Video Lesson Serializers =============
class VideoLessonSerializer(serializers.ModelSerializer):
    """Serializer for video lessons"""
    thumbnail_url = serializers.SerializerMethodField()
    video_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoLesson
        fields = [
            'id', 'slug', 'title', 'description', 'full_description', 'thumbnail', 'thumbnail_url',
            'video_file', 'video_file_url', 'video_url', 'duration', 'difficulty',
            'category', 'rating', 'views', 'speaking_exercises', 'tags', 'chapters', 'hashtags',
            'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                # Use build_absolute_uri to get full URL with correct host/port
                url = obj.thumbnail.url
                # Ensure we have a proper absolute URL
                if url.startswith('http://') or url.startswith('https://'):
                    return url
                return request.build_absolute_uri(url)
            # Fallback: construct URL manually if no request context
            base_url = getattr(settings, 'BASE_URL', 'http://127.0.0.1:8000')
            url = obj.thumbnail.url
            if url.startswith('http://') or url.startswith('https://'):
                return url
            return f"{base_url}{url}"
        return None
    
    def get_video_file_url(self, obj):
        if obj.video_file:
            request = self.context.get('request')
            if request:
                # Use build_absolute_uri to get full URL with correct host/port
                url = obj.video_file.url
                # Ensure we have a proper absolute URL
                if url.startswith('http://') or url.startswith('https://'):
                    return url
                return request.build_absolute_uri(url)
            # Fallback: construct URL manually if no request context
            base_url = getattr(settings, 'BASE_URL', 'http://127.0.0.1:8000')
            url = obj.video_file.url
            if url.startswith('http://') or url.startswith('https://'):
                return url
            return f"{base_url}{url}"
        return None


class PracticeCommentSerializer(serializers.ModelSerializer):
    """Serializer for practice comments under a video"""
    author_name = serializers.SerializerMethodField()
    is_own = serializers.SerializerMethodField()
    
    class Meta:
        model = PracticeComment
        fields = ['id', 'content', 'author_name', 'is_own', 'is_approved', 'created_at']
        read_only_fields = ['id', 'author_name', 'is_own', 'created_at']
    
    def get_author_name(self, obj):
        full_name = obj.user.get_full_name()
        return full_name if full_name else obj.user.username
    
    def get_is_own(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_id == request.user.id
        return False


# ============= Adults Common Features Serializers =============
class CommonLessonSerializer(serializers.ModelSerializer):
    """Serializer for common lessons shared across adult levels"""
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CommonLesson
        fields = [
            'id', 'slug', 'title', 'description', 'category', 'difficulty',
            'duration_minutes', 'points_reward', 'content', 'thumbnail_url',
            'is_active', 'order', 'views', 'completion_count', 'average_score',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'views', 'completion_count', 'average_score', 'created_at', 'updated_at']
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None


class CommonLessonEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for common lesson enrollments"""
    lesson = CommonLessonSerializer(read_only=True)
    lesson_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = CommonLessonEnrollment
        fields = [
            'id', 'lesson', 'lesson_id', 'enrolled_at', 'started_at', 'completed_at',
            'completed', 'progress_percentage', 'score', 'time_spent_minutes',
            'attempts', 'details', 'last_accessed'
        ]
        read_only_fields = ['id', 'enrolled_at', 'last_accessed']


class WeeklyChallengeSerializer(serializers.ModelSerializer):
    """Serializer for weekly challenges"""
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = WeeklyChallenge
        fields = [
            'id', 'challenge_id', 'title', 'description', 'category',
            'start_date', 'end_date', 'points_reward', 'badge_icon',
            'requirement_type', 'requirement_value', 'requirement_description',
            'is_active', 'user_progress', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_challenge = UserWeeklyChallenge.objects.filter(
                user=request.user, challenge=obj
            ).first()
            if user_challenge:
                return {
                    'enrolled': True,
                    'completed': user_challenge.completed,
                    'progress': user_challenge.current_progress,
                    'progress_percentage': user_challenge.progress_percentage,
                    'points_earned': user_challenge.points_earned
                }
        return {'enrolled': False}


class UserWeeklyChallengeSerializer(serializers.ModelSerializer):
    """Serializer for user weekly challenge participation"""
    challenge = WeeklyChallengeSerializer(read_only=True)
    challenge_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = UserWeeklyChallenge
        fields = [
            'id', 'challenge', 'challenge_id', 'enrolled_at', 'started_at',
            'completed_at', 'completed', 'current_progress', 'progress_percentage',
            'points_earned', 'details', 'updated_at'
        ]
        read_only_fields = ['id', 'enrolled_at', 'updated_at']


class LearningGoalSerializer(serializers.ModelSerializer):
    """Serializer for learning goals"""
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningGoal
        fields = [
            'id', 'goal_type', 'title', 'description', 'target_value', 'current_value',
            'unit', 'start_date', 'target_date', 'completed_at', 'completed',
            'is_active', 'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'completed_at', 'created_at', 'updated_at']
    
    def get_progress_percentage(self, obj):
        if obj.target_value > 0:
            return min(100, (obj.current_value / obj.target_value) * 100)
        return 0


class PersonalizedRecommendationSerializer(serializers.ModelSerializer):
    """Serializer for personalized recommendations"""
    class Meta:
        model = PersonalizedRecommendation
        fields = [
            'id', 'recommendation_type', 'title', 'description', 'priority',
            'target_id', 'target_type', 'action_url', 'reason', 'confidence_score',
            'viewed', 'viewed_at', 'accepted', 'accepted_at', 'dismissed',
            'dismissed_at', 'expires_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SpacedRepetitionItemSerializer(serializers.ModelSerializer):
    """Serializer for spaced repetition items"""
    days_until_review = serializers.SerializerMethodField()
    
    class Meta:
        model = SpacedRepetitionItem
        fields = [
            'id', 'item_type', 'item_id', 'item_content', 'ease_factor',
            'interval_days', 'repetitions', 'next_review_date', 'days_until_review',
            'times_reviewed', 'times_correct', 'times_incorrect', 'last_reviewed',
            'mastery_level', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_days_until_review(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        delta = obj.next_review_date - today
        return max(0, delta.days)


class MicrolearningModuleSerializer(serializers.ModelSerializer):
    """Serializer for microlearning modules"""
    thumbnail_url = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = MicrolearningModule
        fields = [
            'id', 'slug', 'title', 'description', 'category', 'difficulty',
            'content', 'duration_minutes', 'points_reward', 'thumbnail_url',
            'is_active', 'is_featured', 'order', 'views', 'completion_count',
            'user_progress', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'views', 'completion_count', 'created_at', 'updated_at']
    
    def get_thumbnail_url(self, obj):
        # Can be extended if thumbnails are added
        return None
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = MicrolearningProgress.objects.filter(
                user=request.user, module=obj
            ).first()
            if progress:
                return {
                    'completed': progress.completed,
                    'score': progress.score,
                    'attempts': progress.attempts
                }
        return None


class MicrolearningProgressSerializer(serializers.ModelSerializer):
    """Serializer for microlearning progress"""
    module = MicrolearningModuleSerializer(read_only=True)
    module_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = MicrolearningProgress
        fields = [
            'id', 'module', 'module_id', 'completed', 'completed_at',
            'score', 'time_spent_minutes', 'attempts', 'last_accessed', 'created_at'
        ]
        read_only_fields = ['id', 'last_accessed', 'created_at']


class ProgressAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for progress analytics"""
    class Meta:
        model = ProgressAnalytics
        fields = [
            'id', 'category', 'period_start', 'period_end', 'period_type',
            'lessons_completed', 'practice_time_minutes', 'average_score',
            'vocabulary_learned', 'pronunciation_attempts', 'streak_days',
            'points_earned', 'improvement_percentage', 'consistency_score',
            'insights', 'recommendations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============= Dictionary Serializers =============
class DictionaryEntrySerializer(serializers.ModelSerializer):
    """Serializer for dictionary entries"""
    class Meta:
        model = DictionaryEntry
        fields = [
            'id', 'word', 'phonetic', 'pronunciation_guide', 'part_of_speech',
            'definitions', 'examples', 'synonyms', 'antonyms', 'difficulty_level',
            'category', 'tags', 'audio_url', 'usage_frequency', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserDictionarySerializer(serializers.ModelSerializer):
    """Serializer for user's personal dictionary"""
    dictionary_entry = DictionaryEntrySerializer(read_only=True)
    dictionary_entry_id = serializers.IntegerField(write_only=True, required=False)
    word = serializers.CharField(source='dictionary_entry.word', read_only=True)
    
    class Meta:
        model = UserDictionary
        fields = [
            'id', 'dictionary_entry', 'dictionary_entry_id', 'word',
            'personal_notes', 'personal_example', 'mastery_level',
            'times_viewed', 'times_practiced', 'added_at', 'last_reviewed'
        ]
        read_only_fields = ['id', 'added_at', 'last_reviewed']


# ============= Flashcard Serializers =============
class FlashcardDeckSerializer(serializers.ModelSerializer):
    """Serializer for flashcard decks"""
    cards_count = serializers.SerializerMethodField()
    
    class Meta:
        model = FlashcardDeck
        fields = [
            'id', 'title', 'description', 'is_default', 'is_active',
            'total_cards', 'mastered_cards', 'cards_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_cards', 'mastered_cards', 'created_at', 'updated_at']
    
    def get_cards_count(self, obj):
        return obj.cards.count()


class FlashcardSerializer(serializers.ModelSerializer):
    """Serializer for flashcards"""
    deck_title = serializers.CharField(source='deck.title', read_only=True)
    days_until_review = serializers.SerializerMethodField()
    
    class Meta:
        model = Flashcard
        fields = [
            'id', 'deck', 'deck_title', 'dictionary_entry', 'front', 'back', 'example',
            'audio_url', 'ease_factor', 'interval_days', 'repetitions', 'next_review_date',
            'days_until_review', 'times_reviewed', 'times_correct', 'times_incorrect',
            'mastery_level', 'last_reviewed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_reviewed', 'created_at', 'updated_at']
    
    def get_days_until_review(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        delta = obj.next_review_date - today
        return max(0, delta.days)


class FlashcardReviewSerializer(serializers.ModelSerializer):
    """Serializer for flashcard review sessions"""
    flashcard_front = serializers.CharField(source='flashcard.front', read_only=True)
    
    class Meta:
        model = FlashcardReview
        fields = [
            'id', 'flashcard', 'flashcard_front', 'quality', 'was_correct',
            'time_spent_seconds', 'reviewed_at'
        ]
        read_only_fields = ['id', 'reviewed_at']


# ============= Daily Goals Serializers =============
class DailyGoalSerializer(serializers.ModelSerializer):
    """Serializer for daily goals"""
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = DailyGoal
        fields = [
            'id', 'goal_type', 'target_value', 'current_value', 'goal_date',
            'completed', 'completed_at', 'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'completed_at', 'created_at', 'updated_at']
    
    def get_progress_percentage(self, obj):
        if obj.target_value > 0:
            return min(100, (obj.current_value / obj.target_value) * 100)
        return 0


# ============= Toolbar Preferences Serializers =============
class UserToolbarPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for toolbar preferences"""
    class Meta:
        model = UserToolbarPreference
        fields = [
            'id', 'toolbar_items', 'is_visible', 'position', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============= Multi-Mode Practice Serializers =============
class MultiModePracticeSessionSerializer(serializers.ModelSerializer):
    """Serializer for multi-mode practice sessions"""
    mode_display = serializers.CharField(source='get_mode_display', read_only=True)
    
    class Meta:
        model = MultiModePracticeSession
        fields = [
            'id', 'mode', 'mode_display', 'duration_minutes', 'score', 'points_earned',
            'items_completed', 'items_correct', 'items_incorrect', 'content_type',
            'content_id', 'details', 'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at']


# ============= Email Coach Serializers =============
class EmailTemplateSerializer(serializers.ModelSerializer):
    """Serializer for email templates"""
    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'template_id', 'title', 'description', 'template_type', 'difficulty',
            'subject_template', 'body_template', 'tips', 'common_phrases', 'example_email',
            'category', 'usage_count', 'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']


class EmailPracticeSessionSerializer(serializers.ModelSerializer):
    """Serializer for email practice sessions"""
    template_title = serializers.CharField(source='template.title', read_only=True)
    
    class Meta:
        model = EmailPracticeSession
        fields = [
            'id', 'template', 'template_title', 'subject', 'body',
            'grammar_score', 'tone_score', 'clarity_score', 'overall_score',
            'feedback', 'suggestions', 'attempts', 'is_saved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============= Pronunciation Analyzer Serializers =============
class PronunciationPracticeSerializer(serializers.ModelSerializer):
    """Serializer for pronunciation practice"""
    class Meta:
        model = PronunciationPractice
        fields = [
            'id', 'target_text', 'target_phonetic', 'target_audio_url',
            'user_audio_url', 'user_audio_duration', 'accuracy_score',
            'pronunciation_score', 'fluency_score', 'phonetic_analysis',
            'mistakes', 'feedback', 'suggestions', 'attempts', 'difficulty_level',
            'practiced_at', 'updated_at'
        ]
        read_only_fields = ['id', 'practiced_at', 'updated_at']


# ============= Cultural Intelligence Serializers =============
class CulturalIntelligenceModuleSerializer(serializers.ModelSerializer):
    """Serializer for cultural intelligence modules"""
    thumbnail_url = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = CulturalIntelligenceModule
        fields = [
            'id', 'slug', 'title', 'description', 'category', 'region', 'difficulty',
            'content', 'thumbnail_url', 'video_url', 'views', 'completion_count',
            'is_active', 'order', 'user_progress', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'views', 'completion_count', 'created_at', 'updated_at']
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
        return None
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = CulturalIntelligenceProgress.objects.filter(
                user=request.user, module=obj
            ).first()
            if progress:
                return {
                    'completed': progress.completed,
                    'score': progress.score,
                    'quiz_score': progress.quiz_score,
                    'time_spent_minutes': progress.time_spent_minutes
                }
        return None


class CulturalIntelligenceProgressSerializer(serializers.ModelSerializer):
    """Serializer for cultural intelligence progress"""
    module = CulturalIntelligenceModuleSerializer(read_only=True)
    module_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = CulturalIntelligenceProgress
        fields = [
            'id', 'module', 'module_id', 'completed', 'completed_at',
            'score', 'quiz_score', 'quiz_attempts', 'time_spent_minutes',
            'last_accessed', 'created_at'
        ]
        read_only_fields = ['id', 'last_accessed', 'created_at']


# ============= Search History Serializers =============
class SearchHistorySerializer(serializers.ModelSerializer):
    """Serializer for search history"""
    class Meta:
        model = SearchHistory
        fields = [
            'id', 'query', 'search_type', 'results_count', 'clicked_result', 'searched_at'
        ]
        read_only_fields = ['id', 'searched_at']