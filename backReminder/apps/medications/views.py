"""
Medication Reminder - Medication Views
Copyright (C) 2025 Francisco [Tu Apellido/Empresa]. All Rights Reserved.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from .models import Medication, MedicationHistory
from .serializers import MedicationSerializer, MedicationHistorySerializer


class MedicationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing medications"""
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Medication.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active medications"""
        active_meds = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_meds, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle medication active status"""
        medication = self.get_object()
        medication.is_active = not medication.is_active
        medication.save()
        return Response({
            'id': medication.id,
            'is_active': medication.is_active,
            'message': f'Medication {"activated" if medication.is_active else "deactivated"}'
        })


class MedicationHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet for medication history"""
    serializer_class = MedicationHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MedicationHistory.objects.filter(medication__user=self.request.user)
