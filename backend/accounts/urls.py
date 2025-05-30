from django.urls import path
from .views import RegisterView, LoginView, LogoutView
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'accounts'
urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/',    LoginView.as_view(),    name='auth-login'),
    path('logout/',   LogoutView.as_view(),   name='auth-logout'),
    path('refresh/',  TokenRefreshView.as_view(), name='token_refresh'),
]
