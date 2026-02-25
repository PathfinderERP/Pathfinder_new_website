# contact_api/models.py
from mongoengine import Document, StringField, EmailField

class Contact(Document):
    name = StringField(required=True, max_length=100)
    email = EmailField(required=True)
    message = StringField(required=True)
    
    meta = {
        'collection': 'contact'  # optional, custom collection name
    }

    def __str__(self):
        return f"{self.name} <{self.email}>"
