from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    MaterialViewSet,
    NoteViewSet,
    FlashcardSetViewSet,
    FlashcardViewSet,
    QuizViewSet,
    QuizQuestionViewSet,
    AttachmentUploadView,
    CopyMaterialView,
    AttachmentViewSet,
    CreateConversationView,
    ConversationChatView,
    RetrieveConversationView,
    ConversationListView,
    GetOrCreateConversationView,
    ConversationDeleteView,
    ConversationSummaryView,
    NoteGenerationView,
    FlashcardGenerationView,
    QuizGenerationView,
)

app_name = "api"

router = DefaultRouter()
router.register(r"materials", MaterialViewSet, basename="material")
router.register(r"notes", NoteViewSet, basename="note")
router.register(r"flashcard-sets", FlashcardSetViewSet, basename="flashcardset")
router.register(r"flashcards", FlashcardViewSet, basename="flashcard")
router.register(r"quizzes", QuizViewSet, basename="quiz")
router.register(r"quiz-questions", QuizQuestionViewSet, basename="quizquestion")
router.register(r"attachments", AttachmentViewSet, basename="attachment")

urlpatterns = [
    # 1) Upload a file into an existing Material
    path(
        "materials/<int:material_id>/upload/",
        AttachmentUploadView.as_view(),
        name="attachment-upload"
    ),

    # ✅ 2) SIMPLIFIED: Conversation Management endpoints (one per material)
    path(
        "conversations/",
        ConversationListView.as_view(),
        name="conversation-list"
    ),
    path(
        "conversations/create/",
        CreateConversationView.as_view(),
        name="conversation-create"
    ),
    path(
        "conversations/<int:pk>/",
        RetrieveConversationView.as_view(),
        name="conversation-detail"
    ),
    path(
        "conversations/<int:pk>/chat/",
        ConversationChatView.as_view(),
        name="conversation-chat"
    ),
    path(
        "conversations/<int:pk>/regenerate-summary/",
        ConversationSummaryView.as_view(),
        name="conversation-regenerate-summary"
    ),
    path(
        "conversations/<int:pk>/delete/",
        ConversationDeleteView.as_view(),
        name="conversation-delete"
    ),

    # 3) AI-powered generation endpoints (now with smart context)
    path(
        "materials/<int:material_id>/generate-notes/",
        NoteGenerationView.as_view(),
        name="generate-notes"
    ),
    path(
        "materials/<int:material_id>/generate-flashcards/",
        FlashcardGenerationView.as_view(),
        name="generate-flashcards"
    ),
    path(
        "materials/<int:material_id>/generate-quiz/",
        QuizGenerationView.as_view(),
        name="generate-quiz"
    ),

    # 4) Copy material
    path(
        "materials/<int:material_id>/copy/",
        CopyMaterialView.as_view(),
        name="material-copy"
    ),

    # ✅ SIMPLIFIED: Get the one conversation for a material
    path(
        "materials/<int:material_id>/conversation/",
        GetOrCreateConversationView.as_view(),
        name="material-conversation"
    ),

    # 5) CRUD routes from router
    path("", include(router.urls)),
]