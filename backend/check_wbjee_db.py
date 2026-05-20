import os
import sys
from dotenv import load_dotenv
from mongoengine import connect
from urllib.parse import quote_plus

load_dotenv()

# Direct MongoDB test without Django setup
username = os.getenv("MONGO_USERNAME")
password = os.getenv("MONGO_PASSWORD")
cluster = os.getenv("MONGO_CLUSTER")
db_name = os.getenv("MONGO_DB_NAME")

encoded_username = quote_plus(username)
encoded_password = quote_plus(password)

MONGO_URI = f"mongodb+srv://{encoded_username}:{encoded_password}@{cluster}.mongodb.net/{db_name}?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true"

print("🔗 Connecting to MongoDB...")

try:
    connect(db=db_name, host=MONGO_URI, alias="default")
    print("✅ MongoDB connected successfully!")
    
    from wbjee.models import WBJEEHub
    
    count = WBJEEHub.objects.count()
    print(f"📊 Total WBJEEHub configurations: {count}")
    
    for idx, doc in enumerate(WBJEEHub.objects):
        print(f"\nConfiguration #{idx+1}:")
        print(f"  ID: {doc.id}")
        print(f"  Title: {doc.title}")
        print(f"  Title Highlight: {doc.title_highlight}")
        print(f"  Meta Title: '{doc.meta_title}'")
        print(f"  Meta Description: '{doc.meta_description}'")
        print(f"  Is Active: {doc.is_active}")
        print(f"  Custom Meta Tags: {doc.custom_meta_tags}")
        
except Exception as e:
    print(f"❌ Error: {e}")
