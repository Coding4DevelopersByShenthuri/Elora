#!/usr/bin/env python
"""
Script to create and apply migration for CategoryProgress model.
Run this script to ensure the MySQL table is created.
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')
django.setup()

from django.core.management import call_command
from django.db import connection

def create_migration():
    """Create migration for CategoryProgress model"""
    print("Creating migration for CategoryProgress model...")
    try:
        call_command('makemigrations', 'api', verbosity=2)
        print("✅ Migration created successfully!")
    except Exception as e:
        print(f"❌ Error creating migration: {e}")
        return False
    return True

def apply_migration():
    """Apply migration to database"""
    print("\nApplying migration to database...")
    try:
        call_command('migrate', 'api', verbosity=2)
        print("✅ Migration applied successfully!")
    except Exception as e:
        print(f"❌ Error applying migration: {e}")
        return False
    return True

def verify_table():
    """Verify CategoryProgress table exists in database"""
    print("\nVerifying CategoryProgress table...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES LIKE 'api_categoryprogress'")
            result = cursor.fetchone()
            if result:
                print("✅ CategoryProgress table exists!")
                cursor.execute("DESCRIBE api_categoryprogress")
                columns = cursor.fetchall()
                print(f"✅ Table has {len(columns)} columns")
                return True
            else:
                print("❌ CategoryProgress table does not exist!")
                return False
    except Exception as e:
        print(f"❌ Error verifying table: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("CategoryProgress MySQL Database Migration")
    print("=" * 60)
    
    # Create migration
    if not create_migration():
        sys.exit(1)
    
    # Apply migration
    if not apply_migration():
        sys.exit(1)
    
    # Verify table
    if not verify_table():
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All steps completed successfully!")
    print("=" * 60)
    print("\nCategoryProgress table is ready in MySQL database.")
    print("All progress data will be automatically saved to this table.")

