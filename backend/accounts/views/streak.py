from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Streak, UserProfile

class UpdateStreakView(APIView):
    """
    POST /streak/update/
    Updates the user's streak based on the last activity date.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        streak, _ = Streak.objects.get_or_create(profile=profile)

        streak.update_streak()

        return Response({
            "message": "Streak updated successfully.",
            "count": streak.count,
            "longest_streak": streak.longest_streak,
            "total_days": streak.total_days,
            "last_updated": streak.last_updated
        })


class ResetStreakView(APIView):
    """
    POST /streak/reset/
    Resets the user's streak to 0 manually.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile = request.user.profile
            streak = profile.streak
            streak.reset_streak()

            return Response({
                "message": "Streak has been reset.",
                "count": streak.count,
                "last_updated": streak.last_updated
            })
        except (UserProfile.DoesNotExist, Streak.DoesNotExist):
            return Response({"detail": "Streak not found."}, status=404)
