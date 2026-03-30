# centres/serializers.py
from rest_framework_mongoengine import serializers as mongo_serializers
from rest_framework import serializers
from .models import Centre, Topper
from datetime import datetime
from contact_backend.utils.mixins import Base64R2FileMixin

class TopperSerializer(Base64R2FileMixin, mongo_serializers.EmbeddedDocumentSerializer):
    image_url = serializers.SerializerMethodField()
    image_file = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    image = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
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
            'image': {'required': False, 'allow_null': True, 'allow_blank': True},
            'badge': {'required': False, 'allow_null': True, 'allow_blank': True},
            'topper_msg': {'required': False, 'allow_null': True, 'allow_blank': True},
            'percentages': {'required': False, 'allow_null': True}
        }
    
    def validate_image_file(self, value):
        """Validate image file size before R2 upload (approx 12MB limit)"""
        if value and 'base64,' in str(value) and len(str(value)) > 16 * 1024 * 1024:
            raise serializers.ValidationError("Image size cannot exceed 12MB")
        return value

    def get_image_url(self, obj):
        """Generate frontend-friendly image URL"""
        return obj.get_image_url()
    
    def to_representation(self, instance):
        """
        Object to JSON representation with computed fields
        """
        data = super().to_representation(instance)
        
        # Ensure image_url is always included and properly formatted
        # Prioritize URLs but fallback to binary data if needed
        data['image_url'] = instance.get_image_url()
        
        # Backward compatibility: ensure 'image' also contains the correct URL
        data['image'] = instance.get_image_url()
            
        return data

