from django.contrib import admin
from django.utils import timezone
from .models import (
    UserProfile, Lesson, LessonProgress, PracticeSession,
    VocabularyWord, Achievement, UserAchievement,
    KidsLesson, KidsProgress, KidsAchievement, KidsCertificate, KidsTrophy, WaitlistEntry,
    UserNotification, AdminNotification, StoryEnrollment, StoryWord, StoryPhrase, KidsFavorite,
    KidsVocabularyPractice, KidsPronunciationPractice, KidsGameSession,
    TeenProgress, TeenStoryProgress, TeenVocabularyPractice,
    TeenPronunciationPractice, TeenFavorite, TeenAchievement,
    TeenGameSession, TeenCertificate,
    EmailVerificationToken, SurveyStepResponse, ParentalControlSettings,
    CookieConsent, PlatformSettings, CategoryProgress, PageEligibility,
    VideoEngagement, ChannelSubscription, PracticeComment, VideoShareEvent
)


# ============= User Profile Admin =============
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'points', 'current_streak', 'survey_completed_at', 'updated_at']
    list_filter = ['level', 'survey_completed_at', 'notifications_enabled']
    search_fields = ['user__username', 'user__email', 'native_language']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Learning Progress', {
            'fields': ('level', 'points', 'current_streak', 'longest_streak', 'avatar')
        }),
        ('Survey Data', {
            'fields': ('age_range', 'native_language', 'english_level', 'learning_purpose', 'interests', 'survey_completed_at', 'practice_goal_minutes', 'practice_start_time')
        }),
        ('Settings', {
            'fields': ('voice_speed', 'difficulty', 'notifications_enabled', 'auto_play')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


# ============= Lesson Admin =============
@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'lesson_type', 'content_type', 'difficulty_level', 'duration_minutes', 'is_active', 'order']
    list_filter = ['lesson_type', 'content_type', 'is_active', 'difficulty_level']
    search_fields = ['title', 'slug', 'description']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['lesson_type', 'order', 'difficulty_level']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'slug', 'description')
        }),
        ('Classification', {
            'fields': ('lesson_type', 'content_type', 'difficulty_level', 'duration_minutes', 'order')
        }),
        ('Content', {
            'fields': ('payload',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


# ============= Lesson Progress Admin =============
@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'completed', 'score', 'attempts', 'last_attempt']
    list_filter = ['completed', 'lesson__lesson_type', 'last_attempt']
    search_fields = ['user__username', 'lesson__title']
    readonly_fields = ['created_at', 'updated_at', 'last_attempt']
    date_hierarchy = 'last_attempt'
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'lesson', 'completed')
        }),
        ('Scores', {
            'fields': ('score', 'pronunciation_score', 'fluency_score', 'accuracy_score', 'grammar_score')
        }),
        ('Progress', {
            'fields': ('time_spent_minutes', 'attempts', 'notes', 'details')
        }),
        ('Timestamps', {
            'fields': ('last_attempt', 'created_at', 'updated_at')
        }),
    )


# ============= Practice Session Admin =============
@admin.register(PracticeSession)
class PracticeSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_type', 'lesson', 'score', 'points_earned', 'duration_minutes', 'session_date']
    list_filter = ['session_type', 'session_date']
    search_fields = ['user__username', 'lesson__title']
    readonly_fields = ['session_date']
    date_hierarchy = 'session_date'
    ordering = ['-session_date']


# ============= Vocabulary Admin =============
@admin.register(VocabularyWord)
class VocabularyWordAdmin(admin.ModelAdmin):
    list_display = ['user', 'word', 'mastery_level', 'times_practiced', 'times_correct', 'category', 'last_practiced']
    list_filter = ['category', 'difficulty', 'last_practiced']
    search_fields = ['user__username', 'word', 'definition']
    readonly_fields = ['first_learned', 'last_practiced']
    date_hierarchy = 'last_practiced'


# ============= Achievement Admin =============
@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'tier', 'points', 'requirement_type', 'requirement_target', 'is_active']
    list_filter = ['category', 'tier', 'is_active']
    search_fields = ['title', 'description', 'achievement_id']
    readonly_fields = ['created_at']


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement', 'progress', 'unlocked', 'unlocked_at']
    list_filter = ['unlocked', 'achievement__category', 'achievement__tier']
    search_fields = ['user__username', 'achievement__title']
    readonly_fields = ['unlocked_at']
    date_hierarchy = 'unlocked_at'


