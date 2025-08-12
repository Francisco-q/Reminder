"""
Automated API testing service
"""
import time
import requests
import json
from typing import Dict, List, Any, Optional
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import Client
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from .models import APIEndpointTest, SystemHealthCheck

User = get_user_model()


class APITestService:
    """
    Service for automated API endpoint testing
    """
    
    def __init__(self):
        self.client = APIClient()
        self.base_url = getattr(settings, 'API_BASE_URL', 'http://localhost:8000')
        self.test_user = None
        self.auth_token = None
    
    def setup_test_user(self):
        """Create or get test user for authenticated requests"""
        try:
            self.test_user, created = User.objects.get_or_create(
                email='test@medicationreminder.com',
                defaults={
                    'username': 'testuser',
                    'first_name': 'Test',
                    'last_name': 'User',
                    'is_active': True,
                }
            )
            if created:
                self.test_user.set_password('testpass123')
                self.test_user.save()
            
            # Generate JWT token
            refresh = RefreshToken.for_user(self.test_user)
            self.auth_token = str(refresh.access_token)
            
        except Exception as e:
            print(f"Error setting up test user: {e}")
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        if not self.auth_token:
            self.setup_test_user()
        
        return {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json',
        }
    
    def test_endpoint(self, endpoint_test: APIEndpointTest) -> Dict[str, Any]:
        """Test a single API endpoint"""
        start_time = time.time()
        
        try:
            # Prepare request
            url = f"{self.base_url}{endpoint_test.endpoint_path}"
            headers = {'Content-Type': 'application/json'}
            
            if endpoint_test.requires_auth:
                headers.update(self.get_auth_headers())
            
            # Make request based on method
            if endpoint_test.http_method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif endpoint_test.http_method == 'POST':
                response = requests.post(
                    url, 
                    headers=headers, 
                    json=endpoint_test.test_payload,
                    timeout=10
                )
            elif endpoint_test.http_method == 'PUT':
                response = requests.put(
                    url, 
                    headers=headers, 
                    json=endpoint_test.test_payload,
                    timeout=10
                )
            elif endpoint_test.http_method == 'PATCH':
                response = requests.patch(
                    url, 
                    headers=headers, 
                    json=endpoint_test.test_payload,
                    timeout=10
                )
            elif endpoint_test.http_method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported HTTP method: {endpoint_test.http_method}")
            
            # Calculate response time
            response_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            # Check response
            success = response.status_code == endpoint_test.expected_status_code
            
            # Check expected keys in response (if JSON)
            if success and endpoint_test.expected_response_keys:
                try:
                    response_data = response.json()
                    for key in endpoint_test.expected_response_keys:
                        if key not in response_data:
                            success = False
                            break
                except:
                    success = False
            
            # Update test record
            status = 'passed' if success else 'failed'
            error_message = '' if success else f"Status: {response.status_code}, Expected: {endpoint_test.expected_status_code}"
            
            endpoint_test.update_test_result(status, response_time, error_message)
            
            return {
                'endpoint': endpoint_test.endpoint_path,
                'method': endpoint_test.http_method,
                'status': status,
                'response_time': response_time,
                'status_code': response.status_code,
                'expected_status': endpoint_test.expected_status_code,
                'error': error_message,
            }
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            error_message = str(e)
            endpoint_test.update_test_result('error', response_time, error_message)
            
            return {
                'endpoint': endpoint_test.endpoint_path,
                'method': endpoint_test.http_method,
                'status': 'error',
                'response_time': response_time,
                'error': error_message,
            }
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all registered API tests"""
        test_results = {
            'started_at': timezone.now(),
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'errors': 0,
            'total_time': 0,
            'results': [],
        }
        
        # Get all endpoint tests
        endpoint_tests = APIEndpointTest.objects.all()
        test_results['total_tests'] = endpoint_tests.count()
        
        start_time = time.time()
        
        for endpoint_test in endpoint_tests:
            result = self.test_endpoint(endpoint_test)
            test_results['results'].append(result)
            
            if result['status'] == 'passed':
                test_results['passed'] += 1
            elif result['status'] == 'failed':
                test_results['failed'] += 1
            else:
                test_results['errors'] += 1
        
        test_results['total_time'] = (time.time() - start_time) * 1000
        test_results['completed_at'] = timezone.now()
        
        return test_results
    
    def setup_default_tests(self):
        """Setup default API tests for all endpoints"""
        default_tests = [
            # Authentication endpoints
            {
                'endpoint_path': '/api/auth/register/',
                'http_method': 'POST',
                'requires_auth': False,
                'test_payload': {
                    'email': 'newuser@test.com',
                    'username': 'newuser',
                    'password': 'testpass123',
                    'password_confirm': 'testpass123',
                },
                'expected_status_code': 201,
                'expected_response_keys': ['access', 'refresh', 'user'],
            },
            {
                'endpoint_path': '/api/auth/login/',
                'http_method': 'POST',
                'requires_auth': False,
                'test_payload': {
                    'email': 'test@medicationreminder.com',
                    'password': 'testpass123',
                },
                'expected_status_code': 200,
                'expected_response_keys': ['access', 'refresh', 'user'],
            },
            {
                'endpoint_path': '/api/auth/verify/',
                'http_method': 'GET',
                'requires_auth': True,
                'expected_status_code': 200,
                'expected_response_keys': ['valid', 'user'],
            },
            
            # User endpoints
            {
                'endpoint_path': '/api/users/me/',
                'http_method': 'GET',
                'requires_auth': True,
                'expected_status_code': 200,
                'expected_response_keys': ['id', 'email', 'username'],
            },
            
            # Medication endpoints
            {
                'endpoint_path': '/api/medications/',
                'http_method': 'GET',
                'requires_auth': True,
                'expected_status_code': 200,
                'expected_response_keys': ['results'],
            },
            {
                'endpoint_path': '/api/medications/',
                'http_method': 'POST',
                'requires_auth': True,
                'test_payload': {
                    'name': 'Test Medication',
                    'dosage': '500mg',
                    'frequency': 'twice_daily',
                    'times': ['08:00', '20:00'],
                    'color': '#3B82F6',
                },
                'expected_status_code': 201,
                'expected_response_keys': ['id', 'name', 'dosage'],
            },
            
            # Schedule endpoints
            {
                'endpoint_path': '/api/schedules/today/',
                'http_method': 'GET',
                'requires_auth': True,
                'expected_status_code': 200,
                'expected_response_keys': ['schedules'],
            },
            {
                'endpoint_path': '/api/schedules/progress/',
                'http_method': 'GET',
                'requires_auth': True,
                'expected_status_code': 200,
                'expected_response_keys': ['taken', 'total', 'percentage'],
            },
            
            # Health check
            {
                'endpoint_path': '/health/',
                'http_method': 'GET',
                'requires_auth': False,
                'expected_status_code': 200,
                'expected_response_keys': ['status'],
            },
        ]
        
        for test_config in default_tests:
            endpoint_test, created = APIEndpointTest.objects.get_or_create(
                endpoint_path=test_config['endpoint_path'],
                http_method=test_config['http_method'],
                defaults=test_config
            )
            if not created:
                # Update existing test
                for key, value in test_config.items():
                    setattr(endpoint_test, key, value)
                endpoint_test.save()
        
        print(f"Setup {len(default_tests)} default API tests")


class SystemHealthService:
    """
    Service for system health monitoring
    """
    
    @classmethod
    def check_database(cls) -> str:
        """Check database connectivity"""
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                return 'healthy'
        except Exception:
            return 'critical'
    
    @classmethod
    def check_cache(cls) -> str:
        """Check cache connectivity"""
        try:
            from django.core.cache import cache
            cache.set('health_check', 'ok', 30)
            result = cache.get('health_check')
            return 'healthy' if result == 'ok' else 'warning'
        except Exception:
            return 'critical'
    
    @classmethod
    def check_celery(cls) -> str:
        """Check Celery connectivity"""
        try:
            from celery import current_app
            inspect = current_app.control.inspect()
            stats = inspect.stats()
            return 'healthy' if stats else 'warning'
        except Exception:
            return 'critical'
    
    @classmethod
    def check_api_health(cls) -> Dict[str, Any]:
        """Check API endpoints health"""
        healthy_endpoints = APIEndpointTest.objects.filter(is_healthy=True).count()
        total_endpoints = APIEndpointTest.objects.count()
        
        if total_endpoints == 0:
            return {'status': 'unknown', 'healthy': 0, 'total': 0}
        
        health_ratio = healthy_endpoints / total_endpoints
        
        if health_ratio >= 0.9:
            status = 'healthy'
        elif health_ratio >= 0.7:
            status = 'warning'
        else:
            status = 'critical'
        
        return {
            'status': status,
            'healthy': healthy_endpoints,
            'total': total_endpoints,
            'ratio': health_ratio
        }
    
    @classmethod
    def get_system_metrics(cls) -> Dict[str, Any]:
        """Get system performance metrics"""
        metrics = {}
        
        try:
            # User metrics
            metrics['total_users'] = User.objects.count()
            metrics['active_users_24h'] = User.objects.filter(
                last_active__gte=timezone.now() - timezone.timedelta(hours=24)
            ).count()
            
            # Medication metrics
            from apps.medications.models import Medication
            metrics['total_medications'] = Medication.objects.filter(is_active=True).count()
            
            # Schedule metrics (if app exists)
            try:
                from apps.schedules.models import DailySchedule
                metrics['total_schedules_today'] = DailySchedule.objects.filter(
                    date=timezone.now().date()
                ).count()
            except ImportError:
                metrics['total_schedules_today'] = 0
            
        except Exception as e:
            print(f"Error getting system metrics: {e}")
        
        return metrics
    
    @classmethod
    def perform_health_check(cls) -> SystemHealthCheck:
        """Perform complete system health check"""
        # Check all components
        database_status = cls.check_database()
        cache_status = cls.check_cache()
        celery_status = cls.check_celery()
        api_health = cls.check_api_health()
        
        # Get system metrics
        metrics = cls.get_system_metrics()
        
        # Get API metrics
        total_api_calls = APIEndpointTest.objects.aggregate(
            total=models.Sum('total_tests')
        )['total'] or 0
        
        failed_api_calls = APIEndpointTest.objects.aggregate(
            failed=models.Sum('failed_tests')
        )['failed'] or 0
        
        avg_response_time = APIEndpointTest.objects.aggregate(
            avg=models.Avg('average_response_time')
        )['avg'] or 0.0
        
        # Create health check record
        health_check = SystemHealthCheck.objects.create(
            database_status=database_status,
            cache_status=cache_status,
            celery_status=celery_status,
            api_status=api_health['status'],
            
            total_users=metrics.get('total_users', 0),
            active_users_24h=metrics.get('active_users_24h', 0),
            total_medications=metrics.get('total_medications', 0),
            total_schedules_today=metrics.get('total_schedules_today', 0),
            
            total_api_calls_24h=total_api_calls,
            failed_api_calls_24h=failed_api_calls,
            average_response_time=avg_response_time,
            
            detailed_report={
                'api_health': api_health,
                'metrics': metrics,
                'timestamp': timezone.now().isoformat(),
            }
        )
        
        # Calculate health score
        health_check.calculate_health_score()
        
        return health_check
