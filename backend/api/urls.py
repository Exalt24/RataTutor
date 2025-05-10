from django.urls import path
from .views import PingView, OpenRouterChatView

app_name = 'api'
urlpatterns = [
    path('ping/', PingView.as_view(), name='ping'),
    path('chat/openrouter/', OpenRouterChatView.as_view(), name='openrouter-chat'),
]