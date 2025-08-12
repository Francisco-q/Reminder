#!/bin/bash
echo "🏥 Medication Reminder Monitoring System Setup"
echo "================================================"

echo ""
echo "🔌 Setting up Django environment..."
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo "🗄️ Running database migrations..."
python manage.py makemigrations monitoring
python manage.py migrate

echo "⚙️ Setting up monitoring system..."
python manage.py setup_monitoring --full-setup

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "💡 Try these commands:"
echo "   python manage.py monitor dashboard"
echo "   python manage.py monitor sync-features"  
echo "   python manage.py monitor run-tests"
echo "   python manage.py monitor export-report --output report.json --format json"
echo ""
