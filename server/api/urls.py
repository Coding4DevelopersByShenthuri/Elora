from django.urls import path
from . import views

urlpatterns = [
    path('api/auth/register', views.register, name='register'),
    path('api/auth/login', views.login, name='login'),
    path('api/auth/<str:provider>', views.social_login_redirect, name='social-login'),
    # Kids
    path('api/kids/lessons', views.kids_lessons, name='kids-lessons'),
    path('api/kids/progress', views.kids_progress_get, name='kids-progress-get'),
    path('api/kids/progress/update', views.kids_progress_update, name='kids-progress-update'),
    path('api/kids/achievements', views.kids_achievements, name='kids-achievements'),
]