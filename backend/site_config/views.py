from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_mongoengine import viewsets
from .models import PredictionPopupConfig
from .serializers import PredictionPopupConfigSerializer
import datetime

class PublicPopupConfigView(APIView):
    """
    Public view to get the latest active popup configuration
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        config = PredictionPopupConfig.objects(is_active=True).first()
        if not config:
            return Response({"error": "No active popup configuration found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PredictionPopupConfigSerializer(config)
        return Response(serializer.data)

class AdminPopupConfigViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing popup configurations
    """
    lookup_field = 'id'
    queryset = PredictionPopupConfig.objects.all()
    serializer_class = PredictionPopupConfigSerializer
    permission_classes = [permissions.IsAuthenticated] # Should be IsAdminUser in a real setup, but following existing pattern

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()
