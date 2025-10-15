from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Lesson, LessonProgress, PracticeSession,
    VocabularyWord, Achievement, UserAchievement,
    KidsLesson, KidsProgress, KidsAchievement, WaitlistEntry
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
            'interests', 'survey_completed_at', 'voice_speed', 'difficulty',
            'notifications_enabled', 'auto_play', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data with profile"""
    profile = UserProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'profile', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('name', 'username', 'email', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Create username from email if not provided
        if not attrs.get('username'):
            attrs['username'] = attrs['email'].split('@')[0]
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})
        
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
            last_name=name_parts[1] if len(name_parts) > 1 else ''
        )
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
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
    
    class Meta:
        model = PracticeSession
        fields = [
            'id', 'session_type', 'lesson', 'lesson_title', 'duration_minutes',
            'score', 'points_earned', 'words_practiced', 'sentences_practiced',
            'mistakes_count', 'details', 'session_date'
        ]
        read_only_fields = ['session_date']


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
            'category', 'tier', 'points', 'requirement', 'is_active', 'created_at'
        ]
    
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


# ============= Waitlist Serializer =============
class WaitlistSerializer(serializers.ModelSerializer):
    """Serializer for waitlist entries"""
    class Meta:
        model = WaitlistEntry
        fields = ['id', 'email', 'name', 'interest', 'source', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


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