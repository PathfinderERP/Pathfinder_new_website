# test_mongo_simple.py
import os
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

print("🔗 Testing MongoDB connection...")

try:
    connect(db=db_name, host=MONGO_URI, alias="default")
    print("✅ MongoDB connected successfully!")
    
    # Test with direct MongoEngine (no Django)
    from mongoengine import Document, StringField, DateTimeField
    from datetime import datetime
    
    class TestContact(Document):
        first_name = StringField(required=True, max_length=100)
        last_name = StringField(required=True, max_length=100)
        email = StringField(required=True)
        created_at = DateTimeField(default=datetime.utcnow)
        
        meta = {'collection': 'test_contacts'}
    
    # Create test document
    test_doc = TestContact(
        first_name="MongoEngine",
        last_name="Test", 
        email="mongoengine@test.com"
    )
    test_doc.save()
    print("✅ Document saved via MongoEngine!")
    
    # Count documents
    count = TestContact.objects.count()
    print(f"📊 Test documents: {count}")
    
    # List documents
    print("📋 All test documents:")
    for doc in TestContact.objects:
        print(f"  - {doc.first_name} {doc.last_name} | {doc.email}")
        
except Exception as e:
    print(f"❌ Error: {e}")