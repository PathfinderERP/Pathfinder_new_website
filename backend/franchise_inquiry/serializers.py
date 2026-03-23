from rest_framework import serializers
from .models import FranchiseInquiry

class FranchiseInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = FranchiseInquiry
        fields = '__all__'
        read_only_fields = ['created_at', 'is_contacted']
