from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('login/', views.admin_login, name='admin-login'),
    path('register/', views.AdminRegisterView.as_view(), name='admin-register'),
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('verify-reset-token/<str:token>/', views.verify_reset_token, name='verify-reset-token'),
    path('change-password/', views.change_password, name='change-password'),
    path('dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('profile/', views.admin_profile, name='admin-profile'),
    path('update-profile/', views.update_admin_profile, name='update-admin-profile'),
    
    # Admin management endpoints (superadmin only)
    path('create/', views.create_admin, name='create-admin'),
    path('list/', views.get_all_admins, name='get-all-admins'),
    path('<str:admin_id>/permissions/', views.update_admin_permissions, name='update-admin-permissions'),
    path('<str:admin_id>/update/', views.update_admin_details, name='update-admin-details'),
    path('<str:admin_id>/delete/', views.delete_admin, name='delete-admin'),
    
    # Invitation endpoints
    path('invite/', views.AdminInviteView.as_view(), name='admin-invite'),
    path('register-with-invite/', views.AdminRegisterWithInviteView.as_view(), name='register-with-invite'),
]