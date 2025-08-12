#!/usr/bin/env python
"""
Testing del sistema de monitoreo con usuario admin
"""
import os
import sys
import django
import json
from django.test import Client
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

User = get_user_model()

def login_admin():
    """Login como administrador"""
    client = Client()
    
    login_data = {
        'email': 'admin@test.com',
        'password': 'admin123'
    }
    
    response = client.post('/api/auth/login/', data=login_data, content_type='application/json')
    if response.status_code == 200:
        response_data = json.loads(response.content)
        return response_data.get('access')
    return None

def test_monitoring_as_admin():
    """Test sistema de monitoreo como administrador"""
    print("👑 TESTING SISTEMA DE MONITOREO COMO ADMIN")
    print("=" * 80)
    
    # Login como admin
    print("🔐 Login como administrador...")
    access_token = login_admin()
    
    if not access_token:
        print("❌ No se pudo hacer login como admin")
        return
    
    print(f"   ✅ Token admin obtenido: {access_token[:20]}...")
    
    client = Client()
    headers = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
    
    print(f"\n📊 Testing sistema de monitoreo COMPLETO...")
    print("-" * 80)
    
    # 1. Dashboard principal
    print("1️⃣ Dashboard principal")
    response = client.get('/api/monitoring/dashboard/', **headers)
    print(f"   GET /api/monitoring/dashboard/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ DASHBOARD FUNCIONANDO!")
        try:
            data = json.loads(response.content)
            print(f"   📊 Dashboard data: {list(data.keys())}")
            
            # Mostrar estadísticas
            if 'system_status' in data:
                print(f"   🏥 System Status: {data['system_status']}")
            if 'total_syncs' in data:
                print(f"   🔄 Total Syncs: {data['total_syncs']}")
            if 'total_tests' in data:
                print(f"   🧪 Total Tests: {data['total_tests']}")
                
        except Exception as e:
            print(f"   📄 Response: {response.content.decode()[:200]}")
    else:
        print(f"   ❌ Error: {response.status_code}")
    
    print()
    
    # 2. Health check
    print("2️⃣ Health Check")
    response = client.get('/api/monitoring/health-check/', **headers)
    print(f"   GET /api/monitoring/health-check/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ HEALTH CHECK FUNCIONANDO!")
        try:
            data = json.loads(response.content)
            print(f"   💚 Health Status: {data.get('status', 'unknown')}")
            print(f"   📊 Health Score: {data.get('health_score', 'N/A')}")
        except:
            print(f"   📄 Response: {response.content.decode()[:200]}")
    else:
        print(f"   ❌ Error: {response.status_code}")
    
    print()
    
    # 3. Sincronización de features
    print("3️⃣ Sincronización de Features")
    response = client.post('/api/monitoring/sync-features/', **headers)
    print(f"   POST /api/monitoring/sync-features/ - Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        print("   ✅ SINCRONIZACIÓN FUNCIONANDO!")
        try:
            data = json.loads(response.content)
            print(f"   🔄 Sync ID: {data.get('sync_id', 'N/A')}")
            print(f"   📋 Status: {data.get('status', 'N/A')}")
        except:
            print(f"   📄 Response: {response.content.decode()[:200]}")
    else:
        print(f"   ❌ Error: {response.status_code}")
        print(f"   📄 Response: {response.content.decode()[:200]}")
    
    print()
    
    # 4. Version report  
    print("4️⃣ Version Report")
    response = client.get('/api/monitoring/version-report/', **headers)
    print(f"   GET /api/monitoring/version-report/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ VERSION REPORT FUNCIONANDO!")
        try:
            data = json.loads(response.content)
            print(f"   🏷️  Versions: {len(data.get('versions', []))}")
            print(f"   📅 Current: {data.get('current_version', 'N/A')}")
        except:
            print(f"   📄 Response: {response.content.decode()[:200]}")
    else:
        print(f"   ❌ Error: {response.status_code}")

if __name__ == '__main__':
    test_monitoring_as_admin()
