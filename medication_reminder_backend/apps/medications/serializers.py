"""
Medication serializers - API serialization for medications
"""
from rest_framework import serializers
from django.utils import timezone
from .models import Medication, MedicationHistory
from apps.core.utils import ColorValidator, FrequencyValidator, TimeValidator


class MedicationSerializer(serializers.ModelSerializer):
    """
    Main medication serializer matching frontend interface
    """
    times = serializers.ListField(
        child=serializers.CharField(max_length=5),
        help_text="List of times in HH:MM format"
    )
    times_as_strings = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    pills_per_dose = serializers.ReadOnlyField()
    
    class Meta:
        model = Medication
        fields = [
            'id', 'name', 'dosage', 'frequency', 'times', 'times_as_strings',
            'notes', 'color', 'medication_type', 'condition', 'prescriber',
            'prescription_date', 'total_pills', 'remaining_pills', 
            'low_stock_alert', 'is_low_stock', 'pills_per_dose',
            'is_active', 'start_date', 'end_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_frequency(self, value):
        """Validate frequency value"""
        if not FrequencyValidator.validate_frequency(value):
            raise serializers.ValidationError("Invalid frequency value")
        return value
    
    def validate_color(self, value):
        """Validate color value"""
        if value and not ColorValidator.validate_color(value):
            raise serializers.ValidationError("Invalid color value")
        return value
    
    def validate_times(self, value):
        """Validate times format"""
        if not TimeValidator.validate_time_list(value):
            raise serializers.ValidationError("Invalid time format. Use HH:MM format")
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        frequency = attrs.get('frequency')
        times = attrs.get('times', [])
        
        # Validate times count based on frequency
        expected_counts = {
            'once_daily': 1,
            'twice_daily': 2,
            'three_times_daily': 3,
            'four_times_daily': 4,
            'every_8_hours': 3,
            'every_12_hours': 2,
        }
        
        if frequency in expected_counts and len(times) != expected_counts[frequency]:
            if frequency != 'custom':  # Allow flexibility for custom frequency
                raise serializers.ValidationError({
                    'times': f"Expected {expected_counts[frequency]} times for {frequency}"
                })
        
        # Validate stock numbers
        total_pills = attrs.get('total_pills')
        remaining_pills = attrs.get('remaining_pills')
        
        if total_pills is not None and remaining_pills is not None:
            if remaining_pills > total_pills:
                raise serializers.ValidationError({
                    'remaining_pills': "Cannot exceed total pills"
                })
        
        return attrs
    
    def create(self, validated_data):
        """Create medication with user from request"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def to_representation(self, instance):
        """Convert times to string format for API response"""
        data = super().to_representation(instance)
        
        # Convert time objects to strings
        if instance.times:
            data['times'] = [time.strftime('%H:%M') for time in instance.times]
        
        return data


class MedicationCreateSerializer(MedicationSerializer):
    """
    Serializer for creating medications
    """
    class Meta(MedicationSerializer.Meta):
        fields = [
            'name', 'dosage', 'frequency', 'times', 'notes', 'color',
            'medication_type', 'condition', 'prescriber', 'prescription_date',
            'total_pills', 'remaining_pills', 'low_stock_alert',
            'start_date', 'end_date'
        ]


class MedicationUpdateSerializer(MedicationSerializer):
    """
    Serializer for updating medications
    """
    class Meta(MedicationSerializer.Meta):
        fields = [
            'name', 'dosage', 'frequency', 'times', 'notes', 'color',
            'medication_type', 'condition', 'prescriber', 'prescription_date',
            'total_pills', 'remaining_pills', 'low_stock_alert',
            'is_active', 'start_date', 'end_date'
        ]


class MedicationListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for medication lists
    """
    times_as_strings = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Medication
        fields = [
            'id', 'name', 'dosage', 'frequency', 'times_as_strings',
            'color', 'is_active', 'is_low_stock', 'remaining_pills'
        ]


class MedicationHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for medication history
    """
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = MedicationHistory
        fields = [
            'id', 'medication', 'medication_name', 'user_email',
            'action', 'changes', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MedicationStockUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating medication stock
    """
    action = serializers.ChoiceField(
        choices=[('reduce', 'Reduce'), ('add', 'Add'), ('set', 'Set')],
        required=True
    )
    amount = serializers.IntegerField(min_value=0, required=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        """Validate stock update"""
        action = attrs.get('action')
        amount = attrs.get('amount')
        
        if action == 'reduce' and amount <= 0:
            raise serializers.ValidationError({
                'amount': 'Amount must be positive for reduce action'
            })
        
        return attrs
