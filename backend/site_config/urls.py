from django.urls import path, include
from rest_framework import routers
from .views import PublicPopupConfigView, AdminPopupConfigViewSet

router = routers.DefaultRouter()
router.register(r'admin/popup-config', AdminPopupConfigViewSet, basename='admin-popup-config')

urlpatterns = [
    path('public/popup-config/latest/', PublicPopupConfigView.as_view(), name='public-popup-config-latest'),
    path('', include(router.urls)),
]
