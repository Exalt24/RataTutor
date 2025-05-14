from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from api.services.ai_service import generate_ai_response

class OpenRouterChatView(APIView):
    permission_classes = []

    def post(self, request):
        prompt = request.data.get("prompt", "").strip()
        if not prompt:
            return Response({"error": "Missing prompt"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            reply = generate_ai_response(prompt)
            return Response({"response": reply})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
