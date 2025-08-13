"""
Monitoring URLs - Dashboard and system monitoring endpoints
"""
from django.urls import path
from .views import (
    MonitoringDashboardView, sync_features, run_api_tests, 
    setup_default_tests, health_check, version_report,
    create_version, feature_sync_report, export_report
)

app_name = 'monitoring'

urlpatterns = [
    # Main dashboard
    path('dashboard/', MonitoringDashboardView.as_view(), name='dashboard'),
    
    # Feature synchronization
    path('sync-features/', sync_features, name='sync_features'),
    path('feature-report/', feature_sync_report, name='feature_sync_report'),
    
    # API testing
    path('run-tests/', run_api_tests, name='run_api_tests'),
    path('setup-tests/', setup_default_tests, name='setup_default_tests'),
    
    # Health monitoring
    path('health-check/', health_check, name='health_check'),
    
    # Version management
    path('version-report/', version_report, name='version_report'),
    path('create-version/', create_version, name='create_version'),
    
    # Export reports
    path('export/', export_report, name='export_report'),
]
