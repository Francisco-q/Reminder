"""
Authentication views - JWT token management and user auth
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.conf import settings
from apps.users.models import User
from apps.users.serializers import UserRegistrationSerializer
from .serializers import (
    CustomTokenObtainPairSerializer, LoginSerializer, LogoutSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token obtain view with user data
    """
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login view with device token support
    """
    serializer = LoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.full_name,
                'device_type': user.device_type,
                'timezone': user.timezone,
                'language': user.language,
                'email_notifications': user.email_notifications,
                'push_notifications': user.push_notifications,
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    User registration view
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Registration successful',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.full_name,
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout view - blacklist refresh token and clear device token
    """
    serializer = LogoutSerializer(data=request.data)
    
    if serializer.is_valid():
        refresh_token = serializer.validated_data.get('refresh_token')
        
        # Clear device token
        user = request.user
        user.device_token = ''
        user.save(update_fields=['device_token'])
        
        # Blacklist refresh token if provided
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass  # Token already invalid
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """
    Request password reset (send email)
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email, is_active=True)
            
            # TODO: Implement email sending with reset token
            # For now, just return success
            # In production, you would:
            # 1. Generate reset token
            # 2. Send email with reset link
            # 3. Store token with expiration
            
            return Response({
                'message': 'If a user with that email exists, a password reset email has been sent.'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Return same message for security (don't reveal user existence)
            return Response({
                'message': 'If a user with that email exists, a password reset email has been sent.'
            }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """
    Confirm password reset with token
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        # TODO: Implement token validation and password reset
        # For now, return error as tokens are not implemented
        return Response({
            'error': 'Password reset tokens not yet implemented'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token_view(request):
    """
    Verify if current token is valid and return user info
    """
    user = request.user
    user.update_last_active()
    
    return Response({
        'valid': True,
        'user': {
            'id': str(user.id),
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.full_name,
            'timezone': user.timezone,
            'language': user.language,
            'last_active': user.last_active,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_oauth_login(request):
    """
    Endpoint para login con Google OAuth
    Recibe el token de Google y autentica al usuario
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests
    
    token = request.data.get('credential')
    
    if not token:
        return Response(
            {'error': 'Token de Google requerido'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Verificar token de Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_OAUTH_CLIENT_ID
        )
        
        # Validar issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return Response(
                {'error': 'Token inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extraer información del usuario
        google_id = idinfo['sub']
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        
        # Crear o obtener usuario
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
            }
        )
        
        # Si es nuevo usuario, actualizar información
        if created:
            user.set_unusable_password()  # No password para OAuth users
            user.save()
        
        # Generar JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login exitoso' if not created else 'Usuario creado exitosamente',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_new': created,
            }
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response(
            {'error': f'Token inválido: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Error del servidor: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
