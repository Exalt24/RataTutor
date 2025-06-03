from django.urls import path
from .views import RegisterView, LoginView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView, UpdateProfileView, GetProfileView
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'accounts'
urlpatterns = [
    path('register/',        RegisterView.as_view(),              name='auth-register'),
    path('login/',           LoginView.as_view(),                 name='auth-login'),
    path('logout/',          LogoutView.as_view(),                name='auth-logout'),
    path('refresh/',         TokenRefreshView.as_view(),          name='token_refresh'),
    path('password-reset/',          PasswordResetRequestView.as_view(),  name='password_reset'),
    path('password-reset-confirm/',  PasswordResetConfirmView.as_view(),  name='password_reset_confirm'),
    path('profile-update/', UpdateProfileView.as_view(), name='profile-update'),
    path('profile/', GetProfileView.as_view(), name='get-profile'),
]
