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
    full_name = serializers.CharField(max_length=200, required=False, allow_null=True)
    student_class = serializers.CharField(max_length=50, required=False, allow_null=True)
    board = serializers.CharField(max_length=100, required=False, allow_null=True)
    phone = serializers.CharField(max_length=17, required=False, allow_null=True)
    email = serializers.EmailField(required=False, allow_null=True, max_length=100)
    area = serializers.CharField(max_length=200, required=False, allow_null=True)
    school_name = serializers.CharField(max_length=200, required=False, allow_null=True)
    course = serializers.JSONField(required=False, allow_null=True)
    submitted_at = serializers.DateTimeField(read_only=True)
    status = serializers.CharField(required=False)
    
    # Contact Form Fields
    first_name = serializers.CharField(required=False, allow_null=True)
    last_name = serializers.CharField(required=False, allow_null=True)
    contact_number = serializers.CharField(required=False, allow_null=True)
    center_name = serializers.CharField(required=False, allow_null=True)
    message = serializers.CharField(required=False, allow_null=True)

    # Extra fields
    selected_centres = serializers.ListField(required=False, allow_null=True, child=serializers.CharField())
    course_name = serializers.CharField(required=False, allow_null=True)
    course_type = serializers.CharField(required=False, allow_null=True)
    source = serializers.CharField(required=False, allow_null=True)
    application_date = serializers.CharField(required=False, allow_null=True)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Ensure 'course' (which is a MongoEngine EmbeddedDocument) is serialized correctly
        if hasattr(instance, 'course') and instance.course:
            representation['course'] = CourseSerializer(instance.course).data
        return representation

    def create(self, validated_data):
        from django.utils import timezone
        
        # Extract contact-specific fields
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        contact_number = validated_data.pop('contact_number', None)
        center_name = validated_data.pop('center_name', None)
        message = validated_data.pop('message', None)

        # Handle Full Name mapping
        if not validated_data.get('full_name') and (first_name or last_name):
            validated_data['full_name'] = f"{first_name or ''} {last_name or ''}".strip()
        
        # Handle Phone mapping
        if not validated_data.get('phone') and contact_number:
            validated_data['phone'] = contact_number
        
        # Handle Area default
        if not validated_data.get('area'):
            validated_data['area'] = center_name or "Not Specified"

        # Remove helper fields
        validated_data.pop('selected_centres', None)
        validated_data.pop('course_name', None)
        validated_data.pop('course_type', None)
        validated_data.pop('source', None)
        validated_data.pop('application_date', None)
        
        # Handle Course mapping
        course_input = validated_data.pop('course', None)
        if not course_input or isinstance(course_input, str):
            # Create a dummy course object for contact requests
            # Using the 'message' or 'center_name' to fill required fields
            course_name_val = course_input if isinstance(course_input, str) else f"Inquiry: {validated_data.get('full_name', 'Unknown')}"
            course = Course(
                id="contact_form",
                name=course_name_val,
                goal="Contact Support",
                mode="Online/Offline",
                location=center_name or "General",
                start="Immediate",
                price="N/A"
            )
        else:
            # Handle dictionary input
            course_data = course_input.copy() if isinstance(course_input, dict) else {}
            course_data.pop('centres', None)
            course = Course(**course_data)
        
        # Store message in metadata or extra field if needed
        # Since strict=False, we can just add it to validated_data
        if message:
            validated_data['contact_message'] = message
        if center_name:
            validated_data['preferred_center'] = center_name

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