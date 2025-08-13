"""
User views - ViewSets for user management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, UserProfile
from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserUpdateSerializer,
    PasswordChangeSerializer, UserProfileSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        """Allow anonymous access for registration"""
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Return queryset based on user permissions"""
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user information"""
        request.user.update_last_active()
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_me(self, request):
        """Update current user information"""
        serializer = UserUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=request.method == 'PATCH'
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """Change user password"""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def update_device_token(self, request):
        """Update device token for push notifications"""
        device_token = request.data.get('device_token')
        device_type = request.data.get('device_type', 'android')
        
        if not device_token:
            return Response({
                'error': 'device_token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user.device_token = device_token
        user.device_type = device_type
        user.save(update_fields=['device_token', 'device_type'])
        
        return Response({
            'message': 'Device token updated successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        """Get user profile"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update user profile"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(
            profile, 
            data=request.data, 
            partial=request.method == 'PATCH'
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'], permission_classes=[IsAuthenticated])
    def deactivate_account(self, request):
        """Deactivate user account (soft delete)"""
        user = request.user
        user.is_active = False
        user.save()
        
        return Response({
            'message': 'Account deactivated successfully'
        }, status=status.HTTP_200_OK)
