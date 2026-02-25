from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostViewSet, JobApplicationViewSet

router = DefaultRouter()
router.register(r'job-posts', JobPostViewSet, basename='jobpost')
router.register(r'applications', JobApplicationViewSet, basename='jobapplication')

urlpatterns = [
    path('', include(router.urls)),
    
    # Add these custom endpoints for file downloads
    path('applications/<str:id>/download-cv/', 
         JobApplicationViewSet.as_view({'get': 'download_cv'}), 
         name='application-download-cv'),
    
    path('applications/<str:id>/download-cover-letter/', 
         JobApplicationViewSet.as_view({'get': 'download_cover_letter'}), 
         name='application-download-cover-letter'),
]