# ============= Teen Models Admin =============
@admin.register(TeenProgress)
class TeenProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'points', 'streak', 'vocabulary_attempts', 'pronunciation_attempts', 'games_attempts', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TeenStoryProgress)
class TeenStoryProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'story_title', 'story_id', 'status', 'best_score', 'attempts', 'completed_at']
    list_filter = ['status', 'story_type']
    search_fields = ['user__username', 'story_title', 'story_id']
    readonly_fields = ['last_started_at', 'completed_at']


@admin.register(TeenVocabularyPractice)
class TeenVocabularyPracticeAdmin(admin.ModelAdmin):
    list_display = ['user', 'word', 'story_id', 'attempts', 'best_score', 'last_practiced']
    search_fields = ['user__username', 'word', 'story_id']
    list_filter = ['story_id']
    readonly_fields = ['created_at', 'last_practiced']


@admin.register(TeenPronunciationPractice)
class TeenPronunciationPracticeAdmin(admin.ModelAdmin):
    list_display = ['user', 'phrase', 'story_id', 'attempts', 'best_score', 'last_practiced']
    search_fields = ['user__username', 'phrase', 'story_id']
    list_filter = ['story_id']
    readonly_fields = ['created_at', 'last_practiced']


@admin.register(TeenFavorite)
class TeenFavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'story_id', 'created_at']
    search_fields = ['user__username', 'story_id']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(TeenAchievement)
class TeenAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'key', 'progress', 'unlocked', 'updated_at']
    list_filter = ['unlocked']
    search_fields = ['user__username', 'key']
    readonly_fields = ['unlocked_at', 'updated_at']


@admin.register(TeenGameSession)
class TeenGameSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'game_type', 'score', 'points_earned', 'duration_seconds', 'created_at']
    list_filter = ['game_type', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']


@admin.register(TeenCertificate)
class TeenCertificateAdmin(admin.ModelAdmin):
    list_display = ['user', 'cert_id', 'title', 'issued_at']
    list_filter = ['issued_at']
    search_fields = ['user__username', 'cert_id', 'title']
    readonly_fields = ['issued_at']


@admin.register(VideoEngagement)
class VideoEngagementAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'liked', 'saved', 'playlist_name', 'updated_at']
    list_filter = ['liked', 'saved']
    search_fields = ['user__username', 'video__title', 'playlist_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ChannelSubscription)
class ChannelSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'channel_name', 'is_active', 'subscribed_at', 'unsubscribed_at']
    list_filter = ['is_active', 'channel_slug']
    search_fields = ['user__username', 'channel_name']
    readonly_fields = ['subscribed_at', 'unsubscribed_at']


@admin.register(PracticeComment)
class PracticeCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'video']
    search_fields = ['user__username', 'video__title', 'content']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(VideoShareEvent)
class VideoShareEventAdmin(admin.ModelAdmin):
    list_display = ['video', 'user', 'method', 'created_at']
    list_filter = ['method']
    search_fields = ['video__title', 'user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


# ============= Kids Models Admin =============
@admin.register(KidsLesson)
class KidsLessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'lesson_type', 'is_active', 'created_at']
    list_filter = ['lesson_type', 'is_active']
    search_fields = ['title', 'slug']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(KidsProgress)
class KidsProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'points', 'streak', 'updated_at']
    search_fields = ['user__username']


@admin.register(KidsAchievement)
class KidsAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'progress', 'unlocked', 'updated_at']
    list_filter = ['unlocked']
    search_fields = ['user__username', 'name']


@admin.register(KidsCertificate)
class KidsCertificateAdmin(admin.ModelAdmin):
    list_display = ['user', 'cert_id', 'title', 'issued_at']
    list_filter = ['issued_at']
    search_fields = ['user__username', 'cert_id', 'title']
    readonly_fields = ['issued_at']
    date_hierarchy = 'issued_at'


@admin.register(KidsTrophy)
class KidsTrophyAdmin(admin.ModelAdmin):
    list_display = ['user', 'trophy_id', 'title', 'audience', 'unlocked_at']
    list_filter = ['audience', 'unlocked_at']
    search_fields = ['user__username', 'trophy_id', 'title']
    readonly_fields = ['unlocked_at']
    date_hierarchy = 'unlocked_at'


# ============= Kids Story Management Admin =============
@admin.register(StoryEnrollment)
class StoryEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'story_title', 'story_id', 'completed', 'score', 'completed_at']
    list_filter = ['completed', 'story_type', 'words_extracted', 'completed_at']
    search_fields = ['user__username', 'story_id', 'story_title']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'completed_at'


