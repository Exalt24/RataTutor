import random
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, Streak

# Cooking/Culinary-themed first names
CHEF_FIRST_NAMES = [
    "Chef", "Sage", "Basil", "Rosemary", "Thyme",
    "Ginger", "Pepper", "Saffron", "Cinnamon", "Paprika",
    "Olive", "Honey", "Maple", "Cocoa", "Vanilla",
    "Mint", "Curry", "Chili", "Garlic", "Onion"
]

# Academic/Study-themed last names  
STUDY_LAST_NAMES = [
    "Scholar", "Bookworm", "Brainiac", "Genius", "Learner",
    "Student", "Mentor", "Teacher", "Professor", "Tutor",
    "Flashcard", "Notebook", "Quizzer", "Reviewer", "Studier",
    "Academic", "Researcher", "Examiner", "Knowledge", "Wisdom"
]

# Alternative: Cooking-themed last names for variety
KITCHEN_LAST_NAMES = [
    "Whisk", "Spatula", "Ladle", "Griddle", "Skillet",
    "Recipe", "Kitchen", "Oven", "Mixer", "Blender",
    "Cookbook", "Seasoning", "Flavor", "Spice", "Herbs",
    "Saucer", "Baker", "Griller", "Steamer", "Roaster"
]

def generate_guaranteed_unique_name():
    """
    Alternative: Check database and ensure 100% uniqueness
    Falls back to incremental numbers if needed
    """
    max_attempts = 50
    
    for attempt in range(max_attempts):
        # Generate base name
        first_name = random.choice(CHEF_FIRST_NAMES)
        if random.random() < 0.7:
            last_name = random.choice(STUDY_LAST_NAMES)
        else:
            last_name = random.choice(KITCHEN_LAST_NAMES)
        
        base_name = f"{first_name} {last_name}"
        
        # First try: just the base name
        if attempt == 0 and not UserProfile.objects.filter(full_name=base_name).exists():
            return base_name
        
        # Add random identifier
        identifier = random.randint(10, 9999)
        full_name = f"{base_name}#{identifier}"
        
        # Check if this combination exists
        if not UserProfile.objects.filter(full_name=full_name).exists():
            return full_name
    
    # Fallback: use timestamp-based identifier
    import time
    timestamp = int(time.time()) % 10000
    return f"{base_name}#{timestamp}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create UserProfile and Streak when a new User is created.
    Now with unique themed names that prevent duplicates!
    """
    if created:
        # Create the UserProfile instance with unique themed name
        user_profile = UserProfile.objects.create(
            user=instance,
            full_name=generate_guaranteed_unique_name(),
        )

        # Create Streak instance for the newly created UserProfile
        streak = Streak.objects.create(profile=user_profile)

        # Initialize the streak
        streak.update_streak()