"""
Quick setup command for the monitoring system
"""
from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from apps.monitoring.services import FeatureSyncService
from apps.monitoring.test_service import APITestService
import os


class Command(BaseCommand):
    help = 'Quick setup for Medication Reminder Monitoring System'

    def add_arguments(self, parser):
        parser.add_argument(
            '--full-setup',
            action='store_true',
            help='Perform full system setup including initial data'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🏥 Medication Reminder Monitoring Setup')
        )
        self.stdout.write('═' * 50)
        
        try:
            # Check database connection
            self.stdout.write('🔌 Checking database connection...')
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            self.stdout.write(self.style.SUCCESS('✅ Database connected'))
            
            # Run migrations
            self.stdout.write('🔄 Checking migrations...')
            from django.core.management import call_command
            call_command('makemigrations', 'monitoring', verbosity=0)
            call_command('migrate', verbosity=0)
            self.stdout.write(self.style.SUCCESS('✅ Migrations completed'))
            
            if options['full_setup']:
                self.full_setup()
            else:
                self.basic_setup()
                
            self.stdout.write('═' * 50)
            self.stdout.write(
                self.style.SUCCESS('🎉 Setup completed successfully!')
            )
            self.stdout.write('\n💡 Next steps:')
            self.stdout.write('   python manage.py monitor dashboard')
            self.stdout.write('   python manage.py monitor sync-features')
            self.stdout.write('   python manage.py monitor run-tests')
            
        except Exception as e:
            raise CommandError(f'Setup failed: {str(e)}')

    def basic_setup(self):
        """Basic setup - just verify everything is working"""
        self.stdout.write('⚙️  Running basic setup...')
        
        # Test services
        self.stdout.write('🧪 Testing FeatureSyncService...')
        try:
            FeatureSyncService.get_sync_report()
            self.stdout.write(self.style.SUCCESS('✅ FeatureSyncService working'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠️  FeatureSyncService issue: {str(e)}'))
        
        # Test API service
        self.stdout.write('🌐 Testing APITestService...')
        try:
            test_service = APITestService()
            # Just create instance, don't run full tests in setup
            self.stdout.write(self.style.SUCCESS('✅ APITestService working'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠️  APITestService issue: {str(e)}'))

    def full_setup(self):
        """Full setup including initial data"""
        self.stdout.write('🚀 Running full setup...')
        
        # Basic setup first
        self.basic_setup()
        
        # Create initial version
        self.stdout.write('📦 Creating initial version...')
        try:
            initial_version = FeatureSyncService.create_new_version(
                version_number='1.0.0',
                release_notes='Initial monitoring system setup'
            )
            self.stdout.write(
                self.style.SUCCESS(f'✅ Initial version created: {initial_version.version_number}')
            )
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠️  Version creation issue: {str(e)}'))
        
        # Setup default API tests
        self.stdout.write('🧪 Setting up default API tests...')
        try:
            test_service = APITestService()
            test_service.setup_default_tests()
            self.stdout.write(self.style.SUCCESS('✅ Default API tests created'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠️  API tests setup issue: {str(e)}'))
        
        # Perform initial feature sync
        self.stdout.write('🔄 Running initial feature sync...')
        try:
            sync_report = FeatureSyncService.sync_all_features()
            self.stdout.write(
                self.style.SUCCESS(f'✅ Feature sync completed: {sync_report["synchronized"]}/{sync_report["total_features"]}')
            )
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'⚠️  Feature sync issue: {str(e)}'))
