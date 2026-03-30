import boto3
import os
from botocore.config import Config
from datetime import datetime
import uuid

def get_r2_client():
    """Initialize and return a Cloudflare R2 client using boto3"""
    r2_endpoint_url = os.getenv('R2_ENDPOINT_URL')
    r2_access_key_id = os.getenv('R2_ACCESS_KEY_ID')
    r2_secret_access_key = os.getenv('R2_SECRET_ACCESS_KEY')
    
    if not all([r2_endpoint_url, r2_access_key_id, r2_secret_access_key]):
        raise ValueError("Cloudflare R2 credentials are not fully configured in environment variables.")
        
    return boto3.client(
        's3',
        endpoint_url=r2_endpoint_url,
        aws_access_key_id=r2_access_key_id,
        aws_secret_access_key=r2_secret_access_key,
        config=Config(signature_version='s3v4'),
        region_name='auto'  # R2 requires region to be 'auto' or 'us-east-1' depending on the client
    )

def upload_to_r2(file_data, file_name, content_type, folder='uploads'):
    """
    Upload a file to Cloudflare R2 and return its public URL
    
    :param file_data: The binary data of the file
    :param file_name: Original file name
    :param content_type: MIME type of the file
    :param folder: subfolder in the bucket
    :return: Public URL of the uploaded file
    """
    bucket_name = os.getenv('R2_BUCKET_NAME')
    public_domain = os.getenv('R2_PUBLIC_DOMAIN')
    
    if not bucket_name:
        raise ValueError("R2_BUCKET_NAME is not configured.")
        
    # Generate a unique filename to avoid collisions
    ext = os.path.splitext(file_name)[1]
    unique_filename = f"{folder}/{datetime.now().strftime('%Y/%m/%d')}/{uuid.uuid4().hex}{ext}"
    
    client = get_r2_client()
    
    try:
        client.put_object(
            Bucket=bucket_name,
            Key=unique_filename,
            Body=file_data,
            ContentType=content_type
        )
        
        print(f"[SUCCESS] Successfully uploaded to R2: bucket={bucket_name}, key={unique_filename}")
        
        # Return the public URL
        # If public domain is configured, use it. Otherwise, return the key or a constructed URL.
        if public_domain:
            # Ensure no double slashes
            public_domain = public_domain.rstrip('/')
            return f"{public_domain}/{unique_filename}"
        else:
            # Fallback to endpoint-based URL (might not be public depending on bucket settings)
            endpoint = os.getenv('R2_ENDPOINT_URL').rstrip('/')
            return f"{endpoint}/{bucket_name}/{unique_filename}"
            
    except Exception as e:
        print(f"Error uploading to R2: {str(e)}")
        raise e
