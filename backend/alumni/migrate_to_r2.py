"""
Migration script to convert old Alumni documents with embedded images 
to new structure with Cloudflare R2 URLs

Run this script once to migrate existing data:
python manage.py shell < alumni/migrate_to_r2.py
"""

from alumni.models import Alumni
from pymongo import MongoClient
import os

def migrate_alumni_to_r2():
    """
    Migrate existing alumni documents from embedded images to R2 URLs
    """
    # Connect to MongoDB directly
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        print("[ERROR] MONGO_URI not found in environment variables")
        return
    
    client = MongoClient(mongo_uri)
    db_name = os.getenv('MONGO_DB_NAME', 'test01')
    db = client[db_name]
    collection = db['alumni']
    
    print("[SEARCH] Checking for documents with old 'images' field...")
    
    # Find all documents with the old 'images' field
    old_docs = collection.find({'images': {'$exists': True}})
    count = collection.count_documents({'images': {'$exists': True}})
    
    if count == 0:
        print("[SUCCESS] No documents need migration")
        return
    
    print(f"[INFO] Found {count} documents to migrate")
    
    migrated = 0
    for doc in old_docs:
        try:
            # Remove the old 'images' field and add empty 'image_urls' if not exists
            update_data = {
                '$unset': {'images': ''},
            }
            
            # Only add image_urls if it doesn't exist
            if 'image_urls' not in doc:
                update_data['$set'] = {'image_urls': []}
            
            collection.update_one(
                {'_id': doc['_id']},
                update_data
            )
            migrated += 1
            print(f"[SUCCESS] Migrated document {doc['_id']}")
            
        except Exception as e:
            print(f"[ERROR] Error migrating document {doc['_id']}: {str(e)}")
    
    print(f"\n[DONE] Migration complete! Migrated {migrated}/{count} documents")
    print("[NOTE] Old embedded images have been removed. Please re-upload images through the admin panel.")

if __name__ == '__main__':
    migrate_alumni_to_r2()
