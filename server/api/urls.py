from django.urls import path
from . import views

urlpatterns = [
    path('api/auth/register', views.register, name='register'),
    path('api/auth/login', views.login, name='login'),
    path('api/auth/<str:provider>', views.social_login_redirect, name='social-login'),
]