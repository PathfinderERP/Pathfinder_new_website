from rest_framework import serializers
from rest_framework_mongoengine import serializers as mongo_serializers
from .models import LandingPageRegistration

class LandingPageRegistrationSerializer(mongo_serializers.DocumentSerializer):
    class Meta:
        model = LandingPageRegistration
        fields = [
            'id', 'name', 'phone', 'email', 'student_class', 
            'board', 'course_type', 'centre', 'page_source', 
            'created_at', 'is_contacted'
        ]
        read_only_fields = ['id', 'created_at']
