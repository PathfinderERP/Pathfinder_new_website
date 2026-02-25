from django.db import models
from django.utils import timezone


class LandingPageRegistration(models.Model):
    COURSE_TYPE_CHOICES = [
        ('JEE', 'JEE Main & Advanced | WBJEE'),
        ('NEET', 'NEET'),
        ('FOUNDATION', 'Foundation'),
        ('BOARDS', 'Boards'),
        ('CRP', 'CRP (Classroom Program)'),
        ('NCRP', 'NCRP (Non-Classroom Program)'),
    ]
    
    # Student Information
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    student_class = models.CharField(max_length=50)
    board = models.CharField(max_length=100)
    course_type = models.CharField(max_length=50, choices=COURSE_TYPE_CHOICES)
    centre = models.CharField(max_length=255)
    
    # Metadata
    page_source = models.CharField(max_length=50, help_text="Which landing page: JEE or NEET")
    created_at = models.DateTimeField(default=timezone.now)
    is_contacted = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Landing Page Registration'
        verbose_name_plural = 'Landing Page Registrations'
    
    def __str__(self):
        return f"{self.name} - {self.course_type} ({self.page_source})"
