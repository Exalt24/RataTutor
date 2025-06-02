from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import smart_bytes
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from ..serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer

User = get_user_model()


class PasswordResetRequestView(APIView):
    """
    POST /accounts/password-reset/
    {
      "email": "user@example.com"
    }
    """
    permission_classes = []  # Allow any

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.get(email__iexact=email)
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(smart_bytes(user.pk))

        reset_link = f"{settings.FRONTEND_URL}/reset-password-confirm/{uid}/{token}/"

        # -------------- Render HTML email template ----------------
        subject = "Reset Your Password"
        from_email = settings.EMAIL_HOST_USER
        to_email = [user.email]

        # Render the HTML body with the user & reset_link in context
        html_body = render_to_string(
            'accounts/password_reset_email.html',
            {
                'user': user,
                'reset_url': reset_link
            }
        )

        # A plaintext fallback (optional)
        text_body = (
            f"Hello {user.username},\n\n"
            "We received a request to reset the password for your RataTutor account.\n\n"
            "To set a new password, click the link below (valid for 1 hour):\n\n"
            f"{reset_link}\n\n"
            "If you didn’t request a password reset, simply ignore this email. "
            "Your RataTutor account is unchanged.\n\n"
            "Thanks for using RataTutor!\n"
            "— The RataTutor Team\n"
            "Support: support@ratatutor.example.com"
        )

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=from_email,
            to=to_email,
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)
        # ----------------------------------------------------------------

        return Response(
            {
                "detail": "If an account with that email exists, a password reset link has been sent."
            },
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    """
    POST /accounts/password-reset-confirm/
    {
      "uid": "<base64-encoded-uid>",
      "token": "<reset-token>",
      "new_password": "NewPass123!",
      "confirm_password": "NewPass123!"
    }
    """
    permission_classes = []  # Allow any

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        new_password = serializer.validated_data["new_password"]

        # Set the new password and save
        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)