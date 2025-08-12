"""
User serializers - DRF serializers for user management
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information
    """
    class Meta:
        model = UserProfile
        fields = [
            'weight', 'height', 'blood_type',
            'emergency_contact_name', 'emergency_contact_phone', 
            'emergency_contact_relationship',
            'medical_conditions', 'allergies',
            'preferred_notification_time', 'reminder_advance_minutes'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 
            'phone_number', 'date_of_birth', 'timezone', 'language',
            'email_notifications', 'push_notifications', 'sms_notifications',
            'device_token', 'device_type', 'password', 'password_confirm', 'profile'
        ]
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """Create user with profile"""
        password_confirm = validated_data.pop('password_confirm')
        profile_data = validated_data.pop('profile', {})
        
        user = User.objects.create_user(**validated_data)
        
        # Create profile if data provided
        if profile_data:
            UserProfile.objects.create(user=user, **profile_data)
        else:
            UserProfile.objects.create(user=user)
            
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user information (read/update)
    """
    full_name = serializers.ReadOnlyField()
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone_number', 'date_of_birth', 'timezone', 'language',
            'email_notifications', 'push_notifications', 'sms_notifications',
            'device_token', 'device_type', 'is_profile_public',
            'created_at', 'updated_at', 'last_active', 'profile'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'updated_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information
    """
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'phone_number', 
            'date_of_birth', 'timezone', 'language',
            'email_notifications', 'push_notifications', 'sms_notifications',
            'device_token', 'device_type', 'is_profile_public', 'profile'
        ]

    def update(self, instance, validated_data):
        """Update user and profile"""
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create profile
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)

    def validate_current_password(self, value):
        """Validate current password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        """Validate new password confirmation"""
        if attrs.get('new_password') != attrs.get('new_password_confirm'):
            raise serializers.ValidationError({"new_password": "New password fields didn't match."})
        return attrs

    def save(self):
        """Update user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
