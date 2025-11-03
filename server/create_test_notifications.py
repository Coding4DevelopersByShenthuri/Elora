"""
Script to create test notifications for admin panel
Run this from Django shell: python manage.py shell < create_test_notifications.py
Or use: python manage.py shell, then paste the code
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')
django.setup()

from api.models import AdminNotification
from django.utils import timezone
from datetime import timedelta

# Create test notifications
notifications = [
    {
        'notification_type': 'user_registered',
        'priority': 'normal',
        'title': '✅ New User Registration',
        'message': 'Alice Johnson has just registered on the platform.',
        'link': '/admin/users',
    },
    {
        'notification_type': 'system_alert',
        'priority': 'high',
        'title': '⚠️ System Maintenance Scheduled',
        'message': 'Maintenance window scheduled for tonight at 2:00 AM. Expected downtime: 30 minutes.',
        'link': '/admin/settings',
    },
    {
        'notification_type': 'analytics',
        'priority': 'low',
        'title': '📊 Daily Analytics Report',
        'message': 'Your daily analytics report is ready. 150 active users today, +12% from yesterday.',
    },
    {
        'notification_type': 'security',
        'priority': 'urgent',
        'title': '🚨 Security Alert',
        'message': 'Multiple failed login attempts detected from IP: 192.168.1.100',
        'link': '/admin/users',
    },
]

created_count = 0
for notif_data in notifications:
    notification = AdminNotification.objects.create(
        user=None,  # Global notification for all admins
        **notif_data
    )
    created_count += 1
    print(f"✅ Created: {notification.title}")

print(f"\n🎉 Successfully created {created_count} test notifications!")
print("Now check your admin panel - you should see notifications appear within 30 seconds.")

