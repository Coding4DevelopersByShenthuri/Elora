from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_add_adults_features'),
    ]

    operations = [
        migrations.AddField(
            model_name='dictionaryentry',
            name='tamil_translations',
            field=models.JSONField(blank=True, default=list, help_text='Cached Tamil meanings for the word'),
        ),
    ]

