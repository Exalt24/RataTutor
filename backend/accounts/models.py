from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from datetime import timedelta

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
    
    count = models.PositiveIntegerField(default=0)  # Current streak count
    longest_streak = models.PositiveIntegerField(default=0)  # Longest streak
    total_days = models.PositiveIntegerField(default=0)  # Total days active
    last_activity_date = models.DateField(null=True, blank=True)  # Last day with meaningful activity
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def record_activity(self):
        """Record a meaningful study activity and update streak if needed."""
        today = now().date()
        
        # If already recorded activity today, no need to update
        if self.last_activity_date == today:
            return False  # No streak change
        
        # Calculate days since last activity
        if self.last_activity_date is None:
            # First time activity
            self.count = 1
            self.total_days = 1
        else:
            days_since_last = (today - self.last_activity_date).days
            
            if days_since_last == 1:
                # Consecutive day - increment streak
                self.count += 1
                self.total_days += 1
            elif days_since_last > 1:
                # Streak broken - reset to 1
                self.count = 1
                self.total_days += 1
            # days_since_last == 0 shouldn't happen due to check above
        
        # Update longest streak if current is longer
        self.longest_streak = max(self.longest_streak, self.count)
        
        # Update last activity date
        self.last_activity_date = today
        self.save()
        
        return True  # Streak was updated

    def get_streak_status(self):
        """Get current streak status and whether it's at risk."""
        if self.last_activity_date is None:
            return {
                'current_streak': 0,
                'is_active': False,
                'is_at_risk': False,
                'days_since_activity': None
            }
        
        today = now().date()
        days_since = (today - self.last_activity_date).days
        
        if days_since == 0:
            # Active today
            return {
                'current_streak': self.count,
                'is_active': True,
                'is_at_risk': False,
                'days_since_activity': 0
            }
        elif days_since == 1:
            # At risk - haven't done anything today but streak not broken yet
            return {
                'current_streak': self.count,
                'is_active': True,
                'is_at_risk': True,
                'days_since_activity': 1
            }
        else:
            # Streak broken
            return {
                'current_streak': 0,
                'is_active': False,
                'is_at_risk': False,
                'days_since_activity': days_since
            }

    def __str__(self):
        return f"{self.profile.user.username} - Current: {self.count} | Longest: {self.longest_streak} | Days Active: {self.total_days}"