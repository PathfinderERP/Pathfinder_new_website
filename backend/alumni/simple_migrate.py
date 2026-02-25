"""
Quick migration script for Alumni collection
Run from backend directory: python -m alumni.simple_migrate
"""
import django
import os
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from pymongo import MongoClient
from django.conf import settings

# Get MongoDB connection from Django settings
mongo_uri = settings.MONGO_URI
db_name = os.getenv('MONGO_DB_NAME', 'test01')  # Get from env, not Django settings

print(f"🔗 Connecting to MongoDB: {db_name}")

client = MongoClient(mongo_uri)
db = client[db_name]
collection = db['alumni']

print("🔍 Checking for documents with old 'images' field...")

# Count documents with old structure
count = collection.count_documents({'images': {'$exists': True}})
print(f"📊 Found {count} documents with old structure")

if count > 0:
    print("🔄 Migrating documents...")
    
    # Remove 'images' field from all documents
    result = collection.update_many(
        {'images': {'$exists': True}},
        {
            '$unset': {'images': ''}
        }
    )
    print(f"✅ Removed 'images' field from {result.modified_count} documents")
    
    # Ensure all documents have 'image_urls' field
    result2 = collection.update_many(
        {'image_urls': {'$exists': False}},
        {
            '$set': {'image_urls': []}
        }
    )
    print(f"✅ Added 'image_urls' field to {result2.modified_count} documents")
    
    print("\n🎉 Migration complete!")
    print("ℹ️  Old embedded images have been removed.")
    print("ℹ️  Please re-upload images through the admin panel.")
else:
    print("✅ No migration needed - all documents are up to date!")

print("\n✨ Done!")
