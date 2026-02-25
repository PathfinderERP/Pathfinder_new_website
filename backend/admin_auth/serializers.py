from rest_framework import serializers
from .models import Admin

class AdminSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    full_name = serializers.CharField()
    phone = serializers.CharField(required=False, allow_blank=True)
    is_active = serializers.BooleanField()
    is_superuser = serializers.BooleanField()
    permissions = serializers.ListField(child=serializers.CharField())
    created_at = serializers.DateTimeField(read_only=True)
    
    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.permissions = validated_data.get('permissions', instance.permissions)
        instance.save()
        return instance

class AdminCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    is_superuser = serializers.BooleanField(default=False)
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=Admin.AVAILABLE_PERMISSIONS),
        default=['view_dashboard', 'view_courses', 'view_users']
    )

    def validate_email(self, value):
        email = value.lower().strip()
        if Admin.objects.filter(email=email).first():
            raise serializers.ValidationError("Admin with this email already exists")
        return email

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['email'] = validated_data['email'].lower().strip()
        admin = Admin(**validated_data)
        admin.set_password(password)
        admin.save()
        return admin

class AdminInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=Admin.AVAILABLE_PERMISSIONS),
        default=['view_dashboard', 'view_courses', 'view_users']
    )

class AdminPermissionUpdateSerializer(serializers.Serializer):
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=Admin.AVAILABLE_PERMISSIONS)
    )
    is_active = serializers.BooleanField(required=False)

# Existing serializers
class AdminRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)
    invitation_token = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if Admin.objects.filter(email=value, is_active=True).first():
            raise serializers.ValidationError("Admin with this email already exists")
        return value

    def create(self, validated_data):
        # This is handled in the view
        pass

class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)