from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

USERNAME_REGEX = r'^[\w.@+-]{3,}$'  # at least 3 chars, no spaces
EMAIL_REGEX    = r'^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}(?:\.[A-Za-z]{2,})?$'
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
            RegexValidator(
                regex=EMAIL_REGEX,
                message='Enter a valid email address.'
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
        error_messages={'required': 'Please confirm your password.'}
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password')

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': ['Passwords do not match.']})
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
