from django.urls import path, include
from rest_framework_mongoengine import routers
from .views import JEEHubViewSet

router = routers.DefaultRouter()
router.register(r'jee-hub', JEEHubViewSet, basename='jee-hub')

urlpatterns = [
    path('', include(router.urls)),
]
