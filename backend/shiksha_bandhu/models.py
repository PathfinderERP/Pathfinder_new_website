from mongoengine import Document, fields
import datetime

class ShikshaBandhuPartner(Document):
    partner_id = fields.StringField(required=True, unique=True, max_length=50) # e.g. SB004
    name = fields.StringField(required=True, max_length=255)
    mobile = fields.StringField(required=True, max_length=20)
    email = fields.EmailField(required=False, null=True)
    password = fields.StringField(required=True, max_length=255) # plaintext or hashed for demo
    status = fields.StringField(default='active', choices=['active', 'inactive'])
    joined_on = fields.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'shiksha_bandhu_partners',
        'ordering': ['-joined_on'],
        'indexes': ['partner_id', 'mobile', 'email']
    }

    def __str__(self):
        return f"{self.name} ({self.partner_id})"


class ShikshaBandhuClick(Document):
    partner_id = fields.StringField(required=True, max_length=50)
    program_slug = fields.StringField(max_length=100, required=False, null=True)
    ip_address = fields.StringField(max_length=50, required=False, null=True)
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'shiksha_bandhu_clicks',
        'ordering': ['-created_at'],
        'indexes': ['partner_id', 'created_at']
    }


class ShikshaBandhuBonus(Document):
    partner_id = fields.StringField(required=True, max_length=50)
    lead_id = fields.StringField(required=False, null=True, max_length=100)
    student_name = fields.StringField(max_length=255, required=False, null=True)
    program = fields.StringField(required=True, max_length=255)
    bonus_amount = fields.IntField(default=250)
    status = fields.StringField(default='Pending', choices=['Pending', 'Successful', 'Cancelled'])
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'shiksha_bandhu_bonuses',
        'ordering': ['-created_at'],
        'indexes': ['partner_id', 'status', 'created_at']
    }
