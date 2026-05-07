from django.urls import path, include
from rest_framework_mongoengine import routers
from .views import WBJEEHubViewSet

router = routers.DefaultRouter()
router.register(r'wbjee-hub', WBJEEHubViewSet, basename='wbjee-hub')

urlpatterns = [
    path('', include(router.urls)),
]
