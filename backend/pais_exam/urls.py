from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_student, name='pais-register'),
    path('login/', views.student_login, name='pais-login'),
    path('profile/<str:reg_id>/', views.student_profile, name='pais-profile'),
    path('questions/', views.get_sample_questions, name='pais-questions'),
    path('submit/', views.submit_exam, name='pais-submit'),
    path('admin/students/', views.admin_list_students, name='pais-admin-students'),
    path('admin/students/<str:reg_id>/', views.admin_update_student, name='pais-admin-student-update'),
    path('admin/capacities/', views.admin_center_capacities, name='pais-admin-capacities'),
    path('admin/questions/', views.admin_questions_api, name='pais-admin-questions'),
    path('admin/questions/<int:q_id>/', views.admin_delete_question, name='pais-admin-question-delete'),
]
