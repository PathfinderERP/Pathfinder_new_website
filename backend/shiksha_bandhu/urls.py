from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.partner_login, name='shiksha-partner-login'),
    path('register/', views.partner_register, name='shiksha-partner-register'),
    path('click/', views.track_click, name='shiksha-track-click'),
    path('stats/<str:partner_id>/', views.get_partner_stats, name='shiksha-partner-stats'),
    path('admin/partners/', views.admin_list_partners, name='shiksha-admin-partners'),
    path('admin/partners/create/', views.admin_create_partner, name='shiksha-admin-create-partner'),
    path('admin/referrals/', views.admin_list_referrals, name='shiksha-admin-referrals'),
    path('admin/referrals/<str:referral_id>/', views.admin_update_referral_status, name='shiksha-admin-update-referral'),
]
