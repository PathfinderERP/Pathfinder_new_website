from rest_framework import permissions

# class IsAdminUser(permissions.BasePermission):
#     """
#     Custom permission to only allow admin users to access the view.
#     """
#     def has_permission(self, request, view):
#         return bool(request.user and hasattr(request.user, 'is_super_admin'))

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and hasattr(request.user, 'is_superuser'))

class IsSuperAdmin(permissions.BasePermission):
    """
    Custom permission to only allow super admin users to access the view.
    """
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_super_admin', False))
    
# admin_auth/permissions.py


