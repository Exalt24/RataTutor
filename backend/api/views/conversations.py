from .imports import generics, status, Response, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated

from ..models import AIConversation
from ..serializers import AIConversationSerializer
from api.services.ai_service import (
    generate_ai_response_for_material,
    generate_ai_response,
)

# ✅ CREATE View
class CreateConversationView(generics.CreateAPIView):
    """
    POST /api/conversations/create/
    {
      "material": <id>,
      "last_user_message": "<initial prompt>"
    }
    """
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]  # 🔐 Requires auth

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ✅ CHAT View
class ConversationChatView(generics.GenericAPIView):
    """
    POST /api/conversations/{pk}/chat/
    {
      "prompt": "<user’s message to AI>"
    }
    """
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        conv = get_object_or_404(AIConversation, pk=pk)

        # 🔐 Only allow chat if user owns the conversation
        if conv.user != request.user:
            return Response({"error": "Not your conversation."}, status=status.HTTP_403_FORBIDDEN)

        prompt = request.data.get("prompt", "").strip()
        if not prompt:
            return Response({"error": "Missing prompt"}, status=status.HTTP_400_BAD_REQUEST)

        # 1) Save the user’s message
        conv.last_user_message = prompt
        conv.addToMessage()

        # 2) Get AI reply (with or without attachments)
        material = conv.material
        try:
            if material and material.attachments.exists():
                ai_reply = generate_ai_response_for_material(material, prompt)
            else:
                ai_reply = generate_ai_response(prompt)
        except Exception as e:
            return Response(
                {"error": f"AI service failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3) Append AI reply
        assistant_msg = {
            "role": "assistant",
            "content": ai_reply,
            "timestamp": timezone.now().isoformat()
        }
        msgs = conv.messages if isinstance(conv.messages, list) else []
        msgs.append(assistant_msg)
        conv.messages = msgs
        conv.context += f"\n assistant: {assistant_msg['content']}"
        conv.save()
       

        # 4) Return response
        return Response({
            "user_message": prompt,
            "ai_response": ai_reply,
            "messages": conv.messages
        }, status=status.HTTP_200_OK)


# ✅ RETRIEVE View
class RetrieveConversationView(generics.RetrieveAPIView):
    """
    GET /api/conversations/{pk}/
    Returns the full AIConversation, including its messages array.
    """
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied("You do not have permission to view this conversation.")
        return obj
