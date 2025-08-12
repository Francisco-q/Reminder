"""
Core views - System health and status
"""
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import connections
from django.core.cache import cache
import json


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Simple health check endpoint
    """
    return JsonResponse({
        'status': 'healthy',
        'message': 'Medication Reminder API is running'
    })


@csrf_exempt
@require_http_methods(["GET"])
def system_status(request):
    """
    Detailed system status with database and cache checks
    """
    status = {
        'api': 'healthy',
        'database': 'unknown',
        'cache': 'unknown',
        'timestamp': None
    }
    
    # Check database connection
    try:
        db_conn = connections['default']
        db_conn.cursor()
        status['database'] = 'healthy'
    except Exception as e:
        status['database'] = f'error: {str(e)}'
    
    # Check cache connection
    try:
        cache.set('health_check', 'ok', 30)
        cached_value = cache.get('health_check')
        if cached_value == 'ok':
            status['cache'] = 'healthy'
        else:
            status['cache'] = 'error: cache not working'
    except Exception as e:
        status['cache'] = f'error: {str(e)}'
    
    # Add timestamp
    from django.utils import timezone
    status['timestamp'] = timezone.now().isoformat()
    
    # Determine overall health
    overall_healthy = all(
        service in ['healthy'] for service in [status['database'], status['cache']]
    )
    
    return JsonResponse({
        'status': 'healthy' if overall_healthy else 'degraded',
        'services': status
    })
