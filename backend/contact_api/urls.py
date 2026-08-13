from django.urls import path
from .views import ApplicationListCreateView, ApplicationDetailView, CounsellingBookingCreateView

urlpatterns = [
    path('contact/submit/', ApplicationListCreateView.as_view(), name='contact-submit'),
    path('contact/book-counselling/', CounsellingBookingCreateView.as_view(), name='book-counselling'),
    path('applications/', ApplicationListCreateView.as_view(), name='application-list-create'),
    path('applications/<str:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
]


