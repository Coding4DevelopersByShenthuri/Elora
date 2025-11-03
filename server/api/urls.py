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
    path('admin/users', views.admin_users_list, name='admin-users-list'),
    path('admin/users/<int:user_id>', views.admin_user_detail, name='admin-user-detail'),
    path('admin/users/create-superuser', views.admin_create_superuser, name='admin-create-superuser'),
    path('admin/analytics', views.admin_analytics, name='admin-analytics'),
]
