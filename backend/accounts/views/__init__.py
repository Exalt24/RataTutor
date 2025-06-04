from .register import RegisterView
from .logout   import LogoutView
from .password_reset import PasswordResetRequestView, PasswordResetConfirmView
from .profile import UpdateProfileView, GetProfileView

__all__ = ["RegisterView","LogoutView", "PasswordResetRequestView", "PasswordResetConfirmView", "UpdateProfileView", "GetProfileView"]