@admin.register(StoryWord)
class StoryWordAdmin(admin.ModelAdmin):
    list_display = ['word', 'story_title', 'story_id', 'difficulty', 'category', 'created_at']
    list_filter = ['difficulty', 'category', 'story_id']
    search_fields = ['word', 'story_title', 'hint']
    readonly_fields = ['created_at']


@admin.register(StoryPhrase)
class StoryPhraseAdmin(admin.ModelAdmin):
    list_display = ['phrase', 'story_title', 'story_id', 'difficulty', 'created_at']
    list_filter = ['difficulty', 'story_id']
    search_fields = ['phrase', 'story_title', 'phonemes']
    readonly_fields = ['created_at']


@admin.register(KidsFavorite)
class KidsFavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'story_id', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'story_id']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(KidsVocabularyPractice)
class KidsVocabularyPracticeAdmin(admin.ModelAdmin):
    list_display = ['user', 'word', 'story_id', 'best_score', 'attempts', 'last_practiced']
    list_filter = ['story_id', 'last_practiced']
    search_fields = ['user__username', 'word']
    readonly_fields = ['last_practiced', 'created_at']
    date_hierarchy = 'last_practiced'


@admin.register(KidsPronunciationPractice)
class KidsPronunciationPracticeAdmin(admin.ModelAdmin):
    list_display = ['user', 'phrase', 'story_id', 'best_score', 'attempts', 'last_practiced']
    list_filter = ['story_id', 'last_practiced']
    search_fields = ['user__username', 'phrase']
    readonly_fields = ['last_practiced', 'created_at']
    date_hierarchy = 'last_practiced'


@admin.register(KidsGameSession)
class KidsGameSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'game_type', 'score', 'points_earned', 'duration_seconds', 'created_at']
    list_filter = ['game_type', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']


# ============= Waitlist Admin =============
@admin.register(WaitlistEntry)
class WaitlistEntryAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'interest', 'subscribed', 'notified', 'created_at']
    list_filter = ['interest', 'subscribed', 'notified', 'created_at']
    search_fields = ['email', 'name', 'notes']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    actions = ['mark_as_notified', 'mark_as_not_notified']
    
    def mark_as_notified(self, request, queryset):
        updated = queryset.update(notified=True)
        self.message_user(request, f'{updated} entries marked as notified.')
    mark_as_notified.short_description = "Mark selected as notified"
    
    def mark_as_not_notified(self, request, queryset):
        updated = queryset.update(notified=False)
        self.message_user(request, f'{updated} entries marked as not notified.')
    mark_as_not_notified.short_description = "Mark selected as not notified"


@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'user__email', 'title', 'message']
    readonly_fields = ['created_at', 'updated_at', 'read_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    fieldsets = (
        ('Notification', {
            'fields': ('user', 'notification_type', 'title', 'message', 'icon', 'action_url')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Metadata', {
            'fields': ('event_key', 'metadata')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    actions = ['mark_as_read', 'mark_as_unread']

    def mark_as_read(self, request, queryset):
        updated = queryset.filter(is_read=False).update(is_read=True, read_at=timezone.now())
        self.message_user(request, f'{updated} notifications marked as read.')
    mark_as_read.short_description = "Mark selected as read"

    def mark_as_unread(self, request, queryset):
        updated = queryset.filter(is_read=True).update(is_read=False, read_at=None)
        self.message_user(request, f'{updated} notifications marked as unread.')
    mark_as_unread.short_description = "Mark selected as unread"


# ============= Admin Notification Admin =============
@admin.register(AdminNotification)
class AdminNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'notification_type', 'priority', 'user', 'is_read', 'created_at', 'expires_at']
    list_filter = ['notification_type', 'priority', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'read_at', 'read_by']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'notification_type', 'priority', 'title', 'message', 'link')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at', 'read_by')
        }),
        ('Metadata', {
            'fields': ('metadata',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'expires_at')
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread', 'cleanup_expired']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.filter(is_read=False).update(is_read=True, read_at=timezone.now(), read_by=request.user)
        self.message_user(request, f'{updated} notifications marked as read.')
    mark_as_read.short_description = "Mark selected as read"
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.filter(is_read=True).update(is_read=False, read_at=None, read_by=None)
        self.message_user(request, f'{updated} notifications marked as unread.')
    mark_as_unread.short_description = "Mark selected as unread"
    
    def cleanup_expired(self, request, queryset):
        deleted_count, _ = AdminNotification.cleanup_expired()
        self.message_user(request, f'{deleted_count} expired notifications deleted.')
    cleanup_expired.short_description = "Cleanup expired notifications (30+ days old)"


# ============= Email Verification Admin =============
@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'token_short', 'is_used', 'is_valid_display', 'created_at']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__username', 'user__email', 'token']
    readonly_fields = ['created_at', 'token']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def token_short(self, obj):
        return f"{obj.token[:20]}..." if obj.token else "-"
    token_short.short_description = "Token"
    
    def is_valid_display(self, obj):
        return "Yes" if obj.is_valid() else "No"
    is_valid_display.short_description = "Valid"


# ============= Survey Step Response Admin =============
@admin.register(SurveyStepResponse)
class SurveyStepResponseAdmin(admin.ModelAdmin):
    list_display = ['user', 'step_name', 'step_number', 'completed_at']
    list_filter = ['step_name', 'step_number', 'completed_at']
    search_fields = ['user__username', 'user__email', 'step_name']
    readonly_fields = ['completed_at']
    date_hierarchy = 'completed_at'
    ordering = ['user', 'step_number', '-completed_at']


# ============= Parental Control Settings Admin =============
@admin.register(ParentalControlSettings)
class ParentalControlSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'has_pin', 'daily_limit_minutes', 'last_pin_update', 'updated_at']
    list_filter = ['daily_limit_minutes', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'last_pin_update']
    date_hierarchy = 'created_at'