class CentreSerializer(Base64R2FileMixin, mongo_serializers.DocumentSerializer):
    toppers = TopperSerializer(many=True, required=False)
    logo_url = serializers.SerializerMethodField()
    logo_file = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True)
    
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
    
    def get_logo_url(self, obj):
        """Generate frontend-friendly logo URL"""
        return obj.get_logo_url()
    
    def get_created_at(self, obj):
        """Format created_at for frontend"""
        if obj.created_at:
            return obj.created_at.isoformat()
        return None
    
    def get_updated_at(self, obj):
        """Format updated_at for frontend"""
        if obj.updated_at:
            return obj.updated_at.isoformat()
        return None
    
    def validate_logo_file(self, value):
        """Validate logo file size (approx 12MB limit)"""
        if value and len(value) > 16 * 1024 * 1024: # 16MB base64 is ~12MB binary
            raise serializers.ValidationError("Logo size cannot exceed 12MB")
        return value
    
    def to_representation(self, instance):
        """
        Custom representation to handle computed fields, proper dates, and logo URLs
        """
        data = super().to_representation(instance)
        
        # Ensure 'logo' and 'logo_url' in JSON response use the model's computed property
        logo_url = instance.get_logo_url()
        data['logo'] = logo_url
        data['logo_url'] = logo_url
        
        # Ensure dates are properly formatted
        if instance.created_at:
            data['created_at'] = instance.created_at.isoformat()
        if instance.updated_at:
            data['updated_at'] = instance.updated_at.isoformat()
        
        from mongoengine.errors import DoesNotExist
        
        # Add created_by info if available
        try:
            if hasattr(instance, 'created_by') and instance.created_by:
                data['created_by_email'] = getattr(instance.created_by, 'email', None)
                data['created_by_name'] = getattr(instance.created_by, 'full_name', None)
            else:
                data['created_by_email'] = None
                data['created_by_name'] = None
        except (DoesNotExist, AttributeError):
            data['created_by_email'] = None
            data['created_by_name'] = None
            
        return data
    
    def create(self, validated_data):
        # 1. Process Logo only after validation
        print("\n" + "="*50 + "\n[START CREATING CENTRE]\n" + "="*50)
        validated_data = self.extract_file_from_data(validated_data)
        
        toppers_data = validated_data.pop('toppers', [])
        print(f"[TOPPERS] Processing {len(toppers_data)} toppers")
        
        # 2. Process Toppers
        toppers = []
        topper_serializer = TopperSerializer()
        for i, topper_data in enumerate(toppers_data):
            print(f"--- Topper {i} Input: { {k: (v[:20]+'...' if isinstance(v, str) and len(v)>20 else v) for k,v in topper_data.items()} }")
            # Explicitly process images
            topper_data = topper_serializer.extract_file_from_data(topper_data)
            print(f"--- Topper {i} Post-Extraction: image={topper_data.get('image')}")
            
            # Ensure 'image' is in clean_data if it was extracted
            allowed_fields = [
                'name', 'exam', 'rank', 'category', 'year', 'topper_msg', 'percentages', 
                'marks_obtained', 'total_marks', 'score', 'badge', 'image', 'created_at', 'updated_at'
            ]
            clean_topper_data = {k: v for k, v in topper_data.items() if k in allowed_fields}
            print(f"--- Topper {i} Final Model Data: {clean_topper_data}")
            toppers.append(Topper(**clean_topper_data))
        
        # Create centre
        centre = Centre(
            **validated_data,
            toppers=toppers
        )
        centre.save()
        print(f"[SUCCESS] Centre created successfully with ID: {centre.id}")
        return centre
    
    def update(self, instance, validated_data):
        # 1. Process Logo only after validation
        print("\n" + "="*50 + "\n[START UPDATING CENTRE]\n" + "="*50)
        validated_data = self.extract_file_from_data(validated_data)

        toppers_data = validated_data.pop('toppers', None)
        
        # Handle explicitly clearing logo
        if 'logo' in validated_data and (validated_data['logo'] is None or validated_data['logo'] == ""):
            instance.logo = None
        
        # Update basic fields
        for attr, value in validated_data.items():
            if hasattr(instance, attr):
                setattr(instance, attr, value)
        
        # 2. Update toppers while preserving existing image URLs
        if toppers_data is not None:
            updated_toppers = []
            topper_serializer = TopperSerializer()
            print(f"[TOPPERS] Updating {len(toppers_data)} toppers")
            for index, topper_data in enumerate(toppers_data):
                print(f"--- Topper {index} Input: { {k: (v[:20]+'...' if isinstance(v, str) and len(v)>20 else v) for k,v in topper_data.items()} }")
                # Process topper images after validation
                topper_data = topper_serializer.extract_file_from_data(topper_data)
                print(f"--- Topper {index} Post-Extraction: image={topper_data.get('image')}")

                # Preserve existing topper data if available
                if index < len(instance.toppers):
                    existing_topper = instance.toppers[index]
                    
                    # Check if NEW image was extracted
                    if not topper_data.get('image'):
                        # Check if image was explicitly cleared or just missing
                        is_explicit_clear = 'image' in topper_data and (topper_data['image'] is None or topper_data['image'] == "")
                        
                        if not is_explicit_clear and existing_topper.image:
                            # Preserve existing URL
                            print(f"--- Topper {index}: Preserving old image URL: {existing_topper.image}")
                            topper_data['image'] = existing_topper.image
                        elif is_explicit_clear:
                            print(f"--- Topper {index}: Image EXPLICITLY CLEARED")
                    else:
                        print(f"--- Topper {index}: NEW image uploaded: {topper_data.get('image')}")
                    
                    # Preserve timestamps if not provided
                    if not topper_data.get('created_at') and existing_topper.created_at:
                        topper_data['created_at'] = existing_topper.created_at
                
                # Update timestamp
                topper_data['updated_at'] = datetime.now()
                
                # Cleanup and create new topper
                allowed_fields = [
                    'name', 'exam', 'rank', 'category', 'year', 'topper_msg', 'percentages', 
                    'marks_obtained', 'total_marks', 'score', 'badge', 'image', 'created_at', 'updated_at'
                ]
                clean_topper_data = {k: v for k, v in topper_data.items() if k in allowed_fields}
                print(f"--- Topper {index} Final Model Data: {clean_topper_data}")
                updated_toppers.append(Topper(**clean_topper_data))
            
            instance.toppers = updated_toppers
        
        instance.save()
        print(f"[SUCCESS] Centre updated successfully ID: {instance.id}")
        return instance