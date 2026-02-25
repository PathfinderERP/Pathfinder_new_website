#admin_auth/models.py
from mongoengine import Document, fields, ListField
from datetime import datetime, timedelta
import jwt
import secrets
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password

class Admin(Document):
    email = fields.EmailField(required=True, unique=True)
    full_name = fields.StringField(required=True, max_length=255)
    phone = fields.StringField(max_length=20, null=True, blank=True)
    password = fields.StringField(required=True)
    
    # Permissions
    is_active = fields.BooleanField(default=True)
    is_staff = fields.BooleanField(default=True)
    is_superuser = fields.BooleanField(default=False)
    
    # Role-based permissions
    permissions = ListField(fields.StringField(), default=[
        'view_dashboard',
        'view_courses',
        'view_users'
    ])
    
    created_at = fields.DateTimeField(default=datetime.now)
    updated_at = fields.DateTimeField(default=datetime.now)
    
    # Password reset fields
    reset_token = fields.StringField(max_length=100, null=True, blank=True)
    reset_token_created_at = fields.DateTimeField(null=True, blank=True)
    
    # Invitation fields
    invitation_token = fields.StringField(max_length=100, null=True, blank=True)
    invited_by = fields.ReferenceField('self', null=True, blank=True)
    
    meta = {
        'collection': 'admin_auth_admin',
        'indexes': ['email', 'is_superuser', 'is_active']
    }

    # Available permissions
    AVAILABLE_PERMISSIONS = [
        'view_dashboard',
        'manage_courses',
        'manage_users',
        'manage_admins',
        'manage_applications',
        'manage_blogs',
        'system_settings'
    ]

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    # Django User compatibility
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_username(self):
        return self.email

    def has_perm(self, perm):
        """Check if admin has specific permission"""
        return self.is_superuser or perm in self.permissions

    def has_perms(self, perm_list):
        """Check if admin has all permissions in list"""
        if self.is_superuser:
            return True
        return all(perm in self.permissions for perm in perm_list)

    def generate_jwt_token(self):
        payload = {
            'admin_id': str(self.id),
            'email': self.email,
            'is_superuser': self.is_superuser,
            'permissions': self.permissions,
            'exp': datetime.utcnow() + timedelta(days=7),
            'iat': datetime.utcnow(),
            'user_type': 'admin'
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return token

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def save(self, *args, **kwargs):
        self.updated_at = datetime.now()
        return super(Admin, self).save(*args, **kwargs)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def generate_reset_token(self):
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_created_at = timezone.now()
        self.save()
        return self.reset_token

    def verify_reset_token(self, token):
        if (self.reset_token == token and 
            self.reset_token_created_at and 
            timezone.now() - self.reset_token_created_at < timedelta(hours=24)):
            return True
        return False

    def clear_reset_token(self):
        self.reset_token = None
        self.reset_token_created_at = None
        self.save()

    def generate_invitation_token(self):
        self.invitation_token = secrets.token_urlsafe(32)
        self.save()
        return self.invitation_token

    def verify_invitation_token(self, token):
        return self.invitation_token == token and not self.is_active

    def has_module_perms(self, app_label):
        return self.is_superuser