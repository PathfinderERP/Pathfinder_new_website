# courses/serializers.py
from rest_framework import serializers
from rest_framework_mongoengine import serializers as mongo_serializers
from .models import Course, Enrollment, FeesStructure, Topper, Category, CoursePlanPricing, Feature, PlanFeature, TeacherInfo, SubjectSchedule, FreeContent, CourseDetailSection, DetailPoint, BatchInfo, StudyMaterial, DoubtSession
import base64
import uuid
import os
from contact_backend.utils.r2_storage import upload_to_r2
from contact_backend.utils.mixins import Base64R2FileMixin


# ==================== EMBEDDED DOCUMENT SERIALIZERS ====================

class FeesStructureSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    is_optional = serializers.BooleanField(required=False)
    is_one_time = serializers.BooleanField(required=False)
    
    class Meta:
        model = FeesStructure
        fields = '__all__'


class TopperSerializer(Base64R2FileMixin, mongo_serializers.EmbeddedDocumentSerializer):
    year = serializers.IntegerField(required=False)
    image_file = serializers.CharField(required=False, write_only=True)
    image_url = serializers.SerializerMethodField()
    percentages = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    total_marks = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    obtained_marks = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    # Mixin config
    file_input_fields = ['image_file', 'image']
    file_url_field = 'image'
    file_name_prefix = 'topper'
    
    class Meta:
        model = Topper
        fields = '__all__'
        extra_kwargs = {
            'image_data': {'write_only': True},
            'image_content_type': {'write_only': True},
            'image_filename': {'write_only': True}
        }

    def get_image_url(self, obj):
        return obj.get_image_url()
    
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


class CategorySerializer(mongo_serializers.EmbeddedDocumentSerializer):
    order = serializers.IntegerField(required=False)
    is_featured = serializers.BooleanField(required=False)
    
    class Meta:
        model = Category
        fields = '__all__'


class FeatureSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    is_available_for_online = serializers.BooleanField(required=False)
    is_available_for_offline = serializers.BooleanField(required=False)
    
    class Meta:
        model = Feature
        fields = '__all__'


class PlanFeatureSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    feature = FeatureSerializer()
    included = serializers.BooleanField(required=False)
    order = serializers.IntegerField(required=False)
    
    class Meta:
        model = PlanFeature
        fields = '__all__'


class CoursePlanPricingSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    features = PlanFeatureSerializer(many=True, required=False)
    emi_available = serializers.BooleanField(required=False)
    order = serializers.IntegerField(required=False)
    is_popular = serializers.BooleanField(required=False)
    is_recommended = serializers.BooleanField(required=False)
    registration_fee_included = serializers.BooleanField(required=False)
    color_code = serializers.CharField(required=False)
    
    class Meta:
        model = CoursePlanPricing
        fields = '__all__'


class TeacherInfoSerializer(Base64R2FileMixin, mongo_serializers.EmbeddedDocumentSerializer):
    role = serializers.CharField(required=False)
    experience = serializers.IntegerField(required=False)
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False)
    is_active = serializers.BooleanField(required=False)
    profile_image_file = serializers.CharField(required=False, write_only=True)
    profile_image_url = serializers.SerializerMethodField()
    
    # Mixin config
    file_input_fields = ['profile_image_file', 'profile_image']
    file_url_field = 'profile_image'
    file_name_prefix = 'teacher'

    class Meta:
        model = TeacherInfo
        fields = '__all__'
        extra_kwargs = {
            'profile_image_data': {'write_only': True},
            'profile_image_content_type': {'write_only': True},
            'profile_image_filename': {'write_only': True}
        }

    def get_profile_image_url(self, obj):
        return obj.get_profile_image_url()
    
    def to_internal_value(self, data):
        data = self.extract_file_from_data(data)
        return super().to_internal_value(data)
    
    def to_representation(self, instance):
        """Object to JSON representation"""
        data = super().to_representation(instance)
        # Ensure 'profile_image' in JSON response uses the model's computed property
        data['profile_image'] = instance.get_profile_image_url()
        return data
    
    def validate(self, attrs):
        if 'profile_image_file' in attrs and attrs['profile_image_file']:
            data_uri = attrs.pop('profile_image_file')
            processed = self.process_base64_file(data_uri)
            if processed:
                attrs.update(processed)
        return attrs


class SubjectScheduleSerializer(Base64R2FileMixin, mongo_serializers.EmbeddedDocumentSerializer):
    order = serializers.IntegerField(required=False)
    schedule_pdf_file = serializers.CharField(write_only=True, required=False)
    
    # Mixin configuration
    file_input_fields = ['schedule_pdf_file']
    file_url_field = 'schedule_pdf_url'
    file_name_prefix = 'schedule'
    
    class Meta:
        model = SubjectSchedule
        fields = '__all__'
    
    def to_internal_value(self, data):
        data = self.extract_file_from_data(data)
        return super().to_internal_value(data)


class FreeContentSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    content_type = serializers.CharField(required=False)
    published_date = serializers.DateTimeField(required=False)
    order = serializers.IntegerField(required=False)
    is_active = serializers.BooleanField(required=False)
    
    class Meta:
        model = FreeContent
        fields = '__all__'


class DetailPointSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    order = serializers.IntegerField(required=False)
    
    class Meta:
        model = DetailPoint
        fields = '__all__'


class CourseDetailSectionSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    points = DetailPointSerializer(many=True, required=False)
    order = serializers.IntegerField(required=False)
    is_active = serializers.BooleanField(required=False)
    
    class Meta:
        model = CourseDetailSection
        fields = '__all__'


class BatchInfoSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    current_students = serializers.IntegerField(required=False)
    is_full = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    registration_open = serializers.BooleanField(required=False)
    
    class Meta:
        model = BatchInfo
        fields = '__all__'


class StudyMaterialSerializer(Base64R2FileMixin, mongo_serializers.EmbeddedDocumentSerializer):
    is_free = serializers.BooleanField(required=False)
    uploaded_at = serializers.DateTimeField(required=False)
    downloads = serializers.IntegerField(required=False)
    material_file = serializers.CharField(write_only=True, required=False)
    
    # Mixin configuration
    file_input_fields = ['material_file']
    file_url_field = 'file_url'
    file_name_prefix = 'study_material'
    
    class Meta:
        model = StudyMaterial
        fields = '__all__'
        
    def to_representation(self, instance):
        """Object to JSON representation"""
        data = super().to_representation(instance)
        if instance.file_url:
            data['file_url'] = instance.file_url
        return data
        
    def to_internal_value(self, data):
        data = self.extract_file_from_data(data)
        return super().to_internal_value(data)


class DoubtSessionSerializer(mongo_serializers.EmbeddedDocumentSerializer):
    support_timing = serializers.CharField(required=False)
    is_active = serializers.BooleanField(required=False)
    
    class Meta:
        model = DoubtSession
        fields = '__all__'


# ==================== COURSE SERIALIZER ====================

