from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_mongoengine import viewsets as mongo_viewsets
from django.http import HttpResponse
from .models import JobPost, JobApplication
from .serializers import (
    JobPostSerializer, 
    JobApplicationSerializer, 
    JobApplicationCreateSerializer,
    JobApplicationStatusSerializer
)
from admin_auth.models import Admin
import jwt
from django.conf import settings
import logging
import json
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import JobApplication
from datetime import datetime  # Add this import

logger = logging.getLogger(__name__)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class JobPostViewSet(mongo_viewsets.ModelViewSet):
    serializer_class = JobPostSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def get_permissions(self):
        """
        Allow public access for listing and viewing jobs.
        Require authentication for applications (handled in JobApplicationViewSet).
        Require admin status for management (create, update, delete).
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = JobPost.objects.all()
        
        # Handle query parameters for public access
        is_active_param = self.request.query_params.get('is_active')
        is_featured_param = self.request.query_params.get('is_featured')
        
        # Apply query parameter filters
        if is_active_param is not None:
            is_active = is_active_param.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        
        if is_featured_param is not None:
            is_featured = is_featured_param.lower() == 'true'
            queryset = queryset.filter(is_featured=is_featured)
        
        # Security: For regular users, only show active jobs unless specifically asked by admin
        is_staff = getattr(self.request.user, 'is_staff', False)
        
        if not is_staff and is_active_param is None:
            queryset = queryset.filter(is_active=True)
        
        return queryset

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
                
                fallback_admin = Admin.objects.filter(is_superuser=True).first()
                if fallback_admin:
                    return fallback_admin
                    
        except Exception as e:
            logger.error(f"Error getting admin from JWT: {e}")
        
        return None

    def perform_create(self, serializer):
        admin_user = self.get_admin_from_jwt()
        if admin_user:
            serializer.save(created_by=admin_user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def toggle_active(self, request, id=None):
        job_post = self.get_object()
        job_post.is_active = not job_post.is_active
        job_post.save()
        
        # Debug log
        print(f"🔄 Toggled job {job_post.id} active status to: {job_post.is_active}")
        
        return Response({
            'id': str(job_post.id),
            'is_active': job_post.is_active,
            'message': f'Job post {"activated" if job_post.is_active else "deactivated"}'
        })

class JobApplicationViewSet(mongo_viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'create':
            return JobApplicationCreateSerializer
        elif self.action == 'update_status':
            return JobApplicationStatusSerializer
        return JobApplicationSerializer

    def get_queryset(self):
        queryset = JobApplication.objects.all()
        
        # Security: Safe check for is_staff attribute
        is_staff = getattr(self.request.user, 'is_staff', False)
        
        if not is_staff:
            # Non-admin users can only see their applications for ACTIVE jobs
            queryset = queryset.filter(
                applicant_email=self.request.user.email,
                job_post__is_active=True  # CRITICAL: Only show applications for active jobs
            )
        
        return queryset

    # FIXED: This create method was outside the class - now properly indented
    def create(self, request, *args, **kwargs):
        try:
            logger.info("Creating job application...")
            
            # Handle form data parsing for nested objects
            data = request.data.copy()
            
            # Debug: log incoming data
            logger.info(f"Incoming data keys: {list(data.keys())}")
            
            # Parse work_experience from form data
            work_experience_data = []
            i = 0
            while f'work_experience[{i}][company]' in data:
                exp_data = {
                    'company': data.get(f'work_experience[{i}][company]', ''),
                    'position': data.get(f'work_experience[{i}][position]', ''),
                    'start_date': data.get(f'work_experience[{i}][start_date]', ''),
                    'end_date': data.get(f'work_experience[{i}][end_date]', ''),
                    'currently_working': data.get(f'work_experience[{i}][currently_working]', 'false').lower() == 'true',
                    'description': data.get(f'work_experience[{i}][description]', '')
                }
                # Convert single-item lists to single values
                for key in exp_data:
                    if isinstance(exp_data[key], list) and len(exp_data[key]) == 1:
                        exp_data[key] = exp_data[key][0]
                
                if exp_data['company'] and exp_data['position']:
                    work_experience_data.append(exp_data)
                i += 1
            
            # If no form data found, check if work_experience exists but is empty
            if not work_experience_data and 'work_experience' in data:
                work_experience_input = data['work_experience']
                # Handle case where it's an empty nested array [[]]
                if (isinstance(work_experience_input, list) and 
                    len(work_experience_input) == 1 and 
                    isinstance(work_experience_input[0], list) and 
                    len(work_experience_input[0]) == 0):
                    # It's an empty nested array, set to empty list
                    work_experience_data = []
                elif isinstance(work_experience_input, str) and work_experience_input.strip():
                    try:
                        work_experience_data = json.loads(work_experience_input)
                        if not isinstance(work_experience_data, list):
                            work_experience_data = [work_experience_data]
                    except json.JSONDecodeError as e:
                        logger.error(f"Error parsing work_experience JSON: {e}")
                        work_experience_data = []
            
            data['work_experience'] = work_experience_data
            
            # Parse education_details from form data
            education_details_data = []
            j = 0
            while f'education_details[{j}][institution]' in data:
                edu_data = {
                    'institution': data.get(f'education_details[{j}][institution]', ''),
                    'degree': data.get(f'education_details[{j}][degree]', ''),
                    'field_of_study': data.get(f'education_details[{j}][field_of_study]', ''),
                }
                
                # Handle numeric fields
                year_completed = data.get(f'education_details[{j}][year_completed]', '')
                if year_completed and str(year_completed).strip():
                    try:
                        edu_data['year_completed'] = int(year_completed)
                    except (ValueError, TypeError):
                        pass
                
                percentage = data.get(f'education_details[{j}][percentage]', '')
                if percentage and str(percentage).strip():
                    try:
                        edu_data['percentage'] = float(percentage)
                    except (ValueError, TypeError):
                        pass
                # Convert single-item lists to single values
                for key in edu_data:
                    if isinstance(edu_data[key], list) and len(edu_data[key]) == 1:
                        edu_data[key] = edu_data[key][0]
                
                if edu_data['institution'] and edu_data['degree']:
                    education_details_data.append(edu_data)
                j += 1
            
            # If no form data found, check if education_details exists but is empty
            if not education_details_data and 'education_details' in data:
                education_details_input = data['education_details']
                # Handle case where it's an empty nested array [[]]
                if (isinstance(education_details_input, list) and 
                    len(education_details_input) == 1 and 
                    isinstance(education_details_input[0], list) and 
                    len(education_details_input[0]) == 0):
                    # It's an empty nested array, set to empty list
                    education_details_data = []
                elif isinstance(education_details_input, str) and education_details_input.strip():
                    try:
                        education_details_data = json.loads(education_details_input)
                        if not isinstance(education_details_data, list):
                            education_details_data = [education_details_data]
                    except json.JSONDecodeError as e:
                        logger.error(f"Error parsing education_details JSON: {e}")
                        education_details_data = []
            
            data['education_details'] = education_details_data
            
            # Handle skills array
            skills_data = []
            k = 0
            while f'skills[{k}]' in data:
                skill = data[f'skills[{k}]']
                # Convert single-item lists to single values
                if isinstance(skill, list) and len(skill) == 1:
                    skill = skill[0]
                if skill and str(skill).strip():
                    skills_data.append(str(skill).strip())
                k += 1
            
            # If no indexed skills found, check if skills exists but is empty
            if not skills_data and 'skills' in data:
                skills_input = data['skills']
                # Handle case where it's an empty nested array [[]]
                if (isinstance(skills_input, list) and 
                    len(skills_input) == 1 and 
                    isinstance(skills_input[0], list) and 
                    len(skills_input[0]) == 0):
                    # It's an empty nested array, set to empty list
                    skills_data = []
                elif isinstance(skills_input, str):
                    skills_data = [skill.strip() for skill in skills_input.split(',') if skill.strip()]
                elif isinstance(skills_input, list):
                    skills_data = [str(skill).strip() for skill in skills_input if str(skill).strip()]
            
            data['skills'] = skills_data
            
            # Set default empty strings for optional fields if they are empty
            optional_fields = [
                'portfolio_url', 'linkedin_url', 'applicant_address', 'current_company', 
                'current_position', 'current_salary', 'expected_salary', 'notice_period', 
                'highest_education', 'additional_info'
            ]
            
            for field in optional_fields:
                if field in data and (data[field] is None or data[field] == ''):
                    data[field] = ''
            
            # Convert to a plain dictionary for the serializer to avoid QueryDict list-wrapping issues
            # Especially for 'work_experience', 'education_details', and 'skills'
            final_data = {}
            for key in data.keys():
                if key in ['work_experience', 'education_details', 'skills']:
                    # These are already processed as lists
                    final_data[key] = data[key]
                elif key == 'cv_file':
                    # Keep the file object
                    final_data[key] = data[key]
                else:
                    # For other fields, if they are still lists from the QueryDict, take the first item
                    val = data[key]
                    if isinstance(val, list) and len(val) > 0:
                        final_data[key] = val[0]
                    else:
                        final_data[key] = val
            
            # Additional cleanup: remove any fields that might have become empty nested lists
            for list_field in ['work_experience', 'education_details', 'skills']:
                if list_field in final_data:
                    # If it's a list containing an empty list (QueryDict artifact), make it a flat empty list
                    if isinstance(final_data[list_field], list) and len(final_data[list_field]) == 1:
                        if final_data[list_field][0] == []:
                            final_data[list_field] = []
            
            # Debug: Log final plain dict
            debug_final = final_data.copy()
            if 'cv_file' in debug_final:
                debug_final['cv_file'] = f"File: {debug_final['cv_file'].name}" if hasattr(debug_final['cv_file'], 'name') else "File object"
            logger.info(f"Final plain dict for serializer: {debug_final}")
            
            serializer = self.get_serializer(data=final_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            logger.error(f"Error creating job application: {str(e)}")
            if 'serializer' in locals() and serializer.errors:
                logger.error(f"Serializer errors: {serializer.errors}")
            logger.error(f"Request data: {dict(request.data)}")
            logger.error(f"Processed data: {data if 'data' in locals() else 'Not processed'}")
            
            error_details = str(e)
            if 'serializer' in locals() and serializer.errors:
                error_details = serializer.errors
                
            return Response(
                {"error": "Failed to create application", "details": error_details},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Remove @action decorators from download methods so they work with URL routing
    def download_cv(self, request, id=None):
        """Download CV file - handles both R2 URLs and legacy GridFS"""
        application = self.get_object()
        
        # Check for R2 URL first
        if application.cv_url:
            from django.shortcuts import redirect
            return redirect(application.cv_url)
            
        # Fallback to GridFS for legacy files
        try:
            grid_file = application.get_file_from_gridfs('cv')
            if not grid_file:
                return Response(
                    {"error": "CV file not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            response = HttpResponse(
                grid_file.read(), 
                content_type=grid_file.content_type or 'application/octet-stream'
            )
            filename = application.cv_filename or "cv.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            logger.error(f"Error downloading CV: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def download_cover_letter(self, request, id=None):
        """Download cover letter - handles both R2 URLs and legacy GridFS"""
        application = self.get_object()
        
        # Check for R2 URL first
        if application.cover_letter_url:
            from django.shortcuts import redirect
            return redirect(application.cover_letter_url)
        
        # Fallback to GridFS
        if not application.cover_letter_file_id:
            return Response(
                {"error": "Cover letter not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            grid_file = application.get_file_from_gridfs('cover_letter')
            response = HttpResponse(
                grid_file.read(), 
                content_type=grid_file.content_type or 'application/octet-stream'
            )
            filename = application.cover_letter_filename or "cover_letter.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            logger.error(f"Error downloading cover letter: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def update_status(self, request, id=None):
        application = self.get_object()
        serializer = JobApplicationStatusSerializer(application, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'Status updated successfully',
                'new_status': serializer.validated_data['status']
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], permission_classes=[IsAdminUser])
    def delete_cv(self, request, id=None):
        """Delete CV file from GridFS"""
        application = self.get_object()
        
        try:
            application.delete_file_from_gridfs('cv')
            return Response({"message": "CV file deleted successfully"})
        except Exception as e:
            logger.error(f"Error deleting CV: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['delete'], permission_classes=[IsAdminUser])
    def delete_cover_letter(self, request, id=None):
        """Delete cover letter from GridFS"""
        application = self.get_object()
        
        try:
            application.delete_file_from_gridfs('cover_letter')
            return Response({"message": "Cover letter deleted successfully"})
        except Exception as e:
            logger.error(f"Error deleting cover letter: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# This function should be outside the class
@api_view(['GET'])
def download_application_cv(request, application_id):
    """Download CV for a job application - handles both R2 URLs and GridFS"""
    try:
        application = JobApplication.objects.get(id=application_id)
        
        # Check for R2 URL first
        if application.cv_url:
            from django.shortcuts import redirect
            return redirect(application.cv_url)
            
        # Fallback to GridFS
        if not application.cv_file_id:
            return Response({'error': 'CV file not found'}, status=404)
        
        grid_file = application.get_file_from_gridfs('cv')
        
        if not grid_file:
            return Response({'error': 'CV file not found in storage'}, status=404)
        
        response = HttpResponse(
            grid_file.read(),
            content_type=grid_file.content_type or 'application/octet-stream'
        )
        response['Content-Disposition'] = f'attachment; filename="{application.cv_filename or "cv.pdf"}"'
        return response
        
    except JobApplication.DoesNotExist:
        return Response({'error': 'Application not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)