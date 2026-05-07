from rest_framework_mongoengine import serializers
from .models import WBJEEHub

class WBJEEHubSerializer(serializers.DocumentSerializer):
    class Meta:
        model = WBJEEHub
        fields = '__all__'
