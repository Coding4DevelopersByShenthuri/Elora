from django.contrib.auth.models import User
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile

User.objects.filter(username='apitest').delete()
u = User.objects.create_superuser('apitest','api@example.com','pass123')
client = APIClient()
client.force_authenticate(user=u)

payload = {
    'title': 'API Test Video',
    'slug': 'api-test-video',
    'description': 'demo via shell',
    'duration': 120,
    'difficulty': 'beginner',
    'category': 'conversation',
    'rating': 4.5,
    'views': 0,
    'speaking_exercises': 2,
    'tags': '[\"demo\"]',
    'is_active': 'true',
    'order': 0,
}

response = client.post('/api/admin/videos/create', payload, format='multipart')
print('Status:', response.status_code)
print('Response:', response.data)
