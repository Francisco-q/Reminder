#!/usr/bin/env python
"""
Testing completo de funcionalidades disponibles
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

def test_authentication_flow():
    """Test completo del flujo de autenticación"""
    client = Client()
    
    print("🔐 TESTING AUTENTICACIÓN")
    print("=" * 60)
    
    # 1. Test registro de usuario
    print("1️⃣ Testing registro de usuario...")
    register_data = {
        'username': 'test_user',
        'email': 'test@example.com',
        'password': 'test_password_123',
        'password_confirm': 'test_password_123',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    response = client.post('/api/auth/register/', data=register_data, content_type='application/json')
    print(f"   POST /api/auth/register/ - Status: {response.status_code}")
    
    if response.status_code == 201:
        print("   ✅ Usuario registrado exitosamente")
        response_data = json.loads(response.content)
        print(f"   📄 Tokens: access={bool(response_data.get('access'))}, refresh={bool(response_data.get('refresh'))}")
    else:
        print(f"   ❌ Error en registro: {response.content.decode()[:200]}")
    
    # 2. Test login
    print("\n2️⃣ Testing login de usuario...")
    login_data = {
        'email': 'test@example.com',  # Usar email en lugar de username
        'password': 'test_password_123'
    }
    
    response = client.post('/api/auth/login/', data=login_data, content_type='application/json')
    print(f"   POST /api/auth/login/ - Status: {response.status_code}")
    
    access_token = None
    if response.status_code == 200:
        print("   ✅ Login exitoso")
        response_data = json.loads(response.content)
        access_token = response_data.get('access')
        print(f"   📄 Token obtenido: {access_token[:20]}..." if access_token else "   ❌ Sin token")
    else:
        print(f"   ❌ Error en login: {response.content.decode()[:200]}")
    
    return access_token

def test_user_management(access_token):
    """Test gestión de usuarios"""
    client = Client()
    
    print("\n👤 TESTING GESTIÓN DE USUARIOS")
    print("=" * 60)
    
    if not access_token:
        print("❌ No hay token de acceso, saltando tests de usuarios")
        return
    
    headers = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
    
    # 1. Test listar usuarios (requiere autenticación)
    print("1️⃣ Testing listar usuarios...")
    response = client.get('/api/users/', **headers)
    print(f"   GET /api/users/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ Lista de usuarios obtenida")
        users_data = json.loads(response.content)
        print(f"   📊 Usuarios encontrados: {len(users_data.get('results', []))}")
    else:
        print(f"   ❌ Error: {response.content.decode()[:200]}")
    
    # 2. Test perfil actual
    print("\n2️⃣ Testing obtener perfil actual...")
    response = client.get('/api/users/me/', **headers)
    print(f"   GET /api/users/me/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ Perfil obtenido")
        profile_data = json.loads(response.content)
        print(f"   👤 Usuario: {profile_data.get('username')} - {profile_data.get('email')}")
    else:
        print(f"   ❌ Error: {response.content.decode()[:200]}")

def test_health_checks():
    """Test health checks del sistema"""
    client = Client()
    
    print("\n🏥 TESTING HEALTH CHECKS")
    print("=" * 60)
    
    # 1. Test home page
    print("1️⃣ Testing página principal...")
    response = client.get('/')
    print(f"   GET / - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ Página principal funcionando")
        data = json.loads(response.content)
        print(f"   📋 Endpoints disponibles: {len(data.get('endpoints', {}))}")
    
    # 2. Test health check
    print("\n2️⃣ Testing health check...")
    response = client.get('/health/')
    print(f"   GET /health/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ Health check OK")
        data = json.loads(response.content)
        print(f"   💚 Status: {data.get('status')}")

def test_api_documentation():
    """Test documentación de la API"""
    client = Client()
    
    print("\n📚 TESTING DOCUMENTACIÓN API")
    print("=" * 60)
    
    # 1. Test Swagger UI
    print("1️⃣ Testing Swagger UI...")
    response = client.get('/api/docs/')
    print(f"   GET /api/docs/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ Swagger UI disponible")
    
    # 2. Test Schema OpenAPI
    print("\n2️⃣ Testing OpenAPI Schema...")
    response = client.get('/api/schema/')
    print(f"   GET /api/schema/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ Schema OpenAPI disponible")

def test_monitoring_apis(access_token):
    """Test APIs del sistema de monitoreo"""
    client = Client()
    
    print("\n📊 TESTING SISTEMA DE MONITOREO")
    print("=" * 60)
    
    if not access_token:
        print("❌ No hay token de acceso, saltando tests de monitoreo")
        return
    
    headers = {'HTTP_AUTHORIZATION': f'Bearer {access_token}'}
    
    # 1. Test dashboard de monitoreo
    print("1️⃣ Testing dashboard de monitoreo...")
    response = client.get('/api/monitoring/dashboard/', **headers)
    print(f"   GET /api/monitoring/dashboard/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ Dashboard de monitoreo disponible")
        dashboard_data = json.loads(response.content)
        print(f"   📈 Datos del dashboard: {list(dashboard_data.keys())}")
    else:
        print(f"   ❌ Error: {response.content.decode()[:200]}")
    
    # 2. Test health check via API
    print("\n2️⃣ Testing health check API...")
    response = client.get('/api/monitoring/health/', **headers)
    print(f"   GET /api/monitoring/health/ - Status: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ Health check API disponible")
        health_data = json.loads(response.content)
        print(f"   💚 Status: {health_data.get('status', 'unknown')}")
    else:
        print(f"   ❌ Error: {response.content.decode()[:200]}")
    
    # 3. Test sincronización de features  
    print("\n3️⃣ Testing sincronización de features...")
    response = client.post('/api/monitoring/sync/', **headers)
    print(f"   POST /api/monitoring/sync/ - Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        print("   ✅ Sincronización de features iniciada")
        sync_data = json.loads(response.content)
        print(f"   � Sync ID: {sync_data.get('sync_id', 'N/A')}")
    else:
        print(f"   ❌ Error: {response.content.decode()[:200]}")

def main():
    """Ejecutar todos los tests"""
    print("�🚀 INICIANDO TESTING DE FUNCIONALIDADES DISPONIBLES")
    print("=" * 80)
    
    # 1. Health checks
    test_health_checks()
    
    # 2. Documentación
    test_api_documentation()
    
    # 3. Autenticación completa
    access_token = test_authentication_flow()
    
    # 4. Gestión de usuarios
    test_user_management(access_token)
    
    # 5. **NUEVO: Sistema de Monitoreo**
    test_monitoring_apis(access_token)
    
    print("\n" + "=" * 80)
    print("🏁 TESTING COMPLETADO")
    print("=" * 80)

if __name__ == '__main__':
    main()
