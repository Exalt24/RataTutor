import random
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, Streak
from .serializers import UserProfileSerializer, StreakSerializer

FIRST_NAMES = [
    "Alex", "Jamie", "Taylor", "Morgan", "Casey",
    "Riley", "Jordan", "Drew", "Cameron", "Quinn",
]

LAST_NAMES = [
    "Smith", "Johnson", "Lee", "Brown", "Williams",
    "Jones", "Garcia", "Davis", "Martinez", "Wilson",
]

def generate_random_full_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Create the UserProfile instance
        user_profile = UserProfile.objects.create(
            user=instance,
            full_name=generate_random_full_name(),
        )

        # Create Streak instance for the newly created UserProfile
        streak = Streak.objects.create(profile=user_profile)

        # Immediately update the streak based on the last activity (last_login)
        streak.update_streak()  # This will set the streak to 1 since it's the first activity
