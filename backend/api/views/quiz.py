from .imports import viewsets
from ..models import Quiz, QuizQuestion
from ..serializers import QuizSerializer, QuizQuestionSerializer

class QuizViewSet(viewsets.ModelViewSet):
    """
    CRUD for Quiz. Nested questions are read‐only inside the Quiz endpoint;
    to create/edit questions, use QuizQuestionViewSet.
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


class QuizQuestionViewSet(viewsets.ModelViewSet):
    """
    CRUD for individual QuizQuestion. Each question must reference a Quiz.
    """
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
