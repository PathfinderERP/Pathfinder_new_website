# centres/models.py
from mongoengine import Document, EmbeddedDocument, fields, BinaryField
from admin_auth.models import Admin
from users.models import User
import base64
from io import BytesIO
from PIL import Image
from datetime import datetime
import uuid


class Topper(EmbeddedDocument):
    name = fields.StringField(max_length=100)
    exam = fields.StringField(max_length=100)
    category = fields.StringField(max_length=50, choices=['All India', 'Boards', 'Foundation'], default='All India')
    rank = fields.IntField(null=True, blank=True)
    year = fields.IntField(null=True, blank=True)
    topper_msg = fields.StringField(null=True, blank=True)
    percentages = fields.DecimalField(precision=2, null=True, blank=True)
    marks_obtained = fields.DecimalField(precision=2, null=True, blank=True)
    total_marks = fields.DecimalField(precision=2, null=True, blank=True)
    
    # Keep for backward compatibility with existing data
    score = fields.IntField(null=True, blank=True)
    
    badge = fields.StringField(max_length=50, null=True, blank=True)
    
    # Cloudflare R2 / External URL for image
    image = fields.StringField(null=True, blank=True)
    
    # Add timestamps for topper
    created_at = fields.DateTimeField(default=datetime.now)
    updated_at = fields.DateTimeField(default=datetime.now)
    
    def get_image_url(self):
        """Generate frontend-friendly image URL from Cloudflare R2"""
        return self.image
    
    def compress_image(self, image_file, max_size=(1200, 900), quality=85):
        """Compress and optimize image before storage (if needed)"""
        try:
            # Open image
            img = Image.open(image_file)
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize if too large
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save to buffer
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=quality, optimize=True)
            buffer.seek(0)
            
            return buffer.getvalue()
            
        except Exception as e:
            # If compression fails, return original
            image_file.seek(0)
            return image_file.read()
    
    meta = {
        'strict': False
    }


