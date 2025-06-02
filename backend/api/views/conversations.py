from .imports import generics, status, Response, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ..models import AIConversation
from ..serializers import AIConversationSerializer
from api.services.ai_service import generate_ai_response


class CreateConversationView(generics.CreateAPIView):
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer


class ConversationChatView(generics.GenericAPIView):
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request, pk=None):
        conv = get_object_or_404(AIConversation, pk=pk)
        prompt = request.data.get("prompt", "").strip()
        if not prompt:
            return Response({"error": "Missing prompt"}, status=status.HTTP_400_BAD_REQUEST)

        # Append user's message
        conv.last_user_message = prompt
        conv.save()

        # Call AI service
        try:
            ai_reply = generate_ai_response(prompt)
        except Exception as e:
            return Response(
                {"error": f"AI service failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Append assistant's reply
        assistant_msg = {
            "role": "assistant",
            "content": ai_reply,
            "timestamp": timezone.now().isoformat()
        }
        msgs = conv.messages if isinstance(conv.messages, list) else []
        msgs.append(assistant_msg)
        conv.messages = msgs
        conv.save()

        return Response({
            "user_message": prompt,
            "ai_response": ai_reply,
            "messages": conv.messages
        }, status=status.HTTP_200_OK)


class RetrieveConversationView(generics.RetrieveAPIView):
    queryset = AIConversation.objects.all()
    serializer_class = AIConversationSerializer
