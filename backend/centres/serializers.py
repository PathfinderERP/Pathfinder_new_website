# centres/serializers.py
from rest_framework_mongoengine import serializers as mongo_serializers
from rest_framework import serializers
from .models import Centre, Topper
from datetime import datetime
from contact_backend.utils.mixins import Base64R2FileMixin

class TopperSerializer(Base64R2FileMixin, mongo_serializers.EmbeddedDocumentSerializer):
    image_url = serializers.SerializerMethodField()
    image_file = serializers.CharField(write_only=True, required=False)
    
    # Mixin configuration
    file_input_fields = ['image_file']
    file_url_field = 'image'
    file_name_prefix = 'topper'
    
    class Meta:
        model = Topper
        fields = [
            'name', 'exam', 'rank', 'category', 'year', 'topper_msg', 'percentages', 
            'marks_obtained', 'total_marks', 'score', 'badge', 
            'image_file', 'image', 'image_url'
        ]
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True, 'allow_blank': True}
        }
    
    def to_representation(self, instance):
        """Object to JSON representation"""
        data = super().to_representation(instance)
        # Ensure 'image' in JSON response uses the model's computed property
        # which handles both R2 URLs and legacy base64 binary fields
        data['image'] = instance.get_image_url()
        return data
    
    def to_internal_value(self, data):
        data = self.extract_file_from_data(data)
        return super().to_internal_value(data)
    
    def get_image_url(self, obj):
        """Generate frontend-friendly image URL"""
        return obj.get_image_url()
    
    def to_representation(self, instance):
        """
        Override to ensure image_url is properly included
        """
        data = super().to_representation(instance)
        
        # Ensure image_url is always included and properly formatted
        if instance.image_data:
            data['image_url'] = instance.get_image_url()
        elif instance.image:
            data['image_url'] = instance.image
        else:
            data['image_url'] = None
            
        return data

class CentreSerializer(Base64R2FileMixin, mongo_serializers.DocumentSerializer):
    toppers = TopperSerializer(many=True, required=False)
    logo_url = serializers.SerializerMethodField()
    logo_file = serializers.CharField(write_only=True, required=False)
    
    # Add explicit date formatting
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    
    # Mixin configuration
    file_input_fields = ['logo_file']
    file_url_field = 'logo'
    file_name_prefix = 'centre_logo'
    
    class Meta:
        model = Centre
        fields = ['id', 'state', 'district', 'centre', 'centre_type', 'location', 'address', 'map_url',
                 'toppers', 'logo_file', 'logo', 'logo_url', 'created_by', 'created_at', 'updated_at']
        extra_kwargs = {
            'logo': {'required': False, 'allow_null': True, 'allow_blank': True}
        }
    
    def to_representation(self, instance):
        """Object to JSON representation"""
        data = super().to_representation(instance)
        # Ensure 'logo' in JSON response uses the model's computed property
        data['logo'] = instance.get_logo_url()
        return data
    
    def to_internal_value(self, data):
        data = self.extract_file_from_data(data)
        return super().to_internal_value(data)
    
    def get_logo_url(self, obj):
        """Generate frontend-friendly logo URL"""
        return obj.get_logo_url()
    
    def get_created_at(self, obj):
        """Format created_at for frontend"""
        if obj.created_at:
            # Return ISO format string that JavaScript can parse
            return obj.created_at.isoformat()
        return None
    
    def get_updated_at(self, obj):
        """Format updated_at for frontend"""
        if obj.updated_at:
            # Return ISO format string that JavaScript can parse
            return obj.updated_at.isoformat()
        return None
    
    def validate_logo_data(self, value):
        """Validate logo data with 12MB limit"""
        if value and len(value) > 12 * 1024 * 1024:
            raise serializers.ValidationError("Logo size cannot exceed 12MB")
        return value
    
    def to_representation(self, instance):
        """
        Override to add computed fields and ensure proper date formatting
        """
        data = super().to_representation(instance)
        
        # Ensure dates are properly formatted (backup)
        if instance.created_at and not data.get('created_at'):
            data['created_at'] = instance.created_at.isoformat()
        if instance.updated_at and not data.get('updated_at'):
            data['updated_at'] = instance.updated_at.isoformat()
        
        # Add created_by info
        if hasattr(instance, 'created_by') and instance.created_by:
            data['created_by_email'] = getattr(instance.created_by, 'email', None)
            data['created_by_name'] = getattr(instance.created_by, 'full_name', None)
        else:
            data['created_by_email'] = None
            data['created_by_name'] = None
            
        return data
    
    def create(self, validated_data):
        toppers_data = validated_data.pop('toppers', [])
        
        # Process toppers with image data
        toppers = []
        for topper_data in toppers_data:
            toppers.append(Topper(**topper_data))
        
        # Create centre
        centre = Centre(
            **validated_data,
            toppers=toppers
        )
        centre.save()
        return centre
    
    def update(self, instance, validated_data):
        toppers_data = validated_data.pop('toppers', None)
        
        # Handle explicitly clearing logo
        if 'logo' in validated_data and (validated_data['logo'] is None or validated_data['logo'] == ""):
            instance.logo = None
            instance.logo_data = None
            instance.logo_content_type = None
            instance.logo_filename = None
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # ✅ FIXED: Update toppers while preserving existing image data unless explicitly cleared
        if toppers_data is not None:
            updated_toppers = []
            for index, topper_data in enumerate(toppers_data):
                # If this topper index exists, preserve its image data
                if index < len(instance.toppers):
                    existing_topper = instance.toppers[index]
                    
                    # Check if image is explicitly being cleared
                    is_image_cleared = 'image' in topper_data and (topper_data['image'] is None or topper_data['image'] == "")
                    
                    if is_image_cleared:
                        topper_data['image'] = None
                        topper_data['image_data'] = None
                        topper_data['image_content_type'] = None
                        topper_data['image_filename'] = None
                    else:
                        # ✅ PRESERVE existing image data if not provided in update and not cleared
                        if 'image_data' not in topper_data and existing_topper.image_data:
                            topper_data['image_data'] = existing_topper.image_data
                        if 'image_content_type' not in topper_data and existing_topper.image_content_type:
                            topper_data['image_content_type'] = existing_topper.image_content_type
                        if 'image_filename' not in topper_data and existing_topper.image_filename:
                            topper_data['image_filename'] = existing_topper.image_filename
                        if 'image' not in topper_data and existing_topper.image:
                            topper_data['image'] = existing_topper.image
                    
                    # ✅ Also preserve timestamps
                    if 'created_at' not in topper_data and existing_topper.created_at:
                        topper_data['created_at'] = existing_topper.created_at
                    if 'updated_at' not in topper_data:
                        topper_data['updated_at'] = datetime.now()
                
                # Create new topper with preserved data
                updated_toppers.append(Topper(**topper_data))
            
            instance.toppers = updated_toppers
        
        instance.save()
        return instance