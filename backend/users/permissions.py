# users/permissions.py
from rest_framework import permissions

class IsAuthenticatedMongo(permissions.BasePermission):
    """
    Custom permission for MongoEngine users
    """
    def has_permission(self, request, view):
        # For MongoEngine, we check if user is authenticated and has an id
        user = request.user
        if not user or not getattr(user, 'is_authenticated', False):
            return False
        return hasattr(user, 'id')