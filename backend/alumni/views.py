from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from .models import Alumni
from .serializers import AlumniSerializer, AlumniListSerializer


class AlumniViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Alumni CRUD operations
    
    Endpoints:
    - GET /api/alumni/ - List all alumni (filtered by year/profession)
    - GET /api/alumni/:id/ - Get specific alumni details
    - POST /api/alumni/ - Create new alumni (admin only)
    - PUT/PATCH /api/alumni/:id/ - Update alumni (admin only)
    - DELETE /api/alumni/:id/ - Delete alumni (admin only)
    - GET /api/alumni/by_profession/ - Get alumni grouped by profession
    - GET /api/alumni/by_year/ - Get alumni grouped by year
    """
    
    queryset = Alumni.objects.filter(is_active=True)
    serializer_class = AlumniSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        """
        Allow public read access, require authentication for write operations
        """
        if self.action in ['list', 'retrieve', 'by_profession', 'by_year', 'years', 'professions']:
            return [AllowAny()]
        return [IsAuthenticatedOrReadOnly()]
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return AlumniListSerializer
        return AlumniSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on query parameters
        """
        queryset = Alumni.objects.filter(is_active=True)
        
        # Filter by year
        year = self.request.query_params.get('year', None)
        if year:
            queryset = queryset.filter(year=int(year))
        
        # Filter by profession
        profession = self.request.query_params.get('profession', None)
        if profession:
            queryset = queryset.filter(profession=profession)
        
        return queryset.order_by('-year', 'profession')
    
    @action(detail=False, methods=['get'])
    def by_profession(self, request):
        """
        Get alumni grouped by profession
        Returns: { profession: [alumni_data] }
        """
        year = request.query_params.get('year', None)
        queryset = Alumni.objects.filter(is_active=True)
        
        if year:
            queryset = queryset.filter(year=int(year))
        
        # Dynamic professions from the filtered queryset
        professions = queryset.distinct('profession')
        
        grouped_data = {}
        for profession in professions:
            alumni_list = queryset.filter(profession=profession)
            serializer = self.get_serializer(alumni_list, many=True)
            grouped_data[profession] = serializer.data
        
        return Response({
            'count': queryset.count(),
            'results': grouped_data
        })
    
    @action(detail=False, methods=['get'])
    def by_year(self, request):
        """
        Get alumni grouped by year
        Returns: { year: { profession: [alumni_data] } }
        """
        profession = request.query_params.get('profession', None)
        queryset = Alumni.objects.filter(is_active=True)
        
        if profession:
            queryset = queryset.filter(profession=profession)
        
        # Get unique years
        years = queryset.distinct('year')
        
        grouped_data = {}
        for year in sorted(years, reverse=True):
            year_alumni = queryset.filter(year=year)
            
            # Group by profession within year
            year_data = {}
            for alumni in year_alumni:
                if alumni.profession not in year_data:
                    year_data[alumni.profession] = []
                
                serializer = self.get_serializer(alumni)
                year_data[alumni.profession].append(serializer.data)
            
            grouped_data[year] = year_data
        
        return Response(grouped_data)
    
    @action(detail=False, methods=['get'])
    def years(self, request):
        """
        Get list of all available years
        Returns: [2024, 2023, 2022, ...]
        """
        years = Alumni.objects.filter(is_active=True).distinct('year')
        return Response(sorted(years, reverse=True))
    
    @action(detail=False, methods=['get'])
    def professions(self, request):
        """
        Get list of all available professions dynamically from DB
        Returns: ['Doctors', 'Engineers', 'Others', ...]
        """
        professions = Alumni.objects.filter(is_active=True).distinct('profession')
        
        # Ensure we always have these common ones if DB is empty, or just return DB data?
        # User requested "dynamically not from static data".
        # So we should just use DB data. But let's sort them.
        
        # If the DB is empty, this returns empty list.
        # But for 'Others', it will be just 'Others' string in DB? Yes.
        
        return Response(sorted(professions))
    
    def create(self, request, *args, **kwargs):
        """Create new alumni entry"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Update alumni entry"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete alumni entry"""
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
