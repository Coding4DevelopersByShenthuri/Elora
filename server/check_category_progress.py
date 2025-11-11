#!/usr/bin/env python
"""
Script to check and initialize CategoryProgress for users
Run this script to ensure CategoryProgress records are created for all users
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crud.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import CategoryProgress, KidsProgress, TeenProgress
from api.views import sync_category_progress

def check_and_sync_all_users():
    """Check and sync CategoryProgress for all users"""
    users = User.objects.all()
    print(f"Found {users.count()} users")
    
    for user in users:
        print(f"\nProcessing user: {user.username} (ID: {user.id})")
        
        # Check if CategoryProgress table exists
        try:
            existing = CategoryProgress.objects.filter(user=user).count()
            print(f"  Existing CategoryProgress records: {existing}")
        except Exception as e:
            print(f"  ERROR: CategoryProgress table may not exist: {e}")
            print("  Please run: python manage.py migrate")
            return
        
        # Check source data
        kids_progress = KidsProgress.objects.filter(user=user).first()
        teen_progress = TeenProgress.objects.filter(user=user).first()
        
        print(f"  KidsProgress: {kids_progress is not None}")
        if kids_progress:
            print(f"    Points: {kids_progress.points}, Streak: {kids_progress.streak}")
        
        print(f"  TeenProgress: {teen_progress is not None}")
        if teen_progress:
            print(f"    Points: {teen_progress.points}, Streak: {teen_progress.streak}, Missions: {teen_progress.missions_completed}")
        
        # Create and sync CategoryProgress for all categories
        categories = ['young_kids', 'teen_kids', 'adults_beginner', 'adults_intermediate', 'adults_advanced', 'ielts_pte']
        
        for category in categories:
            try:
                category_progress, created = CategoryProgress.objects.get_or_create(
                    user=user,
                    category=category,
                    defaults={
                        'total_points': 0,
                        'total_streak': 0,
                        'lessons_completed': 0,
                        'practice_time_minutes': 0,
                        'average_score': 0.0,
                        'progress_percentage': 0.0,
                        'level': 1,
                        'stories_completed': 0,
                        'vocabulary_words': 0,
                        'pronunciation_attempts': 0,
                        'games_completed': 0,
                    }
                )
                
                if created:
                    print(f"  Created CategoryProgress for {category}")
                else:
                    print(f"  CategoryProgress exists for {category}")
                
                # Sync data
                sync_category_progress(user, category, category_progress)
                category_progress.refresh_from_db()
                
                print(f"  {category}: {category_progress.total_points} points, {category_progress.stories_completed} stories")
            except Exception as e:
                print(f"  ERROR processing {category}: {e}")
                import traceback
                traceback.print_exc()

if __name__ == '__main__':
    print("=" * 60)
    print("CategoryProgress Check and Sync Script")
    print("=" * 60)
    check_and_sync_all_users()
    print("\n" + "=" * 60)
    print("Done!")
    print("=" * 60)

