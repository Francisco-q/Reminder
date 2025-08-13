# 🏥 Medication Reminder Monitoring System

## Overview

The Medication Reminder Monitoring System provides comprehensive tracking of frontend-backend feature synchronization, automated API testing, system health monitoring, and version management. This system was designed specifically to address the need for centralized monitoring of frontend-backend connectivity and "one-button" reporting capabilities.

## 🚀 Features

### ✅ Frontend-Backend Synchronization
- **Complete Feature Mapping**: Tracks all frontend features and their corresponding backend endpoints
- **File-Level Tracking**: Monitors specific files for each feature (React Native components, Django views, etc.)
- **Synchronization Status**: Real-time status of feature implementation across frontend and backend
- **Issue Detection**: Automatically identifies missing implementations or mismatches

### 🧪 Automated API Testing
- **Endpoint Health Monitoring**: Tests all API endpoints for availability and correct responses
- **Authentication Testing**: Includes JWT token-based authentication in all tests
- **Response Validation**: Validates response status codes, headers, and basic data structure
- **Performance Metrics**: Tracks response times and identifies slow endpoints

### 📊 System Health Monitoring
- **Component Status**: Monitors database, cache (Redis), Celery, and API health
- **System Metrics**: Tracks user counts, medication records, schedule statistics
- **Health Scoring**: Provides overall system health score (0-100)
- **Alert System**: Identifies critical issues requiring immediate attention

### 📦 Version Management
- **Build Tracking**: Automatic build number generation for each version
- **Release Notes**: Structured release notes with feature changes
- **Environment Tracking**: Tracks deployment environment and configuration
- **Version History**: Complete history of all system versions

### 📈 Reporting & Analytics
- **Comprehensive Reports**: Combines all monitoring data into unified reports
- **Export Capabilities**: CSV, JSON, and text format exports
- **One-Button Generation**: Single command report generation as requested
- **Automated Scheduling**: Celery-based automated report generation

## 🛠️ Installation & Setup

### 1. Database Setup
The monitoring system is already integrated into your Django project. Run migrations to create the necessary tables:

```bash
cd medication_reminder_backend
python manage.py makemigrations monitoring
python manage.py migrate
```

### 2. Quick Setup
Use the setup command to initialize the monitoring system:

```bash
# Basic setup (recommended for first time)
python manage.py setup_monitoring

# Full setup with initial data
python manage.py setup_monitoring --full-setup
```

### 3. Verify Installation
Check that everything is working:

```bash
python manage.py monitor dashboard
```

## 📱 Usage

### Command Line Interface (CLI)

#### Main Monitoring Command
```bash
python manage.py monitor <action> [options]
```

#### Available Actions:

**Dashboard Overview**
```bash
python manage.py monitor dashboard
```
Shows current system status, feature sync status, API health, and version information.

**Feature Synchronization**
```bash
# Sync all features and get report
python manage.py monitor sync-features

# Export sync report
python manage.py monitor sync-features --output sync_report.json --format json
```

**API Testing**
```bash
# Run all API endpoint tests
python manage.py monitor run-tests

# Export test results
python manage.py monitor run-tests --output api_tests.csv --format csv
```

**System Health Check**
```bash
# Perform comprehensive health check
python manage.py monitor health-check

# Export health report
python manage.py monitor health-check --output health.json --format json
```

**Version Management**
```bash
# Generate version report (shows current version, features, system info)
python manage.py monitor version-report

# Create new version
python manage.py monitor create-version --version "1.1.0" --notes "Added monitoring system"
```

**One-Button Comprehensive Report** ⭐
```bash
# Generate complete system report (as requested)
python manage.py monitor export-report --output comprehensive_report.json --format json
```

### Web API Endpoints

The monitoring system provides REST API endpoints accessible at `/api/monitoring/`:

- **Dashboard**: `GET /api/monitoring/dashboard/`
- **Feature Sync**: `POST /api/monitoring/sync-features/`
- **API Tests**: `POST /api/monitoring/run-tests/`
- **Health Check**: `POST /api/monitoring/health-check/`
- **Version Report**: `GET /api/monitoring/version-report/`
- **Export Report**: `GET /api/monitoring/export/`

### Automated Background Tasks

The system includes Celery tasks for automated monitoring:

```python
# Available Celery tasks
- sync_features_task: Automated feature synchronization
- run_api_tests_task: Scheduled API testing
- system_health_check_task: Regular health checks
- cleanup_old_health_checks: Data cleanup
- generate_daily_report: Daily automated reports
- alert_critical_issues: Critical issue alerts
```

