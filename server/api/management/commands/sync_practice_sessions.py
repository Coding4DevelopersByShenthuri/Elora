"""
Django management command to sync existing practice sessions from separate tables to PracticeSession
This will backfill all historical YoungKids and TeenKids practice data into PracticeSession table
Usage: python manage.py sync_practice_sessions
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import (
    PracticeSession,
    KidsVocabularyPractice,
    KidsPronunciationPractice,
    TeenVocabularyPractice,
    TeenPronunciationPractice,
    KidsGameSession,
    TeenGameSession
)


class Command(BaseCommand):
    help = 'Sync existing practice sessions from separate tables to PracticeSession table'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be synced without actually creating records',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No records will be created'))
        
        total_synced = 0
        
        # Sync Kids Vocabulary Practice
        self.stdout.write('\n📚 Syncing Kids Vocabulary Practice...')
        kids_vocab = KidsVocabularyPractice.objects.all().select_related('user')
        kids_vocab_count = 0
        
        for practice in kids_vocab:
            # Check if already synced (avoid duplicates)
            existing = PracticeSession.objects.filter(
                user=practice.user,
                session_type='vocabulary',
                details__practice_id=practice.id,
                details__source='young_kids'
            ).exists()
            
            if not existing:
                if not dry_run:
                    PracticeSession.objects.create(
                        user=practice.user,
                        session_type='vocabulary',
                        duration_minutes=2,
                        score=practice.best_score,
                        points_earned=25 if practice.attempts == 1 else 0,
                        words_practiced=1,
                        sentences_practiced=0,
                        mistakes_count=0 if practice.best_score >= 80 else 1,
                        session_date=practice.last_practiced or practice.created_at,
                        details={
                            'source': 'young_kids',
                            'word': practice.word,
                            'story_id': practice.story_id,
                            'practice_id': practice.id,
                            'is_new_word': practice.attempts == 1,
                            'synced_from': 'KidsVocabularyPractice'
                        }
                    )
                kids_vocab_count += 1
                total_synced += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✅ Synced {kids_vocab_count} Kids Vocabulary sessions'))
        
        # Sync Kids Pronunciation Practice
        self.stdout.write('\n🗣️ Syncing Kids Pronunciation Practice...')
        kids_pron = KidsPronunciationPractice.objects.all().select_related('user')
        kids_pron_count = 0
        
        for practice in kids_pron:
            existing = PracticeSession.objects.filter(
                user=practice.user,
                session_type='pronunciation',
                details__practice_id=practice.id,
                details__source='young_kids'
            ).exists()
            
            if not existing:
                if not dry_run:
                    PracticeSession.objects.create(
                        user=practice.user,
                        session_type='pronunciation',
                        duration_minutes=3,
                        score=practice.best_score,
                        points_earned=30 if practice.attempts == 1 else 0,
                        words_practiced=0,
                        sentences_practiced=1,
                        mistakes_count=0 if practice.best_score >= 80 else 1,
                        session_date=practice.last_practiced or practice.created_at,
                        details={
                            'source': 'young_kids',
                            'phrase': practice.phrase[:100],
                            'story_id': practice.story_id,
                            'practice_id': practice.id,
                            'is_new_phrase': practice.attempts == 1,
                            'synced_from': 'KidsPronunciationPractice'
                        }
                    )
                kids_pron_count += 1
                total_synced += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✅ Synced {kids_pron_count} Kids Pronunciation sessions'))
        
        # Sync Teen Vocabulary Practice
        self.stdout.write('\n📖 Syncing Teen Vocabulary Practice...')
        teen_vocab = TeenVocabularyPractice.objects.all().select_related('user')
        teen_vocab_count = 0
        
        for practice in teen_vocab:
            existing = PracticeSession.objects.filter(
                user=practice.user,
                session_type='vocabulary',
                details__practice_id=practice.id,
                details__source='teen_kids'
            ).exists()
            
            if not existing:
                if not dry_run:
                    PracticeSession.objects.create(
                        user=practice.user,
                        session_type='vocabulary',
                        duration_minutes=2,
                        score=practice.best_score,
                        points_earned=25,
                        words_practiced=1,
                        sentences_practiced=0,
                        mistakes_count=0 if practice.best_score >= 80 else 1,
                        session_date=practice.last_practiced or practice.created_at,
                        details={
                            'source': 'teen_kids',
                            'word': practice.word,
                            'story_id': practice.story_id,
                            'story_title': practice.story_title,
                            'practice_id': practice.id,
                            'attempts': practice.attempts,
                            'synced_from': 'TeenVocabularyPractice'
                        }
                    )
                teen_vocab_count += 1
                total_synced += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✅ Synced {teen_vocab_count} Teen Vocabulary sessions'))
        
        # Sync Teen Pronunciation Practice
        self.stdout.write('\n🎤 Syncing Teen Pronunciation Practice...')
        teen_pron = TeenPronunciationPractice.objects.all().select_related('user')
        teen_pron_count = 0
        
        for practice in teen_pron:
            existing = PracticeSession.objects.filter(
                user=practice.user,
                session_type='pronunciation',
                details__practice_id=practice.id,
                details__source='teen_kids'
            ).exists()
            
            if not existing:
                if not dry_run:
                    PracticeSession.objects.create(
                        user=practice.user,
                        session_type='pronunciation',
                        duration_minutes=3,
                        score=practice.best_score,
                        points_earned=35,
                        words_practiced=0,
                        sentences_practiced=1,
                        mistakes_count=0 if practice.best_score >= 80 else 1,
                        session_date=practice.last_practiced or practice.created_at,
                        details={
                            'source': 'teen_kids',
                            'phrase': practice.phrase[:100],
                            'story_id': practice.story_id,
                            'story_title': practice.story_title,
                            'practice_id': practice.id,
                            'attempts': practice.attempts,
                            'synced_from': 'TeenPronunciationPractice'
                        }
                    )
                teen_pron_count += 1
                total_synced += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✅ Synced {teen_pron_count} Teen Pronunciation sessions'))
        
        # Sync Kids Game Sessions
        self.stdout.write('\n🎮 Syncing Kids Game Sessions...')
        kids_games = KidsGameSession.objects.all().select_related('user')
        kids_games_count = 0
        
        session_type_map = {
            'pronunciation-challenge': 'pronunciation',
            'conversation-practice': 'conversation',
            'word-chain': 'vocabulary',
            'tongue-twister': 'pronunciation',
            'rhyme': 'vocabulary',
            'sentence': 'grammar',
            'echo': 'pronunciation',
            'memory': 'vocabulary',
            'word_match': 'vocabulary',
        }
        
        for session in kids_games:
            existing = PracticeSession.objects.filter(
                user=session.user,
                details__game_session_id=session.id,
                details__source='young_kids'
            ).exists()
            
            if not existing:
                practice_session_type = session_type_map.get(session.game_type, 'conversation')
                duration_minutes = max(1, int(session.duration_seconds / 60)) if session.duration_seconds > 0 else 5
                
                if not dry_run:
                    PracticeSession.objects.create(
                        user=session.user,
                        session_type=practice_session_type,
                        duration_minutes=duration_minutes,
                        score=session.score,
                        points_earned=session.points_earned,
                        words_practiced=session.rounds if 'word' in session.game_type or 'vocabulary' in session.game_type else 0,
                        sentences_practiced=session.rounds if 'sentence' in session.game_type or 'conversation' in session.game_type else 0,
                        mistakes_count=max(0, session.rounds - int(session.score / 100 * session.rounds)) if session.rounds > 0 else 0,
                        session_date=session.created_at,
                        details={
                            'source': 'young_kids',
                            'game_type': session.game_type,
                            'game_title': session.game_title,
                            'game_session_id': session.id,
                            'rounds': session.rounds,
                            'difficulty': session.difficulty,
                            'completed': session.completed,
                            'synced_from': 'KidsGameSession'
                        }
                    )
                kids_games_count += 1
                total_synced += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✅ Synced {kids_games_count} Kids Game sessions'))
        
        # Sync Teen Game Sessions
        self.stdout.write('\n🎯 Syncing Teen Game Sessions...')
        teen_games = TeenGameSession.objects.all().select_related('user')
        teen_games_count = 0
        
        teen_session_type_map = {
            'pronunciation-challenge': 'pronunciation',
            'conversation-practice': 'conversation',
            'word-chain': 'vocabulary',
            'tongue-twister': 'pronunciation',
            'debate-club': 'conversation',
            'critical-thinking': 'conversation',
            'research-challenge': 'reading',
            'presentation-master': 'conversation',
            'ethics-discussion': 'conversation',
        }
        
        for session in teen_games:
            existing = PracticeSession.objects.filter(
                user=session.user,
                details__game_session_id=session.id,
                details__source='teen_kids'
            ).exists()
            
            if not existing:
                practice_session_type = teen_session_type_map.get(session.game_type, 'conversation')
                duration_minutes = max(1, int(session.duration_seconds / 60)) if session.duration_seconds > 0 else 5
                
                if not dry_run:
                    PracticeSession.objects.create(
                        user=session.user,
                        session_type=practice_session_type,
                        duration_minutes=duration_minutes,
                        score=session.score,
                        points_earned=session.points_earned,
                        words_practiced=session.rounds if 'word' in session.game_type or 'vocabulary' in session.game_type else 0,
                        sentences_practiced=session.rounds if 'sentence' in session.game_type or 'conversation' in session.game_type or 'debate' in session.game_type else 0,
                        mistakes_count=max(0, session.rounds - int(session.score / 100 * session.rounds)) if session.rounds > 0 else 0,
                        session_date=session.created_at,
                        details={
                            'source': 'teen_kids',
                            'game_type': session.game_type,
                            'game_title': session.game_title,
                            'game_session_id': session.id,
                            'rounds': session.rounds,
                            'difficulty': session.difficulty,
                            'completed': session.completed,
                            'synced_from': 'TeenGameSession'
                        }
                    )
                teen_games_count += 1
                total_synced += 1
        
        self.stdout.write(self.style.SUCCESS(f'  ✅ Synced {teen_games_count} Teen Game sessions'))
        
        # Summary
        self.stdout.write('\n' + '='*60)
        if dry_run:
            self.stdout.write(self.style.WARNING(f'\n📊 DRY RUN: Would sync {total_synced} practice sessions'))
            self.stdout.write(self.style.WARNING('Run without --dry-run to actually sync the data'))
        else:
            self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully synced {total_synced} practice sessions to PracticeSession table!'))
            total_in_db = PracticeSession.objects.count()
            self.stdout.write(self.style.SUCCESS(f'📈 Total practice sessions in database: {total_in_db}'))
            self.stdout.write(self.style.SUCCESS('\n🎉 All practice data is now visible in the admin portal!'))

