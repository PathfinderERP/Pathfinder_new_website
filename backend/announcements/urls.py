from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActiveAnnouncementView, AnnouncementAdminViewSet

router = DefaultRouter()
router.register(r'admin/announcements', AnnouncementAdminViewSet, basename='announcement-admin')

urlpatterns = [
    path('', include(router.urls)),
    path('active/', ActiveAnnouncementView.as_view(), name='active-announcements'),
]
