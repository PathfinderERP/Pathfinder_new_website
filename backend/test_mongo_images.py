# test_final_mongo_images.py
import requests
import os
from PIL import Image
import io

AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6IjY5MWRiYjE5NmQ0M2ZkMDBmZWYxMmYxMyIsImVtYWlsIjoiYXRhbnVAcGF0aGZpbmRlci5lZHUuaW4iLCJpc19zdXBlcnVzZXIiOnRydWUsInBlcm1pc3Npb25zIjpbInZpZXdfZGFzaGJvYXJkIiwidmlld19jb3Vyc2VzIiwidmlld191c2VycyJdLCJleHAiOjE3NjQ0MDA5MDcsImlhdCI6MTc2Mzc5NjEwNywidXNlcl90eXBlIjoiYWRtaW4ifQ.3XIdUIEAjNGA4QIkQ3YHD54ZrTfCVwN5TMmQec-WgiI"

headers = {
    'Authorization': f'Bearer {AUTH_TOKEN}',
}

def test_centres_list():
    """Test if centres endpoint works now"""
    print("🧪 TESTING CENTRES LIST")
    print("=" * 40)
    
    try:
        response = requests.get('http://localhost:8000/api/centres/', headers=headers, timeout=10)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            centres = response.json()
            print(f"✅ SUCCESS! Found {len(centres)} centres")
            
            for centre in centres[:2]:
                print(f"\n🏢 {centre.get('centre')}")
                print(f"   📍 {centre.get('district')}, {centre.get('state')}")
                print(f"   🖼️  Logo URL: {'Yes' if centre.get('logo_url') else 'No'}")
                print(f"   👥 Toppers: {len(centre.get('toppers', []))}")
                
            return centres[0]['id'] if centres else None
        else:
            print(f"❌ Failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_image_upload(centre_id):
    """Test MongoDB image upload"""
    print(f"\n🧪 TESTING IMAGE UPLOAD FOR CENTRE: {centre_id}")
    print("=" * 50)
    
    # Create test image
    image = Image.new('RGB', (400, 300), color=(70, 130, 180))
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG', quality=85)
    img_byte_arr.seek(0)
    
    # Test logo upload
    files = {'logo': ('test_logo.jpg', img_byte_arr, 'image/jpeg')}
    
    response = requests.post(
        f'http://localhost:8000/api/centres/{centre_id}/upload-logo/',
        headers=headers,
        files=files
    )
    
    print(f"📤 Logo Upload Status: {response.status_code}")
    if response.status_code == 201:
        result = response.json()
        print("✅ Logo Upload Successful!")
        print(f"   Message: {result.get('message')}")
        print(f"   Size: {result.get('size_mb')}MB")
        print(f"   Logo URL Type: {'data URL' if result.get('logo_url', '').startswith('data:image') else 'other'}")
    else:
        print(f"❌ Logo upload failed: {response.text}")
    
    # Test topper image upload
    img_byte_arr.seek(0)
    files = {'image': ('topper.jpg', img_byte_arr, 'image/jpeg')}
    data = {'name': 'Test Student'}
    
    response = requests.post(
        f'http://localhost:8000/api/centres/{centre_id}/upload-topper-image/',
        headers=headers,
        files=files,
        data=data
    )
    
    print(f"\n📤 Topper Upload Status: {response.status_code}")
    if response.status_code == 201:
        result = response.json()
        print("✅ Topper Upload Successful!")
        print(f"   Name: {result.get('topper_name')}")
        print(f"   Size: {result.get('size_mb')}MB")
    else:
        print(f"❌ Topper upload failed: {response.text}")

if __name__ == "__main__":
    # First test if centres work
    centre_id = test_centres_list()
    
    # Then test image upload if we have a centre
    if centre_id:
        test_image_upload(centre_id)
    else:
        print("\n❌ Cannot test image upload without a valid centre")