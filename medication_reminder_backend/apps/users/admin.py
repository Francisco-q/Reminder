"""
Medication Reminder - User Admin Configuration
Copyright (C) 2025 Francisco [Tu Apellido/Empresa]. All Rights Reserved.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model"""
    
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin configuration for UserProfile model"""
    
    list_display = ('user', 'phone_number', 'date_of_birth', 'emergency_contact_name')
    list_filter = ('date_of_birth',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'phone_number', 'emergency_contact_name')
    
    fieldsets = (
        (_('User Information'), {
            'fields': ('user',)
        }),
        (_('Personal Details'), {
            'fields': ('phone_number', 'date_of_birth', 'medical_conditions', 'allergies')
        }),
        (_('Emergency Contact'), {
            'fields': ('emergency_contact_name', 'emergency_contact_phone')
        }),
        (_('Settings'), {
            'fields': ('timezone', 'preferred_language', 'notification_preferences')
        }),
    )
