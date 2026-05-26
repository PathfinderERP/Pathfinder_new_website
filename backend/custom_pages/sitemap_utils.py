"""
Utilities for generating dynamic sitemaps based on CustomPage model
"""
from datetime import datetime
from django.urls import reverse
from .models import CustomPage


def get_sitemap_xml(domain="https://pathfinder.edu.in"):
    """
    Generate complete sitemap XML including:
    - Static pages (hardcoded)
    - Dynamic custom pages (only live ones)
    
    Args:
        domain: Your domain name
    
    Returns:
        XML string for sitemap.xml
    """
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    
    # Static pages
    static_pages = [
        {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
        {"loc": "/about-us", "priority": "0.8", "changefreq": "monthly"},
        {"loc": "/contact", "priority": "0.8", "changefreq": "monthly"},
        {"loc": "/blog", "priority": "0.9", "changefreq": "weekly"},
        {"loc": "/courses/foundation", "priority": "0.9", "changefreq": "monthly"},
        {"loc": "/courses/all-india", "priority": "0.9", "changefreq": "monthly"},
        {"loc": "/courses/boards", "priority": "0.9", "changefreq": "monthly"},
        {"loc": "/results/foundation", "priority": "0.7", "changefreq": "weekly"},
        {"loc": "/results/all-india", "priority": "0.7", "changefreq": "weekly"},
        {"loc": "/results/boards", "priority": "0.7", "changefreq": "weekly"},
        {"loc": "/centres", "priority": "0.8", "changefreq": "monthly"},
        {"loc": "/career", "priority": "0.6", "changefreq": "monthly"},
        {"loc": "/alumni", "priority": "0.7", "changefreq": "monthly"},
        {"loc": "/franchise", "priority": "0.6", "changefreq": "monthly"},
    ]
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    xml_lines.append("  <!-- Main Static Pages -->")
    for page in static_pages:
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{domain}{page['loc']}</loc>")
        xml_lines.append(f"    <lastmod>{today}</lastmod>")
        xml_lines.append(f"    <changefreq>{page.get('changefreq', 'monthly')}</changefreq>")
        xml_lines.append(f"    <priority>{page['priority']}</priority>")
        xml_lines.append("  </url>")
    
    # Dynamic custom pages (only live ones)
    xml_lines.append("  <!-- Dynamic Custom Pages -->")
    live_pages = CustomPage.objects(is_live=True).order_by('-created_at')
    
    for page in live_pages:
        xml_lines.append("  <url>")
        xml_lines.append(f"    <loc>{domain}/{page.slug}</loc>")
        xml_lines.append(f"    <lastmod>{page.updated_at.strftime('%Y-%m-%d') if hasattr(page, 'updated_at') else today}</lastmod>")
        xml_lines.append(f"    <changefreq>monthly</changefreq>")
        xml_lines.append(f"    <priority>0.7</priority>")
        xml_lines.append("  </url>")
    
    xml_lines.append("</urlset>")
    
    return "\n".join(xml_lines)


def get_custom_pages_only_xml(domain="https://pathfinder.edu.in"):
    """
    Generate sitemap with only custom pages (live ones only)
    Useful if you want a separate sitemap for custom content
    
    Returns:
        XML string
    """
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    
    today = datetime.now().strftime("%Y-%m-%d")
    live_pages = CustomPage.objects(is_live=True).order_by('-updated_at')
    
    if live_pages.count() == 0:
        xml_lines.append("  <!-- No live custom pages -->")
    else:
        for page in live_pages:
            xml_lines.append("  <url>")
            xml_lines.append(f"    <loc>{domain}/{page.slug}</loc>")
            xml_lines.append(f"    <lastmod>{page.updated_at.strftime('%Y-%m-%d') if hasattr(page, 'updated_at') else today}</lastmod>")
            xml_lines.append(f"    <changefreq>monthly</changefreq>")
            xml_lines.append(f"    <priority>0.7</priority>")
            xml_lines.append("  </url>")
    
    xml_lines.append("</urlset>")
    
    return "\n".join(xml_lines)
