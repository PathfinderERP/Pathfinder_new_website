import os
from dotenv import load_dotenv
from mongoengine import connect, disconnect
from urllib.parse import quote_plus
from pathlib import Path
import certifi
import datetime
from datetime import timedelta  # Add this import
import socket

# Load environment variables FIRST
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = os.path.join(BASE_DIR, '.env')
load_dotenv(env_path, override=True)

print(f"📁 Loading .env from: {env_path}")
print(f"🔍 Found .env: {os.path.exists(env_path)}")
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        print(f"📄 .env content preview: {f.readline().strip()}")

# SECRET_KEY with proper fallback for production
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-development-key-change-in-production-123456')

# Debug settings for production - ALWAYS False on Render
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Make sure these directories exist
os.makedirs(os.path.join(MEDIA_ROOT, 'uploads'), exist_ok=True)

# Allowed hosts for production - IMPROVED
RENDER_EXTERNAL_HOSTNAME = os.getenv('RENDER_EXTERNAL_HOSTNAME')
ALLOWED_HOSTS = []

if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Add from environment variable - CRITICAL FIX
allowed_hosts_from_env = os.getenv('ALLOWED_HOSTS', '')
if allowed_hosts_from_env:
    additional_hosts = [host.strip() for host in allowed_hosts_from_env.split(',')]
    ALLOWED_HOSTS.extend(additional_hosts)

# Add development hosts only in debug mode
if DEBUG:
    ALLOWED_HOSTS.extend(['localhost', '127.0.0.1', '0.0.0.0'])

# Remove duplicates
ALLOWED_HOSTS = list(set(ALLOWED_HOSTS))

print(f"🔧 DEBUG mode: {DEBUG}")
print(f"🌐 Allowed Hosts: {ALLOWED_HOSTS}")

# JWT Settings - IMPROVED
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)  # Fallback to Django secret
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DELTA = datetime.timedelta(days=7)

# MongoDB Connection - FIXED: Use MONGO_URI (not MONGO_URI)
username = os.getenv("MONGO_USERNAME")
password = os.getenv("MONGO_PASSWORD")
cluster = os.getenv("MONGO_CLUSTER")
db_name = os.getenv("MONGO_DB_NAME", "test01")  # Default database name
mongo_uri = os.getenv("MONGO_URI")  # FIXED: Back to MONGO_URI

mongo_connected = False

if mongo_uri:
    print("🔗 Using MONGO_URI from environment")
    try:
        disconnect(alias="default")
        connect(
            db=db_name, 
            host=mongo_uri, 
            alias="default",
            tlsCAFile=certifi.where()
        )
        mongo_connected = True
        print("✅ Successfully connected to MongoDB using MONGO_URI")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

elif all([username, password, cluster, db_name]):
    encoded_username = quote_plus(username)
    encoded_password = quote_plus(password)
    MONGO_URI = f"mongodb+srv://{encoded_username}:{encoded_password}@{cluster}.mongodb.net/{db_name}?retryWrites=true&w=majority"
    
    print(f"🔗 Connecting to MongoDB Atlas: {db_name}")
    try:
        disconnect(alias="default")
        connect(
            db=db_name, 
            host=MONGO_URI, 
            alias="default",
            tlsCAFile=certifi.where()
        )
        mongo_connected = True
        print(f"✅ Successfully connected to MongoDB Atlas: {db_name}")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

else:
    print("⚠️ MongoDB credentials missing - using SQLite only")

# Django SQLite database (for Django's built-in tables)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ==================== ADD ADMIN SYSTEM CONFIGURATIONS ====================

# Django Apps - UPDATED
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_mongoengine',  # Add this
    'corsheaders',
    'contact_api',
    'users',
    'courses',
    'admin_auth',
    'centres',
    'job_post',
    'alumni',
    'student_corner',
    'blog',
    'landing_registrations',  # New app for landing page registrations
]


REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'admin_auth.authentication.AdminJWTAuthentication',  # Admin auth first
        'users.authentication.JWTAuthentication',  # Regular user auth second
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ==================== END ADMIN SYSTEM CONFIGURATIONS ====================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Should be first
    'admin_auth.middleware.DebugAuthenticationMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'contact_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# CORRECT WSGI APPLICATION - WITH DOT NOT COLON ✅
WSGI_APPLICATION = 'contact_backend.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'  # Store all times in UTC, frontend handles IST display
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings - IMPROVED FOR PRODUCTION - CRITICAL FIXES
# Find local IP address dynamically
try:
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
except:
    local_ip = "127.0.0.1"

# CORS settings - IMPROVED FOR PRODUCTION - CRITICAL FIXES
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://3-pathfinder-new.vercel.app",  # Your production frontend
    f"http://{local_ip}:3000", # Local Mobile Access dynamically
]

ALLOWED_HOSTS.extend([local_ip])

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# ADD THIS CODE TO READ FROM ENVIRONMENT VARIABLE - CRITICAL FIX
cors_origins_from_env = os.getenv('CORS_ALLOWED_ORIGINS', '')
if cors_origins_from_env:
    additional_origins = [origin.strip() for origin in cors_origins_from_env.split(',')]
    CORS_ALLOWED_ORIGINS.extend(additional_origins)

# Remove duplicates
CORS_ALLOWED_ORIGINS = list(set(CORS_ALLOWED_ORIGINS))

# Allow all origins in development only
CORS_ALLOW_ALL_ORIGINS = DEBUG

# Additional CORS settings
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

print(f"🌐 CORS Allowed Origins: {CORS_ALLOWED_ORIGINS}")  # Debug output

# Security settings for production
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ==================== EMAIL CONFIGURATION FROM ENV VARIABLES ====================

# Email Configuration - UPDATED TO USE ENV VARIABLES
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'False').lower() == 'true'
EMAIL_TIMEOUT = 30  # Timeout after 30 seconds
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@pathfinder.com')
OFFICIAL_EMAIL = os.getenv('OFFICIAL_EMAIL', 'hrpathfinder3@gmail.com')

# Debugging the values read
print(f"📧 EMAIL_BACKEND from env: {os.getenv('EMAIL_BACKEND')}")
print(f"📧 EMAIL_HOST_USER from env: {os.getenv('EMAIL_HOST_USER')}")
print(f"📧 Actual EMAIL_BACKEND being used: {EMAIL_BACKEND}")

# Frontend URLs
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
ADMIN_RESET_PASSWORD_URL = os.getenv('ADMIN_RESET_PASSWORD_URL', f'{FRONTEND_URL}/admin/reset-password')

# Print email configuration for debugging
if EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend':
    print("✅ SMTP Email is configured correctly")
else:
    print("⚠️ Console Email Backend is active - emails will NOT be sent to real inboxes")

# ==================== END EMAIL CONFIGURATION ====================

# Logging - IMPROVED
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}