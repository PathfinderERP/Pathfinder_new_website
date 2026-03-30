# centres/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_mongoengine import viewsets as mongo_viewsets
from .models import Centre
from .serializers import CentreSerializer
from admin_auth.models import Admin
import jwt
from django.conf import settings
import logging
import requests
import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Centre, Topper

# FIXED IMPORT - Use relative import
from .services.image_service import ImageProcessor

logger = logging.getLogger(__name__)

# Indian States and Districts Data (Same as courses)
INDIAN_STATES_DISTRICTS = {
    "West Bengal": [
        "Howrah", "Kolkata", "Darjeeling", "Hooghly", "North 24 Parganas", 
        "South 24 Parganas", "Bankura", "Purba Bardhaman", "Paschim Bardhaman",
        "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Kalimpong", "Malda",
        "Murshidabad", "Nadia", "Paschim Medinipur", "Purba Medinipur",
        "Purulia", "Uttar Dinajpur", "Alipurduar", "Jhargram"
    ],
    "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra"],
}

CENTRES = [
    "hazra", "saltlake", "dumdum", "garia", "barasat", "barrackpore",
    "howrah", "kharagpur", "durgapur", "asansol", "siliguri", "malda",
    "bhubaneswar", "cuttack", "puri", "rourkela", "sambalpur",
    "patna", "gaya", "muzaffarpur", "bhagalpur",
    "ranchi", "jamshedpur", "dhanbad", "bokaro",
    "guwahati", "dimapur", "shillong", "agartala",
    "visakhapatnam", "vijayawada", "guntur", "tirupati"
]

