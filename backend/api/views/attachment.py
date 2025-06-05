from .imports import generics, status, MultiPartParser, FormParser, Response, viewsets, IsAuthenticated, PermissionDenied


from django.shortcuts import get_object_or_404

from api.models import Material
from api.models import Attachment
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

class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only show attachments owned by the current user
        return Attachment.objects.filter(material__owner=self.request.user)
    
    def perform_create(self, serializer):
        # Ensure the material belongs to the current user
        material = serializer.validated_data['material']
        if material.owner != self.request.user:
            raise PermissionDenied("You don't have permission to add attachments to this material.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Ensure the user owns the material
        if instance.material.owner != self.request.user:
            raise PermissionDenied("You don't have permission to delete this attachment.")
        instance.delete()