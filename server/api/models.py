from django.db import models
from django.db.models import Q
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
    avatar = models.TextField(blank=True, null=True)  # Changed to TextField to support base64 data
    
    # Survey Data
    age_range = models.CharField(max_length=50, blank=True, null=True)
    native_language = models.CharField(max_length=100, blank=True, null=True)
    english_level = models.CharField(max_length=50, blank=True, null=True)
    learning_purpose = models.JSONField(default=list, blank=True)  # Array of purposes
    interests = models.JSONField(default=list, blank=True)  # Array of interests
    survey_completed_at = models.DateTimeField(blank=True, null=True)
    
    # Practice Goals (from personalization survey)
    practice_goal_minutes = models.IntegerField(blank=True, null=True, help_text="Daily practice goal in minutes")
    practice_start_time = models.TimeField(blank=True, null=True, help_text="Preferred daily practice start time")
    
    # Settings
    voice_speed = models.CharField(max_length=20, default='normal')
    difficulty = models.CharField(max_length=20, default='medium')
    notifications_enabled = models.BooleanField(default=True)
    auto_play = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username} (Level: {self.level})"


# ============= Survey Step Tracking =============
class SurveyStepResponse(models.Model):
    """Track individual survey step responses for each user"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='survey_step_responses')
    step_name = models.CharField(max_length=50)  # 'user', 'language', 'learningPurpose', 'interests', etc.
    step_number = models.IntegerField()  # Step order (1, 2, 3, etc.)
    response_data = models.JSONField(default=dict)  # Store the actual response for this step
    completed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['user', 'step_number', '-completed_at']
        indexes = [
            models.Index(fields=['user', 'step_name']),
            models.Index(fields=['user', 'step_number']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Step {self.step_number} ({self.step_name}) - {self.completed_at.date()}"


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
    AUDIENCE_CHOICES = [
        ('young', 'Young Kids (4-10)'),
        ('teen', 'Teen Kids (11-17)'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kids_certificates')
    cert_id = models.CharField(max_length=128)
    audience = models.CharField(max_length=10, choices=AUDIENCE_CHOICES, default='young', help_text="Target audience: young or teen")
    title = models.CharField(max_length=255)
    file_url = models.URLField(blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "cert_id", "audience")


# ============= Kids Story Management =============
class StoryEnrollment(models.Model):
    """Track which stories a user has completed/enrolled in"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='story_enrollments')
    story_id = models.CharField(max_length=100)  # e.g., 'magic-forest', 'space-adventure'
    story_title = models.CharField(max_length=255)
    story_type = models.CharField(max_length=50)  # e.g., 'forest', 'space', 'ocean'
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    words_extracted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "story_id")
        indexes = [
            models.Index(fields=['user', 'completed']),
            models.Index(fields=['story_id']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.story_title} ({'Completed' if self.completed else 'In Progress'})"


class StoryWord(models.Model):
    """Vocabulary words extracted from stories"""
    story_id = models.CharField(max_length=100, db_index=True)  # e.g., 'magic-forest'
    story_title = models.CharField(max_length=255)
    word = models.CharField(max_length=100)
    hint = models.TextField()
    emoji = models.CharField(max_length=10, blank=True)
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='easy')
    category = models.CharField(max_length=50)  # e.g., 'animals', 'nature', 'actions'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("story_id", "word")
        indexes = [
            models.Index(fields=['story_id', 'difficulty']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.story_title} - {self.word}"


class StoryPhrase(models.Model):
    """Phrases extracted from stories for pronunciation practice"""
    story_id = models.CharField(max_length=100, db_index=True)  # e.g., 'magic-forest'
    story_title = models.CharField(max_length=255)
    phrase = models.CharField(max_length=500)  # Changed from TextField to CharField for MySQL compatibility
    phonemes = models.TextField()  # Phonetic representation
    emoji = models.CharField(max_length=20, blank=True)
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='easy')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("story_id", "phrase")
        indexes = [
            models.Index(fields=['story_id', 'difficulty']),
        ]

    def __str__(self):
        return f"{self.story_title} - {self.phrase[:50]}"


