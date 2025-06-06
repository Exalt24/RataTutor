from .imports import APIView, Response, status, IsAuthenticated
from ..models import Streak
from ..models import UserProfile, Streak

class RecordActivityView(APIView):
    """
    POST /accounts/record-activity/
    Record a meaningful study activity for streak tracking.
    Call this when user completes study activities like:
    - Studying flashcards
    - Taking a quiz
    - Creating study materials
    - Generating AI content
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            streak, _ = Streak.objects.get_or_create(profile=profile)
            
            # Record the activity
            streak_updated = streak.record_activity()
            
            # Get current streak status
            status_info = streak.get_streak_status()
            
            return Response({
                'success': True,
                'streak_updated': streak_updated,
                'streak': {
                    'count': streak.count,
                    'longest_streak': streak.longest_streak,
                    'total_days': streak.total_days,
                    'last_activity_date': streak.last_activity_date,
                    'status': status_info
                }
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to record activity: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GetStreakStatusView(APIView):
    """
    GET /accounts/streak-status/
    Returns the current streak information for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            streak, _ = Streak.objects.get_or_create(profile=profile)
            
            status_info = streak.get_streak_status()
            
            return Response({
                'streak': {
                    'count': streak.count,
                    'longest_streak': streak.longest_streak,
                    'total_days': streak.total_days,
                    'last_activity_date': streak.last_activity_date,
                    'status': status_info
                }
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get streak status: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )