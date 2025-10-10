from django.db import models
from django.contrib.auth.models import User


class KidsLesson(models.Model):
    LESSON_TYPES = (
        ("read_aloud", "Read Aloud"),
        ("vocabulary", "Vocabulary"),
        ("pronunciation", "Pronunciation"),
    )

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    lesson_type = models.CharField(max_length=32, choices=LESSON_TYPES)
    payload = models.JSONField(default=dict)  # offline content payload
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.lesson_type})"


class KidsProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    details = models.JSONField(default=dict)  # per-lesson results
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user",)

    def __str__(self):
        return f"KidsProgress(user={self.user_id}, points={self.points})"


class KidsAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=64, blank=True, default="")
    progress = models.IntegerField(default=0)  # 0-100
    unlocked = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "name")

    def __str__(self):
        return f"KidsAchievement(user={self.user_id}, name={self.name})"

# Create your models here.
