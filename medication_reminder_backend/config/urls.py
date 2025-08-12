"""
Django URL Configuration
Vertical Slicing: URLs organizadas por funcionalidad
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Authentication
    path('api/auth/', include('apps.authentication.urls')),
    
    # Vertical Slices - Organized by domain features
    path('api/medications/', include('apps.medications.urls')),
    path('api/schedules/', include('apps.schedules.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/monitoring/', include('apps.monitoring.urls')),
    
    # Health Check
    path('health/', include('apps.core.urls')),
]
