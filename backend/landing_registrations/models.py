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
        ('Online Program', 'Online Program'),
        ('Offline Program', 'Offline Program'),
    ]
    
    # Student Information
    name = fields.StringField(max_length=255, required=True)
    phone = fields.StringField(max_length=20, required=True)
    email = fields.EmailField(required=False, null=True)
    student_class = fields.StringField(max_length=50)
    board = fields.StringField(max_length=100)
    course_type = fields.StringField(max_length=100)
    centre = fields.StringField(max_length=255)
    city = fields.StringField(max_length=255, required=False, null=True)
    last_exam_percentage = fields.StringField(max_length=10, required=False, null=True)
    
    # Metadata
    page_source = fields.StringField(max_length=50)
    referral_id = fields.StringField(max_length=50, required=False, null=True)
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    is_contacted = fields.BooleanField(default=False)
    is_paid = fields.BooleanField(default=False)
    amount_paid = fields.FloatField(default=0.0)
    txn_ref = fields.StringField(max_length=100, required=False, null=True)
    
    meta = {
        'collection': 'landing_page_registrations',
        'ordering': ['-created_at'],
        'indexes': ['email', 'phone', 'course_type', 'page_source', 'referral_id', 'is_paid']
    }
    
    def clean(self):
        """Custom validation for phone number"""
        import re
        from mongoengine.errors import ValidationError
        if self.phone:
            cleaned_phone = re.sub(r'[\s\-]+', '', str(self.phone))
            if cleaned_phone.startswith('+91'):
                cleaned_phone = cleaned_phone[3:]
            elif cleaned_phone.startswith('91') and len(cleaned_phone) == 12:
                cleaned_phone = cleaned_phone[2:]
            phone_pattern = r'^[6-9]\d{9}$'
            if not re.match(phone_pattern, cleaned_phone):
                raise ValidationError('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.')
            self.phone = cleaned_phone

    def save(self, *args, **kwargs):
        self.clean()
        return super(LandingPageRegistration, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.course_type} ({self.page_source})"

