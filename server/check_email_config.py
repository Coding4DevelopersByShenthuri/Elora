#!/usr/bin/env python
"""
Script to check email configuration
Run this to verify your .env file is being read correctly

Usage:
    python check_email_config.py
"""

import os
import sys
from pathlib import Path

# Add the server directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')

import django
django.setup()

from django.conf import settings
from decouple import config

print("=" * 70)
print("Email Configuration Diagnostic")
print("=" * 70)
print()

# Check .env file location
env_file = BASE_DIR / '.env'
print(f"📁 .env file location: {env_file}")
print(f"   Exists: {'✓ YES' if env_file.exists() else '✗ NO'}")
if env_file.exists():
    print(f"   Size: {env_file.stat().st_size} bytes")
print()

# Check raw config values (before Django processing)
print("📋 Raw values from .env file:")
try:
    email_backend_raw = config('EMAIL_BACKEND', default=None)
    email_user_raw = config('EMAIL_HOST_USER', default='')
    email_pass_raw = config('EMAIL_HOST_PASSWORD', default='')
    email_from_raw = config('DEFAULT_FROM_EMAIL', default='')
    
    print(f"   EMAIL_BACKEND: {repr(email_backend_raw) if email_backend_raw else 'NOT SET'}")
    print(f"   EMAIL_HOST_USER: {repr(email_user_raw) if email_user_raw else 'NOT SET'}")
    print(f"   EMAIL_HOST_PASSWORD: {'SET (' + str(len(email_pass_raw)) + ' chars)' if email_pass_raw else 'NOT SET'}")
    print(f"   DEFAULT_FROM_EMAIL: {repr(email_from_raw) if email_from_raw else 'NOT SET'}")
except Exception as e:
    print(f"   Error reading .env: {e}")
print()

# Check Django settings (after processing)
print("⚙️  Django Settings (final values):")
print(f"   EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"   EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"   EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"   EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"   EMAIL_HOST_USER: {settings.EMAIL_HOST_USER if settings.EMAIL_HOST_USER else 'NOT SET'}")
print(f"   EMAIL_HOST_PASSWORD: {'SET (' + str(len(settings.EMAIL_HOST_PASSWORD)) + ' chars)' if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
print(f"   DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL if settings.DEFAULT_FROM_EMAIL else 'NOT SET'}")
print(f"   FRONTEND_URL: {getattr(settings, 'FRONTEND_URL', 'NOT SET')}")
print()

# Check credential detection
has_creds = bool(settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD and settings.DEFAULT_FROM_EMAIL)
print("🔍 Credential Detection:")
print(f"   All credentials present: {'✓ YES' if has_creds else '✗ NO'}")
print(f"   EMAIL_HOST_USER: {'✓ SET' if settings.EMAIL_HOST_USER else '✗ NOT SET'}")
print(f"   EMAIL_HOST_PASSWORD: {'✓ SET' if settings.EMAIL_HOST_PASSWORD else '✗ NOT SET'}")
print(f"   DEFAULT_FROM_EMAIL: {'✓ SET' if settings.DEFAULT_FROM_EMAIL else '✗ NOT SET'}")
print()

# Backend analysis
print("📧 Email Backend Analysis:")
is_console = 'console' in settings.EMAIL_BACKEND.lower()
is_smtp = 'smtp' in settings.EMAIL_BACKEND.lower()

if is_console:
    print("   ⚠️  Currently using: CONSOLE BACKEND")
    print("   ⚠️  Emails will print to terminal, NOT be sent!")
    if has_creds:
        print()
        print("   ⚠️  PROBLEM DETECTED:")
        print("   ⚠️  Credentials are set but console backend is active!")
        print("   ⚠️  Check if EMAIL_BACKEND is explicitly set to console in .env")
        print("   ⚠️  Solution: Remove EMAIL_BACKEND from .env or set it to:")
        print("      EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend")
elif is_smtp:
    print("   ✓ Using: SMTP BACKEND")
    print("   ✓ Emails will be sent via SMTP")
    if not has_creds:
        print()
        print("   ⚠️  WARNING: SMTP backend selected but credentials missing!")
        print("   ⚠️  Emails will fail to send")
else:
    print(f"   ? Unknown backend: {settings.EMAIL_BACKEND}")
print()

# Recommendations
print("=" * 70)
print("💡 Recommendations:")
print("=" * 70)

if not env_file.exists():
    print("1. Create .env file in server directory:")
    print(f"   Location: {env_file}")
    print()
    print("2. Add these lines to .env:")
    print("   EMAIL_HOST_USER=elora.toinfo@gmail.com")
    print("   EMAIL_HOST_PASSWORD=mbmonrswlvhszqkt")
    print("   DEFAULT_FROM_EMAIL=elora.toinfo@gmail.com")
    print("   FRONTEND_URL=http://54.179.120.126")
elif not has_creds:
    print("1. Add email credentials to .env file:")
    print("   EMAIL_HOST_USER=elora.toinfo@gmail.com")
    print("   EMAIL_HOST_PASSWORD=mbmonrswlvhszqkt")
    print("   DEFAULT_FROM_EMAIL=elora.toinfo@gmail.com")
    print()
    print("2. Make sure there are NO spaces around the = sign")
    print("   Correct: EMAIL_HOST_PASSWORD=mbmonrswlvhszqkt")
    print("   Wrong:   EMAIL_HOST_PASSWORD = mbmonrswlvhszqkt")
elif is_console and has_creds:
    print("1. Remove EMAIL_BACKEND from .env (or comment it out)")
    print("   The system will auto-detect SMTP when credentials are present")
    print()
    print("2. OR explicitly set:")
    print("   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend")
    print()
    print("3. Restart Django server after changing .env")
else:
    print("✓ Configuration looks good!")
    print("  If emails still not sending, check:")
    print("  - Gmail App Password is correct")
    print("  - 2-Step Verification is enabled on Gmail")
    print("  - Server can reach smtp.gmail.com:587")

print()
print("=" * 70)
