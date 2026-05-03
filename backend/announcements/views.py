from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from .models import Announcement
from .serializers import AnnouncementSerializer

class ActiveAnnouncementView(generics.ListAPIView):
    """View to get currently active announcements for the frontend"""
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Announcement.objects(is_active=True).order_by('-priority', '-created_at')

class AnnouncementAdminViewSet(viewsets.ModelViewSet):
    """ViewSet for admin management of announcements"""
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated] # Adjust based on your admin auth

    def get_queryset(self):
        return Announcement.objects.all()
