from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create a test user if not exists'

    def handle(self, *args, **options):
        username = 'testuser'
        email = 'testuser@gmail.com'
        password = 't@st12345'

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"User '{username}' already exists."))
            return

        User.objects.create_user(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"User '{username}' created successfully."))
