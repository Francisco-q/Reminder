"""
User models - Custom user with profile information
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from apps.core.models import BaseModel


class User(AbstractUser):
    """
    Custom user model extending AbstractUser
    """
    # Override email to be unique and required
    email = models.EmailField(_('Email address'), unique=True)
    
    # Additional fields
    phone_number = models.CharField(
        _('Phone number'),
        max_length=15,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message=_('Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.')
            )
        ]
    )
    
    # Profile fields
    date_of_birth = models.DateField(_('Date of birth'), null=True, blank=True)
    timezone = models.CharField(_('Timezone'), max_length=50, default='America/Mexico_City')
    language = models.CharField(_('Language'), max_length=10, default='es')
    
    # Notification preferences
    email_notifications = models.BooleanField(_('Email notifications'), default=True)
    push_notifications = models.BooleanField(_('Push notifications'), default=True)
    sms_notifications = models.BooleanField(_('SMS notifications'), default=False)
    
    # Privacy settings
    is_profile_public = models.BooleanField(_('Public profile'), default=False)
    
    # Device token for push notifications
    device_token = models.TextField(_('Device token'), blank=True)
    device_type = models.CharField(
        _('Device type'),
        max_length=10,
        choices=[
            ('android', 'Android'),
            ('ios', 'iOS'),
            ('web', 'Web')
        ],
        default='android'
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('Created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated at'), auto_now=True)
    last_active = models.DateTimeField(_('Last active'), null=True, blank=True)
    
    # Use email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        """Return full name or email if names are not set"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email
    
    def update_last_active(self):
        """Update last active timestamp"""
        from django.utils import timezone
        self.last_active = timezone.now()
        self.save(update_fields=['last_active'])


class UserProfile(BaseModel):
    """
    Extended user profile with medical information
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    
    # Medical information
    weight = models.DecimalField(
        _('Weight (kg)'), 
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    height = models.DecimalField(
        _('Height (cm)'), 
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    blood_type = models.CharField(
        _('Blood type'),
        max_length=3,
        choices=[
            ('A+', 'A+'), ('A-', 'A-'),
            ('B+', 'B+'), ('B-', 'B-'),
            ('AB+', 'AB+'), ('AB-', 'AB-'),
            ('O+', 'O+'), ('O-', 'O-'),
        ],
        blank=True
    )
    
    # Emergency contact
    emergency_contact_name = models.CharField(
        _('Emergency contact name'), 
        max_length=100, 
        blank=True
    )
    emergency_contact_phone = models.CharField(
        _('Emergency contact phone'), 
        max_length=15, 
        blank=True
    )
    emergency_contact_relationship = models.CharField(
        _('Relationship'), 
        max_length=50, 
        blank=True
    )
    
    # Medical conditions and allergies
    medical_conditions = models.TextField(
        _('Medical conditions'), 
        blank=True,
        help_text=_('List any chronic conditions, illnesses, or medical notes')
    )
    allergies = models.TextField(
        _('Allergies'), 
        blank=True,
        help_text=_('List any known allergies or adverse reactions')
    )
    
    # Preferences
    preferred_notification_time = models.TimeField(
        _('Preferred notification time'), 
        null=True, 
        blank=True,
        help_text=_('Default time for medication reminders')
    )
    reminder_advance_minutes = models.PositiveIntegerField(
        _('Reminder advance (minutes)'),
        default=0,
        help_text=_('Minutes before medication time to send reminder')
    )
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = _('User Profile')
        verbose_name_plural = _('User Profiles')
    
    def __str__(self):
        return f"{self.user.email} - Profile"
