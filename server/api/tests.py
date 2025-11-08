from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from .models import UserNotification, KidsCertificate, KidsAchievement


class NotificationIntegrationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='learner', email='learner@example.com', password='password123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_certificate_issue_creates_notification(self):
        url = reverse('kids-issue-certificate')
        payload = {
            'cert_id': 'story-time',
            'title': 'Story Time Champion',
            'file_url': 'https://example.com/certificates/story-time.pdf',
        }

        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(KidsCertificate.objects.filter(user=self.user, cert_id='story-time').exists())

        notification = UserNotification.objects.get(user=self.user, event_key='certificate:story-time')
        self.assertEqual(notification.notification_type, 'certificate')
        self.assertIn('Story Time Champion', notification.title)
        self.assertEqual(notification.metadata.get('cert_id'), 'story-time')

    def test_achievement_unlock_creates_notification(self):
        url = reverse('sync-upsert')
        payload = {
            'entity_type': 'KidsAchievement',
            'operation': 'update',
            'data': {
                'name': 'Story Master',
                'icon': '📚',
                'progress': 100,
                'unlocked': True,
            },
        }

        response = self.client.post(url, payload, format='json')

        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED))
        self.assertTrue(KidsAchievement.objects.filter(user=self.user, name='Story Master', unlocked=True).exists())

        notification = UserNotification.objects.get(user=self.user, event_key='achievement:story-master')
        self.assertEqual(notification.notification_type, 'achievement')
        self.assertIn('Story Master', notification.title)
        self.assertEqual(notification.metadata.get('name'), 'Story Master')
