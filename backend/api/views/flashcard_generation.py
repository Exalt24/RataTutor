from .imports import status, serializers, APIView, Response
from django.shortcuts import get_object_or_404

from api.models import Material, FlashcardSet, Flashcard
from api.serializers import FlashcardSetSerializer, FlashcardSerializer
from api.services.ai_service import generate_flashcards_from_material

class FlashcardGenerationSerializer(serializers.Serializer):
    num_cards = serializers.IntegerField(
        min_value=1,
        max_value=20,
        default=5,
        help_text="How many flashcards to generate (1–20)."
    )

class FlashcardGenerationView(APIView):
    def post(self, request, material_id=None):
        material = get_object_or_404(Material, id=material_id)

        serializer_in = FlashcardGenerationSerializer(data=request.data)
        serializer_in.is_valid(raise_exception=True)
        num_cards = serializer_in.validated_data["num_cards"]

        try:
            # AI returns dict with 'title', 'description', 'flashcards' keys
            result = generate_flashcards_from_material(material, num_cards)
        except Exception as e:
            return Response(
                {"detail": f"Flashcard generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        flashcard_set = FlashcardSet.objects.create(
            material=material,
            title=result["title"],
            description=result["description"],
            public=False
        )

        for fc in result["flashcards"]:
            Flashcard.objects.create(
                flashcard_set=flashcard_set,
                question=fc["question"],
                answer=fc["answer"]
            )

        output = FlashcardSetSerializer(flashcard_set, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)
