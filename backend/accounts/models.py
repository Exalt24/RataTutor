from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now

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
    

class Streak(models.Model):
    profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='streak')

    count = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    total_days = models.PositiveIntegerField(default=0)

    last_updated = models.DateField(default=now)

    def update_streak(self):
        today = now().date()
        delta = (today - self.last_updated).days

        if delta == 0:
            return  # already updated today

        if delta == 1:
            self.count += 1
        else:
            self.count = 1  # streak broken
        self.last_updated = today
        self.total_days += 1  # ✅ count every valid streak update
        self.longest_streak = max(self.longest_streak, self.count)

        self.save()

    def reset_streak(self):
        self.count = 0
        self.last_updated = now().date()
        self.save()

    def __str__(self):
        return f"{self.profile.user.username} - Current: {self.count} | Longest: {self.longest_streak} | Days Learned: {self.total_days}"
