"""
Monitoring models SQLite version - System health, version tracking and feature sync
Compatible con SQLite para testing
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.core.models import BaseModel
from .sqlite_fields import SQLiteJSONField, SQLiteArrayField
import uuid


class SystemVersion(BaseModel):
    """
    Track system versions and releases
    """
    version_number = models.CharField(
        _('Version number'), 
        max_length=50, 
        unique=True,
        help_text=_('Semantic version (e.g., 1.0.0)')
    )
    
    release_date = models.DateTimeField(
        _('Release date'), 
        default=timezone.now
    )
    
    is_current = models.BooleanField(
        _('Is current version'), 
        default=False,
        help_text=_('Only one version can be current at a time')
    )
    
    features_enabled = SQLiteJSONField(_('Enabled features'), default=dict)
    features_disabled = SQLiteJSONField(_('Disabled features'), default=dict)
    
    release_notes = models.TextField(
        _('Release notes'), 
        blank=True,
        help_text=_('What changed in this version')
    )
    
    class Meta:
        verbose_name = _('System Version')
        verbose_name_plural = _('System Versions')
        ordering = ['-release_date']
        db_table = 'monitoring_system_version'
    
    def __str__(self):
        return f'v{self.version_number} {"(current)" if self.is_current else ""}'
    
    def save(self, *args, **kwargs):
        # Ensure only one current version
        if self.is_current:
            SystemVersion.objects.filter(is_current=True).update(is_current=False)
        super().save(*args, **kwargs)


class FeatureSync(BaseModel):
    """
    Track feature synchronization between frontend and backend
    """
    SYNC_TYPES = [
        ('full', _('Full sync')),
        ('incremental', _('Incremental sync')),
        ('validation', _('Validation only')),
    ]
    
    SYNC_STATUS = [
        ('pending', _('Pending')),
        ('running', _('Running')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
    ]
    
    sync_id = models.UUIDField(
        _('Sync ID'), 
        default=uuid.uuid4, 
        unique=True,
        help_text=_('Unique identifier for this sync operation')
    )
    
    sync_type = models.CharField(
        _('Sync type'), 
        max_length=20, 
        choices=SYNC_TYPES, 
        default='full'
    )
    
    status = models.CharField(
        _('Status'), 
        max_length=20, 
        choices=SYNC_STATUS, 
        default='pending'
    )
    
    started_at = models.DateTimeField(_('Started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('Completed at'), null=True, blank=True)
    
    # Results and metadata
    features_found = SQLiteJSONField(_('Features found'), default=dict)
    sync_results = SQLiteJSONField(_('Sync results'), default=dict)
    errors = SQLiteJSONField(_('Errors'), default=list)
    
    total_features = models.PositiveIntegerField(_('Total features'), default=0)
    synced_features = models.PositiveIntegerField(_('Synced features'), default=0)
    failed_features = models.PositiveIntegerField(_('Failed features'), default=0)
    
    class Meta:
        verbose_name = _('Feature Sync')
        verbose_name_plural = _('Feature Syncs')
        ordering = ['-created_at']
        db_table = 'monitoring_feature_sync'
    
    def __str__(self):
        return f'Sync {self.sync_id.hex[:8]} ({self.status})'
    
    @property
    def duration(self):
        """Calculate sync duration"""
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None
    
    @property
    def success_rate(self):
        """Calculate success rate percentage"""
        if self.total_features == 0:
            return 0
        return (self.synced_features / self.total_features) * 100


class APIEndpointTest(BaseModel):
    """
    Test API endpoints and track their health
    """
    TEST_METHODS = [
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH'),
        ('DELETE', 'DELETE'),
    ]
    
    TEST_STATUS = [
        ('pending', _('Pending')),
        ('running', _('Running')),
        ('passed', _('Passed')),
        ('failed', _('Failed')),
        ('skipped', _('Skipped')),
    ]
    
    test_id = models.UUIDField(
        _('Test ID'), 
        default=uuid.uuid4, 
        unique=True
    )
    
    endpoint_url = models.CharField(
        _('Endpoint URL'), 
        max_length=500,
        help_text=_('Full URL of the endpoint to test')
    )
    
    http_method = models.CharField(
        _('HTTP Method'), 
        max_length=10, 
        choices=TEST_METHODS, 
        default='GET'
    )
    
    test_payload = SQLiteJSONField(_('Test payload'), default=dict)
    
    expected_status_code = models.PositiveIntegerField(_('Expected status code'), default=200)
    expected_response_keys = SQLiteArrayField(
        models.CharField(max_length=100),
        _('Expected response keys'),
        default=list,
        help_text=_('Keys that should be present in response')
    )
    
    # Test execution
    status = models.CharField(
        _('Status'), 
        max_length=20, 
        choices=TEST_STATUS, 
        default='pending'
    )
    
    executed_at = models.DateTimeField(_('Executed at'), null=True, blank=True)
    
    # Results
    actual_status_code = models.PositiveIntegerField(_('Actual status code'), null=True, blank=True)
    response_time_ms = models.PositiveIntegerField(_('Response time (ms)'), null=True, blank=True)
    response_data = SQLiteJSONField(_('Response data'), default=dict)
    error_message = models.TextField(_('Error message'), blank=True)
    
    class Meta:
        verbose_name = _('API Endpoint Test')
        verbose_name_plural = _('API Endpoint Tests')
        ordering = ['-executed_at']
        db_table = 'monitoring_api_endpoint_test'
    
    def __str__(self):
        return f'{self.http_method} {self.endpoint_url} ({self.status})'
    
    @property
    def is_successful(self):
        """Check if test was successful"""
        return (
            self.status == 'passed' and
            self.actual_status_code == self.expected_status_code
        )


class SystemHealthCheck(BaseModel):
    """
    System health monitoring and reporting
    """
    HEALTH_STATUS = [
        ('healthy', _('Healthy')),
        ('warning', _('Warning')),
        ('critical', _('Critical')),
        ('unknown', _('Unknown')),
    ]
    
    check_id = models.UUIDField(
        _('Check ID'), 
        default=uuid.uuid4, 
        unique=True
    )
    
    status = models.CharField(
        _('Health Status'), 
        max_length=20, 
        choices=HEALTH_STATUS, 
        default='unknown'
    )
    
    checked_at = models.DateTimeField(_('Checked at'), default=timezone.now)
    
    # System metrics
    database_status = models.BooleanField(_('Database OK'), default=False)
    cache_status = models.BooleanField(_('Cache OK'), default=False)
    disk_usage_percent = models.FloatField(_('Disk usage %'), null=True, blank=True)
    memory_usage_percent = models.FloatField(_('Memory usage %'), null=True, blank=True)
    cpu_usage_percent = models.FloatField(_('CPU usage %'), null=True, blank=True)
    
    # Detailed report
    detailed_report = SQLiteJSONField(_('Detailed report'), default=dict)
    recommendations = SQLiteJSONField(_('Recommendations'), default=list)
    
    class Meta:
        verbose_name = _('System Health Check')
        verbose_name_plural = _('System Health Checks')
        ordering = ['-checked_at']
        db_table = 'monitoring_system_health_check'
    
    def __str__(self):
        return f'Health Check {self.checked_at.strftime("%Y-%m-%d %H:%M")} ({self.status})'
    
    @property
    def overall_score(self):
        """Calculate overall system health score (0-100)"""
        scores = []
        
        # Database and cache (essential)
        if self.database_status:
            scores.append(100)
        else:
            scores.append(0)
            
        if self.cache_status:
            scores.append(100)
        else:
            scores.append(50)  # Less critical than database
        
        # System resources
        if self.cpu_usage_percent is not None:
            cpu_score = max(0, 100 - self.cpu_usage_percent)
            scores.append(cpu_score)
        
        if self.memory_usage_percent is not None:
            memory_score = max(0, 100 - self.memory_usage_percent)
            scores.append(memory_score)
        
        if self.disk_usage_percent is not None:
            disk_score = max(0, 100 - self.disk_usage_percent)
            scores.append(disk_score)
        
        return sum(scores) / len(scores) if scores else 0
