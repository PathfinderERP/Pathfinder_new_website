# users/authentication.py
import jwt
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from .models import User
from datetime import datetime

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None

        try:
            # Handle both "Bearer <token>" and simple token
            if ' ' in auth_header:
                token = auth_header.split(' ')[1]
            else:
                token = auth_header
            
            print(f"👤 User Auth - Token received: {token[:50]}...")  # Debug
            
            # Decode JWT token
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256']
            )
            
            print(f"👤 User Auth - Token payload: {payload}")  # Debug
            
            # Skip if this is an admin token (let AdminJWTAuthentication handle it)
            if payload.get('admin_id') or payload.get('user_type') == 'admin':
                print("👤 User Auth - This is an admin token, skipping")
                return None
            
            # This should be a regular user token
            user_id = payload.get('user_id')
            if user_id:
                user = User.objects.get(id=user_id, is_active=True)
                
                # Ensure user has required Django user attributes
                if not hasattr(user, 'is_authenticated'):
                    user.is_authenticated = True
                if not hasattr(user, 'is_anonymous'):
                    user.is_anonymous = False
                    
                print(f"✅ User Auth - Success: {user.email}")
                return (user, token)
            
            print("❌ User Auth - No user_id found in token")
            return None
            
        except jwt.ExpiredSignatureError:
            print("❌ User Auth - Token expired")
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            print(f"❌ User Auth - Invalid token: {e}")
            raise AuthenticationFailed('Invalid token')
        except User.DoesNotExist:
            print("❌ User Auth - User not found")
            raise AuthenticationFailed('User not found')
        except Exception as e:
            print(f"❌ User Auth - Error: {e}")
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')