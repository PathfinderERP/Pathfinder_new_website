from rest_framework_mongoengine import serializers
from .models import PredictionPopupConfig

class PredictionPopupConfigSerializer(serializers.DocumentSerializer):
    class Meta:
        model = PredictionPopupConfig
        fields = '__all__'
