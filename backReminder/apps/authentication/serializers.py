"""
Authentication serializers - JWT token management
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from apps.users.models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer with additional user data
    """
    
    def validate(self, attrs):
        """
        Validate credentials and return tokens with user data
        """
        data = super().validate(attrs)
        
        # Add user information to response
        user = self.user
        data.update({
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
        })
        
        # Update last active
        user.update_last_active()
        
        return data


class LoginSerializer(serializers.Serializer):
    """
    Login serializer for email/password authentication
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    device_token = serializers.CharField(required=False, allow_blank=True)
    device_type = serializers.CharField(required=False, default='android')

    def validate(self, attrs):
        """
        Validate user credentials
        """
        email = attrs.get('email')
        password = attrs.get('password')
        device_token = attrs.get('device_token', '')
        device_type = attrs.get('device_type', 'android')

        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )

            if not user:
                # Try to find user by email and check if they exist
                try:
                    user_exists = User.objects.get(email=email)
                    if not user_exists.is_active:
                        raise serializers.ValidationError('User account is disabled.')
                    else:
                        raise serializers.ValidationError('Invalid password.')
                except User.DoesNotExist:
                    raise serializers.ValidationError('User with this email does not exist.')

            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')

            # Update device token if provided
            if device_token:
                user.device_token = device_token
                user.device_type = device_type
                user.save(update_fields=['device_token', 'device_type'])

            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        return attrs


class LogoutSerializer(serializers.Serializer):
    """
    Logout serializer for clearing device tokens
    """
    refresh_token = serializers.CharField(required=False)
    
    def validate(self, attrs):
        """
        Validate logout request
        """
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request
    """
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """
        Validate that user exists
        """
        try:
            user = User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            # Don't reveal that user doesn't exist for security
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation
    """
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True)

    def validate(self, attrs):
        """
        Validate password reset token and new password
        """
        if attrs.get('new_password') != attrs.get('new_password_confirm'):
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs
