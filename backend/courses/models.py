# courses/models.py
from mongoengine import Document, EmbeddedDocument, fields
import datetime
import uuid
import re

class FeesStructure(EmbeddedDocument):
    """Fee structure embedded document"""
    fees_type = fields.StringField(max_length=100)
    amount = fields.DecimalField(precision=2)
    description = fields.StringField(max_length=200, null=True, blank=True)
    is_optional = fields.BooleanField(default=False)
    is_one_time = fields.BooleanField(default=True)
    due_date = fields.DateTimeField(null=True, blank=True)

import base64

class Topper(EmbeddedDocument):
    """Topper embedded document"""
    meta = {'strict': False}  # Allow extra fields from database
    
    name = fields.StringField(max_length=100)
    exam = fields.StringField(max_length=100)
    rank = fields.IntField()
    topper_msg = fields.StringField(null=True, blank=True)
    percentages = fields.DecimalField(precision=2, null=True, blank=True)
    total_marks = fields.DecimalField(precision=2, null=True, blank=True)
    obtained_marks = fields.DecimalField(precision=2, null=True, blank=True)
    score = fields.IntField(null=True, blank=True)
    badge = fields.StringField(max_length=50, null=True, blank=True)
    
    # Image storage: Binary + Metadata
    image_data = fields.BinaryField(null=True, blank=True)
    image_content_type = fields.StringField(max_length=50, null=True, blank=True)
    image_filename = fields.StringField(max_length=255, null=True, blank=True)
    image = fields.URLField(null=True, blank=True) # Keep for backward compatibility/external URLs
    
    year = fields.IntField(default=datetime.datetime.now().year)
    testimonial = fields.StringField(null=True, blank=True)

    def get_image_url(self):
        if self.image:
            return self.image
        if self.image_data:
            try:
                base64_data = base64.b64encode(self.image_data).decode('utf-8')
                return f"data:{self.image_content_type};base64,{base64_data}"
            except:
                return None
        return None

class Category(EmbeddedDocument):
    """Course category embedded document"""
    name = fields.StringField(max_length=100, required=True)
    slug = fields.StringField(max_length=100, required=True)
    description = fields.StringField(null=True, blank=True)
    icon_url = fields.URLField(null=True, blank=True)
    order = fields.IntField(default=0)
    is_featured = fields.BooleanField(default=False)

class Feature(EmbeddedDocument):
    """Feature embedded document for course plans"""
    name = fields.StringField(max_length=200)
    category = fields.StringField(max_length=50, choices=[
        ('lecture', 'Lecture Features'),
        ('material', 'Study Materials'),
        ('support', 'Student Support'),
        ('test', 'Tests & Assessments'),
        ('bonus', 'Bonus Features'),
        ('access', 'Access Features'),
        ('mentorship', 'Mentorship'),
        ('offline', 'Offline Support'),
    ])
    icon = fields.StringField(max_length=50, null=True, blank=True)
    description = fields.StringField(null=True, blank=True)
    is_available_for_online = fields.BooleanField(default=True)
    is_available_for_offline = fields.BooleanField(default=True)

class PlanFeature(EmbeddedDocument):
    """Feature included in a specific plan"""
    feature = fields.EmbeddedDocumentField(Feature)
    included = fields.BooleanField(default=True)
    description = fields.StringField(null=True, blank=True)
    order = fields.IntField(default=0)

class CoursePlanPricing(EmbeddedDocument):
    """Pricing for different course plans (Pro, Infinity, Max, etc.)"""
    plan_name = fields.StringField(max_length=100, required=True)  # "Pro", "Infinity", "Max", "Basic"
    slug = fields.StringField(max_length=100, required=True)
    
    # Pricing
    base_price = fields.DecimalField(precision=2, required=True)
    discounted_price = fields.DecimalField(precision=2, null=True, blank=True)
    emi_available = fields.BooleanField(default=False)
    emi_amount = fields.DecimalField(precision=2, null=True, blank=True)
    emi_months = fields.IntField(null=True, blank=True)
    
    # Features
    features = fields.ListField(fields.EmbeddedDocumentField(PlanFeature))
    
    # Display
    order = fields.IntField(default=0)
    is_popular = fields.BooleanField(default=False)
    is_recommended = fields.BooleanField(default=False)
    
    # Additional info
    registration_fee_included = fields.BooleanField(default=True)
    notes = fields.StringField(null=True, blank=True)
    color_code = fields.StringField(max_length=7, default='#3B82F6')

class TeacherInfo(EmbeddedDocument):
    """Teacher information for course"""
    meta = {'strict': False}  # Allow extra fields from database
    
    teacher_id = fields.StringField(max_length=100, null=True, blank=True)
    name = fields.StringField(max_length=200)
    role = fields.StringField(max_length=50, choices=[
        ('main', 'Main Teacher'),
        ('assistant', 'Assistant Teacher'),
        ('guest', 'Guest Faculty'),
        ('doubt', 'Doubt Solving Expert'),
        ('mentor', 'Mentor'),
    ], default='main')
    subjects = fields.ListField(fields.StringField(max_length=100))
    experience = fields.IntField(default=0)
    message = fields.StringField(null=True, blank=True)
    
    # Image storage: Binary + Metadata
    profile_image_data = fields.BinaryField(null=True, blank=True)
    profile_image_content_type = fields.StringField(max_length=50, null=True, blank=True)
    profile_image_filename = fields.StringField(max_length=255, null=True, blank=True)
    profile_image = fields.URLField(null=True, blank=True) # Keep for backward compatibility
    
    rating = fields.DecimalField(precision=2, default=0.0)
    is_active = fields.BooleanField(default=True)

    def get_profile_image_url(self):
        if self.profile_image:
            return self.profile_image
        if self.profile_image_data:
            try:
                base64_data = base64.b64encode(self.profile_image_data).decode('utf-8')
                return f"data:{self.profile_image_content_type};base64,{base64_data}"
            except:
                return None
        return None

class SubjectSchedule(EmbeddedDocument):
    """Subject-wise schedule"""
    subject = fields.StringField(max_length=100, required=True)
    teacher_id = fields.StringField(max_length=100, null=True, blank=True)
    teacher_name = fields.StringField(max_length=200, null=True, blank=True)
    total_lectures = fields.IntField(required=True)
    schedule_pdf_url = fields.URLField(null=True, blank=True)
    description = fields.StringField(null=True, blank=True)
    order = fields.IntField(default=0)

class FreeContent(EmbeddedDocument):
    """Free content/demo lectures"""
    title = fields.StringField(max_length=200, required=True)
    content_type = fields.StringField(max_length=50, choices=[
        ('lecture', 'Demo Lecture'),
        ('update', 'Feature Update'),
        ('orientation', 'Orientation'),
        ('guide', 'Study Guide'),
        ('other', 'Other'),
    ], default='lecture')
    video_url = fields.URLField(null=True, blank=True)
    description = fields.StringField(null=True, blank=True)
    teacher_name = fields.StringField(max_length=200, null=True, blank=True)
    published_date = fields.DateTimeField(default=datetime.datetime.utcnow)
    order = fields.IntField(default=0)
    is_active = fields.BooleanField(default=True)

class DetailPoint(EmbeddedDocument):
    """Detail point for course sections"""
    text = fields.StringField(required=True)
    icon = fields.StringField(max_length=50, null=True, blank=True)
    order = fields.IntField(default=0)

class CourseDetailSection(EmbeddedDocument):
    """Course detail section"""
    section_type = fields.StringField(max_length=50, choices=[
        ('features', 'Key Features'),
        ('about', 'About the Batch'),
        ('schedule', 'Schedule'),
        ('teachers', 'Teachers'),
        ('free_content', 'Free Content'),
        ('more_details', 'More Details'),
        ('requirements', 'Requirements'),
        ('materials', 'Study Materials'),
        ('support', 'Support Features'),
    ], required=True)
    title = fields.StringField(max_length=200, null=True, blank=True)
    content = fields.StringField(null=True, blank=True)
    points = fields.ListField(fields.EmbeddedDocumentField(DetailPoint))
    order = fields.IntField(default=0)
    is_active = fields.BooleanField(default=True)

class BatchInfo(EmbeddedDocument):
    """Batch information"""
    batch_name = fields.StringField(max_length=100, required=True)
    batch_type = fields.StringField(max_length=50, choices=[
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('evening', 'Evening'),
        ('night', 'Night'),
        ('weekend', 'Weekend'),
        ('anytime', 'Anytime (Recorded)'),
    ], required=True)
    
    # Schedule
    start_time = fields.StringField(max_length=50, null=True, blank=True)  # "06:00 AM"
    end_time = fields.StringField(max_length=50, null=True, blank=True)    # "08:00 AM"
    days = fields.StringField(max_length=100, null=True, blank=True)       # "Mon,Wed,Fri"
    
    # For recorded courses
    lectures_per_day = fields.IntField(null=True, blank=True)
    days_per_week = fields.IntField(null=True, blank=True)
    total_lectures = fields.IntField(null=True, blank=True)
    
    # Capacity
    max_students = fields.IntField(null=True, blank=True)
    current_students = fields.IntField(default=0)
    is_full = fields.BooleanField(default=False)
    
    # Status
    is_active = fields.BooleanField(default=True)
    registration_open = fields.BooleanField(default=True)

class StudyMaterial(EmbeddedDocument):
    """Study material"""
    title = fields.StringField(max_length=200, required=True)
    material_type = fields.StringField(max_length=50, choices=[
        ('pdf', 'PDF Document'),
        ('video', 'Video Lecture'),
        ('quiz', 'Quiz/Test'),
        ('assignment', 'Assignment'),
        ('notes', 'Handwritten Notes'),
        ('pyq', 'Previous Year Questions'),
        ('dpp', 'Daily Practice Problems'),
        ('blueprint', 'Chapter Blueprint'),
        ('test_series', 'Test Series'),
    ], required=True)
    file_url = fields.URLField(null=True, blank=True)
    description = fields.StringField(null=True, blank=True)
    available_in_plans = fields.ListField(fields.StringField(max_length=100))  # ["pro", "infinity"]
    is_free = fields.BooleanField(default=False)
    uploaded_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    downloads = fields.IntField(default=0)

class DoubtSession(EmbeddedDocument):
    """Doubt session"""
    title = fields.StringField(max_length=200, required=True)
    session_type = fields.StringField(max_length=50, choices=[
        ('live', 'Live Session'),
        ('recorded', 'Recorded Session'),
        ('text', 'Text Based'),
        ('audio', 'Audio Message'),
        ('video_call', 'Video Call'),
    ], required=True)
    support_timing = fields.StringField(max_length=50, choices=[
        ('24x7', '24x7 Support'),
        ('scheduled', 'Scheduled Timing'),
        ('limited', 'Limited Hours'),
    ], default='24x7')
    scheduled_time = fields.DateTimeField(null=True, blank=True)
    duration = fields.IntField(null=True, blank=True)  # in minutes
    meeting_link = fields.URLField(null=True, blank=True)
    recording_link = fields.URLField(null=True, blank=True)
    available_in_plans = fields.ListField(fields.StringField(max_length=100))
    is_active = fields.BooleanField(default=True)

class Course(Document):
    """Main Course Model - Fixed with proper code generation"""
    
    # Your existing fields - UPDATED with null=True for online courses
    state = fields.StringField(max_length=100, default='West Bengal', null=True, blank=True)
    district = fields.StringField(max_length=100, null=True, blank=True)
    centre = fields.StringField(max_length=100, required=True)
    name = fields.StringField(max_length=200, required=True)
    mode = fields.StringField(max_length=50, choices=[
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('centre', 'Centre'),
        ('hybrid', 'Hybrid'),
    ], default='offline')
    course_title = fields.StringField(max_length=300, null=True, blank=True)
    
    # New Fields
    starting_date = fields.DateTimeField(null=True, blank=True)
    language = fields.StringField(max_length=100, null=True, blank=True)
    
    programme = fields.StringField(max_length=50, choices=[
        ('CRP', 'CRP'),
        ('NCRP', 'NCRP'),
    ], null=True, blank=True)
    course_price = fields.DecimalField(precision=2, required=True)
    discounted_price = fields.DecimalField(precision=2, null=True, blank=True)
    class_level = fields.StringField(max_length=50, required=True)
    duration = fields.StringField(max_length=50, required=True)
    badge = fields.StringField(max_length=100, null=True, blank=True)
    popularity = fields.DecimalField(precision=2, default=0.0)
    course_sessions = fields.StringField(max_length=20, required=True)
    location = fields.StringField(required=True)
    address = fields.StringField(required=True)
    fees_structures = fields.ListField(fields.EmbeddedDocumentField(FeesStructure), default=list)
    offers = fields.DecimalField(precision=2, null=True, blank=True)
    toppers = fields.ListField(fields.EmbeddedDocumentField(Topper), default=list)
    created_by = fields.StringField(null=True, blank=True)
    created_by_email = fields.StringField(null=True, blank=True)
    created_at = fields.DateTimeField()
    updated_at = fields.DateTimeField()
    
    # NEW FIELDS for enhanced functionality
    code = fields.StringField(max_length=50, default=lambda: str(uuid.uuid4())[:8].upper())
    slug = fields.StringField(max_length=200, unique=True, null=True, blank=True)
    description = fields.StringField(null=True, blank=True)
    short_description = fields.StringField(max_length=300, null=True, blank=True)
    
    # Categorization - Using embedded Category
    category = fields.EmbeddedDocumentField(Category, null=True, blank=True)
    target_exam = fields.StringField(max_length=50, choices=[
        ('jee', 'JEE'),
        ('neet', 'NEET'),
        ('boards', 'Boards'),
        ('cuet', 'CUET'),
        ('nda', 'NDA'),
        ('other', 'Other'),
    ], default='other')
    course_level = fields.StringField(max_length=50, choices=[
        ('foundation', 'Foundation'),
        ('advanced', 'Advanced'),
        ('crash', 'Crash Course'),
        ('revision', 'Revision'),
        ('doubt', 'Doubt Solving'),
    ], default='foundation')
    
    # Enhanced Pricing with Multiple Plans
    plans = fields.ListField(fields.EmbeddedDocumentField(CoursePlanPricing), default=list)
    
    # Duration & Validity (Enhanced)
    start_date = fields.DateTimeField(default=datetime.datetime.utcnow)
    end_date = fields.DateTimeField(null=True, blank=True)
    validity_date = fields.DateTimeField(null=True, blank=True)
    
    # Teachers - Multiple teachers per course
    teachers = fields.ListField(fields.EmbeddedDocumentField(TeacherInfo), default=list)
    
    # Subject Schedules
    subject_schedules = fields.ListField(fields.EmbeddedDocumentField(SubjectSchedule), default=list)
    
    # Course Batches
    batches = fields.ListField(fields.EmbeddedDocumentField(BatchInfo), default=list)
    
    # Free Content
    free_contents = fields.ListField(fields.EmbeddedDocumentField(FreeContent), default=list)
    
    # Course Detail Sections
    detail_sections = fields.ListField(fields.EmbeddedDocumentField(CourseDetailSection), default=list)
    
    # Content & Media
    thumbnail_url = fields.URLField(null=True, blank=True)
    
    # Thumbnail Image storage: Binary + Metadata
    thumbnail_image_data = fields.BinaryField()
    thumbnail_content_type = fields.StringField(max_length=50)
    thumbnail_filename = fields.StringField(max_length=255)
    promo_video_url = fields.URLField(null=True, blank=True)
    orientation_video_url = fields.URLField(null=True, blank=True)
    
    # Study Materials
    study_materials = fields.ListField(fields.EmbeddedDocumentField(StudyMaterial), default=list)
    
    # Doubt Sessions
    doubt_sessions = fields.ListField(fields.EmbeddedDocumentField(DoubtSession), default=list)
    
    # Stats & Reviews
    rating = fields.DecimalField(precision=2, default=0.0)
    total_reviews = fields.IntField(default=0)
    total_enrollments = fields.IntField(default=0)
    max_students = fields.IntField(null=True, blank=True)
    
    # Status
    is_active = fields.BooleanField(default=True)
    is_featured = fields.BooleanField(default=False)
    is_trending = fields.BooleanField(default=False)
    
    # Additional badges (compatible with old badge field)
    additional_badges = fields.ListField(fields.StringField(max_length=50), default=list)
    
    # Metadata
    published_at = fields.DateTimeField(null=True, blank=True)
    
    meta = {
        'collection': 'courses',
        'strict': False,
        'ordering': ['-created_at'],
        'indexes': [
            'code',
            'slug',
            'mode',
            'centre',
            'state',
            'district',
            'is_active',
            'is_featured',
            'target_exam',
            'course_level',
            'class_level',
            {'fields': ['state', 'district', 'centre']},
            {'fields': ['mode', 'is_active']},
            {'fields': ['start_date', 'end_date']},
            {'fields': ['category.name', 'target_exam']},
        ]
    }
    
    def __init__(self, *args, **kwargs):
        # Ensure code is generated before initialization
        if 'code' not in kwargs or not kwargs['code']:
            kwargs['code'] = str(uuid.uuid4())[:8].upper()
        super(Course, self).__init__(*args, **kwargs)
    
    def save(self, *args, **kwargs):
        """Override save to update timestamps and set defaults"""
        if not self.created_at:
            self.created_at = datetime.datetime.now(datetime.timezone.utc)
        self.updated_at = datetime.datetime.now(datetime.timezone.utc)
        
        # Ensure code is always set and unique
        if not self.code:
            self.code = str(uuid.uuid4())[:8].upper()
        
        # Check for duplicate code
        try:
            existing = Course.objects(code=self.code).first()
            if existing and existing.id != self.id:
                # Regenerate code if duplicate
                self.code = str(uuid.uuid4())[:8].upper()
        except:
            pass
        
        # Set default slug if not provided
        if not self.slug and self.name:
            # Create a clean slug from the name
            base_slug = re.sub(r'[^a-z0-9]+', '-', self.name.lower()).strip('-')
            
            # Add code to make it unique
            if self.code:
                self.slug = f"{base_slug}-{self.code.lower()}"
            else:
                self.slug = base_slug
            
            # Ensure slug is not too long
            if len(self.slug) > 200:
                self.slug = self.slug[:200]
        
        # For online courses, set appropriate defaults
        if self.mode == 'online' or (self.centre and self.centre.lower() == 'online'):
            # Clear location-related fields for online courses
            if not self.location or self.location == '':
                self.location = 'Online'
            if not self.address or self.address == '':
                self.address = 'Virtual Classroom'
            
            # State and district should be empty for online courses
            self.state = None
            self.district = None
            
            # Ensure centre is set to "Online" if not specified
            if not self.centre or self.centre == '':
                self.centre = 'Online'
            
            # Ensure mode is online
            self.mode = 'online'
        
        return super(Course, self).save(*args, **kwargs)
    
    def get_thumbnail_url(self):
        if self.thumbnail_url:
            return self.thumbnail_url
        if self.thumbnail_image_data:
            try:
                base64_data = base64.b64encode(self.thumbnail_image_data).decode('utf-8')
                return f"data:{self.thumbnail_content_type};base64,{base64_data}"
            except:
                return None
        return None
    
    def clean(self):
        """Custom validation before saving"""
        # Auto-set mode based on centre name
        if self.centre and self.centre.lower() == 'online':
            self.mode = 'online'
            self.location = 'Online'
            self.address = 'Virtual Classroom'
            self.state = None
            self.district = None
        
        # Validate that online courses don't have state/district
        if self.mode == 'online':
            if self.state:
                self.state = None
            if self.district:
                self.district = None
        
        super(Course, self).clean()
    
    def __str__(self):
        return f"{self.name} - {self.centre if self.centre else 'Online'}"
    
    # Properties for backward compatibility and convenience
    @property
    def is_online(self):
        return self.mode == 'online' or (self.centre and self.centre.lower() == 'online')
    
    @property
    def is_ongoing(self):
        if not self.start_date or not self.end_date:
            return False
        now = datetime.datetime.utcnow()
        return self.start_date <= now <= self.end_date
    
    @property
    def is_upcoming(self):
        if not self.start_date:
            return False
        now = datetime.datetime.utcnow()
        return now < self.start_date
    
    @property
    def is_ended(self):
        if not self.end_date:
            return False
        now = datetime.datetime.utcnow()
        return now > self.end_date
    
    @property
    def seats_available(self):
        if self.max_students:
            available = self.max_students - self.total_enrollments
            return max(0, available)
        return None
    
    @property
    def all_badges(self):
        """Combine old badge field with new additional_badges"""
        badges = []
        if self.badge:
            badges.append(self.badge)
        if self.additional_badges:
            badges.extend(self.additional_badges)
        return list(set(badges))  # Remove duplicates
    
    @property
    def current_price_display(self):
        """Get display price - uses old course_price field for backward compatibility"""
        if self.plans:
            # Return the lowest plan price
            prices = []
            for plan in self.plans:
                price = plan.discounted_price or plan.base_price
                if price:
                    prices.append(float(price))
            if prices:
                return min(prices)
        return float(self.course_price) if self.course_price else 0
    
    def get_plan_by_name(self, plan_name):
        """Get a specific plan by name"""
        for plan in self.plans:
            if plan.plan_name.lower() == plan_name.lower():
                return plan
        return None
    
    def get_teachers_by_role(self, role):
        """Get teachers by role"""
        return [teacher for teacher in self.teachers if teacher.role == role]
    
    def get_main_teacher(self):
        """Get main teacher"""
        main_teachers = self.get_teachers_by_role('main')
        return main_teachers[0] if main_teachers else None
    
    def get_detail_section(self, section_type):
        """Get detail section by type"""
        for section in self.detail_sections:
            if section.section_type == section_type:
                return section
        return None

