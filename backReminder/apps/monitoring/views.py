"""
Monitoring views - Dashboard and reporting endpoints
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
import io
import csv

from .models import SystemVersion, FeatureSync, APIEndpointTest, SystemHealthCheck
from .services import FeatureSyncService
from .test_service import APITestService, SystemHealthService


class MonitoringDashboardView(APIView):
    """
    Main monitoring dashboard with system overview
    """
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        """Get monitoring dashboard data"""
        try:
            # Get latest health check
            latest_health = SystemHealthCheck.objects.first()
            
            # Get feature sync status
            sync_report = FeatureSyncService.get_sync_report()
            
            # Get API test results
            api_tests = APIEndpointTest.objects.all()
            api_summary = {
                'total_tests': api_tests.count(),
                'healthy_endpoints': api_tests.filter(is_healthy=True).count(),
                'average_response_time': api_tests.aggregate(
                    avg_time=models.Avg('average_response_time')
                )['avg_time'] or 0,
            }
            
            # Get current version
            current_version = SystemVersion.objects.filter(is_current=True).first()
            
            dashboard_data = {
                'timestamp': timezone.now(),
                'system_health': {
                    'overall_status': latest_health.overall_status if latest_health else 'unknown',
                    'health_score': latest_health.health_score if latest_health else 0,
                    'database_status': latest_health.database_status if latest_health else 'unknown',
                    'cache_status': latest_health.cache_status if latest_health else 'unknown',
                    'api_status': latest_health.api_status if latest_health else 'unknown',
                    'last_check': latest_health.created_at if latest_health else None,
                },
                'feature_sync': sync_report['summary'],
                'api_tests': api_summary,
                'current_version': {
                    'version': current_version.version_number if current_version else 'Unknown',
                    'build': current_version.build_number if current_version else 0,
                    'release_date': current_version.release_date if current_version else None,
                },
                'quick_stats': {
                    'total_users': latest_health.total_users if latest_health else 0,
                    'active_users_24h': latest_health.active_users_24h if latest_health else 0,
                    'total_medications': latest_health.total_medications if latest_health else 0,
                    'schedules_today': latest_health.total_schedules_today if latest_health else 0,
                }
            }
            
            return Response(dashboard_data)
            
        except Exception as e:
            return Response({
                'error': f'Error generating dashboard: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def sync_features(request):
    """
    Trigger feature synchronization check
    """
    try:
        report = FeatureSyncService.sync_all_features()
        return Response({
            'message': 'Feature sync completed successfully',
            'report': report
        })
    except Exception as e:
        return Response({
            'error': f'Feature sync failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def run_api_tests(request):
    """
    Run all API endpoint tests
    """
    try:
        test_service = APITestService()
        results = test_service.run_all_tests()
        return Response({
            'message': 'API tests completed',
            'results': results
        })
    except Exception as e:
        return Response({
            'error': f'API tests failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def setup_default_tests(request):
    """
    Setup default API tests
    """
    try:
        test_service = APITestService()
        test_service.setup_default_tests()
        return Response({
            'message': 'Default API tests setup completed'
        })
    except Exception as e:
        return Response({
            'error': f'Setup failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def health_check(request):
    """
    Perform system health check
    """
    try:
        health_check = SystemHealthService.perform_health_check()
        return Response({
            'message': 'Health check completed',
            'health_check_id': str(health_check.check_id),
            'overall_status': health_check.overall_status,
            'health_score': health_check.health_score,
            'timestamp': health_check.created_at,
        })
    except Exception as e:
        return Response({
            'error': f'Health check failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def version_report(request):
    """
    Generate comprehensive version report
    """
    try:
        report = FeatureSyncService.generate_version_report()
        return Response(report)
    except Exception as e:
        return Response({
            'error': f'Version report generation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def create_version(request):
    """
    Create new system version
    """
    try:
        version_number = request.data.get('version_number')
        release_notes = request.data.get('release_notes', '')
        
        if not version_number:
            return Response({
                'error': 'version_number is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        version = FeatureSyncService.create_new_version(version_number, release_notes)
        
        return Response({
            'message': 'New version created successfully',
            'version': {
                'id': str(version.id),
                'version_number': version.version_number,
                'build_number': version.build_number,
                'release_date': version.release_date,
                'is_current': version.is_current,
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Version creation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def feature_sync_report(request):
    """
    Get detailed feature synchronization report
    """
    try:
        report = FeatureSyncService.get_sync_report()
        return Response(report)
    except Exception as e:
        return Response({
            'error': f'Feature sync report failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def export_report(request):
    """
    Export monitoring report as CSV
    """
    try:
        report_type = request.GET.get('type', 'dashboard')
        
        if report_type == 'features':
            return export_features_csv()
        elif report_type == 'api_tests':
            return export_api_tests_csv()
        elif report_type == 'health_history':
            return export_health_history_csv()
        else:
            return export_dashboard_csv()
            
    except Exception as e:
        return Response({
            'error': f'Export failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def export_features_csv():
    """Export feature sync status as CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="feature_sync_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Feature Name', 'Description', 'Priority', 'Status',
        'Frontend Implemented', 'Backend Implemented', 'Synchronized',
        'Last Check', 'Issues'
    ])
    
    features = FeatureSync.objects.all()
    for feature in features:
        writer.writerow([
            feature.feature_name,
            feature.feature_description,
            feature.priority,
            feature.status,
            'Yes' if feature.frontend_implemented else 'No',
            'Yes' if feature.backend_implemented else 'No',
            'Yes' if feature.is_synchronized else 'No',
            feature.last_sync_check,
            feature.sync_issues.replace('\n', '; ') if feature.sync_issues else ''
        ])
    
    return response


