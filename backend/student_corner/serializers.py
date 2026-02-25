from rest_framework_mongoengine import serializers as mongoserializers
from rest_framework import serializers
from .models import StudentCornerItem, StudentCornerOrder

class StudentCornerItemSerializer(mongoserializers.DocumentSerializer):
    custom_category = serializers.CharField(required=False, allow_blank=True)
    board = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    class_level = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    course_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    custom_board = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    custom_class_level = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    custom_course_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = StudentCornerItem
        fields = '__all__'
        read_only_fields = ('unique_id', 'created_by', 'updated_by', 'created_at', 'updated_at', 'discounted_price')

class StudentCornerOrderSerializer(mongoserializers.DocumentSerializer):
    class Meta:
        model = StudentCornerOrder
        fields = '__all__'
        read_only_fields = ('id', 'created_at')
