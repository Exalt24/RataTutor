from .imports import viewsets, permissions, action, Response
from ..models import Material
from ..serializers import MaterialSerializer

class MaterialViewSet(viewsets.ModelViewSet):
    serializer_class = MaterialSerializer
    permission_classes = [permissions.IsAuthenticated]  # Ensure user is authenticated
    
    def get_queryset(self):
        """
        Return materials owned by the current user only.
        Filter out materials in 'trash' status by default.
        """
        return Material.objects.filter(
            owner=self.request.user,
            status='active'  # Only show active materials by default
        ).order_by('-pinned', '-updated_at')  # Pinned first, then by recent updates
    
    def perform_create(self, serializer):
        """
        Set the owner to the current authenticated user when creating a material.
        """
        serializer.save(owner=self.request.user)
    
    def perform_update(self, serializer):
        """
        Ensure the owner doesn't change during updates.
        """
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'])
    def pinned(self, request):
        """
        Custom endpoint to get only pinned materials.
        GET /api/materials/pinned/
        """
        pinned_materials = self.get_queryset().filter(pinned=True)
        serializer = self.get_serializer(pinned_materials, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trash(self, request):
        """
        Custom endpoint to get materials in trash.
        GET /api/materials/trash/
        """
        trashed_materials = Material.objects.filter(
            owner=request.user,
            status='trash'
        ).order_by('-updated_at')
        serializer = self.get_serializer(trashed_materials, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        """
        Custom endpoint to get public materials from other users.
        GET /api/materials/public/
        """
        public_materials = Material.objects.filter(
            public=True,
            status='active'
        ).exclude(
            owner=request.user  # Exclude current user's materials
        ).select_related('owner').order_by('-updated_at')
        
        serializer = self.get_serializer(public_materials, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        """
        Toggle the pinned status of a material.
        POST /api/materials/{id}/toggle_pin/
        """
        material = self.get_object()
        material.pinned = not material.pinned
        material.save()
        serializer = self.get_serializer(material)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_visibility(self, request, pk=None):
        """
        Toggle the public status of a material.
        POST /api/materials/{id}/toggle_visibility/
        """
        material = self.get_object()
        material.public = not material.public
        material.save()
        serializer = self.get_serializer(material)
        return Response(serializer.data)