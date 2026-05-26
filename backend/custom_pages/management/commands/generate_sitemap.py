"""
Management command to generate a static sitemap.xml file.

Usage:
    python manage.py generate_sitemap
    python manage.py generate_sitemap --domain https://example.com
    python manage.py generate_sitemap --output /path/to/custom/sitemap.xml
    python manage.py generate_sitemap --custom-only  (for custom pages only)
"""

from django.core.management.base import BaseCommand
from django.conf import settings
import os
from pathlib import Path
from custom_pages.sitemap_utils import get_sitemap_xml, get_custom_pages_only_xml


class Command(BaseCommand):
    help = 'Generate sitemap.xml for custom pages and static pages'

    def add_arguments(self, parser):
        parser.add_argument(
            '--domain',
            type=str,
            default='https://pathfinder.edu.in',
            help='Domain URL for sitemap (default: https://pathfinder.edu.in)',
        )
        
        parser.add_argument(
            '--output',
            type=str,
            default=None,
            help='Output file path (default: frontend/public/sitemap.xml)',
        )
        
        parser.add_argument(
            '--custom-only',
            action='store_true',
            help='Generate sitemap with only custom pages (excludes static pages)',
        )

    def handle(self, *args, **options):
        domain = options['domain']
        custom_only = options['custom_only']
        
        # Determine output file path
        if options['output']:
            output_path = options['output']
        else:
            # Default to frontend/public/sitemap.xml
            base_dir = Path(settings.BASE_DIR).parent  # Go up to project root
            output_path = os.path.join(base_dir, 'frontend', 'public', 'sitemap.xml')
        
        try:
            # Generate sitemap content
            if custom_only:
                sitemap_content = get_custom_pages_only_xml(domain=domain)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Generating sitemap with custom pages only..."
                    )
                )
            else:
                sitemap_content = get_sitemap_xml(domain=domain)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Generating complete sitemap with static and custom pages..."
                    )
                )
            
            # Ensure output directory exists
            output_dir = os.path.dirname(output_path)
            os.makedirs(output_dir, exist_ok=True)
            
            # Write to file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(sitemap_content)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ Sitemap generated successfully at: {output_path}"
                )
            )
            self.stdout.write(
                self.style.WARNING(
                    f"Domain: {domain}"
                )
            )
            
            # Count of pages
            from custom_pages.models import CustomPage
            live_count = CustomPage.objects(is_live=True).count()
            total_count = CustomPage.objects.count()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"Custom pages in sitemap: {live_count} (Live)"
                )
            )
            if live_count < total_count:
                self.stdout.write(
                    self.style.WARNING(
                        f"Total custom pages: {total_count} ({total_count - live_count} inactive)"
                    )
                )
        
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f"✗ Error generating sitemap: {str(e)}"
                )
            )
            raise
