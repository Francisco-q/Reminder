"""
Django management command for monitoring and reporting
"""
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from apps.monitoring.services import FeatureSyncService
from apps.monitoring.test_service import APITestService, SystemHealthService
from apps.monitoring.models import SystemVersion
import json
import os


class Command(BaseCommand):
    help = 'Medication Reminder Monitoring and Reporting Tool'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=[
                'sync-features', 'run-tests', 'health-check', 
                'version-report', 'create-version', 'dashboard',
                'setup-tests', 'export-report'
            ],
            help='Action to perform'
        )
        
        parser.add_argument(
            '--version-num',
            type=str,
            help='Version number for create-version action'
        )
        
        parser.add_argument(
            '--notes',
            type=str,
            help='Release notes for create-version action',
            default=''
        )
        
        parser.add_argument(
            '--output',
            type=str,
            help='Output file for reports',
        )
        
        parser.add_argument(
            '--format',
            choices=['json', 'text', 'csv'],
            default='text',
            help='Output format'
        )

    def handle(self, *args, **options):
        action = options['action']
        
        self.stdout.write(
            self.style.SUCCESS(f'🏥 Medication Reminder Monitoring Tool')
        )
        self.stdout.write(f'Action: {action}')
        self.stdout.write('─' * 50)
        
        try:
            if action == 'sync-features':
                return self.sync_features(options)
            elif action == 'run-tests':
                return self.run_tests(options)
            elif action == 'health-check':
                return self.health_check(options)
            elif action == 'version-report':
                return self.version_report(options)
            elif action == 'create-version':
                return self.create_version(options)
            elif action == 'dashboard':
                return self.dashboard(options)
            elif action == 'setup-tests':
                return self.setup_tests(options)
            elif action == 'export-report':
                return self.export_report(options)
                
        except Exception as e:
            raise CommandError(f'Error executing {action}: {str(e)}')

    def sync_features(self, options):
        """Synchronize frontend-backend features"""
        self.stdout.write('🔄 Synchronizing features...')
        
        report = FeatureSyncService.sync_all_features()
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Sync completed: {report["synchronized"]}/{report["total_features"]} synchronized')
        )
        
        if report['issues']:
            self.stdout.write(
                self.style.WARNING(f'⚠️  Found {len(report["issues"])} issues:')
            )
            for issue in report['issues'][:10]:  # Show first 10 issues
                self.stdout.write(f'   - {issue}')
        
        if options['output']:
            self.save_report(report, options['output'], options['format'])

    def run_tests(self, options):
        """Run API endpoint tests"""
        self.stdout.write('🧪 Running API tests...')
        
        test_service = APITestService()
        results = test_service.run_all_tests()
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Tests completed in {results["total_time"]:.2f}ms')
        )
        self.stdout.write(f'   Passed: {results["passed"]}')
        self.stdout.write(f'   Failed: {results["failed"]}')
        self.stdout.write(f'   Errors: {results["errors"]}')
        
        if results['failed'] > 0 or results['errors'] > 0:
            self.stdout.write(self.style.WARNING('⚠️  Some tests failed:'))
            for result in results['results']:
                if result['status'] != 'passed':
                    self.stdout.write(f'   ❌ {result["method"]} {result["endpoint"]} - {result["status"]}')
                    if result.get('error'):
                        self.stdout.write(f'      Error: {result["error"]}')
        
        if options['output']:
            self.save_report(results, options['output'], options['format'])

    def health_check(self, options):
        """Perform system health check"""
        self.stdout.write('🏥 Performing health check...')
        
        health_check = SystemHealthService.perform_health_check()
        
        # Display results with colored status
        status_styles = {
            'healthy': self.style.SUCCESS,
            'warning': self.style.WARNING,
            'critical': self.style.ERROR,
            'unknown': self.style.NOTICE,
        }
        
        style = status_styles.get(health_check.overall_status, self.style.NOTICE)
        
        self.stdout.write(
            style(f'Overall Status: {health_check.overall_status.upper()} (Score: {health_check.health_score:.1f}/100)')
        )
        
        self.stdout.write('\nComponent Status:')
        self.stdout.write(f'   Database: {health_check.database_status}')
        self.stdout.write(f'   Cache: {health_check.cache_status}')
        self.stdout.write(f'   Celery: {health_check.celery_status}')
        self.stdout.write(f'   API: {health_check.api_status}')
        
        self.stdout.write('\nSystem Metrics:')
        self.stdout.write(f'   Total Users: {health_check.total_users}')
        self.stdout.write(f'   Active Users (24h): {health_check.active_users_24h}')
        self.stdout.write(f'   Total Medications: {health_check.total_medications}')
        self.stdout.write(f'   Schedules Today: {health_check.total_schedules_today}')
        
        if options['output']:
            report = {
                'check_id': str(health_check.check_id),
                'timestamp': health_check.created_at.isoformat(),
                'overall_status': health_check.overall_status,
                'health_score': health_check.health_score,
                'components': {
                    'database': health_check.database_status,
                    'cache': health_check.cache_status,
                    'celery': health_check.celery_status,
                    'api': health_check.api_status,
                },
                'metrics': {
                    'total_users': health_check.total_users,
                    'active_users_24h': health_check.active_users_24h,
                    'total_medications': health_check.total_medications,
                    'schedules_today': health_check.total_schedules_today,
                }
            }
            self.save_report(report, options['output'], options['format'])

    def version_report(self, options):
        """Generate version report"""
        self.stdout.write('📊 Generating version report...')
        
        report = FeatureSyncService.generate_version_report()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Version Report Generated')
        )
        
        current_version = report['current_version']
        self.stdout.write('\nCurrent Version:')
        self.stdout.write(f'   Version: {current_version["version_number"]}')
        self.stdout.write(f'   Build: {current_version["build_number"]}')
        self.stdout.write(f'   Backend: {current_version["backend_version"]}')
        self.stdout.write(f'   Frontend: {current_version["frontend_version"]}')
        
        system_info = report['system_info']
        self.stdout.write('\nSystem Information:')
        self.stdout.write(f'   Python: {system_info["python_version"].split()[0]}')
        self.stdout.write(f'   Django: {system_info["django_version"]}')
        self.stdout.write(f'   Environment: {system_info["environment"]}')
        self.stdout.write(f'   Debug Mode: {system_info["debug_mode"]}')
        
        feature_sync = report['feature_sync']
        self.stdout.write('\nFeature Sync Status:')
        self.stdout.write(f'   Total Features: {feature_sync["total_features"]}')
        self.stdout.write(f'   Synchronized: {feature_sync["synchronized"]}')
        self.stdout.write(f'   Issues: {feature_sync["unsynchronized"]}')
        
        if options['output']:
            self.save_report(report, options['output'], options['format'])

    def create_version(self, options):
        """Create new system version"""
        version_number = options['version_num']
        if not version_number:
            raise CommandError('--version is required for create-version action')
        
        self.stdout.write(f'📦 Creating new version: {version_number}')
        
        version = FeatureSyncService.create_new_version(
            version_number,
            options['notes']
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Version {version.version_number} created successfully!')
        )
        self.stdout.write(f'   Build Number: {version.build_number}')
        self.stdout.write(f'   Release Date: {version.release_date}')
        self.stdout.write(f'   Environment: {version.environment}')

    def dashboard(self, options):
        """Show monitoring dashboard"""
        self.stdout.write('📊 Monitoring Dashboard')
        self.stdout.write('═' * 50)
        
        # Get latest data
        from apps.monitoring.models import SystemHealthCheck, FeatureSync, APIEndpointTest
        
        # Health status
        latest_health = SystemHealthCheck.objects.first()
        if latest_health:
            status_icon = {
                'healthy': '✅',
                'warning': '⚠️ ',
                'critical': '❌',
                'unknown': '❓'
            }.get(latest_health.overall_status, '❓')
            
            self.stdout.write(f'{status_icon} System Health: {latest_health.overall_status.upper()} ({latest_health.health_score:.1f}/100)')
        else:
            self.stdout.write('❓ System Health: No recent checks')
        
        # Feature sync status
        total_features = FeatureSync.objects.count()
        synchronized = FeatureSync.objects.filter(is_synchronized=True).count()
        self.stdout.write(f'🔄 Feature Sync: {synchronized}/{total_features} synchronized')
        
        # API tests status
        total_tests = APIEndpointTest.objects.count()
        healthy_apis = APIEndpointTest.objects.filter(is_healthy=True).count()
        self.stdout.write(f'🧪 API Health: {healthy_apis}/{total_tests} healthy endpoints')
        
        # Current version
        current_version = SystemVersion.objects.filter(is_current=True).first()
        if current_version:
            self.stdout.write(f'📦 Version: {current_version.version_number} (Build {current_version.build_number})')
        
        self.stdout.write('═' * 50)
        self.stdout.write('💡 Run with specific actions for detailed reports:')
        self.stdout.write('   python manage.py monitor sync-features')
        self.stdout.write('   python manage.py monitor run-tests')
        self.stdout.write('   python manage.py monitor health-check')

    def setup_tests(self, options):
        """Setup default API tests"""
        self.stdout.write('⚙️  Setting up default API tests...')
        
        test_service = APITestService()
        test_service.setup_default_tests()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Default API tests setup completed')
        )

    def export_report(self, options):
        """Export comprehensive report"""
        if not options['output']:
            raise CommandError('--output is required for export-report action')
        
        self.stdout.write('📤 Exporting comprehensive report...')
        
        # Generate comprehensive report
        report = {
            'generated_at': timezone.now().isoformat(),
            'version_report': FeatureSyncService.generate_version_report(),
            'feature_sync': FeatureSyncService.get_sync_report(),
        }
        
        # Add health check if available
        from apps.monitoring.models import SystemHealthCheck
        latest_health = SystemHealthCheck.objects.first()
        if latest_health:
            report['health_check'] = {
                'overall_status': latest_health.overall_status,
                'health_score': latest_health.health_score,
                'components': {
                    'database': latest_health.database_status,
                    'cache': latest_health.cache_status,
                    'api': latest_health.api_status,
                }
            }
        
        self.save_report(report, options['output'], options['format'])
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Report exported to {options["output"]}')
        )

    def save_report(self, data, output_file, format_type):
        """Save report to file"""
        try:
            if format_type == 'json':
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, default=str)
            elif format_type == 'text':
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(f"Medication Reminder Monitoring Report\n")
                    f.write(f"Generated: {timezone.now()}\n")
                    f.write("=" * 50 + "\n\n")
                    f.write(json.dumps(data, indent=2, default=str))
            
            self.stdout.write(
                self.style.SUCCESS(f'📁 Report saved to: {output_file}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error saving report: {str(e)}')
            )
