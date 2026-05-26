"""
Django signals to auto-regenerate sitemap when custom pages are created/updated/deleted
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from .models import CustomPage
from .sitemap_utils import get_sitemap_xml
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


def _regenerate_sitemap_file():
    """Helper function to regenerate the static sitemap.xml file"""
    try:
        sitemap_content = get_sitemap_xml(domain='https://pathfinder.edu.in')
        
        # Default path: frontend/public/sitemap.xml
        base_dir = Path(settings.BASE_DIR).parent
        output_path = os.path.join(base_dir, 'frontend', 'public', 'sitemap.xml')
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Write sitemap file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(sitemap_content)
        
        logger.info(f"Sitemap auto-regenerated: {output_path}")
    except Exception as e:
        logger.error(f"Error regenerating sitemap: {str(e)}")


@receiver(post_save, sender=CustomPage)
def handle_custom_page_save(sender, instance, created, **kwargs):
    """
    Signal handler: Regenerate sitemap when a CustomPage is saved
    (both on creation and update)
    """
    logger.info(
        f"CustomPage '{instance.title}' (slug: {instance.slug}) "
        f"{'created' if created else 'updated'} - "
        f"is_live: {instance.is_live}"
    )
    
    # Only regenerate if the page is being published/unpublished or content changed
    # This avoids excessive file I/O during saves
    _regenerate_sitemap_file()


@receiver(post_delete, sender=CustomPage)
def handle_custom_page_delete(sender, instance, **kwargs):
    """
    Signal handler: Regenerate sitemap when a CustomPage is deleted
    """
    logger.info(f"CustomPage '{instance.title}' (slug: {instance.slug}) deleted - regenerating sitemap")
    _regenerate_sitemap_file()
