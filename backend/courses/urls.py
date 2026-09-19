# courses/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import icici_views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'business/admin', views.AdminViewSet, basename='admin')
router.register(r'data', views.DataViewSet, basename='data')
router.register(r'purchase', views.PurchaseViewSet, basename='purchase')
router.register(r'mocktests', views.MockTestViewSet, basename='mocktest')

urlpatterns = [
    path('', views.root, name='courses_root'),
    path('icici/config/', icici_views.ICICIConfigView.as_view(), name='icici-config'),
    path('icici/config', icici_views.ICICIConfigView.as_view()),
    path('icici/generate-hash/', icici_views.ICICIHashGeneratorView.as_view(), name='icici-generate-hash'),
    path('icici/generate-hash', icici_views.ICICIHashGeneratorView.as_view()),
    path('icici/proxy/', icici_views.ICICIProxyView.as_view(), name='icici-proxy'),
    path('icici/proxy', icici_views.ICICIProxyView.as_view()),
    path('icici/callback/', icici_views.ICICICallbackView.as_view(), name='icici-callback'),
    path('icici/callback', icici_views.ICICICallbackView.as_view()),
    path('icici/webhook/', icici_views.ICICIWebhookView.as_view(), name='icici-webhook'),
    path('icici/webhook', icici_views.ICICIWebhookView.as_view()),
    path('', include(router.urls)),
]