from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.create_registration, name='landing-register'),
    path('list/', views.list_registrations, name='landing-list'),
    path('registrations/<int:pk>/', views.registration_detail, name='landing-detail'),
]