class Centre(Document):
    state = fields.StringField(max_length=100, default='West Bengal')
    district = fields.StringField(max_length=100)
    centre = fields.StringField(max_length=100, unique=True)
    centre_type = fields.StringField(max_length=50, choices=[
        ('Instation', 'Instation'),
        ('Outstation', 'Outstation'),
    ], null=True, blank=True)
    location = fields.StringField()
    address = fields.StringField()
    toppers = fields.ListField(fields.EmbeddedDocumentField(Topper))
    
    # Cloudflare R2 / External URL for logo
    logo = fields.StringField(null=True, blank=True)
    
    # Map URL for location detection
    map_url = fields.StringField(null=True, blank=True)
    
    created_by = fields.ReferenceField(Admin, required=False)
    
    # Improved date fields with explicit formatting support
    created_at = fields.DateTimeField(auto_now_add=True)
    updated_at = fields.DateTimeField(auto_now=True)
    
    # Add a unique identifier for better frontend handling
    centre_code = fields.StringField(max_length=50, unique=True, sparse=True)
    
    meta = {
        'collection': 'centres',
        'ordering': ['state', 'district', 'centre'],
        'strict': False,
        'indexes': [
            'state',
            'district', 
            'centre',
            'created_by',
            'centre_code',
            'created_at',
            'updated_at'
        ]
    }
    
    def __str__(self):
        return f"{self.centre} - {self.district}, {self.state}"
    
    def get_logo_url(self):
        """Generate URL for centre logo from Cloudflare R2"""
        return self.logo
    
    def get_created_at_isoformat(self):
        """Get created_at in ISO format for frontend"""
        return self.created_at.isoformat() if self.created_at else None
    
    def get_updated_at_isoformat(self):
        """Get updated_at in ISO format for frontend"""
        return self.updated_at.isoformat() if self.updated_at else None
    
    def get_created_at_formatted(self):
        """Get formatted date string for display"""
        if self.created_at:
            return self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def get_updated_at_formatted(self):
        """Get formatted date string for display"""
        if self.updated_at:
            return self.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        return None
    
    def generate_centre_code(self):
        """Generate a unique centre code"""
        if not self.centre_code:
            # Create code from centre name and random string
            centre_prefix = ''.join([word[0].upper() for word in self.centre.split()[:2]])
            random_suffix = str(uuid.uuid4())[:8].upper()
            self.centre_code = f"{centre_prefix}_{random_suffix}"
        return self.centre_code
    
    def clean(self):
        """Auto-generate centre code before saving"""
        super().clean()
        if not self.centre_code:
            self.generate_centre_code()
    
    def save(self, *args, **kwargs):
        """Override save to ensure proper timestamps"""
        # Ensure created_at is set only on first save
        if not self.created_at:
            self.created_at = datetime.now()
        
        # Always update updated_at
        self.updated_at = datetime.now()
        
        # Generate centre code if not exists
        if not self.centre_code:
            self.generate_centre_code()
        
        # Update timestamps for all toppers
        for topper in self.toppers:
            if not topper.created_at:
                topper.created_at = datetime.now()
            topper.updated_at = datetime.now()
        
        super().save(*args, **kwargs)
    
    @classmethod
    def get_recent_centres(cls, days=30):
        """Get centres created in the last N days"""
        from datetime import timedelta
        cutoff_date = datetime.now() - timedelta(days=days)
        return cls.objects(created_at__gte=cutoff_date)
    
    @classmethod
    def get_centres_by_state(cls, state):
        """Get all centres in a specific state"""
        return cls.objects(state=state)
    
    @classmethod
    def get_centres_by_district(cls, district):
        """Get all centres in a specific district"""
        return cls.objects(district=district)
    
    def add_topper(self, topper_data):
        """Helper method to add a topper with proper timestamps"""
        topper = Topper(**topper_data)
        topper.created_at = datetime.now()
        topper.updated_at = datetime.now()
        self.toppers.append(topper)
        return topper
    
    def remove_topper(self, index):
        """Remove topper by index"""
        if 0 <= index < len(self.toppers):
            return self.toppers.pop(index)
        return None
    
    def update_logo(self, image_file, content_type, filename):
        """Update centre logo with compression"""
        from .services.image_service import ImageProcessor
        
        try:
            processed_logo = ImageProcessor.process_uploaded_image(
                image_file,
                max_size=(1200, 900),
                quality=85,
                max_size_mb=12
            )
            
            self.logo_data = processed_logo['data']
            self.logo_content_type = processed_logo['content_type']
            self.logo_filename = processed_logo['filename']
            
            return True
        except Exception as e:
            print(f"Error updating logo: {e}")
            return False
    

    def to_dict(self, include_toppers=True):
        """Convert centre to dictionary with proper date formatting"""
        data = {
            'id': str(self.id),
            'centre_code': self.centre_code,
            'state': self.state,
            'district': self.district,
            'centre': self.centre,
            'centre_type': self.centre_type,
            'location': self.location,
            'address': self.address,
            'map_url': self.map_url,
            'logo_url': self.get_logo_url(),
            'created_at': self.get_created_at_isoformat(),
            'updated_at': self.get_updated_at_isoformat(),
            'created_at_formatted': self.get_created_at_formatted(),
            'updated_at_formatted': self.get_updated_at_formatted(),
        }
        
        if include_toppers:
            data['toppers'] = [
                {
                    'name': topper.name,
                    'exam': topper.exam,
                    'rank': topper.rank,
                    'category': topper.category,
                    'year': topper.year,
                    'topper_msg': topper.topper_msg,
                    'percentages': float(topper.percentages) if topper.percentages else None,
                    'marks_obtained': float(topper.marks_obtained) if topper.marks_obtained else None,
                    'total_marks': float(topper.total_marks) if topper.total_marks else None,
                    'badge': topper.badge,
                    'image_url': topper.get_image_url(),
                    'created_at': topper.created_at.isoformat() if topper.created_at else None,
                    'updated_at': topper.updated_at.isoformat() if topper.updated_at else None,
                }
                for topper in self.toppers
            ]
        
        if self.created_by:
            data['created_by'] = {
                'id': str(self.created_by.id),
                'email': self.created_by.email,
                'full_name': getattr(self.created_by, 'full_name', '')
            }
        
        return data