# contact_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root(request):
    return JsonResponse({
        "message": "Django API with MongoDB is running!",
        "endpoints": {
            "submit_contact": "/api/contact/submit/",
            "list_contacts": "/api/contacts/",
            "user_register": "/api/auth/register/",
            "user_login": "/api/auth/login/",
            "admin_register": "/api/business/admin/auth/register/",
            "admin_login": "/api/business/admin/auth/login/",
            "admin_forgot_password": "/api/business/admin/auth/forgot-password/",
            "admin_dashboard": "/api/business/admin/auth/dashboard/",
            "courses_list": "/api/courses/courses/",
            "admin_all_data": "/api/courses/business/admin/alldata/",
            "data_states": "/api/courses/data/states/",
            "alumni_list": "/api/alumni/",
            "alumni_by_profession": "/api/alumni/by_profession/",
            "alumni_by_year": "/api/alumni/by_year/",
            "alumni_years": "/api/alumni/years/",
            "alumni_professions": "/api/alumni/professions/",
            "landing_register": "/api/landing/register/",
            "landing_list": "/api/landing/list/",
            "franchise_register": "/api/franchise/register/",
            "franchise_list": "/api/franchise/list/"
        }
    })

from courses import icici_views
from django.core.mail import send_mail
from django.conf import settings
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def test_email_api(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8')) if request.body else {}
        except Exception:
            body = {}
        to_email = body.get('to') or request.POST.get('to') or 'support@pathfinder.edu.in'
        subject = body.get('subject') or request.POST.get('subject') or 'Test Email from Pathfinder API'
        message = body.get('message') or request.POST.get('message') or 'This is a test notification from the Pathfinder system.'
    else:
        to_email = request.GET.get('to', 'support@pathfinder.edu.in')
        subject = request.GET.get('subject', 'Test Email from Pathfinder API')
        message = request.GET.get('message', 'This is a test notification from the Pathfinder system.')

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False
        )
        return JsonResponse({
            'status': 'success',
            'message': 'Email sent successfully',
            'to': to_email,
            'from': settings.DEFAULT_FROM_EMAIL
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

urlpatterns = [
    path('', root, name='root'),
    path('api/test-email/', test_email_api, name='test_email_api'),
    path('business/admin/', admin.site.urls),
    path('api/', include('contact_api.urls')),   # Your existing contact API
    path('api/auth/', include('users.urls')),    # Your existing auth
    path('api/business/admin/auth/', include('admin_auth.urls')),  # ADD THIS LINE - Admin authentication
    path('api/courses/', include('courses.urls')),  # Courses URLs
    path('api/icici/webhook/', icici_views.ICICIWebhookView.as_view()),
    path('api/icici/webhook', icici_views.ICICIWebhookView.as_view()),
    path('api/centres/', include('centres.urls')),
    path('api/business/admin/centres/', include('centres.urls')), # Admin Centres
    path('api/jobs/', include('job_post.urls')),  
    path('api/business/admin/jobs/', include('job_post.urls')), # Admin Jobs
    path('api/', include('alumni.urls')),  # Alumni URLs
    path('api/business/admin/alumni/', include('alumni.urls')), # Admin Alumni
    path('api/student-corner/', include('student_corner.urls')),
    path('api/business/admin/student-corner/', include('student_corner.urls')), # Admin Student Corner
    path('api/blog/', include('blog.urls')),
    path('api/business/admin/blog/', include('blog.urls')), # Admin Blog
    path('api/landing/', include('landing_registrations.urls')),  # Landing page registrations
    path('api/franchise/', include('franchise_inquiry.urls')),  # Franchise inquiries
    path('api/business/admin/applications/', include('contact_api.urls')), # Admin Applications
    path('api/announcements/', include('announcements.urls')), # Announcements API
    path('api/wbjee/', include('wbjee.urls')), # WBJEE Hub API
    path('api/business/admin/wbjee/', include('wbjee.urls')), # Admin WBJEE
    path('api/neet/', include('neet.urls')), # NEET Hub API
    path('api/business/admin/neet/', include('neet.urls')), # Admin NEET
    path('api/jee/', include('jee.urls')), # JEE Hub API
    path('api/business/admin/jee/', include('jee.urls')), # Admin JEE
    path('api/site-config/', include('site_config.urls')),
    path('api/custom-pages/', include('custom_pages.urls')),
    path('api/business/admin/custom-pages/', include('custom_pages.urls')),
    path('api/shiksha-bandhu/', include('shiksha_bandhu.urls')),
    path('api/business/admin/shiksha-bandhu/', include('shiksha_bandhu.urls')),
    path('api/pais/', include('pais_exam.urls')),
]
