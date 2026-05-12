import os
import django
from mongoengine import connect
import datetime

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from site_config.models import PredictionPopupConfig

def seed_popup_config():
    print("Seeding Prediction Popup Configuration...")
    
    # Check if any config exists
    if PredictionPopupConfig.objects.count() == 0:
        config = PredictionPopupConfig(
            title="NEET 2026",
            title_highlight="Answer Key",
            description="Download the official NEET 2026 Answer Key and Question Paper solutions. Check your performance and calculate your expected score instantly.",
            button_text="Download Answer Key",
            button_link="https://pathfinder.edu.in/blog/neet-2026-answer-key",
            maybe_later_text="Maybe Later",
            bottom_banner_text="Live Prediction Portal is Now Open",
            icon_type="rocket",
            is_active=True,
            show_delay=1500
        )
        config.save()
        print("SUCCESS: Default Prediction Popup Configuration created successfully!")
    else:
        print("INFO: Prediction Popup Configuration already exists. Skipping seeding.")

if __name__ == "__main__":
    seed_popup_config()
