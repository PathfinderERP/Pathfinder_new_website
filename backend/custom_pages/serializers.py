from rest_framework_mongoengine import serializers
from .models import CustomPage

class CustomPageSerializer(serializers.DocumentSerializer):
    class Meta:
        model = CustomPage
        fields = '__all__'
        extra_kwargs = {
            'meta_title': {'allow_blank': True, 'required': False},
            'meta_description': {'allow_blank': True, 'required': False},
            'meta_keywords': {'allow_blank': True, 'required': False},
        }
