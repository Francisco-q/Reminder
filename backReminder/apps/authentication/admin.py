"""
Medication Reminder - Authentication Admin Configuration
Copyright (C) 2025 Francisco [Tu Apellido/Empresa]. All Rights Reserved.
"""

from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import GroupAdmin

# Customize the admin site header and title
admin.site.site_header = "Medication Reminder Administration"
admin.site.site_title = "Medication Reminder Admin"
admin.site.index_title = "Welcome to Medication Reminder Administration"

# No specific models to register for authentication app as it only handles views
# User model is registered in apps.users.admin
