import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from users.models import User
import bcrypt

def test_password_hash():
    email = "malaly@pathfinder.edu.com"
    new_pwd = "password123"
    
    try:
        user = User.objects.get(email=email)
        print(f"Found user: {user.email}")
        
        # Test current password check (it might fail if it's already broken)
        print(f"Checking current password against '{new_pwd}': {user.check_password(new_pwd)}")
        
        # Reset password
        print(f"Resetting password to '{new_pwd}'...")
        user.set_password(new_pwd)
        user.save()
        
        # Fetch again to be sure
        user_reloaded = User.objects.get(email=email)
        print(f"Stored hash: {user_reloaded.password}")
        
        # Test check_password
        result = user_reloaded.check_password(new_pwd)
        print(f"Checking new password: {result}")
        
        if result:
            print("✅ Password hashing and checking works correctly in CLI.")
        else:
            print("❌ Password hashing and checking FAILED in CLI.")
            
    except User.DoesNotExist:
        print(f"User {email} not found. Creating temporary user...")
        user = User(
            full_name="Test User",
            email=email,
            phone="1234567890",
            student_class="10",
            area="Test Area",
            school="Test School"
        )
        user.set_password(new_pwd)
        user.save()
        print("User created. Reloading and checking...")
        user_reloaded = User.objects.get(email=email)
        result = user_reloaded.check_password(new_pwd)
        print(f"Checking new password: {result}")
        user_reloaded.delete()
        if result:
            print("✅ Password hashing and checking works correctly for NEW user.")
        else:
            print("❌ Password hashing and checking FAILED for NEW user.")

from admin_auth.models import Admin

def test_admin_password_hash():
    email = "admin@test.com"
    new_pwd = "adminpassword123"
    
    try:
        admin = Admin.objects.get(email=email)
        print(f"Found admin: {admin.email}")
        
        # Reset password
        print(f"Resetting admin password to '{new_pwd}'...")
        admin.set_password(new_pwd)
        # admin.set_password already calls save()
        
        # Fetch again
        admin_reloaded = Admin.objects.get(email=email)
        result = admin_reloaded.check_password(new_pwd)
        print(f"Checking new admin password: {result}")
        
        if result:
            print("✅ Admin password hashing works.")
        else:
            print("❌ Admin password hashing FAILED.")
            
    except Admin.DoesNotExist:
        print("Creating temporary admin...")
        admin = Admin(
            full_name="Test Admin",
            email=email,
            is_active=True,
            is_superuser=True
        )
        admin.set_password(new_pwd)
        admin_reloaded = Admin.objects.get(email=email)
        result = admin_reloaded.check_password(new_pwd)
        print(f"Checking new admin password: {result}")
        admin_reloaded.delete()
        if result:
            print("✅ Admin password hashing works (New).")
        else:
            print("❌ Admin password hashing FAILED (New).")

if __name__ == "__main__":
    print("--- Testing User (Bcrypt) ---")
    test_password_hash()
    print("\n--- Testing Admin (Django Hashers) ---")
    test_admin_password_hash()
