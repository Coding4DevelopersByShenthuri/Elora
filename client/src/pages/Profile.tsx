
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  BookOpen,
  CheckCheck,
  Clock,
  ExternalLink,
  Flame,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Undo2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import ProjectRoadmap from '@/components/ProjectRoadmap';
import { ProgressTracker, type LearningInsight, type WeeklyStats } from '@/services/ProgressTracker';
import {
  AchievementSystem,
  type Achievement,
  type UserProgress,
} from '@/services/AchievementSystem';
import UserNotificationsService, { type UserNotification } from '@/services/UserNotificationsService';
import type { UserProfile } from '@/lib/types';
import UserNotificationBell from '@/components/common/UserNotificationBell';
import { AnimatedTransition } from '@/components/common/AnimatedTransition';
import { useAnimateIn } from '@/lib/animations';
import KidsProgressService from '@/services/KidsProgressService';
import KidsApi from '@/services/KidsApi';
import TeenApi from '@/services/TeenApi';
import StoryWordsService from '@/services/StoryWordsService';
import MultiCategoryProgressService, { type CategoryProgress, type AggregatedProgress } from '@/services/MultiCategoryProgressService';
import LearningPathRecommendationService, { type CategoryRecommendation } from '@/services/LearningPathRecommendationService';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import RealTimeDataService from '@/services/RealTimeDataService';

