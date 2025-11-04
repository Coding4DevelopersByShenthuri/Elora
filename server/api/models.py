from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
import secrets
from datetime import timedelta
from django.utils import timezone


# ============= Email Verification =============
class EmailVerificationToken(models.Model):
    """Store email verification tokens"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verification_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Verification token for {self.user.email}"
    
    def is_valid(self):
        """Check if token is still valid (24 hours)"""
        if self.is_used:
            return False
        expiry = timezone.now() - timedelta(hours=24)
        return self.created_at > expiry
    
    @staticmethod
    def generate_token(user):
        """Generate a new verification token for user"""
        token = secrets.token_urlsafe(32)
        while EmailVerificationToken.objects.filter(token=token, is_used=False).exists():
            token = secrets.token_urlsafe(32)
        
        # Invalidate old tokens
        EmailVerificationToken.objects.filter(user=user, is_used=False).update(is_used=True)
        
        return EmailVerificationToken.objects.create(
            user=user,
            token=token
        )


# ============= User Profile & Survey Data =============
class UserProfile(models.Model):
    """Extended user profile with learning preferences and survey data"""
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    points = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    avatar = models.CharField(max_length=255, blank=True, null=True)
    
    # Survey Data
    age_range = models.CharField(max_length=50, blank=True, null=True)
    native_language = models.CharField(max_length=100, blank=True, null=True)
    english_level = models.CharField(max_length=50, blank=True, null=True)
    learning_purpose = models.JSONField(default=list, blank=True)  # Array of purposes
    interests = models.JSONField(default=list, blank=True)  # Array of interests
    survey_completed_at = models.DateTimeField(blank=True, null=True)
    
    # Settings
    voice_speed = models.CharField(max_length=20, default='normal')
    difficulty = models.CharField(max_length=20, default='medium')
    notifications_enabled = models.BooleanField(default=True)
    auto_play = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username} (Level: {self.level})"


# ============= Learning Content =============
class Lesson(models.Model):
    """Generic lesson model for all learning paths"""
    LESSON_TYPE_CHOICES = [
        ('kids_4_10', 'Kids (4-10)'),
        ('kids_11_17', 'Kids (11-17)'),
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('ielts', 'IELTS'),
        ('pte', 'PTE'),
    ]
    
    CONTENT_TYPE_CHOICES = [
        ('vocabulary', 'Vocabulary'),
        ('pronunciation', 'Pronunciation'),
        ('grammar', 'Grammar'),
        ('conversation', 'Conversation'),
        ('listening', 'Listening'),
        ('reading', 'Reading'),
        ('writing', 'Writing'),
        ('story', 'Story'),
    ]
    
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES)
    difficulty_level = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(10)])
    duration_minutes = models.IntegerField(default=15)
    payload = models.JSONField(default=dict)  # Lesson content, exercises, etc.
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)  # For ordering lessons
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['lesson_type', 'order', 'difficulty_level']
        indexes = [
            models.Index(fields=['lesson_type', 'is_active']),
            models.Index(fields=['content_type']),
        ]

    def __str__(self):
        return f"{self.title} ({self.lesson_type} - {self.content_type})"


# ============= User Progress Tracking =============
class LessonProgress(models.Model):
    """Track individual lesson progress"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    
    completed = models.BooleanField(default=False)
    score = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    time_spent_minutes = models.IntegerField(default=0)
    attempts = models.IntegerField(default=0)
    last_attempt = models.DateTimeField(auto_now=True)
    
    # Specific scores
    pronunciation_score = models.FloatField(null=True, blank=True)
    fluency_score = models.FloatField(null=True, blank=True)
    accuracy_score = models.FloatField(null=True, blank=True)
    grammar_score = models.FloatField(null=True, blank=True)
    
    # Additional details
    notes = models.TextField(blank=True)
    details = models.JSONField(default=dict)  # Store any additional data
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'lesson']
        indexes = [
            models.Index(fields=['user', 'completed']),
            models.Index(fields=['last_attempt']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title} ({self.score}%)"


class PracticeSession(models.Model):
    """Track individual practice sessions"""
    SESSION_TYPES = [
        ('pronunciation', 'Pronunciation'),
        ('conversation', 'Conversation'),
        ('vocabulary', 'Vocabulary'),
        ('grammar', 'Grammar'),
        ('listening', 'Listening'),
        ('reading', 'Reading'),
        ('exam_practice', 'Exam Practice'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='practice_sessions')
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES)
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True)
    
    duration_minutes = models.IntegerField(default=0)
    score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    points_earned = models.IntegerField(default=0)
    
    # Detailed metrics
    words_practiced = models.IntegerField(default=0)
    sentences_practiced = models.IntegerField(default=0)
    mistakes_count = models.IntegerField(default=0)
    
    details = models.JSONField(default=dict)  # Session-specific data
    session_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-session_date']
        indexes = [
            models.Index(fields=['user', 'session_date']),
            models.Index(fields=['session_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.session_type} ({self.score}%) - {self.session_date.date()}"


# ============= Vocabulary Tracking =============
class VocabularyWord(models.Model):
    """Track learned vocabulary words"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vocabulary')
    word = models.CharField(max_length=100)
    definition = models.TextField(blank=True)
    example_sentence = models.TextField(blank=True)
    
    mastery_level = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    times_practiced = models.IntegerField(default=0)
    times_correct = models.IntegerField(default=0)
    times_incorrect = models.IntegerField(default=0)
    
    first_learned = models.DateTimeField(auto_now_add=True)
    last_practiced = models.DateTimeField(auto_now=True)
    
    # Tags and categorization
    difficulty = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(10)])
    category = models.CharField(max_length=50, blank=True)  # e.g., 'business', 'travel', 'academic'
    
    class Meta:
        unique_together = ['user', 'word']
        indexes = [
            models.Index(fields=['user', 'mastery_level']),
            models.Index(fields=['last_practiced']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.word} ({self.mastery_level}%)"


# ============= Achievements & Gamification =============
class Achievement(models.Model):
    """Available achievements for gamification"""
    CATEGORY_CHOICES = [
        ('practice', 'Practice'),
        ('streak', 'Streak'),
        ('mastery', 'Mastery'),
        ('social', 'Social'),
        ('special', 'Special'),
    ]
    
    TIER_CHOICES = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]
    
    achievement_id = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.CharField(max_length=50)  # Emoji or icon name
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES)
    points = models.IntegerField(default=0)
    
    # Requirement
    requirement_type = models.CharField(max_length=20)  # 'count', 'streak', 'score', 'time', 'custom'
    requirement_target = models.IntegerField()
    requirement_metric = models.CharField(max_length=50)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.tier})"


class UserAchievement(models.Model):
    """Track user's unlocked achievements"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    
    progress = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    unlocked = models.BooleanField(default=False)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'achievement']
        indexes = [
            models.Index(fields=['user', 'unlocked']),
        ]

    def __str__(self):
        status = "Unlocked" if self.unlocked else f"{self.progress}%"
        return f"{self.user.username} - {self.achievement.title} ({status})"


# ============= Kids Specific (Keep existing) =============
class KidsLesson(models.Model):
    LESSON_TYPES = (
        ("read_aloud", "Read Aloud"),
        ("vocabulary", "Vocabulary"),
        ("pronunciation", "Pronunciation"),
    )

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    lesson_type = models.CharField(max_length=32, choices=LESSON_TYPES)
    payload = models.JSONField(default=dict)  # offline content payload
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.lesson_type})"


class KidsProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kids_progress')
    points = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    details = models.JSONField(default=dict)  # per-lesson results
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user",)

    def __str__(self):
        return f"KidsProgress(user={self.user_id}, points={self.points})"


class KidsAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kids_achievements')
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=64, blank=True, default="")
    progress = models.IntegerField(default=0)  # 0-100
    unlocked = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "name")

    def __str__(self):
        return f"KidsAchievement(user={self.user_id}, name={self.name})"


class KidsCertificate(models.Model):
    """Issued certificate record for kids."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kids_certificates')
    cert_id = models.CharField(max_length=128)
    title = models.CharField(max_length=255)
    file_url = models.URLField(blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "cert_id")

# ============= Waitlist =============
class WaitlistEntry(models.Model):
    """Track waitlist signups"""
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    interest = models.CharField(max_length=50, blank=True)  # kids, adults, ielts, etc.
    source = models.CharField(max_length=50, blank=True)  # how they found us
    notes = models.TextField(blank=True)
    
    subscribed = models.BooleanField(default=True)
    notified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} - {self.interest or 'General'}"


# ============= Admin Notifications =============
class AdminNotification(models.Model):
    """Notifications for admin users"""
    TYPE_CHOICES = [
        ('user_registered', 'New User Registration'),
        ('user_activity', 'User Activity'),
        ('system_alert', 'System Alert'),
        ('maintenance', 'Maintenance'),
        ('security', 'Security Alert'),
        ('analytics', 'Analytics Update'),
        ('error', 'Error Report'),
        ('info', 'Information'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Target admin user (null means all admins)
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='admin_notifications',
        null=True, 
        blank=True,
        help_text="Specific admin user, or null for all admins"
    )
    
    notification_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='info')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='normal')
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.URLField(blank=True, null=True, help_text="Optional link to related page")
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    read_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='read_notifications'
    )
    
    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True, help_text="Extra data about the notification")
    
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Auto-delete after this date (30 days by default)")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', 'created_at']),
            models.Index(fields=['is_read', 'created_at']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.title} ({'Read' if self.is_read else 'Unread'})"
    
    def save(self, *args, **kwargs):
        # Auto-set expiration to 30 days if not set
        if not self.expires_at:
            from django.utils import timezone
            from datetime import timedelta
            self.expires_at = timezone.now() + timedelta(days=30)
        super().save(*args, **kwargs)
    
    @staticmethod
    def cleanup_expired():
        """Delete expired notifications (called by management command or cron)"""
        from django.utils import timezone
        return AdminNotification.objects.filter(expires_at__lt=timezone.now()).delete()