# courses/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'admin', views.AdminViewSet, basename='admin')
router.register(r'data', views.DataViewSet, basename='data')
router.register(r'purchase', views.PurchaseViewSet, basename='purchase')

urlpatterns = [
    path('', views.root, name='courses_root'),
    path('', include(router.urls)),
]