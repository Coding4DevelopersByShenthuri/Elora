from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Lesson, LessonProgress, PracticeSession,
    VocabularyWord, Achievement, UserAchievement,
    KidsLesson, KidsProgress, KidsAchievement, KidsCertificate, WaitlistEntry,
    UserNotification, AdminNotification, SurveyStepResponse, PlatformSettings,
    CookieConsent,
    StoryEnrollment, StoryWord, StoryPhrase, KidsFavorite,
    KidsVocabularyPractice, KidsPronunciationPractice, KidsGameSession,
    ParentalControlSettings, TeenProgress, TeenStoryProgress,
    TeenVocabularyPractice, TeenPronunciationPractice, TeenFavorite,
    TeenAchievement, TeenGameSession, TeenCertificate
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