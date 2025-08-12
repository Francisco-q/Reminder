#!/usr/bin/env python
"""
Script para verificar que las URLs están funcionando correctamente
"""
import os
import sys
import django
from django.conf import settings
from django.urls import reverse
from django.test import Client

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

def test_urls():
    """Test básico de URLs disponibles"""
    client = Client()
    
    print("🧪 Testing URLs disponibles...")
    print("=" * 50)
    
    # Test home page
    try:
        response = client.get('/')
        print(f"✅ GET / - Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Content-Type: {response.get('content-type', 'N/A')}")
    except Exception as e:
        print(f"❌ GET / - Error: {e}")
    
    # Test health check
    try:
        response = client.get('/health/')
        print(f"✅ GET /health/ - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ GET /health/ - Error: {e}")
    
    # Test API documentation
    try:
        response = client.get('/api/docs/')
        print(f"✅ GET /api/docs/ - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/docs/ - Error: {e}")
    
    # Test users endpoint
    try:
        response = client.get('/api/users/')
        print(f"✅ GET /api/users/ - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/users/ - Error: {e}")
        
    print("=" * 50)
    print("🏁 Test completado!")

if __name__ == '__main__':
    test_urls()
