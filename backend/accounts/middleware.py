from datetime import datetime
from django.utils.timezone import make_aware

class UpdateLastActivityMiddleware:
    """
    Middleware to update the user's last activity time on each request.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            user = request.user
            user.last_login = make_aware(datetime.now())  # Set the last login to the current time
            user.save()

            # After updating last_login, update the streak based on last login
            user.profile.streak.update_streak()  # Call the streak update logic

        response = self.get_response(request)
        return response