def export_api_tests_csv():
    """Export API test results as CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="api_tests_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Endpoint', 'Method', 'Last Status', 'Response Time (ms)',
        'Success Rate (%)', 'Total Tests', 'Passed', 'Failed',
        'Is Healthy', 'Last Test Date'
    ])
    
    tests = APIEndpointTest.objects.all()
    for test in tests:
        writer.writerow([
            test.endpoint_path,
            test.http_method,
            test.last_test_status,
            test.last_response_time or 0,
            round(test.success_rate, 2),
            test.total_tests,
            test.passed_tests,
            test.failed_tests,
            'Yes' if test.is_healthy else 'No',
            test.last_test_date
        ])
    
    return response


def export_health_history_csv():
    """Export health check history as CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="health_history_report.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'Check Date', 'Overall Status', 'Health Score',
        'Database Status', 'Cache Status', 'API Status',
        'Total Users', 'Active Users 24h', 'Total Medications'
    ])
    
    checks = SystemHealthCheck.objects.all()[:100]  # Last 100 checks
    for check in checks:
        writer.writerow([
            check.created_at,
            check.overall_status,
            check.health_score,
            check.database_status,
            check.cache_status,
            check.api_status,
            check.total_users,
            check.active_users_24h,
            check.total_medications
        ])
    
    return response


def export_dashboard_csv():
    """Export dashboard summary as CSV"""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="dashboard_report.csv"'
    
    # Get latest data
    latest_health = SystemHealthCheck.objects.first()
    sync_report = FeatureSyncService.get_sync_report()
    current_version = SystemVersion.objects.filter(is_current=True).first()
    
    writer = csv.writer(response)
    writer.writerow(['Metric', 'Value'])
    
    # System health
    if latest_health:
        writer.writerow(['Overall Status', latest_health.overall_status])
        writer.writerow(['Health Score', latest_health.health_score])
        writer.writerow(['Database Status', latest_health.database_status])
        writer.writerow(['Cache Status', latest_health.cache_status])
        writer.writerow(['API Status', latest_health.api_status])
        writer.writerow(['Total Users', latest_health.total_users])
        writer.writerow(['Active Users (24h)', latest_health.active_users_24h])
        writer.writerow(['Total Medications', latest_health.total_medications])
    
    # Feature sync
    writer.writerow(['Total Features', sync_report['summary']['total_features']])
    writer.writerow(['Synchronized Features', sync_report['summary']['synchronized']])
    writer.writerow(['Unsynchronized Features', sync_report['summary']['unsynchronized']])
    writer.writerow(['Critical Issues', sync_report['summary']['critical_issues']])
    
    # Version info
    if current_version:
        writer.writerow(['Current Version', current_version.version_number])
        writer.writerow(['Build Number', current_version.build_number])
        writer.writerow(['Release Date', current_version.release_date])
    
    writer.writerow(['Report Generated', timezone.now()])
    
    return response
