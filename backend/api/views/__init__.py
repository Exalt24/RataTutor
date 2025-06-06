from .conversations import (
    CreateConversationView, 
    ConversationChatView, 
    RetrieveConversationView, 
    GetOrCreateConversationView,
    ConversationListView,
    ConversationDeleteView,
    ConversationSummaryView,
    FlashcardGenerationView,
    NoteGenerationView,
    QuizGenerationView,
)

from .material import MaterialViewSet
from .note import NoteViewSet
from .flashcard import FlashcardSetViewSet, FlashcardViewSet 
from .attachment import AttachmentUploadView, AttachmentViewSet
from .quiz import QuizViewSet, QuizQuestionViewSet
from .copy_material import CopyMaterialView


__all__ = [
    # Conversation views
    "CreateConversationView", 
    "ConversationChatView", 
    "RetrieveConversationView", 
    "GetOrCreateConversationView",
    "ConversationListView",
    "ConversationDeleteView", 
    "ConversationSummaryView",
    
    # Generation views
    "FlashcardGenerationView",
    "NoteGenerationView", 
    "QuizGenerationView",
    
    # Material views
    "MaterialViewSet",
    "CopyMaterialView",
    
    # Content views
    "NoteViewSet",
    "FlashcardSetViewSet",
    "FlashcardViewSet", 
    "QuizViewSet", 
    "QuizQuestionViewSet",
    
    # Attachment views
    "AttachmentUploadView",
    "AttachmentViewSet",
]