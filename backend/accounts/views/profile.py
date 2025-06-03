from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from ..serializers import UpdateProfileByEmailSerializer,  UpdateProfileSerializer
from rest_framework.permissions import IsAuthenticated


User = get_user_model()

class GetProfileView(APIView):
    """
    GET /accounts/profile/
    
    Response:
    {
        "username": "john_doe",
        "email": "john@example.com",
        "full_name": "John Doe",
        "bio": "Hello world!",
        "avatar": "http://localhost:8000/media/avatars/john_doe_avatar.png"
    }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        return Response({
            "username": user.username,
            "email": user.email,
            "full_name": profile.full_name if profile else "",
            "bio": profile.bio if profile else "",
            "avatar": request.build_absolute_uri(profile.avatar.url) if profile and profile.avatar else None
        })


class UpdateProfileView(APIView):
    """
    POST /accounts/profile-update/
    {
        "username": "newusername",
        "email": "newemail@example.com",
        "full_name": "John Doe",
        "bio": "Hello world!",
        "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UpdateProfileSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.update_profile(serializer.validated_data)
        return Response({"detail": "Profile updated successfully."})


class UpdateProfileByEmailView(APIView):
    """
    POST /accounts/profile-update/
    {
        "email": "user@example.com",
        "new_email": "newemail@example.com",
        "username": "newusername",
        "full_name": "John Doe",
        "bio": "Hello world!",
        "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
    }
    """
    permission_classes = []  # Adjust if needed

    def post(self, request):
        serializer = UpdateProfileByEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Run the update logic from the serializer
        result = serializer.update_profile()

        return Response(
            {
                "detail": result["message"],
                "user": result["user"],
                "profile": result["profile"]
            },
            status=status.HTTP_200_OK
        )