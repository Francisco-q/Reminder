"""
Celery tasks for automated monitoring
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

from .services import FeatureSyncService
from .test_service import APITestService, SystemHealthService

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def sync_features_task(self):
    """
    Automated feature synchronization check
    """
    try:
        logger.info("Starting automated feature sync check")
        report = FeatureSyncService.sync_all_features()
        
        logger.info(f"Feature sync completed: {report['synchronized']}/{report['total_features']} synchronized")
        
        if report['issues']:
            logger.warning(f"Feature sync issues found: {len(report['issues'])} issues")
            for issue in report['issues'][:5]:  # Log first 5 issues
                logger.warning(f"- {issue}")
        
        return {
            'status': 'success',
            'synchronized': report['synchronized'],
            'total': report['total_features'],
            'issues_count': len(report['issues'])
        }
        
    except Exception as exc:
        logger.error(f"Feature sync task failed: {exc}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)


@shared_task(bind=True)
def run_api_tests_task(self):
    """
    Automated API endpoint testing
    """
    try:
        logger.info("Starting automated API tests")
        test_service = APITestService()
        results = test_service.run_all_tests()
        
        logger.info(f"API tests completed: {results['passed']}/{results['total_tests']} passed")
        
        if results['failed'] > 0 or results['errors'] > 0:
            logger.warning(f"API test failures: {results['failed']} failed, {results['errors']} errors")
        
        return {
            'status': 'success',
            'total_tests': results['total_tests'],
            'passed': results['passed'],
            'failed': results['failed'],
            'errors': results['errors'],
            'total_time': results['total_time']
        }
        
    except Exception as exc:
        logger.error(f"API tests task failed: {exc}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)


@shared_task(bind=True)
def system_health_check_task(self):
    """
    Automated system health check
    """
    try:
        logger.info("Starting system health check")
        health_check = SystemHealthService.perform_health_check()
        
        logger.info(f"Health check completed: {health_check.overall_status} (Score: {health_check.health_score})")
        
        if health_check.overall_status in ['warning', 'critical']:
            logger.warning(f"System health issue detected: {health_check.overall_status}")
            logger.warning(f"Database: {health_check.database_status}, Cache: {health_check.cache_status}")
        
        return {
            'status': 'success',
            'check_id': str(health_check.check_id),
            'overall_status': health_check.overall_status,
            'health_score': health_check.health_score
        }
        
    except Exception as exc:
        logger.error(f"Health check task failed: {exc}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)


@shared_task
def cleanup_old_health_checks():
    """
    Clean up old health check records
    """
    try:
        cutoff_date = timezone.now() - timedelta(days=30)
        
        from .models import SystemHealthCheck
        deleted_count = SystemHealthCheck.objects.filter(
            created_at__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Cleaned up {deleted_count} old health check records")
        
        return {
            'status': 'success',
            'deleted_count': deleted_count
        }
        
    except Exception as exc:
        logger.error(f"Cleanup task failed: {exc}")
        return {
            'status': 'error',
            'error': str(exc)
        }


@shared_task
def generate_daily_report():
    """
    Generate daily monitoring report
    """
    try:
        logger.info("Generating daily monitoring report")
        
        # Get latest health check
        from .models import SystemHealthCheck
        latest_health = SystemHealthCheck.objects.first()
        
        # Get feature sync report
        sync_report = FeatureSyncService.get_sync_report()
        
        # Get version info
        version_report = FeatureSyncService.generate_version_report()
        
        report = {
            'date': timezone.now().date(),
            'system_health': {
                'status': latest_health.overall_status if latest_health else 'unknown',
                'score': latest_health.health_score if latest_health else 0,
            },
            'feature_sync': sync_report['summary'],
            'version': version_report['current_version'],
        }
        
        # Here you could send the report via email, Slack, etc.
        logger.info(f"Daily report generated: Health={report['system_health']['status']}, Features={report['feature_sync']['synchronized']}/{report['feature_sync']['total_features']}")
        
        return report
        
    except Exception as exc:
        logger.error(f"Daily report generation failed: {exc}")
        return {
            'status': 'error',
            'error': str(exc)
        }


@shared_task
def alert_critical_issues():
    """
    Check for critical issues and send alerts
    """
    try:
        from .models import SystemHealthCheck, FeatureSync
        
        alerts = []
        
        # Check latest health status
        latest_health = SystemHealthCheck.objects.first()
        if latest_health and latest_health.overall_status == 'critical':
            alerts.append({
                'type': 'critical_health',
                'message': f'System health is critical (Score: {latest_health.health_score})',
                'details': {
                    'database': latest_health.database_status,
                    'cache': latest_health.cache_status,
                    'api': latest_health.api_status,
                }
            })
        
        # Check for critical feature issues
        critical_features = FeatureSync.objects.filter(
            priority='critical',
            is_synchronized=False
        )
        if critical_features.exists():
            alerts.append({
                'type': 'critical_features',
                'message': f'{critical_features.count()} critical features are not synchronized',
                'features': [f.feature_name for f in critical_features]
            })
        
        # Check for API failures
        from .models import APIEndpointTest
        failed_apis = APIEndpointTest.objects.filter(
            last_test_status__in=['failed', 'error'],
            endpoint_path__contains='critical'  # Assume some endpoints are marked as critical
        )
        if failed_apis.exists():
            alerts.append({
                'type': 'api_failures',
                'message': f'{failed_apis.count()} critical API endpoints are failing',
                'endpoints': [f"{api.http_method} {api.endpoint_path}" for api in failed_apis]
            })
        
        if alerts:
            logger.warning(f"Critical alerts detected: {len(alerts)} alerts")
            for alert in alerts:
                logger.warning(f"ALERT: {alert['message']}")
            
            # Here you could send alerts via email, Slack, SMS, etc.
            # send_slack_alert(alerts)
            # send_email_alert(alerts)
        
        return {
            'status': 'success',
            'alerts_count': len(alerts),
            'alerts': alerts
        }
        
    except Exception as exc:
        logger.error(f"Alert check failed: {exc}")
        return {
            'status': 'error',
            'error': str(exc)
        }
