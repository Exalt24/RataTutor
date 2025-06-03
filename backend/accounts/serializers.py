from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.validators import RegexValidator
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode
import base64
from .models import UserProfile

User = get_user_model()

USERNAME_REGEX = r'^[\w.@+-]{3,}$'
PASSWORD_REGEX = r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        min_length=3,
        trim_whitespace=True,
        allow_blank=False,
        validators=[
            RegexValidator(
                regex=USERNAME_REGEX,
                message=(
                    "Username must be ≥3 chars and can only contain "
                    "letters, numbers, and @/./+/-/_ (no spaces)."
                )
            ),
            UniqueValidator(
                queryset=User.objects.all(),
                message="That username is already taken."
            )
        ],
        error_messages={
            'blank': 'Username cannot be blank or just spaces.',
            'min_length': 'Username must be at least 3 characters.',
            'required': 'Username is required.',
        }
    )

    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="That email is already registered."
            )
        ],
        error_messages={'required': 'Email is required.'}
    )

    password = serializers.CharField(
        write_only=True,
        validators=[
            RegexValidator(
                regex=PASSWORD_REGEX,
                message='Password must be ≥8 chars, include a letter, number, and special char.'
            )
        ],
        error_messages={'required': 'Password is required.'}
    )

    confirm_password = serializers.CharField(
        write_only=True,
        error_messages={'required': 'Confirm password is required.'}
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password')

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError('Passwords do not match.')
        if data.get('username') == data.get('email'):
            raise serializers.ValidationError('Username cannot be the same as email.')
        if data.get('username') == data.get('password'):
            raise serializers.ValidationError('Username cannot be the same as password.')
        if data.get('email') == data.get('password'):
            raise serializers.ValidationError('Email cannot be the same as password.')
        if data.get('username') == data.get('confirm_password'):
            raise serializers.ValidationError('Username cannot be the same as confirm password.')
        if data.get('email') == data.get('confirm_password'):
            raise serializers.ValidationError('Email cannot be the same as confirm password.')
        if User.objects.filter(username=data.get('username')).exists():
            raise serializers.ValidationError('That username is already taken.')
        if User.objects.filter(email__iexact=data.get('email')).exists():
            raise serializers.ValidationError('That email is already registered.')
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        trim_whitespace=True,
        allow_blank=False,
        error_messages={
            'blank': 'Username cannot be blank.',
            'required': 'Username is required.'
        }
    )
    password = serializers.CharField(
        write_only=True,
        error_messages={'required': 'Password is required.'}
    )

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError('Invalid username or password.')
        tokens = RefreshToken.for_user(user)
        return {'refresh': str(tokens), 'access': str(tokens.access_token)}


class TokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(
        write_only=True,
        help_text="The email address of the user requesting a password reset.",
        error_messages={'required': 'Email is required.'}
    )

    def validate_email(self, value):
        """
        Ensure the email is associated with an existing user.
        """
        if not User.objects.filter(email__iexact=value).exists():
            # If you prefer not to reveal that the email isn’t registered,
            # you can skip this check and just return success anyway.
            raise serializers.ValidationError("No account found with that email.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(
        write_only=True,
        help_text="Base64‐encoded user ID from the reset link.",
        error_messages={'required': 'UID is required.'}
    )
    token = serializers.CharField(
        write_only=True,
        help_text="Password reset token from the reset link.",
        error_messages={'required': 'Token is required.'}
    )
    new_password = serializers.CharField(
        write_only=True,
        validators=[RegexValidator(
            regex=PASSWORD_REGEX,
            message='Password must be ≥8 chars, include a letter, number, and special char.'
        )],
        help_text="The new password.",
        error_messages={'required': 'New password is required.'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        help_text="Re‐enter the new password for confirmation.",
        error_messages={'required': 'Confirm password is required.'}
    )

    def validate(self, data):
        """
        - Check that `new_password` and `confirm_password` match.
        - Decode `uid` and verify the `token`.
        """
        new_pw = data.get("new_password", "")
        confirm_pw = data.get("confirm_password", "")
        if new_pw != confirm_pw:
            raise serializers.ValidationError("Passwords do not match.")

        # Decode the UID to get the user
        try:
            uid_decoded = smart_str(urlsafe_base64_decode(data.get("uid")))
            user = User.objects.get(pk=uid_decoded)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist, DjangoUnicodeDecodeError):
            raise serializers.ValidationError("Invalid UID.")

        # Check token validity (including TTL from settings.PASSWORD_RESET_TIMEOUT)
        token = data.get("token", "")
        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            raise serializers.ValidationError("Invalid or expired token.")

        # Attach user to validated_data so the view can set the password
        data["user"] = user
        return data

class UpdateProfileByEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(
        write_only=True,
        help_text="Current email of the user.",
        error_messages={'required': 'Email is required.'}
    )
    new_email = serializers.EmailField(required=False, help_text="New email to update to.")
    username = serializers.CharField(required=False, max_length=150, help_text="New username.")
    full_name = serializers.CharField(required=False, max_length=255, help_text="Full name of the user.")
    bio = serializers.CharField(required=False, help_text="Bio of the user.")
    avatar = serializers.CharField(required=False, help_text="Base64-encoded image string.")

    def validate_email(self, value):
        if not User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("No account found with that email.")
        return value

    def update_profile(self):
        data = self.validated_data
        email = data.get('email')
        user = User.objects.get(email__iexact=email)

        user.username = data.get('username', user.username)
        user.email = data.get('new_email', user.email)
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.full_name = data.get('full_name', profile.full_name)
        profile.bio = data.get('bio', profile.bio)

        avatar_data = data.get('avatar')
        if avatar_data:
            try:
                format, imgstr = avatar_data.split(';base64,')
                ext = format.split('/')[-1]
                file_name = f"{user.username}_avatar.{ext}"
                profile.avatar.save(file_name, ContentFile(base64.b64decode(imgstr)), save=True)
            except Exception as e:
                raise serializers.ValidationError({"avatar": f"Invalid avatar data: {str(e)}"})

        profile.save()

        return {
            "message": "Profile updated successfully.",
            "user": {
                "username": user.username,
                "email": user.email
            },
            "profile": {
                "full_name": profile.full_name,
                "bio": profile.bio,
                "avatar": profile.avatar.url if profile.avatar else None
            }
        }

class UpdateProfileSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, max_length=150, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    full_name = serializers.CharField(required=False, max_length=255, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True, allow_null=True, help_text="Base64-encoded image string.")

    def update_profile(self, validated_data):
        user = self.context['request'].user
        data = validated_data  # Pass it from the view!

        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.full_name = data.get('full_name', profile.full_name)
        profile.bio = data.get('bio', profile.bio)

        avatar_data = data.get('avatar')
        if avatar_data and isinstance(avatar_data, str) and avatar_data.strip().startswith('data:'):
            try:
                format, imgstr = avatar_data.split(';base64,')
                ext = format.split('/')[-1]
                file_name = f"{user.username}_avatar.{ext}"
                profile.avatar.save(file_name, ContentFile(base64.b64decode(imgstr)), save=True)
            except Exception as e:
                raise serializers.ValidationError({"avatar": f"Invalid avatar data: {str(e)}"})

        profile.save()




    # def update_profile(self):
    #     user = self.context['request'].user
    #     data = self.validated_data

    #     # Update user fields
    #     user.username = data.get('username', user.username)
    #     user.email = data.get('email', user.email)
    #     user.save()

    #     # Update profile
    #     profile, _ = UserProfile.objects.get_or_create(user=user)
    #     profile.full_name = data.get('full_name', profile.full_name)
    #     profile.bio = data.get('bio', profile.bio)

    #     avatar_data = data.get('avatar')
    #     avatar_data = data.get('avatar')
    #     print("Received avatar_data:", repr(avatar_data))
    #     if avatar_data:
    #         avatar_data = avatar_data.strip()
    #         if avatar_data:
    #             try:
    #                 format, imgstr = avatar_data.split(';base64,')
    #                 ext = format.split('/')[-1]
    #                 file_name = f"{user.username}_avatar.{ext}"
    #                 profile.avatar.save(file_name, ContentFile(base64.b64decode(imgstr)), save=True)
    #             except Exception as e:
    #                 raise serializers.ValidationError({"avatar": f"Invalid avatar data: {str(e)}"})

        profile.save()