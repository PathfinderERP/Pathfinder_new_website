from mongoengine import Document, fields
from datetime import datetime


class Alumni(Document):
    """
    Alumni model to store alumni information
    Fields: year, profession, image URLs (stored in Cloudflare R2)
    """
    year = fields.IntField(required=True, min_value=1990, max_value=2030)
    profession = fields.StringField(required=True)  # Allow any profession, not just predefined choices
    
    # Store image URLs instead of binary data
    image_urls = fields.ListField(fields.StringField(), default=list)
    
    # Metadata
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    is_active = fields.BooleanField(default=True)
    
    # Track who created/updated
    created_by = fields.StringField(default="system")
    updated_by = fields.StringField(default="system")
    
    meta = {
        'collection': 'alumni',
        'indexes': [
            'year',
            'profession',
            'is_active',
            ('year', 'profession'),  # Compound index for filtering
        ],
        'ordering': ['-year', 'profession']
    }

    def save(self, *args, **kwargs):
        """Override save to update the updated_at timestamp"""
        self.updated_at = datetime.utcnow()
        return super(Alumni, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.year} - {self.profession} ({len(self.image_urls)} images)"
