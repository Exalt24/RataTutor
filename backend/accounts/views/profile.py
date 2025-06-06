from .imports import APIView, Response, status
from django.contrib.auth import get_user_model
from ..serializers import UpdateProfileSerializer, UserProfileSerializer, StreakSerializer
from rest_framework.permissions import IsAuthenticated
from ..models import UserProfile, Streak

User = get_user_model()

class GetProfileView(APIView):
    """
    GET /accounts/profile/
    Returns the user's profile info including avatar string.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            streak, _ = Streak.objects.get_or_create(profile=profile)
            serializer = UserProfileSerializer(profile)
            
            # Adding streak data to the serialized profile
            profile_data = serializer.data
            profile_data['streak'] = StreakSerializer(streak).data
            
            return Response(profile_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to fetch profile", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UpdateProfileView(APIView):
    """
    PATCH /accounts/profile-update/  # ✅ Changed to PATCH (more semantic for updates)
    {
        "username": "newusername",
        "email": "newemail@example.com", 
        "full_name": "John Doe",
        "bio": "Hello world!",
        "avatar": "avatar1.png"
    }
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):  # ✅ Changed from POST to PATCH
        try:
            # ✅ Pass request context for proper validation
            serializer = UpdateProfileSerializer(
                data=request.data, 
                context={'request': request}
            )
            
            # ✅ Better error handling - don't raise exception immediately
            if not serializer.is_valid():
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            data = serializer.validated_data
            user = request.user
            profile, _ = UserProfile.objects.get_or_create(user=user)

            # ✅ Update user fields safely
            user.username = data.get('username', user.username)
            user.email = data.get('email', user.email)
            user.save()

            # ✅ Update profile fields safely  
            profile.full_name = data.get('full_name', profile.full_name)
            profile.bio = data.get('bio', profile.bio)

            avatar_value = data.get('avatar')
            if avatar_value is not None:
                profile.avatar = avatar_value
            profile.save()

            # ✅ Record streak activity when profile is updated (optional)
            try:
                streak, _ = Streak.objects.get_or_create(profile=profile)
                streak.record_activity()  # This counts as meaningful activity
            except Exception as streak_error:
                # Don't fail the whole request if streak update fails
                print(f"Warning: Failed to update streak: {streak_error}")

            return Response(
                {"detail": "Profile updated successfully."}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            # ✅ Handle unexpected errors gracefully
            return Response(
                {"error": "Failed to update profile", "details": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # ✅ BONUS: Also support POST for backward compatibility if needed
    def post(self, request):
        """Backward compatibility - redirect to PATCH"""
        return self.patch(request)