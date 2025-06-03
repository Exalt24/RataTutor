from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.CharField(
        max_length=255,
        blank=True,
        help_text="Selected premade avatar identifier or filename."
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"