const FALLBACK_PROFILE: UserProfile = {
  name: 'Learner',
  email: 'learner@example.com',
  description:
    'Curious explorer of languages and technology. Building confident communication skills step by step.',
  links: [
    { title: 'Learning Journal', url: 'https://elora.app/blog' },
    { title: 'Community Hub', url: 'https://elora.app/community' },
  ],
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...FALLBACK_PROFILE,
    name: user?.name || user?.username || FALLBACK_PROFILE.name,
    email: user?.email || FALLBACK_PROFILE.email,
  }));
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);
  const [tempLink, setTempLink] = useState({ title: '', url: '' });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notifications' | 'journey'>(
    'overview'
  );

  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsSyncing, setNotificationsSyncing] = useState(false);
  const [kidsStats, setKidsStats] = useState({
    points: 0,
    streak: 0,
    storiesCompleted: 0,
    vocabularyWords: 0,
    pronunciationAttempts: 0,
    hasData: false,
  });

  const [teenKidsStats, setTeenKidsStats] = useState({
    points: 0,
    streak: 0,
    storiesCompleted: 0,
    vocabularyWords: 0,
    pronunciationAttempts: 0,
    gamesCompleted: 0,
    hasData: false,
  });

  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
  const [aggregatedProgress, setAggregatedProgress] = useState<AggregatedProgress | null>(null);
  const [recommendedCategory, setRecommendedCategory] = useState<CategoryRecommendation | null>(null);
  const [loadingCategoryProgress, setLoadingCategoryProgress] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfile((prev) => ({
      ...prev,
      name: user.name || prev.name,
      email: user.email || prev.email,
    }));
  }, [user]);

  const loadProgress = useCallback(async () => {
    if (!user?.id) return;
    setLoadingProgress(true);
    try {
      const userId = String(user.id);
      
      // Clear ALL caches to ensure fresh data, especially for practice time
      // This is critical to get the latest PracticeSession data (172 mins) instead of cached estimates (165 mins)
      MultiCategoryProgressService.clearCache();
      RealTimeDataService.clearCache('aggregated_progress'); // Clear real-time cache too
      RealTimeDataService.clearCache('category_progress'); // Clear category cache too
      console.log('[Profile] 🧹 Cleared all caches to ensure fresh practice time data (172 mins, not 165 mins)');
      
      // Get data from all sources - force refresh aggregated progress to get latest PracticeSession data
      // Force refresh (true) ensures we bypass cache and get fresh data from backend
      const [progressData, weeklyData, insightsData, aggregated] = await Promise.all([
        ProgressTracker.getUserProgress(userId),
        ProgressTracker.getWeeklyStats(userId),
        ProgressTracker.getLearningInsights(userId),
        MultiCategoryProgressService.getAggregatedProgress(userId, true).catch((err) => {
          console.error('[Profile] Failed to load aggregated progress:', err);
          return null;
        }),
      ]);
      
      // Log the practice time to verify it's correct
      if (aggregated) {
        console.log('[Profile] Aggregated progress loaded with practice time:', aggregated.total_practice_time, 'minutes');
      }

      // If we have aggregated progress, use it to enhance weekly stats
      let enhancedWeeklyData = weeklyData;
      if (aggregated) {
        console.log('[Profile] Loaded aggregated progress in loadProgress:', {
          total_practice_time: aggregated.total_practice_time,
          total_points: aggregated.total_points
        });
        // Calculate weekly stats from all categories
        const now = new Date();
        const weekStart = new Date(now.getTime() - 7 * 86400000);
        
        // Get all category progress to calculate weekly activity
        const allCategories = await MultiCategoryProgressService.getAllCategoriesProgress(userId, false).catch(() => []);
        
        // Calculate weekly activity from category last_activity dates
        const activeCategories = allCategories.filter(cat => {
          if (!cat.last_activity) return false;
          const lastActivity = new Date(cat.last_activity);
          return lastActivity >= weekStart && lastActivity <= now;
        });
        
        enhancedWeeklyData = {
          ...weeklyData,
          totalLessons: aggregated.total_lessons_completed || weeklyData.totalLessons,
          totalTime: aggregated.total_practice_time || weeklyData.totalTime,
          totalPoints: aggregated.total_points || weeklyData.totalPoints,
          averageScore: aggregated.average_score || weeklyData.averageScore,
          streak: aggregated.total_streak || weeklyData.streak,
          daysActive: activeCategories.length > 0 ? activeCategories.length : weeklyData.daysActive,
        };
      }

      AchievementSystem.checkAchievements(progressData);
      const achievementList = AchievementSystem.getAllAchievements();

      setUserProgress(progressData);
      setWeeklyStats(enhancedWeeklyData);
      setInsights(insightsData);
      setAchievements(achievementList);
      
      // Also update aggregatedProgress state if we got it (ensures practice time is updated)
      // CRITICAL: This ensures the profile page shows 172 mins (from PracticeSession) not 165 mins (from CategoryProgress)
      if (aggregated) {
        console.log('[Profile] ✅ Setting aggregatedProgress state with practice time:', aggregated.total_practice_time, 'minutes');
        console.log('[Profile] ✅ This should match admin portal: 172 minutes');
        if (aggregated.total_practice_time !== 172) {
          console.warn('[Profile] ⚠️ WARNING: Practice time mismatch! Expected 172, got:', aggregated.total_practice_time);
        }
        setAggregatedProgress(aggregated);
      } else {
        console.warn('[Profile] ⚠️ Aggregated progress is null - profile page may show incorrect practice time');
      }
    } finally {
      setLoadingProgress(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Real-time notifications
  const {
    data: realTimeNotifications,
    refresh: refreshNotificationsRealTime,
  } = useRealTimeData<UserNotification[]>('notifications', {
    enabled: !!user?.id,
    immediate: true,
  });

  useEffect(() => {
    if (realTimeNotifications) {
      setNotifications(realTimeNotifications);
      setLoadingNotifications(false);
    }
  }, [realTimeNotifications]);

  const refreshNotifications = async () => {
    if (!user?.id) return;
    setNotificationsSyncing(true);
    try {
      await refreshNotificationsRealTime();
    } finally {
      setNotificationsSyncing(false);
    }
  };

  useEffect(() => {
    if (location.hash === '#notifications') {
      setActiveTab('notifications');
      const timeout = setTimeout(() => {
        document.getElementById('profile-notifications')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [location.hash]);

  // Use aggregated progress from all categories if available, otherwise calculate from categoryProgress or fallback to old data
  const aggregatedPoints = useMemo(
    () => {
      // First try aggregated progress (this should already sum all categories)
      // Use it if it exists, even if 0 (valid data)
      if (aggregatedProgress?.total_points !== undefined) {
        console.log('[Profile] Using aggregated progress points:', aggregatedProgress.total_points);
        return aggregatedProgress.total_points;
      }
      // Then try calculating from categoryProgress array (sum all categories)
      if (categoryProgress.length > 0) {
        const total = categoryProgress.reduce((sum, cat) => sum + (cat.total_points || 0), 0);
        console.log('[Profile] Calculated points from categoryProgress:', total, 'from', categoryProgress.length, 'categories');
        return total; // Return even if 0, as it's valid aggregated data
      }
      // Fallback to old data sources - SUM all categories instead of taking max
      // This ensures we combine Young Kids + Teen Kids + other categories
      const fallbackTotal = 
        (kidsStats.points || 0) +
        (teenKidsStats.points || 0) +
        (userProgress?.totalPoints ?? 0) +
        (user?.profile?.points ?? 0);
      console.log('[Profile] Using fallback points:', fallbackTotal, {
        kids: kidsStats.points,
        teen: teenKidsStats.points,
        userProgress: userProgress?.totalPoints,
        profile: user?.profile?.points
      });
      return fallbackTotal;
    },
    [aggregatedProgress?.total_points, categoryProgress, kidsStats.points, teenKidsStats.points, user?.profile?.points, userProgress?.totalPoints]
  );

  const aggregatedStreak = useMemo(
    () => {
      // First try aggregated progress (streak is max across categories, not sum)
      // Use it if it exists, even if 0 (valid data)
      if (aggregatedProgress?.total_streak !== undefined) {
        return aggregatedProgress.total_streak;
      }
      // Then try calculating from categoryProgress array (take max, not sum)
      if (categoryProgress.length > 0) {
        const maxStreak = Math.max(...categoryProgress.map(cat => cat.total_streak || 0), 0);
        return maxStreak; // Return even if 0, as it's valid aggregated data
      }
      // Fallback to old data sources - take max (streak is per category, not combined)
      return Math.max(
        kidsStats.streak || 0,
        teenKidsStats.streak || 0,
        userProgress?.currentStreak ?? 0,
        user?.profile?.streak ?? 0,
        0
      );
    },
    [aggregatedProgress?.total_streak, categoryProgress, kidsStats.streak, teenKidsStats.streak, user?.profile?.streak, userProgress?.currentStreak]
  );

  const aggregatedLessons = useMemo(
    () => {
      // First try aggregated progress (this should already sum all categories)
      // Use it if it exists, even if 0 (valid data)
      if (aggregatedProgress?.total_lessons_completed !== undefined) {
        return aggregatedProgress.total_lessons_completed;
      }
      // Then try calculating from categoryProgress array (sum all categories)
      if (categoryProgress.length > 0) {
        const total = categoryProgress.reduce((sum, cat) => {
          // For kids categories, use stories_completed; for others use lessons_completed
          const lessons = cat.category.includes('kids') 
            ? (cat.stories_completed || cat.lessons_completed || 0)
            : (cat.lessons_completed || 0);
          return sum + lessons;
        }, 0);
        return total; // Return even if 0, as it's valid aggregated data
      }
      // Fallback to old data sources - SUM all categories instead of taking max
      // This ensures we combine Young Kids stories + Teen Kids stories + other lessons
      const fallbackTotal = 
        (kidsStats.storiesCompleted || 0) +
        (teenKidsStats.storiesCompleted || 0) +
        (userProgress?.lessonsCompleted ?? 0);
      return fallbackTotal;
    },
    [aggregatedProgress?.total_lessons_completed, categoryProgress, kidsStats.storiesCompleted, teenKidsStats.storiesCompleted, userProgress?.lessonsCompleted]
  );

  // Real-time category progress updates (moved before aggregatedPracticeTime to fix lint error)
  // CRITICAL: Force refresh to bypass cache and get fresh PracticeSession data (172 mins)
  const {
    data: realTimeCategories,
    loading: loadingCategories,
  } = useRealTimeData<CategoryProgress[]>('category_progress', {
    enabled: !!user?.id,
    immediate: true,
  });

  const {
    data: realTimeAggregated,
    loading: loadingAggregated,
    refresh: refreshAggregated,
  } = useRealTimeData<AggregatedProgress>('aggregated_progress', {
    enabled: !!user?.id,
    immediate: true,
  });

  // Force refresh aggregated progress on mount to ensure we get 172 mins, not cached 165 mins
  useEffect(() => {
    if (user?.id && !loadingAggregated) {
      console.log('[Profile] 🔄 Force refreshing aggregated progress to get 172 mins (not cached 165 mins)');
      refreshAggregated().then(() => {
        console.log('[Profile] ✅ Aggregated progress refreshed');
      }).catch((err) => {
        console.error('[Profile] ❌ Failed to refresh aggregated progress:', err);
      });
    }
  }, [user?.id]); // Only on mount, not on every render

  const aggregatedPracticeTime = useMemo(
    () => {
      // PRIORITY 1: Use aggregated progress from backend (uses PracticeSession table)
      // This is the source of truth - it uses actual PracticeSession data (172 mins), not estimates (165 mins)
      // CRITICAL: Always check aggregatedProgress first, even if it's 0 (valid data)
      if (aggregatedProgress !== null && aggregatedProgress !== undefined) {
        const practiceTime = aggregatedProgress.total_practice_time ?? 0;
        console.log('[Profile] ✅ Using aggregated progress practice time (from PracticeSession table):', practiceTime, 'minutes');
        console.log('[Profile] ✅ This matches admin portal value (172 minutes)');
        return practiceTime;
      }
      
      // PRIORITY 2: If aggregatedProgress is still loading, wait for it
      // CRITICAL: Don't show categoryProgress estimates (165 mins) while aggregatedProgress (172 mins) is loading
      if (loadingAggregated || loadingCategoryProgress) {
        console.log('[Profile] ⏳ Waiting for aggregated progress to load (will show 172 mins, not 165 mins)...');
        // Return undefined/null to show loading state, not 0 (which might be confused with no data)
        return undefined;
      }
      
      // PRIORITY 3: Only use categoryProgress as fallback if aggregatedProgress completely failed to load
      // WARNING: categoryProgress uses ESTIMATED times (165 mins), which is INACCURATE
      // This should only happen if the backend endpoint fails
      if (categoryProgress.length > 0 && !loadingAggregated) {
        const total = categoryProgress.reduce((sum, cat) => {
          const time = cat.practice_time_minutes || 0;
          return sum + time;
        }, 0);
        console.warn('[Profile] ⚠️ WARNING: Using ESTIMATED practice time from categoryProgress:', total, 'minutes');
        console.warn('[Profile] ⚠️ This is INACCURATE. Should be 172 minutes from PracticeSession table.');
        console.warn('[Profile] ⚠️ AggregatedProgress endpoint may have failed. Check backend logs.');
        return total;
      }
      
      // PRIORITY 4: Final fallback
      const fallbackTime = userProgress?.practiceTime ?? 0;
      console.log('[Profile] Using fallback practice time:', fallbackTime);
      return fallbackTime;
    },
    [aggregatedProgress, loadingAggregated, loadingCategoryProgress, categoryProgress, userProgress?.practiceTime]
  );

  const levelProgress = useMemo(() => {
    return AchievementSystem.getLevelProgress(aggregatedPoints);
  }, [aggregatedPoints]);

  const unlockedAchievements = useMemo(
    () => achievements.filter((achievement) => achievement.unlocked),
    [achievements]
  );

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isRead),
    [notifications]
  );
  
  const handleEditProfile = () => {
    setTempProfile({ ...profile });
    setIsEditOpen(true);
  };
  
  const handleSaveProfile = () => {
    setProfile({ ...tempProfile });
    setIsEditOpen(false);
  };
  
  const handleAddLink = () => {
    if (!tempLink.title || !tempLink.url) return;
    setTempProfile((prev) => ({
      ...prev,
      links: [...(prev.links || []), { ...tempLink }],
    }));
      setTempLink({ title: '', url: '' });
  };
  
  const handleRemoveLink = (index: number) => {
    setTempProfile((prev) => {
      const updated = [...(prev.links || [])];
      updated.splice(index, 1);
      return { ...prev, links: updated };
    });
  };

  const markAllNotificationsRead = async () => {
    if (!user?.id) return;
    setNotificationsSyncing(true);
    try {
      const updated = await UserNotificationsService.markAllRead(user.id);
      setNotifications(updated);
    } finally {
      setNotificationsSyncing(false);
    }
  };

  // refreshNotifications is now defined above using real-time service

  const toggleNotificationRead = async (notification: UserNotification) => {
    if (!user?.id) return;
    const updated = await UserNotificationsService.markRead(
      user.id,
      notification.id,
      !notification.isRead
    );
    setNotifications(updated);
  };

  const deleteNotification = async (notification: UserNotification) => {
    if (!user?.id) return;
    const updated = await UserNotificationsService.delete(user.id, notification.id);
    setNotifications(updated);
  };

  const stats = [
    {
      label: 'Sparkle Points',
      value: (aggregatedPoints ?? 0).toLocaleString(),
      description: `Total points earned across all ${aggregatedProgress?.categories_count || categoryProgress.length || 1} learning ${(aggregatedProgress?.categories_count || categoryProgress.length || 1) === 1 ? 'category' : 'categories'}.`,
      icon: <Trophy className="h-5 w-5 text-amber-500" />,
    },
    {
      label: 'Daily Streak',
      value: `${aggregatedStreak ?? 0} day${(aggregatedStreak ?? 0) === 1 ? '' : 's'}`,
      description: 'Show up every day to keep the streak alive.',
      icon: <Flame className="h-5 w-5 text-orange-500" />,
    },
    {
      label: 'Practice Time',
      value: aggregatedPracticeTime !== undefined ? `${Math.round(aggregatedPracticeTime)} mins` : 'Loading...',
      description: aggregatedPracticeTime !== undefined 
        ? 'Dedicated minutes spent across all learning categories (from PracticeSession table).'
        : 'Loading practice time from server...',
      icon: <Clock className="h-5 w-5 text-sky-500" />,
    },
    {
      label: 'Lessons Completed',
      value: (aggregatedLessons ?? 0).toString(),
      description: `Completed across ${aggregatedProgress?.categories_count || categoryProgress.length || 1} learning ${(aggregatedProgress?.categories_count || categoryProgress.length || 1) === 1 ? 'category' : 'categories'}.`,
      icon: <BookOpen className="h-5 w-5 text-emerald-500" />,
    },
  ];
  
  const showContent = useAnimateIn(false, 300);

  // Update state when real-time data arrives
  useEffect(() => {
    if (realTimeCategories) {
      const validCategories = Array.isArray(realTimeCategories) ? realTimeCategories : [];
      setCategoryProgress(validCategories);
      setLoadingCategoryProgress(false);
    }
  }, [realTimeCategories]);

  useEffect(() => {
    if (realTimeAggregated) {
      console.log('[Profile] ✅ Real-time aggregated progress updated:', {
        total_practice_time: realTimeAggregated.total_practice_time,
        total_points: realTimeAggregated.total_points
      });
      if (realTimeAggregated.total_practice_time === 172) {
        console.log('[Profile] ✅ Practice time is correct: 172 minutes (matches admin portal)');
      } else {
        console.warn('[Profile] ⚠️ Practice time mismatch! Got:', realTimeAggregated.total_practice_time, 'Expected: 172');
      }
      setAggregatedProgress(realTimeAggregated);
    }
  }, [realTimeAggregated]);

  // Load recommendation (not real-time, only on mount)
  useEffect(() => {
    if (!user?.id) return;

    const loadRecommendation = async () => {
      try {
        const userId = String(user.id);
        const recommendation = await LearningPathRecommendationService.getRecommendedCategory(userId).catch(() => null);
        setRecommendedCategory(recommendation);
      } catch (error) {
        console.error('Error loading recommendation:', error);
      }
    };

    loadRecommendation();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const loadKidsProgress = async () => {
      try {
        const userId = String(user.id);
        const token = localStorage.getItem('speakbee_auth_token');

        // Get enrolled stories directly from StoryWordsService (most reliable source)
        const enrolledStories = StoryWordsService.getEnrolledStories(userId);
        // Filter only Young Kids stories (first 10 story IDs)
        const youngKidsStoryIds = [
          'magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
          'rainbow-castle', 'jungle-explorer'
        ];
        const youngKidsEnrolled = enrolledStories.filter(e => 
          youngKidsStoryIds.includes(e.storyId) && e.completed
        );
        const storiesCompleted = youngKidsEnrolled.length;

        let serverProgress: any = null;
        if (token && token !== 'local-token') {
          try {
            serverProgress = await KidsApi.getProgress(token);
          } catch {
            serverProgress = null;
          }
        }

        let localProgress: any = null;
        try {
          localProgress = await KidsProgressService.get(userId);
        } catch {
          localProgress = null;
        }

        const serverDetails = (serverProgress && (serverProgress as any).details) || {};
        const localDetails =
          (localProgress && (localProgress as any).details) || {
            readAloud: localProgress?.readAloud,
            vocabulary: localProgress?.vocabulary,
            pronunciation: localProgress?.pronunciation,
          };

        const mergedPronunciation = {
          ...(localDetails?.pronunciation || localProgress?.pronunciation || {}),
          ...(serverDetails?.pronunciation || {}),
        };
        const mergedVocabulary = {
          ...(localDetails?.vocabulary || localProgress?.vocabulary || {}),
          ...(serverDetails?.vocabulary || {}),
        };
        const mergedReadAloud = {
          ...(localDetails?.readAloud || localProgress?.readAloud || {}),
          ...(serverDetails?.readAloud || {}),
        };

        const pronunciationAttempts = Object.values(mergedPronunciation).reduce<number>(
          (total, current: any) => total + Number(current?.attempts ?? current?.sessions ?? 0),
          0
        );
        const vocabularyWords = Object.keys(mergedVocabulary).length;
        const readAloudEntries = Object.keys(mergedReadAloud).length;

        const serverPoints = typeof serverProgress?.points === 'number' ? serverProgress.points : 0;
        const localPoints = typeof localProgress?.points === 'number' ? localProgress.points : 0;
        const mergedPoints = Math.max(serverPoints, localPoints);

        const serverStreak = typeof serverProgress?.streak === 'number' ? serverProgress.streak : 0;
        const localStreak = typeof localProgress?.streak === 'number' ? localProgress.streak : 0;
        const mergedStreak = Math.max(serverStreak, localStreak);

        if (!cancelled) {
          setKidsStats({
            points: mergedPoints,
            streak: mergedStreak,
            storiesCompleted, // Use actual enrolled stories count
            vocabularyWords,
            pronunciationAttempts: pronunciationAttempts || readAloudEntries,
            hasData:
              mergedPoints > 0 ||
              mergedStreak > 0 ||
              storiesCompleted > 0 ||
              vocabularyWords > 0 ||
              pronunciationAttempts > 0 ||
              readAloudEntries > 0,
          });
        }
      } catch {
        if (!cancelled) {
          setKidsStats((prev) => ({
            ...prev,
            hasData: prev.hasData,
          }));
        }
      }
    };

    loadKidsProgress();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    const loadTeenKidsProgress = async () => {
      try {
        const token = localStorage.getItem('speakbee_auth_token');

        let serverProgress: any = null;
        if (token && token !== 'local-token') {
          try {
            serverProgress = await TeenApi.getDashboard(token);
          } catch {
            serverProgress = null;
          }
        }

        if (!cancelled && serverProgress) {
          const points = typeof serverProgress.points === 'number' ? serverProgress.points : 0;
          const streak = typeof serverProgress.streak === 'number' ? serverProgress.streak : 0;
          const completedStoryIds = Array.isArray(serverProgress.completed_story_ids) 
            ? serverProgress.completed_story_ids 
            : [];
          const vocabularyAttempts = typeof serverProgress.vocabulary_attempts === 'number' 
            ? serverProgress.vocabulary_attempts 
            : 0;
          const pronunciationAttempts = typeof serverProgress.pronunciation_attempts === 'number' 
            ? serverProgress.pronunciation_attempts 
            : 0;
          const gamesAttempts = typeof serverProgress.games_attempts === 'number' 
            ? serverProgress.games_attempts 
            : 0;

          setTeenKidsStats({
            points,
            streak,
            storiesCompleted: completedStoryIds.length,
            vocabularyWords: vocabularyAttempts,
            pronunciationAttempts,
            gamesCompleted: gamesAttempts,
            hasData: points > 0 || streak > 0 || completedStoryIds.length > 0 || vocabularyAttempts > 0 || pronunciationAttempts > 0 || gamesAttempts > 0,
          });
        }
      } catch {
        if (!cancelled) {
          setTeenKidsStats((prev) => ({
            ...prev,
            hasData: prev.hasData,
          }));
        }
      }
    };

    loadTeenKidsProgress();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);
  
  return (
    <div className="min-h-screen bg-muted/20 pb-16 pt-24">
      <AnimatedTransition show={showContent} animation="slide-up">
        <main className="container mx-auto max-w-6xl px-4 space-y-10">
        <section>
          <Card className="relative overflow-hidden border-none bg-transparent text-white shadow-xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#1b4332,#2d6a4f,#52b788)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(82,183,136,0.28),transparent_60%)]" />
            <CardContent className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex w-full flex-col gap-6 md:flex-row md:items-center">
                  <Avatar className="h-20 w-20 border-4 border-white/60 shadow-lg md:h-24 md:w-24">
                    <AvatarFallback className="bg-white/20 text-2xl font-semibold text-white">
                      {profile.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-4 text-left">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-semibold leading-tight text-[#f6fff7] sm:text-4xl dark:text-white">
                        {profile.name}
                      </h1>
                      <Badge className="bg-white/20 text-white hover:bg-white/25">
                        Level {levelProgress.currentLevel}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-emerald-50/85 dark:text-white/85">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {profile.email}
                      </span>
                      <span className="flex items-center gap-2">
                        
                        Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="max-w-2xl text-sm text-emerald-50/90 dark:text-white/90">{profile.description}</p>
                    {(profile.links || []).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {profile.links?.map((link, index) => (
                          <Button
                            key={`${link.title}-${index}`}
                            variant="secondary"
                            size="sm"
                            className="bg-white/15 text-white hover:bg-white/20"
                            onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            {link.title}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <UserNotificationBell />
                  <Button
                    variant="secondary"
                    className="w-full bg-white text-sky-600 transition hover:bg-white/90 sm:w-auto"
                    onClick={handleEditProfile}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 bg-white/10 text-white transition hover:bg-white/20 sm:w-auto"
                    onClick={() => navigate('/my-certificates')}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    View certificates
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 bg-white/10 text-white transition hover:bg-white/20 sm:w-auto"
                    onClick={() => navigate('/kids/young')}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Continue learning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Stats Cards - Always show, even if data is loading or zero */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(loadingCategoryProgress || loadingCategories || loadingAggregated) ? (
            // Show loading state
            Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={`loading-${index}`}
                className="shadow-sm"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-foreground">...</div>
                  <p className="mt-1 text-xs text-muted-foreground">Loading your progress...</p>
                </CardContent>
              </Card>
            ))
          ) : (
            // Show stats
            stats.map((stat) => (
              <Card
                key={stat.label}
                className="shadow-sm transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview" className="whitespace-nowrap">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="whitespace-nowrap">
              Activity
            </TabsTrigger>
            <TabsTrigger value="notifications" className="whitespace-nowrap">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="journey" className="whitespace-nowrap">
              Journey
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 pt-6">
            {/* Recommended Category Card */}
            {recommendedCategory && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recommended Next Category
                  </CardTitle>
                  <CardDescription>
                    Based on your performance, we recommend exploring this category next
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {recommendedCategory.category_display}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recommendedCategory.reason}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(recommendedCategory.route)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Start Learning
                    </Button>
                  </div>
                  {recommendedCategory.progress_towards_unlock && !recommendedCategory.is_unlocked && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress towards unlock</span>
                        <span>{recommendedCategory.progress_towards_unlock.percentage}%</span>
                      </div>
                      <Progress value={recommendedCategory.progress_towards_unlock.percentage} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Category Progress Overview */}
            {loadingCategoryProgress ? (
              <Card>
                <CardContent className="py-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your progress across all categories...
                  </div>
                </CardContent>
              </Card>
            ) : categoryProgress.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">All Learning Categories</CardTitle>
                  <CardDescription>
                    Your progress across all learning paths. Data is automatically saved when you complete activities in any category.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryProgress
                      .map((category) => (
                      <Card key={category.category} className="hover:shadow-md transition-shadow border-primary/10">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{category.category_display}</span>
                            {category.total_points > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {category.total_points} pts
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Points</span>
                            <span className="font-semibold">{category.total_points.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {category.category.includes('kids') ? 'Stories' : 'Lessons'}
                            </span>
                            <span className="font-semibold">
                              {category.category.includes('kids') 
                                ? category.stories_completed || category.lessons_completed
                                : category.lessons_completed}
                            </span>
                          </div>
                          {category.vocabulary_words > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Vocabulary</span>
                              <span className="font-semibold">{category.vocabulary_words}</span>
                            </div>
                          )}
                          {category.pronunciation_attempts > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Pronunciation</span>
                              <span className="font-semibold">{category.pronunciation_attempts}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Avg Score</span>
                            <span className="font-semibold">
                              {category.average_score > 0 ? `${Math.round(category.average_score)}%` : 'N/A'}
                            </span>
                          </div>
                          {category.last_activity && (
                            <div className="text-xs text-muted-foreground pt-2 border-t">
                              Last active: {new Date(category.last_activity).toLocaleDateString()}
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate(MultiCategoryProgressService.getCategoryRoute(category.category))}
                          >
                            Continue Learning
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {categoryProgress.filter(cat => cat.total_points === 0 && cat.lessons_completed === 0 && !cat.last_activity).length > 0 && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Available Categories:</strong> Start learning in these categories to see your progress here:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categoryProgress
                          .filter(cat => cat.total_points === 0 && cat.lessons_completed === 0 && !cat.last_activity)
                          .map((category) => (
                            <Button
                              key={category.category}
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(MultiCategoryProgressService.getCategoryRoute(category.category))}
                            >
                              {category.category_display}
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground space-y-3">
                    <p className="mb-2 font-medium">
                      {loadingCategoryProgress 
                        ? "Loading your progress..."
                        : "No category progress found yet."
                      }
                    </p>
                    <p className="text-sm">
                      {loadingCategoryProgress 
                        ? "Please wait while we fetch your learning data..."
                        : "Start learning in any category (Young Kids, Teen Kids, Adults Beginner, Intermediate, Advanced, or IELTS/PTE) to see your progress here! Your progress will appear automatically as you complete activities."
                      }
                    </p>
                    {!loadingCategoryProgress && (
                      <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Force refresh
                            MultiCategoryProgressService.clearCache();
                            window.location.reload();
                          }}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Progress
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => navigate('/kids')}
                        >
                          Start Learning
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    Level progress
                  </CardTitle>
                  <CardDescription>
                    {Math.max(levelProgress.nextLevelPoints - aggregatedPoints, 0)} points to reach
                    level {levelProgress.nextLevel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={levelProgress.progress} className="h-3" />
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>
                      Current level{' '}
                      <Badge variant="outline" className="ml-1 align-middle">
                        {levelProgress.currentLevel}
                      </Badge>
                    </span>
                    <span>
                      Next level{' '}
                      <Badge variant="outline" className="ml-1 align-middle">
                        {levelProgress.nextLevel}
                      </Badge>
                    </span>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      Consistent daily practice unlocks exclusive story worlds, badges, and personalised
                      voice feedback. Stay curious and keep exploring!
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick actions</CardTitle>
                  <CardDescription>Jump back into personalised learning experiences.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Button variant="secondary" onClick={() => navigate('/kids/young')}>
                    Explore story adventures
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/kids/young?section=vocabulary')}>
                    Practice new vocabulary
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/kids/young?section=pronunciation')}>
                    Open pronunciation studio
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning insights</CardTitle>
                  <CardDescription>Spot trends and focus areas from recent sessions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingProgress ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analysing recent activity...
                    </div>
                  ) : insights.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Complete more lessons to unlock personalised insights and recommendations.
                    </p>
                  ) : (
                    insights.slice(0, 4).map((insight, index) => (
                      <div
                        key={`${insight.title}-${index}`}
                        className={cn(
                          'rounded-lg border p-3',
                          insight.type === 'strength' && 'border-emerald-200 bg-emerald-50',
                          insight.type === 'weakness' && 'border-rose-200 bg-rose-50',
                          insight.type === 'recommendation' && 'border-sky-200 bg-sky-50',
                          insight.type === 'milestone' && 'border-amber-200 bg-amber-50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{insight.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                            <p className="text-xs text-muted-foreground">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Achievement showcase</CardTitle>
                  <CardDescription>
                    Celebrate milestones and see what&apos;s next on your roadmap.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {unlockedAchievements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Earn your first badge by completing a lesson or practicing for 15 minutes today.
                    </p>
                  ) : (
                    unlockedAchievements.slice(0, 4).map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-start gap-3 rounded-lg border bg-card p-3 shadow-sm"
                      >
                        <div className="text-2xl leading-none">{achievement.icon}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{achievement.title}</p>
                            <Badge variant="outline" className="capitalize">
                              {achievement.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Unlocked{' '}
                            {achievement.unlockedAt
                              ? new Date(achievement.unlockedAt).toLocaleDateString()
                              : 'recently'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Kids Categories Summary - Shows both YoungKids and TeenKids */}
              {(() => {
                const kidsCategories = categoryProgress.filter(cat => 
                  cat.category === 'young_kids' || cat.category === 'teen_kids'
                );
                const hasKidsData = kidsCategories.some(cat => 
                  cat.total_points > 0 || cat.stories_completed > 0 || cat.last_activity
                ) || kidsStats.hasData || teenKidsStats.hasData;
                
                const youngKidsData = categoryProgress.find(cat => cat.category === 'young_kids') || 
                  (kidsStats.hasData ? {
                    total_points: kidsStats.points,
                    total_streak: kidsStats.streak,
                    stories_completed: kidsStats.storiesCompleted,
                    vocabulary_words: kidsStats.vocabularyWords,
                    pronunciation_attempts: kidsStats.pronunciationAttempts,
                    category_display: 'Young Kids (4-10)'
                  } : null);
                
                const teenKidsData = categoryProgress.find(cat => cat.category === 'teen_kids') ||
                  (teenKidsStats.hasData ? {
                    total_points: teenKidsStats.points,
                    total_streak: teenKidsStats.streak,
                    stories_completed: teenKidsStats.storiesCompleted,
                    lessons_completed: teenKidsStats.storiesCompleted,
                    vocabulary_words: teenKidsStats.vocabularyWords,
                    pronunciation_attempts: teenKidsStats.pronunciationAttempts,
                    games_completed: teenKidsStats.gamesCompleted,
                    category_display: 'Teen Kids (11-17)'
                  } : null);

                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Kids Learning Progress
                      </CardTitle>
                      <CardDescription>
                        Your progress across Young Kids and Teen Kids categories
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {hasKidsData ? (
                        <>
                          {/* Young Kids Section */}
                          {youngKidsData && (youngKidsData.total_points > 0 || youngKidsData.stories_completed > 0 || kidsStats.hasData) && (
                            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                              <h4 className="text-sm font-semibold text-foreground">Young Kids (4-10)</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Points</p>
                                  <p className="text-lg font-semibold text-foreground">
                                    {(youngKidsData.total_points || kidsStats.points || 0).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Stories</p>
                                  <p className="text-lg font-semibold text-foreground">
                                    {/* Use actual enrolled stories count from StoryWordsService */}
                                    {(() => {
                                      if (user?.id) {
                                        const enrolled = StoryWordsService.getEnrolledStories(String(user.id));
                                        const youngKidsStoryIds = [
                                          'magic-forest', 'space-adventure', 'underwater-world', 'dinosaur-discovery',
                                          'unicorn-magic', 'pirate-treasure', 'superhero-school', 'fairy-garden',
                                          'rainbow-castle', 'jungle-explorer'
                                        ];
                                        return enrolled.filter(e => 
                                          youngKidsStoryIds.includes(e.storyId) && e.completed
                                        ).length;
                                      }
                                      return youngKidsData.stories_completed || kidsStats.storiesCompleted || 0;
                                    })()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Vocabulary</p>
                                  <p className="text-lg font-semibold text-foreground">
                                    {youngKidsData.vocabulary_words || kidsStats.vocabularyWords || 0}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Pronunciation</p>
                                  <p className="text-lg font-semibold text-foreground">
                                    {youngKidsData.pronunciation_attempts || kidsStats.pronunciationAttempts || 0}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => navigate('/kids/young')}
                              >
                                Continue Young Kids
                              </Button>
                            </div>
                          )}
                          
                          {/* Teen Kids Section */}
                          {teenKidsData && (teenKidsData.total_points > 0 || teenKidsData.stories_completed > 0 || teenKidsData.lessons_completed > 0 || teenKidsData.vocabulary_words > 0 || teenKidsData.pronunciation_attempts > 0 || teenKidsData.games_completed > 0 || teenKidsStats.hasData) && (
                            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                              <h4 className="text-sm font-semibold text-foreground">Teen Kids (11-17)</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Points</p>
                                  <p className="text-lg font-semibold text-foreground">
                                    {(teenKidsData.total_points || teenKidsStats.points || 0).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Missions</p>
                                  <p className="text-lg font-semibold text-foreground">
                                    {/* Use actual enrolled stories count from StoryWordsService */}
                                    {(() => {
                                      if (user?.id) {
                                        const enrolled = StoryWordsService.getEnrolledStories(String(user.id));
                                        const teenKidsStoryIds = [
                                          'mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator',
                                          'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert',
                                          'ai-ethics-explorer', 'digital-security-guardian'
                                        ];
                                        return enrolled.filter(e => 
                                          teenKidsStoryIds.includes(e.storyId) && e.completed
                                        ).length;
                                      }
                                      return teenKidsData.stories_completed || teenKidsData.lessons_completed || teenKidsStats.storiesCompleted || 0;
                                    })()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Vocabulary</p>
                                  <p className="text-lg font-semibold text-foreground">
                                    {teenKidsData.vocabulary_words || teenKidsStats.vocabularyWords || 0}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Games</p>
                                  <p className="text-lg font-semibold text-foreground">
                                    {teenKidsData.games_completed || teenKidsStats.gamesCompleted || 0}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => navigate('/kids/teen')}
                              >
                                Continue Teen Kids
                              </Button>
                            </div>
                          )}
                          
                          {!youngKidsData && !teenKidsData && (
                            <div className="rounded-lg border bg-muted/20 p-4">
                              <p className="text-sm text-muted-foreground">
                                Keep the momentum going! Jump back to the kids hub to unlock more badges, stories, and
                                achievements.
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                          Start an adventure in the kids hub to see personalised progress, sparkle points, and story
                          highlights here.
                        </div>
                      )}
                      {!hasKidsData && (
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => navigate('/kids')}
                        >
                          Explore Kids Categories
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6 pt-6">
            <Card>
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Weekly snapshot</CardTitle>
                  <CardDescription>
                    Track lessons, time investment, and consistency for the last 7 days.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={loadProgress} aria-label="Refresh activity">
                  {loadingProgress ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingProgress || !weeklyStats ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading weekly analytics...
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Lessons</p>
                      <p className="text-2xl font-semibold text-foreground">
                        {weeklyStats.totalLessons}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {weeklyStats.daysActive} active day{weeklyStats.daysActive === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Practice time</p>
                      <p className="text-2xl font-semibold text-foreground">
                        {Math.round(weeklyStats.totalTime)} mins
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Average score {Math.round(weeklyStats.averageScore)}%
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Streak</p>
                      <p className="text-2xl font-semibold text-foreground">
                        {weeklyStats.streak} days
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {weeklyStats.totalPoints.toLocaleString()} points earned
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 pt-6" id="profile-notifications">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Messages about new achievements, story unlocks, and important updates.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                    onClick={refreshNotifications}
                    disabled={notificationsSyncing}
                  >
                    {notificationsSyncing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={markAllNotificationsRead}
                    disabled={notificationsSyncing || unreadNotifications.length === 0}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark all read
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingNotifications ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching latest notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
                    <Bell className="h-6 w-6 opacity-60" />
                    <p>You haven&apos;t unlocked any notifications yet.</p>
                    <p className="max-w-sm text-xs text-muted-foreground">
                      Complete a story or practice activity to unlock your first badge and receive
                      personalised updates here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md',
                          !notification.isRead &&
                            'border-primary/40 bg-primary/5 dark:border-primary/30 dark:bg-primary/10'
                        )}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {notification.title}
                              </p>
                              <Badge variant="outline" className="capitalize">
                                {notification.type}
                              </Badge>
                              {!notification.isRead && (
                                <span className="text-[10px] font-semibold uppercase text-primary">
                                  New
                                </span>
                              )}
                              {notification.pendingSync && (
                                <Badge variant="outline" className="text-[10px] uppercase">
                                  Syncing…
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                              <span>{formatTime(notification.createdAt)}</span>
                              {notification.actionUrl && (
                                <button
                                  type="button"
                                  className="font-medium text-primary hover:underline"
                                  onClick={() =>
                                    window.open(notification.actionUrl, '_blank', 'noopener,noreferrer')
                                  }
                                >
                                  View details
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleNotificationRead(notification)}
                              aria-label={
                                notification.isRead ? 'Mark notification as unread' : 'Mark read'
                              }
                            >
                              {notification.isRead ? (
                                <Undo2 className="h-4 w-4" />
                              ) : (
                                <CheckCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteNotification(notification)}
                              aria-label="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {notifications.length} total ·{' '}
                  {unreadNotifications.length} unread notification
                  {unreadNotifications.length === 1 ? '' : 's'}
                </span>
                <Button
                  variant="link"
                  className="px-0 text-primary"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Back to top
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="journey" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning journey</CardTitle>
                <CardDescription>
                  Follow your personalised roadmap and celebrate milestones along the way.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectRoadmap />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      </AnimatedTransition>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update how Elora greets you and where learners can find your work.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                <Label htmlFor="profile-name">Name</Label>
                    <Input 
                  id="profile-name"
                      value={tempProfile.name}
                  onChange={(event) =>
                    setTempProfile((prev) => ({ ...prev, name: event.target.value }))
                  }
                    />
                  </div>
                  <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                    <Input 
                  id="profile-email"
                      type="email"
                      value={tempProfile.email}
                  onChange={(event) =>
                    setTempProfile((prev) => ({ ...prev, email: event.target.value }))
                  }
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
              <Label htmlFor="profile-description">Bio</Label>
              <Textarea
                id="profile-description"
                    value={tempProfile.description || ''}
                onChange={(event) =>
                  setTempProfile((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Share a short introduction about your learning goals."
                  />
                </div>
                
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Featured links</Label>
                <Badge variant="outline">{tempProfile.links?.length ?? 0} saved</Badge>
                          </div>
              <div className="space-y-2 rounded-md border p-3">
                {(tempProfile.links || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Add portfolio, community, or feedback links you want to keep handy.
                  </p>
                ) : (
                  tempProfile.links?.map((link, index) => (
                    <div
                      key={`${link.title}-${index}`}
                      className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <span className="truncate">
                        <span className="font-medium text-foreground">{link.title}</span>
                        <span className="pl-1 text-muted-foreground"> · {link.url}</span>
                      </span>
                          <Button 
                            variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveLink(index)}
                        aria-label={`Remove ${link.title}`}
                          >
                        <Trash2 className="h-4 w-4" />
                          </Button>
                    </div>
                  ))
                )}
                  </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="link-title">Title</Label>
                    <Input 
                    id="link-title"
                    placeholder="Example: Portfolio"
                      value={tempLink.title}
                    onChange={(event) => setTempLink((prev) => ({ ...prev, title: event.target.value }))}
                    />
                  </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="link-url">URL</Label>
                    <div className="flex gap-2">
                      <Input 
                      id="link-url"
                      placeholder="https://"
                        value={tempLink.url}
                      onChange={(event) => setTempLink((prev) => ({ ...prev, url: event.target.value }))}
                      />
                    <Button variant="secondary" className="shrink-0" onClick={handleAddLink}>
                      Add
                      </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const formatTime = (timestamp?: number) => {
  if (!timestamp) return 'Just now';
  const delta = Date.now() - timestamp;
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

export default Profile;
