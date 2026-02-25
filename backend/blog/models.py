from mongoengine import Document, fields
import datetime
import uuid
import re

class BlogPost(Document):
    """Blog Post model using MongoEngine"""
    title = fields.StringField(max_length=300, required=True)
    slug = fields.StringField(max_length=300, unique=True)
    content = fields.StringField(required=True)
    excerpt = fields.StringField(max_length=500)
    category = fields.StringField(max_length=100, default='General')
    author = fields.StringField(max_length=100, default='Admin')
    read_time = fields.StringField(max_length=50, default='5 min read')
    
    # Image storage: Using URL (Cloudflare R2 Link)
    image_url = fields.URLField()
    
    # Status and Metadata
    is_featured = fields.BooleanField(default=False)
    is_active = fields.BooleanField(default=True)
    published_date = fields.DateTimeField(default=datetime.datetime.utcnow)
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    
    meta = {
        'collection': 'blog_posts',
        'ordering': ['-published_date'],
        'indexes': [
            'slug',
            'category',
            'is_featured',
            'is_active',
            'published_date'
        ]
    }

    def save(self, *args, **kwargs):
        if not self.slug:
            # Create a slug from the title
            self.slug = re.sub(r'[^a-z0-9]+', '-', self.title.lower()).strip('-')
            # Ensure uniqueness by adding a short uuid if needed
            if BlogPost.objects(slug=self.slug).first():
                self.slug = f"{self.slug}-{str(uuid.uuid4())[:8]}"
        
        self.updated_at = datetime.datetime.utcnow()
        return super(BlogPost, self).save(*args, **kwargs)

    def __str__(self):
        return self.title
