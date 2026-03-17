import os
import django
from mongoengine import get_db, connect, disconnect
from bson import ObjectId

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

def check_pathfinder_db():
    db = get_db()
    client = db.client
    
    target_db = client['pathfinder']
    needle = ObjectId('691dbb196d43fd00fef12f13')
    
    print(f"🔍 Checking database 'pathfinder' for {needle}...")
    for coll_name in target_db.list_collection_names():
        coll = target_db[coll_name]
        # Search for the ID in ANY field
        res = list(coll.find({"$or": [
            {"created_by": needle},
            {"created_by.$id": needle},
            {"_id": needle}
        ]}))
        if res:
            print(f"  ✅ FOUND {len(res)} matches in pathfinder.{coll_name}")

if __name__ == "__main__":
    check_pathfinder_db()
