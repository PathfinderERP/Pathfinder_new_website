# admin_auth/authentication.py
import jwt
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .models import Admin
from datetime import datetime

class AdminJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None

        try:
            # Handle both "Bearer <token>" and simple token
            if ' ' in auth_header:
                token = auth_header.split(' ')[1]  # Bearer <token>
            else:
                token = auth_header  # Simple token
            
            print(f"🔐 Admin Auth - Token received: {token[:50]}...")  # Debug
            
            # Decode JWT token
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            
            print(f"🔐 Admin Auth - Token payload: {payload}")  # Debug
            
            # Check for admin_id (your current token structure)
            admin_id = payload.get('admin_id')
            if admin_id:
                # This is an admin token
                from .models import Admin
                admin = Admin.objects.get(id=admin_id, is_active=True)
                
                # Ensure admin has required Django user attributes
                if not hasattr(admin, 'is_authenticated'):
                    admin.is_authenticated = True
                if not hasattr(admin, 'is_anonymous'):
                    admin.is_anonymous = False
                    
                print(f"✅ Admin Auth - Success: {admin.email}")
                return (admin, token)
            
            # If no admin_id, check for user_type
            user_type = payload.get('user_type')
            if user_type == 'admin':
                from .models import Admin
                user_id = payload.get('user_id')  # Some tokens might use user_id
                if user_id:
                    admin = Admin.objects.get(id=user_id, is_active=True)
                    if not hasattr(admin, 'is_authenticated'):
                        admin.is_authenticated = True
                    print(f"✅ Admin Auth - Success via user_type: {admin.email}")
                    return (admin, token)
            
            # If we reach here, this isn't an admin token
            print("❌ Admin Auth - Not an admin token")
            return None
            
        except jwt.ExpiredSignatureError:
            print("❌ Admin Auth - Token expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"❌ Admin Auth - Invalid token: {e}")
            return None
        except Admin.DoesNotExist:
            print("❌ Admin Auth - Admin not found")
            return None
        except Exception as e:
            print(f"❌ Admin Auth - Unexpected Error: {e}")
            return None