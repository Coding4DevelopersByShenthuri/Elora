from django.contrib import admin
from .models import (
    UserProfile, Lesson, LessonProgress, PracticeSession,
    VocabularyWord, Achievement, UserAchievement,
    KidsLesson, KidsProgress, KidsAchievement, WaitlistEntry
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
            'fields': ('age_range', 'native_language', 'english_level', 'learning_purpose', 'interests', 'survey_completed_at')
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
