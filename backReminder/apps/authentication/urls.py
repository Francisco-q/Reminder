"""
Authentication URLs - JWT token and auth endpoints
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, login_view, register_view, logout_view,
    password_reset_request_view, password_reset_confirm_view, verify_token_view,
    google_oauth_login
)

app_name = 'authentication'

urlpatterns = [
    # JWT Token endpoints
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Authentication endpoints
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('logout/', logout_view, name='logout'),
    path('google-oauth/', google_oauth_login, name='google_oauth_login'),
    
    # Password reset
    path('password-reset/', password_reset_request_view, name='password_reset_request'),
    path('password-reset/confirm/', password_reset_confirm_view, name='password_reset_confirm'),
    
    # Token verification
    path('verify/', verify_token_view, name='verify_token'),
]
