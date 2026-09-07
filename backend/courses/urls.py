# courses/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import icici_views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'business/admin', views.AdminViewSet, basename='admin')
router.register(r'data', views.DataViewSet, basename='data')
router.register(r'purchase', views.PurchaseViewSet, basename='purchase')
router.register(r'mocktests', views.MockTestViewSet, basename='mocktest')

urlpatterns = [
    path('', views.root, name='courses_root'),
    path('icici/generate-hash/', icici_views.ICICIHashGeneratorView.as_view(), name='icici-generate-hash'),
    path('', include(router.urls)),
]