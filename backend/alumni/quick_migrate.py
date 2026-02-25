"""
Quick migration script - Run with: python manage.py shell < alumni/quick_migrate.py
"""
from pymongo import MongoClient
import os

# Get MongoDB connection
mongo_uri = os.getenv('MONGO_URI')
db_name = os.getenv('MONGO_DB_NAME', 'test01')

client = MongoClient(mongo_uri)
db = client[db_name]
collection = db['alumni']

print("🔍 Checking for documents with old 'images' field...")

# Count documents with old structure
count = collection.count_documents({'images': {'$exists': True}})
print(f"📊 Found {count} documents to migrate")

if count > 0:
    # Update all documents: remove 'images' field and ensure 'image_urls' exists
    result = collection.update_many(
        {'images': {'$exists': True}},
        [
            {
                '$unset': 'images'
            },
            {
                '$set': {
                    'image_urls': {
                        '$ifNull': ['$image_urls', []]
                    }
                }
            }
        ]
    )
    print(f"✅ Migrated {result.modified_count} documents")
    print("ℹ️  Old embedded images removed. Please re-upload images through admin panel.")
else:
    print("✅ No migration needed")

print("\n✨ Migration complete!")
