from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PingView, OpenRouterChatView
from .views.files import FileViewSet
from .views.notes import NoteViewSet
from .views.flashcards import FlashcardViewSet
from .views.conversations import AIConversationViewSet

app_name = 'api'

# Register ViewSets using DRF Router
router = DefaultRouter()
router.register(r'files', FileViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'flashcards', FlashcardViewSet)
router.register(r'conversations', AIConversationViewSet)

# Add all endpoints to urlpatterns
urlpatterns = [
    path('ping/', PingView.as_view(), name='ping'),
    path('chat/openrouter/', OpenRouterChatView.as_view(), name='openrouter-chat'),
    path('', include(router.urls)),  # This includes all the ViewSets (files, notes, flashcards)
]
