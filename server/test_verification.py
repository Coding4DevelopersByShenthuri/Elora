#!/usr/bin/env python
"""
Test script to verify email verification token handling
Run this to test token generation and matching
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

from api.models import EmailVerificationToken
from django.contrib.auth.models import User
from urllib.parse import quote, unquote
import secrets

print("=" * 70)
print("Email Verification Token Test")
print("=" * 70)
print()

# Test token generation
print("1. Testing token generation:")
test_token = secrets.token_urlsafe(32)
print(f"   Generated token: {test_token}")
print(f"   Token length: {len(test_token)}")
print(f"   Contains special chars: {any(c in test_token for c in ['-', '_', '.'])}")
print()

# Test URL encoding/decoding
print("2. Testing URL encoding/decoding:")
encoded = quote(test_token)
decoded = unquote(encoded)
print(f"   Original: {test_token[:30]}...")
print(f"   Encoded: {encoded[:30]}...")
print(f"   Decoded: {decoded[:30]}...")
print(f"   Match: {test_token == decoded}")
print()

# Check existing tokens
print("3. Checking existing tokens in database:")
tokens = EmailVerificationToken.objects.filter(is_used=False).order_by('-created_at')[:5]
print(f"   Found {tokens.count()} unused tokens")
for token_obj in tokens:
    token = token_obj.token
    print(f"   - User: {token_obj.user.email}")
    print(f"     Token: {token[:20]}...{token[-10:]}")
    print(f"     Created: {token_obj.created_at}")
    print(f"     Valid: {token_obj.is_valid()}")
    print()

# Test token lookup
if tokens.exists():
    test_token_obj = tokens.first()
    test_token_value = test_token_obj.token
    
    print("4. Testing token lookup:")
    print(f"   Looking for token: {test_token_value[:20]}...")
    
    # Try direct lookup
    try:
        found = EmailVerificationToken.objects.get(token=test_token_value, is_used=False)
        print(f"   ✓ Direct lookup: Found")
    except EmailVerificationToken.DoesNotExist:
        print(f"   ✗ Direct lookup: Not found")
    
    # Try with URL decoding
    decoded_token = unquote(test_token_value)
    try:
        found = EmailVerificationToken.objects.get(token=decoded_token, is_used=False)
        print(f"   ✓ Decoded lookup: Found")
    except EmailVerificationToken.DoesNotExist:
        print(f"   ✗ Decoded lookup: Not found")
    
    # Try partial match
    partial = test_token_value[:10]
    similar = EmailVerificationToken.objects.filter(token__startswith=partial)
    print(f"   Similar tokens (first 10 chars): {similar.count()}")
    print()

print("=" * 70)
print("Recommendations:")
print("=" * 70)

if tokens.exists():
    print("✓ Tokens exist in database")
    print("  Check if tokens are being properly decoded in verify_email view")
else:
    print("⚠️  No unused tokens found")
    print("  Register a new user to generate tokens")

print()
print("To test verification endpoint:")
print("  curl http://localhost:8000/api/verify-email/<token>/")
print()