class KidsFavorite(models.Model):
    """User's favorite stories"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kids_favorites')
    story_id = models.CharField(max_length=100)  # e.g., 'young-0', 'young-1'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "story_id")
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.story_id}"


class KidsVocabularyPractice(models.Model):
    """Track vocabulary word practice sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kids_vocabulary_practice')
    word = models.CharField(max_length=100)
    story_id = models.CharField(max_length=100, blank=True)
    best_score = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    attempts = models.IntegerField(default=0)
    last_practiced = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "word")
        indexes = [
            models.Index(fields=['user', 'last_practiced']),
            models.Index(fields=['story_id']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.word} ({self.best_score}%)"


class ParentalControlSettings(models.Model):
    """Per-parent controls configuration for kids experiences."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parental_controls')
    pin_hash = models.CharField(max_length=128, blank=True, default="")
    daily_limit_minutes = models.IntegerField(
        default=30,
        validators=[MinValueValidator(5), MaxValueValidator(600)],
        help_text="Daily time allowance in minutes for kids mode sessions",
    )
    last_pin_update = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Parental Control Settings"
        verbose_name_plural = "Parental Control Settings"

    def __str__(self):
        status = "secured" if self.pin_hash else "open"
        return f"ParentalControls(user={self.user_id}, status={status})"

    @property
    def has_pin(self) -> bool:
        return bool(self.pin_hash)


class KidsPronunciationPractice(models.Model):
    """Track pronunciation phrase practice sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kids_pronunciation_practice')
    phrase = models.CharField(max_length=500)  # Changed from TextField to CharField for MySQL compatibility
    story_id = models.CharField(max_length=100, blank=True)
    best_score = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    attempts = models.IntegerField(default=0)
    last_practiced = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "phrase")
        indexes = [
            models.Index(fields=['user', 'last_practiced']),
            models.Index(fields=['story_id']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.phrase[:50]} ({self.best_score}%)"


class KidsGameSession(models.Model):
    """Track game sessions and scores"""
    GAME_TYPES = [
        ('tongue-twister', 'Tongue Twisters'),
        ('word-chain', 'Word Chain'),
        ('story-telling', 'Story Telling'),
        ('pronunciation-challenge', 'Pronunciation Master'),
        ('conversation-practice', 'Chat Practice'),
        ('debate-club', 'Debate Club'),
        ('critical-thinking', 'Critical Thinking'),
        ('research-challenge', 'Research Challenge'),
        ('presentation-master', 'Presentation Master'),
        ('ethics-discussion', 'Ethics Discussion'),
        ('rhyme', 'Rhyme Game'),
        ('sentence', 'Sentence Builder'),
        ('echo', 'Echo Challenge'),
        ('memory', 'Memory Game'),
        ('word_match', 'Word Match'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='kids_game_sessions')
    game_type = models.CharField(max_length=50)
    game_title = models.CharField(max_length=255, blank=True)
    score = models.FloatField(default=0, validators=[MinValueValidator(0)])
    points_earned = models.IntegerField(default=0)
    rounds = models.IntegerField(default=0)
    difficulty = models.CharField(max_length=20, default='beginner')
    duration_seconds = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    details = models.JSONField(default=dict)  # Additional game-specific data including conversation history
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['game_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.game_type} ({self.score}%) - {self.created_at.date()}"


# ============= Teen Specific Models =============
class TeenProgress(models.Model):
    """Aggregate teen experience metrics."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teen_progress')
    points = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    last_engagement = models.DateField(null=True, blank=True)
    vocabulary_attempts = models.IntegerField(default=0)
    pronunciation_attempts = models.IntegerField(default=0)
    games_attempts = models.IntegerField(default=0)
    missions_started = models.IntegerField(default=0)
    missions_completed = models.IntegerField(default=0)
    favorites_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Teen Progress"
        verbose_name_plural = "Teen Progress"

    def __str__(self):
        return f"TeenProgress(user={self.user_id}, points={self.points}, streak={self.streak})"


class TeenStoryProgress(models.Model):
    """Track progress for individual teen missions."""
    STATUS_CHOICES = [
        ('started', 'Started'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teen_story_progress')
    story_id = models.CharField(max_length=100)
    story_title = models.CharField(max_length=255)
    story_type = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='started')
    attempts = models.IntegerField(default=0)
    best_score = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    total_points_earned = models.IntegerField(default=0)
    last_started_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'story_id')
        indexes = [
            models.Index(fields=['user', 'story_id']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.story_title} ({self.status})"


class TeenVocabularyPractice(models.Model):
    """Track vocabulary practice sessions for teen experiences."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teen_vocabulary_practice')
    word = models.CharField(max_length=100)
    story_id = models.CharField(max_length=100, blank=True)
    story_title = models.CharField(max_length=255, blank=True)
    attempts = models.IntegerField(default=0)
    best_score = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    last_practiced = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'word')
        indexes = [
            models.Index(fields=['user', 'word']),
            models.Index(fields=['user', 'last_practiced']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.word} ({self.best_score}%)"


class TeenPronunciationPractice(models.Model):
    """Track pronunciation practice sessions for teen experiences."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teen_pronunciation_practice')
    phrase = models.CharField(max_length=500)
    story_id = models.CharField(max_length=100, blank=True)
    story_title = models.CharField(max_length=255, blank=True)
    attempts = models.IntegerField(default=0)
    best_score = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    last_practiced = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'phrase')
        indexes = [
            models.Index(fields=['user', 'phrase']),
            models.Index(fields=['user', 'last_practiced']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.phrase[:40]} ({self.best_score}%)"


class TeenFavorite(models.Model):
    """Teen user's favorite missions."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teen_favorites')
    story_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'story_id')
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.story_id}"


