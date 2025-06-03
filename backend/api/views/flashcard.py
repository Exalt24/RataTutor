from .imports import viewsets
from ..models import FlashcardSet, Flashcard
from ..serializers import FlashcardSetSerializer, FlashcardSerializer

class FlashcardSetViewSet(viewsets.ModelViewSet):
    """
    CRUD for FlashcardSet (the container holding multiple flashcards).
    """
    queryset = FlashcardSet.objects.all()
    serializer_class = FlashcardSetSerializer


class FlashcardViewSet(viewsets.ModelViewSet):
    """
    CRUD for individual Flashcards. Each Flashcard belongs to one FlashcardSet.
    """
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
