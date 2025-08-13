"""
Medication Reminder - Schedule Serializers
Copyright (C) 2025 Francisco [Tu Apellido/Empresa]. All Rights Reserved.
"""

from rest_framework import serializers
from .models import DailySchedule, WeeklyProgress, MedicationDose


class DailyScheduleSerializer(serializers.ModelSerializer):
    """Serializer for DailySchedule model"""
    
    class Meta:
        model = DailySchedule
        fields = ['id', 'user', 'date', 'total_medications', 'completed_medications', 'missed_medications', 'adherence_rate', 'created_at']
        read_only_fields = ['created_at']


class WeeklyProgressSerializer(serializers.ModelSerializer):
    """Serializer for WeeklyProgress model"""
    
    class Meta:
        model = WeeklyProgress
        fields = ['id', 'user', 'week_start_date', 'total_scheduled', 'completed', 'missed', 'adherence_rate', 'created_at']
        read_only_fields = ['created_at']


class MedicationDoseSerializer(serializers.ModelSerializer):
    """Serializer for MedicationDose model"""
    
    class Meta:
        model = MedicationDose
        fields = ['id', 'medication', 'scheduled_time', 'taken_time', 'is_taken', 'notes', 'created_at']
        read_only_fields = ['created_at']
