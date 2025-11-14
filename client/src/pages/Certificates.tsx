import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Award, ArrowLeft, Download, Loader2, Share2, Printer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import KidsApi from '@/services/KidsApi';
import TeenApi from '@/services/TeenApi';
import KidsProgressService from '@/services/KidsProgressService';
import CertificatesService, { type CertificateLayout } from '@/services/CertificatesService';
import StorageService from '@/services/StorageService';
import StoryWordsService from '@/services/StoryWordsService';
import UserNotificationsService from '@/services/UserNotificationsService';
import MultiCategoryProgressService, { type CategoryProgress } from '@/services/MultiCategoryProgressService';
import { useRealTimeData } from '@/hooks/useRealTimeData';

type CertificateSpec = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  criteria: (ctx: any) => { progress: number; eligible: boolean; hint: string };
  badgeSrc?: string;
};

const CertificatesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  type AudiencePreference = 'young' | 'teen';
  const locationState = location.state as { audience?: AudiencePreference } | null;
  const explicitAudience = locationState?.audience;
  const queryAudience = useMemo<AudiencePreference | undefined>(() => {
    try {
      const params = new URLSearchParams(location.search);
      const value = params.get('audience');
      if (value === 'teen' || value === 'young') {
        return value;
      }
    } catch {
      // ignore
    }
    return undefined;
  }, [location.search]);
  
  // Detect if user is from teen kids page or has teen story enrollments
  const isTeenKids = useMemo(() => {
    if (explicitAudience === 'teen' || queryAudience === 'teen') {
      return true;
    }
    if (explicitAudience === 'young' || queryAudience === 'young') {
      return false;
    }

    try {
      const storedPreference = sessionStorage.getItem('speakbee_certificates_audience');
      if (storedPreference === 'teen') return true;
      if (storedPreference === 'young') return false;
    } catch {
      // ignore sessionStorage errors (e.g. privacy mode)
    }

    try {
      if (typeof document !== 'undefined') {
        if (document.referrer.includes('/kids/teen')) return true;
        if (document.referrer.includes('/kids/young')) return false;
      }
    } catch {
      // ignore referrer access issues
    }
    
    // Check if user has teen story enrollments
    try {
      const userId = localStorage.getItem('speakbee_current_user') 
        ? JSON.parse(localStorage.getItem('speakbee_current_user')!).id || 'anonymous'
        : 'anonymous';
      const enrolledStories = StoryWordsService.getEnrolledStories(userId);
      const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
        'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
        'ai-ethics-explorer', 'digital-security-guardian'];
      const hasTeenStories = enrolledStories.some(e => teenStoryIds.includes(e.storyId));
      if (hasTeenStories) {
        return true;
      }
    } catch {
      // ignore story enrolment lookup errors
    }
    return false;
  }, [explicitAudience, queryAudience]);

  useEffect(() => {
    try {
      sessionStorage.setItem('speakbee_certificates_audience', isTeenKids ? 'teen' : 'young');
    } catch {
      // ignore sessionStorage errors
    }
  }, [isTeenKids]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [localKidsProgress, setLocalKidsProgress] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'certs' | 'badges' | 'trophies'>('certs');
  const [generatingCertId, setGeneratingCertId] = useState<string | null>(null);
  const [reportedTrophies, setReportedTrophies] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('speakbee_unlocked_trophies_v2');
      if (raw) return JSON.parse(raw) as Record<string, string>;
      // Backward compat: migrate from Set store
      const legacy = localStorage.getItem('speakbee_unlocked_trophies');
      const legacyArr = legacy ? (JSON.parse(legacy) as string[]) : [];
      const migrated: Record<string, string> = {};
      legacyArr.forEach(id => { migrated[id] = new Date().toISOString(); });
      if (legacyArr.length) localStorage.setItem('speakbee_unlocked_trophies_v2', JSON.stringify(migrated));
      return migrated;
    } catch {
      return {};
    }
  });
  const [pendingUnlocks, setPendingUnlocks] = useState<{ id: string; title: string; date: string }[]>(() => {
    try {
      const raw = localStorage.getItem('speakbee_pending_trophy_unlocks');
      return raw ? (JSON.parse(raw) as { id: string; title: string; date: string }[]) : [];
    } catch { return []; }
  });
  const unlockDebounceRef = useState<{ timer: any | null }>({ timer: null })[0];
  const notificationKeysRef = useRef<Set<string>>(new Set());
  const previousEligibilityRef = useRef<Record<string, boolean>>({});
  const [notificationsHydrated, setNotificationsHydrated] = useState(false);

  // Get userId for use in effects and calculations
  const userData = localStorage.getItem('speakbee_current_user');
  const userId = userData ? (JSON.parse(userData)?.id || 'anonymous') : 'anonymous';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        const currentUserData = localStorage.getItem('speakbee_current_user');
        const currentUserId = currentUserData ? (JSON.parse(currentUserData)?.id || 'anonymous') : 'anonymous';
        // Always load local kids progress as fallback for certificate criteria
        try {
          const local = await KidsProgressService.get(currentUserId);
          setLocalKidsProgress(local);
        } catch (_) {}
        if (isAuthenticated && token && token !== 'local-token') {
          if (isTeenKids) {
            // For teen mode, fetch from TeenApi and merge with KidsApi data
            try {
              const [teenDashboard, kidsProgress, ach] = await Promise.all([
                TeenApi.getDashboard(token).catch(() => null),
                KidsApi.getProgress(token).catch(() => null),
                (KidsApi as any).getAchievements(token).catch(() => [])
              ]);
              
              // Merge teen dashboard data into progress structure
              let mergedProgress: any = kidsProgress || {};
              
              if (teenDashboard) {
                const dashboard = teenDashboard as any;
                // Extract teen-specific data from dashboard
                const teenPoints = dashboard.points ?? dashboard.progress?.points ?? 0;
                const teenStreak = dashboard.streak ?? dashboard.progress?.streak ?? 0;
                const teenPronunciationAttempts = Number(dashboard.pronunciation_attempts ?? 0) || 0;
                const teenVocabularyAttempts = Number(dashboard.vocabulary_attempts ?? 0) || 0;
                const teenGamesAttempts = Number(dashboard.games_attempts ?? 0) || 0;
                const completedStoryIds = Array.isArray(dashboard.completed_story_ids) ? dashboard.completed_story_ids : [];
                
                // Ensure audienceStats structure exists
                if (!mergedProgress.details) {
                  mergedProgress.details = {};
                }
                if (!mergedProgress.details.audienceStats) {
                  mergedProgress.details.audienceStats = {};
                }
                
                // Set teen-specific stats
                mergedProgress.details.audienceStats.teen = {
                  points: teenPoints,
                  streak: teenStreak,
                  pronunciation_attempts: teenPronunciationAttempts,
                  vocabulary_attempts: teenVocabularyAttempts,
                  games_attempts: teenGamesAttempts,
                };
                
                // Update story enrollments from completed stories
                if (!mergedProgress.details.storyEnrollments) {
                  mergedProgress.details.storyEnrollments = [];
                }
                
                // Add completed teen stories to enrollments if not already present
                const existingStoryIds = new Set(
                  (mergedProgress.details.storyEnrollments || []).map((s: any) => s.storyId)
                );
                
                completedStoryIds.forEach((storyId: string) => {
                  if (!existingStoryIds.has(storyId)) {
                    // Convert teen story ID (like 'teen-0') to internal story ID
                    const teenStoryMapping: Record<string, string> = {
                      'teen-0': 'mystery-detective',
                      'teen-1': 'space-explorer-teen',
                      'teen-2': 'environmental-hero',
                      'teen-3': 'tech-innovator',
                      'teen-4': 'global-citizen',
                      'teen-5': 'future-leader',
                      'teen-6': 'scientific-discovery',
                      'teen-7': 'social-media-expert',
                      'teen-8': 'ai-ethics-explorer',
                      'teen-9': 'digital-security-guardian',
                    };
                    const internalStoryId = teenStoryMapping[storyId] || storyId;
                    mergedProgress.details.storyEnrollments.push({
                      storyId: internalStoryId,
                      completed: true,
                      wordsExtracted: true,
                      score: 100,
                    });
                  }
                });
                
                // Update points and streak at root level for backward compatibility
                mergedProgress.points = teenPoints;
                mergedProgress.streak = teenStreak;
              }
              
              setProgress(mergedProgress);
              if (Array.isArray(ach)) setAchievements(ach);
            } catch (error) {
              console.error('Error loading teen progress:', error);
              // Fallback to regular kids progress
              try {
                const [pg, ach] = await Promise.all([
                  KidsApi.getProgress(token),
                  (KidsApi as any).getAchievements(token)
                ]);
                setProgress(pg);
                if (Array.isArray(ach)) setAchievements(ach);
              } catch (_) {}
            }
          } else {
            // For young mode, load from CategoryProgress (MySQL) first, then KidsApi
            try {
              // Load category progress from MySQL (most accurate source)
              const categoryProgressData = await MultiCategoryProgressService.getCategoryProgress(currentUserId, 'young_kids', true);
              if (categoryProgressData) {
                setCategoryProgress(categoryProgressData);
                
                // Create progress object from category progress data
                const progressFromCategory: any = {
                  points: categoryProgressData.total_points || 0,
                  streak: categoryProgressData.total_streak || 0,
                  details: {
                    storyEnrollments: [], // Will be populated from StoryWordsService
                    vocabulary: {},
                    pronunciation: {},
                    games: {
                      points: 0,
                      attempts: categoryProgressData.games_completed || 0,
                      types: []
                    }
                  }
                };
                
                // Load story enrollments from StoryWordsService
                const enrolledStories = StoryWordsService.getEnrolledStories(currentUserId);
                progressFromCategory.details.storyEnrollments = enrolledStories;
                
                // Also load from KidsApi to get vocabulary and pronunciation details
                try {
                  const [pg, ach] = await Promise.all([
                    KidsApi.getProgress(token),
                    (KidsApi as any).getAchievements(token)
                  ]);
                  
                  // Merge category progress (points, streak, counts) with KidsApi (details)
                  if (pg && (pg as any).details) {
                    progressFromCategory.details = {
                      ...(pg as any).details,
                      storyEnrollments: enrolledStories, // Use StoryWordsService data
                    };
                  }
                  
                  setProgress(progressFromCategory);
                  if (Array.isArray(ach)) setAchievements(ach);
                } catch (error) {
                  // If KidsApi fails, still use category progress
                  setProgress(progressFromCategory);
                  setAchievements([]);
                }
              } else {
                // Fallback to KidsApi if category progress not available
                const [pg, ach] = await Promise.all([
                  KidsApi.getProgress(token),
                  (KidsApi as any).getAchievements(token)
                ]);
                setProgress(pg);
                if (Array.isArray(ach)) setAchievements(ach);
              }
            } catch (error) {
              console.error('Error loading category progress:', error);
              // Fallback to KidsApi
              const [pg, ach] = await Promise.all([
                KidsApi.getProgress(token),
                (KidsApi as any).getAchievements(token)
              ]);
              setProgress(pg);
              if (Array.isArray(ach)) setAchievements(ach);
            }
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, isTeenKids]);

  // Real-time category progress updates for YoungKids mode
  const {
    data: realTimeCategories,
  } = useRealTimeData<CategoryProgress[]>('category_progress', {
    enabled: isAuthenticated && !!userId && !isTeenKids,
    immediate: true,
  });

  // Update category progress when real-time data arrives (YoungKids only)
  useEffect(() => {
    if (!isTeenKids && realTimeCategories && Array.isArray(realTimeCategories)) {
      const youngKidsProgress = realTimeCategories.find(cat => cat.category === 'young_kids');
      if (youngKidsProgress) {
        setCategoryProgress(youngKidsProgress);
      }
    }
  }, [realTimeCategories, isTeenKids]);

  useEffect(() => {
    if (!user?.id) return;
    setNotificationsHydrated(false);
    let cancelled = false;
    const hydrate = async () => {
      try {
        const existing = await UserNotificationsService.getAll(String(user.id));
        if (cancelled) return;
        existing.forEach((notification) => {
          if (notification.eventKey) {
            notificationKeysRef.current.add(notification.eventKey);
          }
        });
      } catch {
        // Non-blocking; offline mode will handle notifications lazily.
      } finally {
        if (!cancelled) {
          setNotificationsHydrated(true);
        }
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const mergedDetails = (() => {
    const serverDetails = (progress as any)?.details || {};
    const localDetails = localKidsProgress ? {
      readAloud: localKidsProgress.readAloud,
      vocabulary: localKidsProgress.vocabulary,
      pronunciation: localKidsProgress.pronunciation,
      storyEnrollments: localKidsProgress.storyEnrollments || []
    } : {};
    return {
      ...serverDetails,
      readAloud: serverDetails.readAloud || localDetails.readAloud || {},
      vocabulary: serverDetails.vocabulary || localDetails.vocabulary || {},
      pronunciation: serverDetails.pronunciation || localDetails.pronunciation || {},
      storyEnrollments: (serverDetails.storyEnrollments || localDetails.storyEnrollments || []) as any[]
    };
  })();

  const audienceStats = (mergedDetails as any)?.audienceStats || {};
  const teenAudienceStats = (audienceStats as any).teen || {};
  const youngAudienceStats = (audienceStats as any).young || {};

  // userId is already defined above, no need to redefine

  // Calculate points from CategoryProgress (MySQL) - most accurate source
  // This matches the Progress snapshot in YoungKids/TeenKids pages
  const calculateLearningPoints = useMemo(() => {
    try {
      // For YoungKids mode, use category progress total_points (includes all points: stories, words, pronunciation, games)
      if (!isTeenKids && categoryProgress) {
        return categoryProgress.total_points || 0;
      }
      
      // For TeenKids mode, try to get from category progress or calculate
      if (isTeenKids) {
        // Try to get from progress object first (from TeenApi)
        const teenPoints = (progress as any)?.points ?? (progress as any)?.progress?.points ?? 0;
        if (teenPoints > 0) {
          return teenPoints;
        }
      }
      
      // Fallback: calculate from completed stories, words, and pronunciation (exclude games for certificates)
      let totalPoints = 0;
      const vocab = mergedDetails?.vocabulary || {};
      const pron = mergedDetails?.pronunciation || {};
      const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
        'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
        'ai-ethics-explorer', 'digital-security-guardian'];
      const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
        'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
        'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
        'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
        'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
      
      const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
      const enrolledStories = StoryWordsService.getEnrolledStories(userId);
      
      // Get completed stories
      const completedStoryIds = enrolledStories
        .filter(e => 
          e.completed === true && 
          e.wordsExtracted === true &&
          targetStoryIds.includes(e.storyId)
        )
        .map(e => e.storyId);
      
      // Points from completed stories (typically 100-200 points per story based on score)
      completedStoryIds.forEach(storyId => {
        const story = enrolledStories.find(e => e.storyId === storyId);
        if (story && story.score) {
          const storyPoints = 100 + Math.round(story.score);
          totalPoints += storyPoints;
        } else {
          totalPoints += 150;
        }
      });
      
      // Points from mastered words (25 points per word with ≥2 attempts)
      if (completedStoryIds.length > 0) {
        const words = StoryWordsService.getWordsForStoryIds(completedStoryIds);
        const storyWords = new Set<string>();
        words.forEach(w => storyWords.add(w.word.toLowerCase()));
        
        const filteredVocab = Object.entries(vocab).filter(([word]) => 
          storyWords.has(word.toLowerCase())
        ).map(([, data]) => data as any);
        
        const masteredWords = filteredVocab.filter((r: any) => (r.attempts || 0) >= 2);
        totalPoints += masteredWords.length * 25;
      }
      
      // Points from pronunciation practice (35 points per phrase practiced)
      if (completedStoryIds.length > 0) {
        const phrases = StoryWordsService.getPhrasesForStoryIds(completedStoryIds);
        const storyPhrases = new Set<string>();
        phrases.forEach(p => storyPhrases.add(p.phrase.toLowerCase()));
        
        const filteredSessions = Object.entries(pron).filter(([phrase]) => 
          storyPhrases.has(phrase.toLowerCase())
        ).map(([, data]) => data as any);
        
        const totalPronAttempts = filteredSessions.reduce((sum: number, r: any) => sum + (r.attempts || 0), 0);
        totalPoints += totalPronAttempts * 35;
      }
      
      return totalPoints;
    } catch (error) {
      console.error('Error calculating learning points:', error);
      return 0;
    }
  }, [mergedDetails, userId, isTeenKids, categoryProgress, progress]);

  // Use calculated learning points instead of total points (which includes games)
  const resolvedPoints = calculateLearningPoints;

  // Use category progress streak for YoungKids (matches Progress snapshot)
  const resolvedStreak = isTeenKids
    ? teenAudienceStats.streak ?? (progress as any)?.streak ?? 0
    : (categoryProgress?.total_streak ?? youngAudienceStats.streak ?? (progress as any)?.streak ?? 0);

  const ctx = {
    points: resolvedPoints,
    streak: resolvedStreak,
    details: mergedDetails,
    achievements,
    categoryProgress, // Include category progress for certificate criteria
  };

  const certificates: CertificateSpec[] = [
    {
      id: 'story-time-champion',
      title: isTeenKids ? 'Advanced Story Champion' : 'Story Time Champion',
      emoji: '📚',
      badgeSrc: '/story-time-champion-badge.png',
      description: isTeenKids ? 'Completed 10 advanced teen stories' : 'Completed 20 stories',
      criteria: (c) => {
        // For YoungKids, use category progress stories_completed (matches Progress snapshot)
        // YoungKids has 20 stories total, TeenKids has 10
        if (!isTeenKids && c.categoryProgress) {
          const completedCount = c.categoryProgress.stories_completed || 0;
          const targetCount = 20; // YoungKids has 20 stories
          const total = Math.min(completedCount, targetCount);
          const progress = Math.min(100, Math.round((total / targetCount) * 100));
          const eligible = total >= targetCount;
          const hint = eligible ? 'Ready to download!' : `Stories: ${total}/${targetCount} completed`;
          return { progress, eligible, hint };
        }
        
        // Fallback: Only count fully completed stories from storyEnrollments
        const storyEnrollments = (c.details?.storyEnrollments || []) as any[];
        
        // Filter by story type (teen vs young)
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        
        let completedStories = storyEnrollments.filter((s: any) => 
          s.completed === true && s.wordsExtracted === true
        );
        
        // Filter by story type if needed
        if (isTeenKids) {
          completedStories = completedStories.filter((s: any) => teenStoryIds.includes(s.storyId));
        } else {
          completedStories = completedStories.filter((s: any) => youngStoryIds.includes(s.storyId));
        }
        
        const completedCount = completedStories.length;

        // Also check StoryWordsService for enrolled stories (more reliable source)
        try {
          const userId = localStorage.getItem('speakbee_current_user') 
            ? JSON.parse(localStorage.getItem('speakbee_current_user')!).id || 'anonymous'
            : 'anonymous';
          const enrolledStories = StoryWordsService.getEnrolledStories(userId);
          let fullyCompleted = enrolledStories.filter(e => 
            e.completed === true && e.wordsExtracted === true
          );
          
          // Filter by story type
          if (isTeenKids) {
            fullyCompleted = fullyCompleted.filter(e => teenStoryIds.includes(e.storyId));
          } else {
            fullyCompleted = fullyCompleted.filter(e => youngStoryIds.includes(e.storyId));
          }
          
          // Use the maximum of both sources
          const total = Math.max(completedCount, fullyCompleted.length);
          const targetCount = isTeenKids ? 10 : 20; // YoungKids has 20 stories, TeenKids has 10
          
          const progress = Math.min(100, Math.round((Math.min(total, targetCount) / targetCount) * 100));
          const eligible = total >= targetCount;
          const hint = eligible ? 'Ready to download!' : `Stories: ${Math.min(total, targetCount)}/${targetCount} completed`;
          return { progress, eligible, hint };
        } catch {
          // Fallback to details only
          const total = completedCount;
          const targetCount = isTeenKids ? 10 : 20; // YoungKids has 20 stories, TeenKids has 10
          const progress = Math.min(100, Math.round((Math.min(total, targetCount) / targetCount) * 100));
          const eligible = total >= targetCount;
          const hint = eligible ? 'Ready to download!' : `Stories: ${Math.min(total, targetCount)}/${targetCount} completed`;
          return { progress, eligible, hint };
        }
      }
    },
    {
      id: 'speaking-star',
      title: isTeenKids ? 'Professional Speaking Star' : 'Speaking Star',
      emoji: '🎤',
      badgeSrc: '/Speaking_star_badge.png',
      description: isTeenKids ? '50 Advanced Speaking sessions with average ≥ 75' : '50 Speak & Repeat sessions with average ≥ 75',
      criteria: (c) => {
        // For YoungKids, use category progress pronunciation_attempts (matches Progress snapshot)
        if (!isTeenKids && c.categoryProgress) {
          const attempts = c.categoryProgress.pronunciation_attempts || 0;
          // Estimate average score (can be improved if we track it in category progress)
          const avg = 75; // Default estimate
          const total = attempts;
          const progress = Math.min(100, Math.round(((Math.min(total, 50) / 50) * 50) + (Math.min(avg, 100) / 2)));
          const eligible = total >= 50 && avg >= 75;
          const hint = eligible ? 'Ready to download!' : `Sessions: ${Math.min(total, 50)}/50, Avg: ${avg.toFixed(0)}%`;
          return { progress, eligible, hint };
        }
        
        const pron = c.details?.pronunciation || {};
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        
        // Only count phrases from completed stories
        const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
        try {
          const userId = localStorage.getItem('speakbee_current_user') 
            ? JSON.parse(localStorage.getItem('speakbee_current_user')!).id || 'anonymous'
            : 'anonymous';
          const enrolledStories = StoryWordsService.getEnrolledStories(userId);
          
          // Get only completed stories from the correct audience
          const completedStoryIds = enrolledStories
            .filter(e => 
              e.completed === true && 
              e.wordsExtracted === true &&
              targetStoryIds.includes(e.storyId)
            )
            .map(e => e.storyId);
          
          // If no completed stories, return 0 progress
          if (completedStoryIds.length === 0) {
            return { progress: 0, eligible: false, hint: 'Sessions: 0/50, Avg: 0%' };
          }
          
          // Get phrases only from completed stories
          const phrases = StoryWordsService.getPhrasesForStoryIds(completedStoryIds);
          const storyPhrases = new Set<string>();
          phrases.forEach(p => storyPhrases.add(p.phrase.toLowerCase()));
          
          // Filter pronunciation sessions by story phrases from completed stories only
          const filteredSessions = Object.entries(pron).filter(([phrase]) => 
            storyPhrases.has(phrase.toLowerCase())
          ).map(([, data]) => data as any);
          
          const total = filteredSessions.reduce((s: number, r: any) => s + (r.attempts || 0), 0);
          const avg = filteredSessions.length ? (filteredSessions.reduce((s: number, r: any) => s + (r.bestScore || 0), 0) / filteredSessions.length) : 0;
          const progress = Math.min(100, Math.round(((Math.min(total, 50) / 50) * 50) + (Math.min(avg, 100) / 2)));
          const eligible = total >= 50 && avg >= 75;
          const hint = eligible ? 'Ready to download!' : `Sessions: ${Math.min(total, 50)}/50, Avg: ${avg.toFixed(0)}%`;
          return { progress, eligible, hint };
        } catch (error) {
          console.error('Error computing speaking-star certificate:', error);
          return { progress: 0, eligible: false, hint: 'Sessions: 0/50, Avg: 0%' };
        }
      }
    },
    {
      id: 'word-wizard',
      title: isTeenKids ? 'Advanced Vocabulary Master' : 'Word Wizard',
      emoji: '🪄',
      badgeSrc: '/Word_wizard_badge.png',
      description: isTeenKids ? 'Master 100 advanced words (≥ 2 practices each)' : 'Master 100 unique words (≥ 2 practices each)',
      criteria: (c) => {
        // For YoungKids, use category progress vocabulary_words (matches Progress snapshot)
        // Note: We need to count mastered words (≥2 attempts), not just total words
        // For now, estimate based on vocabulary_words count
        if (!isTeenKids && c.categoryProgress) {
          const vocabWords = c.categoryProgress.vocabulary_words || 0;
          // Estimate mastered words (assuming ~70% of vocabulary words are mastered with ≥2 attempts)
          const mastered = Math.round(vocabWords * 0.7);
          const progress = Math.min(100, Math.round((Math.min(mastered, 100) / 100) * 100));
          const eligible = mastered >= 100;
          const hint = eligible ? 'Ready to download!' : `Mastered: ${mastered}/100`;
          return { progress, eligible, hint };
        }
        
        const vocab = c.details?.vocabulary || {};
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        
        // Only count words from completed stories
        const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
        try {
          const userId = localStorage.getItem('speakbee_current_user') 
            ? JSON.parse(localStorage.getItem('speakbee_current_user')!).id || 'anonymous'
            : 'anonymous';
          const enrolledStories = StoryWordsService.getEnrolledStories(userId);
          
          // Get only completed stories from the correct audience
          const completedStoryIds = enrolledStories
            .filter(e => 
              e.completed === true && 
              e.wordsExtracted === true &&
              targetStoryIds.includes(e.storyId)
            )
            .map(e => e.storyId);
          
          // If no completed stories, return 0 progress
          if (completedStoryIds.length === 0) {
            return { progress: 0, eligible: false, hint: 'Mastered: 0/100' };
          }
          
          // Get words only from completed stories
          const words = StoryWordsService.getWordsForStoryIds(completedStoryIds);
          const storyWords = new Set<string>();
          words.forEach(w => storyWords.add(w.word.toLowerCase()));
          
          // Filter vocabulary by story words from completed stories only
          const filteredVocab = Object.entries(vocab).filter(([word]) => 
            storyWords.has(word.toLowerCase())
          ).map(([, data]) => data as any);
          
          const mastered = filteredVocab.filter((r: any) => (r.attempts || 0) >= 2).length;
          const progress = Math.min(100, Math.round((Math.min(mastered, 100) / 100) * 100));
          const eligible = mastered >= 100;
          const hint = eligible ? 'Ready to download!' : `Mastered: ${mastered}/100`;
          return { progress, eligible, hint };
        } catch (error) {
          console.error('Error computing word-wizard certificate:', error);
          return { progress: 0, eligible: false, hint: 'Mastered: 0/100' };
        }
      }
    },
    {
      id: 'consistency-hero',
      title: 'Consistency Hero',
      emoji: '🔥',
      badgeSrc: '/Consistancy_badge.png',
      description: 'Maintain a 21-day learning streak',
      criteria: (c) => {
        const streak = c.streak || 0;
        const progress = Math.min(100, Math.round((Math.min(streak, 21) / 21) * 100));
        const eligible = streak >= 21;
        const hint = eligible ? 'Ready to download!' : `Streak: ${Math.min(streak, 21)}/21 days`;
        return { progress, eligible, hint };
      }
    },
    {
      id: 'super-learner',
      title: 'Super Learner',
      emoji: '🏆',
      badgeSrc: '/Super_Learner.png',
      description: 'Unlock any 3 certificates',
      criteria: (_c) => {
        // Will be computed after other certificates
        return { progress: 0, eligible: false, hint: '' };
      }
    }
  ];

  // Compute eligibility for first 4 certificates
  const computed = certificates.map((spec) => spec.criteria(ctx));
  
  // Compute Super Learner based on other certificates
  const earnedCount = computed.slice(0, 4).filter(c => c.eligible).length;
  const superProgress = Math.min(100, Math.round((Math.min(earnedCount, 3) / 3) * 100));
  const superEligible = earnedCount >= 3;

  // Update Super Learner result
  computed[4] = { 
    progress: superProgress, 
    eligible: superEligible, 
    hint: superEligible ? 'Ready to download!' : `Certificates: ${Math.min(earnedCount, 3)}/3` 
  };


  // Derive badges and trophies lists similar to Microsoft Learn layout
  // If Story Time Champion is eligible, surface its badge in Badges section
  const notifyUnlock = useCallback(
    async (
      type: 'certificate' | 'badge' | 'trophy',
      eventKey: string,
      title: string,
      message: string,
      icon: string
    ) => {
      if (!user?.id) return;
      if (notificationKeysRef.current.has(eventKey)) return;
      notificationKeysRef.current.add(eventKey);
      try {
        await UserNotificationsService.create(String(user.id), {
          type,
          title,
          message,
          icon,
          eventKey,
        });
      } catch (error) {
        console.warn('Notification dispatch skipped:', error);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !notificationsHydrated) return;
    certificates.forEach((spec, index) => {
      const isEligible = computed[index]?.eligible ?? false;
      const eventKey = `certificate:${spec.id}`;
      const wasEligible = previousEligibilityRef.current[spec.id];
      if (isEligible && !wasEligible) {
        notifyUnlock(
          'certificate',
          eventKey,
          `${spec.title} certificate unlocked`,
          `Your ${spec.title} certificate is now ready to download and share.`,
          '📜'
        );
      }
      previousEligibilityRef.current[spec.id] = isEligible;
    });
  }, [certificates, computed, isAuthenticated, notificationsHydrated, notifyUnlock, user?.id]);

  const unlockedBadges = useMemo(() => {
    const base = (achievements || []).filter((a: any) => a.unlocked);
    const badges: any[] = [];
    
    try {
      // Add Story Time Champion badge if eligible
      const idx = certificates.findIndex(c => c.id === 'story-time-champion');
      if (idx >= 0 && computed[idx]?.eligible) {
        const stc = certificates[idx] as any;
        badges.push({
          id: 'badge-story-time-champion',
          title: stc.title,
          name: stc.title,
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          image: stc.badgeSrc || '/story-time-champion-badge.png'
        });
      }
      
      // Add badges for completed stories
      try {
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        
        const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
        const completedStories = enrolledStories.filter(e => 
          e.completed === true && 
          e.wordsExtracted === true &&
          targetStoryIds.includes(e.storyId)
        );
        
        // Story title mapping
        const storyTitles: Record<string, string> = {
          'mystery-detective': 'Mystery Detective',
          'space-explorer-teen': 'Space Explorer',
          'environmental-hero': 'Environmental Hero',
          'tech-innovator': 'Tech Innovator',
          'global-citizen': 'Global Citizen',
          'future-leader': 'Future Leader',
          'scientific-discovery': 'Scientific Discovery',
          'social-media-expert': 'Social Media Expert',
          'ai-ethics-explorer': 'AI Ethics Explorer',
          'digital-security-guardian': 'Digital Security Guardian',
          'magic-forest': 'Magic Forest',
          'space-adventure': 'Space Adventure',
          'underwater-world': 'Underwater World',
          'dinosaur-discovery': 'Dinosaur Discovery',
          'unicorn-magic': 'Unicorn Magic',
          'pirate-treasure': 'Pirate Treasure',
          'superhero-school': 'Superhero School',
          'fairy-garden': 'Fairy Garden',
          'rainbow-castle': 'Rainbow Castle',
          'jungle-explorer': 'Jungle Explorer',
        };
        
        // Add badge for each completed story
        completedStories.forEach(story => {
          const storyTitle = storyTitles[story.storyId] || story.storyId;
          badges.push({
            id: `badge-story-${story.storyId}`,
            title: `${storyTitle} Completed`,
            name: `${storyTitle} Story Master`,
            unlocked: true,
            unlocked_at: story.completedAt || new Date().toISOString(),
            image: '/story-time-champion-badge.png',
            emoji: '📚'
          });
        });
      } catch (error) {
        console.error('Error loading story badges:', error);
      }
      
      // Add badges for word mastery milestones
      try {
        const vocab = ctx.details?.vocabulary || {};
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        
        const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        const completedStoryIds = enrolledStories
          .filter(e => e.completed === true && e.wordsExtracted === true)
          .map(e => e.storyId)
          .filter(id => targetStoryIds.includes(id));
        
        const words = StoryWordsService.getWordsForStoryIds(completedStoryIds);
        const storyWords = new Set<string>();
        words.forEach(w => storyWords.add(w.word.toLowerCase()));
        
        const filteredVocab = Object.entries(vocab).filter(([word]) => 
          storyWords.has(word.toLowerCase())
        ).map(([, data]) => data as any);
        
        const masteredWords = filteredVocab.filter((r: any) => (r.attempts || 0) >= 2).length;
        
        // Add milestone badges for word mastery
        if (masteredWords >= 10) {
          badges.push({
            id: 'badge-words-10',
            title: 'Word Explorer',
            name: 'Mastered 10 Words',
            unlocked: true,
            unlocked_at: new Date().toISOString(),
            image: '/Word_wizard_badge.png',
            emoji: '🪄'
          });
        }
        if (masteredWords >= 50) {
          badges.push({
            id: 'badge-words-50',
            title: 'Word Wizard',
            name: 'Mastered 50 Words',
            unlocked: true,
            unlocked_at: new Date().toISOString(),
            image: '/Word_wizard_badge.png',
            emoji: '🪄'
          });
        }
        if (masteredWords >= 100) {
          badges.push({
            id: 'badge-words-100',
            title: 'Word Master',
            name: 'Mastered 100 Words',
            unlocked: true,
            unlocked_at: new Date().toISOString(),
            image: '/Word_wizard_badge.png',
            emoji: '🪄'
          });
        }
      } catch (error) {
        console.error('Error loading word mastery badges:', error);
      }
      
      // Add badges for pronunciation practice milestones
      try {
        const pron = ctx.details?.pronunciation || {};
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        
        const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        const completedStoryIds = enrolledStories
          .filter(e => e.completed === true && e.wordsExtracted === true)
          .map(e => e.storyId)
          .filter(id => targetStoryIds.includes(id));
        
        if (completedStoryIds.length > 0) {
          const phrases = StoryWordsService.getPhrasesForStoryIds(completedStoryIds);
          const storyPhrases = new Set<string>();
          phrases.forEach(p => storyPhrases.add(p.phrase.toLowerCase()));
          
          const filteredSessions = Object.entries(pron).filter(([phrase]) => 
            storyPhrases.has(phrase.toLowerCase())
          ).map(([, data]) => data as any);
          
          const totalAttempts = filteredSessions.reduce((s: number, r: any) => s + (r.attempts || 0), 0);
          
          // Add milestone badges for pronunciation practice
          if (totalAttempts >= 25) {
            badges.push({
              id: 'badge-pronunciation-25',
              title: 'Speaking Star',
              name: '25 Pronunciation Practices',
              unlocked: true,
              unlocked_at: new Date().toISOString(),
              image: '/Speaking_star_badge.png',
              emoji: '🎤'
            });
          }
          if (totalAttempts >= 50) {
            badges.push({
              id: 'badge-pronunciation-50',
              title: 'Pronunciation Pro',
              name: '50 Pronunciation Practices',
              unlocked: true,
              unlocked_at: new Date().toISOString(),
              image: '/Speaking_star_badge.png',
              emoji: '🎙️'
            });
          }
        }
      } catch (error) {
        console.error('Error loading pronunciation badges:', error);
      }
      
      // Combine API badges with dynamically created badges, removing duplicates
      const allBadges = [...badges, ...base];
      const uniqueBadges = Array.from(
        new Map(allBadges.map(badge => [badge.id, badge])).values()
      );
      
      return uniqueBadges;
    } catch (error) {
      console.error('Error computing badges:', error);
      return base;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements, computed.map(c => c.eligible).join('|'), ctx.details, userId, isTeenKids]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !notificationsHydrated) return;
    unlockedBadges.forEach((badge, index) => {
      const rawIdentifier = (
        badge.id ||
        badge.title ||
        badge.name ||
        `badge-${index}`
      ).toString();
      const slug = rawIdentifier.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      notifyUnlock(
        'badge',
        `badge:${slug}`,
        `${badge.title || badge.name || 'New badge'} unlocked`,
        'A new badge has been added to your certificates collection.',
        '🎖️'
      );
    });
  }, [isAuthenticated, notificationsHydrated, notifyUnlock, unlockedBadges, user?.id]);
  const lockedBadges = useMemo(() => (achievements || []).filter((a: any) => !a.unlocked), [achievements]);
  const trophySpecs = useMemo(() => {
    const storyMasterDesc = isTeenKids 
      ? 'All 10 teen stories at ≥80' 
      : 'All 20 young stories at ≥80';
    return [
      { id: 'consistency-hero', title: 'Consistency Hero', emoji: '🔥', desc: 'Maintain a 21-day learning streak', badgeSrc: '/Consistency_badge.png' },
      { id: 'story-master', title: 'Story Master', emoji: '📖', desc: storyMasterDesc, badgeSrc: '/story-time-champion-badge.png' },
      { id: 'pronunciation-pro', title: 'Pronunciation Pro', emoji: '🎙️', desc: '100 pron attempts, avg ≥80', badgeSrc: '/Speaking_star_badge.png' },
      { id: 'vocab-builder', title: 'Vocabulary Builder', emoji: '🧠', desc: 'Learn 150 unique words', badgeSrc: '/Word_wizard_badge.png' },
      { id: 'super-learner', title: 'Super Learner', emoji: '🏆', desc: 'Unlock any 3 certificates', badgeSrc: '/Super_Learner.png' },
      { id: 'explorer', title: 'Explorer Trophy', emoji: '🗺️', desc: 'Try all games + 300 pts' }
    ];
  }, [isTeenKids]);
  
  const computeTrophyProgress = (t: { id: string }) => {
    const d = ctx.details || {};
    
    if (t.id === 'consistency-hero') {
      // Use category progress streak for YoungKids (matches Progress snapshot)
      const streak = !isTeenKids && categoryProgress
        ? categoryProgress.total_streak || 0
        : ctx.streak || 0;
      return Math.round((Math.min(streak, 21) / 21) * 100);
    }
    if (t.id === 'story-master') {
      // For YoungKids, use category progress stories_completed (matches Progress snapshot)
      // YoungKids has 20 stories total, TeenKids has 10
      if (!isTeenKids && categoryProgress) {
        const completedCount = Math.min(categoryProgress.stories_completed || 0, 20);
        return Math.round((completedCount / 20) * 100);
      }
      
      // Fallback: Use actual completed stories from StoryWordsService
      try {
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        // Filter by story type (young vs teen)
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        
        // Count only fully completed stories (completed=true AND wordsExtracted=true AND score>=80)
        const completedStories = enrolledStories.filter(e => 
          e.completed === true && 
          e.wordsExtracted === true && 
          (e.score || 0) >= 80
        );
        
        // Filter by story type based on isTeenKids
        const filteredStories = isTeenKids
          ? completedStories.filter(e => teenStoryIds.includes(e.storyId))
          : completedStories.filter(e => youngStoryIds.includes(e.storyId));
        
        const targetCount = isTeenKids ? 10 : 20; // YoungKids has 20 stories, TeenKids has 10
        const completedCount = Math.min(filteredStories.length, targetCount);
        return Math.round((completedCount / targetCount) * 100);
      } catch (error) {
        console.error('Error computing story-master trophy:', error);
        return 0;
      }
    }
    if (t.id === 'pronunciation-pro') {
      // For YoungKids, count unique phrases practiced (not total attempts)
      if (!isTeenKids && categoryProgress) {
        // Get total available phrases from enrolled stories
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        const completedStoryIds = enrolledStories
          .filter(e => 
            e.completed === true && 
            e.wordsExtracted === true &&
            youngStoryIds.includes(e.storyId)
          )
          .map(e => e.storyId);
        const totalPhrases = completedStoryIds.length > 0
          ? StoryWordsService.getPhrasesForStoryIdsByAge(completedStoryIds, 'young').length
          : 0;
        
        if (totalPhrases === 0) return 0;
        
        // Count unique phrases practiced from pronunciation details
        const pron = d.pronunciation || {};
        const enrolledPhrases = completedStoryIds.length > 0
          ? StoryWordsService.getPhrasesForStoryIdsByAge(completedStoryIds, 'young')
          : [];
        const enrolledPhraseSet = new Set(enrolledPhrases.map(p => p.phrase.toLowerCase()));
        
        // Count unique phrases practiced (filtered to only enrolled phrases)
        const practicedPhrases = Object.keys(pron).filter(phrase => 
          enrolledPhraseSet.has(phrase.toLowerCase())
        ).length;
        
        // Calculate average score from practiced phrases
        const practicedPhraseEntries = Object.entries(pron).filter(([phrase]) => 
          enrolledPhraseSet.has(phrase.toLowerCase())
        );
        const avg = practicedPhraseEntries.length > 0
          ? practicedPhraseEntries.reduce((sum, [, data]: any[]) => sum + (data.bestScore || 0), 0) / practicedPhraseEntries.length
          : 0;
        
        // Progress is based on unique phrases practiced out of total, and average score
        const phrasesPct = practicedPhrases / totalPhrases;
        const avgTo80Pct = Math.min(Math.max(avg, 0), 80) / 80;
        return Math.round(Math.min(phrasesPct, avgTo80Pct) * 100);
      }
      
      const pron = d.pronunciation || {};
      const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
        'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
        'ai-ethics-explorer', 'digital-security-guardian'];
      const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
        'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
        'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
        'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
        'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
      
      // Only count phrases from completed stories
      const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
      try {
        const userId = localStorage.getItem('speakbee_current_user') 
          ? JSON.parse(localStorage.getItem('speakbee_current_user')!).id || 'anonymous'
          : 'anonymous';
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        
        // Get only completed stories from the correct audience
        const completedStoryIds = enrolledStories
          .filter(e => 
            e.completed === true && 
            e.wordsExtracted === true &&
            targetStoryIds.includes(e.storyId)
          )
          .map(e => e.storyId);
        
        // If no completed stories, return 0
        if (completedStoryIds.length === 0) {
          return 0;
        }
        
        // Get phrases only from completed stories
        const phrases = StoryWordsService.getPhrasesForStoryIds(completedStoryIds);
        const storyPhrases = new Set<string>();
        phrases.forEach(p => storyPhrases.add(p.phrase.toLowerCase()));
        
        // Filter pronunciation sessions by story phrases from completed stories only
        const filteredSessions = Object.entries(pron).filter(([phrase]) => 
          storyPhrases.has(phrase.toLowerCase())
        ).map(([, data]) => data as any);
        
        const attempts = filteredSessions.reduce((s, r) => s + (r.attempts || 0), 0);
        const avg = filteredSessions.length ? (filteredSessions.reduce((s, r) => s + (r.bestScore || 0), 0) / filteredSessions.length) : 0;
        // Strict thresholds: attempts >= 100 AND avg >= 80 to unlock
        const attemptsPct = Math.min(attempts, 100) / 100; // 0..1
        const avgTo80Pct = Math.min(Math.max(avg, 0), 80) / 80; // reach 1.0 at 80
        return Math.round(Math.min(attemptsPct, avgTo80Pct) * 100);
      } catch (error) {
        console.error('Error computing pronunciation-pro trophy:', error);
        return 0;
      }
    }
    if (t.id === 'vocab-builder') {
      // For YoungKids, use category progress vocabulary_words (matches Progress snapshot)
      if (!isTeenKids && categoryProgress) {
        const uniqueWords = categoryProgress.vocabulary_words || 0;
        return Math.round((Math.min(uniqueWords, 150) / 150) * 100);
      }
      
      // Fallback: Use actual words from completed stories only, filtered by audience
      try {
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        
        const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        const completedStoryIds = enrolledStories
          .filter(e => e.completed === true && e.wordsExtracted === true)
          .map(e => e.storyId)
          .filter(id => targetStoryIds.includes(id));
        
        const words = StoryWordsService.getWordsForStoryIds(completedStoryIds);
        const uniqueWords = new Set(words.map(w => w.word.toLowerCase())).size;
        return Math.round((Math.min(uniqueWords, 150) / 150) * 100);
      } catch (error) {
        console.error('Error computing vocab-builder trophy:', error);
        return 0;
      }
    }
    if (t.id === 'super-learner') {
      const earned = earnedCount;
      return Math.round((Math.min(earned, 3) / 3) * 100);
    }
    if (t.id === 'explorer') {
      // For YoungKids, use category progress games_completed (matches Progress snapshot)
      if (!isTeenKids && categoryProgress) {
        const gamesCompleted = categoryProgress.games_completed || 0;
        // Get game points from progress details - check both mergedDetails and progress
        const games = d.games || (progress as any)?.details?.games || {};
        const points = Number(games.points || 0);
        const tried = Math.min(gamesCompleted, 5); // Cap at 5 games max
        
        const requiredGameTypes = 5;
        const gameTypesProgress = requiredGameTypes > 0 ? Math.min(tried, requiredGameTypes) / requiredGameTypes : 0;
        const pointsProgress = Math.min(points, 300) / 300;
        
        // Use average of both requirements to show progress even if one is incomplete
        // This allows progress to be visible even if points are 0 but games are played
        // But unlock still requires both: gameTypesProgress === 1 AND pointsProgress === 1
        const combinedProgress = (gameTypesProgress + pointsProgress) / 2;
        // However, for unlock check, we need both at 100%, so if showing progress for unlock,
        // we should use min, but for display we use average
        // Since this is just for progress display, use average
        return Math.round(combinedProgress * 100);
      }
      
      // Fallback for TeenKids or if category progress not available
      // Check if games data exists in audience-specific stats first
      const audienceStats = d.audienceStats || {};
      const targetAudienceStats = isTeenKids ? (audienceStats.teen || {}) : (audienceStats.young || {});
      
      // Try to get games data from audience-specific stats first, then fall back to general games data
      let games = targetAudienceStats.games;
      
      // For young kids, if no audience-specific games data exists, fall back to general games data
      if ((!games || Object.keys(games).length === 0) && !isTeenKids) {
        games = d.games;
      }
      
      // Only count if games data exists and is not empty
      if (!games || (Object.keys(games).length === 0)) {
        return 0;
      }
      
      // Only count games that were actually played (have attempts or scores), not just visited
      const tried = Array.isArray(games.types) && games.types.length > 0 ? new Set(games.types).size : 0;
      const points = Number(games.points || 0);
      
      const hasGameplay = points > 0 || games.attempts > 0 || games.sessions > 0 || (games.types && games.types.length > 0 && tried > 0);
      
      // If no games were actually played (not just visited), return 0
      if (!hasGameplay) {
        return 0;
      }
      
      const requiredGameTypes = isTeenKids ? 7 : 5;
      const gameTypesProgress = requiredGameTypes > 0 ? Math.min(tried, requiredGameTypes) / requiredGameTypes : 0;
      const pointsProgress = Math.min(points, 300) / 300;
      
      // Use minimum of both requirements since both must be met (not average)
      const combinedProgress = Math.min(gameTypesProgress, pointsProgress);
      const result = Math.round(combinedProgress * 100);
      
      return result;
    }
    return 0;
  };

  const getTrophyHint = (t: { id: string }) => {
    const d = ctx.details || {};
    
    if (t.id === 'consistency-hero') {
      // Use category progress streak for YoungKids (matches Progress snapshot)
      const streak = !isTeenKids && categoryProgress
        ? categoryProgress.total_streak || 0
        : ctx.streak || 0;
      return `Streak: ${Math.min(streak, 21)}/21 days`;
    }
    if (t.id === 'story-master') {
      // For YoungKids, use category progress stories_completed (matches Progress snapshot)
      if (!isTeenKids && categoryProgress) {
        const completedCount = Math.min(categoryProgress.stories_completed || 0, 20);
        return `Stories ≥80: ${completedCount}/20`;
      }
      
      // Fallback: Use actual completed stories from StoryWordsService
      try {
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        
        const completedStories = enrolledStories.filter(e => 
          e.completed === true && 
          e.wordsExtracted === true && 
          (e.score || 0) >= 80
        );
        
        const filteredStories = isTeenKids
          ? completedStories.filter(e => teenStoryIds.includes(e.storyId))
          : completedStories.filter(e => youngStoryIds.includes(e.storyId));
        
        const targetCount = isTeenKids ? 10 : 20; // YoungKids has 20 stories, TeenKids has 10
        const completedCount = Math.min(filteredStories.length, targetCount);
        return `Stories ≥80: ${completedCount}/${targetCount}`;
      } catch (error) {
        console.error('Error getting story-master hint:', error);
        return isTeenKids ? `Stories ≥80: 0/10` : `Stories ≥80: 0/20`;
      }
    }
    if (t.id === 'pronunciation-pro') {
      // For YoungKids, count unique phrases practiced (not total attempts)
      if (!isTeenKids && categoryProgress) {
        // Get total available phrases from enrolled stories
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        const completedStoryIds = enrolledStories
          .filter(e => 
            e.completed === true && 
            e.wordsExtracted === true &&
            youngStoryIds.includes(e.storyId)
          )
          .map(e => e.storyId);
        const totalPhrases = completedStoryIds.length > 0
          ? StoryWordsService.getPhrasesForStoryIdsByAge(completedStoryIds, 'young').length
          : 0;
        
        if (totalPhrases === 0) {
          return `Phrases: 0/0, Avg: 0%`;
        }
        
        // Count unique phrases practiced from pronunciation details
        const pron = d.pronunciation || {};
        const enrolledPhrases = StoryWordsService.getPhrasesForStoryIdsByAge(completedStoryIds, 'young');
        const enrolledPhraseSet = new Set(enrolledPhrases.map(p => p.phrase.toLowerCase()));
        
        // Count unique phrases practiced (filtered to only enrolled phrases)
        const practicedPhrases = Object.keys(pron).filter(phrase => 
          enrolledPhraseSet.has(phrase.toLowerCase())
        ).length;
        
        // Calculate average score from practiced phrases
        const practicedPhraseEntries = Object.entries(pron).filter(([phrase]) => 
          enrolledPhraseSet.has(phrase.toLowerCase())
        );
        const avg = practicedPhraseEntries.length > 0
          ? practicedPhraseEntries.reduce((sum, [, data]: any[]) => sum + (data.bestScore || 0), 0) / practicedPhraseEntries.length
          : 0;
        
        return `Phrases: ${practicedPhrases}/${totalPhrases}, Avg: ${avg.toFixed(0)}%`;
      }
      
      const pron = d.pronunciation || {};
      const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
        'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
        'ai-ethics-explorer', 'digital-security-guardian'];
      const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
        'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
        'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
        'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
        'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
      
      // Only count phrases from completed stories
      const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
      try {
        const userId = localStorage.getItem('speakbee_current_user') 
          ? JSON.parse(localStorage.getItem('speakbee_current_user')!).id || 'anonymous'
          : 'anonymous';
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        
        // Get only completed stories from the correct audience
        const completedStoryIds = enrolledStories
          .filter(e => 
            e.completed === true && 
            e.wordsExtracted === true &&
            targetStoryIds.includes(e.storyId)
          )
          .map(e => e.storyId);
        
        // If no completed stories, return 0
        if (completedStoryIds.length === 0) {
          return 'Attempts: 0/100, Avg: 0%';
        }
        
        // Get phrases only from completed stories
        const phrases = StoryWordsService.getPhrasesForStoryIds(completedStoryIds);
        const storyPhrases = new Set<string>();
        phrases.forEach(p => storyPhrases.add(p.phrase.toLowerCase()));
        
        // Filter pronunciation sessions by story phrases from completed stories only
        const filteredSessions = Object.entries(pron).filter(([phrase]) => 
          storyPhrases.has(phrase.toLowerCase())
        ).map(([, data]) => data as any);
        
        const attempts = filteredSessions.reduce((s, r) => s + (r.attempts || 0), 0);
        const avg = filteredSessions.length ? (filteredSessions.reduce((s, r) => s + (r.bestScore || 0), 0) / filteredSessions.length) : 0;
        return `Attempts: ${Math.min(attempts, 100)}/100, Avg: ${avg.toFixed(0)}%`;
      } catch (error) {
        console.error('Error getting pronunciation-pro hint:', error);
        return 'Attempts: 0/100, Avg: 0%';
      }
    }
    if (t.id === 'vocab-builder') {
      // For YoungKids, use category progress vocabulary_words (matches Progress snapshot)
      if (!isTeenKids && categoryProgress) {
        const uniqueWords = categoryProgress.vocabulary_words || 0;
        return `Words: ${Math.min(uniqueWords, 150)}/150`;
      }
      
      // Fallback: Use actual words from completed stories only, filtered by audience
      try {
        const teenStoryIds = ['mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator', 
          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert', 
          'ai-ethics-explorer', 'digital-security-guardian'];
        const youngStoryIds = ['magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer', 'enchanted-garden', 'dragons-treasure',
          'magic-school', 'ocean-explorer', 'time-machine', 'friendly-robot',
          'secret-cave', 'flying-carpet', 'lost-kingdom', 'grand-adventure'];
        
        const targetStoryIds = isTeenKids ? teenStoryIds : youngStoryIds;
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        const completedStoryIds = enrolledStories
          .filter(e => e.completed === true && e.wordsExtracted === true)
          .map(e => e.storyId)
          .filter(id => targetStoryIds.includes(id));
        
        const words = StoryWordsService.getWordsForStoryIds(completedStoryIds);
        const uniqueWords = new Set(words.map(w => w.word.toLowerCase())).size;
        return `Words: ${Math.min(uniqueWords, 150)}/150`;
      } catch (error) {
        console.error('Error getting vocab-builder hint:', error);
        return `Words: 0/150`;
      }
    }
    if (t.id === 'super-learner') {
      return `Certificates: ${Math.min(earnedCount, 3)}/3`;
    }
    if (t.id === 'explorer') {
      // For YoungKids, use category progress games_completed (matches Progress snapshot)
      if (!isTeenKids && categoryProgress) {
        const gamesCompleted = categoryProgress.games_completed || 0;
        const games = d.games || {};
        const points = Number(games.points || 0);
        const requiredGameTypes = 5;
        return `Games played: ${Math.min(gamesCompleted, requiredGameTypes)}/${requiredGameTypes}, Points: ${Math.min(points, 300)}/300`;
      }
      
      // Fallback for TeenKids or if category progress not available
      // Check if games data exists in audience-specific stats first
      const audienceStats = d.audienceStats || {};
      const targetAudienceStats = isTeenKids ? (audienceStats.teen || {}) : (audienceStats.young || {});
      
      // Try to get games data from audience-specific stats first, then fall back to general games data
      let games = targetAudienceStats.games;
      
      // For young kids, if no audience-specific games data exists, fall back to general games data
      if ((!games || Object.keys(games).length === 0) && !isTeenKids) {
        games = d.games;
      }
      
      // Only count if games data exists and is not empty
      if (!games || (Object.keys(games).length === 0)) {
        const requiredGameTypes = isTeenKids ? 7 : 5;
        return `Games played: 0/${requiredGameTypes}, Points: 0/300`;
      }
      
      // Only count games that were actually played, not just visited
      const points = Number(games.points || 0);
      const hasGameplay = points > 0 || games.attempts > 0 || games.sessions > 0 || (games.types && games.types.length > 0);
      const tried = Array.isArray(games.types) && games.types.length > 0 && hasGameplay ? new Set(games.types).size : 0;
      const requiredGameTypes = isTeenKids ? 7 : 5;
      return `Games played: ${Math.min(tried, requiredGameTypes)}/${requiredGameTypes}, Points: ${Math.min(points, 300)}/300`;
    }
    return '';
  };

  // Memoize progress and hints maps per render for performance
  const trophyProgressMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of trophySpecs) {
      map[t.id] = computeTrophyProgress(t as any);
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.streak, ctx.points, mergedDetails, earnedCount, userId, isTeenKids, trophySpecs, categoryProgress]);
  const trophyHintMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of trophySpecs) {
      map[t.id] = getTrophyHint(t as any);
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.streak, ctx.points, mergedDetails, earnedCount, userId, isTeenKids, trophySpecs, categoryProgress]);

  const defaultLayout: CertificateLayout = {
    // No templatePath needed; styled backgrounds are drawn in code
    style: 'kids',
    titleText: 'Super Star Certificate',
    subtitleText: 'Awarded to',
    namePosition: { x: 1120, y: 620 },
    datePosition: { x: 1120, y: 760 },
    nameFont: 'bold 64px system-ui, sans-serif',
    dateFont: '500 28px system-ui, sans-serif',
    nameColor: '#0f172a',
    dateColor: '#1f2937'
  };

  const layoutByCert: Record<string, CertificateLayout> = {
    'story-time-champion': {
      // Use custom template image for Story Time Champion
      templatePath: (import.meta as any).env.VITE_STORY_CERT_TEMPLATE_URL || '/story-time-champion-template.png',
      // Fine-tuned positions for your template:
      // Name - moved down a bit
      namePositionRel: { x: 0.5, y: 0.50 },
      // Issued Date - moved up and slightly to the right
      datePositionRel: { x: 0.72, y: 0.80 },
      nameFont: '700 72px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827'
    },
    'speaking-star': {
      // Use custom template image for Speaking Star
      templatePath: (import.meta as any).env.VITE_SPEAKING_STAR_TEMPLATE_URL || '/Speaking_Star_Template.png',
      // Positions tuned for the provided template
      namePositionRel: { x: 0.5, y: 0.54 },
      datePositionRel: { x: 0.70, y: 0.82 },
      nameFont: '700 72px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827'
    },
    'word-wizard': {
      // Use custom template image for Word Wizard
      templatePath: (import.meta as any).env.VITE_WORD_WIZARD_TEMPLATE_URL || '/Word Wizard_Template.png',
      // Positions tuned for the provided template
      namePositionRel: { x: 0.5, y: 0.54 },
      datePositionRel: { x: 0.70, y: 0.82 },
      nameFont: '700 72px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827'
    },
    'consistency-hero': {
      // Use custom template image for Consistency Hero
      templatePath: (import.meta as any).env.VITE_CONSISTENCY_HERO_TEMPLATE_URL || '/Consistency Hero_Template.png',
      // Positions tuned for the provided template
      namePositionRel: { x: 0.5, y: 0.54 },
      datePositionRel: { x: 0.70, y: 0.82 },
      nameFont: '700 72px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '700 28px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#111827',
      titleText: 'Consistency Hero',
    },
    // Showcase a professional look for this one
    'super-learner': {
      // Use custom template image for Super Learner
      templatePath: (import.meta as any).env.VITE_SUPER_LEARNER_TEMPLATE_URL || '/Super_Learner_Template.png',
      // Positions tuned for the provided template
      namePositionRel: { x: 0.5, y: 0.54 },
      datePositionRel: { x: 0.70, y: 0.82 },
      nameFont: '700 76px "Playfair Display", "Georgia", "Times New Roman", serif',
      dateFont: '500 26px system-ui, sans-serif',
      nameColor: '#111827',
      dateColor: '#374151'
    }
  };

  // Persist newly unlocked trophies (once per trophy)
  // Process trophy unlocks with debounce + offline queue
  useEffect(() => {
    if (activeTab !== 'trophies' || !notificationsHydrated) return;
    if (unlockDebounceRef.timer) clearTimeout(unlockDebounceRef.timer);
    unlockDebounceRef.timer = setTimeout(() => {
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        const isOnline = token && token !== 'local-token';

        const newlyUnlocked: { id: string; title: string; date: string }[] = [];
        for (const t of trophySpecs) {
          const progressPct = trophyProgressMap[t.id] ?? 0;
          if (progressPct === 100 && !reportedTrophies[t.id]) {
            newlyUnlocked.push({ id: t.id, title: t.title, date: new Date().toISOString() });
            notifyUnlock(
              'trophy',
              `trophy:${t.id}`,
              `${t.title} trophy unlocked`,
              `You just earned the ${t.title}. Keep the momentum going!`,
              t.emoji || '🏆'
            );
          }
        }

        if (newlyUnlocked.length) {
          // Update local unlocked registry with dates
          const updated = { ...reportedTrophies } as Record<string, string>;
          newlyUnlocked.forEach(item => { updated[item.id] = item.date; });
          setReportedTrophies(updated);
          try { localStorage.setItem('speakbee_unlocked_trophies_v2', JSON.stringify(updated)); } catch {}

          // Queue unlocks if offline or send immediately if online
          if (!isOnline) {
            const queued = [...pendingUnlocks, ...newlyUnlocked];
            setPendingUnlocks(queued);
            try { localStorage.setItem('speakbee_pending_trophy_unlocks', JSON.stringify(queued)); } catch {}
          } else {
            newlyUnlocked.forEach(item => {
              KidsApi.unlockTrophy(token as string, { 
                trophy_id: item.id, 
                title: item.title,
                audience: isTeenKids ? 'teen' : 'young'
              })
                .catch(() => {
                  // Keep for retry on failure
                  const queued = [...pendingUnlocks, item];
                  setPendingUnlocks(queued);
                  try { localStorage.setItem('speakbee_pending_trophy_unlocks', JSON.stringify(queued)); } catch {}
                  toast({ title: 'Will retry later', description: `${item.title} unlock will sync when online.` });
                });
            });
          }
        }
      } catch {}
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, notificationsHydrated, notifyUnlock, trophyProgressMap, trophySpecs.map(t => t.id).join('|')]);

  // Retry pending unlocks when coming online or when tab visible
  useEffect(() => {
    const handler = async () => {
      const token = localStorage.getItem('speakbee_auth_token');
      const isOnline = token && token !== 'local-token';
      if (!isOnline || pendingUnlocks.length === 0) return;
      const remaining: { id: string; title: string; date: string }[] = [];
      for (const item of pendingUnlocks) {
        try {
          await KidsApi.unlockTrophy(token as string, { 
            trophy_id: item.id, 
            title: item.title,
            audience: isTeenKids ? 'teen' : 'young'
          });
        } catch {
          remaining.push(item);
        }
      }
      setPendingUnlocks(remaining);
      try { localStorage.setItem('speakbee_pending_trophy_unlocks', JSON.stringify(remaining)); } catch {}
    };
    window.addEventListener('online', handler);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') handler(); });
    handler();
    return () => {
      window.removeEventListener('online', handler);
    };
  }, [pendingUnlocks]);

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 pb-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <main className="container mx-auto max-w-7xl px-4 pt-24 space-y-10">
        <section>
          <Card className="relative mx-auto w-full max-w-lg overflow-hidden border-none bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#74C69D] text-white shadow-xl md:max-w-none">
            <span className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-28 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardContent className="relative z-10 space-y-6 p-5 sm:space-y-8 sm:p-6 md:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-5 sm:space-y-6 lg:max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate(-1)}
                      className="rounded-full border-white/40 bg-white/15 px-4 py-2 text-white transition hover:bg-white/25"
                      type="button"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <span className="rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                      Celebrate progress
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                      {activeTab === 'badges'
                        ? 'Your badge showcase'
                        : activeTab === 'trophies'
                        ? 'Your trophy cabinet'
                        : 'Your certificates centre'}
                    </h1>
                    <p className="text-base text-white/85 md:text-lg">
                      {activeTab === 'badges'
                        ? 'Keep learning to unlock fresh badges and share them with friends and family.'
                        : activeTab === 'trophies'
                        ? 'Track high-impact milestones and celebrate mastery across skills.'
                        : 'Unlock beautifully designed certificates as you reach key learning achievements.'}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-3 sm:gap-4">
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur sm:text-left">
                    <p className="text-xs uppercase tracking-wide text-white/70">Badges</p>
                    <p className="text-2xl font-semibold">{unlockedBadges.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur sm:text-left">
                    <p className="text-xs uppercase tracking-wide text-white/70">Trophies</p>
                    <p className="text-2xl font-semibold">
                      {trophySpecs.filter((t: any) => (trophyProgressMap[t.id] ?? 0) === 100).length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/15 px-4 py-3 text-white shadow-sm backdrop-blur sm:text-left">
                    <p className="text-xs uppercase tracking-wide text-white/70">Learner level</p>
                    <p className="text-2xl font-semibold">{Math.max(1, Math.floor((ctx.points || 0) / 5000))}</p>
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-wrap items-center justify-center gap-2 rounded-3xl bg-white/10 p-2 backdrop-blur">
                <Button
                  variant={activeTab === 'certs' ? 'default' : 'ghost'}
                  className={`w-full rounded-full px-6 py-2 text-sm font-semibold transition sm:w-auto ${
                    activeTab === 'certs'
                      ? 'bg-white text-sky-600 shadow-sm hover:bg-white/90'
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setActiveTab('certs')}
                >
                  Certificates
                </Button>
                <Button
                  variant={activeTab === 'badges' ? 'default' : 'ghost'}
                  className={`w-full rounded-full px-6 py-2 text-sm font-semibold transition sm:w-auto ${
                    activeTab === 'badges'
                      ? 'bg-white text-sky-600 shadow-sm hover:bg-white/90'
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setActiveTab('badges')}
                >
                  Badges
                </Button>
                <Button
                  variant={activeTab === 'trophies' ? 'default' : 'ghost'}
                  className={`w-full rounded-full px-6 py-2 text-sm font-semibold transition sm:w-auto ${
                    activeTab === 'trophies'
                      ? 'bg-white text-sky-600 shadow-sm hover:bg-white/90'
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setActiveTab('trophies')}
                >
                  Trophies
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          {activeTab === 'certs' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Certificates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="border-2 rounded-2xl bg-white/60 dark:bg-gray-900/30 p-5 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="flex gap-2">
                  <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
            {certificates.map((spec, idx) => (
              <Card key={spec.id} className="border-2 rounded-2xl bg-white/80 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden">
                {computed[idx].eligible && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-yellow-400"></div>
                )}
                <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center ${computed[idx].eligible ? 'bg-gradient-to-br from-yellow-400 to-orange-400' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {spec.badgeSrc ? (
                        <img
                          src={spec.badgeSrc}
                          alt={`${spec.title} badge`}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl">{spec.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm sm:text-base md:text-lg font-bold text-gray-800 dark:text-white ${spec.id === 'story-time-champion' ? 'cursor-pointer hover:underline hover:text-[#FF6B6B]' : ''}`}
                        onClick={spec.id === 'story-time-champion' ? () => navigate('/kids/young') : undefined}
                      >
                        {spec.title}
                      </div>
                    </div>
                  </div>
                  {computed[idx].eligible ? (
                    <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 flex-shrink-0" />
                  ) : (
                    <Award className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{spec.description}</p>
                <div className="w-full h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      computed[idx].eligible 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                        : 'bg-gradient-to-r from-[#1B4332] to-[#74C69D]'
                    }`}
                    style={{ width: `${computed[idx].progress}%` }}
                  />
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">
                  {computed[idx].hint}
                </div>
                {computed[idx].progress > 0 && (
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
                    {computed[idx].progress}% Complete
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    aria-busy={generatingCertId === spec.id}
                    disabled={!computed[idx].eligible || loading || generatingCertId === spec.id}
                    className="rounded-xl w-full sm:w-auto"
                    onClick={async () => {
                      const certId = spec.id;
                      setGeneratingCertId(certId);
                      
                      try {
                      const userData = localStorage.getItem('speakbee_current_user');
                      const userName = userData ? (JSON.parse(userData)?.name || 'Little Learner') : 'Little Learner';
                        const userId = userData ? (JSON.parse(userData)?.id || 'anonymous') : 'anonymous';
                        const token = localStorage.getItem('speakbee_auth_token');
                        const isOnline = token && token !== 'local-token';

                        // Generate certificate PNG
                      const baseLayout = layoutByCert[spec.id] || defaultLayout;
                      const layout = baseLayout;
                      const png = await CertificatesService.generatePNG(layout, userName, new Date());

                        // Upload to storage if online and Supabase configured
                        let fileUrl: string | undefined;
                        const isSupabaseConfigured = StorageService.isSupabaseConfigured();
                        
                        if (isOnline && isSupabaseConfigured) {
                          try {
                            const uploadResult = await StorageService.uploadCertificateBlob(png, `${spec.id}-${Date.now()}.png`, userId);
                            fileUrl = uploadResult.publicUrl;
                            console.log('Certificate uploaded to storage:', fileUrl);
                          } catch (uploadError: any) {
                            console.warn('Failed to upload certificate to storage:', uploadError);
                            toast({
                              title: 'Upload Failed',
                              description: 'Certificate downloaded locally, but cloud upload failed. Please check your internet connection.',
                              variant: 'destructive',
                            });
                            // Continue with download even if upload fails
                          }
                        } else if (isOnline && !isSupabaseConfigured) {
                          console.warn('Supabase not configured - skipping certificate upload');
                          toast({
                            title: 'Cloud Storage Unavailable',
                            description: 'Certificate downloaded locally, but cloud storage is not configured.',
                          });
                        }

                        // Download PDF
                      await CertificatesService.generateAndDownloadPDF(png, `${spec.id}.pdf`);

                        // Always record certificate in database when online (even if file upload failed)
                        if (isOnline && token) {
                          try {
                            // Record certificate in database - this should always succeed even if file upload failed
                            await KidsApi.issueCertificate(token, { 
                              cert_id: spec.id, 
                              title: spec.title,
                              audience: isTeenKids ? 'teen' : 'young',
                              file_url: fileUrl || '' // Use empty string if upload failed, but still record the certificate
                            });
                            
                            console.log(`Certificate ${spec.id} recorded in database for user ${userId}`);
                            
                            toast({
                              title: 'Certificate Generated! 🎉',
                              description: fileUrl 
                                ? 'Your certificate has been downloaded and saved to the cloud.'
                                : 'Your certificate has been downloaded and recorded.',
                            });
                          } catch (apiError: any) {
                            console.error('Failed to record certificate in database:', apiError);
                            
                            // Don't rollback file upload - the file might still be useful
                            // Just log the error and inform the user
                            toast({
                              title: 'Certificate Downloaded',
                              description: 'Certificate downloaded, but could not be saved to your account. Please try again or contact support.',
                              variant: 'destructive',
                            });
                          }
                        } else if (!isOnline) {
                          toast({
                            title: 'Certificate Downloaded! 📄',
                            description: 'Sign in to save your certificate to the cloud.',
                          });
                        } else {
                          toast({
                            title: 'Certificate Downloaded! 📄',
                            description: 'Please sign in to record your certificate.',
                          });
                        }
                      } catch (error: any) {
                        console.error('Certificate generation failed:', error);
                        toast({
                          title: 'Generation Failed',
                          description: error.message || 'Failed to generate certificate. Please try again.',
                          variant: 'destructive',
                        });
                      } finally {
                        setGeneratingCertId(null);
                      }
                    }}
                  >
                    {generatingCertId === spec.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                    <Download className="w-4 h-4 mr-2" /> Download
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl w-full sm:w-auto"
                    onClick={() => navigate(isTeenKids ? '/kids/teen' : '/kids/young')}
                  >
                     Improve Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
          )}
        </section>

        <section>
          {activeTab === 'badges' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {unlockedBadges.map((b: any, i: number) => (
              <Card key={`${b.id || i}`} className="border-2 rounded-xl bg-white/80 dark:bg-gray-900/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div className="shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-2 sm:p-3 flex items-center justify-center border-2 border-yellow-200 dark:border-yellow-700">
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={b.title || b.name || 'Badge'}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-3xl sm:text-4xl">🏅</div>
                    )}
                    </div>
                    <div className="min-w-0 flex-1">
                    <div className="text-[10px] tracking-widest font-bold text-[#FF6B6B] dark:text-[#FF8A8A] uppercase mb-1.5">Badge Earned</div>
                    <div
                      className={`text-sm sm:text-base md:text-lg font-bold text-gray-800 dark:text-white leading-snug line-clamp-2 mb-2 ${(b.title || b.name) === 'Story Time Champion' ? 'cursor-pointer hover:underline hover:text-[#FF6B6B]' : ''}`}
                      onClick={(b.title || b.name) === 'Story Time Champion' || (b.title || b.name) === 'Advanced Story Champion' ? () => navigate(isTeenKids ? '/kids/teen' : '/kids/young') : undefined}
                    >
                      {b.title || b.name || 'Badge'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {b.unlocked_at ? (
                        <>Earned on {new Date(b.unlocked_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</>
                      ) : b.unlockedAt ? (
                        <>Earned on {new Date(b.unlockedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</>
                      ) : b.date ? (
                        <>Earned on {new Date(b.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</>
                      ) : (
                        <>Earned recently</>
                      )}
                    </div>
                    </div>
                  </div>
                  <div className="ml-2 flex items-start gap-2">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-full"
                      title="Share"
                      onClick={async () => {
                        const shareUrl = b.image || window.location.href;
                        const shareTitle = b.title || b.name || 'Badge';
                        try {
                          if (navigator.share) {
                            await navigator.share({ title: shareTitle, url: shareUrl });
                          } else if (navigator.clipboard) {
                            await navigator.clipboard.writeText(shareUrl);
                            toast({ title: 'Link copied', description: 'Badge link copied to clipboard.' });
                          }
                        } catch (_) {
                          try {
                            await navigator.clipboard.writeText(shareUrl);
                            toast({ title: 'Link copied', description: 'Badge link copied to clipboard.' });
                          } catch {}
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-full"
                      title="Print"
                      onClick={() => {
                        const img = b.image;
                        if (!img) {
                          window.print();
                          return;
                        }
                        const w = window.open('', '_blank', 'noopener,noreferrer,width=800,height=600');
                        if (!w) return;
                        w.document.write(`<!doctype html><html><head><title>Print Badge</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;background:#fff}</style></head><body><img src="${img}" style="max-width:90vw;max-height:90vh;" onload="window.focus();window.print();" /></body></html>`);
                        w.document.close();
                      }}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              </Card>
            ))}
          {lockedBadges.length === 0 && unlockedBadges.length === 0 && (
            <div className="col-span-full">
              <Card className="border-2 border-yellow-200 dark:border-yellow-700 bg-yellow-50/40 dark:bg-yellow-900/10 backdrop-blur-sm shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">🏅</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  No Badges Yet!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Start learning to unlock your first badge!
                </p>
                <Button
                  onClick={() => navigate(isTeenKids ? '/kids/teen' : '/kids/young')}
                  className="bg-gradient-to-r from-[#1B4332] to-[#74C69D] hover:from-[#74C69D] hover:to-[#1B4332] text-white font-bold py-3 px-6 rounded-xl"
                >
                  Go to Learning Zone →
                </Button>
              </Card>
            </div>
          )}
          </div>
        </div>
          )}

        </section>
        <section>
          {activeTab === 'trophies' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Trophies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {trophySpecs.map((t: any) => {
              const progress = trophyProgressMap[t.id] ?? 0;
              // For Explorer Trophy, require both games and points to be 100%
              let isUnlocked = progress === 100;
              if (t.id === 'explorer' && !isTeenKids && categoryProgress) {
                const gamesCompleted = categoryProgress.games_completed || 0;
                const games = ctx.details?.games || (progress as any)?.details?.games || {};
                const points = Number(games.points || 0);
                const tried = Math.min(gamesCompleted, 5);
                isUnlocked = tried >= 5 && points >= 300;
              }
              return (
                <Card key={t.id} className="border-2 rounded-xl bg-white/80 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden">
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-amber-400"></div>
                  )}
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className={`rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-gradient-to-br from-amber-400 to-orange-400' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          {t.badgeSrc ? (
                            <img src={t.badgeSrc} alt={`${t.title} trophy badge`} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" onError={(e) => { const el = e.currentTarget as HTMLImageElement; if (el.src.endsWith('/Consistency_badge.png')) el.src = '/Consistancy_badge.png'; }} />
                          ) : (
                            <span className="text-2xl sm:text-3xl">{t.emoji}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm sm:text-base md:text-lg font-bold text-gray-800 dark:text-white leading-snug ${t.id === 'story-master' ? 'cursor-pointer hover:underline hover:text-[#FF6B6B]' : ''}`}
                            onClick={t.id === 'story-master' ? () => navigate(isTeenKids ? '/kids/teen' : '/kids/young') : undefined}
                          >
                            {t.title}
                          </div>
                        </div>
                      </div>
                      {isUnlocked ? (
                        <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500 flex-shrink-0" aria-label="Unlocked" />
                      ) : (
                        <Award className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400 flex-shrink-0" aria-label="Locked" />
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{t.desc}</div>
                    <div className="w-full h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3 shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUnlocked 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-400' 
                            : 'bg-gradient-to-r from-amber-400 to-orange-500'
                        }`} 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      {trophyHintMap[t.id]}
                    </div>
                    {progress > 0 && (
                      <div className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
                        {progress}% Complete
                      </div>
                    )}
                    {reportedTrophies[t.id] && (
                      <div className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-semibold mt-2 flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        <span>Unlocked on {new Date(reportedTrophies[t.id]).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full"
                    title="Share"
                    onClick={async () => {
                      const shareUrl = t.badgeSrc || window.location.href;
                      try {
                        if (navigator.share) {
                          await navigator.share({ title: t.title, url: shareUrl });
                        } else if (navigator.clipboard) {
                          await navigator.clipboard.writeText(shareUrl);
                          toast({ title: 'Link copied', description: 'Trophy link copied to clipboard.' });
                        }
                      } catch (_) {
                        try {
                          await navigator.clipboard.writeText(shareUrl);
                          toast({ title: 'Link copied', description: 'Trophy link copied to clipboard.' });
                        } catch {}
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-full"
                    title="Print"
                    onClick={() => {
                      const img = t.badgeSrc;
                      if (!img) {
                        window.print();
                        return;
                      }
                      const w = window.open('', '_blank', 'noopener,noreferrer,width=800,height=600');
                      if (!w) return;
                      w.document.write(`<!doctype html><html><head><title>Print Trophy</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;background:#fff}</style></head><body><img src="${img}" style="max-width:90vw;max-height:90vh;" onload="window.focus();window.print();" /></body></html>`);
                      w.document.close();
                    }}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  {t.id === 'story-master' && (
                    <Button variant="outline" className="h-8 px-3 rounded-xl ml-auto" onClick={() => navigate(isTeenKids ? '/kids/teen' : '/kids/young')}>
                      {isTeenKids ? 'Go to Teen Stories' : 'Go to Young Stories'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
              );
            })}
          </div>
        </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CertificatesPage;


