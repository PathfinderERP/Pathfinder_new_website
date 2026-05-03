from rest_framework_mongoengine import serializers
from .models import Announcement

class AnnouncementSerializer(serializers.DocumentSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'
