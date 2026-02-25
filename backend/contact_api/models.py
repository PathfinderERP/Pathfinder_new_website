from mongoengine import Document, EmbeddedDocument, fields
from mongoengine.errors import ValidationError
import re
from datetime import datetime

class Course(EmbeddedDocument):
    id = fields.StringField(required=True)
    name = fields.StringField(required=True, max_length=500)
    goal = fields.StringField(required=True, max_length=200)
    mode = fields.StringField(required=True, max_length=100)
    location = fields.StringField(required=True, max_length=1000)
    start = fields.StringField(required=True, max_length=100)
    price = fields.StringField(required=True, max_length=100)
    badge = fields.StringField(max_length=100, null=True)

class Application(Document):
    # Student Information
    full_name = fields.StringField(required=True, max_length=200)
    student_class = fields.StringField(max_length=50, null=True, blank=True)
    board = fields.StringField(max_length=100, null=True, blank=True)
    
    # Phone validation - increased length for +91 numbers
    phone = fields.StringField(required=True, max_length=17)
    
    # Make email optional
    email = fields.StringField(null=True, blank=True, max_length=100)
    area = fields.StringField(required=True, max_length=200)
    school_name = fields.StringField(max_length=200, null=True, blank=True)
    
    # Course Information (Embedded document)
    course = fields.EmbeddedDocumentField(Course, required=True)
    
    # Metadata
    submitted_at = fields.DateTimeField(required=True)
    status = fields.StringField(
        max_length=20,
        choices=['pending', 'contacted', 'enrolled', 'rejected'],
        default='pending'
    )
    
    meta = {
        'collection': 'applications',
        'ordering': ['-submitted_at'],
        'strict': False  # Allow documents with extra fields not defined in model
    }

    def clean(self):
        """Custom validation"""
        # Convert empty strings to None for optional fields
        if self.student_class == "":
            self.student_class = None
        if self.board == "":
            self.board = None
        if self.email == "":
            self.email = None
        if self.school_name == "":
            self.school_name = None
            
        # Clean the phone number
        if self.phone:
            # Remove any spaces, hyphens, etc.
            cleaned_phone = re.sub(r'[\s\-]+', '', self.phone)
            
            # Indian phone number pattern
            phone_pattern = r'^(\+91)?[6-9]\d{9}$'
            
            if not re.match(phone_pattern, cleaned_phone):
                raise ValidationError('Please enter a valid Indian phone number (10 digits starting with 6-9)')
            
            self.phone = cleaned_phone
    
    def save(self, *args, **kwargs):
        if not self.submitted_at:
            self.submitted_at = datetime.now()
        self.clean()
        return super(Application, self).save(*args, **kwargs)