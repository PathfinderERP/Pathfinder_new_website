from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_mongoengine import generics as mongo_generics
from mongoengine.queryset.visitor import Q
from datetime import datetime, timedelta
import secrets

from .authentication import AdminJWTAuthentication
from .models import Admin
from .serializers import (
    AdminRegistrationSerializer, AdminLoginSerializer, AdminSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer, ChangePasswordSerializer,
    AdminInviteSerializer, AdminCreateSerializer, AdminPermissionUpdateSerializer
)
from django.core.mail import send_mail
from django.conf import settings

class IsSuperUser(permissions.BasePermission):
    """Only allow superusers to perform actions"""
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser

# Admin Registration - Disabled public registration
class AdminRegisterView(mongo_generics.CreateAPIView):
    queryset = Admin.objects.all()
    permission_classes = [AllowAny]
    serializer_class = AdminRegistrationSerializer

    def create(self, request, *args, **kwargs):
        return Response({
            'error': 'Admin registration is disabled. Please contact system administrator for access.'
        }, status=status.HTTP_403_FORBIDDEN)

# Admin Creation by Super Admin
@api_view(['POST'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_admin(request):
    """Create a new admin directly (superadmin only)"""
    try:
        if not request.user.is_superuser:
            return Response({
                'error': 'Only superadmins can create admin accounts'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = AdminCreateSerializer(data=request.data)
        if serializer.is_valid():
            admin = serializer.save()
            
            return Response({
                'message': 'Admin created successfully',
                'admin': AdminSerializer(admin).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            'error': 'Failed to create admin',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_admins(request):
    """Get all admins (superadmin only) - MONGODB VERSION"""
    try:
        if not request.user.is_superuser:
            return Response({
                'error': 'Only superadmins can view all admins'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get query parameters for pagination
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        
        # MongoDB pagination
        skip = (page - 1) * page_size
        total_admins = Admin.objects.count()
        
        admins = Admin.objects.all().order_by('-created_at').skip(skip).limit(page_size)
        serializer = AdminSerializer(admins, many=True)
        
        # Calculate pagination info
        total_pages = (total_admins + page_size - 1) // page_size
        has_next = page < total_pages
        has_previous = page > 1
        
        return Response({
            'admins': serializer.data,
            'pagination': {
                'current_page': page,
                'total_pages': total_pages,
                'total_admins': total_admins,
                'has_next': has_next,
                'has_previous': has_previous,
                'page_size': page_size
            }
        })

    except Exception as e:
        return Response({
            'error': 'Failed to fetch admins',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_admin_permissions(request, admin_id):
    """Update admin permissions (superadmin only)"""
    try:
        if not request.user.is_superuser:
            return Response({
                'error': 'Only superadmins can update permissions'
            }, status=status.HTTP_403_FORBIDDEN)

        target_admin = Admin.objects.get(id=admin_id)
        serializer = AdminPermissionUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Update permissions
            if 'permissions' in serializer.validated_data:
                target_admin.permissions = serializer.validated_data['permissions']
            
            # Update active status if provided
            if 'is_active' in serializer.validated_data:
                target_admin.is_active = serializer.validated_data['is_active']
            
            target_admin.save()
            
            return Response({
                'message': 'Admin permissions updated successfully',
                'admin': AdminSerializer(target_admin).data
            })
        else:
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except Admin.DoesNotExist:
        return Response({
            'error': 'Admin not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Failed to update permissions',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_admin_details(request, admin_id):
    """Update admin details (superadmin only)"""
    try:
        if not request.user.is_superuser:
            return Response({
                'error': 'Only superadmins can update admin accounts'
            }, status=status.HTTP_403_FORBIDDEN)

        target_admin = Admin.objects.get(id=admin_id)
        serializer = AdminSerializer(target_admin, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Admin updated successfully',
                'admin': serializer.data
            })
        else:
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except Admin.DoesNotExist:
        return Response({
            'error': 'Admin not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Failed to update admin',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_admin(request, admin_id):
    """Delete an admin (superadmin only)"""
    try:
        if not request.user.is_superuser:
            return Response({
                'error': 'Only superadmins can delete admin accounts'
            }, status=status.HTTP_403_FORBIDDEN)

        target_admin = Admin.objects.get(id=admin_id)
        
        # Prevent superadmin from deleting themselves
        if target_admin.id == request.user.id:
            return Response({
                'error': 'Cannot delete your own account'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        target_admin.delete()
        
        return Response({
            'message': 'Admin deleted successfully'
        })

    except Admin.DoesNotExist:
        return Response({
            'error': 'Admin not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Failed to delete admin',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Invitation system
class AdminInviteView(mongo_generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]
    serializer_class = AdminInviteSerializer
    
    def create(self, request, *args, **kwargs):
        """Create an invitation for new admin registration"""
        if not request.user.is_superuser:
            return Response({
                'error': 'Only superusers can invite new admins'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        full_name = serializer.validated_data['full_name']
        
        # Check if admin already exists
        if Admin.objects.filter(email=email, is_active=True):
            return Response({'error': 'Admin with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create inactive admin with invitation token
        invitation_token = secrets.token_urlsafe(32)
        
        admin = Admin(
            email=email,
            full_name=full_name,
            is_active=False,  # Inactive until they complete registration
            invitation_token=invitation_token,
            invited_by=request.user,
            permissions=serializer.validated_data.get('permissions', ['view_dashboard', 'view_courses', 'view_users'])
        )
        admin.save()
        
        # Create invitation link
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        invitation_link = f"{frontend_url}/admin/register/{invitation_token}"
        
        # Send invitation email
        try:
            send_mail(
                'Admin Account Invitation - Pathfinder Academy',
                f'''
Hello {full_name},

You have been invited to join Pathfinder Academy as an administrator.

Please click the link below to complete your registration:
{invitation_link}

This invitation link will expire in 7 days.

If you did not expect this invitation, please ignore this email.

Best regards,
Pathfinder Academy Admin Team
                ''',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            response_data = {
                'message': 'Invitation sent successfully',
                'email': email,
                'invitation_link': invitation_link if settings.DEBUG else None
            }
            
            if settings.DEBUG:
                response_data['invitation_token'] = invitation_token
                response_data['debug_note'] = 'Token shown only in development'
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            admin.delete()  # Clean up if email fails
            return Response({
                'error': 'Failed to send invitation email. Please try again.',
                'debug_info': str(e) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminRegisterWithInviteView(mongo_generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = AdminRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        """Complete admin registration with valid invitation token"""
        invitation_token = request.data.get('invitation_token')
        
        if not invitation_token:
            return Response({'error': 'Invitation token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Find the invited admin
            invited_admin = Admin.objects.get(
                invitation_token=invitation_token,
                is_active=False
            )
            
            # Verify invitation is not expired (within 7 days)
            if invited_admin.created_at < datetime.now() - timedelta(days=7):
                invited_admin.delete()
                return Response({'error': 'Invitation has expired'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate registration data
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Update the invited admin with password and activate
            invited_admin.set_password(serializer.validated_data['password'])
            invited_admin.is_active = True
            invited_admin.invitation_token = None  # Clear the used token
            invited_admin.save()
            
            # Generate login token
            token = invited_admin.generate_jwt_token()
            
            return Response({
                'admin': AdminSerializer(invited_admin).data,
                'token': token,
                'message': 'Admin account activated successfully'
            }, status=status.HTTP_201_CREATED)
            
        except Admin.DoesNotExist:
            return Response({'error': 'Invalid or expired invitation token'}, status=status.HTTP_400_BAD_REQUEST)

# Existing authentication views
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    serializer = AdminLoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email'].lower().strip()
        password = serializer.validated_data['password'].strip()
        
        try:
            admin = Admin.objects.get(email=email, is_active=True)
            
            if not admin.check_password(password):
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
            
            token = admin.generate_jwt_token()
            
            return Response({
                'admin': AdminSerializer(admin).data,
                'token': token,
                'message': 'Admin login successful'
            })
            
        except Admin.DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            admin = Admin.objects.get(email=email, is_active=True)
            reset_token = admin.generate_reset_token()
            
            # Create reset link
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            reset_link = f"{frontend_url}/admin/reset-password?token={reset_token}"
            
            # Send email
            try:
                send_mail(
                    'Password Reset Request - Pathfinder Admin',
                    f'''
Hello {admin.full_name},

You have requested to reset your password for the Pathfinder Admin account.

Please click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you did not request this reset, please ignore this email.

Best regards,
Pathfinder Admin Team
                    ''',
                    settings.DEFAULT_FROM_EMAIL,
                    [admin.email],
                    fail_silently=False,
                )
                
                # For development, return token info
                if settings.DEBUG:
                    return Response({
                        'message': 'Password reset email sent successfully',
                        'reset_token': reset_token,
                        'reset_link': reset_link
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'message': 'Password reset email sent successfully'
                    }, status=status.HTTP_200_OK)
                    
            except Exception as e:
                return Response({
                    'error': 'Failed to send email. Please try again.',
                    'debug_info': str(e) if settings.DEBUG else None
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Admin.DoesNotExist:
            # Don't reveal whether email exists
            return Response({
                'message': 'If the email exists, a password reset link has been sent'
            }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            admin = Admin.objects.get(reset_token=token, is_active=True)
            
            if admin.verify_reset_token(token):
                admin.set_password(new_password)
                admin.clear_reset_token()
                admin.save()
                
                return Response({
                    'message': 'Password reset successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid or expired reset token'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Admin.DoesNotExist:
            return Response({
                'error': 'Invalid or expired reset token'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_reset_token(request, token):
    try:
        admin = Admin.objects.get(reset_token=token, is_active=True)
        
        if admin.verify_reset_token(token):
            return Response({
                'valid': True,
                'email': admin.email,
                'message': 'Token is valid'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'error': 'Token has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Admin.DoesNotExist:
        return Response({
            'valid': False,
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        admin = request.user
        
        if not admin.check_password(old_password):
            return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        admin.set_password(new_password)
        admin.save()
        
        return Response({'message': 'Password changed successfully'})
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    try:
        from users.models import User
        from courses.models import Course
        
        total_users = User.objects.count()
        total_courses = Course.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        total_admins = Admin.objects.filter(is_active=True).count()
        
        recent_courses = Course.objects.all().order_by('-created_at')[:5]
        recent_courses_data = []
        
        for course in recent_courses:
            recent_courses_data.append({
                'id': str(course.id),
                'name': course.name,
                'centre': course.centre,
                'class_level': course.class_level,
                'course_price': course.course_price,
                'created_at': course.created_at
            })
        
        return Response({
            'stats': {
                'total_users': total_users,
                'total_courses': total_courses,
                'active_users': active_users,
                'total_admins': total_admins
            },
            'recent_courses': recent_courses_data,
            'admin_info': AdminSerializer(request.user).data
        })
    except Exception as e:
        return Response({
            'stats': {
                'total_users': 0,
                'total_courses': 0,
                'active_users': 0,
                'total_admins': Admin.objects.filter(is_active=True).count()
            },
            'recent_courses': [],
            'admin_info': AdminSerializer(request.user).data,
            'debug_note': f'Some stats unavailable: {str(e)}'
        })

@api_view(['PUT'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_admin_profile(request):
    """Update current admin's profile"""
    try:
        admin = request.user
        data = request.data
        
        if 'full_name' in data:
            admin.full_name = data['full_name'].strip()
        if 'phone' in data:
            admin.phone = data['phone'].strip()
            
        admin.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'admin': AdminSerializer(admin).data
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@authentication_classes([AdminJWTAuthentication])
@permission_classes([IsAuthenticated])
def admin_profile(request):
    return Response({
        'admin': AdminSerializer(request.user).data
    })