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
    
    # ============= Privacy & Compliance =============
    path('privacy/cookie-consent', views.cookie_consent_view, name='cookie-consent'),
    
    # ============= Statistics =============
    path('stats/user', views.user_stats, name='user-stats'),
    path('stats/daily', views.daily_progress, name='daily-progress'),
    
    # ============= Teen Specific =============
    path('teen/dashboard', views.teen_dashboard, name='teen-dashboard'),
    
    # ============= Page Eligibility =============
    path('page-eligibility/', views.get_all_page_eligibilities, name='get-all-page-eligibilities'),
    path('page-eligibility/<str:page_path>', views.get_page_eligibility, name='get-page-eligibility'),
    path('page-eligibility/<str:page_path>/check', views.check_page_eligibility, name='check-page-eligibility'),
    
    # ============= Multi-Category Progress =============
    path('user/multi-category-progress/', views.get_all_category_progress, name='get-all-category-progress'),
    path('user/multi-category-progress/aggregated/', views.get_aggregated_progress, name='get-aggregated-progress'),
    path('user/multi-category-progress/<str:category>/', views.get_category_progress, name='get-category-progress'),
    path('user/multi-category-progress/<str:category>/update/', views.update_category_progress, name='update-category-progress'),
    path('teen/story/start', views.teen_story_start, name='teen-story-start'),
    path('teen/story/complete', views.teen_story_complete, name='teen-story-complete'),
    path('teen/vocabulary/practice', views.teen_vocabulary_practice, name='teen-vocabulary-practice'),
    path('teen/pronunciation/practice', views.teen_pronunciation_practice, name='teen-pronunciation-practice'),
    path('teen/favorite/toggle', views.teen_toggle_favorite, name='teen-toggle-favorite'),
    path('teen/quick-action', views.teen_quick_action, name='teen-quick-action'),
    path('teen/games/session', views.teen_game_session, name='teen-game-session'),
    path('teen/certificates/issue', views.teen_issue_certificate, name='teen-issue-certificate'),
    path('teen/certificates/my', views.teen_my_certificates, name='teen-my-certificates'),
    
    # ============= Kids Specific =============
    path('kids/lessons', views.kids_lessons, name='kids-lessons'),
    path('kids/progress', views.kids_progress_get, name='kids-progress-get'),
    path('kids/progress/update', views.kids_progress_update, name='kids-progress-update'),
    path('kids/achievements', views.kids_achievements_list, name='kids-achievements'),
    path('kids/certificates/issue', views.kids_issue_certificate, name='kids-issue-certificate'),
    path('kids/certificates/my', views.kids_my_certificates, name='kids-my-certificates'),
    path('kids/trophies/unlock', views.kids_unlock_trophy, name='kids-unlock-trophy'),
    path('kids/parental-controls', views.kids_parental_controls_overview, name='kids-parental-controls-overview'),
    path('kids/parental-controls/unlock', views.kids_parental_controls_unlock, name='kids-parental-controls-unlock'),
    path('kids/parental-controls/settings', views.kids_parental_controls_settings, name='kids-parental-controls-settings'),
    path('kids/parental-controls/pin', views.kids_parental_controls_pin, name='kids-parental-controls-pin'),
    path('kids/analytics', views.kids_analytics, name='kids-analytics'),
    path('kids/gemini/game', views.kids_gemini_game, name='kids-gemini-game'),
    
    # ============= Kids Story Management =============
    path('kids/stories/enrollments', views.kids_story_enrollments, name='kids-story-enrollments'),
    path('kids/stories/enroll', views.kids_story_enroll, name='kids-story-enroll'),
    path('kids/stories/words', views.kids_story_words, name='kids-story-words'),
    path('kids/stories/phrases', views.kids_story_phrases, name='kids-story-phrases'),
    path('kids/favorites', views.kids_favorites, name='kids-favorites'),
    path('kids/vocabulary/practice', views.kids_vocabulary_practice, name='kids-vocabulary-practice'),
    path('kids/pronunciation/practice', views.kids_pronunciation_practice, name='kids-pronunciation-practice'),
    path('kids/games/session', views.kids_game_session, name='kids-game-session'),
    path('kids/games/session/<int:session_id>', views.kids_game_session_delete, name='kids-game-session-delete'),
    
    # ============= Waitlist =============
    path('waitlist/signup', views.waitlist_signup, name='waitlist-signup'),
    
    # ============= User Notifications =============
    path('notifications', views.user_notifications, name='user-notifications'),
    path('notifications/unread-count', views.user_notifications_unread_count, name='user-notifications-unread-count'),
    path('notifications/<int:notification_id>/read', views.user_notification_mark_read, name='user-notification-mark-read'),
    path('notifications/<int:notification_id>/delete', views.user_notification_delete, name='user-notification-delete'),
    path('notifications/mark-all-read', views.user_notifications_mark_all_read, name='user-notifications-mark-all-read'),
    
    # ============= Sync & Offline Support =============
    path('sync/changes', views.sync_changes, name='sync-changes'),
    path('sync/upsert', views.idempotent_upsert, name='sync-upsert'),
    
    # ============= Admin Endpoints =============
    path('admin/settings', views.admin_settings, name='admin-settings'),
    path('admin/avatar', views.admin_avatar_upload, name='admin-avatar-upload'),
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
    
    # ============= Public Video Lessons =============
    path('videos', views.videos_list, name='videos-list'),
    path('videos/<str:slug>', views.video_detail, name='video-detail'),
    path('videos/<str:slug>/engagement', views.video_engagement, name='video-engagement'),
    path('videos/<str:slug>/comments', views.video_practice_comments, name='video-comments'),
    path('videos/<str:slug>/share', views.video_share_event, name='video-share'),
    path('channel/subscription', views.channel_subscription, name='channel-subscription'),
    
    # ============= Admin Video Lessons Management =============
    path('admin/videos', views.admin_videos_list, name='admin-videos-list'),
    path('admin/videos/stats', views.admin_videos_stats, name='admin-videos-stats'),
    path('admin/videos/create', views.admin_video_create, name='admin-video-create'),
    path('admin/videos/<int:video_id>', views.admin_video_detail, name='admin-video-detail'),
    
    # ============= Adults Common Features =============
    # Common Lessons
    path('adults/common-lessons', views.adults_common_lessons, name='adults-common-lessons'),
    path('adults/common-lessons/<int:lesson_id>', views.adults_common_lesson_detail, name='adults-common-lesson-detail'),
    path('adults/common-lessons/<int:lesson_id>/enroll', views.adults_common_lesson_enroll, name='adults-common-lesson-enroll'),
    path('adults/common-lessons/enrollments', views.adults_common_lesson_enrollments, name='adults-common-lesson-enrollments'),
    path('adults/common-lessons/<int:lesson_id>/progress', views.adults_common_lesson_progress, name='adults-common-lesson-progress'),
    
    # Weekly Challenges
    path('adults/weekly-challenges', views.adults_weekly_challenges, name='adults-weekly-challenges'),
    path('adults/weekly-challenges/<int:challenge_id>/enroll', views.adults_weekly_challenge_enroll, name='adults-weekly-challenge-enroll'),
    path('adults/weekly-challenges/my', views.adults_my_weekly_challenges, name='adults-my-weekly-challenges'),
    path('adults/weekly-challenges/<int:challenge_id>/update-progress', views.adults_weekly_challenge_update_progress, name='adults-weekly-challenge-update-progress'),
    
    # Learning Goals
    path('adults/learning-goals', views.adults_learning_goals, name='adults-learning-goals'),
    path('adults/learning-goals/create', views.adults_learning_goal_create, name='adults-learning-goal-create'),
    path('adults/learning-goals/<int:goal_id>', views.adults_learning_goal_detail, name='adults-learning-goal-detail'),
    path('adults/learning-goals/<int:goal_id>/update', views.adults_learning_goal_update, name='adults-learning-goal-update'),
    
    # Personalized Recommendations
    path('adults/recommendations', views.adults_recommendations, name='adults-recommendations'),
    path('adults/recommendations/<int:recommendation_id>/view', views.adults_recommendation_view, name='adults-recommendation-view'),
    path('adults/recommendations/<int:recommendation_id>/accept', views.adults_recommendation_accept, name='adults-recommendation-accept'),
    path('adults/recommendations/<int:recommendation_id>/dismiss', views.adults_recommendation_dismiss, name='adults-recommendation-dismiss'),
    
    # Spaced Repetition
    path('adults/spaced-repetition/items', views.adults_spaced_repetition_items, name='adults-spaced-repetition-items'),
    path('adults/spaced-repetition/items/<int:item_id>/review', views.adults_spaced_repetition_review, name='adults-spaced-repetition-review'),
    path('adults/spaced-repetition/due', views.adults_spaced_repetition_due, name='adults-spaced-repetition-due'),
    
    # Microlearning
    path('adults/microlearning', views.adults_microlearning_modules, name='adults-microlearning-modules'),
    path('adults/microlearning/<int:module_id>', views.adults_microlearning_module_detail, name='adults-microlearning-module-detail'),
    path('adults/microlearning/<int:module_id>/complete', views.adults_microlearning_complete, name='adults-microlearning-complete'),
    path('adults/microlearning/featured', views.adults_microlearning_featured, name='adults-microlearning-featured'),
    
    # Progress Analytics
    path('adults/analytics', views.adults_progress_analytics, name='adults-progress-analytics'),
    path('adults/analytics/summary', views.adults_analytics_summary, name='adults-analytics-summary'),
    path('adults/dashboard', views.adults_dashboard, name='adults-dashboard'),
    
    # ============= Dictionary =============
    path('adults/dictionary/search', views.dictionary_search, name='dictionary-search'),
    path('adults/dictionary/lookup/<str:word>', views.dictionary_lookup, name='dictionary-lookup'),
    path('adults/dictionary/my', views.my_dictionary, name='my-dictionary'),
    path('adults/dictionary/add', views.add_to_dictionary, name='add-to-dictionary'),
    path('adults/dictionary/<int:entry_id>', views.remove_from_dictionary, name='remove-from-dictionary'),
    
    # ============= Flashcards =============
    path('adults/flashcards/decks', views.flashcard_decks, name='flashcard-decks'),
    path('adults/flashcards/decks/<int:deck_id>', views.flashcard_deck_detail, name='flashcard-deck-detail'),
    path('adults/flashcards/review/due', views.flashcards_due_for_review, name='flashcards-due-for-review'),
    path('adults/flashcards/review/submit', views.submit_flashcard_review, name='submit-flashcard-review'),
    path('adults/flashcards/generate', views.generate_flashcards_from_vocabulary, name='generate-flashcards'),
    
    # ============= Daily Goals =============
    path('adults/goals/daily', views.daily_goals, name='daily-goals'),
    path('adults/goals/daily/<int:goal_id>', views.update_daily_goal, name='update-daily-goal'),
    path('adults/goals/history', views.daily_goals_history, name='daily-goals-history'),
    
    # ============= Toolbar Preferences =============
    path('adults/toolbar/preferences', views.toolbar_preferences, name='toolbar-preferences'),
    
    # ============= Multi-Mode Practice =============
    path('adults/practice/multi-mode/start', views.start_multi_mode_practice, name='start-multi-mode-practice'),
    path('adults/practice/multi-mode/<int:session_id>/complete', views.complete_multi_mode_practice, name='complete-multi-mode-practice'),
    path('adults/practice/multi-mode/history', views.multi_mode_practice_history, name='multi-mode-practice-history'),
    path('adults/practice/multi-mode/sessions/<int:session_id>/delete', views.delete_multi_mode_practice_session, name='delete-multi-mode-session'),
    path('adults/practice/multi-mode/sessions/delete', views.delete_multi_mode_practice_sessions, name='delete-multi-mode-sessions'),
    
    # ============= Business Email Coach =============
    path('adults/email/templates', views.email_templates, name='email-templates'),
    path('adults/email/templates/<int:template_id>', views.email_template_detail, name='email-template-detail'),
    path('adults/email/practice', views.submit_email_practice, name='submit-email-practice'),
    path('adults/email/practice/history', views.email_practice_history, name='email-practice-history'),
    
    # ============= Pronunciation Analyzer =============
    path('adults/pronunciation/practice', views.submit_pronunciation_practice, name='submit-pronunciation-practice'),
    path('adults/pronunciation/history', views.pronunciation_practice_history, name='pronunciation-practice-history'),
    path('adults/pronunciation/stats', views.pronunciation_statistics, name='pronunciation-statistics'),
    path('adults/pronunciation/practices/<int:practice_id>/delete', views.delete_pronunciation_practice, name='delete-pronunciation-practice'),
    path('adults/pronunciation/practices/delete', views.delete_pronunciation_practices, name='delete-pronunciation-practices'),
    
    # ============= Cultural Intelligence =============
    path('adults/cultural/modules', views.cultural_modules, name='cultural-modules'),
    path('adults/cultural/modules/<str:slug>', views.cultural_module_detail, name='cultural-module-detail'),
    path('adults/cultural/progress', views.cultural_progress, name='cultural-progress'),
    
    # ============= Search =============
    path('adults/search', views.save_search, name='save-search'),
    path('adults/search/suggestions', views.search_suggestions, name='search-suggestions'),
    path('adults/search/history', views.search_history, name='search-history'),
]
