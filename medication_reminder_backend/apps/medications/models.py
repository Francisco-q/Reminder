"""
Medication models - Core medication management
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.core.models import BaseModel
from apps.core.utils import ColorValidator, FrequencyValidator, generate_medication_times


class Medication(BaseModel):
    """
    Medication model matching the frontend structure
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='medications',
        verbose_name=_('User')
    )
    
    # Basic medication information
    name = models.CharField(_('Medication name'), max_length=100)
    dosage = models.CharField(_('Dosage'), max_length=50, help_text=_('e.g., 500mg, 2 tablets'))
    
    # Frequency and timing
    frequency = models.CharField(
        _('Frequency'),
        max_length=20,
        choices=[
            ('once_daily', _('Once daily')),
            ('twice_daily', _('Twice daily')),
            ('three_times_daily', _('Three times daily')),
            ('four_times_daily', _('Four times daily')),
            ('every_8_hours', _('Every 8 hours')),
            ('every_12_hours', _('Every 12 hours')),
            ('as_needed', _('As needed')),
            ('custom', _('Custom')),
        ],
        default='once_daily'
    )
    
    # Times as array of strings (HH:MM format)
    times = ArrayField(
        models.TimeField(),
        size=8,  # Maximum 8 times per day
        default=list,
        help_text=_('Scheduled times for taking medication')
    )
    
    # Additional information
    notes = models.TextField(_('Notes'), blank=True, help_text=_('Additional instructions'))
    color = models.CharField(
        _('Color'), 
        max_length=7, 
        help_text=_('Hex color code for UI display')
    )
    
    # Medication details
    medication_type = models.CharField(
        _('Type'),
        max_length=20,
        choices=[
            ('tablet', _('Tablet')),
            ('capsule', _('Capsule')),
            ('liquid', _('Liquid')),
            ('injection', _('Injection')),
            ('cream', _('Cream/Ointment')),
            ('inhaler', _('Inhaler')),
            ('other', _('Other')),
        ],
        default='tablet'
    )
    
    # Medical information
    condition = models.CharField(
        _('Medical condition'), 
        max_length=100, 
        blank=True,
        help_text=_('Condition this medication treats')
    )
    
    # Prescription details
    prescriber = models.CharField(_('Prescribing doctor'), max_length=100, blank=True)
    prescription_date = models.DateField(_('Prescription date'), null=True, blank=True)
    
    # Supply tracking
    total_pills = models.PositiveIntegerField(
        _('Total pills/doses'),
        null=True,
        blank=True,
        help_text=_('Total quantity available')
    )
    remaining_pills = models.PositiveIntegerField(
        _('Remaining pills/doses'),
        null=True,
        blank=True,
        help_text=_('Current remaining quantity')
    )
    
    # Alerts and reminders
    low_stock_alert = models.PositiveIntegerField(
        _('Low stock alert threshold'),
        default=5,
        help_text=_('Alert when remaining pills/doses reach this number')
    )
    
    # Status
    is_active = models.BooleanField(_('Active'), default=True)
    start_date = models.DateField(_('Start date'), null=True, blank=True)
    end_date = models.DateField(_('End date'), null=True, blank=True)
    
    class Meta:
        db_table = 'medications'
        verbose_name = _('Medication')
        verbose_name_plural = _('Medications')
        ordering = ['name', '-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'name']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.dosage} ({self.user.email})"
    
    def save(self, *args, **kwargs):
        """Override save to set default color and times"""
        if not self.color:
            self.color = ColorValidator.get_random_color()
        
        # Generate default times if none provided and frequency is set
        if not self.times and self.frequency != 'custom':
            self.times = generate_medication_times(self.frequency)
        
        super().save(*args, **kwargs)
    
    @property
    def times_as_strings(self):
        """Return times as string list for API compatibility"""
        return [time.strftime('%H:%M') for time in self.times]
    
    @property
    def is_low_stock(self):
        """Check if medication is running low"""
        if self.remaining_pills is None:
            return False
        return self.remaining_pills <= self.low_stock_alert
    
    @property
    def pills_per_dose(self):
        """Extract number of pills per dose from dosage"""
        # Simple extraction - could be enhanced
        import re
        match = re.search(r'(\d+)', self.dosage)
        return int(match.group(1)) if match else 1
    
    def reduce_stock(self, amount=None):
        """Reduce stock when medication is taken"""
        if self.remaining_pills is not None:
            amount = amount or self.pills_per_dose
            self.remaining_pills = max(0, self.remaining_pills - amount)
            self.save(update_fields=['remaining_pills'])


class MedicationHistory(BaseModel):
    """
    History of medication changes for auditing
    """
    medication = models.ForeignKey(
        Medication,
        on_delete=models.CASCADE,
        related_name='history'
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='medication_history'
    )
    
    action = models.CharField(
        _('Action'),
        max_length=20,
        choices=[
            ('created', _('Created')),
            ('updated', _('Updated')),
            ('deactivated', _('Deactivated')),
            ('reactivated', _('Reactivated')),
            ('deleted', _('Deleted')),
        ]
    )
    
    changes = models.JSONField(
        _('Changes'),
        default=dict,
        help_text=_('JSON object with field changes')
    )
    
    notes = models.TextField(_('Notes'), blank=True)
    
    class Meta:
        db_table = 'medication_history'
        verbose_name = _('Medication History')
        verbose_name_plural = _('Medication History')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.medication.name} - {self.action} at {self.created_at}"
