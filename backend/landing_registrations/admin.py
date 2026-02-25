from django.contrib import admin
from .models import LandingPageRegistration


@admin.register(LandingPageRegistration)
class LandingPageRegistrationAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'course_type', 'page_source', 'created_at', 'is_contacted']
    list_filter = ['course_type', 'page_source', 'is_contacted', 'created_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['created_at']
    list_editable = ['is_contacted']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Student Information', {
            'fields': ('name', 'phone', 'email', 'student_class', 'board')
        }),
        ('Course Details', {
            'fields': ('course_type', 'centre')
        }),
        ('Metadata', {
            'fields': ('page_source', 'created_at', 'is_contacted')
        }),
    )