# ============= Cookie Consent Admin =============
@admin.register(CookieConsent)
class CookieConsentAdmin(admin.ModelAdmin):
    list_display = ['consent_id', 'user', 'accepted', 'functional', 'statistics', 'marketing', 'accepted_at', 'updated_at']
    list_filter = ['accepted', 'functional', 'statistics', 'marketing', 'accepted_at', 'updated_at']
    search_fields = ['consent_id', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'accepted_at']
    date_hierarchy = 'updated_at'
    ordering = ['-updated_at']


# ============= Platform Settings Admin =============
@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    list_display = ['platform_name', 'maintenance_mode', 'allow_registrations', 'analytics_enabled', 'updated_at']
    list_filter = ['maintenance_mode', 'allow_registrations', 'analytics_enabled', 'require_email_verification']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('General', {
            'fields': ('platform_name', 'support_email', 'maintenance_mode', 'allow_registrations')
        }),
        ('Analytics', {
            'fields': ('analytics_enabled', 'ga_id', 'clarity_id')
        }),
        ('Security', {
            'fields': ('require_email_verification', 'two_factor_admin', 'session_timeout_minutes')
        }),
        ('Appearance', {
            'fields': ('default_theme',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one instance (singleton pattern)
        return not PlatformSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of platform settings
        return False


# ============= Category Progress Admin =============
@admin.register(CategoryProgress)
class CategoryProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'category', 'total_points', 'lessons_completed', 'average_score', 'last_activity', 'updated_at']
    list_filter = ['category', 'level', 'last_activity', 'updated_at']
    search_fields = ['user__username', 'user__email', 'category']
    readonly_fields = ['first_access', 'updated_at', 'last_activity']
    date_hierarchy = 'last_activity'
    ordering = ['-last_activity', '-total_points']
    
    fieldsets = (
        ('User & Category', {
            'fields': ('user', 'category')
        }),
        ('Progress Metrics', {
            'fields': ('total_points', 'total_streak', 'lessons_completed', 'practice_time_minutes', 'average_score')
        }),
        ('Engagement', {
            'fields': ('last_activity', 'first_access', 'days_active')
        }),
        ('Additional Metrics', {
            'fields': ('stories_completed', 'vocabulary_words', 'pronunciation_attempts', 'games_completed')
        }),
        ('Progress Tracking', {
            'fields': ('progress_percentage', 'level', 'details')
        }),
        ('Timestamps', {
            'fields': ('updated_at',)
        }),
    )


# ============= Page Eligibility Admin =============
@admin.register(PageEligibility)
class PageEligibilityAdmin(admin.ModelAdmin):
    list_display = ['user', 'page_path', 'is_unlocked', 'unlocked_at', 'updated_at']
    list_filter = ['page_path', 'is_unlocked', 'unlocked_at', 'updated_at']
    search_fields = ['user__username', 'user__email', 'page_path']
    readonly_fields = ['created_at', 'updated_at', 'unlocked_at']
    date_hierarchy = 'unlocked_at'
    
    fieldsets = (
        ('User & Page', {
            'fields': ('user', 'page_path')
        }),
        ('Eligibility', {
            'fields': ('is_unlocked', 'unlocked_at', 'required_criteria', 'current_progress')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
