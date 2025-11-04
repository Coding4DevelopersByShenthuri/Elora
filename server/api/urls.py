from django.urls import path
from . import views

urlpatterns = [
    # ============= Health Check =============
    path('health', views.health_check, name='health-check'),
    
    # ============= Authentication =============
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/google', views.google_auth, name='google-auth'),
    path('auth/profile', views.user_profile, name='user-profile'),
    path('auth/user', views.user_info, name='user-info'),
    path('verify-email/<str:token>/', views.verify_email, name='verify-email'),
    
    # ============= Survey Step Tracking =============
    path('survey/step', views.save_survey_step, name='save-survey-step'),
    path('survey/steps', views.get_survey_steps, name='get-survey-steps'),
    
    # ============= Lessons =============
    path('lessons/', views.lessons_list, name='lessons-list'),
    path('lessons/<slug:slug>/', views.lesson_detail, name='lesson-detail'),
    
    # ============= Progress Tracking =============
    path('progress/', views.my_progress, name='my-progress'),
    path('progress/record', views.record_lesson_progress, name='record-progress'),
    path('practice/record', views.record_practice_session, name='record-practice'),
    path('practice/history', views.practice_history, name='practice-history'),
    
    # ============= Vocabulary =============
    path('vocabulary/', views.vocabulary, name='vocabulary'),
    path('vocabulary/<int:word_id>/', views.vocabulary_detail, name='vocabulary-detail'),
    
    # ============= Achievements =============
    path('achievements/', views.achievements_list, name='achievements-list'),
    path('achievements/my', views.my_achievements, name='my-achievements'),
    path('achievements/check', views.check_achievements, name='check-achievements'),
    
    # ============= Statistics =============
    path('stats/user', views.user_stats, name='user-stats'),
    path('stats/daily', views.daily_progress, name='daily-progress'),
    
    # ============= Kids Specific =============
    path('kids/lessons', views.kids_lessons, name='kids-lessons'),
    path('kids/progress', views.kids_progress_get, name='kids-progress-get'),
    path('kids/progress/update', views.kids_progress_update, name='kids-progress-update'),
    path('kids/achievements', views.kids_achievements_list, name='kids-achievements'),
    path('kids/certificates/issue', views.kids_issue_certificate, name='kids-issue-certificate'),
    path('kids/certificates/my', views.kids_my_certificates, name='kids-my-certificates'),
    path('kids/analytics', views.kids_analytics, name='kids-analytics'),
    path('kids/gemini/game', views.kids_gemini_game, name='kids-gemini-game'),
    
    # ============= Waitlist =============
    path('waitlist/signup', views.waitlist_signup, name='waitlist-signup'),
    
    # ============= Sync & Offline Support =============
    path('sync/changes', views.sync_changes, name='sync-changes'),
    path('sync/upsert', views.idempotent_upsert, name='sync-upsert'),
    
    # ============= Admin Endpoints =============
    path('admin/dashboard/stats', views.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('admin/activities', views.admin_activities_list, name='admin-activities-list'),
    path('admin/activities/<str:activity_id>', views.admin_activity_detail, name='admin-activity-detail'),
    path('admin/users', views.admin_users_list, name='admin-users-list'),
    path('admin/users/<int:user_id>', views.admin_user_detail, name='admin-user-detail'),
    path('admin/users/create-superuser', views.admin_create_superuser, name='admin-create-superuser'),
    path('admin/analytics', views.admin_analytics, name='admin-analytics'),
    path('admin/notifications', views.admin_notifications_list, name='admin-notifications-list'),
    path('admin/notifications/unread-count', views.admin_notifications_unread_count, name='admin-notifications-unread-count'),
    path('admin/notifications/<int:notification_id>/read', views.admin_notification_mark_read, name='admin-notification-mark-read'),
    path('admin/notifications/<int:notification_id>/delete', views.admin_notification_delete, name='admin-notification-delete'),
    path('admin/notifications/bulk-delete', views.admin_notifications_bulk_delete, name='admin-notifications-bulk-delete'),
    path('admin/notifications/mark-all-read', views.admin_notifications_mark_all_read, name='admin-notifications-mark-all-read'),
    path('admin/notifications/test', views.admin_create_test_notification, name='admin-create-test-notification'),
    
    # ============= Admin Lessons Management =============
    path('admin/lessons', views.admin_lessons_list, name='admin-lessons-list'),
    path('admin/lessons/stats', views.admin_lessons_stats, name='admin-lessons-stats'),
    path('admin/lessons/create', views.admin_lesson_create, name='admin-lesson-create'),
    path('admin/lessons/<int:lesson_id>', views.admin_lesson_detail, name='admin-lesson-detail'),
    
    # ============= Admin Practice Sessions =============
    path('admin/practice', views.admin_practice_list, name='admin-practice-list'),
    path('admin/practice/stats', views.admin_practice_stats, name='admin-practice-stats'),
    path('admin/practice/<int:session_id>', views.admin_practice_detail, name='admin-practice-detail'),
    
    # ============= Admin Progress Tracking =============
    path('admin/progress', views.admin_progress_list, name='admin-progress-list'),
    path('admin/progress/stats', views.admin_progress_stats, name='admin-progress-stats'),
    path('admin/progress/<int:progress_id>', views.admin_progress_detail, name='admin-progress-detail'),
    
    # ============= Admin Vocabulary Management =============
    path('admin/vocabulary', views.admin_vocabulary_list, name='admin-vocabulary-list'),
    path('admin/vocabulary/stats', views.admin_vocabulary_stats, name='admin-vocabulary-stats'),
    path('admin/vocabulary/<int:word_id>', views.admin_vocabulary_detail, name='admin-vocabulary-detail'),
    
    # ============= Admin Achievements Management =============
    path('admin/achievements', views.admin_achievements_list, name='admin-achievements-list'),
    path('admin/achievements/stats', views.admin_achievements_stats, name='admin-achievements-stats'),
    path('admin/achievements/create', views.admin_achievement_create, name='admin-achievement-create'),
    path('admin/achievements/<int:achievement_id>', views.admin_achievement_detail, name='admin-achievement-detail'),
    path('admin/user-achievements', views.admin_user_achievements, name='admin-user-achievements'),
    
    # ============= Admin Surveys Management =============
    path('admin/surveys', views.admin_surveys_list, name='admin-surveys-list'),
    path('admin/surveys/stats', views.admin_surveys_stats, name='admin-surveys-stats'),
    path('admin/surveys/<int:user_id>', views.admin_survey_detail, name='admin-survey-detail'),
    path('admin/surveys/<int:user_id>/update', views.admin_survey_update, name='admin-survey-update'),
    path('admin/surveys/<int:user_id>/delete', views.admin_survey_delete, name='admin-survey-delete'),
    path('admin/surveys/<int:user_id>/steps', views.admin_survey_steps, name='admin-survey-steps'),
]
