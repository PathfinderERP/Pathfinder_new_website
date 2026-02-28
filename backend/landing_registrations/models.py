from mongoengine import Document, fields
import datetime

class LandingPageRegistration(Document):
    COURSE_TYPE_CHOICES = [
        ('JEE', 'JEE Main & Advanced | WBJEE'),
        ('NEET', 'NEET'),
        ('FOUNDATION', 'Foundation'),
        ('BOARDS', 'Boards'),
        ('CRP', 'CRP (Classroom Program)'),
        ('NCRP', 'NCRP (Non-Classroom Program)'),
    ]
    
    # Student Information
    name = fields.StringField(max_length=255, required=True)
    phone = fields.StringField(max_length=20, required=True)
    email = fields.EmailField(required=True)
    student_class = fields.StringField(max_length=50)
    board = fields.StringField(max_length=100)
    course_type = fields.StringField(max_length=50, choices=COURSE_TYPE_CHOICES)
    centre = fields.StringField(max_length=255)
    
    # Metadata
    page_source = fields.StringField(max_length=50)
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    is_contacted = fields.BooleanField(default=False)
    
    meta = {
        'collection': 'landing_page_registrations',
        'ordering': ['-created_at'],
        'indexes': ['email', 'phone', 'course_type', 'page_source']
    }
    
    def __str__(self):
        return f"{self.name} - {self.course_type} ({self.page_source})"
