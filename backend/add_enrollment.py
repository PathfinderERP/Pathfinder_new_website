import os
import django
import datetime

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from courses.models import Enrollment, Course
from users.models import User

def add_test_enrollment(user_id, course_name_search):
    print(f"Adding enrollment for user {user_id}...")
    
    # Check if user exists
    user = User.objects(id=user_id).first()
    if not user:
        print(f"User {user_id} not found!")
        return

    # Find a course
    course = Course.objects(name__icontains=course_name_search).first()
    if not course:
        # If no course found, find any active course with an image
        course = Course.objects(is_active=True).first()
        if not course:
            print("No courses found in database at all!")
            return

    # Check if already enrolled
    existing = Enrollment.objects(user_id=user_id, course_id=str(course.id)).first()
    if existing:
        print(f"User is already enrolled in {course.name} ({course.id})")
        # Let's try to find another one
        course = Course.objects(id__ne=course.id, is_active=True).first()
        if not course:
            print("No other unique courses found.")
            return

    print(f"Enrolling user in: {course.name} (ID: {course.id})")
    
    enrollment = Enrollment(
        user_id=user_id,
        course_id=str(course.id),
        course_name=course.name,
        amount_paid=course.course_price or 0,
        payment_id=f"TEST-PAY-{datetime.datetime.now().timestamp()}",
        payment_status='completed',
        enrolled_at=datetime.datetime.utcnow(),
        status='active'
    )
    enrollment.save()
    print(f"✅ Successfully enrolled user in {course.name}")
    print(f"Thumbnail URL: {course.get_thumbnail_url()[:50]}...")

if __name__ == "__main__":
    uid = '694e48f6f245f1c09da23602'
    add_test_enrollment(uid, "Boards")
