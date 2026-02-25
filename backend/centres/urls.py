# centres/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import upload_image, upload_centre_logo, upload_topper_image, get_centre_logo

router = DefaultRouter()
router.register(r'', views.CentreViewSet, basename='centre')

urlpatterns = [
    path('', include(router.urls)),
    
    # Existing endpoints
    path('centres/states/', views.CentreViewSet.as_view({'get': 'states'}), name='centre-states'),
    path('centres/districts/', views.CentreViewSet.as_view({'get': 'districts'}), name='centre-districts'),
    path('centres/centres/', views.CentreViewSet.as_view({'get': 'centres'}), name='centre-location-list'),
    path('centres/centre_details/', views.CentreViewSet.as_view({'get': 'centre_details'}), name='centre-details'),
    path('centres/topper_categories/', views.CentreViewSet.as_view({'get': 'topper_categories'}), name='centre-topper-categories'),
    
    # Image upload endpoints (keep existing for general uploads)
    path('upload/image/', upload_image, name='upload-image'),
    
    # NEW: Direct MongoDB image storage endpoints
    path('<str:centre_id>/upload-logo/', upload_centre_logo, name='upload-centre-logo'),
    path('<str:centre_id>/upload-topper-image/', upload_topper_image, name='upload-topper-image'),
    path('<str:centre_id>/logo/', get_centre_logo, name='get-centre-logo'),
]

