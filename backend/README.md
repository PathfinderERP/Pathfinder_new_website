to update requireemnt.txt

uv pip freeze > requirements.txt

Start Django Backend
bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

.venv\Scripts\activate
uv run python manage.py startapp appname

=============old settings.py===============
import os
from dotenv import load_dotenv
from mongoengine import connect
from urllib.parse import quote_plus
from pathlib import Path
import certifi
import datetime

# Load environment variables FIRST

load_dotenv()

BASE_DIR = Path(**file**).resolve().parent.parent

# SECRET_KEY with proper fallback for production

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-development-key-change-in-production-123456')

# Debug settings for production - ALWAYS False on Render

DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Allowed hosts for production - IMPROVED

RENDER_EXTERNAL_HOSTNAME = os.getenv('RENDER_EXTERNAL_HOSTNAME')
ALLOWED_HOSTS = []

if RENDER_EXTERNAL_HOSTNAME:
ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Add development hosts only in debug mode

if DEBUG:
ALLOWED_HOSTS.extend(['localhost', '127.0.0.1', '0.0.0.0'])

print(f"🔧 DEBUG mode: {DEBUG}")
print(f"🌐 Allowed Hosts: {ALLOWED_HOSTS}")

# JWT Settings - IMPROVED

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY) # Fallback to Django secret
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DELTA = datetime.timedelta(days=7)

# MongoDB Connection - IMPROVED ERROR HANDLING

username = os.getenv("MONGO_USERNAME")
password = os.getenv("MONGO_PASSWORD")
cluster = os.getenv("MONGO_CLUSTER")
db_name = os.getenv("MONGO_DB_NAME", "test01") # Default database name

mongo_uri = os.getenv("MONGODB_URI") # Changed from MONGO_URI

mongo_connected = False

if mongo_uri:
print("🔗 Using MONGO_URI from environment")
try:
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

# Django Apps

INSTALLED_APPS = [
'django.contrib.admin',
'django.contrib.auth',
'django.contrib.contenttypes',
'django.contrib.sessions',
'django.contrib.messages',
'django.contrib.staticfiles',
'rest_framework',
'corsheaders',
'contact_api',
'users',
]

# REST Framework settings for JWT

REST_FRAMEWORK = {
'DEFAULT_RENDERER_CLASSES': [
'rest_framework.renderers.JSONRenderer',
],
'DEFAULT_PARSER_CLASSES': [
'rest_framework.parsers.JSONParser',
],
'DEFAULT_PERMISSION_CLASSES': [
'rest_framework.permissions.AllowAny',
],
'DEFAULT_AUTHENTICATION_CLASSES': [
'users.authentication.JWTAuthentication',
],
}

MIDDLEWARE = [
'corsheaders.middleware.CorsMiddleware', # Should be first
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
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS settings - IMPROVED FOR PRODUCTION

CORS_ALLOWED_ORIGINS = [
"http://localhost:3000",
"http://127.0.0.1:3000",
"https://3-pathfinder-new.vercel.app", # Your production frontend
]

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

# Security settings for production

if not DEBUG:
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000 # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

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

# Health check endpoint (useful for monitoring)

HEALTH_CHECK = ['*']

====================env for render========

# Django Settings

SECRET_KEY=\*4)qidb21$p-z3@td^q%!^i2h54k5&jd_c_t(1k#+j1krlu^nu
DEBUG=False
ALLOWED_HOSTS=pathfinder_backend.onrender.com,localhost,127.0.0.1

# Python Version

PYTHON_VERSION=3.11.0

# MongoDB Atlas

MONGO_USERNAME=PATH123
MONGO_PASSWORD=PATH@123
MONGO_CLUSTER=cluster0.8vmgvwn.mongodb.net
MONGO_DB_NAME=pathfinder_production

# CORS - Added your Vercel frontend

CORS_ALLOWED_ORIGINS=https://3-pathfinder-new.vercel.app,http://localhost:3000

# Optional but recommended

DJANGO_SETTINGS_MODULE=contact_backend.settings

============================using project.toml============================

Build Command

uv sync --frozen && uv run python manage.py collectstatic --noinput

Start Command

# uv run python manage.py migrate && uv run gunicorn contact_backend.wsgi:application --bind 0.0.0.0:$PORT

---

#\***\*\*\*\*\*\*\***\*\*\*\*\***\*\*\*\*\*\*\***\*\*\*\***\*\*\*\*\*\*\***\*\*\*\*\***\*\*\*\*\*\*\***

=========================.env used in render deployment======================

SECRET_KEY=\*4)qidb21$p-z3@td^q%!^i2h54k5&jd_c_t(1k#+j1krlu^nu
DEBUG=False
ALLOWED_HOSTS=contact-backend-xyz123.onrender.com

MONGO_USERNAME=PATH123
MONGO_PASSWORD=PATH@123
MONGO_CLUSTER=cluster0.8vmgvwn
MONGO_DB_NAME=test01
CORS_ALLOWED_ORIGINS=https://3-pathfinder-new.vercel.app

# ============= using requirement.txt=================

bash
pip install -r requirements.txt && python manage.py collectstatic --noinput 3. Update Render Start Command to:

python manage.py migrate && gunicorn contact_backend.wsgi:application --bind 0.0.0.0:$PORT

====================
https://three-pathfinder-new-backend-11.onrender.com

#\***\*\*\*\*\*\*\***\*\*\*\*\***\*\*\*\*\*\*\***\*\*\*\***\*\*\*\*\*\*\***\*\*\*\*\***\*\*\*\*\*\*\***
