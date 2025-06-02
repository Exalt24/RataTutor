from rest_framework import viewsets
from ..models import AIConversation
from ..serializers import AIConversationSerializer

class AIConversationViewSet(viewsets.ModelViewSet):
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
