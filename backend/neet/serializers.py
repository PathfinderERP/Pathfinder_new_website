from rest_framework_mongoengine import serializers
from .models import NEETHub

class NEETHubSerializer(serializers.DocumentSerializer):
    class Meta:
        model = NEETHub
        fields = '__all__'
