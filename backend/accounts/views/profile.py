from .imports import APIView, Response
from django.contrib.auth import get_user_model
from ..serializers import UpdateProfileSerializer, UserProfileSerializer, StreakSerializer
from rest_framework.permissions import IsAuthenticated
from ..models import UserProfile, Streak

User = get_user_model()

class GetProfileView(APIView):
    """
    GET /accounts/profile/
    Returns the user’s profile info including avatar string.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        streak, _ = Streak.objects.get_or_create(profile=profile)
        serializer = UserProfileSerializer(profile)
        
        # Adding streak data to the serialized profile
        profile_data = serializer.data
        profile_data['streak'] = StreakSerializer(streak).data  # Serialize streak separately
        
        return Response(profile_data)


class UpdateProfileView(APIView):
    """
    POST /accounts/profile-update/
    {
        "username": "newusername",
        "email": "newemail@example.com",
        "full_name": "John Doe",
        "bio": "Hello world!",
        "avatar": "avatar1.png"  # String identifier or URL
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UpdateProfileSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.save()

        profile.full_name = data.get('full_name', profile.full_name)
        profile.bio = data.get('bio', profile.bio)

        avatar_value = data.get('avatar')
        if avatar_value is not None:
            profile.avatar = avatar_value  # Store string directly
        profile.save()

        return Response({"detail": "Profile updated successfully."})