from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_mongoengine import viewsets as mongo_viewsets
from rest_framework.decorators import action
from .models import NEETHub
from .serializers import NEETHubSerializer
from contact_backend.utils.r2_storage import upload_to_r2

class NEETHubViewSet(mongo_viewsets.ModelViewSet):
    """
    ViewSet for managing NEET Hub content and resources
    """
    serializer_class = NEETHubSerializer
    lookup_field = 'id'
    queryset = NEETHub.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'latest']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the most recent active configuration"""
        instance = NEETHub.objects(is_active=True).first()
        if not instance:
            return Response({"error": "No active configuration found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def upload_file(self, request, id=None):
        """
        Upload a file (image or pdf) to Cloudflare R2
        Expects 'file' and 'type' (hero_image, weightage, pdf)
        """
        instance = self.get_object()
        file_obj = request.FILES.get('file')
        file_type = request.data.get('type') # 'hero_image', 'weightage', 'pdf'
        subject_index = request.data.get('subject_index') # required if type is weightage or pdf

        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Determine folder based on type
            folder = 'neet/images' if file_type == 'hero_image' else 'neet/pdfs'
            
            # Upload to R2
            public_url = upload_to_r2(
                file_data=file_obj.read(),
                file_name=file_obj.name,
                content_type=file_obj.content_type,
                folder=folder
            )

            # Update the model instance
            if file_type == 'hero_image':
                instance.hero_image_url = public_url
            elif file_type in ['weightage', 'pdf'] and subject_index is not None:
                idx = int(subject_index)
                if idx < len(instance.resources):
                    field_key = 'weightage_url' if file_type == 'weightage' else 'pdf_url'
                    instance.resources[idx][field_key] = public_url
                else:
                    return Response({"error": "Invalid subject index"}, status=status.HTTP_400_BAD_REQUEST)
            
            instance.save()
            return Response({
                "message": "File uploaded successfully",
                "url": public_url
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
