"""
Analytics URLs - Progress tracking & statistics
"""
from django.urls import path
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_dashboard(request):
    """Analytics dashboard endpoint with mock data"""
    period = request.GET.get('period', 'month')
    
    # Mock data structure matching frontend expectations
    data = {
        "medicationStats": {
            "totalMedications": 12,
            "activeMedications": 8,
            "inactiveMedications": 4
        },
        "adherenceStats": {
            "adherenceRate": 85.5,
            "takenDoses": 156,
            "missedDoses": 24,
            "totalDoses": 180
        },
        "weeklyProgress": [
            {"day": "Lun", "taken": 8, "total": 10},
            {"day": "Mar", "taken": 9, "total": 10},
            {"day": "Mié", "taken": 7, "total": 10},
            {"day": "Jue", "taken": 10, "total": 10},
            {"day": "Vie", "taken": 8, "total": 10},
            {"day": "Sáb", "taken": 6, "total": 8},
            {"day": "Dom", "taken": 7, "total": 8}
        ],
        "period": period,
        "lastUpdated": "2025-08-13T22:30:00Z"
    }
    
    return Response(data)

app_name = 'analytics'
urlpatterns = [
    path('dashboard/', analytics_dashboard, name='dashboard'),
]
