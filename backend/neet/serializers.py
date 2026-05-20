from rest_framework_mongoengine import serializers
from .models import NEETHub

class NEETHubSerializer(serializers.DocumentSerializer):
    class Meta:
        model = NEETHub
        fields = '__all__'
        extra_kwargs = {
            'description': {'allow_blank': True, 'required': False},
            'sub_description': {'allow_blank': True, 'required': False},
            'hero_image_url': {'allow_blank': True, 'required': False},
            'custom_html': {'allow_blank': True, 'required': False},
            'meta_title': {'allow_blank': True, 'required': False},
            'meta_description': {'allow_blank': True, 'required': False},
        }

