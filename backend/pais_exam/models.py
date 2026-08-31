from mongoengine import Document, fields
import datetime

class PaisStudent(Document):
    registration_id = fields.StringField(required=True, unique=True, max_length=50) # e.g. PAIS20261001
    name = fields.StringField(required=True, max_length=255)
    phone = fields.StringField(required=True, max_length=20)
    email = fields.EmailField(required=False, null=True)
    password = fields.StringField(required=True, max_length=255)
    student_class = fields.StringField(required=True, max_length=50, default='Class X')
    exam_mode = fields.StringField(required=True, max_length=100, default='Online Exam (From Home)')
    centre = fields.StringField(required=True, max_length=100, default='Hazra (Head Office)')
    course_type = fields.StringField(required=True, max_length=100, default='Engineering (JEE / WBJEE)')
    exam_date = fields.StringField(default='11/10/2026')
    exam_time = fields.StringField(default='Morning 10:30 AM to 11:30 AM')
    admission_status = fields.StringField(default='Ticket Issued') # Registered | Ticket Issued | Branch Visited | Admission Confirmed
    created_at = fields.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'pais_students',
        'ordering': ['-created_at'],
        'indexes': ['registration_id', 'phone', 'email']
    }

    def __str__(self):
        return f"{self.name} ({self.registration_id})"


class PaisCenterCapacity(Document):
    centre_name = fields.StringField(required=True, max_length=150)
    exam_date = fields.StringField(required=True, max_length=50, default='11/10/2026')
    time_slot = fields.StringField(required=True, max_length=100, default='Morning 10:30 AM to 11:30 AM')
    exam_mode = fields.StringField(default='Offline Exam (At Centre)')
    max_capacity = fields.IntField(default=100) # Max seats allowed to manage crowds
    current_bookings = fields.IntField(default=0)
    is_active = fields.BooleanField(default=True)

    meta = {
        'collection': 'pais_center_capacities',
        'ordering': ['centre_name', 'time_slot'],
        'indexes': ['centre_name', 'exam_date', 'time_slot']
    }


class PaisQuestion(Document):
    question_id = fields.IntField(required=True)
    subject = fields.StringField(required=True, choices=['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Mental Ability'])
    class_level = fields.StringField(default='Class X')
    question_text = fields.StringField(required=True)
    options = fields.ListField(fields.StringField(), required=True)
    correct_option = fields.IntField(required=True) # 0, 1, 2, 3
    marks = fields.IntField(default=2)
    is_sample_test = fields.BooleanField(default=True)
    exam_date = fields.StringField(null=True, blank=True, default='11/10/2026')
    time_slot = fields.StringField(null=True, blank=True, default='Morning 10:30 AM to 11:30 AM')

    meta = {
        'collection': 'pais_questions',
        'ordering': ['question_id']
    }


class PaisExamSubmission(Document):
    registration_id = fields.StringField(required=True, max_length=50)
    student_name = fields.StringField(max_length=255)
    exam_type = fields.StringField(default='Sample Test')
    score = fields.IntField(default=0)
    total_marks = fields.IntField(default=90)
    correct_count = fields.IntField(default=0)
    incorrect_count = fields.IntField(default=0)
    unanswered_count = fields.IntField(default=0)
    percentage = fields.FloatField(default=0.0)
    scholarship_percentage = fields.IntField(default=0)
    answers = fields.DictField()
    submitted_at = fields.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'pais_exam_submissions',
        'ordering': ['-submitted_at'],
        'indexes': ['registration_id', 'submitted_at']
    }
