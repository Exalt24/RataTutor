from django.urls import path
from .views import RegisterView, LogoutView, PasswordResetRequestView, PasswordResetConfirmView, UpdateProfileView, GetProfileView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

app_name = 'accounts'
urlpatterns = [
    path('register/',        RegisterView.as_view(),              name='auth-register'),
    path('logout/',          LogoutView.as_view(),                name='auth-logout'),
    
    # JWT Token endpoints
    path('token/',           TokenObtainPairView.as_view(),       name='token_obtain_pair'),
    path('refresh/',         TokenRefreshView.as_view(),          name='token_refresh'),
    
    # Password reset
    path('password-reset/',          PasswordResetRequestView.as_view(),  name='password_reset'),
    path('password-reset-confirm/',  PasswordResetConfirmView.as_view(),  name='password_reset_confirm'),
    
    # Profile endpoints  
    path('profile-update/', UpdateProfileView.as_view(), name='profile-update'),
    path('profile/', GetProfileView.as_view(), name='get-profile')
]