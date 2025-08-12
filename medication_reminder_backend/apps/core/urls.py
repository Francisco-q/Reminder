"""
Core URLs - Health check and utilities
"""
from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.health_check, name='health-check'),
    path('status/', views.system_status, name='system-status'),
]
