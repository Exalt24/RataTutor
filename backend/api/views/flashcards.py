from .imports import viewsets
from ..models import Flashcard
from ..serializers import FlashcardSerializer

class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
