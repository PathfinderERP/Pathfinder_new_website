from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'items', views.StudentCornerItemViewSet, basename='student-corner-items')
router.register(r'orders', views.StudentCornerOrderViewSet, basename='student-corner-orders')
router.register(r'purchase', views.StudentCornerPurchaseViewSet, basename='student-corner-purchase')

urlpatterns = [
    path('', include(router.urls)),
]
