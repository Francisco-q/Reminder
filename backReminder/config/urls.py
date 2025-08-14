"""
Django URL Configuration
Vertical Slicing: URLs organizadas por funcionalidad
"""

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from apps.core.views import home

urlpatterns = [
    # Home page - API information
    path('', home, name='home'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Authentication
    path('api/auth/', include('apps.authentication.urls')),
    
    # Vertical Slices - Organized by domain features
    path('api/medications/', include('apps.medications.urls')),      # **HABILITADO - PostgreSQL configurado**
    path('api/schedules/', include('apps.schedules.urls')),          # **HABILITADO - depende de medications**
    path('api/notifications/', include('apps.notifications.urls')), # **HABILITADO**
    path('api/analytics/', include('apps.analytics.urls')),         # **HABILITADO - básico creado**
    path('api/users/', include('apps.users.urls')),
    path('api/monitoring/', include('apps.monitoring.urls')),        # **RE-HABILITADO**
    
    # Health Check
    path('health/', include('apps.core.urls')),
]
