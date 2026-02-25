# users/models.py
from mongoengine import Document, fields
import bcrypt
import jwt
from datetime import datetime, timedelta
from django.conf import settings

class User(Document):
    full_name = fields.StringField(max_length=255, required=True)
    email = fields.EmailField(required=True, unique=True)
    phone = fields.StringField(max_length=15, required=True)
    student_class = fields.StringField(max_length=50, required=True)
    area = fields.StringField(max_length=255, required=True)
    school = fields.StringField(max_length=255, required=True)
    parent_name = fields.StringField(max_length=255)
    board = fields.StringField(max_length=50)  # Added field
    profile_image_url = fields.StringField()  # Add profile image URL field
    password = fields.StringField(max_length=255)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'users',
        'indexes': [
            'email',
            'phone'
        ]
    }

    # Add these properties for Django REST Framework compatibility
    @property
    def is_authenticated(self):
        """Always return True for authenticated users"""
        return True

    @property
    def is_anonymous(self):
        """Always return False for authenticated users"""
        return False

    @property
    def is_staff(self):
        """Regular users are not staff"""
        return False

    def set_password(self, password):
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def generate_jwt_token(self):
        payload = {
            'user_id': str(self.id),
            'email': self.email,
            'exp': datetime.utcnow() + settings.JWT_EXPIRATION_DELTA,
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def verify_jwt_token(token):
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(User, self).save(*args, **kwargs)