# Dynamic Sitemap System for Custom Pages

## Overview

This system automatically manages your `sitemap.xml` file based on the custom pages you create in the admin panel. When you create or modify pages, the sitemap is dynamically updated to include only **live** pages.

## How It Works

### 1. **Dynamic Endpoints** (Real-time Generation)

The system provides two API endpoints that generate sitemaps on-demand:

#### Endpoint 1: Complete Sitemap (Static + Custom Pages)
```
GET /api/custom-pages/pages/sitemap/
```
Returns an XML sitemap with:
- All static pages (About Us, Contact, Blog, Courses, etc.)
- All live custom pages (where `is_live=True`)

#### Endpoint 2: Custom Pages Only
```
GET /api/custom-pages/pages/sitemap-custom-only/
```
Returns an XML sitemap with only custom pages that are live.

### 2. **Static File Generation** (Via Management Command)

You can also generate a static `sitemap.xml` file that's served from `frontend/public/sitemap.xml`:

```bash
# Generate complete sitemap
python manage.py generate_sitemap

# Generate with custom domain
python manage.py generate_sitemap --domain https://yourdomain.com

# Generate custom pages only
python manage.py generate_sitemap --custom-only

# Generate to custom location
python manage.py generate_sitemap --output /path/to/sitemap.xml
```

### 3. **Auto-Regeneration** (Recommended)

The system automatically regenerates the static sitemap whenever you:
- ✅ Create a new custom page
- ✅ Update an existing page (title, slug, status, etc.)
- ✅ Deactivate a page (set `is_live=False`)
- ✅ Activate a page (set `is_live=True`)
- ✅ Delete a page

This is handled by Django signals in `custom_pages/signals.py`.

## Page Status Control

### Making a Page Visible in Sitemap
1. Create/Edit the page in Admin
2. **Set `is_live = True`**
3. The sitemap automatically updates to include it
4. Google bots will discover it within 24 hours

### Removing a Page from Sitemap
1. Edit the page
2. **Set `is_live = False`** (or delete the page)
3. The sitemap automatically updates
4. The entry is excluded/removed automatically
5. Google will eventually remove it from search results

## Integration With Google Search Console

### Step 1: Update robots.txt
Your `frontend/public/robots.txt` already points to the sitemap:
```txt
Sitemap: https://pathfinder.edu.in/sitemap.xml
```

### Step 2: Submit to Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (pathfinder.edu.in)
3. Go to **Sitemaps** section
4. Submit: `https://pathfinder.edu.in/sitemap.xml`

### Step 3: Verify Submission
Google will automatically crawl and index the sitemap. You can check:
- How many URLs Google found
- Any errors or warnings
- When the sitemap was last processed

## Configuration

### Current Setup (Production-Ready)
- **Domain**: `https://pathfinder.edu.in` (change in manage.py commands if needed)
- **Sitemap Location**: `frontend/public/sitemap.xml`
- **Auto-generation**: Enabled (happens on page create/update/delete)
- **Update Frequency**: Every time you save/delete a page

### Customization

#### Change Domain in Management Command
Edit `backend/custom_pages/management/commands/generate_sitemap.py`:
```python
default='https://your-domain.com',
```

#### Adjust Update Frequency
Edit `backend/custom_pages/sitemap_utils.py`, change the `changefreq` values:
```python
{"loc": "/", "priority": "1.0", "changefreq": "weekly"},
# Options: always, hourly, daily, weekly, monthly, yearly, never
```

#### Disable Auto-Regeneration
Comment out the signal handlers in `backend/custom_pages/apps.py`:
```python
# import custom_pages.signals  # Disable auto-regeneration
```

## Example: Creating a New Custom Page

1. **In Admin Panel**:
   - Title: "NEET Success Stories"
   - Slug: `neet-success-stories`
   - Set `is_live = True`
   - Save

2. **Automatic Actions**:
   - ✅ Sitemap updates automatically
   - ✅ Entry added: `<loc>https://pathfinder.edu.in/neet-success-stories</loc>`
   - ✅ File regenerated: `frontend/public/sitemap.xml`

3. **Later, if you deactivate**:
   - Edit page → `is_live = False`
   - ✅ Sitemap updates automatically
   - ✅ Entry removed from sitemap
   - ✅ Google will eventually de-index it

## Monitoring & Debugging

### Check Sitemap Generation Logs
The system logs all auto-regeneration events. Check Django logs:
```python
# In settings.py, logs go to:
logger.info("Sitemap auto-regenerated: {path}")
logger.error("Error regenerating sitemap: {error}")
```

### Manual Trigger
If you need to regenerate manually:
```bash
python manage.py generate_sitemap
```

### Verify Sitemap in Browser
Visit: `https://pathfinder.edu.in/api/custom-pages/pages/sitemap/`

You should see valid XML with all your pages.

## SEO Best Practices

1. ✅ **Keep it Updated**: The auto-regeneration ensures this
2. ✅ **Valid XML**: System generates valid sitemap.xml format
3. ✅ **Include Lastmod**: Automatically set with `updated_at` timestamp
4. ✅ **Set Priority**: Custom pages default to 0.7 priority
5. ✅ **Use robots.txt**: Already configured to point to sitemap

## Troubleshooting

### Issue: Custom page not appearing in sitemap
**Solution**: Check if `is_live = True` for that page

### Issue: Sitemap not updating
**Solution**: 
- Run: `python manage.py generate_sitemap`
- Check if signals are enabled in `apps.py`
- Check file permissions in `frontend/public/`

### Issue: Google not indexing new pages
**Solution**:
1. Submit sitemap to Google Search Console (see above)
2. Wait 24-48 hours for Google to crawl
3. Use "Inspect URL" tool in Search Console to debug

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/custom-pages/pages/sitemap/` | GET | Complete sitemap (static + custom) |
| `/api/custom-pages/pages/sitemap-custom-only/` | GET | Custom pages only |
| `/api/custom-pages/pages/` | GET | List all pages (admin only) |
| `/api/custom-pages/pages/by-slug/?slug=...` | GET | Fetch page by slug |

## Files Created/Modified

### New Files
- `backend/custom_pages/sitemap_utils.py` - Sitemap generation logic
- `backend/custom_pages/signals.py` - Auto-regeneration signals
- `backend/custom_pages/apps.py` - App configuration with signal registration
- `backend/custom_pages/management/commands/generate_sitemap.py` - Management command
- `backend/custom_pages/__init__.py` - Package init

### Modified Files
- `backend/custom_pages/views.py` - Added sitemap endpoints
- `frontend/public/robots.txt` - Already configured ✅

## Next Steps

1. ✅ Review the setup above
2. Run: `python manage.py generate_sitemap` to create initial sitemap
3. Verify: Visit `https://pathfinder.edu.in/sitemap.xml` in your browser
4. Submit to Google Search Console
5. Create a test custom page and verify it appears in sitemap within seconds

---

**Questions?** Check the implementation in:
- Sitemap generation: `backend/custom_pages/sitemap_utils.py`
- Auto-updates: `backend/custom_pages/signals.py`
- API endpoints: `backend/custom_pages/views.py`
