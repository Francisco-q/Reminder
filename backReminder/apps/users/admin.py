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
    
    list_display = ('email', 'first_name', 'last_name', 'phone_number', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined', 'date_of_birth')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone_number', 'date_of_birth')}),
        (_('Preferences'), {'fields': ('timezone', 'language')}),
        (_('Notifications'), {'fields': ('email_notifications', 'push_notifications', 'sms_notifications')}),
        (_('Privacy'), {'fields': ('is_profile_public',)}),
        (_('Device'), {'fields': ('device_token', 'device_type')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined', 'last_active')}),
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
    
    list_display = ('user', 'weight', 'height', 'blood_type', 'emergency_contact_name')
    list_filter = ('blood_type',)
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'emergency_contact_name')
    
    fieldsets = (
        (_('User Information'), {
            'fields': ('user',)
        }),
        (_('Physical Information'), {
            'fields': ('weight', 'height', 'blood_type')
        }),
        (_('Emergency Contact'), {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
        (_('Medical Information'), {
            'fields': ('medical_conditions', 'allergies')
        }),
        (_('Preferences'), {
            'fields': ('preferred_notification_time', 'reminder_advance_minutes')
        }),
    )
