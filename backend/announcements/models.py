from mongoengine import Document, fields
import datetime

class Announcement(Document):
    """Top Banner Announcement model using MongoEngine"""
    text = fields.StringField(max_length=500, required=True)
    link = fields.StringField(max_length=500, required=False, null=True)
    is_active = fields.BooleanField(default=True)
    bg_color = fields.StringField(max_length=50, default='#66090D') # Maroon
    bg_color_2 = fields.StringField(max_length=50, required=False, null=True) # For gradients
    text_color = fields.StringField(max_length=50, default='#FFFFFF') # White
    icon_type = fields.StringField(max_length=50, default='megaphone') # megaphone, star, fire, gift, bell
    show_shine = fields.BooleanField(default=True)
    is_blinking = fields.BooleanField(default=False)
    is_marquee = fields.BooleanField(default=False)
    
    # Button styling
    button_text = fields.StringField(max_length=100, required=False, null=True)
    button_bg_color = fields.StringField(max_length=50, default='#FFFFFF')
    button_text_color = fields.StringField(max_length=50, default='#66090D')
    
    priority = fields.IntField(default=0) # For multiple active announcements
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    
    meta = {
        'collection': 'announcements',
        'ordering': ['-priority', '-created_at'],
        'indexes': [
            'is_active',
            'priority'
        ]
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super(Announcement, self).save(*args, **kwargs)

    def __str__(self):
        return self.text
