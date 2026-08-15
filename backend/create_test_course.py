import os
import django
import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from courses.models import Course

def create_test_course():
    # Check if test course already exists
    existing = Course.objects(name="Test Payment Course").first()
    if existing:
        # Update price to 1000 Rs just in case it exists with a different price
        existing.course_price = 1000.00
        existing.is_active = True
        existing.save()
        print(f"Test course updated successfully with ID: {existing.id} and price 1000 Rs.")
        return
        
    # Create the test course
    course = Course(
        centre="Online",
        name="Test Payment Course",
        mode="online",
        course_price=1000.00,
        class_level="12",
        course_title="Test Payment Course (1000 Rs)",
        duration="1 Month",
        is_active=True,
        course_sessions="2026-2027",
        location="Online",
        address="Online Portal",
        created_at=datetime.datetime.now(),
        updated_at=datetime.datetime.now()
    )
    course.save()
    print(f"Successfully created test payment course with ID: {course.id}")

if __name__ == "__main__":
    create_test_course()
