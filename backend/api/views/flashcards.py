# backend/api/views/flashcards.py

from rest_framework import viewsets
from ..models import Flashcard
from ..serializers import FlashcardSerializer

class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
