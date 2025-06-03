from .imports import status, serializers, APIView, Response
from django.shortcuts import get_object_or_404

from api.models import Material
from api.serializers import NoteSerializer
from api.services.ai_service import generate_notes_from_material

class NoteGenerationSerializer(serializers.Serializer):
    pass  # no extra params currently

class NoteGenerationView(APIView):
    def post(self, request, material_id=None):
        material = get_object_or_404(Material, id=material_id)

        try:
            # AI returns dict with 'title', 'description', 'notes' keys
            result = generate_notes_from_material(material)
        except Exception as e:
            return Response(
                {"detail": f"Note generation failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        created_notes = []
        for nd in result["notes"]:
            serializer = NoteSerializer(
                data={
                    "material": material.id,
                    "title": result.get("title", "AI-generated note"),
                    "description": result.get("description", ""),
                    "content": nd["note_text"] if isinstance(nd, dict) else nd,
                },
                context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            note_obj = serializer.save()
            created_notes.append(NoteSerializer(note_obj).data)

        return Response(created_notes, status=status.HTTP_201_CREATED)