class CourseSerializer(Base64R2FileMixin, mongo_serializers.DocumentSerializer):
    # Embedded document serializers
    fees_structures = FeesStructureSerializer(many=True, required=False)
    toppers = TopperSerializer(many=True, required=False)
    category = CategorySerializer(required=False)
    plans = CoursePlanPricingSerializer(many=True, required=False)
    teachers = TeacherInfoSerializer(many=True, required=False)
    subject_schedules = SubjectScheduleSerializer(many=True, required=False)
    free_contents = FreeContentSerializer(many=True, required=False)
    detail_sections = CourseDetailSectionSerializer(many=True, required=False)
    batches = BatchInfoSerializer(many=True, required=False)
    study_materials = StudyMaterialSerializer(many=True, required=False)
    doubt_sessions = DoubtSessionSerializer(many=True, required=False)
    
    # Special fields
    state = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    district = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    offers = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    discounted_price = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    slug = serializers.CharField(read_only=True)
    code = serializers.CharField(read_only=True)
    thumbnail_image_file = serializers.CharField(required=False, write_only=True)
    thumbnail_url = serializers.URLField(required=False, allow_null=True)
    thumbnail_display_url = serializers.SerializerMethodField()
    course_title = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    
    # Mixin config for thumbnail
    file_input_fields = ['thumbnail_image_file', 'thumbnail_url']
    file_url_field = 'thumbnail_url'
    file_name_prefix = 'thumbnail'
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = (
            'id', 'code', 'slug', 'created_at', 'updated_at', 
            'created_by', 'created_by_email', 'popularity', 'rating',
            'total_reviews', 'total_enrollments'
        )
        extra_kwargs = {
            'thumbnail_image_data': {'write_only': True},
            'thumbnail_content_type': {'write_only': True},
            'thumbnail_filename': {'write_only': True},
        }
    
    def get_thumbnail_display_url(self, obj):
        return obj.get_thumbnail_url()
    
    def to_representation(self, instance):
        """Object to JSON representation"""
        data = super().to_representation(instance)
        # Ensure 'thumbnail_url' in JSON response uses the model's computed property
        # which handles both R2 URLs and legacy base64 binary fields
        data['thumbnail_url'] = instance.get_thumbnail_url()
        return data
        
    def to_internal_value(self, data):
        data = self.extract_file_from_data(data)
        return super().to_internal_value(data)
    
    def validate(self, attrs):
        if 'thumbnail_image_file' in attrs and attrs['thumbnail_image_file']:
            data_uri = attrs.pop('thumbnail_image_file')
            processed = self.process_base64_file(data_uri)
            if processed:
                attrs.update(processed)
        return attrs
    
    # ==================== HELPER METHODS ====================
    
    def _handle_online_course(self, validated_data):
        """Set appropriate defaults for online courses"""
        mode = validated_data.get('mode')
        centre = validated_data.get('centre', '').lower()
        
        if mode == 'online' or centre == 'online':
            validated_data['state'] = None
            validated_data['district'] = None
            validated_data['location'] = validated_data.get('location', 'Online')
            validated_data['address'] = validated_data.get('address', 'Virtual Classroom')
            validated_data['mode'] = 'online'
        
        return validated_data
    
    def _create_plans(self, plans_data):
        """Create plan objects with nested features"""
        plans = []
        for plan_data in plans_data:
            features_data = plan_data.pop('features', [])
            plan = CoursePlanPricing(**plan_data)
            plan.features = [PlanFeature(**fd) for fd in features_data]
            plans.append(plan)
        return plans
    
    def _create_detail_sections(self, sections_data):
        """Create detail section objects with nested points"""
        sections = []
        for section_data in sections_data:
            points_data = section_data.pop('points', [])
            section = CourseDetailSection(**section_data)
            section.points = [DetailPoint(**pd) for pd in points_data]
            sections.append(section)
        return sections
    
    def _pop_embedded_data(self, validated_data, default=None):
        """Pop all embedded document data from validated_data"""
        embedded_fields = [
            'fees_structures', 'toppers', 'category', 'plans', 'teachers',
            'subject_schedules', 'free_contents', 'detail_sections',
            'batches', 'study_materials', 'doubt_sessions'
        ]
        return {field: validated_data.pop(field, default) for field in embedded_fields}
    
    def _create_embedded_documents(self, embedded_data):
        """Create all embedded document instances"""
        return {
            'fees_structures': [FeesStructure(**d) for d in (embedded_data.get('fees_structures') or [])],
            'toppers': [Topper(**d) for d in (embedded_data.get('toppers') or [])],
            'category': Category(**embedded_data['category']) if embedded_data.get('category') else None,
            'plans': self._create_plans(embedded_data.get('plans') or []),
            'teachers': [TeacherInfo(**d) for d in (embedded_data.get('teachers') or [])],
            'subject_schedules': [SubjectSchedule(**d) for d in (embedded_data.get('subject_schedules') or [])],
            'free_contents': [FreeContent(**d) for d in (embedded_data.get('free_contents') or [])],
            'detail_sections': self._create_detail_sections(embedded_data.get('detail_sections') or []),
            'batches': [BatchInfo(**d) for d in (embedded_data.get('batches') or [])],
            'study_materials': [StudyMaterial(**d) for d in (embedded_data.get('study_materials') or [])],
            'doubt_sessions': [DoubtSession(**d) for d in (embedded_data.get('doubt_sessions') or [])],
        }
    
    # ==================== CREATE / UPDATE ====================
    
    def create(self, validated_data):
        # Pop embedded data
        embedded_data = self._pop_embedded_data(validated_data, default=[])
        
        # Handle online course defaults
        validated_data = self._handle_online_course(validated_data)
        
        # Create embedded documents
        embedded_docs = self._create_embedded_documents(embedded_data)
        
        # Create and save course
        course = Course(**validated_data, **embedded_docs)
        course.save()
        return course
    
    def update(self, instance, validated_data):
        # Pop embedded data (use None as default to detect "not provided")
        embedded_data = self._pop_embedded_data(validated_data, default=None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update embedded documents only if provided (not None)
        if embedded_data.get('fees_structures') is not None:
            instance.fees_structures = [FeesStructure(**d) for d in embedded_data['fees_structures']]
        
        if embedded_data.get('toppers') is not None:
            instance.toppers = [Topper(**d) for d in embedded_data['toppers']]
        
        if embedded_data.get('category') is not None:
            instance.category = Category(**embedded_data['category'])
        
        if embedded_data.get('plans') is not None:
            instance.plans = self._create_plans(embedded_data['plans'])
        
        if embedded_data.get('teachers') is not None:
            instance.teachers = [TeacherInfo(**d) for d in embedded_data['teachers']]
        
        if embedded_data.get('subject_schedules') is not None:
            instance.subject_schedules = [SubjectSchedule(**d) for d in embedded_data['subject_schedules']]
        
        if embedded_data.get('free_contents') is not None:
            instance.free_contents = [FreeContent(**d) for d in embedded_data['free_contents']]
        
        if embedded_data.get('detail_sections') is not None:
            instance.detail_sections = self._create_detail_sections(embedded_data['detail_sections'])
        
        if embedded_data.get('batches') is not None:
            instance.batches = [BatchInfo(**d) for d in embedded_data['batches']]
        
        if embedded_data.get('study_materials') is not None:
            instance.study_materials = [StudyMaterial(**d) for d in embedded_data['study_materials']]
        
        if embedded_data.get('doubt_sessions') is not None:
            instance.doubt_sessions = [DoubtSession(**d) for d in embedded_data['doubt_sessions']]
        
        instance.save()
        return instance


class EnrollmentSerializer(mongo_serializers.DocumentSerializer):
    course_name = serializers.CharField(required=False)
    
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('id', 'enrolled_at')