class TeenAchievement(models.Model):
    """Track teen-specific achievement progress."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teen_achievements')
    key = models.CharField(max_length=100)
    progress = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    unlocked = models.BooleanField(default=False)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'key')
        indexes = [
            models.Index(fields=['user', 'key']),
            models.Index(fields=['user', 'unlocked']),
        ]

    def __str__(self):
        status = "Unlocked" if self.unlocked else f"{self.progress}%"
        return f"{self.user.username} - {self.key} ({status})"


class TeenGameSession(models.Model):
    """Track teen game sessions and scores"""
    GAME_TYPES = [
        ('debate-club', 'Debate Club'),
        ('critical-thinking', 'Critical Thinking'),
        ('research-challenge', 'Research Challenge'),
        ('presentation-master', 'Presentation Master'),
        ('ethics-discussion', 'Ethics Discussion'),
        ('pronunciation-challenge', 'Advanced Pronunciation'),
        ('conversation-practice', 'Professional Conversation'),
        ('tongue-twister', 'Tongue Twisters'),
        ('word-chain', 'Word Chain'),
        ('story-telling', 'Story Telling'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teen_game_sessions')
    game_type = models.CharField(max_length=50)
    game_title = models.CharField(max_length=255, blank=True)
    score = models.FloatField(default=0, validators=[MinValueValidator(0)])
    points_earned = models.IntegerField(default=0)
    rounds = models.IntegerField(default=0)
    difficulty = models.CharField(max_length=20, default='beginner')
    duration_seconds = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    details = models.JSONField(default=dict)  # Additional game-specific data including conversation history
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['game_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.game_type} ({self.score}%) - {self.created_at.date()}"


class TeenCertificate(models.Model):
    """Issued certificate record for teen users."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teen_certificates')
    cert_id = models.CharField(max_length=128)
    title = models.CharField(max_length=255)
    file_url = models.URLField(blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "cert_id")

    def __str__(self):
        return f"{self.user.username} - {self.cert_id} ({self.issued_at.date()})"


class UserNotification(models.Model):
    """Notifications for end users."""
    TYPE_CHOICES = [
        ('system', 'System'),
        ('certificate', 'Certificate'),
        ('badge', 'Badge'),
        ('trophy', 'Trophy'),
        ('achievement', 'Achievement'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_notifications'
    )
    notification_type = models.CharField(max_length=32, choices=TYPE_CHOICES, default='system')
    title = models.CharField(max_length=255)
    message = models.TextField()
    icon = models.CharField(max_length=64, blank=True, default="")
    action_url = models.URLField(blank=True, null=True)

    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    event_key = models.CharField(
        max_length=150,
        blank=True,
        default="",
        help_text="Unique key used to deduplicate notifications (e.g. certificate ID)"
    )

    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['event_key']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'event_key'],
                condition=Q(event_key__gt=''),
                name='unique_user_event_key'
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.notification_type})"


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


# ============= Cookie Consent Preferences =============
class CookieConsent(models.Model):
    """Stores cookie consent decisions per device/user."""

    consent_id = models.CharField(max_length=64, unique=True, help_text="Client-generated identifier for this device/session")
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cookie_consents',
        help_text="Associated user if authenticated when consent given",
    )
    accepted = models.BooleanField(default=False)
    functional = models.BooleanField(default=True)
    statistics = models.BooleanField(default=False)
    marketing = models.BooleanField(default=False)
    user_agent = models.CharField(max_length=512, blank=True, default='', help_text="User agent string captured when consent saved")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['consent_id'], name='cookie_consent_id_idx'),
            models.Index(fields=['user', 'updated_at'], name='cookie_consent_usr_idx'),
        ]

    def __str__(self):
        status = 'accepted' if self.accepted else 'pending'
        return f"CookieConsent({self.consent_id}, {status})"


# ============= Platform Settings (Singleton) =============
class PlatformSettings(models.Model):
    """Site-wide configurable settings managed from the admin portal.

    This is intended to be a singleton row. Enforce via get_or_create in views.
    """

    # General
    platform_name = models.CharField(max_length=255, default="Elora")
    support_email = models.EmailField(blank=True, default="support@elora.com")
    maintenance_mode = models.BooleanField(default=False)
    allow_registrations = models.BooleanField(default=True)

    # Analytics
    ga_id = models.CharField(max_length=32, blank=True, default="")  # e.g., G-XXXXXXXXXX
    clarity_id = models.CharField(max_length=64, blank=True, default="")
    analytics_enabled = models.BooleanField(default=True)

    # Security
    require_email_verification = models.BooleanField(default=True)
    two_factor_admin = models.BooleanField(default=False)
    session_timeout_minutes = models.IntegerField(default=60, validators=[MinValueValidator(5), MaxValueValidator(1440)])

    # Appearance
    default_theme = models.CharField(max_length=10, default='light', choices=[('light', 'Light'), ('dark', 'Dark'), ('auto', 'Auto')])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Platform Settings"
        verbose_name_plural = "Platform Settings"

    def __str__(self):
        return f"PlatformSettings(id={self.id or 'singleton'})"