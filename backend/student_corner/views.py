from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_mongoengine.viewsets import ModelViewSet
from .models import StudentCornerItem, StudentCornerOrder
from .serializers import StudentCornerItemSerializer, StudentCornerOrderSerializer
from users.models import User
from django.conf import settings
import datetime
import logging

logger = logging.getLogger(__name__)
import uuid
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from contact_backend.utils.r2_storage import upload_to_r2

class StudentCornerItemViewSet(ModelViewSet):
    lookup_field = 'id'
    serializer_class = StudentCornerItemSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = StudentCornerItem.objects.all()
        
        # 1. Filter by Category (or Course Type)
        category = self.request.query_params.get('category')
        if category:
            from mongoengine.queryset.visitor import Q
            # Flexible filter: Check both category and course_type fields
            queryset = queryset.filter(Q(category=category) | Q(course_type=category))

        # 2. Filter by Popularity
        is_popular = self.request.query_params.get('popular')
        if is_popular:
            queryset = queryset.filter(is_popular=(is_popular.lower() == 'true'))

        # 3. Filter by Free Delivery
        free_delivery = self.request.query_params.get('free_delivery')
        if free_delivery:
             queryset = queryset.filter(free_delivery=(free_delivery.lower() == 'true'))

        # 4. Filter by Price
        min_price = self.request.query_params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(discounted_price__gte=float(min_price))
            except ValueError:
                pass
            
        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(discounted_price__lte=float(max_price))
                queryset = queryset.filter(discounted_price__lte=float(max_price))
            except ValueError:
                pass

        # 5. Filter by Board
        board = self.request.query_params.get('board')
        if board:
            queryset = queryset.filter(board=board)

        # 6. Filter by Class Level
        class_level = self.request.query_params.get('class_level')
        if class_level:
            queryset = queryset.filter(class_level=class_level)

        # 5. Ordering
        ordering = self.request.query_params.get('ordering')
        if ordering:
            fields = ordering.split(',')
            queryset = queryset.order_by(*fields)
            
        return queryset

    def perform_create(self, serializer):
         user = self.request.user
         identifier = 'System'
         if user and user.is_authenticated:
             identifier = getattr(user, 'email', getattr(user, 'full_name', 'Admin'))
         serializer.save(created_by=identifier)

    def perform_update(self, serializer):
         user = self.request.user
         identifier = 'System'
         if user and user.is_authenticated:
             identifier = getattr(user, 'email', getattr(user, 'full_name', 'Admin'))
         serializer.save(updated_by=identifier)
    @action(detail=False, methods=['post'], url_path='upload-image')
    def upload_image(self, request):
        """Upload item image to Cloudflare R2"""
        try:
            if 'image' not in request.FILES:
                return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
                
            image_file = request.FILES['image']
            
            # Try R2 Upload
            try:
                image_data = image_file.read()
                image_file.seek(0)
                
                public_url = upload_to_r2(
                    file_data=image_data,
                    file_name=image_file.name,
                    content_type=image_file.content_type,
                    folder='student_corner'
                )
                
                if public_url:
                    return Response({
                        'message': 'Image uploaded successfully',
                        'url': public_url
                    })
            except Exception as r2_err:
                print(f"⚠️ R2 upload failed: {r2_err}")
                image_file.seek(0)

            # Local Fallback
            file_ext = os.path.splitext(image_file.name)[1] or '.jpg'
            unique_filename = f"student_corner/{uuid.uuid4().hex[:12]}{file_ext}"
            saved_path = default_storage.save(unique_filename, ContentFile(image_file.read()))
            base_url = request.build_absolute_uri('/')[:-1]
            image_url = f"{base_url}/media/{saved_path}"
            
            return Response({
                'message': 'Image uploaded locally',
                'url': image_url
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StudentCornerOrderViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get orders for the current user"""
        try:
            user_id = str(request.user.id)
            orders = StudentCornerOrder.objects(user_id=user_id)
            serializer = StudentCornerOrderSerializer(orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['get'])
    def user_orders(self, request):
        """Admin only: Get orders for a specific user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id required"}, status=400)
            
        try:
            orders = StudentCornerOrder.objects(user_id=user_id)
            serializer = StudentCornerOrderSerializer(orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class StudentCornerPurchaseViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    
    def create(self, request):
        """Handle student corner item purchase and automatic registration"""
        try:
            data = request.data
            user_data = data.get('user', {})
            items = data.get('items', []) # List of {id, name, price, quantity}
            total_amount = data.get('totalAmount', 0)
            payment_details = data.get('payment', {})
            
            if not items:
                return Response({"error": "No items provided"}, status=400)

            # 1. Handle User (Same logic as Course purchase)
            user = None
            user_created_new = False
            
            if request.user and request.user.is_authenticated:
                user = request.user
            else:
                email = user_data.get('email')
                phone = user_data.get('phone')
                
                if not email:
                    return Response({"error": "Email is required for checkout"}, status=400)
                
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
                        password = user_data.get('password') or "Student@123"
                        user.set_password(password)
                        user.save()
                        user_created_new = True
                    except Exception as e:
                        if "phone" in str(e):
                            user = User.objects(phone=phone).first()
                            if not user: raise e
                        else:
                            raise e

            if not user:
                return Response({"error": "Could not verify or create user"}, status=400)

            # 2. Create Order
            order = StudentCornerOrder(
                user_id=str(user.id),
                full_name=user.full_name,
                email=user.email,
                phone=user.phone,
                items=items,
                total_amount=total_amount,
                payment_id=f"SC-PAY-{datetime.datetime.now().timestamp()}",
                payment_status='completed',
                delivery_address={
                    'area': user.area,
                    'school': user.school,
                    'board': getattr(user, 'board', '')
                }
            )
            order.save()
            
            # 3. Generate Token
            token = user.generate_jwt_token()
            
            return Response({
                "message": "Items purchased successfully",
                "token": token,
                "order_id": str(order.id),
                "user": {
                    "id": str(user.id),
                    "fullName": user.full_name,
                    "email": user.email,
                    "student_class": user.student_class,
                    "role": "student"
                }
            })
            
        except Exception as e:
            logger.error(f"Student Corner Purchase failed: {e}")
            return Response({"error": str(e)}, status=500)
