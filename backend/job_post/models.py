from mongoengine import Document, EmbeddedDocument, fields
from mongoengine import connect, disconnect
import gridfs
from bson import ObjectId
from django.conf import settings
from datetime import datetime
from admin_auth.models import Admin


class WorkExperience(EmbeddedDocument):
    company = fields.StringField(max_length=200)
    position = fields.StringField(max_length=200)
    start_date = fields.StringField(max_length=20)
    end_date = fields.StringField(max_length=20)
    currently_working = fields.BooleanField(default=False)
    description = fields.StringField()

class Education(EmbeddedDocument):
    institution = fields.StringField(max_length=200)
    degree = fields.StringField(max_length=200)
    field_of_study = fields.StringField(max_length=200)
    year_completed = fields.IntField()
    percentage = fields.DecimalField(precision=2, null=True, blank=True)

class JobPost(Document):
    # Basic Information
    title = fields.StringField(max_length=200, required=True)
    department = fields.StringField(max_length=200, required=True, db_field='company')
    description = fields.StringField(required=True)
    requirements = fields.StringField(required=True)
    
    # Location
    state = fields.StringField(max_length=100, default='West Bengal')
    district = fields.StringField(max_length=100)
    centre = fields.StringField(max_length=100)
    location = fields.StringField(max_length=1000)
    address = fields.StringField()
    
    # Job Details
    job_type = fields.StringField(max_length=50, choices=[
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid'),
    ], default='full_time')
    
    experience_level = fields.StringField(max_length=50, choices=[
        ('fresher', 'Fresher (0-1 years)'),
        ('entry', 'Entry Level (1-2 years)'),
        ('mid', 'Mid Level (2-5 years)'),
        ('senior', 'Senior Level (5+ years)'),
    ], default='entry')
    
    salary_range_min = fields.DecimalField(precision=2, null=True, blank=True)
    salary_range_max = fields.DecimalField(precision=2, null=True, blank=True)
    salary_type = fields.StringField(max_length=20, choices=[
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('project', 'Project Based'),
    ], default='monthly')
    
    # Application Details
    application_deadline = fields.DateTimeField(null=True, blank=True)
    vacancies = fields.IntField(default=1)
    
    # Status and Metadata
    is_active = fields.BooleanField(default=True)
    is_featured = fields.BooleanField(default=False)
    tags = fields.ListField(fields.StringField(max_length=50))
    
    # Admin References
    created_by = fields.ReferenceField(Admin, required=False)
    created_at = fields.DateTimeField(auto_now_add=True)
    updated_at = fields.DateTimeField(auto_now=True)
    
    meta = {
        'collection': 'job_posts',
        'strict': False,
        'ordering': ['-created_at'],
        'indexes': [
            'title', 'department', 'state', 'district', 'centre',
            'job_type', 'experience_level', 'is_active', 'created_by'
        ]
    }
    
    def __str__(self):
        return f"{self.title} - {self.department}"

