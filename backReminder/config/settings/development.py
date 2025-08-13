"""
Development settings - Extends base settings
"""

from .base import *
import environ

# Override base environment
env = environ.Env(DEBUG=(bool, True))

# Read environment file
environ.Env.read_env(BASE_DIR / '.env')

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]', 'testserver']  # testserver for Django tests

# Development-specific apps
INSTALLED_APPS += [
    # 'django_extensions',  # Comentado temporalmente para desarrollo rápido
    # 'debug_toolbar',      # Comentado temporalmente para desarrollo rápido
]

# MIDDLEWARE.insert(1, 'debug_toolbar.middleware.DebugToolbarMiddleware')  # Comentado temporalmente

# Debug toolbar configuration
INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

# Development database (you can override with .env)
if env('DATABASE_URL', default=None):
    DATABASES['default'] = env.db()

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS - More permissive in development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',  # Vite React frontend
    'http://127.0.0.1:5173',
    'http://localhost:8081',  # React Native Metro
    'http://10.0.2.2:8000',   # Android emulator
]

# Configuración adicional para Google OAuth
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Cache (Redis for development) - Commented for testing
# CACHES = {
#     'default': {
#         'BACKEND': 'django_redis.cache.RedisCache',
#         'LOCATION': env('REDIS_URL', default='redis://127.0.0.1:6379/1'),
#         'OPTIONS': {
#             'CLIENT_CLASS': 'django_redis.client.DefaultClient',
#         }
#     }
# }

# Logging - More verbose in development
LOGGING['handlers']['console']['level'] = 'DEBUG'
LOGGING['loggers']['apps']['level'] = 'DEBUG'

# Create logs directory
import os
logs_dir = BASE_DIR / 'logs'
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)

# Google OAuth settings
GOOGLE_OAUTH_CLIENT_ID = env('GOOGLE_OAUTH_CLIENT_ID', default='')
GOOGLE_OAUTH_CLIENT_SECRET = env('GOOGLE_OAUTH_CLIENT_SECRET', default='')
