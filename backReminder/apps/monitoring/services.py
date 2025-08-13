"""
Feature mapping service - Centralizes frontend-backend feature sync
"""
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from django.conf import settings
from django.utils import timezone
from .models import FeatureSync, SystemVersion, APIEndpointTest


class FeatureSyncService:
    """
    Service to manage feature synchronization between frontend and backend
    """
    
    # Define all features that should be synchronized
    FEATURE_MAPPING = {
        'user_authentication': {
            'description': 'User login, register, logout functionality',
            'frontend': {
                'files': [
                    'MedicationReminderRN/src/services/StorageService.ts',
                    'MedicationReminderRN/src/App.tsx'
                ],
                'components': ['Login', 'Register', 'AuthContext']
            },
            'backend': {
                'app': 'authentication',
                'endpoints': [
                    'POST /api/auth/login/',
                    'POST /api/auth/register/',
                    'POST /api/auth/logout/',
                    'GET /api/auth/verify/',
                ]
            },
            'priority': 'critical'
        },
        
        'medication_management': {
            'description': 'CRUD operations for medications',
            'frontend': {
                'files': [
                    'MedicationReminderRN/src/screens/AddMedicationScreen.tsx',
                    'MedicationReminderRN/src/hooks/useMedications.ts',
                    'MedicationReminderRN/src/services/StorageService.ts'
                ],
                'components': ['AddMedicationScreen', 'MedicationList']
            },
            'backend': {
                'app': 'medications',
                'endpoints': [
                    'GET /api/medications/',
                    'POST /api/medications/',
                    'PUT /api/medications/{id}/',
                    'DELETE /api/medications/{id}/',
                ]
            },
            'priority': 'critical'
        },
        
        'daily_schedules': {
            'description': 'Daily medication schedules and progress tracking',
            'frontend': {
                'files': [
                    'MedicationReminderRN/src/screens/TodayScreen.tsx',
                    'MedicationReminderRN/src/services/StorageService.ts'
                ],
                'components': ['TodayScreen', 'ScheduleCard']
            },
            'backend': {
                'app': 'schedules',
                'endpoints': [
                    'GET /api/schedules/today/',
                    'POST /api/schedules/mark_taken/',
                    'GET /api/schedules/progress/',
                ]
            },
            'priority': 'critical'
        },
        
        'push_notifications': {
            'description': 'Push notification system for medication reminders',
            'frontend': {
                'files': [
                    'MedicationReminderRN/src/services/NotificationService.ts'
                ],
                'components': ['NotificationService', 'PushNotification']
            },
            'backend': {
                'app': 'notifications',
                'endpoints': [
                    'GET /api/notifications/',
                    'POST /api/notifications/mark_read/',
                    'PUT /api/notifications/settings/',
                ]
            },
            'priority': 'high'
        },
        
        'user_profile': {
            'description': 'User profile management and preferences',
            'frontend': {
                'files': [],
                'components': ['ProfileScreen', 'UserSettings']
            },
            'backend': {
                'app': 'users',
                'endpoints': [
                    'GET /api/users/me/',
                    'PUT /api/users/update_me/',
                    'GET /api/users/profile/',
                    'PUT /api/users/update_profile/',
                ]
            },
            'priority': 'medium'
        },
        
        'analytics_reports': {
            'description': 'Analytics and progress reports',
            'frontend': {
                'files': [],
                'components': ['AnalyticsScreen', 'ProgressChart']
            },
            'backend': {
                'app': 'analytics',
                'endpoints': [
                    'GET /api/analytics/stats/',
                    'GET /api/analytics/adherence/',
                    'GET /api/analytics/progress/',
                ]
            },
            'priority': 'medium'
        },
        
        'offline_sync': {
            'description': 'Offline data synchronization',
            'frontend': {
                'files': [
                    'MedicationReminderRN/src/services/StorageService.ts'
                ],
                'components': ['SyncService', 'OfflineIndicator']
            },
            'backend': {
                'app': 'core',
                'endpoints': [
                    'POST /api/sync/upload/',
                    'GET /api/sync/download/',
                ]
            },
            'priority': 'low'
        }
    }
    
    @classmethod
    def get_frontend_project_path(cls) -> str:
        """Get the path to the frontend project"""
        backend_path = os.path.dirname(settings.BASE_DIR)
        return os.path.join(backend_path, 'MedicationReminderRN')
    
    @classmethod
    def check_frontend_file_exists(cls, file_path: str) -> bool:
        """Check if a frontend file exists"""
        frontend_path = cls.get_frontend_project_path()
        full_path = os.path.join(frontend_path, file_path.replace('MedicationReminderRN/', ''))
        return os.path.exists(full_path)
    
    @classmethod
    def check_backend_endpoint_exists(cls, endpoint: str) -> bool:
        """Check if a backend endpoint exists (simplified)"""
        # This would need more sophisticated URL pattern checking
        # For now, we'll assume endpoints exist if the app exists
        try:
            method, path = endpoint.split(' ', 1)
            app_name = path.split('/')[2]  # /api/app_name/...
            
            # Check if app is in INSTALLED_APPS
            from django.conf import settings
            installed_apps = [app for app in settings.INSTALLED_APPS if app.startswith('apps.')]
            app_full_name = f'apps.{app_name}'
            
            return app_full_name in installed_apps
        except:
            return False
    
    @classmethod
    def sync_all_features(cls) -> Dict[str, Any]:
        """Synchronize all features and return status report"""
        report = {
            'timestamp': timezone.now(),
            'total_features': len(cls.FEATURE_MAPPING),
            'synchronized': 0,
            'unsynchronized': 0,
            'issues': [],
            'details': {}
        }
        
        for feature_name, feature_config in cls.FEATURE_MAPPING.items():
            sync_status = cls.check_feature_sync(feature_name, feature_config)
            
            # Update or create FeatureSync record
            feature_sync, created = FeatureSync.objects.get_or_create(
                feature_name=feature_name,
                defaults={
                    'feature_description': feature_config['description'],
                    'priority': feature_config['priority'],
                }
            )
            
            # Update sync status
            feature_sync.frontend_implemented = sync_status['frontend_implemented']
            feature_sync.backend_implemented = sync_status['backend_implemented']
            feature_sync.is_synchronized = sync_status['is_synchronized']
            feature_sync.sync_issues = '\n'.join(sync_status['issues'])
            feature_sync.backend_app = feature_config['backend']['app']
            feature_sync.backend_endpoint = ', '.join(feature_config['backend']['endpoints'])
            feature_sync.frontend_file_path = ', '.join(feature_config['frontend']['files'])
            
            if sync_status['is_synchronized']:
                feature_sync.status = 'completed'
                report['synchronized'] += 1
            else:
                feature_sync.status = 'broken' if sync_status['issues'] else 'in_progress'
                report['unsynchronized'] += 1
                if sync_status['issues']:
                    report['issues'].extend(sync_status['issues'])
            
            feature_sync.save()
            report['details'][feature_name] = sync_status
        
        return report
    
    @classmethod
    def check_feature_sync(cls, feature_name: str, feature_config: Dict) -> Dict[str, Any]:
        """Check synchronization status of a single feature"""
        issues = []
        
        # Check frontend implementation
        frontend_files_exist = []
        for file_path in feature_config['frontend']['files']:
            exists = cls.check_frontend_file_exists(file_path)
            frontend_files_exist.append(exists)
            if not exists:
                issues.append(f"Frontend file missing: {file_path}")
        
        frontend_implemented = len(frontend_files_exist) > 0 and all(frontend_files_exist)
        
        # Check backend implementation
        backend_endpoints_exist = []
        for endpoint in feature_config['backend']['endpoints']:
            exists = cls.check_backend_endpoint_exists(endpoint)
            backend_endpoints_exist.append(exists)
            if not exists:
                issues.append(f"Backend endpoint missing: {endpoint}")
        
        backend_implemented = len(backend_endpoints_exist) > 0 and all(backend_endpoints_exist)
        
        return {
            'feature_name': feature_name,
            'frontend_implemented': frontend_implemented,
            'backend_implemented': backend_implemented,
            'is_synchronized': frontend_implemented and backend_implemented,
            'issues': issues,
            'frontend_files_checked': len(frontend_files_exist),
            'backend_endpoints_checked': len(backend_endpoints_exist),
        }
    
    @classmethod
    def get_sync_report(cls) -> Dict[str, Any]:
        """Generate comprehensive sync report"""
        features = FeatureSync.objects.all().order_by('-priority', 'feature_name')
        
        report = {
            'generated_at': timezone.now(),
            'summary': {
                'total_features': features.count(),
                'synchronized': features.filter(is_synchronized=True).count(),
                'unsynchronized': features.filter(is_synchronized=False).count(),
                'critical_issues': features.filter(priority='critical', is_synchronized=False).count(),
            },
            'features': []
        }
        
        for feature in features:
            report['features'].append({
                'name': feature.feature_name,
                'description': feature.feature_description,
                'priority': feature.priority,
                'status': feature.status,
                'frontend_implemented': feature.frontend_implemented,
                'backend_implemented': feature.backend_implemented,
                'is_synchronized': feature.is_synchronized,
                'issues': feature.sync_issues.split('\n') if feature.sync_issues else [],
                'last_check': feature.last_sync_check,
            })
        
        return report
    
    @classmethod
    def generate_version_report(cls) -> Dict[str, Any]:
        """Generate version and build report"""
        from django.conf import settings
        import sys
        import django
        
        # Get current version
        current_version = SystemVersion.objects.filter(
            is_current=True,
            environment=getattr(settings, 'ENVIRONMENT', 'development')
        ).first()
        
        # Get package.json info from frontend
        frontend_version = cls.get_frontend_version()
        
        # System information
        system_info = {
            'python_version': sys.version,
            'django_version': django.get_version(),
            'environment': getattr(settings, 'ENVIRONMENT', 'development'),
            'debug_mode': settings.DEBUG,
            'database': settings.DATABASES['default']['ENGINE'],
            'timezone': settings.TIME_ZONE,
        }
        
        # Feature sync summary
        sync_summary = cls.get_sync_report()['summary']
        
        report = {
            'generated_at': timezone.now(),
            'current_version': {
                'version_number': current_version.version_number if current_version else 'Unknown',
                'build_number': current_version.build_number if current_version else 0,
                'backend_version': current_version.backend_version if current_version else '1.0.0',
                'frontend_version': frontend_version,
                'release_date': current_version.release_date if current_version else None,
            },
            'system_info': system_info,
            'feature_sync': sync_summary,
            'last_versions': list(
                SystemVersion.objects.all()[:5].values(
                    'version_number', 'build_number', 'release_date', 'environment'
                )
            ),
        }
        
        return report
    
    @classmethod
    def get_frontend_version(cls) -> str:
        """Get frontend version from package.json"""
        try:
            frontend_path = cls.get_frontend_project_path()
            package_json_path = os.path.join(frontend_path, 'package.json')
            
            if os.path.exists(package_json_path):
                with open(package_json_path, 'r', encoding='utf-8') as f:
                    package_data = json.load(f)
                    return package_data.get('version', 'Unknown')
        except Exception as e:
            print(f"Error reading frontend version: {e}")
        
        return 'Unknown'
    
    @classmethod
    def create_new_version(cls, version_number: str, release_notes: str = '') -> SystemVersion:
        """Create new system version"""
        # Get next build number
        last_version = SystemVersion.objects.order_by('-build_number').first()
        next_build = (last_version.build_number + 1) if last_version else 1
        
        # Create new version
        version = SystemVersion.objects.create(
            version_number=version_number,
            build_number=next_build,
            backend_version=version_number,
            frontend_version=cls.get_frontend_version(),
            release_notes=release_notes,
            environment=getattr(settings, 'ENVIRONMENT', 'development'),
            is_current=True,
        )
        
        return version