class JobApplication(Document):
    # Job Reference - Now JobPost is defined above
    job_post = fields.ReferenceField(JobPost, reverse_delete_rule=2)
    
    # Applicant Personal Information (Mandatory)
    applicant_name = fields.StringField(max_length=200, required=True)
    applicant_email = fields.EmailField(required=True)
    applicant_phone = fields.StringField(max_length=20, required=True)
    
    # Optional Personal Information
    applicant_address = fields.StringField(null=True, blank=True, default='')
    
    # Professional Information (Optional)
    total_experience = fields.DecimalField(precision=2, null=True, blank=True, default=0)
    current_company = fields.StringField(max_length=200, null=True, blank=True, default='')
    current_position = fields.StringField(max_length=200, null=True, blank=True, default='')
    current_salary = fields.StringField(max_length=100, null=True, blank=True, default='')
    expected_salary = fields.StringField(max_length=100, null=True, blank=True, default='')
    notice_period = fields.StringField(max_length=50, null=True, blank=True, default='')
    
    # Education (Optional)
    highest_education = fields.StringField(max_length=200, null=True, blank=True, default='')
    education_details = fields.ListField(fields.EmbeddedDocumentField(Education), default=list)
    
    # Skills (Optional)
    skills = fields.ListField(fields.StringField(max_length=100), default=list)
    
    # Work Experience (Optional)
    work_experience = fields.ListField(fields.EmbeddedDocumentField(WorkExperience), default=list)
    
    # CV/Cover Letter storage: R2 URLs
    cv_url = fields.URLField(null=True, blank=True)
    cover_letter_url = fields.URLField(null=True, blank=True)
    
    # Old GridFS File Storage (Keep for backward compatibility)
    cv_file_id = fields.StringField(null=True, blank=True)
    cover_letter_file_id = fields.StringField(null=True, blank=True)
    cv_filename = fields.StringField(null=True, blank=True)
    cover_letter_filename = fields.StringField(null=True, blank=True)
    cv_file_size = fields.IntField(null=True, blank=True)
    cover_letter_file_size = fields.IntField(null=True, blank=True)
    
    # Additional Information (Optional)
    portfolio_url = fields.StringField(null=True, blank=True, default='')
    linkedin_url = fields.StringField(null=True, blank=True, default='')
    additional_info = fields.StringField(null=True, blank=True, default='')
    
    # Application Status
     # Application Status
    status = fields.StringField(max_length=20, choices=[
        ('applied', 'Applied'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
        ('on_hold', 'On Hold'),
    ], default='applied')
    
    applied_at = fields.DateTimeField(null=True, blank=True)
    updated_at = fields.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Set applied_at on first save if not already set
        if not self.applied_at:
            self.applied_at = datetime.now()
        super().save(*args, **kwargs)
    
    meta = {
        'collection': 'job_applications',
        'ordering': ['-applied_at'],
        'indexes': ['job_post', 'applicant_email', 'status', 'applied_at']
    }
    
    def save_file_to_gridfs(self, file, file_type='cv'):
        """Save file to GridFS and store the file ID"""
        try:
            # Use the same connection settings
            from mongoengine import get_db
            db = get_db()
            fs = gridfs.GridFS(db)
            
            # Read file content
            file_content = file.read()
            
            # Save to GridFS
            file_id = fs.put(
                file_content,
                filename=file.name,
                content_type=file.content_type,
                metadata={
                    'applicant_email': self.applicant_email,
                    'applicant_name': self.applicant_name,
                    'job_post_id': str(self.job_post.id),
                    'file_type': file_type,
                    'uploaded_at': datetime.now().isoformat()
                }
            )
            
            # Store file info in document
            if file_type == 'cv':
                self.cv_file_id = str(file_id)
                self.cv_filename = file.name
                self.cv_file_size = len(file_content)
            elif file_type == 'cover_letter':
                self.cover_letter_file_id = str(file_id)
                self.cover_letter_filename = file.name
                self.cover_letter_file_size = len(file_content)
            
            self.save()
            return file_id
            
        except Exception as e:
            raise Exception(f"Error saving file to GridFS: {str(e)}")
    
    def get_file_from_gridfs(self, file_type='cv'):
        """Retrieve file from GridFS"""
        try:
            from mongoengine import get_db
            db = get_db()
            fs = gridfs.GridFS(db)
            
            file_id = self.cv_file_id if file_type == 'cv' else self.cover_letter_file_id
            
            if not file_id:
                return None
                
            grid_file = fs.get(ObjectId(file_id))
            return grid_file
            
        except Exception as e:
            raise Exception(f"Error retrieving file from GridFS: {str(e)}")
    
    def delete_file_from_gridfs(self, file_type='cv'):
        """Delete file from GridFS"""
        try:
            from mongoengine import get_db
            db = get_db()
            fs = gridfs.GridFS(db)
            
            file_id = self.cv_file_id if file_type == 'cv' else self.cover_letter_file_id
            
            if file_id:
                fs.delete(ObjectId(file_id))
                
                # Clear file info from document
                if file_type == 'cv':
                    self.cv_file_id = None
                    self.cv_filename = None
                    self.cv_file_size = None
                elif file_type == 'cover_letter':
                    self.cover_letter_file_id = None
                    self.cover_letter_filename = None
                    self.cover_letter_file_size = None
                
                self.save()
                
        except Exception as e:
            raise Exception(f"Error deleting file from GridFS: {str(e)}")
    
    def __str__(self):
        return f"{self.applicant_name} - {self.job_post.title}"