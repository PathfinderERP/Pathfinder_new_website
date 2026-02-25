import os
import django
from dotenv import load_dotenv

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
load_dotenv()
django.setup()

from users.models import User
from users.serializers import UserSerializer
from mongoengine.queryset.visitor import Q

def test_fetch_users():
    print("Testing fetch users logic...")
    try:
        # Check if we have users
        total = User.objects.count()
        print(f"Total users: {total}")
        
        # Test query logic
        query = Q()
        users = User.objects(query).order_by('-created_at')
        
        # Test serialization
        print("Serializing first 5 users...")
        users_subset = users[:5]
        serializer = UserSerializer(users_subset, many=True)
        data = serializer.data
        print(f"Successfully serialized {len(data)} users")
        if data:
            print("First user keys:", data[0].keys())
            print("First user name:", data[0].get('fullName'))

        print("\nTesting user stats logic...")
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        from datetime import datetime, timedelta
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_users = User.objects.filter(created_at__gte=seven_days_ago).count()
        
        class_distribution = {}
        classes = User.objects.distinct('student_class')
        for class_name in classes:
            if class_name:
                count = User.objects.filter(student_class=class_name).count()
                class_distribution[class_name] = count
        
        print(f"Stats: Total={total_users}, Active={active_users}, Recent={recent_users}")
        print(f"Class Distribution: {class_distribution}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_fetch_users()
