# centres/services/image_service.py
import base64
from io import BytesIO
from PIL import Image
import uuid
import os

class ImageProcessor:
    @staticmethod
    def process_uploaded_image(image_file, max_size=(1200, 900), quality=85, max_size_mb=12):
        """
        Process uploaded image for MongoDB storage with 12MB limit
        """
        try:
            # Validate file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if image_file.content_type not in allowed_types:
                raise ValueError(f"Unsupported image type: {image_file.content_type}")
            
            # Check initial file size
            max_bytes = max_size_mb * 1024 * 1024
            if hasattr(image_file, 'size') and image_file.size > max_bytes:
                raise ValueError(f"Image size {image_file.size/(1024*1024):.1f}MB exceeds maximum {max_size_mb}MB limit")
            
            # Open and process image
            img = Image.open(image_file)
            
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P', 'LA'):
                img = img.convert('RGB')
            
            # Resize if too large
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Determine output format
            if image_file.content_type in ['image/png', 'image/gif']:
                format_type = 'PNG'
                content_type = 'image/png'
            else:
                format_type = 'JPEG'
                content_type = 'image/jpeg'
            
            # Save to buffer
            buffer = BytesIO()
            if format_type == 'JPEG':
                img.save(buffer, format=format_type, quality=quality, optimize=True)
            else:
                img.save(buffer, format=format_type, optimize=True)
            
            buffer.seek(0)
            image_data = buffer.getvalue()
            
            # Validate final size
            if len(image_data) > max_bytes:
                # Try with lower quality
                if format_type == 'JPEG' and quality > 50:
                    buffer = BytesIO()
                    img.save(buffer, format=format_type, quality=50, optimize=True)
                    buffer.seek(0)
                    image_data = buffer.getvalue()
                    
                if len(image_data) > max_bytes:
                    raise ValueError(f"Processed image size {len(image_data)/(1024*1024):.1f}MB exceeds maximum {max_size_mb}MB limit")
            
            return {
                'data': image_data,
                'content_type': content_type,
                'filename': f"{uuid.uuid4()}.{format_type.lower()}",
                'size': len(image_data),
                'dimensions': img.size,
                'original_size': getattr(image_file, 'size', 0)
            }
            
        except Exception as e:
            raise ValueError(f"Image processing failed: {str(e)}")