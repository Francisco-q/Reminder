"""
SQLite compatibility fields for monitoring app
Temporary solution to enable monitoring with SQLite
"""
from django.db import models
import json


class SQLiteJSONField(models.TextField):
    """JSONField compatible with SQLite"""
    
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('default', dict)
        super().__init__(*args, **kwargs)
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return value
    
    def to_python(self, value):
        if isinstance(value, (dict, list)):
            return value
        if value is None:
            return value
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return value
    
    def get_prep_value(self, value):
        if value is None:
            return value
        return json.dumps(value)


class SQLiteArrayField(models.TextField):
    """ArrayField compatible with SQLite"""
    
    def __init__(self, base_field=None, size=None, **kwargs):
        self.base_field = base_field
        self.size = size
        kwargs.setdefault('default', list)
        super().__init__(**kwargs)
    
    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return []
    
    def to_python(self, value):
        if isinstance(value, list):
            return value
        if value is None:
            return []
        try:
            return json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return []
    
    def get_prep_value(self, value):
        if value is None:
            return json.dumps([])
        if not isinstance(value, list):
            value = [value]
        return json.dumps(value)
