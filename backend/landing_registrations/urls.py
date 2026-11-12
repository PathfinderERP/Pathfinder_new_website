from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.create_registration, name='landing-register'),
    path('register', views.create_registration),
    path('send-otp/', views.send_otp_view, name='landing-send-otp'),
    path('send-otp', views.send_otp_view),
    path('verify-otp/', views.verify_otp_view, name='landing-verify-otp'),
    path('verify-otp', views.verify_otp_view),
    path('list/', views.list_registrations, name='landing-list'),
    path('registrations/<str:pk>/', views.registration_detail, name='landing-detail'),
]
