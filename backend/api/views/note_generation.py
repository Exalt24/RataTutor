from .imports import status, serializers, APIView, Response
from django.shortcuts import get_object_or_404

from api.models import Material
from api.serializers import NoteSerializer
from api.services.ai_service import generate_notes_from_material

class NoteGenerationSerializer(serializers.Serializer):
    """
    Serializer just to validate any extra parameters. 
    For notes, we don’t need a 'number'—we can let the AI choose how many bullet points to return.
    """
    # If in the future you want to control number of notes, add a field here:
    # num_notes = serializers.IntegerField(min_value=1, default=5)
    pass  # no fields for now

class NoteGenerationView(APIView):
    """
    POST /api/materials/<material_id>/generate-notes/
    { }   (no body needed currently)

    1. (Optionally) Validate request data via NoteGenerationSerializer.
    2. Call generate_notes_from_material(material).
    3. Create Note objects via NoteSerializer.
    4. Return the list of created Note objects.
    """
    def post(self, request, material_id=None):
        material = get_object_or_404(Material, id=material_id)

        # 1) Currently no extra params to validate, but keep pattern
        # serializer_in = NoteGenerationSerializer(data=request.data)
        # serializer_in.is_valid(raise_exception=True)

        try:
            # 2) Ask AI for notes
            note_dicts = generate_notes_from_material(material)
        except Exception as e:
            return Response(
                {"detail": f"Note generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        created_notes = []
        # 3) Validate + save each note
        for nd in note_dicts:
            serializer = NoteSerializer(
                data={"material": material.id, "content": nd["note_text"]},
                context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            note_obj = serializer.save()
            created_notes.append(NoteSerializer(note_obj).data)

        # 4) Return the newly created notes
        return Response(created_notes, status=status.HTTP_201_CREATED)
