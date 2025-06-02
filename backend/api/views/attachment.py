from .imports import generics, status, MultiPartParser, FormParser, Response

from django.shortcuts import get_object_or_404

from api.models import Material
from api.serializers import AttachmentSerializer

class AttachmentUploadView(generics.CreateAPIView):
    serializer_class = AttachmentSerializer
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, material_id=None, *args, **kwargs):
        material = get_object_or_404(Material, id=material_id)

        upload_file = request.FILES.get("file", None)
        if upload_file is None:
            return Response(
                {"error": "No file provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(
            data={"material": material.id, "file": upload_file}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(material=material)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
