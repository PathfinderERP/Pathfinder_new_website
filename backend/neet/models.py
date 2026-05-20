from mongoengine import Document, fields
import datetime

class NEETHub(Document):
    """
    Configuration and resources for the NEET Answer Key / Analysis Hub
    """
    # Hero Section
    title = fields.StringField(required=True, default="NEET 2026")
    title_highlight = fields.StringField(default="Answer Key & Analysis")
    description = fields.StringField()
    sub_description = fields.StringField()
    hero_image_url = fields.StringField()
    meta_title = fields.StringField()
    meta_description = fields.StringField()
    
    # Subject Resources (Physics, Chemistry, Biology)
    # Each dict: { "subject": str, "icon": str, "weightage_url": str, "pdf_url": str, "video_url": str, "video_download_url": str, "bg_color": str }
    resources = fields.ListField(fields.DictField(), default=[])
    
    # Marks Division Table
    # Each dict: { "subject": str, "questions": str, "marks": str, "weightage": str }
    marks_division = fields.ListField(fields.DictField(), default=[])
    
    # Expert Guidance Videos
    # Each dict: { "label": str, "url": str, "description": str, "download_url": str }
    videos = fields.ListField(fields.DictField(), default=[])
    
    # Custom HTML Section (Injection)
    custom_html = fields.StringField()
    
    # Custom Meta Tags (SEO/Social)
    # Each dict: { "name": str, "content": str, "property": bool }
    custom_meta_tags = fields.ListField(fields.DictField(), default=[])
    
    # Metadata
    is_active = fields.BooleanField(default=True)
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'neet_hub',
        'ordering': ['-created_at']
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super(NEETHub, self).save(*args, **kwargs)

    def __str__(self):
        return self.title
