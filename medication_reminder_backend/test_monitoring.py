#!/usr/bin/env python
"""
Testing específico del sistema de monitoreo
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

def login_and_get_token():
    """Login y obtener token de acceso"""
    client = Client()
    
    login_data = {
        'email': 'test@example.com',
        'password': 'test_password_123'
    }
    
    response = client.post('/api/auth/login/', data=login_data, content_type='application/json')
    if response.status_code == 200:
        response_data = json.loads(response.content)
        return response_data.get('access')
    return None

def test_monitoring_system():
    """Test completo del sistema de monitoreo"""
    print("🏥 TESTING SISTEMA DE MONITOREO COMPLETO")
    print("=" * 80)
    
    # Login
    print("🔐 Obteniendo token de acceso...")
    access_token = login_and_get_token()
    
    if not access_token:
        print("❌ No se pudo obtener token de acceso")
        return
    
    print(f"   ✅ Token obtenido: {access_token[:20]}...")
    
    client = Client()
    headers = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
    
    # Lista de endpoints a probar
    endpoints = [
        ('GET', '/api/monitoring/dashboard/', 'Dashboard principal'),
        ('GET', '/api/monitoring/health-check/', 'Health check del sistema'),
        ('POST', '/api/monitoring/sync-features/', 'Sincronización de features'),
        ('GET', '/api/monitoring/version-report/', 'Reporte de versiones'),
        ('GET', '/api/monitoring/feature-report/', 'Reporte de features'),
        ('POST', '/api/monitoring/run-tests/', 'Ejecutar tests de API'),
        ('POST', '/api/monitoring/setup-tests/', 'Configurar tests por defecto'),
    ]
    
    print(f"\n📊 Testing {len(endpoints)} endpoints de monitoreo...")
    print("-" * 80)
    
    for method, url, description in endpoints:
        print(f"🧪 {description}")
        
        if method == 'GET':
            response = client.get(url, **headers)
        elif method == 'POST':
            response = client.post(url, **headers)
        
        print(f"   {method} {url} - Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ FUNCIONANDO")
            try:
                data = json.loads(response.content)
                if isinstance(data, dict):
                    print(f"   📋 Keys: {list(data.keys())}")
                elif isinstance(data, list):
                    print(f"   📋 Items: {len(data)}")
            except:
                print("   📄 Respuesta no JSON")
        elif response.status_code == 403:
            print("   ⚠️  Sin permisos")
        elif response.status_code == 404:
            print("   ❌ Endpoint no encontrado")
        else:
            print(f"   ❌ Error: {response.status_code}")
            error_msg = response.content.decode()[:100]
            if error_msg:
                print(f"   📄 {error_msg}...")
        
        print()

if __name__ == '__main__':
    test_monitoring_system()
