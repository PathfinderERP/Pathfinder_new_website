from rest_framework import serializers
from .models import Application, Course

class CourseSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    goal = serializers.CharField()
    mode = serializers.CharField()
    location = serializers.CharField()
    start = serializers.CharField()
    price = serializers.CharField()
    badge = serializers.CharField(required=False, allow_null=True)
    centres = serializers.ListField(required=False, allow_null=True, child=serializers.CharField())

class ApplicationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    full_name = serializers.CharField(max_length=200)
    student_class = serializers.CharField(max_length=50, required=False, allow_null=True)
    board = serializers.CharField(max_length=100, required=False, allow_null=True)
    phone = serializers.CharField(max_length=17)
    email = serializers.EmailField(required=False, allow_null=True, max_length=100)
    area = serializers.CharField(max_length=200)
    school_name = serializers.CharField(max_length=200, required=False, allow_null=True)
    course = CourseSerializer()
    submitted_at = serializers.DateTimeField(read_only=True)
    status = serializers.CharField(read_only=True)
    
    # Extra fields that are sent from frontend but not stored in model
    # These are just accepted and ignored during creation
    selected_centres = serializers.ListField(required=False, allow_null=True, child=serializers.CharField())
    course_name = serializers.CharField(required=False, allow_null=True)
    course_type = serializers.CharField(required=False, allow_null=True)
    source = serializers.CharField(required=False, allow_null=True)
    application_date = serializers.CharField(required=False, allow_null=True)

    def create(self, validated_data):
        from django.utils import timezone
        
        # Remove fields that are not in the model
        validated_data.pop('selected_centres', None)
        validated_data.pop('course_name', None)
        validated_data.pop('course_type', None)
        validated_data.pop('source', None)
        validated_data.pop('application_date', None)
        
        course_data = validated_data.pop('course')
        # Also remove centres from course_data if present
        course_data.pop('centres', None)
        
        course = Course(**course_data)
        
        application = Application(
            course=course,
            submitted_at=timezone.now(),
            **validated_data
        )
        application.save()
        return application
    
    def update(self, instance, validated_data):
        # Allow partial updates (for status changes)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance