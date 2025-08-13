#!/usr/bin/env python
"""
Crear usuario admin para testing de monitoreo
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin_user():
    """Crear usuario administrador"""
    print("🔧 Creando usuario administrador...")
    
    # Verificar si ya existe
    if User.objects.filter(username='admin').exists():
        print("   ⚠️  Usuario 'admin' ya existe")
        admin_user = User.objects.get(username='admin')
    else:
        # Crear nuevo admin
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='admin123',
            first_name='System',
            last_name='Administrator'
        )
        print("   ✅ Usuario admin creado")
    
    # Hacer superusuario y staff
    admin_user.is_superuser = True
    admin_user.is_staff = True
    admin_user.is_active = True
    admin_user.save()
    
    print(f"   👤 Usuario: {admin_user.username}")
    print(f"   📧 Email: {admin_user.email}")
    print(f"   🔑 Superuser: {admin_user.is_superuser}")
    print(f"   👔 Staff: {admin_user.is_staff}")

if __name__ == '__main__':
    create_admin_user()
