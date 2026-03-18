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
            "landing_list": "/api/landing/list/"
        }
    })

urlpatterns = [
    path('', root, name='root'),
    path('business/admin/', admin.site.urls),
    path('api/', include('contact_api.urls')),   # Your existing contact API
    path('api/auth/', include('users.urls')),    # Your existing auth
    path('api/business/admin/auth/', include('admin_auth.urls')),  # ADD THIS LINE - Admin authentication
    path('api/courses/', include('courses.urls')),  # Courses URLs
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
    path('api/business/admin/applications/', include('contact_api.urls')), # Admin Applications
]
