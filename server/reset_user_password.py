#!/usr/bin/env python
"""
Script to reset a user's password
Usage: python reset_user_password.py
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')
django.setup()

from django.contrib.auth.models import User

def reset_password():
    print("=" * 50)
    print("Password Reset Utility")
    print("=" * 50)
    print()
    
    email_or_username = input("Enter email or username: ").strip()
    if not email_or_username:
        print("Email or username cannot be empty!")
        return
    
    try:
        if '@' in email_or_username:
            user = User.objects.get(email=email_or_username)
        else:
            user = User.objects.get(username=email_or_username)
        
        print(f"\nFound user: {user.username} ({user.email})")
        
        new_password = input("\nEnter new password (min 8 characters): ").strip()
        if not new_password or len(new_password) < 8:
            print("❌ Password must be at least 8 characters long!")
            return
        
        confirm_password = input("Confirm new password: ").strip()
        if new_password != confirm_password:
            print("❌ Passwords do not match!")
            return
        
        user.set_password(new_password)
        user.save()
        
        print()
        print("=" * 50)
        print("✅ Password reset successfully!")
        print("=" * 50)
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print()
        print("User can now login with the new password")
        print("=" * 50)
    
    except User.DoesNotExist:
        print(f"❌ User not found!")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    try:
        reset_password()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled.")
    except Exception as e:
        print(f"\nError: {str(e)}")
        sys.exit(1)

