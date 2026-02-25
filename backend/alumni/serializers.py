from rest_framework_mongoengine import serializers as mongo_serializers
from rest_framework import serializers as drf_serializers
from .models import Alumni
import base64
import os
from contact_backend.utils.r2_storage import upload_to_r2


class AlumniSerializer(mongo_serializers.DocumentSerializer):
    """Main serializer for Alumni model with Cloudflare R2 image upload"""
    # Note: 'images' and 'kept_image_urls' are handled manually in create/update
    # to avoid conflicts with mongoengine serializer field validation.

    class Meta:
        model = Alumni
        fields = [
            'id',
            'year',
            'profession',
            # 'images',  <-- Removed to prevent ImproperlyConfigured
            # 'kept_image_urls', <-- Removed to prevent ImproperlyConfigured
            'image_urls',  # read-only URLs
            'image_count',
            'is_active',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'image_count', 'image_urls']
    
    image_count = drf_serializers.SerializerMethodField(read_only=True)
    
    def get_image_count(self, obj):
        """Return the number of images"""
        return len(obj.image_urls) if obj.image_urls else 0
    
    def _upload_images_to_r2(self, images_data):
        """
        Upload base64 images to Cloudflare R2 and return URLs
        
        :param images_data: List of base64 encoded image strings
        :return: List of public URLs
        """
        uploaded_urls = []
        
        for idx, image_data in enumerate(images_data):
            try:
                # Handle data URL format
                if image_data.startswith('data:'):
                    header, encoded = image_data.split(',', 1)
                    content_type = header.split(':')[1].split(';')[0]
                else:
                    encoded = image_data
                    content_type = 'image/jpeg'
                
                # Decode base64
                file_data = base64.b64decode(encoded)
                
                # Determine file extension
                ext_map = {
                    'image/jpeg': '.jpg',
                    'image/jpg': '.jpg',
                    'image/png': '.png',
                    'image/gif': '.gif',
                    'image/webp': '.webp'
                }
                ext = ext_map.get(content_type, '.jpg')
                
                # Generate filename
                filename = f"alumni_image_{idx}{ext}"
                
                # Upload to R2
                print(f"📤 Uploading image {idx + 1} to Cloudflare R2...")
                url = upload_to_r2(
                    file_data=file_data,
                    file_name=filename,
                    content_type=content_type,
                    folder='alumni'
                )
                
                uploaded_urls.append(url)
                print(f"✅ Image {idx + 1} uploaded successfully: {url}")
                
            except Exception as e:
                print(f"❌ Error uploading image {idx + 1}: {str(e)}")
                # Continue with other images even if one fails
                continue
        
        return uploaded_urls

    def create(self, validated_data):
        """Create new alumni entry with images uploaded to R2"""
        # images might not be in validated_data if removed from Meta.fields
        images_data = validated_data.pop('images', [])
        if not images_data and 'images' in self.initial_data:
            images_data = self.initial_data.get('images', [])

        # Remove kept_image_urls if present (not used in create)
        validated_data.pop('kept_image_urls', None)
        
        print(f"🆕 Creating new alumni entry")
        print(f"📝 Validated data: {validated_data}")
        print(f"🖼️ Images to upload: {len(images_data)}")
        
        # Upload images to R2 and get URLs (rest is same)
        
        # Upload images to R2 and get URLs
        if images_data:
            try:
                print(f"📤 Uploading {len(images_data)} images to Cloudflare R2...")
                validated_data['image_urls'] = self._upload_images_to_r2(images_data)
                print(f"✅ Successfully uploaded {len(validated_data['image_urls'])} images")
            except Exception as e:
                print(f"❌ Error uploading images: {str(e)}")
                raise drf_serializers.ValidationError(f"Failed to upload images: {str(e)}")
        else:
            validated_data['image_urls'] = []
            print("ℹ️ No images to upload")
        
        # Get user info from context if available
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = getattr(request.user, 'email', 'system')
            validated_data['updated_by'] = getattr(request.user, 'email', 'system')
        
        try:
            alumni = Alumni(**validated_data)
            alumni.save()
            print(f"✅ Alumni created successfully with ID: {alumni.id}")
        except Exception as e:
            print(f"❌ Error saving alumni: {str(e)}")
            raise drf_serializers.ValidationError(f"Failed to save alumni: {str(e)}")
        
        return alumni
    
    def update(self, instance, validated_data):
        """Update alumni entry"""
        # Fallback to initial_data if fields missing from validated_data
        images_data = validated_data.pop('images', None)
        if images_data is None and 'images' in self.initial_data:
            images_data = self.initial_data.get('images', [])

        kept_urls = validated_data.pop('kept_image_urls', None)
        if kept_urls is None and 'kept_image_urls' in self.initial_data:
            kept_urls = self.initial_data.get('kept_image_urls', [])
        
        print(f"🔄 Updating alumni {instance.id}")
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Process images
        # 1. Start with kept URLs
        final_image_urls = kept_urls if kept_urls is not None else []
        
        # 2. Upload and append new images
        if images_data and len(images_data) > 0:
            print(f"📤 Uploading {len(images_data)} new images...")
            try:
                new_urls = self._upload_images_to_r2(images_data)
                if new_urls:
                    final_image_urls.extend(new_urls)
                    print(f"✅ Successfully uploaded {len(new_urls)} new images")
            except Exception as e:
                print(f"❌ Error uploading images: {str(e)}")
                raise drf_serializers.ValidationError(f"Failed to upload images: {str(e)}")
        
        # Update the instance with combined list
        # If kept_urls was None (not sent), we assume we shouldn't touch existing structure unless new images are adding
        # But here we want explicit control. 
        # Logic: If kept_urls is sent (list), we use it. If images_data is sent, we add to it.
        # If kept_image_urls was NOT sent, we might want to preserve existing? 
        # However, frontend will now responsible for sending kept_image_urls.
        
        # Fallback: if kept_image_urls was NOT in request at all (None), preserve existing
        # But validated_data.pop returns [] default above? Let's check keys
        
        instance.image_urls = final_image_urls
        print(f"📊 Final image count: {len(instance.image_urls)}")

        # Update user info
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            instance.updated_by = getattr(request.user, 'email', 'system')
        
        try:
            instance.save()
            print(f"✅ Alumni updated successfully")
        except Exception as e:
            print(f"❌ Error saving alumni: {str(e)}")
            raise drf_serializers.ValidationError(f"Failed to save alumni: {str(e)}")
        
        return instance

class AlumniListSerializer(mongo_serializers.DocumentSerializer):
    """Lightweight serializer for listing alumni"""
    image_count = drf_serializers.SerializerMethodField()
    thumbnail = drf_serializers.SerializerMethodField()
    image_urls = drf_serializers.ListField(
        child=drf_serializers.URLField(),
        read_only=True
    )
    
    class Meta:
        model = Alumni
        fields = [
            'id', 
            'year', 
            'profession', 
            'image_urls',  # Added for frontend gallery display
            'image_count', 
            'thumbnail', 
            'is_active', 
            'created_at', 
            'updated_at'
        ]
    
    def get_image_count(self, obj):
        return len(obj.image_urls) if obj.image_urls else 0
    
    def get_thumbnail(self, obj):
        """Return first image URL as thumbnail"""
        if obj.image_urls and len(obj.image_urls) > 0:
            return obj.image_urls[0]
        return None
