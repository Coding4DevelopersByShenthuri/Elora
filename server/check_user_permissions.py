#!/usr/bin/env python
"""
Script to check and fix user admin permissions
Usage: python check_user_permissions.py
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile

def check_user_permissions():
    print("=" * 50)
    print("User Permissions Checker")
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
        
        print()
        print("=" * 50)
        print("User Information")
        print("=" * 50)
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"First Name: {user.first_name}")
        print(f"Last Name: {user.last_name}")
        print(f"Is Active: {user.is_active}")
        print(f"Is Staff: {user.is_staff}")
        print(f"Is Superuser: {user.is_superuser}")
        print()
        
        # Check profile
        try:
            profile = user.profile
            print(f"Profile Level: {profile.level}")
            print(f"Profile Points: {profile.points}")
        except UserProfile.DoesNotExist:
            print("⚠️  No profile found!")
        
        print()
        print("=" * 50)
        print("Admin Access Status")
        print("=" * 50)
        
        if user.is_superuser:
            print("✅ User is a SUPERUSER (has full admin access)")
        elif user.is_staff:
            print("✅ User is STAFF (has admin access)")
        else:
            print("❌ User is NOT an admin (no admin access)")
            print()
            response = input("Do you want to make this user an admin? (y/n): ").strip().lower()
            if response == 'y' or response == 'yes':
                make_superuser = input("Make superuser? (y) or just staff? (n): ").strip().lower()
                if make_superuser == 'y' or make_superuser == 'yes':
                    user.is_staff = True
                    user.is_superuser = True
                    print("✅ User will be made a SUPERUSER")
                else:
                    user.is_staff = True
                    print("✅ User will be made STAFF")
                
                user.is_active = True
                user.save()
                
                # Create profile if it doesn't exist
                if not hasattr(user, 'profile'):
                    UserProfile.objects.create(user=user)
                    print("✅ Profile created")
                
                print()
                print("=" * 50)
                print("✅ User updated successfully!")
                print("=" * 50)
                print(f"Username: {user.username}")
                print(f"Email: {user.email}")
                print(f"Is Staff: {user.is_staff}")
                print(f"Is Superuser: {user.is_superuser}")
                print()
                print("You can now login at: http://localhost:5173/admin/login")
                print("=" * 50)
            else:
                print("No changes made.")
    
    except User.DoesNotExist:
        print(f"❌ User not found!")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    try:
        check_user_permissions()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled.")
    except Exception as e:
        print(f"\nError: {str(e)}")
        sys.exit(1)

