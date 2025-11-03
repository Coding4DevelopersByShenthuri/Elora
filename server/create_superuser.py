#!/usr/bin/env python
"""
Script to create a superuser for the Elora admin portal
Usage: python create_superuser.py
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

def create_superuser():
    print("=" * 50)
    print("Elora Admin Portal - Superuser Creator")
    print("=" * 50)
    print()
    print("Choose an option:")
    print("1. Create a new superuser")
    print("2. Make an existing user a superuser")
    print()
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == "2":
        # Make existing user a superuser
        email_or_username = input("Enter email or username of existing user: ").strip()
        if not email_or_username:
            print("Email or username cannot be empty!")
            return
        
        try:
            if '@' in email_or_username:
                existing_user = User.objects.get(email=email_or_username)
            else:
                existing_user = User.objects.get(username=email_or_username)
            
            print(f"\nFound user: {existing_user.username} ({existing_user.email})")
            print(f"Current status - Staff: {existing_user.is_staff}, Superuser: {existing_user.is_superuser}")
            
            if existing_user.is_superuser:
                print("\n⚠️  This user is already a superuser!")
                return
            
            response = input("\nMake this user a superuser? (y/n): ").strip().lower()
            if response == 'y' or response == 'yes':
                # Ask if they want to reset the password
                reset_password = input("\nDo you want to reset the password? (y/n): ").strip().lower()
                if reset_password == 'y' or reset_password == 'yes':
                    new_password = input("Enter new password (min 8 characters): ").strip()
                    if new_password and len(new_password) >= 8:
                        existing_user.set_password(new_password)
                        print("✅ Password updated!")
                    else:
                        print("⚠️  Password not updated (must be at least 8 characters)")
                
                existing_user.is_staff = True
                existing_user.is_superuser = True
                existing_user.is_active = True
                existing_user.save()
                
                # Create profile if it doesn't exist
                if not hasattr(existing_user, 'profile'):
                    UserProfile.objects.create(user=existing_user)
                
                print()
                print("=" * 50)
                print("✅ User updated to superuser successfully!")
                print("=" * 50)
                print(f"Username: {existing_user.username}")
                print(f"Email: {existing_user.email}")
                print(f"Admin Access: Yes")
                if reset_password == 'y' or reset_password == 'yes':
                    print(f"Password: Reset (use the new password you just entered)")
                else:
                    print(f"Password: Unchanged (use existing password)")
                print()
                print("You can now login at: http://localhost:5173/admin/login")
                print("=" * 50)
            else:
                print("Operation cancelled.")
            return
        except User.DoesNotExist:
            print(f"❌ User not found!")
            return
        except User.MultipleObjectsReturned:
            print(f"❌ Multiple users found with that email. Please use username instead.")
            return
    
    elif choice != "1":
        print("Invalid choice!")
        return
    
    # Create new superuser
    print("\n--- Creating New Superuser ---\n")
    
    username = input("Enter username: ").strip()
    if not username:
        print("Username cannot be empty!")
        return
    
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists!")
        response = input("Do you want to make this existing user a superuser? (y/n): ").strip().lower()
        if response == 'y' or response == 'yes':
            existing_user = User.objects.get(username=username)
            existing_user.is_staff = True
            existing_user.is_superuser = True
            existing_user.is_active = True
            existing_user.save()
            
            if not hasattr(existing_user, 'profile'):
                UserProfile.objects.create(user=existing_user)
            
            print()
            print("=" * 50)
            print("✅ User updated to superuser successfully!")
            print("=" * 50)
            print(f"Username: {existing_user.username}")
            print(f"Email: {existing_user.email}")
            print(f"Admin Access: Yes")
            print()
            print("You can now login at: http://localhost:5173/admin/login")
            print("=" * 50)
            return
        else:
            print("Operation cancelled.")
            return
    
    email = input("Enter email: ").strip()
    if not email:
        print("Email cannot be empty!")
        return
    
    existing_user = None
    if User.objects.filter(email=email).exists():
        existing_user = User.objects.get(email=email)
        print(f"\n⚠️  Email '{email}' is already registered!")
        print(f"   Username: {existing_user.username}")
        print(f"   Is Staff: {existing_user.is_staff}")
        print(f"   Is Superuser: {existing_user.is_superuser}")
        response = input("\nDo you want to make this existing user a superuser? (y/n): ").strip().lower()
        if response == 'y' or response == 'yes':
            existing_user.is_staff = True
            existing_user.is_superuser = True
            existing_user.is_active = True
            existing_user.save()
            
            # Create profile if it doesn't exist
            if not hasattr(existing_user, 'profile'):
                UserProfile.objects.create(user=existing_user)
            
            print()
            print("=" * 50)
            print("✅ User updated to superuser successfully!")
            print("=" * 50)
            print(f"Username: {existing_user.username}")
            print(f"Email: {existing_user.email}")
            print(f"Admin Access: Yes")
            print()
            print("You can now login at: http://localhost:5173/admin/login")
            print("=" * 50)
            return
        else:
            print("Operation cancelled.")
            return
    
    password = input("Enter password: ").strip()
    if not password or len(password) < 8:
        print("Password must be at least 8 characters long!")
        return
    
    first_name = input("Enter first name (optional): ").strip()
    last_name = input("Enter last name (optional): ").strip()
    
    # Create superuser
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        is_staff=True,
        is_superuser=True,
        is_active=True
    )
    
    # Create profile
    UserProfile.objects.create(user=user)
    
    print()
    print("=" * 50)
    print("✅ Superuser created successfully!")
    print("=" * 50)
    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Admin Access: Yes")
    print()
    print("You can now login at: http://localhost:5173/admin/login")
    print("=" * 50)

if __name__ == '__main__':
    try:
        create_superuser()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled.")
    except Exception as e:
        print(f"\nError: {str(e)}")
        sys.exit(1)

