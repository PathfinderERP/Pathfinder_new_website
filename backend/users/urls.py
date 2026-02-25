from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('profile/', views.get_user_profile, name='profile'),
    path('profile/upload-image/', views.upload_profile_image, name='upload-profile-image'),
    path('profile/remove-image/', views.delete_profile_image, name='remove-profile-image'),
    path('verify-token/', views.verify_token, name='verify-token'),
    path('check-auth/', views.check_auth, name='check-auth'),
    
    # User Management Endpoints
    path('users/', views.get_all_users, name='get-all-users'),
    path('users/stats/', views.get_user_stats, name='user-stats'),
    path('users/<str:user_id>/', views.get_user_detail, name='user-detail'),
    path('users/<str:user_id>/status/', views.update_user_status, name='update-user-status'),
    path('users/<str:user_id>/delete/', views.delete_user, name='delete-user'),
    path('users/<str:user_id>/reset-password/', views.reset_password_admin, name='reset-password-admin'),
]