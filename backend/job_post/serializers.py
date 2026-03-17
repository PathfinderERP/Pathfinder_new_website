from rest_framework import serializers
from rest_framework_mongoengine import serializers as mongo_serializers
from .models import JobPost, JobApplication, WorkExperience, Education
import json
from contact_backend.utils.r2_storage import upload_to_r2

class WorkExperienceSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    class Meta:
        model = WorkExperience
        fields = '__all__'

class EducationSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    class Meta:
        model = Education
        fields = '__all__'

class JobPostSerializer(mongo_serializers.DocumentSerializer):
    class Meta:
        model = JobPost
        fields = '__all__'

    def to_representation(self, instance):
        from mongoengine.errors import DoesNotExist
        try:
            ret = super().to_representation(instance)
            # Handle legacy 'company' field if department is missing
            if not ret.get('department') and 'company' in instance._data:
                ret['department'] = instance._data['company']
            
            # Resolve created_by if it exists
            if hasattr(instance, 'created_by') and instance.created_by:
                ret['created_by_email'] = getattr(instance.created_by, 'email', None)
                ret['created_by_name'] = getattr(instance.created_by, 'full_name', None)
            
            return ret
        except DoesNotExist:
            # If created_by is broken, super().to_representation(instance) might fail 
            # if we are using mongoengine serializers that auto-dereference.
            # Let's try to get a clean representation.
            # Since we can't easily fix super() call if it fails inside, 
            # we should have cleared it in the DB already.
            # But just in case:
            instance.created_by = None
            instance.save()
            return super().to_representation(instance)

class JobApplicationSerializer(mongo_serializers.DocumentSerializer):
    work_experience = WorkExperienceSerializer(many=True, required=False)
    education_details = EducationSerializer(many=True, required=False)
    job_post_title = serializers.SerializerMethodField()
    job_post_department = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ('applied_at', 'updated_at', 'cv_url', 'cover_letter_url')
    
    def get_job_post_title(self, obj):
        return obj.job_post.title if obj.job_post else None
    
    def get_job_post_department(self, obj):
        return obj.job_post.department if obj.job_post else None

class JobApplicationCreateSerializer(mongo_serializers.DocumentSerializer):
    cv_file = serializers.FileField(write_only=True, required=True)
    work_experience = WorkExperienceSerializer(many=True, required=False)
    education_details = EducationSerializer(many=True, required=False)
    
    class Meta:
        model = JobApplication
        exclude = ('status', 'applied_at', 'updated_at', 'cv_file_id', 'cover_letter_file_id', 'cv_filename', 'cover_letter_filename', 'cv_url', 'cover_letter_url')
    
    def to_internal_value(self, data):
        # Handle work_experience and education_details conversion
        if 'work_experience' in data:
            if isinstance(data['work_experience'], str) and data['work_experience'].strip():
                try:
                    data['work_experience'] = json.loads(data['work_experience'])
                except json.JSONDecodeError:
                    data['work_experience'] = []
            elif not isinstance(data['work_experience'], (list, tuple)):
                data['work_experience'] = []
        
        if 'education_details' in data:
            if isinstance(data['education_details'], str) and data['education_details'].strip():
                try:
                    data['education_details'] = json.loads(data['education_details'])
                except json.JSONDecodeError:
                    data['education_details'] = []
            elif not isinstance(data['education_details'], (list, tuple)):
                data['education_details'] = []
        
        # Handle total_experience conversion to float
        if 'total_experience' in data:
            try:
                if data['total_experience'] == '' or data['total_experience'] is None:
                    data['total_experience'] = 0.0
                else:
                    data['total_experience'] = float(data['total_experience'])
            except (ValueError, TypeError):
                data['total_experience'] = 0.0

        # Handle skills conversion
        if 'skills' in data:
            if isinstance(data['skills'], str):
                data['skills'] = [skill.strip() for skill in data['skills'].split(',') if skill.strip()]
            elif not isinstance(data['skills'], (list, tuple)):
                data['skills'] = []
        
        # Convert empty strings to default values for optional fields
        optional_fields = [
            'portfolio_url', 'linkedin_url', 'applicant_address', 'current_company', 
            'current_position', 'current_salary', 'expected_salary', 'notice_period', 
            'highest_education', 'additional_info'
        ]
        
        for field in optional_fields:
            if field in data and (data[field] is None or data[field] == ''):
                data[field] = ''
        
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        import logging
        logger = logging.getLogger(__name__)
        # Create a copy for logging (excluding large files)
        log_data = {k: v for k, v in validated_data.items() if k != 'cv_file'}
        logger.info(f"JobApplicationCreateSerializer.create - validated_data: {log_data}")
        
        cv_file = validated_data.pop('cv_file', None)
        
        # Create application instance
        try:
            application = JobApplication(**validated_data)
            application.save()
            logger.info(f"JobApplication instance created: {application.id}")
        except Exception as e:
            logger.error(f"Error initializing/saving JobApplication: {str(e)}")
            raise serializers.ValidationError(f"Database error: {str(e)}")
        
        # Save files to R2 instead of GridFS
        if cv_file:
            try:
                # Read file content
                cv_file.seek(0)
                cv_data = cv_file.read()
                
                # Upload to R2
                cv_url = upload_to_r2(cv_data, cv_file.name, cv_file.content_type, folder='resumes')
                application.cv_url = cv_url
                application.cv_filename = cv_file.name
                application.cv_file_size = len(cv_data)
                
                application.save()
                logger.info(f"CV uploaded and application updated with URL: {cv_url}")
            except Exception as e:
                # Delete application if file saving fails
                logger.error(f"File upload to R2 failed: {str(e)}")
                application.delete()
                raise serializers.ValidationError(f"File upload to R2 failed: {str(e)}")
        
        return application

class JobApplicationStatusSerializer(mongo_serializers.DocumentSerializer):
    class Meta:
        model = JobApplication
        fields = ['status']