# courses/views.py - UPDATED CREATE METHOD
from django.http import JsonResponse
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_mongoengine import viewsets as mongo_viewsets
from mongoengine import Q
from .models import Course, Enrollment
from users.models import User
from .serializers import CourseSerializer, EnrollmentSerializer
import jwt
from django.conf import settings
import logging
import datetime

logger = logging.getLogger(__name__)

class CourseViewSet(mongo_viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    pagination_class = None
    permission_classes = [AllowAny]
    lookup_field = 'id'

    def get_queryset(self):
        """Get queryset with filtering"""
        queryset = Course.objects.all()
        
        # Apply filters from query parameters
        state = self.request.query_params.get('state')
        district = self.request.query_params.get('district')
        centre = self.request.query_params.get('centre')
        mode = self.request.query_params.get('mode')
        is_active = self.request.query_params.get('is_active')
        target_exam = self.request.query_params.get('target_exam')
        class_level = self.request.query_params.get('class_level')
        course_level = self.request.query_params.get('course_level')
        course_level = self.request.query_params.get('course_level')
        programme = self.request.query_params.get('programme')
        search = self.request.query_params.get('search')
        
        # Build filters
        filters = Q()
        
        if state:
            filters &= Q(state=state)
        if district:
            filters &= Q(district=district)
        if centre:
            filters &= Q(centre=centre)
        if mode:
            filters &= Q(mode=mode)
        if is_active is not None:
            filters &= Q(is_active=is_active.lower() == 'true')
        if target_exam:
            filters &= Q(target_exam=target_exam)
        if class_level:
            filters &= Q(class_level=class_level)
        if course_level:
            filters &= Q(course_level=course_level)
        if programme:
            filters &= Q(programme=programme)
        if search:
            filters &= (Q(name__icontains=search) | 
                       Q(description__icontains=search) |
                       Q(centre__icontains=search) |
                       Q(class_level__icontains=search))
        
        return queryset.filter(filters).order_by('-created_at')

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_admin_info_from_jwt(self):
        """Extract admin info from JWT token"""
        try:
            auth_header = self.request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                return None
                
            token = auth_header.split(' ')[1]
            
            # Decode JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            return {
                'admin_id': payload.get('admin_id'),
                'email': payload.get('email'),
                'username': payload.get('username', payload.get('email')),
                'is_superuser': payload.get('is_superuser', False)
            }
                    
        except jwt.ExpiredSignatureError:
            logger.error("JWT token expired")
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid JWT token: {e}")
        except Exception as e:
            logger.error(f"Error getting admin info from JWT: {e}")
        
        return None

    def perform_create(self, serializer):
        """Set creator info based on JWT token"""
        try:
            admin_info = self.get_admin_info_from_jwt()
            
            if admin_info:
                logger.info(f"Setting creator info from JWT: {admin_info['email']}")
                
                # Add creator info to serializer context
                creator_info = {
                    'created_by': admin_info.get('username'),
                    'created_by_email': admin_info.get('email')
                }
                
                # Save with creator info
                serializer.save(**creator_info)
            else:
                logger.warning("No admin info in JWT, saving without creator info")
                serializer.save()
                
        except Exception as e:
            logger.error(f"Error in perform_create: {e}")
            serializer.save()

    def perform_update(self, serializer):
        """Update course"""
        try:
            # Add updated timestamp
            instance = serializer.save()
            instance.updated_at = datetime.datetime.now(datetime.timezone.utc)
            instance.save()
        except Exception as e:
            logger.error(f"Error in perform_update: {e}")
            raise

    def create(self, request, *args, **kwargs):
        """Override create for logging and validation"""
        logger.info("Course creation request received")
        logger.debug(f"Request data: {request.data}")
        
        try:
            # Make a mutable copy of the request data
            data = request.data.copy()
            
            # Handle online courses - set appropriate values
            mode = data.get('mode', '').lower()
            centre = data.get('centre', '').lower()
            
            if mode == 'online' or centre == 'online':
                # Clear state and district for online courses
                data['state'] = None
                data['district'] = None
                data['mode'] = 'online'
                
                # Set default location and address if not provided
                if not data.get('location'):
                    data['location'] = 'Online'
                if not data.get('address'):
                    data['address'] = 'Virtual Classroom'
            
            # Remove slug if it's empty (it will be auto-generated)
            if 'slug' in data and (data['slug'] == '' or data['slug'] is None):
                data.pop('slug', None)
            
            # Remove code if it's empty (it will be auto-generated)
            if 'code' in data and (data['code'] == '' or data['code'] is None):
                data.pop('code', None)
            
            # Convert empty strings to None for optional fields
            for field in ['state', 'district', 'badge', 'offers', 'programme', 'discounted_price']:
                if field in data and data[field] == '':
                    data[field] = None
            
            logger.debug(f"Processed data for creation: {data}")
            
            # Validate and create
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            
            logger.info("Course created successfully")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except serializers.ValidationError as e:
            logger.error(f"Validation error in course creation: {e}")
            return Response(
                {"error": "Validation failed", "details": e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Course creation failed: {e}", exc_info=True)
            return Response(
                {"error": "Failed to create course", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        """Override update for logging"""
        logger.info(f"Course update request for ID: {kwargs.get('id')}")
        
        try:
            response = super().update(request, *args, **kwargs)
            logger.info("Course updated successfully")
            return response
        except Exception as e:
            logger.error(f"Course update failed: {e}")
            return Response(
                {"error": "Failed to update course", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        """Override delete for hard delete"""
        try:
            instance = self.get_object()
            instance.delete()
            logger.info(f"Course {instance.id} deleted")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Course deletion failed: {e}")
            return Response(
                {"error": "Failed to delete course", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Add custom actions
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get course statistics"""
        try:
            total = Course.objects.count()
            active = Course.objects.filter(is_active=True).count()
            online = Course.objects.filter(mode='online').count()
            offline = Course.objects.filter(mode='offline').count()
            hybrid = Course.objects.filter(mode='hybrid').count()
            
            return Response({
                'total_courses': total,
                'active_courses': active,
                'online_courses': online,
                'offline_courses': offline,
                'hybrid_courses': hybrid,
            })
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return Response(
                {"error": "Failed to get statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def unique_centres(self, request):
        """Get unique centres"""
        try:
            centres = Course.objects.distinct('centre')
            return Response({'centres': sorted([c for c in centres if c])})
        except Exception as e:
            logger.error(f"Error getting centres: {e}")
            return Response(
                {"error": "Failed to get centres"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def unique_states(self, request):
        """Get unique states"""
        try:
            states = Course.objects.distinct('state')
            return Response({'states': sorted([s for s in states if s])})
        except Exception as e:
            logger.error(f"Error getting states: {e}")
            return Response(
                {"error": "Failed to get states"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def unique_districts(self, request):
        """Get unique districts for a state"""
        try:
            state = request.query_params.get('state')
            if not state:
                return Response(
                    {"error": "State parameter required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            districts = Course.objects.filter(state=state).distinct('district')
            return Response({
                'state': state,
                'districts': sorted([d for d in districts if d])
            })
        except Exception as e:
            logger.error(f"Error getting districts: {e}")
            return Response(
                {"error": "Failed to get districts"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def online_courses(self, request):
        """Get online courses only"""
        try:
            courses = Course.objects.filter(mode='online', is_active=True)
            serializer = self.get_serializer(courses, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error getting online courses: {e}")
            return Response(
                {"error": "Failed to get online courses"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def featured_courses(self, request):
        """Get featured courses"""
        try:
            courses = Course.objects.filter(is_featured=True, is_active=True)
            serializer = self.get_serializer(courses, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error getting featured courses: {e}")
            return Response(
                {"error": "Failed to get featured courses"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, id=None):
        """Toggle course active status"""
        try:
            course = self.get_object()
            course.is_active = not course.is_active
            course.updated_at = datetime.datetime.utcnow()
            course.save()
            
            status_text = 'activated' if course.is_active else 'deactivated'
            logger.info(f"Course {course.id} {status_text}")
            
            return Response({
                'message': f'Course {status_text} successfully',
                'is_active': course.is_active
            })
        except Exception as e:
            logger.error(f"Error toggling course status: {e}")
            return Response(
                {"error": "Failed to toggle course status", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, id=None):
        """Toggle course featured status"""
        try:
            course = self.get_object()
            course.is_featured = not course.is_featured
            course.updated_at = datetime.datetime.utcnow()
            course.save()
            
            status_text = 'featured' if course.is_featured else 'unfeatured'
            logger.info(f"Course {course.id} {status_text}")
            
            return Response({
                'message': f'Course {status_text} successfully',
                'is_featured': course.is_featured
            })
        except Exception as e:
            logger.error(f"Error toggling featured status: {e}")
            return Response(
                {"error": "Failed to toggle featured status", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        """Get courses enrolled by the current user"""
        try:
            user_id = str(request.user.id)
            # Use order_by to show latest enrollments first
            enrollments = Enrollment.objects(user_id=user_id).order_by('-enrolled_at')
            
            # Get course details
            courses_data = []
            for enrollment in enrollments:
                try:
                    # Check if course exists
                    course = Course.objects(id=enrollment.course_id).first()
                    if course:
                        data = self.get_serializer(course).data
                        data['enrollment_id'] = str(enrollment.id)
                    else:
                        # Fallback for enrollments where course object is missing but we want to show the record
                        data = {
                            'id': str(enrollment.course_id),
                            'enrollment_id': str(enrollment.id),
                            'name': enrollment.course_name or "Unknown Course",
                            'mode': 'unknown',
                            'code': 'N/A',
                            'thumbnail_url': None,
                            'is_missing': True
                        }
                    
                    data['enrolled_at'] = enrollment.enrolled_at
                    data['enrollment_status'] = enrollment.status
                    
                    # Add payment info
                    data['payment_info'] = {
                        'amount_paid': float(enrollment.amount_paid) if enrollment.amount_paid else 0,
                        'payment_id': enrollment.payment_id or 'N/A',
                        'status': getattr(enrollment, 'payment_status', 'completed'),
                        'date': enrollment.enrolled_at
                    }
                    
                    courses_data.append(data)
                except Exception as inner_e:
                    logger.error(f"Error fetching course details for enrollment {enrollment.id}: {inner_e}")
                    continue
                    
            return Response(courses_data)
        except Exception as e:
            logger.error(f"Error getting my courses: {e}")
            return Response(
                {"error": "Failed to get my courses"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def all_data(self, request):
        """Get all courses including inactive ones"""
        try:
            courses = Course.objects.all()
            serializer = CourseSerializer(courses, many=True)
            return Response({
                'count': len(serializer.data),
                'results': serializer.data
            })
        except Exception as e:
            logger.error(f"Error getting all data: {e}")
            return Response(
                {"error": "Failed to get all data", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get detailed analytics"""
        try:
            # Get counts by mode
            by_mode = {
                'online': Course.objects.filter(mode='online').count(),
                'offline': Course.objects.filter(mode='offline').count(),
                'hybrid': Course.objects.filter(mode='hybrid').count(),
                'centre': Course.objects.filter(mode='centre').count(),
            }
            
            # Get counts by target exam
            by_exam = {}
            exams = Course.objects.distinct('target_exam')
            for exam in exams:
                if exam:
                    by_exam[exam] = Course.objects.filter(target_exam=exam).count()
            
            # Get counts by state
            by_state = {}
            states = Course.objects.distinct('state')
            for state in states:
                if state:
                    by_state[state] = Course.objects.filter(state=state).count()
            
            # Recent courses
            recent_courses = Course.objects.order_by('-created_at')[:10]
            recent_serializer = CourseSerializer(recent_courses, many=True)
            
            return Response({
                'total_courses': Course.objects.count(),
                'active_courses': Course.objects.filter(is_active=True).count(),
                'featured_courses': Course.objects.filter(is_featured=True).count(),
                'by_mode': by_mode,
                'by_exam': by_exam,
                'by_state': by_state,
                'recent_courses': recent_serializer.data,
            })
        except Exception as e:
            logger.error(f"Error getting analytics: {e}")
            return Response(
                {"error": "Failed to get analytics", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def user_enrollments(self, request):
        """Get enrollments for a specific user - Admin Only"""
        user_id = request.query_params.get('user_id', '').strip()
        if not user_id:
             return Response({"error": "user_id required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Ensure user_id is treated as string for the query
            enrollments = Enrollment.objects(user_id=str(user_id)).order_by('-enrolled_at')
            data = []
            
            for enrollment in enrollments:
                  # Safer course lookup
                  course_name = enrollment.course_name
                  course_mode = 'unknown'
                  course_code = 'N/A'
                  try:
                      if enrollment.course_id:
                          course = Course.objects(id=enrollment.course_id).first()
                          if course:
                              course_name = course.name
                              course_mode = course.mode
                              course_code = course.code
                  except Exception as e:
                      logger.warning(f"Could not find course info for ID {enrollment.course_id}: {e}")
                  
                  # Prepare cleaned data
                  data.append({
                      'id': str(enrollment.id),
                      'course_id': enrollment.course_id,
                      'course_name': course_name,
                      'course_mode': course_mode,
                      'course_code': course_code,
                      'amount_paid': float(enrollment.amount_paid) if enrollment.amount_paid else 0,
                      'payment_id': enrollment.payment_id or 'N/A',
                      'payment_status': enrollment.payment_status or 'completed',
                      'enrolled_at': enrollment.enrolled_at.isoformat() if enrollment.enrolled_at else None,
                      'status': enrollment.status or 'active'
                  })
            
            logger.info(f"Returning {len(data)} enrollments for user {user_id}")
            return Response(data)
        except Exception as e:
            logger.error(f"Error getting user enrollments for {user_id}: {e}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Indian States and Districts Data
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

class DataViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def states(self, request):
        """Get all Indian states"""
        return Response({
            'states': list(INDIAN_STATES_DISTRICTS.keys()),
            'count': len(INDIAN_STATES_DISTRICTS)
        })
    
    @action(detail=False, methods=['get'])
    def districts(self, request):
        """Get districts for a state"""
        state = request.GET.get('state', 'West Bengal')
        districts = INDIAN_STATES_DISTRICTS.get(state, [])
        return Response({
            'state': state,
            'districts': districts,
            'count': len(districts)
        })
    
    @action(detail=False, methods=['get'])
    def centres(self, request):
        """Get all centres"""
        return Response({
            'centres': CENTRES,
            'count': len(CENTRES)
        })
    
    @action(detail=False, methods=['get'])
    def all_data(self, request):
        """Get all data in one response"""
        return Response({
            'states': list(INDIAN_STATES_DISTRICTS.keys()),
            'centres': CENTRES,
            'state_district_map': INDIAN_STATES_DISTRICTS
        })



class PurchaseViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    def create(self, request):
        """Handle course purchase and registration"""
        try:
            data = request.data
            user_data = data.get('user', {})
            course_id = data.get('courseId')
            payment_details = data.get('payment', {})
            
            if not course_id:
                return Response({"error": "Course ID is required"}, status=400)

            # 1. Handle User
            user = None
            user_created_new = False
            if request.user and request.user.is_authenticated:
                user = request.user
            else:
                # Registration logic
                email = user_data.get('email')
                phone = user_data.get('phone')
                
                if not email:
                     return Response({"error": "Email is required for new registration"}, status=400)
                
                # Check if user exists
                user = User.objects(email=email).first()
                if not user:
                    # Create new user
                    try:
                        user = User(
                            full_name=user_data.get('fullName'),
                            email=email,
                            phone=phone,
                            student_class=user_data.get('studentClass', '12'), 
                            area=user_data.get('area', ''),
                            school=user_data.get('school', ''),
                            board=user_data.get('board', ''),
                            parent_name=user_data.get('parentName', '')
                        )
                        # Set password (either provided or default)
                        password = user_data.get('password')
                        if not password:
                            password = "Student@123" 
                        
                        user.set_password(password)
                        user.save()
                        user_created_new = True
                    except Exception as e:
                         # Handle unique constraint errors (e.g. phone)
                         if "phone" in str(e):
                             # Try to find user by phone?
                             user = User.objects(phone=phone).first()
                             if not user:
                                 raise e
                         else:        
                             raise e
            
            if not user:
                 return Response({"error": "Could not verify or create user"}, status=400)

            # 2. Get Course
            course = Course.objects(id=course_id).first()
            if not course:
                if user_created_new:
                    user.delete()
                return Response({"error": "Course not found"}, status=404)
            
            # 3. Create Enrollment
            try:
                # Check if already enrolled?
                existing_enrollment = Enrollment.objects(user_id=str(user.id), course_id=str(course.id)).first()
                if existing_enrollment:
                    # Update? Or just return success
                    enrollment = existing_enrollment
                else:
                    enrollment = Enrollment(
                        user_id=str(user.id),
                        course_id=str(course.id),
                        course_name=course.name,
                        amount_paid=payment_details.get('amount', 0),
                        payment_id=f"PAY-{datetime.datetime.now().timestamp()}", # Mock ID
                        payment_status='completed'
                    )
                    enrollment.save()
            except Exception as e:
                # Rollback user creation if enrollment failed
                if user_created_new:
                    user.delete()
                raise e
            
            # 4. Generate Token
            token = user.generate_jwt_token()
            
            return Response({
                "message": "Purchase successful",
                "token": token,
                "user": {
                    "id": str(user.id),
                    "fullName": user.full_name,
                    "email": user.email,
                    "student_class": user.student_class,
                    "role": "student"
                }
            })
            
        except Exception as e:
            logger.error(f"Purchase failed: {e}")
            return Response({"error": str(e)}, status=500)

def root(request):
    """API root endpoint"""
    return JsonResponse({
        "message": "Courses API is running!",
        "version": "1.0.0",
        "endpoints": {
            "courses": {
                "list": "/api/courses/",
                "create": "/api/courses/",
                "retrieve": "/api/courses/{id}/",
                "update": "/api/courses/{id}/",
                "delete": "/api/courses/{id}/",
                "stats": "/api/courses/stats/",
                "unique_centres": "/api/courses/unique_centres/",
                "unique_states": "/api/courses/unique_states/",
                "unique_districts": "/api/courses/unique_districts/",
                "online_courses": "/api/courses/online_courses/",
                "featured_courses": "/api/courses/featured_courses/",
                "toggle_active": "/api/courses/{id}/toggle_active/",
                "toggle_featured": "/api/courses/{id}/toggle_featured/",
            },
            "admin": {
                "all_data": "/api/courses/admin/all_data/",
                "analytics": "/api/courses/admin/analytics/",
            },
            "data": {
                "states": "/api/courses/data/states/",
                "districts": "/api/courses/data/districts/",
                "centres": "/api/courses/data/centres/",
                "all_data": "/api/courses/data/all_data/",
            }
        }
    })