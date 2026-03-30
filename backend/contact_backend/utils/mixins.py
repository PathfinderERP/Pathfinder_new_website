import base64
import uuid
from rest_framework import serializers
from contact_backend.utils.r2_storage import upload_to_r2

class Base64R2FileMixin:
    """Mixin for handling base64 file processing and Cloudflare R2 upload in serializers"""
    
    # Override these in subclasses
    file_input_fields = []  # List of field names that can contain base64 files (e.g., ['image_file', 'resume_file'])
    file_url_field = 'image_url' # Field in model to store the R2 URL
    file_name_prefix = 'file'
    
    def process_base64_file(self, data_uri):
        """Process base64 file data, upload to R2, and return dict with URL field"""
        if data_uri and 'base64,' in str(data_uri):
            try:
                print(f"[PROCESS] Processing base64 file prefix: {str(data_uri)[:30]}...")
                header, encoded = data_uri.split('base64,', 1)
                file_data = base64.b64decode(encoded)
                content_type = header.replace('data:', '').replace(';', '')
                print(f"[INFO] Content Type: {content_type}, Data Length: {len(file_data)} bytes")
                
                # Determine extension
                ext = '.bin'
                if 'image' in content_type:
                    if 'png' in content_type: ext = '.png'
                    elif 'jpeg' in content_type or 'jpg' in content_type: ext = '.jpg'
                    elif 'gif' in content_type: ext = '.gif'
                    elif 'webp' in content_type: ext = '.webp'
                elif 'pdf' in content_type:
                    ext = '.pdf'
                elif 'msword' in content_type or 'wordprocessingml' in content_type:
                    ext = '.docx'
                
                filename = f"{self.file_name_prefix}_{uuid.uuid4().hex[:8]}{ext}"
                print(f"[UPLOAD] Uploading to R2: {filename}")
                
                # Upload to R2
                r2_url = upload_to_r2(file_data, filename, content_type, folder=self.file_name_prefix)
                print(f"[SUCCESS] R2 URL: {r2_url}")
                
                return {
                    self.file_url_field: r2_url
                }
            except Exception as e:
                print(f"[ERROR] Error processing {self.file_name_prefix} through Base64R2FileMixin: {e}")
                # Don't silence it, raise it to the user
                raise e
        return None
    
    def extract_file_from_data(self, data):
        """Extract and process base64 file from data dict"""
        if not isinstance(data, dict):
            return data
            
        for field in self.file_input_fields:
            if field in data and data[field] and 'base64,' in str(data.get(field, '')):
                print(f"[SEARCH] Found field '{field}' in data for extraction.")
                data_uri = data.pop(field)
                processed = self.process_base64_file(data_uri)
                if processed:
                    data.update(processed)
                break  # Only process first matching field
        return data
