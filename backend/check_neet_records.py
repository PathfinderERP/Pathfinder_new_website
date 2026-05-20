import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from neet.models import NEETHub

print("Fetching NEETHub records...")
count = NEETHub.objects.count()
print(f"Total NEETHub records: {count}")

for idx, doc in enumerate(NEETHub.objects):
    print(f"\nRecord #{idx+1}:")
    print(f"  ID: {doc.id}")
    print(f"  Title: {doc.title}")
    print(f"  Title Highlight: {doc.title_highlight}")
    print(f"  Meta Title: '{doc.meta_title}'")
    print(f"  Meta Description: '{doc.meta_description}'")
    print(f"  Is Active: {doc.is_active}")
    print(f"  Custom Meta Tags: {doc.custom_meta_tags}")
    print(f"  Resources: {doc.resources}")
    print(f"  Marks Division: {doc.marks_division}")
    print(f"  Videos: {doc.videos}")
