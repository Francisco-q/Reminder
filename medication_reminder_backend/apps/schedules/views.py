"""
Medication Reminder - Schedule Views
Copyright (C) 2025 Francisco [Tu Apellido/Empresa]. All Rights Reserved.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import date

from .models import DailySchedule, WeeklyProgress, MedicationDose
from .serializers import DailyScheduleSerializer, WeeklyProgressSerializer, MedicationDoseSerializer


class DailyScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing daily schedules"""
    serializer_class = DailyScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DailySchedule.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TodayScheduleView(APIView):
    """Get today's medication schedule"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        today = date.today()
        schedules = DailySchedule.objects.filter(
            user=request.user,
            date=today
        )
        serializer = DailyScheduleSerializer(schedules, many=True)
        return Response({
            'date': today,
            'schedules': serializer.data,
            'total_medications': len(serializer.data)
        })


class ProgressView(APIView):
    """Get user's medication adherence progress"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get current week's progress
            progress = WeeklyProgress.objects.filter(
                user=request.user
            ).order_by('-week_start_date').first()
            
            if progress:
                serializer = WeeklyProgressSerializer(progress)
                return Response(serializer.data)
            else:
                # Return empty progress if none exists
                return Response({
                    'user': request.user.id,
                    'week_start_date': timezone.now().date(),
                    'total_scheduled': 0,
                    'completed': 0,
                    'missed': 0,
                    'adherence_rate': 0.0
                })
                
        except Exception as e:
            return Response(
                {'error': f'Error fetching progress: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
