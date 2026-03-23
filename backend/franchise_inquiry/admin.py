from django.contrib import admin
from .models import FranchiseInquiry

@admin.register(FranchiseInquiry)
class FranchiseInquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'phone', 'email', 'is_contacted', 'created_at')
    list_filter = ('is_contacted', 'created_at', 'city')
    search_fields = ('name', 'email', 'phone', 'city')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