## 🎯 Feature Mapping

The system tracks the following frontend-backend feature pairs:

### 📱 Frontend Features (React Native)
- **Authentication**: Login/Register screens and navigation
- **Medication Management**: Add/Edit/Delete medication forms
- **Daily Schedules**: Schedule viewing and management
- **Push Notifications**: Notification handling and settings
- **User Profile**: Profile editing and preferences
- **Analytics Reports**: Progress charts and statistics
- **Offline Sync**: Data synchronization capabilities

### 🔧 Backend Features (Django)
- **Authentication API**: JWT token endpoints
- **Medications API**: CRUD endpoints for medications
- **Schedules API**: Schedule management endpoints
- **Notifications API**: Push notification system
- **Users API**: User management endpoints
- **Analytics API**: Statistics and reporting endpoints
- **Core API**: Health checks and utilities

## 📊 Report Formats

### JSON Format
Complete structured data with all monitoring information:
```json
{
  "generated_at": "2024-01-01T12:00:00Z",
  "version_report": {...},
  "feature_sync": {...},
  "health_check": {...}
}
```

### CSV Format
Tabular data suitable for spreadsheet analysis:
- Feature sync status per feature
- API test results per endpoint
- Health metrics over time

### Text Format
Human-readable summary reports with key metrics and status information.

## 🔧 Configuration

### Environment Variables
Add these to your `.env` file for optimal monitoring:

```env
# Monitoring settings
MONITORING_ENABLED=True
MONITORING_ALERT_EMAIL=admin@yourapp.com
CELERY_BEAT_SCHEDULE_MONITORING=True

# API testing settings
API_TEST_TIMEOUT=30
API_TEST_RETRIES=3
```

### Feature Mapping Customization
Modify `apps/monitoring/services.py` to update the `FEATURE_MAPPING` dictionary for your specific frontend-backend feature pairs.

## 🔄 Automation

### Daily Reports
Set up daily automated reports using Celery Beat:
```python
# In your Celery Beat schedule
'generate_daily_monitoring_report': {
    'task': 'apps.monitoring.tasks.generate_daily_report',
    'schedule': crontab(hour=8, minute=0),  # Daily at 8 AM
}
```

### Critical Issue Alerts
Automatic alerts for critical system issues:
```python
'check_critical_issues': {
    'task': 'apps.monitoring.tasks.alert_critical_issues',
    'schedule': crontab(minute='*/15'),  # Every 15 minutes
}
```

## 🛡️ Security & Permissions

- All monitoring endpoints require admin authentication
- API testing uses secure JWT token generation
- Report exports include admin-only data
- Health checks exclude sensitive system information in public endpoints

## 📈 Performance Considerations

- Feature sync operations are cached for 5 minutes
- Health checks are limited to prevent system overload
- Old health check records are automatically cleaned up
- API tests run with configurable timeouts and retry logic

## 🔍 Troubleshooting

### Common Issues

**Django Import Errors**
- Ensure Django environment is properly activated
- Run `pip install -r requirements.txt` to install dependencies

**Database Connection Issues**
- Verify PostgreSQL is running
- Check database credentials in `.env` file

**Celery Task Issues**
- Ensure Redis is running for Celery broker
- Start Celery worker: `celery -A config worker -l info`
- Start Celery Beat: `celery -A config beat -l info`

**Frontend Feature Detection Issues**
- Verify React Native project structure matches expected paths
- Update `FEATURE_MAPPING` in services.py if file locations change

### Debug Mode
Enable debug logging for monitoring operations:
```python
# In settings/development.py
LOGGING = {
    'loggers': {
        'apps.monitoring': {
            'level': 'DEBUG',
            'handlers': ['console'],
        }
    }
}
```

## 📝 Development

### Adding New Features to Monitor
1. Update `FEATURE_MAPPING` in `apps/monitoring/services.py`
2. Add corresponding file paths for frontend and backend
3. Update API endpoints in the monitoring system
4. Add new test cases in the API testing service

### Extending Report Formats
1. Modify report generation methods in services
2. Add new export format options in management commands
3. Update API endpoints to support new formats

## 🎉 Success!

Your monitoring system is now ready to provide comprehensive frontend-backend synchronization tracking with the "one-button" reporting capability you requested. Use `python manage.py monitor export-report` to generate complete system reports whenever needed.
