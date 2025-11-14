import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  Volume2,
  VolumeX,
  Trophy,
  BookOpen,
  Mic,
  Award,
  Star,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Brain,
  Target,
  Globe,
  MessageSquare,
  Cpu,
  Lock,
  Crown,
  CheckCircle,
  Play,
  Headphones,
  Clock,
} from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { PageBlockedModal } from '@/components/common/PageBlockedModal';
import InitialRouteService from '@/services/InitialRouteService';
import PageEligibilityService from '@/services/PageEligibilityService';
import Vocabulary from '@/components/kids/Vocabulary';
import Pronunciation from '@/components/kids/Pronunciation';
import InteractiveGames from '@/components/kids/InteractiveGames';
import SyncStatusIndicator from '@/components/kids/SyncStatusIndicator';
import TeenApi from '@/services/TeenApi';
import StoryWordsService from '@/services/StoryWordsService';
import HybridServiceManager from '@/services/HybridServiceManager';
import { ModelManager } from '@/services/ModelManager';
import { WhisperService } from '@/services/WhisperService';
import { TransformersService } from '@/services/TransformersService';
import { TimeTracker } from '@/services/TimeTracker';
import EnhancedTTS from '@/services/EnhancedTTS';
import { StoryDatasetService, type DatasetStory } from '@/services/StoryDatasetService';
import MultiCategoryProgressService, { type CategoryProgress } from '@/services/MultiCategoryProgressService';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import MysteryDetectiveAdventure from '@/components/kids/stories/MysteryDetectiveAdventure';
import SpaceExplorerAdventure from '@/components/kids/stories/SpaceExplorerAdventure';
import EnvironmentalHeroAdventure from '@/components/kids/stories/EnvironmentalHeroAdventure';
import TechInnovatorAdventure from '@/components/kids/stories/TechInnovatorAdventure';
import GlobalCitizenAdventure from '@/components/kids/stories/GlobalCitizenAdventure';
import SocialMediaExpertAdventure from '@/components/kids/stories/SocialMediaExpertAdventure';
import FutureLeaderAdventure from '@/components/kids/stories/FutureLeaderAdventure';
import ScientificDiscoveryAdventure from '@/components/kids/stories/ScientificDiscoveryAdventure';
import AIEthicsExplorerAdventure from '@/components/kids/stories/AIEthicsExplorerAdventure';
import DigitalSecurityGuardianAdventure from '@/components/kids/stories/DigitalSecurityGuardianAdventure';
import DynamicStoryAdventure from '@/components/kids/stories/DynamicStoryAdventure';

const TEEN_STORY_TYPE_TO_INTERNAL: Record<string, string> = {
  mystery: 'mystery-detective',
  space: 'space-explorer-teen',
  environment: 'environmental-hero',
  technology: 'tech-innovator',
  culture: 'global-citizen',
  leadership: 'future-leader',
  science: 'scientific-discovery',
  digital: 'social-media-expert',
  ai: 'ai-ethics-explorer',
  cybersecurity: 'digital-security-guardian',
  // Template stories (11-20)
  'climate-action': 'climate-action',
  'startup': 'startup',
  'diplomacy': 'diplomacy',
  'medical-research': 'medical-research',
  'social-impact': 'social-impact',
  'data-science': 'data-science',
  'engineering': 'engineering',
  'content-strategy': 'content-strategy',
  'ethical-ai': 'ethical-ai',
  'innovation-summit': 'innovation-summit',
};

type TeenStory = {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  words: number;
  image: string;
  character: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  animation: string;
  type: keyof typeof TEEN_STORY_TYPE_TO_INTERNAL;
  id: string;
};

const allTeenStories: TeenStory[] = [
  {
    title: 'Mystery Detective',
    description: 'Solve complex mysteries while sharpening critical thinking and English comprehension.',
    difficulty: 'Hard',
    duration: '12 min',
    words: 800,
    image: '🕵️',
    character: Target,
    gradient: 'from-slate-500 to-slate-700',
    bgGradient: 'from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950',
    animation: 'animate-float-slow',
    type: 'mystery',
    id: 'teen-0',
  },
  {
    title: 'Space Explorer',
    description: 'Navigate scientific missions that test your vocabulary, logic, and teamwork.',
    difficulty: 'Hard',
    duration: '15 min',
    words: 950,
    image: '🚀',
    character: Globe,
    gradient: 'from-indigo-500 to-blue-600',
    bgGradient: 'from-blue-200 to-indigo-300 dark:from-indigo-900 dark:to-slate-900',
    animation: 'animate-bounce',
    type: 'space',
    id: 'teen-1',
  },
  {
    title: 'Environmental Hero',
    description: 'Design solutions for real-world climate challenges and communicate your ideas clearly.',
    difficulty: 'Medium',
    duration: '10 min',
    words: 700,
    image: '🌍',
    character: Brain,
    gradient: 'from-emerald-400 to-green-500',
    bgGradient: 'from-emerald-200 to-green-300 dark:from-emerald-900 dark:to-green-950',
    animation: 'animate-float-medium',
    type: 'environment',
    id: 'teen-2',
  },
  {
    title: 'Tech Innovator',
    description: 'Prototype emerging technology and pitch futuristic solutions with persuasive language.',
    difficulty: 'Hard',
    duration: '12 min',
    words: 850,
    image: '💻',
    character: Cpu,
    gradient: 'from-purple-500 to-fuchsia-500',
    bgGradient: 'from-purple-200 to-fuchsia-300 dark:from-purple-900 dark:to-fuchsia-950',
    animation: 'animate-float-fast',
    type: 'technology',
    id: 'teen-3',
  },
  {
    title: 'Global Citizen',
    description: 'Work through cultural case studies and build empathy-driven communication skills.',
    difficulty: 'Medium',
    duration: '11 min',
    words: 750,
    image: '🌐',
    character: Globe,
    gradient: 'from-orange-400 to-rose-500',
    bgGradient: 'from-orange-200 to-rose-300 dark:from-orange-900 dark:to-rose-950',
    animation: 'animate-float-slow',
    type: 'culture',
    id: 'teen-4',
  },
  {
    title: 'Future Leader',
    description: 'Lead a team through strategic challenges and develop confident presentation skills.',
    difficulty: 'Hard',
    duration: '13 min',
    words: 900,
    image: '👑',
    character: Crown,
    gradient: 'from-amber-400 to-yellow-500',
    bgGradient: 'from-amber-200 to-yellow-300 dark:from-amber-900 dark:to-yellow-950',
    animation: 'animate-bounce',
    type: 'leadership',
    id: 'teen-5',
  },
  {
    title: 'Scientific Discovery',
    description: 'Investigate experiments, interpret data, and report findings like a research professional.',
    difficulty: 'Hard',
    duration: '14 min',
    words: 950,
    image: '🔬',
    character: Target,
    gradient: 'from-cyan-400 to-blue-500',
    bgGradient: 'from-cyan-200 to-blue-300 dark:from-cyan-900 dark:to-blue-950',
    animation: 'animate-float-medium',
    type: 'science',
    id: 'teen-6',
  },
  {
    title: 'Social Media Expert',
    description: 'Craft impactful digital campaigns focused on safety, ethics, and persuasive messaging.',
    difficulty: 'Medium',
    duration: '9 min',
    words: 650,
    image: '📱',
    character: MessageSquare,
    gradient: 'from-pink-400 to-purple-500',
    bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-950',
    animation: 'animate-float-fast',
    type: 'digital',
    id: 'teen-7',
  },
  {
    title: 'AI Ethics Explorer',
    description: 'Debate responsible AI in schools, communities, and global contexts with evidence-based arguments.',
    difficulty: 'Hard',
    duration: '14 min',
    words: 980,
    image: '🤖',
    character: Cpu,
    gradient: 'from-indigo-500 to-violet-600',
    bgGradient: 'from-indigo-200 to-violet-300 dark:from-indigo-900 dark:to-violet-950',
    animation: 'animate-float-medium',
    type: 'ai',
    id: 'teen-8',
  },
  {
    title: 'Digital Security Guardian',
    description: 'Protect data, decode cyber threats, and master professional communication about online safety.',
    difficulty: 'Hard',
    duration: '13 min',
    words: 920,
    image: '🔐',
    character: Lock,
    gradient: 'from-rose-500 to-red-600',
    bgGradient: 'from-rose-200 to-red-300 dark:from-rose-900 dark:to-red-950',
    animation: 'animate-float-slow',
    type: 'cybersecurity',
    id: 'teen-9',
  },
];

const sanitizeSpeechText = (text: string) =>
  text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const speakWithSanitizedText = (
  text: string,
  options?: Parameters<typeof EnhancedTTS.speak>[1]
) => {
  const sanitized = sanitizeSpeechText(text);
  if (!sanitized) return Promise.resolve();
  return EnhancedTTS.speak(sanitized, options);
};

const TeenKidsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('section') || 'stories';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [currentStory, setCurrentStory] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 6;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOpeningFromFavorites, setIsOpeningFromFavorites] = useState(false);

  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pronunciationAttempts, setPronunciationAttempts] = useState(0);
  const [vocabularyAttempts, setVocabularyAttempts] = useState(0);
  const [gamesAttempts, setGamesAttempts] = useState(0);
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress | null>(null);
  const [loadingCategoryProgress, setLoadingCategoryProgress] = useState(false);
  const [serverAchievements, setServerAchievements] = useState<Array<{
    key: string;
    name: string;
    emoji: string;
    description: string;
    progress: number;
    unlocked: boolean;
  }>>([]);
  const [enrolledStoryWordsDetailed, setEnrolledStoryWordsDetailed] = useState<Array<{ word: string; hint: string; storyId: string; storyTitle: string }>>([]);
  const [enrolledStoryPhrasesDetailed, setEnrolledStoryPhrasesDetailed] = useState<Array<{ phrase: string; phonemes: string; storyId: string; storyTitle: string }>>([]);
  const [selectedStoryFilter, setSelectedStoryFilter] = useState<string>('all');
  const [selectedPhraseFilter, setSelectedPhraseFilter] = useState<string>('all');
  
  // Completed story IDs (Set for efficient lookup)
  const completedStoryIds = useMemo(() => {
    try {
      const stories = StoryWordsService.getEnrolledStories(userId) || [];
      return new Set(
        stories
          .filter((story: { completed?: boolean; storyId?: string }) => story?.completed)
          .map((story: { completed?: boolean; storyId?: string }) => story.storyId)
      );
    } catch {
      return new Set<string>();
    }
  }, [userId, enrolledStoryWordsDetailed, enrolledStoryPhrasesDetailed]);
  const [datasetStories, setDatasetStories] = useState<DatasetStory[]>([]);
  const [storyTemplates, setStoryTemplates] = useState<any[]>([]);
  interface TemplateStory {
    title: string;
    storySteps: Array<{ id: string; content: string; [key: string]: unknown }>;
    voiceProfile: string;
    characterName: string;
    storyId: string;
    milestoneStepIds: string[];
  }

  const [currentTemplateStory, setCurrentTemplateStory] = useState<TemplateStory | null>(null);

  const teenFavorites = useMemo(
    () => favorites.filter((id) => id.startsWith('teen-')),
    [favorites]
  );

  const enrolledInternalStoryIds = useMemo(() => {
    const ids = new Set<string>();
    enrolledStoryWordsDetailed.forEach((w) => ids.add(w.storyId));
    enrolledStoryPhrasesDetailed.forEach((p) => ids.add(p.storyId));
    return ids;
  }, [enrolledStoryWordsDetailed, enrolledStoryPhrasesDetailed]);

  // Helper function to get internal story ID
  const getInternalStoryId = useCallback((storyType: string): string => {
    return TEEN_STORY_TYPE_TO_INTERNAL[storyType] || storyType;
  }, []);

  // Combine enrolled and completed stories for badge display
  const allEnrolledStoryIds = useMemo(() => {
    const combined = new Set<string>();
    enrolledInternalStoryIds.forEach((id) => combined.add(id));
    completedStoryIds.forEach((id) => {
      // Convert completed story IDs (like 'teen-0') to internal IDs
      const story = allTeenStories.find((s) => s.id === id);
      if (story) {
        const internalId = getInternalStoryId(story.type);
        combined.add(internalId);
      }
    });
    return combined;
  }, [enrolledInternalStoryIds, completedStoryIds, getInternalStoryId]);

  interface DashboardData {
    points?: number;
    streak?: number;
    progress?: {
      points?: number;
      streak?: number;
    };
    pronunciation_attempts?: number;
    vocabulary_attempts?: number;
    games_attempts?: number;
    favorites?: string[];
    completed_story_ids?: string[];
    achievements?: Array<{
      key: string;
      name: string;
      emoji: string;
      description: string;
      progress: number;
      unlocked: boolean;
    }>;
  }

  const applyDashboard = useCallback(
    (data: DashboardData | null, mergeMode: boolean = false) => {
      if (!data) return;

      const pointsFromPayload = data.points ?? data.progress?.points ?? 0;
      const streakFromPayload = data.streak ?? data.progress?.streak ?? 0;
      const pronunciationAttemptsFromPayload = Number(data.pronunciation_attempts ?? 0) || 0;
      const vocabularyAttemptsFromPayload = Number(data.vocabulary_attempts ?? 0) || 0;
      const gamesAttemptsFromPayload = Number(data.games_attempts ?? 0) || 0;
      const favoritesFromPayload = Array.isArray(data.favorites) ? data.favorites : [];
      const completedIds = Array.isArray(data.completed_story_ids) ? data.completed_story_ids : [];
      const achievementsFromPayload = Array.isArray(data.achievements) ? data.achievements : [];

      if (mergeMode) {
        // Merge mode: take maximum values to preserve local progress
        setPoints((prev) => Math.max(prev, Number(pointsFromPayload) || 0));
        setStreak((prev) => Math.max(prev, Number(streakFromPayload) || 0));
        setPronunciationAttempts((prev) => Math.max(prev, pronunciationAttemptsFromPayload));
        setVocabularyAttempts((prev) => Math.max(prev, vocabularyAttemptsFromPayload));
        setGamesAttempts((prev) => Math.max(prev, gamesAttemptsFromPayload));
        
        // Merge favorites
        setFavorites((prev) => {
          const merged = new Set([...prev, ...favoritesFromPayload]);
          return Array.from(merged);
        });

        // Update server achievements if available
        if (achievementsFromPayload.length > 0) {
          setServerAchievements(achievementsFromPayload);
        }

        // Convert completed story IDs to internal IDs for words/phrases
        const internalStoryIds = completedIds
          .map((id: string) => {
            const story = allTeenStories.find((s) => s.id === id);
            return story ? getInternalStoryId(story.type) : null;
          })
          .filter((id: string | null): id is string => id !== null);

        // Update words and phrases based on completed stories - FILTERED TO TEEN ONLY
        const wordDetails = StoryWordsService.getWordsForStoryIdsByAge(internalStoryIds, 'teen');
        const phraseDetails = StoryWordsService.getPhrasesForStoryIdsByAge(internalStoryIds, 'teen');
        
        setEnrolledStoryWordsDetailed((prevWords) => {
          const existing = new Set(prevWords.map((w) => `${w.storyId}-${w.word}`));
          const toAdd = wordDetails
            .map((w) => ({ word: w.word, hint: w.hint, storyId: w.storyId, storyTitle: w.storyTitle }))
            .filter((w) => !existing.has(`${w.storyId}-${w.word}`));
          return [...prevWords, ...toAdd];
        });
        
        setEnrolledStoryPhrasesDetailed((prevPhrases) => {
          const existing = new Set(prevPhrases.map((p) => `${p.storyId}-${p.phrase}`));
          const toAdd = phraseDetails
            .map((p) => ({ phrase: p.phrase, phonemes: p.phonemes, storyId: p.storyId, storyTitle: p.storyTitle }))
            .filter((p) => !existing.has(`${p.storyId}-${p.phrase}`));
          return [...prevPhrases, ...toAdd];
        });
        
        // Sync completed stories to StoryWordsService so they appear in badges section
        completedIds.forEach((id: string) => {
          const story = allTeenStories.find((s) => s.id === id);
          if (story) {
            const internalId = getInternalStoryId(story.type);
            // Check if already enrolled to avoid duplicate saves
            const existingEnrollments = StoryWordsService.getEnrolledStories(userId);
            if (!existingEnrollments.some(e => e.storyId === internalId && e.completed)) {
              StoryWordsService.enrollInStory(userId, internalId, story.title, story.type, 100).catch(err => {
                console.warn('Failed to sync story enrollment:', err);
              });
            }
          }
        });
      } else {
        // Replace mode: use server data as source of truth
        setPoints(Number(pointsFromPayload) || 0);
        setStreak(Number(streakFromPayload) || 0);
        setPronunciationAttempts(pronunciationAttemptsFromPayload);
        setVocabularyAttempts(vocabularyAttemptsFromPayload);
        setGamesAttempts(gamesAttemptsFromPayload);
        setFavorites(favoritesFromPayload);
        
        // Update server achievements if available
        if (achievementsFromPayload.length > 0) {
          setServerAchievements(achievementsFromPayload);
        }
        
        // Convert story IDs to internal IDs
        const internalStoryIds = completedIds
          .map((id: string) => {
            const story = allTeenStories.find((s) => s.id === id);
            return story ? getInternalStoryId(story.type) : null;
          })
          .filter((id: string | null): id is string => id !== null);

        const wordDetails = StoryWordsService.getWordsForStoryIdsByAge(internalStoryIds, 'teen').map((w) => ({
          word: w.word,
          hint: w.hint,
          storyId: w.storyId,
          storyTitle: w.storyTitle,
        }));
        setEnrolledStoryWordsDetailed(wordDetails);

        const phraseDetails = StoryWordsService.getPhrasesForStoryIdsByAge(internalStoryIds, 'teen').map((p) => ({
          phrase: p.phrase,
          phonemes: p.phonemes,
          storyId: p.storyId,
          storyTitle: p.storyTitle,
        }));
        setEnrolledStoryPhrasesDetailed(phraseDetails);
        
        // Sync completed stories to StoryWordsService so they appear in badges section
        completedIds.forEach((id: string) => {
          const story = allTeenStories.find((s) => s.id === id);
          if (story) {
            const internalId = getInternalStoryId(story.type);
            // Check if already enrolled to avoid duplicate saves
            const existingEnrollments = StoryWordsService.getEnrolledStories(userId);
            if (!existingEnrollments.some(e => e.storyId === internalId && e.completed)) {
              StoryWordsService.enrollInStory(userId, internalId, story.title, story.type, 100).catch(err => {
                console.warn('Failed to sync story enrollment:', err);
              });
            }
          }
        });
      }
    },
    [getInternalStoryId, userId]
  );

  const callTeenApi = useCallback(
    async (invoke: (token: string) => Promise<any>, fallback?: () => void) => {
      const token = localStorage.getItem('speakbee_auth_token');
      if (!token || token === 'local-token') {
        console.warn('Teen action skipped: online authentication required.');
        if (fallback) fallback();
        return null;
      }
      try {
        const response = await invoke(token);
        if (response) {
          applyDashboard(response);
        }
        return response;
      } catch (error) {
        console.error('Teen API action failed:', error);
        if (fallback) fallback();
        return null;
      }
    },
    [applyDashboard]
  );

  const filteredStoryWords = useMemo(() => {
    if (selectedStoryFilter === 'all') return enrolledStoryWordsDetailed;
    return enrolledStoryWordsDetailed.filter((w) => w.storyId === selectedStoryFilter);
  }, [enrolledStoryWordsDetailed, selectedStoryFilter]);

  const vocabularyWordsToUse = useMemo(
    () => filteredStoryWords.map((w) => ({ word: w.word, hint: w.hint })),
    [filteredStoryWords]
  );

  const filteredStoryPhrases = useMemo(() => {
    if (selectedPhraseFilter === 'all') return enrolledStoryPhrasesDetailed;
    return enrolledStoryPhrasesDetailed.filter((p) => p.storyId === selectedPhraseFilter);
  }, [enrolledStoryPhrasesDetailed, selectedPhraseFilter]);

  const pronunciationItems = useMemo(
    () => filteredStoryPhrases.map((p) => ({ phrase: p.phrase, phonemes: p.phonemes })),
    [filteredStoryPhrases]
  );

  useEffect(() => {
    const urlCategory = searchParams.get('section') || 'stories';
    if (urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const currentSection = searchParams.get('section') || 'stories';
    if (activeCategory !== currentSection) {
      setSearchParams({ section: activeCategory }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!isAuthenticated) {
        const speakbeeUsers = JSON.parse(localStorage.getItem('speakbee_users') || '[]');
        const legacyUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const hasExistingUsers = speakbeeUsers.length > 0 || legacyUsers.length > 0;
        setAuthMode(hasExistingUsers ? 'login' : 'register');
        setShowAuthModal(true);
      }
    };
    checkUserAndRedirect();
  }, [isAuthenticated]);

  useEffect(() => {
    const initializeServices = async () => {
      if (!isAuthenticated) return;
      setIsInitializing(true);
      try {
        await HybridServiceManager.initialize({
          mode: 'hybrid',
          preferOffline: false,
          autoSync: true,
          syncInterval: 15,
        } as any);
        const health = await HybridServiceManager.getSystemHealth();
        console.log('📊 Teen system health:', health);
        const piperReady = await ModelManager.isModelCached('piper-en-us-lessac-medium');
        const whisperReady = await ModelManager.isModelCached('whisper-tiny-en');
        const llmReady = await ModelManager.isModelCached('distilgpt2');
        setModelsReady(piperReady || whisperReady || llmReady);
        if (piperReady || whisperReady || llmReady) {
          await Promise.allSettled([
            WhisperService.initialize().catch((err) => console.warn('Whisper teen init skipped:', err)),
            TransformersService.initialize().catch((err) => console.warn('Transformers teen init skipped:', err)),
          ]);
        }
      } catch (error) {
        console.error('Error initializing teen services:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    initializeServices();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      TimeTracker.initialize(userId);
      return () => {
        TimeTracker.cleanup();
      };
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (isAuthenticated && isSoundEnabled) {
      const welcomeMessages = [
        "Welcome back to Teen Explorer Zone! Ready for advanced challenges?",
        "Let's elevate your English with real-world missions!",
        'Great to see you! Prepare for professional-level practice!',
      ];
      const timer = setTimeout(() => {
        if (!isOpeningFromFavorites) {
          speakWithSanitizedText(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)], {
            rate: 0.98,
            emotion: 'excited',
          }).catch(() => undefined);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isSoundEnabled, isOpeningFromFavorites]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('speakbee_auth_token');
    
    // Load favorites from local storage as fallback
    try {
      const localFavorites = localStorage.getItem(`teen_favorites_${userId}`);
      if (localFavorites) {
        const parsed = JSON.parse(localFavorites);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.warn('Error loading local favorites:', error);
    }
    
    if (!token || token === 'local-token') {
      return;
    }
    TeenApi.getDashboard(token)
      .then((data: any) => applyDashboard(data))
      .catch((error) => {
        console.error('Error loading teen dashboard:', error);
      });
  }, [isAuthenticated, applyDashboard, userId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setEnrolledStoryWordsDetailed([]);
      setEnrolledStoryPhrasesDetailed([]);
      return;
    }
  }, [isAuthenticated]);

  // Load vocabulary words and phrases from enrolled stories (TEEN KIDS ONLY)
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadVocabularyWordsAndPhrases = () => {
      try {
        // Get words from enrolled stories - FILTERED TO TEEN KIDS ONLY
        const storyWords = StoryWordsService.getWordsFromEnrolledStoriesByAge(userId, 'teen');
        // Save detailed for filtering; do NOT fallback to defaults for Advanced Vocabulary
        const detailed = storyWords.map(sw => ({
          word: sw.word,
          hint: sw.hint,
          storyId: sw.storyId,
          storyTitle: sw.storyTitle
        }));
        setEnrolledStoryWordsDetailed(detailed);
        const filtered = selectedStoryFilter === 'all' 
          ? detailed
          : detailed.filter(w => w.storyId === selectedStoryFilter);
        console.log(`📚 Loaded ${filtered.length} words from enrolled TEEN stories${selectedStoryFilter !== 'all' ? ' (filtered)' : ''}`);

        // Get phrases from enrolled stories - FILTERED TO TEEN KIDS ONLY
        const storyPhrases = StoryWordsService.getPhrasesFromEnrolledStoriesByAge(userId, 'teen');
        // Save detailed for filtering; do NOT fallback to defaults for Speaking Lab
        const detailedPhrases = storyPhrases.map(sp => ({
          phrase: sp.phrase,
          phonemes: sp.phonemes,
          storyId: sp.storyId,
          storyTitle: sp.storyTitle
        }));
        setEnrolledStoryPhrasesDetailed(detailedPhrases);
        const filteredPhrases = selectedPhraseFilter === 'all' 
          ? detailedPhrases
          : detailedPhrases.filter(p => p.storyId === selectedPhraseFilter);
        console.log(`🎤 Loaded ${filteredPhrases.length} phrases from enrolled TEEN stories${selectedPhraseFilter !== 'all' ? ' (filtered)' : ''}`);
      } catch (error) {
        console.error('Error loading vocabulary words and phrases:', error);
        // For Advanced Vocabulary and Speaking Lab, do not fallback to defaults; show empty state
        setEnrolledStoryWordsDetailed([]);
        setEnrolledStoryPhrasesDetailed([]);
      }
    };

    loadVocabularyWordsAndPhrases();
  }, [userId, isAuthenticated, selectedStoryFilter, selectedPhraseFilter]);

  // Check page eligibility on mount and show modal if locked
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkEligibility = async () => {
      const requiresCheck = InitialRouteService.requiresEligibilityCheck('/kids/teen' as any);
      if (requiresCheck) {
        try {
          const eligibility = await PageEligibilityService.getEligibility('/kids/teen', true);
          setPageEligibility(eligibility);
          
          // If page is locked, show the blocked modal immediately and block the page
          if (!eligibility?.is_unlocked) {
            console.log('🚫 TeenKids page is locked - showing blocked modal');
            setShowPageBlockedModal(true);
      } else {
        // Page is unlocked
      }
        } catch (error) {
          console.error('Error checking page eligibility:', error);
        }
      }
    };
    
    checkEligibility();
  }, [isAuthenticated]);

  useEffect(() => {
    if (location.state?.startStory && location.state?.storyType) {
      const { startStory } = location.state;
      const story = allTeenStories.find((s) => s.id === startStory);
      if (story) {
        setIsOpeningFromFavorites(true);
        setCurrentStory(startStory);
        openStoryModal(story.type);
        navigate(location.pathname, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Load stories 11-20 from dataset
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadDatasetStories = async () => {
      try {
        // Try loading from JSON first (easier to maintain), fallback to CSV
        const stories = await StoryDatasetService.loadStoriesFromJSON('/datasets/teen-kids-stories.json', 'teen');
        if (stories.length === 0) {
          // Fallback to CSV if JSON doesn't exist
          const csvStories = await StoryDatasetService.loadStoriesFromCSV('/datasets/teen-kids-stories.csv', 'teen');
          setDatasetStories(csvStories);
        } else {
          setDatasetStories(stories);
        }
      } catch (error) {
        console.error('Error loading dataset stories:', error);
        setDatasetStories([]);
      }
    };
    
    loadDatasetStories();
  }, [isAuthenticated]);

  // Load story templates for stories 11-20
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadStoryTemplates = async () => {
      try {
        const response = await fetch('/datasets/teen-kids-stories-templates.json');
        if (response.ok) {
          const templates = await response.json();
          setStoryTemplates(templates);
          console.log(`✅ Loaded ${templates.length} teen story templates`);
        } else {
          console.warn('Teen story templates file not found, template stories will not be available');
          setStoryTemplates([]);
        }
      } catch (error) {
        console.error('Error loading teen story templates:', error);
        setStoryTemplates([]);
      }
    };
    
    loadStoryTemplates();
  }, [isAuthenticated]);

  // Real-time category progress updates
  const {
    data: realTimeCategories,
    loading: loadingCategoriesRealTime,
  } = useRealTimeData<CategoryProgress[]>('category_progress', {
    enabled: isAuthenticated && !!userId,
    immediate: true,
  });

  // Load category-specific progress (practice time and lessons completed)
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const loadCategoryProgress = async () => {
      setLoadingCategoryProgress(true);
      try {
        const progress = await MultiCategoryProgressService.getCategoryProgress(userId, 'teen_kids');
        setCategoryProgress(progress);
      } catch (error) {
        console.error('Error loading category progress:', error);
        setCategoryProgress(null);
      } finally {
        setLoadingCategoryProgress(false);
      }
    };

    loadCategoryProgress();
  }, [userId, isAuthenticated]);

  // Update category progress when real-time data arrives
  useEffect(() => {
    if (realTimeCategories && Array.isArray(realTimeCategories)) {
      const teenKidsProgress = realTimeCategories.find(cat => cat.category === 'teen_kids');
      if (teenKidsProgress) {
        setCategoryProgress(teenKidsProgress);
        setLoadingCategoryProgress(false);
      }
    }
  }, [realTimeCategories]);

  // Merge base stories with dataset stories
  const allTeenStoriesWithDataset = useMemo(() => {
    const datasetStoriesMapped = datasetStories.map((ds) => {
      // Map dataset story to TeenStory format
      const CharacterIcon = ds.character ? 
        (ds.character === 'Target' ? Target :
         ds.character === 'Globe' ? Globe :
         ds.character === 'Brain' ? Brain :
         ds.character === 'Cpu' ? Cpu :
         ds.character === 'Crown' ? Crown :
         ds.character === 'MessageSquare' ? MessageSquare :
         ds.character === 'Lock' ? Lock : Target) : Target;
      
      return {
        title: ds.title,
        description: ds.description,
        difficulty: ds.difficulty,
        duration: ds.duration,
        words: ds.words,
        image: ds.image,
        character: CharacterIcon,
        gradient: ds.gradient || 'from-slate-500 to-slate-700',
        bgGradient: ds.bgGradient || 'from-slate-200 to-slate-300 dark:from-slate-900 dark:to-slate-950',
        animation: ds.animation || 'animate-float-slow',
        type: ds.type as keyof typeof TEEN_STORY_TYPE_TO_INTERNAL,
        id: `teen-${ds.storyNumber - 1}`, // Convert to 0-based index (story 11 = teen-10)
        isFromDataset: true,
        datasetStory: ds
      };
    });
    
    return [...allTeenStories, ...datasetStoriesMapped];
  }, [allTeenStories, datasetStories]);

  const paginatedStories = useMemo(() => {
    const startIndex = (currentPage - 1) * storiesPerPage;
    return allTeenStoriesWithDataset.slice(startIndex, startIndex + storiesPerPage);
  }, [currentPage, storiesPerPage, allTeenStoriesWithDataset]);

  const totalPages = Math.ceil(allTeenStoriesWithDataset.length / storiesPerPage);

  const achievements = useMemo(() => {
    // Use server achievements if available, otherwise calculate locally
    if (serverAchievements.length > 0) {
      return serverAchievements.map((ach) => ({
        name: ach.name,
        icon: Star, // Default icon, can be enhanced later
        progress: ach.progress,
        emoji: ach.emoji,
        description: ach.description,
      }));
    }
    
    // Fallback to local calculations if server data not available
    const achievementList = [
    { 
      name: 'Advanced Learner', 
      icon: Star, 
        progress: Math.min(100, Math.round((points / 2500) * 100)),
      emoji: '🌟',
        description: `${points}/2500 points`,
    },
    { 
        name: 'Story Strategist',
      icon: BookOpen, 
        progress: Math.min(100, teenFavorites.length * 10),
      emoji: '📖',
        description: `${teenFavorites.length}/10 stories saved`,
    },
    { 
      name: 'Speaking Pro', 
      icon: Mic, 
      progress: Math.min(100, Math.min(pronunciationAttempts, 20) * 5), 
      emoji: '🎤',
        description: `${pronunciationAttempts} practiced`,
    },
    { 
      name: 'Vocabulary Expert', 
      icon: Brain, 
      progress: Math.min(100, Math.min(vocabularyAttempts, 20) * 5), 
      emoji: '🧠',
        description: `${vocabularyAttempts} words mastered`,
      },
      {
        name: 'Challenge Champion',
        icon: Trophy,
        progress: Math.min(100, Math.min(gamesAttempts, 4) * 25),
        emoji: '🏆',
        description: `${Math.min(gamesAttempts, 4)}/4 challenges`,
      },
    ];
    return achievementList;
  }, [serverAchievements, points, teenFavorites.length, pronunciationAttempts, vocabularyAttempts, gamesAttempts]);

  const completedAchievements = useMemo(() => {
    if (serverAchievements.length > 0) {
      // Use server unlocked status when available
      return serverAchievements.filter((a) => a.unlocked).length;
    }
    // Fallback to progress-based calculation
    return achievements.filter((a) => a.progress >= 100).length;
  }, [serverAchievements, achievements]);

  const categories = [
    { id: 'stories', label: 'Adventure Stories', emoji: '📚' },
    { id: 'vocabulary', label: 'Advanced Vocabulary', emoji: '🧠' },
    { id: 'pronunciation', label: 'Speaking Lab', emoji: '🎤' },
    { id: 'games', label: 'Challenge Arena', emoji: '🏆' },
  ];

  const openStoryModal = (storyType: keyof typeof TEEN_STORY_TYPE_TO_INTERNAL) => {
    switch (storyType) {
      case 'mystery':
        setShowMysteryDetective(true);
        break;
      case 'space':
        setShowSpaceExplorer(true);
        break;
      case 'environment':
        setShowEnvironmentalHero(true);
        break;
      case 'technology':
        setShowTechInnovator(true);
        break;
      case 'culture':
        setShowGlobalCitizen(true);
        break;
      case 'leadership':
        setShowFutureLeader(true);
        break;
      case 'science':
        setShowScientificDiscovery(true);
        break;
      case 'digital':
        setShowSocialMediaExpert(true);
        break;
      case 'ai':
        setShowAIEthics(true);
        break;
      case 'cybersecurity':
        setShowDigitalSecurity(true);
        break;
      default:
        break;
    }
  };

  const [showMysteryDetective, setShowMysteryDetective] = useState(false);
  const [showSpaceExplorer, setShowSpaceExplorer] = useState(false);
  const [showEnvironmentalHero, setShowEnvironmentalHero] = useState(false);
  const [showTechInnovator, setShowTechInnovator] = useState(false);
  const [showGlobalCitizen, setShowGlobalCitizen] = useState(false);
  const [showFutureLeader, setShowFutureLeader] = useState(false);
  const [showScientificDiscovery, setShowScientificDiscovery] = useState(false);
  const [showSocialMediaExpert, setShowSocialMediaExpert] = useState(false);
  const [showAIEthics, setShowAIEthics] = useState(false);
  const [showDigitalSecurity, setShowDigitalSecurity] = useState(false);
  const [showPageBlockedModal, setShowPageBlockedModal] = useState(false);
  const [pageEligibility, setPageEligibility] = useState<any>(null);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const instructions: Record<string, string> = {
      stories: "Let's tackle a new advanced story!",
      vocabulary: 'Time to expand your academic vocabulary!',
      pronunciation: 'Sharpen your pronunciation with real-world phrases!',
      games: 'Challenge yourself with advanced speaking games!',
    };

    if (isSoundEnabled) {
      speakWithSanitizedText(instructions[categoryId] || "Let's keep learning!", {
        rate: 1,
        emotion: 'excited',
      }).catch(() => undefined);
    }

    setActiveCategory(categoryId);
  };

  const toggleFavorite = async (storyId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const willAdd = !favorites.includes(storyId);
    const previousFavorites = favorites;
    const updatedFavorites = willAdd 
      ? [...favorites, storyId] 
      : favorites.filter((id) => id !== storyId);
    setFavorites(updatedFavorites);

    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        // Use TeenApi for teen stories
        await TeenApi.toggleFavorite(token, { storyId, add: willAdd });
      } else {
        // Fallback to local storage if offline
        try {
          const { API } = await import('@/services/ApiService');
          await API.kids.toggleFavorite(storyId, willAdd).catch(() => {
            // If API fails, save locally
            localStorage.setItem(`teen_favorites_${userId}`, JSON.stringify(updatedFavorites));
          });
        } catch (error) {
          // Save to local storage as fallback
          localStorage.setItem(`teen_favorites_${userId}`, JSON.stringify(updatedFavorites));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setFavorites(previousFavorites);
    }
  };

  const handleStartLesson = async (storyId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    // Check if user is eligible to access TeenKids page
    const requiresCheck = InitialRouteService.requiresEligibilityCheck('/kids/teen' as any);
    
    if (requiresCheck) {
      // Check if page is unlocked
      const eligibility = await PageEligibilityService.getEligibility('/kids/teen', true);
      
      if (!eligibility?.is_unlocked) {
        // Show blocked modal instead of allowing enrollment
        console.log('🚫 TeenKids page is locked - showing blocked modal');
        setShowPageBlockedModal(true);
        return;
      }
    }
    
    // Check if this is a template story (11-20)
    const storyIndex = parseInt(storyId.replace('teen-', ''), 10);
    if (storyIndex >= 10) {
      // This is a template story (11-20), use DynamicStoryAdventure
      const template = storyTemplates.find(t => t.storyNumber === storyIndex + 1);
      if (template && template.storySteps) {
        // Find the story from allTeenStoriesWithDataset to get the full story info
        const story = allTeenStoriesWithDataset.find((s) => s.id === storyId);
        if (!story) return;

        const internalId = getInternalStoryId(story.type);
        
        // Check if points were already awarded for this story enrollment
        const enrollmentPointsKey = `story_enrollment_points_${userId}_${internalId}`;
        const pointsAlreadyAwarded = localStorage.getItem(enrollmentPointsKey) === 'true';
        
        setCurrentTemplateStory({
          title: template.title,
          storySteps: template.storySteps,
          voiceProfile: template.voiceProfile || 'ClimateLeader',
          characterName: template.character || 'Leader',
          storyId: internalId,
          milestoneStepIds: template.milestoneStepIds || []
        });
        
        setCurrentStory(storyId);
        setIsPlaying(false);
        
        // Mark story as enrolled when started
        const storyEnrollments = StoryWordsService.getEnrolledStories(userId);
        const isAlreadyEnrolled = storyEnrollments.some(e => e.storyId === internalId);
        
        if (!isAlreadyEnrolled) {
          try {
            const enrollment = {
              storyId: internalId,
              storyTitle: story.title,
              storyType: story.type,
              completed: false,
              wordsExtracted: false,
              completedAt: undefined,
              score: undefined
            };
            const updatedEnrollments = [...storyEnrollments, enrollment];
            localStorage.setItem(`speakbee_story_enrollments_${userId}`, JSON.stringify(updatedEnrollments));
            
            // Immediately reload words and phrases for this enrolled story (TEEN KIDS ONLY)
            const storyWords = StoryWordsService.getWordsForStoryIdsByAge([internalId], 'teen');
            const storyPhrases = StoryWordsService.getPhrasesForStoryIdsByAge([internalId], 'teen');
            
            if (storyWords.length > 0 || storyPhrases.length > 0) {
              setEnrolledStoryWordsDetailed(prev => {
                const existing = new Set(prev.map(w => `${w.storyId}-${w.word}`));
                const toAdd = storyWords
                  .map(w => ({ word: w.word, hint: w.hint, storyId: w.storyId, storyTitle: w.storyTitle }))
                  .filter(w => !existing.has(`${w.storyId}-${w.word}`));
                return [...prev, ...toAdd];
              });
              
              setEnrolledStoryPhrasesDetailed(prev => {
                const existing = new Set(prev.map(p => `${p.storyId}-${p.phrase}`));
                const toAdd = storyPhrases
                  .map(p => ({ phrase: p.phrase, phonemes: p.phonemes, storyId: p.storyId, storyTitle: p.storyTitle }))
                  .filter(p => !existing.has(`${p.storyId}-${p.phrase}`));
                return [...prev, ...toAdd];
              });
              
              console.log(`✅ Immediately loaded ${storyWords.length} words and ${storyPhrases.length} phrases from enrolled TEEN story: ${story.title}`);
            }
          } catch (error) {
            console.warn('Failed to track story enrollment:', error);
          }
        }

        // Auto-add unlocked story to favorites if not already favorited
        if (!favorites.includes(storyId)) {
          const updatedFavorites = [...favorites, storyId];
          setFavorites(updatedFavorites);
          try {
            const token = localStorage.getItem('speakbee_auth_token');
            if (token && token !== 'local-token') {
              try {
                await TeenApi.toggleFavorite(token, { storyId, add: true }).catch(() => {});
              } catch (error) {
                console.warn('Error auto-adding to favorites:', error);
              }
            }
            localStorage.setItem(`teen_favorites_${userId}`, JSON.stringify(updatedFavorites));
          } catch (error) {
            console.warn('Error auto-adding story to favorites:', error);
          }
        }

        // Award points only if not already awarded
        if (!pointsAlreadyAwarded) {
          localStorage.setItem(enrollmentPointsKey, 'true');
        }

        void callTeenApi((token) =>
          TeenApi.startStory(token, {
            storyId,
            storyTitle: story.title,
            storyType: story.type,
          })
        );
        
        return;
      } else {
        console.warn(`Template not found for story ${storyIndex + 1}`);
      }
    }
    
    // Handle hardcoded stories (1-10)
    const story = allTeenStories.find((s) => s.id === storyId);
    if (!story) return;

    setCurrentStory(storyId);
    setIsPlaying(true);

    if (isSoundEnabled && !isOpeningFromFavorites) {
      await speakWithSanitizedText(
        `Welcome to ${story.title}. ${story.description} Ready to lead this challenge?`,
        { rate: 1.0, emotion: 'excited' }
      ).catch(() => undefined);
    }

    if (isOpeningFromFavorites) {
      setIsOpeningFromFavorites(false);
    }

    // Mark story as enrolled when started (not completed, but enrolled for tracking)
    const internalId = getInternalStoryId(story.type);
    const storyEnrollments = StoryWordsService.getEnrolledStories(userId);
    const isAlreadyEnrolled = storyEnrollments.some(e => e.storyId === internalId);
    
    // Check if points were already awarded for this story enrollment
    const enrollmentPointsKey = `story_enrollment_points_${userId}_${internalId}`;
    const pointsAlreadyAwarded = localStorage.getItem(enrollmentPointsKey) === 'true';
    
    // If not already enrolled, create a pending enrollment (completed: false)
    // This will make the enrolled badge appear immediately
    if (!isAlreadyEnrolled) {
      try {
        // Create enrollment with completed: false to track that user started the story
        const enrollment = {
          storyId: internalId,
          storyTitle: story.title,
          storyType: story.type,
          completed: false,
          wordsExtracted: false,
          completedAt: undefined,
          score: undefined
        };
        const updatedEnrollments = [...storyEnrollments, enrollment];
        localStorage.setItem(`speakbee_story_enrollments_${userId}`, JSON.stringify(updatedEnrollments));
        
        // Immediately reload words and phrases for this enrolled story (TEEN KIDS ONLY)
        const storyWords = StoryWordsService.getWordsForStoryIdsByAge([internalId], 'teen');
        const storyPhrases = StoryWordsService.getPhrasesForStoryIdsByAge([internalId], 'teen');
        
        if (storyWords.length > 0 || storyPhrases.length > 0) {
          setEnrolledStoryWordsDetailed(prev => {
            const existing = new Set(prev.map(w => `${w.storyId}-${w.word}`));
            const toAdd = storyWords
              .map(w => ({ word: w.word, hint: w.hint, storyId: w.storyId, storyTitle: w.storyTitle }))
              .filter(w => !existing.has(`${w.storyId}-${w.word}`));
            return [...prev, ...toAdd];
          });
          
          setEnrolledStoryPhrasesDetailed(prev => {
            const existing = new Set(prev.map(p => `${p.storyId}-${p.phrase}`));
            const toAdd = storyPhrases
              .map(p => ({ phrase: p.phrase, phonemes: p.phonemes, storyId: p.storyId, storyTitle: p.storyTitle }))
              .filter(p => !existing.has(`${p.storyId}-${p.phrase}`));
            return [...prev, ...toAdd];
          });
          
          console.log(`✅ Immediately loaded ${storyWords.length} words and ${storyPhrases.length} phrases from enrolled TEEN story: ${story.title}`);
        }
      } catch (error) {
        console.warn('Failed to track story enrollment:', error);
      }
    }

    // Auto-add unlocked story to favorites if not already favorited
    if (!favorites.includes(storyId)) {
      const updatedFavorites = [...favorites, storyId];
      setFavorites(updatedFavorites);
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          try {
            await TeenApi.toggleFavorite(token, { storyId, add: true }).catch(() => {});
          } catch (error) {
            console.warn('Error auto-adding to favorites:', error);
          }
        }
        localStorage.setItem(`teen_favorites_${userId}`, JSON.stringify(updatedFavorites));
      } catch (error) {
        console.warn('Error auto-adding story to favorites:', error);
      }
    }

    // Award points only if not already awarded
    if (!pointsAlreadyAwarded) {
      localStorage.setItem(enrollmentPointsKey, 'true');
    }

    void callTeenApi((token) =>
      TeenApi.startStory(token, {
        storyId,
        storyTitle: story.title,
        storyType: story.type,
      })
    );

    openStoryModal(story.type);
    setIsPlaying(false);
  };

  const handleAdventureComplete = async (storyId: string, score: number) => {
    if (!isAuthenticated) return;

    let story = allTeenStories.find((s) => s.id === storyId);
    
    // If not found in hardcoded stories, try dataset stories
    if (!story) {
      story = allTeenStoriesWithDataset.find((s) => s.id === storyId);
    }
    
    if (!story) return;

    // Immediately mark story as completed locally for instant badge display
    const internalId = getInternalStoryId(story.type);
    
    // Save story enrollment to StoryWordsService so it appears in badges section
    // This will automatically update completedStoryIds via useMemo
    await StoryWordsService.enrollInStory(userId, internalId, story.title, story.type, score);

    // Immediately update enrolled words and phrases from the completed story
    // FILTERED TO TEEN ONLY
    const newWords = StoryWordsService.getWordsForStoryIdsByAge([internalId], 'teen');
    const newPhrases = StoryWordsService.getPhrasesForStoryIdsByAge([internalId], 'teen');

    // Update enrolled words and phrases immediately
    setEnrolledStoryWordsDetailed((prev) => {
      const existing = new Set(prev.map((w) => `${w.storyId}-${w.word}`));
      const toAdd = newWords
        .map((w) => ({ word: w.word, hint: w.hint, storyId: w.storyId, storyTitle: w.storyTitle }))
        .filter((w) => !existing.has(`${w.storyId}-${w.word}`));
      return [...prev, ...toAdd];
    });

    setEnrolledStoryPhrasesDetailed((prev) => {
      const existing = new Set(prev.map((p) => `${p.storyId}-${p.phrase}`));
      const toAdd = newPhrases
        .map((p) => ({ phrase: p.phrase, phonemes: p.phonemes, storyId: p.storyId, storyTitle: p.storyTitle }))
        .filter((p) => !existing.has(`${p.storyId}-${p.phrase}`));
      return [...prev, ...toAdd];
    });
    
    // Check if this is a story 11-19, and if so, unlock the next story (12-20)
    const completedStoryIndex = parseInt(storyId.replace('teen-', ''), 10);
    if (completedStoryIndex >= 10 && completedStoryIndex < 19) {
      // This is a story 11-19, unlock the next story
      const nextStoryNumber = completedStoryIndex + 2; // Story 11 (index 10) unlocks story 12 (number 12)
      const nextStory = datasetStories.find(ds => ds.storyNumber === nextStoryNumber);
      if (nextStory) {
        const nextStoryInternalId = getInternalStoryId(nextStory.type);
        const nextStoryEnrollments = StoryWordsService.getEnrolledStories(userId);
        const isNextStoryEnrolled = nextStoryEnrollments.some(e => e.storyId === nextStoryInternalId);
        
        if (!isNextStoryEnrolled) {
          // Auto-enroll in next story
          try {
            const enrollment = {
              storyId: nextStoryInternalId,
              storyTitle: nextStory.title,
              storyType: nextStory.type,
              completed: false,
              wordsExtracted: false,
              completedAt: undefined,
              score: undefined
            };
            const updatedEnrollments = [...nextStoryEnrollments, enrollment];
            localStorage.setItem(`speakbee_story_enrollments_${userId}`, JSON.stringify(updatedEnrollments));
            
            // Load words/phrases for next story
            const nextStoryWords = StoryWordsService.getWordsForStoryIdsByAge([nextStoryInternalId], 'teen');
            const nextStoryPhrases = StoryWordsService.getPhrasesForStoryIdsByAge([nextStoryInternalId], 'teen');
            
            if (nextStoryWords.length > 0 || nextStoryPhrases.length > 0) {
              setEnrolledStoryWordsDetailed(prev => {
                const existing = new Set(prev.map(w => `${w.storyId}-${w.word}`));
                const toAdd = nextStoryWords
                  .map(w => ({ word: w.word, hint: w.hint, storyId: w.storyId, storyTitle: w.storyTitle }))
                  .filter(w => !existing.has(`${w.storyId}-${w.word}`));
                return [...prev, ...toAdd];
              });
              
              setEnrolledStoryPhrasesDetailed(prev => {
                const existing = new Set(prev.map(p => `${p.storyId}-${p.phrase}`));
                const toAdd = nextStoryPhrases
                  .map(p => ({ phrase: p.phrase, phonemes: p.phonemes, storyId: p.storyId, storyTitle: p.storyTitle }))
                  .filter(p => !existing.has(`${p.storyId}-${p.phrase}`));
                return [...prev, ...toAdd];
              });
              
              console.log(`✅ Auto-unlocked next teen story ${nextStoryNumber}: ${nextStory.title}`);
            }
          } catch (error) {
            console.warn(`Failed to auto-unlock teen story ${nextStoryNumber}:`, error);
          }
        }
      }
    }

    // Call API to sync with server and update points
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        const response = await TeenApi.completeStory(token, {
          storyId,
          storyTitle: story.title,
          storyType: story.type,
          score,
        });
        
        // Update points immediately from API response (points already include the reward)
        if (response && typeof response === 'object' && 'points' in response) {
          const pointsValue = (response as any).points;
          if (pointsValue !== undefined) {
            setPoints(Number(pointsValue) || 0);
          }
        }
        
        // Refresh dashboard after a short delay to sync server state
        // Use merge mode to preserve our immediate updates and get latest server data
        setTimeout(async () => {
          try {
            const dashboardData = await TeenApi.getDashboard(token);
            if (dashboardData) {
              // Merge server data with our immediate updates (preserves badge and points)
              // This will update achievements from server
              applyDashboard(dashboardData, true);
              // Clear category progress cache so Profile page shows updated data
              MultiCategoryProgressService.clearCache();
            }
          } catch (error) {
            console.error('Error refreshing dashboard after completion:', error);
          }
        }, 1500);
      }
    } catch (error) {
      console.error('Error completing story:', error);
      // State is already updated locally, so badge will still show
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleAuthModalClose}
          initialMode={authMode}
          redirectFromKids
          onAuthSuccess={handleAuthSuccess}
        />
        <Card className="max-w-xl w-full shadow-xl border-none">
          <CardContent className="py-12 px-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-8 w-8 text-primary" />
          </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-foreground">Teen Explorer Zone</h1>
              <p className="text-base text-muted-foreground">
                Advanced missions, debate-ready vocabulary, and professional speaking practice. Sign in to keep leveling up.
              </p>
            </div>
            <Button onClick={() => setShowAuthModal(true)} size="lg" className="w-full">
              {authMode === 'login' ? 'Sign in to continue' : 'Create an account'}
          </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-muted/20 pb-24">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
        initialMode={authMode}
        redirectFromKids
        onAuthSuccess={handleAuthSuccess}
      />
      <main className="container mx-auto max-w-6xl px-4 pt-24 pb-16 space-y-10">
        <section>
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#0F3D3E] via-[#146356] to-[#1B7F6E] text-white shadow-xl">
            <span className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <span className="absolute -left-28 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <CardHeader className="space-y-6 relative z-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4 lg:max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full bg-white/20 text-white uppercase tracking-wide">
                      Teen Learners
                    </Badge>
                    <SyncStatusIndicator showDetails={false} className="bg-white/20 text-white backdrop-blur-sm" />
                    <Badge className="rounded-full bg-white/20 text-white">
                      {modelsReady ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          AI tutor ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing offline tools
                        </span>
                      )}
                    </Badge>
                    {isInitializing && (
                      <Badge className="rounded-full bg-white/10 text-white">
                        Initialising teen environment…
                      </Badge>
                    )}
        </div>
                  <CardTitle className="text-3xl md:text-4xl font-semibold text-white leading-tight">
                    Modern English experiences for future leaders
                  </CardTitle>
                  <CardDescription className="text-white/85 text-base md:text-lg leading-relaxed">
                    Dive into mission-based stories, advanced vocabulary labs, and professional speaking practice designed for confident teens.
                  </CardDescription>
        </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
            <Button
              variant="ghost"
                    size="icon"
                    onClick={() => setIsSoundEnabled((prev) => !prev)}
                    className="rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:ring-offset-0"
                    title={isSoundEnabled ? 'Mute narration' : 'Enable narration'}
                  >
                    {isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
                    size="icon"
                    onClick={() => setIsMusicEnabled((prev) => !prev)}
                    className="rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:ring-offset-0"
                    title={isMusicEnabled ? 'Pause ambient sound' : 'Play ambient sound'}
                  >
                    <Headphones className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
                    size="icon"
                    onClick={() => setShowHelp((prev) => !prev)}
                    className="rounded-full bg-white/15 text-white hover:bg-white/25"
                    title="Show quick tips"
                  >
                    <BookOpen className="h-5 w-5" />
            </Button>
          </div>
            </div>
              {showHelp && (
                <Card className="bg-white/80 text-slate-900 backdrop-blur-md shadow-lg lg:absolute lg:right-6 lg:top-6 lg:max-w-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900">Quick tips</CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Complete stories to unlock curated vocabulary and speaking labs. Track your streak to secure elite certificates.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">Progress snapshot</h2>
            <span className="text-sm text-muted-foreground">Teen metrics update automatically</span>
            </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Achievement Points ✨</CardTitle>
                <Trophy className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-3xl font-semibold text-foreground">{points}</p>
                <p className="text-sm text-muted-foreground">
                  Earned exclusively from teen missions, vocabulary labs, speaking practice, and challenge arenas.
              </p>
            </CardContent>
          </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Learning Streak 🔥</CardTitle>
                <Target className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-3xl font-semibold text-foreground">{streak} days</p>
                <p className="text-sm text-muted-foreground">
                  Stay consistent with teen-focused practice to unlock elite certificates and badges.
              </p>
            </CardContent>
          </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Practice Time</CardTitle>
                <Clock className="h-5 w-5 text-sky-500" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-3xl font-semibold text-foreground">
                  {(loadingCategoryProgress || loadingCategoriesRealTime) ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : (
                    `${Math.round(categoryProgress?.practice_time_minutes || 0)} mins`
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Time spent on missions, vocabulary labs, and speaking practice.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Missions Completed</CardTitle>
                <BookOpen className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-3xl font-semibold text-foreground">
                  {(loadingCategoryProgress || loadingCategoriesRealTime) ? (
                    <Loader2 className="h-6 w-6 animate-spin inline" />
                  ) : (
                    categoryProgress?.stories_completed || categoryProgress?.lessons_completed || 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Story missions completed in your learning journey.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Advanced Achievements 🏆</CardTitle>
                <Award className="h-5 w-5 text-sky-500" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-semibold text-foreground">{completedAchievements}</p>
                  <p className="text-sm text-muted-foreground">of {achievements.length} unlocked</p>
              </div>
                <Progress value={(completedAchievements / achievements.length) * 100} />
            </CardContent>
          </Card>
        </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">Learning hub</h2>
            <p className="text-sm text-muted-foreground">Switch between story campaigns, vocabulary labs, speaking practice, and challenge games.</p>
          </div>
          <Tabs value={activeCategory} onValueChange={handleCategoryClick} className="space-y-6">
            <TabsList className="flex w-full gap-2 overflow-x-auto rounded-xl bg-muted/40 p-1 backdrop-blur sm:grid sm:grid-cols-4 sm:overflow-visible sm:bg-transparent sm:p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="min-w-[160px] rounded-lg px-3 py-2 text-sm font-semibold transition data-[state=active]:bg-background data-[state=active]:shadow sm:min-w-0"
                >
                  <span className="mr-2 text-lg">{category.emoji}</span>
                    {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="stories" className="mt-0 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedStories.map((story) => {
                  const internalId = getInternalStoryId(story.type);
                  // Check if enrolled: either through words/phrases (internal ID) OR through completed story IDs
                  // Also check StoryWordsService directly for enrolled stories (both started and completed)
                  const storyEnrollments = StoryWordsService.getEnrolledStories(userId);
                  const isEnrolledInService = storyEnrollments.some(e => e.storyId === internalId);
                  const isEnrolled = enrolledInternalStoryIds.has(internalId) || 
                                    completedStoryIds.has(internalId) || 
                                    allEnrolledStoryIds.has(internalId) ||
                                    isEnrolledInService;
                const CharacterIcon = story.character;
                
                // Check if story is from dataset and if it's unlocked
                const storyIndex = parseInt(story.id.replace('teen-', ''), 10);
                const isDatasetStory = storyIndex >= 10; // Stories 11-20 (indices 10-19)
                
                let isUnlocked = true; // Base stories 1-10 are always unlocked
                
                if (isDatasetStory) {
                  // For story 11 (index 10), check if story 10 (index 9) is completed
                  // For story 12 (index 11), check if story 11 (index 10) is completed, etc.
                  const previousStoryIndex = storyIndex - 1;
                  
                  if (previousStoryIndex < 10) {
                    // Previous story is in base stories (1-10)
                    const previousStory = allTeenStories[previousStoryIndex];
                    if (previousStory) {
                      const previousInternalId = getInternalStoryId(previousStory.type);
                      const storyEnrollmentsForUnlock = StoryWordsService.getEnrolledStories(userId);
                      const isPreviousEnrolledForUnlock = storyEnrollmentsForUnlock.some(e => e.storyId === previousInternalId);
                      isUnlocked = completedStoryIds.has(previousInternalId) || 
                                  enrolledInternalStoryIds.has(previousInternalId) ||
                                  allEnrolledStoryIds.has(previousInternalId) ||
                                  isPreviousEnrolledForUnlock;
                    }
                  } else {
                    // Previous story is also a dataset story (11-20)
                    // Check if previous dataset story is completed
                    const previousDatasetStory = datasetStories.find(
                      ds => ds.storyNumber - 1 === previousStoryIndex
                    );
                    if (previousDatasetStory) {
                      const previousInternalId = getInternalStoryId(previousDatasetStory.type);
                      const storyEnrollments = StoryWordsService.getEnrolledStories(userId);
                      const isPreviousEnrolled = storyEnrollments.some(e => e.storyId === previousInternalId);
                      isUnlocked = completedStoryIds.has(previousInternalId) || 
                                  enrolledInternalStoryIds.has(previousInternalId) ||
                                  allEnrolledStoryIds.has(previousInternalId) ||
                                  isPreviousEnrolled;
                    }
                  }
                }
                
                return (
                    <Card key={story.id} className={cn(
                      "flex h-full flex-col overflow-hidden border border-muted shadow-sm transition hover:shadow-lg",
                      !isUnlocked && "opacity-60"
                    )}>
                      <div className={cn('relative overflow-hidden bg-gradient-to-br p-4 text-white', story.bgGradient)}>
                        <div className="flex items-start justify-between gap-2">
                          <span className={cn('text-4xl sm:text-5xl', story.animation)}>{story.image}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(story.id)}
                            className="rounded-full bg-black/15 text-white hover:bg-black/25"
                          >
                            <Heart
                              className={cn('h-4 w-4', favorites.includes(story.id) && 'fill-current text-rose-400')}
                            />
                          </Button>
                            </div>
                        <div className="absolute top-3 right-3" />
                        <div className="mt-4 space-y-1.5">
                          <CardTitle className="text-lg font-semibold text-white">{story.title}</CardTitle>
                          <p className="text-xs text-white/85 leading-relaxed">{story.description}</p>
                          </div>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-white/80">
                          <Badge className="bg-white/20 text-white">⏱ {story.duration}</Badge>
                          <Badge className="bg-white/20 text-white">📚 {story.words} words</Badge>
                          <Badge className="bg-white/20 text-white">🎯 {story.difficulty}</Badge>
                        </div>
                        {isEnrolled && (
                          <Badge className="absolute left-3 top-3 bg-white/90 text-indigo-600">
                            <CheckCircle className="mr-1 h-3 w-3" /> Enrolled
                          </Badge>
                        )}
                        {!isUnlocked && (
                          <Badge className="absolute right-3 top-3 bg-black/50 text-white">
                            <Lock className="mr-1 h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      <CardContent className="flex flex-1 flex-col justify-between space-y-3 p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CharacterIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate capitalize">Focus: {story.type.replace('-', ' ')}</span>
                        </div>
                        {!isUnlocked ? (
                          <div className="space-y-2">
                            <Button
                              disabled
                              className="w-full py-2 text-sm"
                              variant="secondary"
                            >
                              <Lock className="mr-2 h-4 w-4" />
                              Complete previous story to unlock
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                              Finish story {storyIndex} to unlock this mission
                            </p>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleStartLesson(story.id)}
                            disabled={isPlaying && currentStory === story.id}
                            className="w-full py-2 text-sm"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {isPlaying && currentStory === story.id ? 'Starting…' : 'Start mission'}
                          </Button>
                        )}
                        {/* Show lock indicator if page is blocked */}
                        {(() => {
                          const requiresCheck = InitialRouteService.requiresEligibilityCheck('/kids/teen' as any);
                          if (requiresCheck && !pageEligibility?.is_unlocked) {
                            return (
                              <div className="mt-2 text-xs text-muted-foreground text-center">
                                <Lock className="h-3 w-3 inline mr-1" />
                                Page locked - complete requirements to unlock
                              </div>
                            );
                          }
                          return null;
                        })()}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-muted px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * storiesPerPage + 1}-
                    {Math.min(currentPage * storiesPerPage, allTeenStoriesWithDataset.length)} of {allTeenStoriesWithDataset.length} missions
                  </span>
                  <div className="flex items-center gap-2">
                <Button
                      variant="ghost"
                      size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                      <ChevronLeft className="h-4 w-4" />
                </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                      <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
          </div>
        )}
            </TabsContent>

            <TabsContent value="vocabulary" className="mt-0 space-y-4">
              {vocabularyWordsToUse.length === 0 ? (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">Unlock advanced vocabulary</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Finish teen story missions to automatically add their vocabulary here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => handleCategoryClick('stories')} variant="default">
                      Browse missions
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Words appear instantly once you complete a teen story.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-primary" />
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Words from your teen missions</h3>
                        <p className="text-sm text-muted-foreground">
                          {vocabularyWordsToUse.length} advanced words available for practice
                      </p>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Filter</label>
                      <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={selectedStoryFilter}
                        onChange={(e) => setSelectedStoryFilter(e.target.value)}
                      >
                        <option value="all">All stories</option>
                        {/* Only show the 20 Teen Kids stories in the filter */}
                        {Array.from(new Map(enrolledStoryWordsDetailed.map((w) => [w.storyId, w.storyTitle])).entries())
                          .filter(([id]) => {
                            // Only include stories that are in TEEN_KIDS_STORIES set
                            const TEEN_KIDS_STORIES = new Set([
                              'mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator',
                              'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert',
                              'ai-ethics-explorer', 'digital-security-guardian', 'climate-action', 'startup',
                              'diplomacy', 'medical-research', 'social-impact', 'data-science',
                              'engineering', 'content-strategy', 'ethical-ai', 'innovation-summit'
                            ]);
                            return TEEN_KIDS_STORIES.has(id);
                          })
                          .map(([id, title]) => (
                            <option key={id} value={id}>
                              {title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                <Vocabulary
                  key={`${selectedStoryFilter}-${vocabularyWordsToUse.length}`}
                  words={vocabularyWordsToUse}
                  onWordPracticed={async (word: string) => {
                    // Check eligibility before allowing practice
                    const requiresCheck = InitialRouteService.requiresEligibilityCheck('/kids/teen' as any);
                    if (requiresCheck) {
                      const eligibility = await PageEligibilityService.getEligibility('/kids/teen', true);
                      if (!eligibility?.is_unlocked) {
                        setShowPageBlockedModal(true);
                        return;
                      }
                    }
                    
                    // Check if points were already awarded for this word
                    const wordPointsKey = `vocab_points_${userId}_${word}`;
                    const pointsAlreadyAwarded = localStorage.getItem(wordPointsKey) === 'true';
                    
                    // Only increment attempts if not already mastered
                    if (!pointsAlreadyAwarded) {
                      setVocabularyAttempts((prev) => prev + 1);
                    }
                    
                    const wordDetail = enrolledStoryWordsDetailed.find((w) => w.word === word);
                    
                    // Only award points once per word
                    if (!pointsAlreadyAwarded) {
                      await callTeenApi(
                        (token) =>
                          TeenApi.recordVocabularyPractice(token, {
                            word,
                            storyId: wordDetail?.storyId,
                            storyTitle: wordDetail?.storyTitle,
                            score: 100,
                            pointsAwarded: 25,
                          }),
                        () => {
                          setPoints((prev) => prev + 25);
                          localStorage.setItem(wordPointsKey, 'true');
                          // Clear category progress cache so Profile page shows updated data
                          MultiCategoryProgressService.clearCache();
                        }
                      );
                    } else {
                      // Still record practice but without points
                      await callTeenApi(
                        (token) =>
                          TeenApi.recordVocabularyPractice(token, {
                            word,
                            storyId: wordDetail?.storyId,
                            storyTitle: wordDetail?.storyTitle,
                            score: 100,
                            pointsAwarded: 0,
                          }),
                        () => {
                          MultiCategoryProgressService.clearCache();
                        }
                      );
                    }
                  }}
                />
              </div>
              )}
            </TabsContent>

            <TabsContent value="pronunciation" className="mt-0 space-y-4">
              {pronunciationItems.length === 0 ? (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">Unlock the speaking lab</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Complete teen stories to add their debate-worthy phrases here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => handleCategoryClick('stories')} variant="default">
                      Complete a mission
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Phrases unlock instantly after each adventure.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                      <Mic className="h-5 w-5 text-primary" />
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Professional speaking studio</h3>
                        <p className="text-sm text-muted-foreground">
                          {pronunciationItems.length} advanced phrases ready for practice
                      </p>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Filter</label>
                      <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={selectedPhraseFilter}
                        onChange={(e) => setSelectedPhraseFilter(e.target.value)}
                      >
                        <option value="all">All stories</option>
                        {/* Only show the 20 Teen Kids stories in the filter */}
                        {Array.from(new Map(enrolledStoryPhrasesDetailed.map((p) => [p.storyId, p.storyTitle])).entries())
                          .filter(([id]) => {
                            // Only include stories that are in TEEN_KIDS_STORIES set
                            const TEEN_KIDS_STORIES = new Set([
                              'mystery-detective', 'space-explorer-teen', 'environmental-hero', 'tech-innovator',
                              'global-citizen', 'future-leader', 'scientific-discovery', 'social-media-expert',
                              'ai-ethics-explorer', 'digital-security-guardian', 'climate-action', 'startup',
                              'diplomacy', 'medical-research', 'social-impact', 'data-science',
                              'engineering', 'content-strategy', 'ethical-ai', 'innovation-summit'
                            ]);
                            return TEEN_KIDS_STORIES.has(id);
                          })
                          .map(([id, title]) => (
                            <option key={id} value={id}>
                              {title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                <Pronunciation
                  key={`${selectedPhraseFilter}-${pronunciationItems.length}`}
                  items={pronunciationItems}
                  onPhrasePracticed={async (phrase: string) => {
                    // Check eligibility before allowing practice
                    const requiresCheck = InitialRouteService.requiresEligibilityCheck('/kids/teen' as any);
                    if (requiresCheck) {
                      const eligibility = await PageEligibilityService.getEligibility('/kids/teen', true);
                      if (!eligibility?.is_unlocked) {
                        setShowPageBlockedModal(true);
                        return;
                      }
                    }
                    
                    // Check if points were already awarded for this phrase
                    const phrasePointsKey = `pronunciation_points_${userId}_${phrase}`;
                    const pointsAlreadyAwarded = localStorage.getItem(phrasePointsKey) === 'true';
                    
                    // Only increment attempts if not already mastered
                    if (!pointsAlreadyAwarded) {
                      setPronunciationAttempts((prev) => prev + 1);
                    }
                    
                    const phraseDetail = enrolledStoryPhrasesDetailed.find((p) => p.phrase === phrase);
                    
                    // Only award points once per phrase
                    if (!pointsAlreadyAwarded) {
                      await callTeenApi(
                        (token) =>
                          TeenApi.recordPronunciationPractice(token, {
                            phrase,
                            storyId: phraseDetail?.storyId,
                            storyTitle: phraseDetail?.storyTitle,
                            score: 100,
                            pointsAwarded: 35,
                          }),
                        () => {
                          setPoints((prev) => prev + 35);
                          localStorage.setItem(phrasePointsKey, 'true');
                          // Clear category progress cache so Profile page shows updated data
                          MultiCategoryProgressService.clearCache();
                        }
                      );
                    } else {
                      // Still record practice but without points
                      await callTeenApi(
                        (token) =>
                          TeenApi.recordPronunciationPractice(token, {
                            phrase,
                            storyId: phraseDetail?.storyId,
                            storyTitle: phraseDetail?.storyTitle,
                            score: 100,
                            pointsAwarded: 0,
                          }),
                        () => {
                          MultiCategoryProgressService.clearCache();
                        }
                      );
                    }
                  }}
                />
              </div>
              )}
            </TabsContent>

            <TabsContent value="games" className="mt-0">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Interactive challenges</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Reinforce debate, storytelling, and critical thinking with high-energy mini games built for teens.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InteractiveGames isTeenKids />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">Achievement roadmap</h2>
            <p className="text-sm text-muted-foreground">Collect badges as you lead missions, master vocabulary, and speak with confidence.</p>
          </div>
          <Card className="shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement, index) => {
                  const isComplete = achievement.progress >= 100;
              return (
                <div 
                      key={`${achievement.name}-${index}`}
                      className="rounded-xl border border-muted bg-card p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                    <div 
                      className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            isComplete ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {achievement.emoji}
                      </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                    </div>
                      <div className="mt-4 space-y-2">
                        <Progress value={achievement.progress} />
                        <p className="text-xs font-medium text-muted-foreground">
                          {achievement.progress.toFixed(0)}% complete
                        </p>
                      </div>
                </div>
              );
            })}
          </div>
            </CardContent>
        </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="shadow-sm transition hover:shadow-md">
              <CardContent className="flex h-full flex-col justify-between space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-emerald-500" />
                    <p className="text-sm font-semibold text-foreground">Listening lab</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jump straight into pronunciation recap for your unlocked teen phrases.
                  </p>
                </div>
            <Button 
                  variant="secondary"
                  onClick={() => {
                handleCategoryClick('pronunciation');
                setSearchParams({ section: 'pronunciation' }, { replace: true });
                  }}
                >
                  Start practising
            </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm transition hover:shadow-md">
              <CardContent className="flex h-full flex-col justify-between space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Mic className="h-5 w-5 text-sky-500" />
                    <p className="text-sm font-semibold text-foreground">Speak now</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Record a concise pitch to keep your streak alive and earn speaking badges.
                  </p>
                </div>
            <Button 
                  variant="secondary"
                  onClick={() => {
                handleCategoryClick('vocabulary');
                setSearchParams({ section: 'vocabulary' }, { replace: true });
                  }}
                >
                  Open studio
            </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm transition hover:shadow-md">
              <CardContent className="flex h-full flex-col justify-between space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-rose-500" />
                    <p className="text-sm font-semibold text-foreground">Favourite missions</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review and launch the teen adventures you've saved for quick replay.
                  </p>
                </div>
            <Button 
                  variant="secondary"
                  onClick={() => {
                    navigate('/favorites');
                  }}
                >
                  View favourites
            </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm transition hover:shadow-md">
              <CardContent className="flex h-full flex-col justify-between space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-violet-500" />
                    <p className="text-sm font-semibold text-foreground">Certificates</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Download personalised certificates that recognise your teen achievements.
                  </p>
                </div>
            <Button 
                  variant="secondary"
              onClick={() => {
                    try {
                      sessionStorage.setItem('speakbee_certificates_audience', 'teen');
                    } catch {
                      // ignore
                    }
                    navigate('/certificates', { state: { audience: 'teen' } });
                  }}
                >
                  Open certificates
            </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {showMysteryDetective && (
        <MysteryDetectiveAdventure 
          onClose={() => setShowMysteryDetective(false)} 
          onComplete={async (score) => {
            setShowMysteryDetective(false);
            await handleAdventureComplete('teen-0', score);
          }}
        />
      )}
      {showSpaceExplorer && (
        <SpaceExplorerAdventure 
          onClose={() => setShowSpaceExplorer(false)} 
          onComplete={async (score) => {
            setShowSpaceExplorer(false);
            await handleAdventureComplete('teen-1', score);
          }}
        />
      )}
      {showEnvironmentalHero && (
        <EnvironmentalHeroAdventure 
          onClose={() => setShowEnvironmentalHero(false)} 
          onComplete={async (score) => {
            setShowEnvironmentalHero(false);
            await handleAdventureComplete('teen-2', score);
          }}
        />
      )}
      {showTechInnovator && (
        <TechInnovatorAdventure 
          onClose={() => setShowTechInnovator(false)} 
          onComplete={async (score) => {
            setShowTechInnovator(false);
            await handleAdventureComplete('teen-3', score);
          }}
        />
      )}
      {showGlobalCitizen && (
        <GlobalCitizenAdventure 
          onClose={() => setShowGlobalCitizen(false)} 
          onComplete={async (score) => {
            setShowGlobalCitizen(false);
            await handleAdventureComplete('teen-4', score);
          }}
        />
      )}
      {showFutureLeader && (
        <FutureLeaderAdventure 
          onClose={() => setShowFutureLeader(false)} 
          onComplete={async (score) => {
            setShowFutureLeader(false);
            await handleAdventureComplete('teen-5', score);
          }}
        />
      )}
      {showScientificDiscovery && (
        <ScientificDiscoveryAdventure 
          onClose={() => setShowScientificDiscovery(false)} 
          onComplete={async (score) => {
            setShowScientificDiscovery(false);
            await handleAdventureComplete('teen-6', score);
          }}
        />
      )}
      {showSocialMediaExpert && (
        <SocialMediaExpertAdventure 
          onClose={() => setShowSocialMediaExpert(false)} 
          onComplete={async (score) => {
            setShowSocialMediaExpert(false);
            await handleAdventureComplete('teen-7', score);
          }}
        />
      )}
      {showAIEthics && (
        <AIEthicsExplorerAdventure 
          onClose={() => setShowAIEthics(false)} 
          onComplete={async (score) => {
            setShowAIEthics(false);
            await handleAdventureComplete('teen-8', score);
          }}
        />
      )}
      {showDigitalSecurity && (
        <DigitalSecurityGuardianAdventure 
          onClose={() => setShowDigitalSecurity(false)} 
          onComplete={async (score) => {
            setShowDigitalSecurity(false);
            await handleAdventureComplete('teen-9', score);
          }}
        />
      )}

      {/* Template Stories (11-20) using DynamicStoryAdventure */}
      {currentTemplateStory && (
        <DynamicStoryAdventure
          onClose={() => {
            setCurrentTemplateStory(null);
            setCurrentStory('');
          }}
          onComplete={async (score) => {
            const storyId = currentStory;
            setCurrentTemplateStory(null);
            setCurrentStory('');
            await handleAdventureComplete(storyId, score);
          }}
          storyData={{
            title: currentTemplateStory.title,
            storySteps: currentTemplateStory.storySteps as any, // Cast to StoryStep[] - the JSON structure matches at runtime
            voiceProfile: currentTemplateStory.voiceProfile || 'ClimateLeader',
            characterName: currentTemplateStory.characterName || 'Leader',
            storyId: currentTemplateStory.storyId,
            milestoneStepIds: currentTemplateStory.milestoneStepIds || []
          } as any}
        />
      )}

      {/* Page Blocked Modal */}
      <PageBlockedModal
        isOpen={showPageBlockedModal}
        onClose={() => setShowPageBlockedModal(false)}
        pagePath="/kids/teen"
        fallbackPage="/kids/young"
      />
    </div>
  );
};

export default TeenKidsPage;
