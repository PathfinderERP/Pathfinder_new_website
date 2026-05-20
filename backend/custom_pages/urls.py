from django.urls import path, include
from rest_framework_mongoengine import routers
from .views import CustomPageViewSet

router = routers.DefaultRouter()
router.register(r'pages', CustomPageViewSet, basename='custom-pages')

urlpatterns = [
    path('', include(router.urls)),
]
