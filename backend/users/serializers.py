# users/serializers.py - SIMPLIFIED VERSION
from rest_framework import serializers
from .models import User

# users/serializers.py - UPDATE UserRegistrationSerializer
class UserRegistrationSerializer(serializers.Serializer):
    fullName = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    student_class = serializers.CharField(max_length=50)
    area = serializers.CharField(max_length=255)
    school = serializers.CharField(max_length=255)
    board = serializers.CharField(max_length=50, required=False, allow_blank=True)
    parentName = serializers.CharField(max_length=255, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)  # ADD THIS LINE

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).first():
            raise serializers.ValidationError("User with this email already exists")
        return email

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Phone number must be 10 digits")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long")
        return value

    def create(self, validated_data):
        # Extract password from validated_data
        password = validated_data.pop('password', 'default123')
        
        user = User(
            full_name=validated_data['fullName'],
            email=validated_data['email'].lower().strip(),
            phone=validated_data['phone'],
            student_class=validated_data['student_class'],
            area=validated_data['area'],
            school=validated_data['school'],
            board=validated_data.get('board', ''),
            parent_name=validated_data.get('parentName', '')
        )
        user.set_password(password)  # Use the provided password
        user.save()
        return user



class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    fullName = serializers.CharField(source='full_name', required=False)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_null=True)
    student_class = serializers.CharField(required=False, allow_null=True)
    area = serializers.CharField(required=False, allow_null=True)
    school = serializers.CharField(required=False, allow_null=True)
    board = serializers.CharField(required=False, allow_null=True)
    parentName = serializers.CharField(source='parent_name', required=False, allow_null=True)
    profile_image_url = serializers.CharField(required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False, default=True)