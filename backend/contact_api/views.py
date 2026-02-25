from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Application
from .serializers import ApplicationSerializer

from rest_framework.permissions import AllowAny, IsAuthenticated

class ApplicationListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]
    def get(self, request):
        applications = Application.objects.all()
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            application = serializer.save()
            return Response({
                'message': 'Application submitted successfully!',
                'data': ApplicationSerializer(application).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        try:
            return Application.objects.get(id=pk)
        except Application.DoesNotExist:
            return None

    def get(self, request, pk):
        application = self.get_object(pk)
        if application:
            serializer = ApplicationSerializer(application)
            return Response(serializer.data)
        return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request, pk):
        application = self.get_object(pk)
        if not application:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ApplicationSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        application = self.get_object(pk)
        if not application:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
        
        application.delete()
        return Response({'message': 'Application deleted successfully'}, status=status.HTTP_204_NO_CONTENT)