"""
Schedule models - Daily medication schedules and progress tracking
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from apps.core.models import BaseModel


class DailySchedule(BaseModel):
    """
    Daily medication schedule - matches frontend DailySchedule interface
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='daily_schedules'
    )
    medication = models.ForeignKey(
        'medications.Medication',
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    
    # Schedule information
    date = models.DateField(_('Schedule date'))
    scheduled_time = models.TimeField(_('Scheduled time'))
    
    # Status tracking
    taken = models.BooleanField(_('Taken'), default=False)
    taken_at = models.DateTimeField(_('Taken at'), null=True, blank=True)
    
    # Additional tracking
    skipped = models.BooleanField(_('Skipped'), default=False)
    skipped_reason = models.CharField(
        _('Skip reason'),
        max_length=50,
        choices=[
            ('forgot', _('Forgot')),
            ('side_effects', _('Side effects')),
            ('feeling_better', _('Feeling better')),
            ('ran_out', _('Ran out of medication')),
            ('other', _('Other')),
        ],
        blank=True
    )
    
    # Notification tracking
    notification_sent = models.BooleanField(_('Notification sent'), default=False)
    notification_sent_at = models.DateTimeField(_('Notification sent at'), null=True, blank=True)
    
    class Meta:
        db_table = 'daily_schedules'
        verbose_name = _('Daily Schedule')
        verbose_name_plural = _('Daily Schedules')
        ordering = ['date', 'scheduled_time']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'date', 'taken']),
            models.Index(fields=['medication', 'date']),
        ]
        unique_together = ['user', 'medication', 'date', 'scheduled_time']
    
    def __str__(self):
        return f"{self.medication.name} at {self.scheduled_time} on {self.date}"
    
    @property
    def is_overdue(self):
        """Check if this schedule is overdue"""
        if self.taken or self.skipped:
            return False
        
        now = timezone.now()
        scheduled_datetime = timezone.make_aware(
            timezone.datetime.combine(self.date, self.scheduled_time)
        )
        return now > scheduled_datetime
    
    @property
    def medication_name(self):
        """Get medication name for API"""
        return self.medication.name
    
    @property
    def medication_id(self):
        """Get medication ID as string for frontend compatibility"""
        return str(self.medication.id)
    
    @property
    def time_string(self):
        """Get time as string in HH:MM format"""
        return self.scheduled_time.strftime('%H:%M')
    
    def mark_taken(self, taken_at=None):
        """Mark schedule as taken"""
        self.taken = True
        self.taken_at = taken_at or timezone.now()
        self.skipped = False
        self.skipped_reason = ''
        self.save(update_fields=['taken', 'taken_at', 'skipped', 'skipped_reason'])
        
        # Reduce medication stock
        self.medication.reduce_stock()
    
    def mark_skipped(self, reason=''):
        """Mark schedule as skipped"""
        self.skipped = True
        self.skipped_reason = reason
        self.taken = False
        self.taken_at = None
        self.save(update_fields=['skipped', 'skipped_reason', 'taken', 'taken_at'])


class WeeklyProgress(BaseModel):
    """
    Weekly progress summary for users
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='weekly_progress'
    )
    
    # Week information
    week_start = models.DateField(_('Week start'))
    week_end = models.DateField(_('Week end'))
    
    # Progress metrics
    total_scheduled = models.PositiveIntegerField(_('Total scheduled'), default=0)
    total_taken = models.PositiveIntegerField(_('Total taken'), default=0)
    total_skipped = models.PositiveIntegerField(_('Total skipped'), default=0)
    total_missed = models.PositiveIntegerField(_('Total missed'), default=0)
    
    # Calculated fields
    adherence_rate = models.DecimalField(
        _('Adherence rate'),
        max_digits=5,
        decimal_places=2,
        default=0.00
    )
    
    class Meta:
        db_table = 'weekly_progress'
        verbose_name = _('Weekly Progress')
        verbose_name_plural = _('Weekly Progress')
        ordering = ['-week_start']
        unique_together = ['user', 'week_start']
    
    def __str__(self):
        return f"Progress for {self.user.email} - Week {self.week_start}"
    
    def calculate_adherence(self):
        """Calculate adherence rate"""
        if self.total_scheduled > 0:
            self.adherence_rate = (self.total_taken / self.total_scheduled) * 100
        else:
            self.adherence_rate = 0.00
        self.save(update_fields=['adherence_rate'])


class MedicationDose(BaseModel):
    """
    Individual dose tracking for detailed analytics
    """
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='medication_doses'
    )
    medication = models.ForeignKey(
        'medications.Medication',
        on_delete=models.CASCADE,
        related_name='doses'
    )
    daily_schedule = models.ForeignKey(
        DailySchedule,
        on_delete=models.CASCADE,
        related_name='doses'
    )
    
    # Dose information
    amount_taken = models.DecimalField(
        _('Amount taken'),
        max_digits=8,
        decimal_places=2,
        help_text=_('Amount of medication taken (e.g., 0.5 for half tablet)')
    )
    
    # Timing
    scheduled_time = models.DateTimeField(_('Scheduled time'))
    actual_time = models.DateTimeField(_('Actual time taken'))
    
    # Additional tracking
    side_effects = models.TextField(_('Side effects'), blank=True)
    effectiveness = models.PositiveIntegerField(
        _('Effectiveness rating'),
        choices=[
            (1, _('Very poor')),
            (2, _('Poor')),
            (3, _('Average')),
            (4, _('Good')),
            (5, _('Excellent')),
        ],
        null=True,
        blank=True
    )
    notes = models.TextField(_('Notes'), blank=True)
    
    class Meta:
        db_table = 'medication_doses'
        verbose_name = _('Medication Dose')
        verbose_name_plural = _('Medication Doses')
        ordering = ['-actual_time']
        indexes = [
            models.Index(fields=['user', 'medication']),
            models.Index(fields=['user', 'actual_time']),
        ]
    
    def __str__(self):
        return f"{self.medication.name} - {self.amount_taken} at {self.actual_time}"
