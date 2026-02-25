# users/views.py - FIXED IMPORTS
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.paginator import Paginator
from mongoengine.queryset.visitor import Q
from datetime import datetime, timedelta

from .models import User
from admin_auth.models import Admin
from .serializers import UserRegistrationSerializer, UserSerializer
from .authentication import JWTAuthentication
from .permissions import IsAuthenticatedMongo

# Your existing views (register_user, login_user, etc.) remain the same
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        token = user.generate_jwt_token()
        user_data = UserSerializer(user).data

        return Response({
            'message': 'Registration successful',
            'token': token,
            'user': user_data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': 'Registration failed', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    try:
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '').strip()

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'User account is disabled'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = user.generate_jwt_token()
        user_data = UserSerializer(user).data

        return Response({
            'message': 'Login successful',
            'token': token,
            'user': user_data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': 'Login failed', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticatedMongo])
def get_user_profile(request):
    try:
        user = request.user
        if not isinstance(user, User):
            return Response({'error': 'Not a student user'}, status=status.HTTP_403_FORBIDDEN)
            
        user_data = UserSerializer(user).data
        return Response(user_data)
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch profile'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticatedMongo])
def verify_token(request):
    try:
        user = request.user
        if not isinstance(user, User):
            return Response({'valid': False, 'error': 'Not a student user'}, status=status.HTTP_403_FORBIDDEN)
            
        user_data = UserSerializer(user).data
        return Response({
            'valid': True,
            'user': user_data
        })
    except Exception as e:
        return Response(
            {'error': 'Token verification failed'},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['GET'])
@permission_classes([IsAuthenticatedMongo])
def check_auth(request):
    return Response({'authenticated': True})

# NEW USER MANAGEMENT VIEWS

@api_view(['GET'])
@permission_classes([IsAuthenticatedMongo])
def get_all_users(request):
    """Get all users with pagination and filtering - ADMIN ONLY"""
    if not isinstance(request.user, Admin):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        # Get query parameters
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        search = request.GET.get('search', '').strip()
        status_filter = request.GET.get('status', '')
        sort = request.GET.get('sort', 'newest')
        
        # Build query
        query = Q()
        
        if search:
            query &= (
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(school__icontains=search)
            )
        
        if status_filter:
            if status_filter == 'active':
                query &= Q(is_active=True)
            elif status_filter == 'inactive':
                query &= Q(is_active=False)
        
        # Determine sorting
        sort_field = '-created_at' if sort == 'newest' else 'created_at'
        
        # Get users with pagination
        users = User.objects(query).order_by(sort_field)
        
        # Paginate
        paginator = Paginator(users, page_size)
        page_obj = paginator.page(page)
        
        # Serialize data
        users_data = UserSerializer(page_obj.object_list, many=True).data
        
        return Response({
            'users': users_data,
            'pagination': {
                'current_page': page,
                'total_pages': paginator.num_pages,
                'total_users': paginator.count,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
            }
        })
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch users', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticatedMongo])
def get_user_stats(request):
    """Get user statistics for dashboard - ADMIN ONLY"""
    if not isinstance(request.user, Admin):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        
        # Recent users (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_users = User.objects.filter(created_at__gte=seven_days_ago).count()
        
        # Users by class distribution
        class_distribution = {}
        classes = User.objects.distinct('student_class')
        for class_name in classes:
            if class_name:  # Ensure class_name is not None or empty
                count = User.objects.filter(student_class=class_name).count()
                class_distribution[class_name] = count
        
        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'recent_users': recent_users,
            'class_distribution': class_distribution
        })
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch user statistics', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticatedMongo])
def get_user_detail(request, user_id):
    """Get detailed information about a specific user - ADMIN ONLY"""
    if not isinstance(request.user, Admin):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(id=user_id)
        user_data = UserSerializer(user).data
        return Response(user_data)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch user details', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PUT'])
@permission_classes([IsAuthenticatedMongo])
def update_user_status(request, user_id):
    """Activate or deactivate a user - ADMIN ONLY"""
    if not isinstance(request.user, Admin):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(id=user_id)
        is_active = request.data.get('is_active')
        
        if is_active is None:
            return Response(
                {'error': 'is_active field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = is_active
        user.save()
        
        return Response({
            'message': f'User {"activated" if is_active else "deactivated"} successfully',
            'user': UserSerializer(user).data
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to update user status', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticatedMongo])
def delete_user(request, user_id):
    """Delete a user permanently - ADMIN ONLY"""
    if not isinstance(request.user, Admin):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        
        return Response({
            'message': 'User deleted successfully'
        })
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete user', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticatedMongo])
def upload_profile_image(request):
    """Upload profile image to Cloudflare R2 with local fallback"""
    try:
        import os
        import uuid
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        from contact_backend.utils.r2_storage import upload_to_r2
        
        user = request.user
        
        # Ensure we have a student USER, not an Admin or Anonymous
        if not user or not user.is_authenticated or not isinstance(user, User):
             return Response({
                 'error': 'This endpoint is for students only.',
                 'detected': type(user).__name__
             }, status=status.HTTP_401_UNAUTHORIZED)
             
        if 'image' not in request.FILES:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        image_file = request.FILES['image']
        
        # 1. Try Cloudflare R2 Upload (Preferred across the app)
        try:
            # Read image data
            image_data = image_file.read()
            # Reset seek pointer for fallback if needed
            image_file.seek(0)
            
            public_url = upload_to_r2(
                file_data=image_data,
                file_name=image_file.name,
                content_type=image_file.content_type,
                folder='profile_pics'
            )
            
            if public_url:
                user.profile_image_url = public_url
                user.save()
                return Response({
                    'message': 'Profile image uploaded to Cloudflare R2',
                    'url': public_url,
                    'service': 'r2',
                    'user': UserSerializer(user).data
                })
        except Exception as r2_err:
            print(f"⚠️ R2 upload failed, trying local fallback: {r2_err}")
            # Reset seek pointer for local save
            image_file.seek(0)

        # 2. Local Fallback (if R2 fails or not configured)
        try:
            file_ext = os.path.splitext(image_file.name)[1] or '.jpg'
            # Safely get ID as string
            user_id_str = str(getattr(user, 'id', 'unknown'))
            unique_filename = f"profile_pics/{user_id_str}_{uuid.uuid4().hex[:8]}{file_ext}"
            
            # Save file using Django's storage system
            saved_path = default_storage.save(unique_filename, ContentFile(image_file.read()))
            
            # Construct absolute URL so frontend can see it
            base_url = request.build_absolute_uri('/')[:-1] # http://localhost:8000
            image_url = f"{base_url}/media/{saved_path}"
            
            user.profile_image_url = image_url
            user.save()
            
            return Response({
                'message': 'Profile image saved locally',
                'url': image_url,
                'service': 'local',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as local_err:
            return Response({'error': f'All upload methods failed: {str(local_err)}'}, status=500)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticatedMongo])
def delete_profile_image(request):
    """Remove user's profile image"""
    try:
        user = request.user
        if not user or not user.is_authenticated or not isinstance(user, User):
             return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
             
        user.profile_image_url = None
        user.save()
        
        return Response({
            'message': 'Profile image removed',
            'user': UserSerializer(user).data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticatedMongo])
def reset_password_admin(request, user_id):
    """Reset user password - ADMIN ONLY"""
    if not isinstance(request.user, Admin):
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        new_password = request.data.get('password', '').strip()
        
        if not new_password or len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password reset successful'})
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)