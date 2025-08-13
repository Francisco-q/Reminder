"""
Medication Reminder - Notification Serializers
Copyright (C) 2025 Francisco [Tu Apellido/Empresa]. All Rights Reserved.
"""

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at', 'read_at']
        read_only_fields = ['created_at', 'read_at']
