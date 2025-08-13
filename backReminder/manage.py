#!/usr/bin/env python
"""
Medication Reminder - Backend Application
Copyright (C) 2025 Francisco [Tu Apellido/Empresa]. All Rights Reserved.

This software is proprietary and confidential. Unauthorized copying, distribution,
modification, or use of this software is strictly prohibited without prior written
permission from the copyright holder.
"""

"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
