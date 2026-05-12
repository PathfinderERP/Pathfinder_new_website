from mongoengine import Document, fields
import datetime

class PredictionPopupConfig(Document):
    """
    Configuration for the Prediction/Answer Key Popup
    """
    title = fields.StringField(required=True, default="NEET 2026")
    title_highlight = fields.StringField(default="Answer Key")
    description = fields.StringField(default="Download the official NEET 2026 Answer Key and Question Paper solutions. Check your performance and calculate your expected score instantly.")
    button_text = fields.StringField(default="Download Answer Key")
    button_link = fields.StringField(default="https://pathfinder.edu.in/blog/neet-2026-answer-key")
    maybe_later_text = fields.StringField(default="Maybe Later")
    bottom_banner_text = fields.StringField(default="Live Prediction Portal is Now Open")
    
    # Icon configuration
    icon_type = fields.StringField(default="rocket") # rocket, fire, star, etc.
    
    # Visibility configuration
    is_active = fields.BooleanField(default=True)
    show_delay = fields.IntField(default=1500) # delay in ms
    
    # Targeting (optional for future)
    # page_targets = fields.ListField(fields.StringField(), default=["/neet"])
    
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'prediction_popup_config',
        'ordering': ['-created_at']
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super(PredictionPopupConfig, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} {self.title_highlight}"
