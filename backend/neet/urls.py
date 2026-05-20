from django.urls import path, include
from rest_framework_mongoengine import routers
from .views import NEETHubViewSet

router = routers.DefaultRouter()
router.register(r'neet-hub', NEETHubViewSet, basename='neet-hub')

urlpatterns = [
    path('', include(router.urls)),
]
