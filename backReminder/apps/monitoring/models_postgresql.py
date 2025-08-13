"""
Monitoring models - System health, version tracking and feature sync
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField, JSONField
from apps.core.models import BaseModel
import uuid


class SystemVersion(BaseModel):
    """
    Track system versions and releases
    """
    # Version information
    version_number = models.CharField(_('Version'), max_length=20)
    version_name = models.CharField(_('Version name'), max_length=100, blank=True)
    build_number = models.PositiveIntegerField(_('Build number'))
    
    # Component versions
    backend_version = models.CharField(_('Backend version'), max_length=20)
    frontend_version = models.CharField(_('Frontend version'), max_length=20, blank=True)
    database_version = models.CharField(_('Database version'), max_length=20, blank=True)
    
    # Release information
    release_date = models.DateTimeField(_('Release date'), auto_now_add=True)
    release_notes = models.TextField(_('Release notes'), blank=True)
    is_stable = models.BooleanField(_('Stable release'), default=False)
    is_current = models.BooleanField(_('Current version'), default=False)
    
    # Feature flags
    features_enabled = JSONField(_('Enabled features'), default=dict)
    features_disabled = JSONField(_('Disabled features'), default=dict)
    
    # Environment
    environment = models.CharField(
        _('Environment'),
        max_length=20,
        choices=[
            ('development', _('Development')),
            ('staging', _('Staging')),
            ('production', _('Production')),
        ],
        default='development'
    )
    
    class Meta:
        db_table = 'system_versions'
        verbose_name = _('System Version')
        verbose_name_plural = _('System Versions')
        ordering = ['-build_number']
        unique_together = ['version_number', 'environment']
    
    def __str__(self):
        return f"v{self.version_number} (Build {self.build_number}) - {self.environment}"
    
    def save(self, *args, **kwargs):
        """Ensure only one current version per environment"""
        if self.is_current:
            SystemVersion.objects.filter(
                environment=self.environment,
                is_current=True
            ).exclude(id=self.id).update(is_current=False)
        super().save(*args, **kwargs)


class FeatureSync(BaseModel):
    """
    Track frontend-backend feature synchronization
    """
    feature_name = models.CharField(_('Feature name'), max_length=100)
    feature_description = models.TextField(_('Description'), blank=True)
    
    # Frontend status
    frontend_implemented = models.BooleanField(_('Frontend implemented'), default=False)
    frontend_version = models.CharField(_('Frontend version'), max_length=20, blank=True)
    frontend_file_path = models.TextField(_('Frontend file path'), blank=True)
    
    # Backend status
    backend_implemented = models.BooleanField(_('Backend implemented'), default=False)
    backend_version = models.CharField(_('Backend version'), max_length=20, blank=True)
    backend_endpoint = models.CharField(_('Backend endpoint'), max_length=200, blank=True)
    backend_app = models.CharField(_('Backend app'), max_length=50, blank=True)
    
    # Sync status
    is_synchronized = models.BooleanField(_('Synchronized'), default=False)
    sync_issues = models.TextField(_('Sync issues'), blank=True)
    last_sync_check = models.DateTimeField(_('Last sync check'), auto_now=True)
    
    # Priority and status
    priority = models.CharField(
        _('Priority'),
        max_length=10,
        choices=[
            ('low', _('Low')),
            ('medium', _('Medium')),
            ('high', _('High')),
            ('critical', _('Critical')),
        ],
        default='medium'
    )
    
    status = models.CharField(
        _('Status'),
        max_length=20,
        choices=[
            ('planned', _('Planned')),
            ('in_progress', _('In Progress')),
            ('completed', _('Completed')),
            ('deprecated', _('Deprecated')),
            ('broken', _('Broken')),
        ],
        default='planned'
    )
    
    class Meta:
        db_table = 'feature_sync'
        verbose_name = _('Feature Sync')
        verbose_name_plural = _('Feature Sync')
        ordering = ['-priority', 'feature_name']
        unique_together = ['feature_name']
    
    def __str__(self):
        return f"{self.feature_name} - {self.status}"
    
    def check_sync_status(self):
        """Check if feature is properly synchronized"""
        self.is_synchronized = (
            self.frontend_implemented and 
            self.backend_implemented and 
            self.status == 'completed'
        )
        self.last_sync_check = timezone.now()
        self.save(update_fields=['is_synchronized', 'last_sync_check'])
        return self.is_synchronized


class APIEndpointTest(BaseModel):
    """
    Track API endpoint testing and health
    """
    endpoint_path = models.CharField(_('Endpoint path'), max_length=200)
    http_method = models.CharField(
        _('HTTP method'),
        max_length=10,
        choices=[
            ('GET', 'GET'),
            ('POST', 'POST'),
            ('PUT', 'PUT'),
            ('PATCH', 'PATCH'),
            ('DELETE', 'DELETE'),
        ]
    )
    
    # Test configuration
    requires_auth = models.BooleanField(_('Requires authentication'), default=True)
    test_payload = JSONField(_('Test payload'), default=dict)
    expected_status_code = models.PositiveIntegerField(_('Expected status'), default=200)
    expected_response_keys = ArrayField(
        models.CharField(max_length=50),
        default=list,
        help_text=_('Expected keys in response JSON')
    )
    
    # Test results
    last_test_date = models.DateTimeField(_('Last test date'), null=True, blank=True)
    last_test_status = models.CharField(
        _('Last test status'),
        max_length=20,
        choices=[
            ('passed', _('Passed')),
            ('failed', _('Failed')),
            ('error', _('Error')),
            ('not_tested', _('Not Tested')),
        ],
        default='not_tested'
    )
    last_response_time = models.FloatField(_('Response time (ms)'), null=True, blank=True)
    last_error_message = models.TextField(_('Last error'), blank=True)
    
    # Statistics
    total_tests = models.PositiveIntegerField(_('Total tests'), default=0)
    passed_tests = models.PositiveIntegerField(_('Passed tests'), default=0)
    failed_tests = models.PositiveIntegerField(_('Failed tests'), default=0)
    average_response_time = models.FloatField(_('Avg response time'), null=True, blank=True)
    
    # Health monitoring
    is_healthy = models.BooleanField(_('Healthy'), default=True)
    health_threshold_ms = models.FloatField(_('Health threshold (ms)'), default=1000.0)
    
    class Meta:
        db_table = 'api_endpoint_tests'
        verbose_name = _('API Endpoint Test')
        verbose_name_plural = _('API Endpoint Tests')
        ordering = ['endpoint_path', 'http_method']
        unique_together = ['endpoint_path', 'http_method']
    
    def __str__(self):
        return f"{self.http_method} {self.endpoint_path} - {self.last_test_status}"
    
    @property
    def success_rate(self):
        """Calculate success rate percentage"""
        if self.total_tests == 0:
            return 0.0
        return (self.passed_tests / self.total_tests) * 100
    
    def update_test_result(self, status, response_time, error_message=''):
        """Update test results after running a test"""
        self.last_test_date = timezone.now()
        self.last_test_status = status
        self.last_response_time = response_time
        self.last_error_message = error_message
        self.total_tests += 1
        
        if status == 'passed':
            self.passed_tests += 1
        else:
            self.failed_tests += 1
        
        # Update average response time
        if response_time and self.average_response_time:
            self.average_response_time = (
                (self.average_response_time * (self.total_tests - 1) + response_time) 
                / self.total_tests
            )
        elif response_time:
            self.average_response_time = response_time
        
        # Update health status
        self.is_healthy = (
            status == 'passed' and 
            (response_time or 0) <= self.health_threshold_ms
        )
        
        self.save()


class SystemHealthCheck(BaseModel):
    """
    Overall system health monitoring
    """
    check_id = models.UUIDField(_('Check ID'), default=uuid.uuid4, unique=True)
    
    # System components
    database_status = models.CharField(_('Database status'), max_length=20, default='unknown')
    cache_status = models.CharField(_('Cache status'), max_length=20, default='unknown')
    celery_status = models.CharField(_('Celery status'), max_length=20, default='unknown')
    api_status = models.CharField(_('API status'), max_length=20, default='unknown')
    
    # Performance metrics
    total_users = models.PositiveIntegerField(_('Total users'), default=0)
    active_users_24h = models.PositiveIntegerField(_('Active users (24h)'), default=0)
    total_medications = models.PositiveIntegerField(_('Total medications'), default=0)
    total_schedules_today = models.PositiveIntegerField(_('Schedules today'), default=0)
    
    # API metrics
    total_api_calls_24h = models.PositiveIntegerField(_('API calls (24h)'), default=0)
    failed_api_calls_24h = models.PositiveIntegerField(_('Failed API calls (24h)'), default=0)
    average_response_time = models.FloatField(_('Avg response time'), null=True, blank=True)
    
    # Overall health
    overall_status = models.CharField(
        _('Overall status'),
        max_length=20,
        choices=[
            ('healthy', _('Healthy')),
            ('warning', _('Warning')),
            ('critical', _('Critical')),
            ('unknown', _('Unknown')),
        ],
        default='unknown'
    )
    health_score = models.FloatField(_('Health score'), default=0.0)  # 0-100
    
    # Report data
    detailed_report = JSONField(_('Detailed report'), default=dict)
    recommendations = JSONField(_('Recommendations'), default=list)
    
    class Meta:
        db_table = 'system_health_checks'
        verbose_name = _('System Health Check')
        verbose_name_plural = _('System Health Checks')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Health Check {self.created_at.strftime('%Y-%m-%d %H:%M')} - {self.overall_status}"
    
    def calculate_health_score(self):
        """Calculate overall health score"""
        scores = []
        
        # Component scores
        component_scores = {
            'healthy': 100,
            'warning': 60,
            'critical': 20,
            'unknown': 0,
        }
        
        scores.extend([
            component_scores.get(self.database_status, 0),
            component_scores.get(self.cache_status, 0),
            component_scores.get(self.celery_status, 0),
            component_scores.get(self.api_status, 0),
        ])
        
        # API success rate
        if self.total_api_calls_24h > 0:
            api_success_rate = ((self.total_api_calls_24h - self.failed_api_calls_24h) / self.total_api_calls_24h) * 100
            scores.append(api_success_rate)
        
        # Calculate average
        if scores:
            self.health_score = sum(scores) / len(scores)
        else:
            self.health_score = 0.0
        
        # Determine overall status
        if self.health_score >= 90:
            self.overall_status = 'healthy'
        elif self.health_score >= 70:
            self.overall_status = 'warning'
        elif self.health_score >= 30:
            self.overall_status = 'critical'
        else:
            self.overall_status = 'unknown'
        
        self.save(update_fields=['health_score', 'overall_status'])
