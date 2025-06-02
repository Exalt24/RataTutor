from .imports import generics, status, Response, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.utils import timezone

from ..models import AIConversation
from ..serializers import AIConversationSerializer
from api.services.ai_service import (
    generate_ai_response_for_material,
    generate_ai_response,
)

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


class ConversationChatView(generics.GenericAPIView):
    """
    POST /api/conversations/{pk}/chat/
    {
      "prompt": "<user’s message to AI>"
    }

    - If the related Material has ≥1 attachment, send ALL attachments’ text + prompt.
    - Otherwise, send only the prompt.
    """
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request, pk=None):
        conv = get_object_or_404(AIConversation, pk=pk)
        prompt = request.data.get("prompt", "").strip()
        if not prompt:
            return Response({"error": "Missing prompt"}, status=status.HTTP_400_BAD_REQUEST)

        # 1) Save the user’s message in the conversation
        conv.last_user_message = prompt
        conv.save()

        # 2) Decide: attachments vs plain text
        material = conv.material
        try:
            if material.attachments.exists():
                # Use ALL attachments’ text + prompt
                ai_reply = generate_ai_response_for_material(material, prompt)
            else:
                # No attachments → just send the prompt
                ai_reply = generate_ai_response(prompt)
        except Exception as e:
            return Response(
                {"error": f"AI service failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3) Append the assistant’s reply to messages
        assistant_msg = {
            "role": "assistant",
            "content": ai_reply,
            "timestamp": timezone.now().isoformat()
        }
        msgs = conv.messages if isinstance(conv.messages, list) else []
        msgs.append(assistant_msg)
        conv.messages = msgs
        conv.save()

        # 4) Return the updated conversation
        return Response({
            "user_message": prompt,
            "ai_response": ai_reply,
            "messages": conv.messages
        }, status=status.HTTP_200_OK)


class RetrieveConversationView(generics.RetrieveAPIView):
    """
    GET /api/conversations/{pk}/
    Returns the full AIConversation, including its messages array.
    """
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
