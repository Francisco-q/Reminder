"""
Medication Reminder - Notification Admin Configuration
Copyright (C) 2025 Francisco [Tu Apellido/Empresa]. All Rights Reserved.
"""

from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin configuration for Notification model"""
    
    list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'read_at')
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'title', 'message', 'notification_type')
        }),
        ('Status', {
            'fields': ('is_read', 'created_at', 'read_at')
        }),
    )
