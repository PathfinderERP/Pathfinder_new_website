import os
import django
import sys

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from courses.models import Enrollment, Course

def test_user_enrollments(user_id):
    print(f"Searching for enrollments for {user_id}")
    try:
        enrollments = Enrollment.objects(user_id=user_id)
        print(f"Found {len(enrollments)} enrollments")
        
        for e in enrollments:
            print(f"Enrollment ID: {e.id}")
            print(f"Course ID stored: {e.course_id}")
            try:
                # This is what backend does
                course = Course.objects(id=e.course_id).first()
                print(f"Course Found: {course.name if course else 'None'}")
            except Exception as inner_e:
                print(f"Error finding course: {inner_e}")
                
            print("-" * 20)
    except Exception as e:
        print(f"General Error: {e}")

if __name__ == "__main__":
    uid = '694e48f6f245f1c09da23602'
    test_user_enrollments(uid)
