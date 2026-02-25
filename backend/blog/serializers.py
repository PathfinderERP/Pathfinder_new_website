from rest_framework import serializers
from rest_framework_mongoengine import serializers as mongo_serializers
from .models import BlogPost
from contact_backend.utils.mixins import Base64R2FileMixin

class BlogPostSerializer(Base64R2FileMixin, mongo_serializers.DocumentSerializer):
    image_file = serializers.CharField(write_only=True, required=False)
    
    # Mixin config
    file_input_fields = ['image_file']
    file_url_field = 'image_url'
    file_name_prefix = 'blog'

    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')

    def to_internal_value(self, data):
        data = self.extract_file_from_data(data)
        return super().to_internal_value(data)

    def validate(self, attrs):
        if 'image_file' in attrs and attrs['image_file']:
            data_uri = attrs.pop('image_file')
            processed = self.process_base64_file(data_uri)
            if processed:
                attrs.update(processed)
        return attrs
