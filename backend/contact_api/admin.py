# from django.contrib import admin
# from .models import ContactSubmission

# @admin.register(ContactSubmission)
# class ContactSubmissionAdmin(admin.ModelAdmin):
#     list_display = ('first_name', 'last_name', 'email', 'course', 'center_name', 'submitted_at')
#     list_filter = ('course', 'submitted_at')
#     search_fields = ('first_name', 'last_name', 'email', 'center_name')
#     readonly_fields = ('submitted_at', 'ip_address')
    
#     fieldsets = (
#         ('Personal Information', {
#             'fields': ('first_name', 'last_name', 'email', 'contact_number')
#         }),
#         ('Course Information', {
#             'fields': ('course', 'center_name')
#         }),
#         ('Message', {
#             'fields': ('message',)
#         }),
#         ('Metadata', {
#             'fields': ('submitted_at', 'ip_address'),
#             'classes': ('collapse',)
#         }),
#     )