"""
Core utilities and helper functions
"""
import re
from typing import Dict, List, Any
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class ColorValidator:
    """
    Validator for medication colors
    """
    VALID_COLORS = [
        '#3B82F6',  # Blue
        '#10B981',  # Green
        '#8B5CF6',  # Purple
        '#F59E0B',  # Orange
        '#EC4899',  # Pink
        '#6366F1',  # Indigo
    ]

    @classmethod
    def validate_color(cls, color: str) -> bool:
        """Validate if color is in allowed colors"""
        return color in cls.VALID_COLORS

    @classmethod
    def get_random_color(cls) -> str:
        """Get a random color from valid colors"""
        import random
        return random.choice(cls.VALID_COLORS)


class TimeValidator:
    """
    Validator for time formats
    """
    TIME_PATTERN = re.compile(r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')

    @classmethod
    def validate_time_format(cls, time_str: str) -> bool:
        """Validate time format (HH:MM)"""
        return bool(cls.TIME_PATTERN.match(time_str))

    @classmethod
    def validate_time_list(cls, times: List[str]) -> bool:
        """Validate list of times"""
        return all(cls.validate_time_format(time) for time in times)


class FrequencyValidator:
    """
    Validator for medication frequencies
    """
    VALID_FREQUENCIES = [
        'once_daily',
        'twice_daily',
        'three_times_daily',
        'four_times_daily',
        'every_8_hours',
        'every_12_hours',
        'as_needed',
        'custom'
    ]

    @classmethod
    def validate_frequency(cls, frequency: str) -> bool:
        """Validate frequency value"""
        return frequency in cls.VALID_FREQUENCIES


def generate_medication_times(frequency: str) -> List[str]:
    """
    Generate default times based on frequency
    """
    frequency_times = {
        'once_daily': ['08:00'],
        'twice_daily': ['08:00', '20:00'],
        'three_times_daily': ['08:00', '14:00', '20:00'],
        'four_times_daily': ['08:00', '12:00', '16:00', '20:00'],
        'every_8_hours': ['08:00', '16:00', '00:00'],
        'every_12_hours': ['08:00', '20:00'],
        'as_needed': [],
        'custom': []
    }
    return frequency_times.get(frequency, [])


def format_api_error(message: str, code: str = 'error', field: str = None) -> Dict[str, Any]:
    """
    Format API error response
    """
    error_data = {
        'error': {
            'message': message,
            'code': code,
        }
    }
    if field:
        error_data['error']['field'] = field
    
    return error_data


def format_api_success(data: Any, message: str = 'Success') -> Dict[str, Any]:
    """
    Format API success response
    """
    return {
        'success': True,
        'message': message,
        'data': data
    }
