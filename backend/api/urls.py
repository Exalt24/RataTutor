from django.urls import path
from .views import PingView

app_name = 'api'
urlpatterns = [
    path('ping/', PingView.as_view(), name='ping'),
]