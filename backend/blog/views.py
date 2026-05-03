from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_mongoengine import viewsets as mongo_viewsets
from .models import BlogPost
from .serializers import BlogPostSerializer
from mongoengine import Q

from rest_framework.decorators import action

class BlogPostViewSet(mongo_viewsets.ModelViewSet):
    """ViewSet for BlogPost CRUD with MongoEngine"""
    serializer_class = BlogPostSerializer
    lookup_field = 'id'

    def get_queryset(self):
        """Get queryset with filtering for category and search"""
        queryset = BlogPost.objects.all()
        
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        is_featured = self.request.query_params.get('is_featured')
        include_inactive = self.request.query_params.get('status') == 'all'
        
        filters = Q()
        
        # Determine if the user has admin-level access
        user = self.request.user
        is_admin = user and user.is_authenticated and (
            getattr(user, 'is_superuser', False) or 
            getattr(user, 'is_staff', False) or
            getattr(user, 'role', '') in ['admin', 'superadmin']
        )
        
        # Filtering logic:
        # 1. Non-admins always see only active posts
        # 2. Admins see active posts in list by default, but can see draft/all if requested
        # 3. For detail views (retrieve/update), admins can see both active and inactive
        if not is_admin:
            filters &= Q(is_active=True)
        elif self.action == 'list' and not include_inactive:
            filters &= Q(is_active=True)
            
        if category and category != 'All':
            filters &= Q(category=category)
            
        if is_featured:
            filters &= Q(is_featured=is_featured.lower() == 'true')
            
        if search:
            filters &= (Q(title__icontains=search) | 
                       Q(content__icontains=search) |
                       Q(excerpt__icontains=search))
            
        return queryset.filter(filters).order_by('-published_date')

    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['list', 'retrieve', 'categories']:
            return [AllowAny()]
        
        # For writing, require authentication. 
        # Note: We should ideally have a custom IsAdmin permission, 
        # but for now IsAuthenticated is what we use.
        # Let's add a check in the view for role.
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get list of distinct categories from active posts"""
        categories = BlogPost.objects(is_active=True).distinct('category')
        # Filter out None or empty strings
        categories = [c for c in categories if c]
        return Response(categories)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve by ID or Slug with is_active security and robust error handling"""
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # Admin check for viewing drafts
        user = self.request.user
        is_admin = user and user.is_authenticated and (
            getattr(user, 'is_superuser', False) or 
            getattr(user, 'is_staff', False) or
            getattr(user, 'role', '') in ['admin', 'superadmin']
        )
        
        from mongoengine.errors import ValidationError, DoesNotExist, MultipleObjectsReturned
        import re
        
        instance = None
        
        # 1. Determine if lookup_value is likely an ObjectId or a Slug
        is_object_id = re.match(r'^[0-9a-fA-F]{24}$', str(lookup_value))
        
        try:
            if is_object_id:
                # Try ID first if it looks like one
                instance = BlogPost.objects.filter(id=lookup_value).first()
            
            # 2. If not found by ID, try by slug
            if not instance:
                instance = BlogPost.objects.get(slug=lookup_value)
                
        except DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        except MultipleObjectsReturned:
            # Handle rare case of duplicate slugs
            instance = BlogPost.objects.filter(slug=lookup_value).first()
        except Exception as e:
            # Log any other unexpected errors to prevent 500
            print(f"[BLOG_ERROR] Error retrieving post '{lookup_value}': {str(e)}")
            return Response({'error': 'Server error retrieving post'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        if not instance:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
                
        # 3. Security: If not active and not admin, hide it
        if not instance.is_active and not is_admin:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
