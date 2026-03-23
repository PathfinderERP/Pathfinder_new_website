from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.create_inquiry, name='franchise_register'),
    path('list/', views.list_inquiries, name='franchise_list'),
    path('registrations/<int:pk>/', views.inquiry_detail, name='franchise_detail'),
]
