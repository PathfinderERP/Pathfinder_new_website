# admin_auth/middleware.py
import jwt
from django.conf import settings

class DebugAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Debug: Print auth header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            print(f"🔍 DEBUG - Auth Header: {auth_header}")
            try:
                token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                print(f"🔍 DEBUG - Token Payload: {payload}")
            except Exception as e:
                print(f"🔍 DEBUG - Token decode failed: {e}")
        
        response = self.get_response(request)
        return response