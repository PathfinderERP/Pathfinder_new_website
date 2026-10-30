#!/usr/bin/env python3
"""
Quick CLI tool to send a test text email using Django's email configuration.
Usage:
    python send_test_email.py [recipient_email]
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contact_backend.settings')
django.setup()

from django.conf import settings
from django.core.mail import send_mail

def main():
    recipient = sys.argv[1] if len(sys.argv) > 1 else 'support@pathfinder.edu.in'
    
    print("=" * 60)
    print("  SENDING TEST EMAIL VIA DJANGO EMAIL BACKEND")
    print("=" * 60)
    print(f"  Backend:       {settings.EMAIL_BACKEND}")
    print(f"  Host:          {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
    print(f"  User:          {settings.EMAIL_HOST_USER}")
    print(f"  From:          {settings.DEFAULT_FROM_EMAIL}")
    print(f"  To:            {recipient}")
    print(f"  TLS:           {settings.EMAIL_USE_TLS}")
    print("-" * 60)

    try:
        subject = "Pathfinder Email Server - Verification Test"
        message = f"""Hello,

This is a test text email confirming that the Pathfinder email sending configuration is functioning properly.

Configuration Details:
- SMTP Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}
- Authentication Account: {settings.EMAIL_HOST_USER}
- From Email: {settings.DEFAULT_FROM_EMAIL}
- Purpose: Password Reset & System Notifications

Best regards,
Pathfinder Education Support
"""
        sent = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False
        )

        if sent:
            print("  SUCCESS: Test email was sent successfully!")
            print("=" * 60)
        else:
            print("  WARNING: send_mail returned 0 (no email sent).")
    except Exception as e:
        print(f"  FAILED: Error sending email: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
