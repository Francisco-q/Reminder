"""
User URLs - REST API endpoints for user management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

# Create router for ViewSets
router = DefaultRouter()
router.register('', UserViewSet, basename='users')

app_name = 'users'

urlpatterns = [
    path('', include(router.urls)),
]
