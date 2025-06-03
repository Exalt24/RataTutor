import random
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile

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
        UserProfile.objects.create(
            user=instance,
            full_name=generate_random_full_name(),
        )
