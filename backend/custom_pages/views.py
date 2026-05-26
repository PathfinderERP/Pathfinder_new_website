from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_mongoengine import viewsets as mongo_viewsets
from rest_framework.decorators import action
from django.http import HttpResponse
from .models import CustomPage
from .serializers import CustomPageSerializer
from contact_backend.utils.r2_storage import upload_to_r2
from .sitemap_utils import get_sitemap_xml, get_custom_pages_only_xml

class CustomPageViewSet(mongo_viewsets.ModelViewSet):
    """
    ViewSet for managing fully dynamic landing pages
    """
    serializer_class = CustomPageSerializer
    lookup_field = 'id'
    queryset = CustomPage.objects.all()
    pagination_class = None

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'by_slug']:
            return [AllowAny()]
        # All other actions (create, update, delete) require authentication
        # The admin_token or user authToken must be sent in Authorization header
        return [IsAuthenticated()]

    def get_object(self):
        """Override to provide better error messages"""
        try:
            return super().get_object()
        except Exception as e:
            return Response(
                {"error": f"Page not found: {str(e)}"},
                status=status.HTTP_404_NOT_FOUND
            )

    def destroy(self, request, *args, **kwargs):
        """
        Delete a custom page.
        Regenerates sitemap automatically when page is deleted.
        """
        import json
        try:
            instance = self.get_object()
            page_slug = instance.slug
            page_title = instance.title
            
            # Delete the instance (signals will regenerate sitemap)
            instance.delete()
            
            return Response(
                {
                    "message": f"Page '{page_title}' deleted successfully",
                    "slug": page_slug,
                    "detail": "Sitemap updated automatically"
                },
                status=status.HTTP_200_OK
            )
        except PermissionError as e:
            with open("api_error.log", "a", encoding="utf-8") as f:
                f.write(f"--- CUSTOM PAGE DELETE PERMISSION ERROR ---\n")
                f.write(f"User: {request.user}\n")
                f.write(f"Error: {str(e)}\n\n")
            return Response(
                {"error": "You don't have permission to delete this page"},
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            with open("api_error.log", "a", encoding="utf-8") as f:
                f.write(f"--- CUSTOM PAGE DELETE ERROR ---\n")
                f.write(f"Error: {str(e)}\n")
                f.write(f"Type: {type(e).__name__}\n\n")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        import json
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)  # Always partial for flexibility
        if not serializer.is_valid():
            with open("api_error.log", "a", encoding="utf-8") as f:
                f.write(f"--- CUSTOM PAGE UPDATE VALIDATION FAILED ---\n")
                f.write(f"Payload: {json.dumps(request.data, default=str)}\n")
                f.write(f"Errors: {json.dumps(serializer.errors, default=str)}\n\n")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save and trigger signals (which will regenerate sitemap)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-slug')
    def by_slug(self, request):
        """Retrieve a dynamic page by its slug/URL path"""
        slug = request.query_params.get('slug')
        if not slug:
            return Response({"error": "Slug parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Clean slug (remove leading/trailing slashes)
        slug_clean = slug.strip('/')
        
        # Retrieve the page
        instance = CustomPage.objects(slug=slug_clean, is_live=True).first()
        if not instance:
            # Check if there is a page with this slug that is not live yet
            not_live = CustomPage.objects(slug=slug_clean).first()
            if not_live:
                return Response({"error": "Page is not live yet"}, status=status.HTTP_403_FORBIDDEN)
            return Response({"error": f"Page with slug '{slug_clean}' not found"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upload-image')
    def upload_image(self, request, id=None):
        """
        Upload an image (e.g. hero bg image) to Cloudflare R2 for this custom page
        """
        instance = self.get_object()
        file_obj = request.FILES.get('file')
        
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            public_url = upload_to_r2(
                file_data=file_obj.read(),
                file_name=file_obj.name,
                content_type=file_obj.content_type,
                folder='custom_pages/images'
            )
            
            return Response({
                "message": "Image uploaded successfully",
                "url": public_url
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='sitemap', permission_classes=[AllowAny])
    def sitemap(self, request):
        """
        Generate and serve dynamic sitemap.xml
        This endpoint regenerates the sitemap every time it's called,
        ensuring custom pages are always included if they're live (is_live=True)
        and excluded if they're deactivated (is_live=False)
        """
        # Get domain from request
        domain = f"{request.scheme}://{request.get_host()}"
        
        # Generate sitemap XML
        sitemap_content = get_sitemap_xml(domain=domain)
        
        # Return as XML response
        return HttpResponse(sitemap_content, content_type='application/xml')

    @action(detail=False, methods=['get'], url_path='sitemap-custom-only', permission_classes=[AllowAny])
    def sitemap_custom_only(self, request):
        """
        Generate and serve dynamic sitemap.xml with ONLY custom pages
        (excludes static pages like /about-us, /contact, etc.)
        """
        # Get domain from request
        domain = f"{request.scheme}://{request.get_host()}"
        
        # Generate sitemap XML with only custom pages
        sitemap_content = get_custom_pages_only_xml(domain=domain)
        
        # Return as XML response
        return HttpResponse(sitemap_content, content_type='application/xml')
