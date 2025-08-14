"""
Medication URLs - CRUD operations and medication management
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicationViewSet, MedicationHistoryViewSet

router = DefaultRouter()
router.register('', MedicationViewSet, basename='medications')
router.register('history', MedicationHistoryViewSet, basename='medication-history')

app_name = 'medications'

urlpatterns = [
    path('', include(router.urls)),
]
