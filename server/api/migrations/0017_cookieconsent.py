from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0016_teenprogress_teenvocabularypractice_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='CookieConsent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('consent_id', models.CharField(help_text='Client-generated identifier for this device/session', max_length=64, unique=True)),
                ('accepted', models.BooleanField(default=False)),
                ('functional', models.BooleanField(default=True)),
                ('statistics', models.BooleanField(default=False)),
                ('marketing', models.BooleanField(default=False)),
                ('user_agent', models.CharField(blank=True, default='', help_text='User agent string captured when consent saved', max_length=512)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('accepted_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(blank=True, help_text='Associated user if authenticated when consent given', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cookie_consents', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-updated_at'],
                'indexes': [
                    models.Index(fields=['consent_id'], name='cookie_consent_id_idx'),
                    models.Index(fields=['user', 'updated_at'], name='cookie_consent_usr_idx'),
                ],
            },
        ),
    ]

