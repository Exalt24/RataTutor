from .imports import status, serializers, APIView, Response
from django.shortcuts import get_object_or_404

from api.models import Material
from api.serializers import FlashcardSerializer
from api.services.ai_service import generate_flashcards_from_material

class FlashcardGenerationSerializer(serializers.Serializer):
    """
    Serializer to validate incoming 'num_cards' field.
    """
    num_cards = serializers.IntegerField(
        min_value=1,
        max_value=20,
        default=5,
        help_text="How many flashcards to generate (1–20)."
    )

class FlashcardGenerationView(APIView):
    """
    POST /api/materials/<material_id>/generate-flashcards/
    {
      "num_cards": 5
    }

    1. Validate num_cards via FlashcardGenerationSerializer.
    2. Call generate_flashcards_from_material(material, num_cards).
    3. Create Flashcard objects via FlashcardSerializer.
    4. Return list of created flashcards.
    """
    def post(self, request, material_id=None):
        material = get_object_or_404(Material, id=material_id)

        # 1) Validate how many cards
        serializer_in = FlashcardGenerationSerializer(data=request.data)
        serializer_in.is_valid(raise_exception=True)
        num_cards = serializer_in.validated_data["num_cards"]

        try:
            # 2) Ask AI for flashcards
            flashcard_dicts = generate_flashcards_from_material(material, num_cards)
        except Exception as e:
            return Response(
                {"detail": f"Flashcard generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        created_cards = []
        # 3) Validate + save each flashcard
        for fc in flashcard_dicts:
            serializer = FlashcardSerializer(
                data={
                    "material": material.id,
                    "question": fc["question"],
                    "answer":   fc["answer"],
                },
                context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            card_obj = serializer.save()
            created_cards.append(FlashcardSerializer(card_obj).data)

        # 4) Return the newly created flashcards
        return Response(created_cards, status=status.HTTP_201_CREATED)
