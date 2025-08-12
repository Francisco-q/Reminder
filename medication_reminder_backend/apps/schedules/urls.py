"""
Schedule URLs - Daily schedules and progress tracking
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailyScheduleViewSet, TodayScheduleView, ProgressView

router = DefaultRouter()
router.register('', DailyScheduleViewSet, basename='schedules')

app_name = 'schedules'

urlpatterns = [
    path('today/', TodayScheduleView.as_view(), name='today'),
    path('progress/', ProgressView.as_view(), name='progress'),
    path('', include(router.urls)),
]
