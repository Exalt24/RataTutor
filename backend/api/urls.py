from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CreateConversationView, ConversationChatView, RetrieveConversationView, FileViewSet, NoteViewSet, FlashcardViewSet

app_name = "api"

router = DefaultRouter()
router.register(r"files", FileViewSet)
router.register(r"notes", NoteViewSet)
router.register(r"flashcards", FlashcardViewSet)

urlpatterns = [
    path(
        "conversations/create/",
        CreateConversationView.as_view(),
        name="conv-create"
    ),

    path(
        "conversations/<int:pk>/chat/",
        ConversationChatView.as_view(),
        name="conv-chat"
    ),

    path(
        "conversations/<int:pk>/",
        RetrieveConversationView.as_view(),
        name="conv-detail"
    ),

    path("", include(router.urls)),
]
