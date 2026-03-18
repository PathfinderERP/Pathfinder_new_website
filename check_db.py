from mongoengine import connect
import os
from centres.models import Centre

# Connect to MongoDB
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/pathfinder')
connect(host=mongo_uri)

print("Checking centre fields...")
centres = Centre.objects()
for c in centres:
    data = c.to_mongo().to_dict()
    print(f"Centre: {c.centre}")
    print(f"  Fields: {list(data.keys())}")
    if 'centre_image' in data:
        print(f"  centre_image: {data['centre_image']}")
    if 'logo' in data:
        print(f"  logo: {data['logo']}")
    if 'logo_data' in data:
        print(f"  logo_data present: {bool(data['logo_data'])}")
    print("-" * 20)