class CentreViewSet(mongo_viewsets.ModelViewSet):
    serializer_class = CentreSerializer
    pagination_class = None
    # Allow public access for reading, require auth for writing
    permission_classes = [AllowAny]  # Changed from IsAuthenticated to AllowAny
    lookup_field = 'id'

    def get_queryset(self):
        return Centre.objects.all()

    def get_permissions(self):
        """
        Override to allow public access for safe methods (GET, HEAD, OPTIONS)
        but require authentication for unsafe methods (POST, PUT, PATCH, DELETE)
        """
        if self.action in ['list', 'retrieve', 'states', 'districts', 'centres', 'centre_details']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_admin_from_jwt(self):
        """Extract admin user from JWT token"""
        try:
            auth_header = self.request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                
                admin_id = payload.get('admin_id')
                admin_email = payload.get('email')
                
                if admin_id:
                    try:
                        return Admin.objects.get(id=admin_id)
                    except Admin.DoesNotExist:
                        pass
                
                if admin_email:
                    try:
                        return Admin.objects.get(email=admin_email)
                    except Admin.DoesNotExist:
                        pass
                
                # Fallback to first super admin
                return Admin.objects.filter(is_superuser=True).first()
                    
        except Exception as e:
            logger.error(f"Error getting admin from JWT: {e}")
        
        return None

    def perform_create(self, serializer):
        """Automatically set created_by based on JWT token"""
        admin_user = self.get_admin_from_jwt()
        if admin_user:
            serializer.save(created_by=admin_user)
        else:
            serializer.save()

    @action(detail=False, methods=['get'])
    def states(self, request):
        """Get all unique states from predefined data"""
        states = list(INDIAN_STATES_DISTRICTS.keys())
        return Response(states)

    @action(detail=False, methods=['get'])
    def districts(self, request):
        """Get districts for a specific state from predefined data"""
        state = request.GET.get('state', 'West Bengal')
        districts = INDIAN_STATES_DISTRICTS.get(state, [])
        return Response(districts)

    @action(detail=False, methods=['get'])
    def centres(self, request):
        """Get centres for a specific state and district"""
        state = request.GET.get('state', 'West Bengal')
        district = request.GET.get('district', '')
        
        if district:
            centres = Centre.objects.filter(state=state, district=district)
        else:
            centres = Centre.objects.filter(state=state)
        
        serializer = self.get_serializer(centres, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def centre_details(self, request):
        """Get complete details for a specific centre"""
        centre_name = request.GET.get('centre', '')
        if centre_name:
            try:
                centre = Centre.objects.get(centre=centre_name)
                serializer = self.get_serializer(centre)
                return Response(serializer.data)
            except Centre.DoesNotExist:
                return Response(
                    {"error": "Centre not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "Centre name is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def topper_categories(self, request):
        """Get available topper categories"""
        categories = ['All India', 'Boards', 'Foundation']
        return Response(categories)

class DataViewSet(viewsets.ViewSet):
    # Allow public access to data endpoints
    permission_classes = [AllowAny]  # Changed from IsAuthenticated to AllowAny
    
    @action(detail=False, methods=['get'])
    def states(self, request):
        """Alternative endpoint for states"""
        return Response(list(INDIAN_STATES_DISTRICTS.keys()))
    
    @action(detail=False, methods=['get'])
    def districts(self, request):
        """Alternative endpoint for districts"""
        state = request.GET.get('state', 'West Bengal')
        districts = INDIAN_STATES_DISTRICTS.get(state, [])
        return Response(districts)
    
    @action(detail=False, methods=['get'])
    def centres(self, request):
        """Alternative endpoint for centres list"""
        return Response(CENTRES)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    """
    Upload image to Cloudflare R2 with local fallback
    """
    try:
        from contact_backend.utils.r2_storage import upload_to_r2
        
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        # 1. Try Cloudflare R2 (Matching Alumni implementation)
        try:
            # Read and reset file pointer
            image_data = image_file.read()
            image_file.seek(0)
            
            print(f"[DEBUG] - Attempting Cloudflare R2 upload...")
            public_url = upload_to_r2(
                file_data=image_data,
                file_name=image_file.name,
                content_type=image_file.content_type,
                folder='uploads'
            )
            
            if public_url:
                return Response({
                    'message': 'Image uploaded successfully to Cloudflare R2',
                    'public_url': public_url,
                    'service': 'r2'
                }, status=status.HTTP_201_CREATED)
                
        except Exception as r2_err:
            print(f"[WARNING] Cloudflare R2 upload failed: {r2_err}. Falling back to local/other methods.")
            image_file.seek(0)

        # 2. Legacy/Secondary: Try Cloudflare Images (v1) if credentials exist
        account_id = os.getenv('CLOUDFLARE_ACCOUNT_ID')
        api_token = os.getenv('CLOUDFLARE_API_TOKEN')
        
        if account_id and api_token:
            try:
                upload_url = f'https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1'
                headers = {'Authorization': f'Bearer {api_token}'}
                files = {'file': (image_file.name, image_file, image_file.content_type)}
                response = requests.post(upload_url, headers=headers, files=files, timeout=30)
                
                if response.status_code == 200:
                    cloudflare_data = response.json()
                    image_variants = cloudflare_data['result']['variants']
                    return Response({
                        'message': 'Image uploaded to Cloudflare Images',
                        'public_url': image_variants[0] if image_variants else None,
                        'service': 'cloudflare_v1'
                    }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"[WARNING] Cloudflare Images v1 failed: {e}")
                image_file.seek(0)
        
        # 3. Fallback to local storage
        return save_image_locally(request, image_file)
        
    except Exception as e:
        print(f"[ERROR] Image upload error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def save_image_locally(request, image_file):
    """
    Save image to local storage as fallback with absolute URL
    """
    try:
        import uuid
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        
        # Generate unique filename
        file_ext = os.path.splitext(image_file.name)[1] or '.jpg'
        unique_filename = f"uploads/{uuid.uuid4()}{file_ext}"
        
        # Save file
        saved_path = default_storage.save(unique_filename, ContentFile(image_file.read()))
        
        # Construct absolute URL for frontend
        base_url = request.build_absolute_uri('/')[:-1]
        image_url = f"{base_url}/media/{saved_path}"
        
        return Response({
            'message': 'Image saved locally',
            'public_url': image_url,
            'local_path': saved_path,
            'service': 'local'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"[ERROR] Local storage failed: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# NEW FUNCTIONS FOR MONGODB IMAGE STORAGE
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_centre_logo(request, centre_id):
    """
    Upload and store logo in Cloudflare R2
    """
    try:
        from contact_backend.utils.r2_storage import upload_to_r2
        
        if 'logo' not in request.FILES:
            return Response(
                {'error': 'No logo file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get centre
        try:
            centre = Centre.objects.get(id=centre_id)
        except Centre.DoesNotExist:
            return Response(
                {'error': 'Centre not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        logo_file = request.FILES['logo']
        
        # 1. Process/Compress image
        try:
            processed_logo = ImageProcessor.process_uploaded_image(
                logo_file, 
                max_size=(1200, 900),
                quality=85
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Upload to Cloudflare R2
        try:
            public_url = upload_to_r2(
                file_data=processed_logo['data'],
                file_name=processed_logo['filename'],
                content_type=processed_logo['content_type'],
                folder='logos'
            )
            
            if public_url:
                # Store URL
                centre.logo = public_url
                centre.save()
                
                return Response({
                    'message': 'Logo uploaded successfully to Cloudflare R2',
                    'logo_url': public_url,
                    'service': 'r2'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Failed to get public URL from R2'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as r2_err:
            logger.error(f"Cloudflare R2 upload failed: {r2_err}")
            return Response(
                {'error': f'Cloudflare R2 upload failed: {str(r2_err)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    except Exception as e:
        logger.error(f"Logo upload error: {e}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_topper_image(request, centre_id):
    """
    Upload topper image to Cloudflare R2
    """
    try:
        from contact_backend.utils.r2_storage import upload_to_r2
        
        if not request.FILES or 'image' not in request.FILES:
            return Response(
                {'error': 'No image file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get centre
        try:
            centre = Centre.objects.get(id=centre_id)
        except Centre.DoesNotExist:
            return Response(
                {'error': 'Centre not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        image_file = request.FILES['image']
        topper_index = request.POST.get('topper_index')
        
        if not topper_index or not topper_index.isdigit():
            return Response({'error': 'Invalid topper index'}, status=status.HTTP_400_BAD_REQUEST)
            
        index = int(topper_index)
        if index < 0 or index >= len(centre.toppers):
            return Response({'error': 'Topper index out of range'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Process image
        try:
            processed_image = ImageProcessor.process_uploaded_image(
                image_file,
                max_size=(1200, 900),
                quality=85
            )
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Upload to Cloudflare R2
        try:
            public_url = upload_to_r2(
                file_data=processed_image['data'],
                file_name=processed_image['filename'],
                content_type=processed_image['content_type'],
                folder='toppers'
            )
            
            if public_url:
                # Update topper and save centre
                topper = centre.toppers[index]
                topper.image = public_url
                centre.save()
                
                return Response({
                    'message': 'Topper image uploaded successfully to Cloudflare R2',
                    'image_url': public_url,
                    'service': 'r2'
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Failed to get public URL from R2'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as r2_err:
            logger.error(f"Cloudflare R2 upload failed for topper: {r2_err}")
            return Response(
                {'error': f'Cloudflare R2 upload failed: {str(r2_err)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

            
    except Exception as e:
        logger.error(f"Topper upload error: {e}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
    except Exception as e:
        print(f"[CRITICAL] BACKEND: Unexpected error - {str(e)}")
        import traceback
        print(f"[DEBUG] BACKEND: Traceback: {traceback.format_exc()}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])  # Changed to AllowAny for public access
def get_centre_logo(request, centre_id):
    """
    Get centre logo as base64 data URL - Allow public access
    """
    try:
        centre = Centre.objects.get(id=centre_id)
        
        if not centre.logo_data:
            return Response(
                {'error': 'No logo found for this centre'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'logo_url': centre.get_logo_url(),
            'content_type': centre.logo_content_type,
            'filename': centre.logo_filename
        })
        
    except Centre.DoesNotExist:
        return Response(
            {'error': 'Centre not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Get logo error: {e}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )