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
    

User = get_user_model()

class Streak(models.Model):
    profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='streak')

    count = models.PositiveIntegerField(default=0)  # Current streak count
    longest_streak = models.PositiveIntegerField(default=0)  # Longest streak
    total_days = models.PositiveIntegerField(default=0)  # Total days active
    last_updated = models.DateField(default=now)  # Date the streak was last updated

    def update_streak(self):
        today = now().date()

        # Use User.last_login for streak calculation (last activity)
        user = self.profile.user

        # Ensure that last_login is not None
        if user.last_login is None:
            return  # No streak update if the user hasn't logged in yet

        last_login_date = user.last_login.date()  # This will give the last login date of the user
        delta = (today - last_login_date).days  # Calculate the number of days since last login

        if delta == 0:
            return  # Already updated today

        if delta == 1:
            # If the user was active the previous day, increment the streak
            self.count += 1
        else:
            # There was a gap, reset the streak
            self.count = 1  # Reset streak, they were inactive for more than 1 day

        self.last_updated = today
        self.total_days += 1  # Increment total days active
        self.longest_streak = max(self.longest_streak, self.count)  # Track the longest streak
        self.save()

    def __str__(self):
        return f"{self.profile.user.username} - Current: {self.count} | Longest: {self.longest_streak} | Days Active: {self.total_days}"