class CourseCategory(Document):
    """Standalone course categories collection"""
    name = fields.StringField(max_length=100, required=True)
    slug = fields.StringField(max_length=100, required=True, unique=True)
    description = fields.StringField(null=True, blank=True)
    icon_url = fields.URLField(null=True, blank=True)
    order = fields.IntField(default=0)
    is_featured = fields.BooleanField(default=False)
    parent_category = fields.StringField(max_length=100, null=True, blank=True)
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    
    meta = {
        'collection': 'course_categories',
        'ordering': ['order', 'name'],
        'indexes': ['slug', 'name', 'is_featured']
    }
    
    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.datetime.utcnow()
        self.updated_at = datetime.datetime.utcnow()
        return super(CourseCategory, self).save(*args, **kwargs)
    
    def __str__(self):
        return self.name

class Enrollment(Document):
    """Enrollment model to track user course purchases"""
    user_id = fields.StringField(required=True)
    course_id = fields.StringField(required=True)
    course_name = fields.StringField()
    amount_paid = fields.DecimalField(precision=2)
    payment_id = fields.StringField() # Mock payment/transaction ID
    payment_status = fields.StringField(default='completed', choices=['pending', 'completed', 'failed'])
    enrolled_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    status = fields.StringField(default='active', choices=['active', 'completed', 'expired', 'cancelled'])
    valid_until = fields.DateTimeField(null=True, blank=True)
    
    meta = {
        'collection': 'enrollments',
        'indexes': ['user_id', 'course_id', 'payment_id']
    }

    def save(self, *args, **kwargs):
        if not self.enrolled_at:
            self.enrolled_at = datetime.datetime.utcnow()
        return super(Enrollment, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.user_id} - {self.course_name}"