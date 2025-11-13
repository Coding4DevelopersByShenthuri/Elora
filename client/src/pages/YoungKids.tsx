import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2, Star, Trophy, Play, BookOpen,
  Mic, Award, Zap, Heart, Sparkles,
  Rabbit, Fish, Rocket,
  Sun, Footprints,
  ChevronLeft, ChevronRight, Anchor,
  Shield, Loader2, Crown, Compass,
  Music, VolumeX, HelpCircle, CheckCircle, Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import KidsProgressService from '@/services/KidsProgressService';
import KidsApi from '@/services/KidsApi';
import StoryWordsService from '@/services/StoryWordsService';
import Vocabulary from '@/components/kids/Vocabulary';
import Pronunciation from '@/components/kids/Pronunciation';
import InteractiveGames from '@/components/kids/InteractiveGames';
import SyncStatusIndicator from '@/components/kids/SyncStatusIndicator';
import MagicForestAdventure from '@/components/kids/stories/MagicForestAdventure';
import SpaceAdventure from '@/components/kids/stories/SpaceAdventure';
import UnderwaterWorld from '@/components/kids/stories/UnderwaterWorld';
import DinosaurDiscoveryAdventure from '@/components/kids/stories/DinosaurDiscoveryAdventure';
import UnicornMagicAdventure from '@/components/kids/stories/UnicornMagicAdventure';
import PirateTreasureAdventure from '@/components/kids/stories/PirateTreasureAdventure';
import SuperheroAdventure from '@/components/kids/stories/SuperheroSchoolAdventure';
import FairyGardenAdventure from '@/components/kids/stories/FairyGardenAdventure';
import RainbowCastleAdventure from '@/components/kids/stories/RainbowCastleAdventure';
import JungleExplorerAdventure from '@/components/kids/stories/JungleExplorerAdventure';
import DynamicStoryAdventure from '@/components/kids/stories/DynamicStoryAdventure';
import AuthModal from '@/components/auth/AuthModal';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import HybridServiceManager from '@/services/HybridServiceManager';
import { ModelManager } from '@/services/ModelManager';
import { WhisperService } from '@/services/WhisperService';
import { TransformersService } from '@/services/TransformersService';
import { TimeTracker } from '@/services/TimeTracker';
import EnhancedTTS from '@/services/EnhancedTTS';
import { StoryDatasetService, type DatasetStory } from '@/services/StoryDatasetService';
import { useRealTimeData } from '@/hooks/useRealTimeData';

const YoungKidsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('section') || 'stories';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isOpeningFromFavorites, setIsOpeningFromFavorites] = useState(false);
  const [currentStory, setCurrentStory] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showMagicForest, setShowMagicForest] = useState(false);
  const [showSpaceAdventure, setShowSpaceAdventure] = useState(false);
  const [showUnderwaterWorld, setShowUnderwaterWorld] = useState(false);
  const [showDinosaurAdventure, setShowDinosaurAdventure] = useState(false);
  const [showUnicornAdventure, setShowUnicornAdventure] = useState(false);
  const [showPirateAdventure, setShowPirateAdventure] = useState(false);
  const [showSuperheroAdventure, setShowSuperheroAdventure] = useState(false);
  const [showFairyGardenAdventure, setShowFairyGardenAdventure] = useState(false);
  const [showRainbowCastleAdventure, setShowRainbowCastleAdventure] = useState(false);
  const [showJungleExplorerAdventure, setShowJungleExplorerAdventure] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pronunciationAttempts, setPronunciationAttempts] = useState(0);
  const [vocabularyAttempts, setVocabularyAttempts] = useState(0);
  const [gamesAttempts, setGamesAttempts] = useState(0);
  const [enrolledStoryWordsDetailed, setEnrolledStoryWordsDetailed] = useState<Array<{ word: string; hint: string; storyId: string; storyTitle: string }>>([]);
  const [selectedStoryFilter, setSelectedStoryFilter] = useState<string>('all');
  const [enrolledStoryPhrasesDetailed, setEnrolledStoryPhrasesDetailed] = useState<Array<{ phrase: string; phonemes: string; storyId: string; storyTitle: string }>>([]);
  const [selectedPhraseFilter, setSelectedPhraseFilter] = useState<string>('all');
  const storiesPerPage = 6;
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Type for server-provided achievement objects (avoid using `any`)
  type ServerAchievement = {
    unlocked?: boolean;
    id?: string;
    name?: string;
    progress?: number;
    [key: string]: unknown;
  };

  // Type for story templates
  type StoryTemplate = {
    title: string;
    storyNumber: number;
    storySteps: Array<{
      [key: string]: unknown;
    }>;
    voiceProfile?: string;
    character?: string;
    milestoneStepIds?: string[];
  };

  // Type for current template story data
  type CurrentTemplateStory = {
    title: string;
    storySteps: Array<{
      [key: string]: unknown;
    }>;
    voiceProfile?: string;
    characterName?: string;
    storyId: string;
    milestoneStepIds?: string[];
  };

  const [dynamicStories, setDynamicStories] = useState<typeof allStories | null>(null);
  const [serverAchievements, setServerAchievements] = useState<ServerAchievement[]>([]);
  const [datasetStories, setDatasetStories] = useState<DatasetStory[]>([]);
  const [storyTemplates, setStoryTemplates] = useState<StoryTemplate[]>([]);
  const [currentTemplateStory, setCurrentTemplateStory] = useState<CurrentTemplateStory | null>(null);

  // Enrolled internal story IDs, derived from enrolled words/phrases (populated after completion)
  const enrolledInternalStoryIds = useMemo(() => {
    const ids = new Set<string>();
    enrolledStoryWordsDetailed.forEach(w => ids.add(w.storyId));
    enrolledStoryPhrasesDetailed.forEach(p => ids.add(p.storyId));
    return ids;
  }, [enrolledStoryWordsDetailed, enrolledStoryPhrasesDetailed]);

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

  const filteredStoryWords = useMemo(() => {
    if (selectedStoryFilter === 'all') {
      return enrolledStoryWordsDetailed;
    }
    return enrolledStoryWordsDetailed.filter(w => w.storyId === selectedStoryFilter);
  }, [enrolledStoryWordsDetailed, selectedStoryFilter]);

  const vocabularyWordsToUse = useMemo(
    () => filteredStoryWords.map(w => ({ word: w.word, hint: w.hint })),
    [filteredStoryWords]
  );

  const filteredStoryPhrases = useMemo(() => {
    if (selectedPhraseFilter === 'all') {
      return enrolledStoryPhrasesDetailed;
    }
    return enrolledStoryPhrasesDetailed.filter(p => p.storyId === selectedPhraseFilter);
  }, [enrolledStoryPhrasesDetailed, selectedPhraseFilter]);

  const pronunciationItems = useMemo(
    () => filteredStoryPhrases.map(p => ({ phrase: p.phrase, phonemes: p.phonemes })),
    [filteredStoryPhrases]
  );

  // Interactive features state
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // SLM & Model Management State
  const [modelsReady, setModelsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  

  // Sync activeCategory with URL on mount or URL change - ensure persistence
  useEffect(() => {
    const urlCategory = searchParams.get('section') || 'stories';
    if (urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Persist category to URL on change
  useEffect(() => {
    const currentSection = searchParams.get('section') || 'stories';
    if (activeCategory !== currentSection) {
      setSearchParams({ section: activeCategory }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Check authentication and user existence on mount
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!isAuthenticated) {
        // Check if there are any existing users in localStorage
        const speakbeeUsers = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
        const legacyUsers = JSON.parse(localStorage.getItem('users') || "[]");
        
        const hasExistingUsers = speakbeeUsers.length > 0 || legacyUsers.length > 0;
        
        // FIXED: If there are existing users, show login form, otherwise show registration
        setAuthMode(hasExistingUsers ? 'login' : 'register');
        setShowAuthModal(true);
      }
    };

    checkUserAndRedirect();
  }, [isAuthenticated]);

  // Initialize SLM and Hybrid Services
  useEffect(() => {
    const initializeServices = async () => {
      if (!isAuthenticated) return;

      setIsInitializing(true);
      console.log('🚀 Initializing Kids Learning Environment...');

      try {
        // 1. Initialize HybridServiceManager
        await HybridServiceManager.initialize({
          mode: 'online',
          autoSync: true,
          syncInterval: 15
        });

        // 2. Check system health
        const health = await HybridServiceManager.getSystemHealth();
        console.log('📊 System Health:', health);

        // 3. Check if essential models are downloaded (prioritize Piper TTS for better voice)
        const piperReady = await ModelManager.isModelCached('piper-en-us-lessac-medium');
        const whisperReady = await ModelManager.isModelCached('whisper-tiny-en');
        const llmReady = await ModelManager.isModelCached('distilgpt2');

        setModelsReady(piperReady || whisperReady || llmReady);

        // 4. If models aren't ready, user can click "Download AI Tutor" button
        if (!piperReady && !whisperReady && !llmReady) {
          console.log('📦 Models not found. User can download from Model Manager page.');
          console.log('💡 Download Piper TTS for high-quality kid voices!');
        } else {
          console.log('✅ Models ready! Initializing services...');
          if (piperReady) {
            console.log('🎤 Piper TTS available - using high-quality kid voices!');
          }
          
          // Initialize services in parallel
          await Promise.allSettled([
            WhisperService.initialize().catch(err => 
              console.warn('Whisper initialization skipped:', err)
            ),
            TransformersService.initialize().catch(err => 
              console.warn('Transformers initialization skipped:', err)
            )
          ]);
          
          console.log('✅ Kids Learning Environment Ready!');
        }
      } catch (error) {
        console.error('Error initializing services:', error);
        // Continue anyway - some features may still work
      } finally {
        setIsInitializing(false);
      }
    };

    initializeServices();
  }, [isAuthenticated]);

  // Initialize Time Tracker
  useEffect(() => {
    if (isAuthenticated && userId) {
      TimeTracker.initialize(userId);
      
      return () => {
        TimeTracker.cleanup();
      };
    }
  }, [isAuthenticated, userId]);

  // Welcome voice greeting
  useEffect(() => {
    if (isAuthenticated && isSoundEnabled) {
      const welcomeMessages = [
        "Welcome to Kids Learning Zone! Ready for some fun learning?",
        "Hello there! Let's explore amazing stories and games together!",
        "Welcome back! What would you like to learn today?"
      ];
      
      const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      
      // Delay the greeting slightly to let the page load (skip if opening from Favorites)
      const timer = setTimeout(() => {
        if (!isOpeningFromFavorites) {
          EnhancedTTS.speak(randomMessage, { rate: 0.9, emotion: 'happy' }).catch(() => {});
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isSoundEnabled, isOpeningFromFavorites]);

  // Load progress and generate floating icons only if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadProgress = async () => {
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        let serverProgress: any = null;
        let localProgress: any = null;
        
        // Try to load from server first
        if (token && token !== 'local-token') {
          try {
            serverProgress = await KidsApi.getProgress(token);
          } catch (error: unknown) {
            // If 401, token is invalid - clear it and fallback to local
            if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
              const msg = (error as { message: string }).message;
              if (msg.includes('token not valid') || msg.includes('401')) {
                localStorage.removeItem('speakbee_auth_token');
                console.warn('Token expired, falling back to local progress');
              }
            }
            // Fallback to local for any error
          }
        }
        
        // Always load local as fallback/merge source
        try {
          localProgress = await KidsProgressService.get(userId);
        } catch {}
        
        // Merge server and local data - prefer server for points/streak, merge details
        const serverDetails = (serverProgress as any)?.details || {};
        const localDetails = (localProgress as any)?.details || {};
        
        // Points: Use the maximum of server and local (to account for offline progress)
        const serverPoints = (serverProgress as any)?.points ?? 0;
        const localPoints = localProgress?.points ?? 0;
        setPoints(Math.max(serverPoints, localPoints));
        
        // Streak: Use the maximum of server and local
        const serverStreak = (serverProgress as any)?.streak ?? 0;
        const localStreak = localProgress?.streak ?? 0;
        setStreak(Math.max(serverStreak, localStreak));
        
        // Favorites: Merge and convert
        let fav = (serverDetails.favorites || localDetails.favorites || []);
        
        // Also check local storage as fallback
        if (!fav || fav.length === 0) {
          try {
            const localFavorites = localStorage.getItem(`young_favorites_${userId}`);
            if (localFavorites) {
              const parsed = JSON.parse(localFavorites);
              if (Array.isArray(parsed) && parsed.length > 0) {
                fav = parsed;
              }
            }
          } catch (error) {
            console.warn('Error loading local favorites:', error);
          }
        }
        
        const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
          if (typeof f === 'number') {
            return `young-${f}`;
          }
          return f;
        }) : [];
        setFavorites(convertedFavorites);
        
        // Merge pronunciation, vocabulary, and games data
        const mergedPron = { ...(localDetails.pronunciation || {}), ...(serverDetails.pronunciation || {}) };
        const mergedVocab = { ...(localDetails.vocabulary || {}), ...(serverDetails.vocabulary || {}) };
        const mergedGames = {
          ...(localDetails.games || {}),
          ...(serverDetails.games || {}),
          points: Math.max(
            Number(localDetails.games?.points || 0),
            Number(serverDetails.games?.points || 0)
          ),
          attempts: Math.max(
            Number(localDetails.games?.attempts || 0),
            Number(serverDetails.games?.attempts || 0)
          ),
          types: Array.from(new Set([
            ...(Array.isArray(localDetails.games?.types) ? localDetails.games.types : []),
            ...(Array.isArray(serverDetails.games?.types) ? serverDetails.games.types : [])
          ]))
        };
        
        // Count attempts from merged data
        const pronCount = Object.keys(mergedPron).length;
        const vocabCount = Object.keys(mergedVocab).length;
        const gamesAttemptsCount = Number(mergedGames.attempts || 0);
        const gamesPoints = Number(mergedGames.points || 0);
        const estimatedGamesAttempts = gamesAttemptsCount > 0 
          ? gamesAttemptsCount 
          : Math.max(mergedGames.types.length, Math.floor(gamesPoints / 15));
        
        setPronunciationAttempts(pronCount);
        setVocabularyAttempts(vocabCount);
        setGamesAttempts(estimatedGamesAttempts);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    loadProgress();

    // Load achievements from server (fallback to empty)
    (async () => {
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          const ach = await (KidsApi as any).getAchievements(token);
          if (Array.isArray(ach)) {
            setServerAchievements(ach);
          } else if (Array.isArray((ach as any)?.data)) {
            setServerAchievements((ach as any).data);
          }
        } else {
          setServerAchievements([]);
        }
      } catch (e) {
        setServerAchievements([]);
      }
    })();
  }, [userId, isAuthenticated]);

  // Real-time kids progress updates (5 second interval for active learning)
  const { data: realTimeKidsProgress } = useRealTimeData('kids_progress', {
    enabled: isAuthenticated && !!userId,
    immediate: false, // Don't fetch immediately, use initial load above
    interval: 5000, // 5 seconds for active learning page
  });

  // Update progress when real-time data arrives
  useEffect(() => {
    if (realTimeKidsProgress) {
      const progress = realTimeKidsProgress as any;
      if (progress.points !== undefined) setPoints(progress.points);
      if (progress.streak !== undefined) setStreak(progress.streak);
      // Update other fields as needed from realTimeKidsProgress
    }
  }, [realTimeKidsProgress]);

  // Load vocabulary words and phrases from enrolled stories (YOUNG KIDS ONLY)
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadVocabularyWordsAndPhrases = () => {
      try {
        // Get words from enrolled stories - FILTERED TO YOUNG KIDS ONLY
        const storyWords = StoryWordsService.getWordsFromEnrolledStoriesByAge(userId, 'young');
        // Save detailed for filtering; do NOT fallback to defaults for Word Games
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
        console.log(`📚 Loaded ${filtered.length} words from enrolled YOUNG stories${selectedStoryFilter !== 'all' ? ' (filtered)' : ''}`);

        // Get phrases from enrolled stories - FILTERED TO YOUNG KIDS ONLY
        const storyPhrases = StoryWordsService.getPhrasesFromEnrolledStoriesByAge(userId, 'young');
        // Save detailed for filtering; do NOT fallback to defaults for Speak & Repeat
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
        console.log(`🎤 Loaded ${filteredPhrases.length} phrases from enrolled YOUNG stories${selectedPhraseFilter !== 'all' ? ' (filtered)' : ''}`);
      } catch (error) {
        console.error('Error loading vocabulary words and phrases:', error);
        // For Word Games and Speak & Repeat, do not fallback to defaults; show empty state
        setEnrolledStoryWordsDetailed([]);
        setEnrolledStoryPhrasesDetailed([]);
      }
    };

    loadVocabularyWordsAndPhrases();
  }, [userId, isAuthenticated, selectedStoryFilter, selectedPhraseFilter]);

  const categories = [
    { id: 'stories', label: 'Story Time', icon: BookOpen, emoji: '📚' },
    { id: 'vocabulary', label: 'Word Games', icon: Zap, emoji: '🎮' },
    { id: 'pronunciation', label: 'Speak & Repeat', icon: Mic, emoji: '🎤' },
    { id: 'games', label: 'Fun Games', icon: Trophy, emoji: '🏆' },
  ];

  const allStories = useMemo(() => [
    {
      title: "The Magic Forest",
      description: "Join Luna the rabbit on a magical listening adventure!",
      difficulty: 'Easy',
      duration: '7 min',
      words: 330,
      image: '🌳',
      character: Rabbit,
      gradient: 'from-green-400 to-emerald-400',
      bgGradient: 'from-green-200 to-emerald-300 dark:from-green-900 dark:to-emerald-900',
      animation: 'animate-float-slow',
      type: 'forest',
      id: 'young-0'
    },
    {
      title: "Space Adventure",
      description: "Join Cosmo on a cosmic listening journey!",
      difficulty: 'Medium',
      duration: '7 min',
      words: 490,
      image: '🚀',
      character: Rocket,
      gradient: 'from-purple-400 to-indigo-400',
      bgGradient: 'from-purple-200 to-indigo-300 dark:from-purple-900 dark:to-indigo-900',
      animation: 'animate-bounce',
      type: 'space',
      id: 'young-1'
    },
    {
      title: "Underwater World",
      description: "Dive with Finn and discover ocean secrets!",
      difficulty: 'Easy',
      duration: '6 min',
      words: 450,
      image: '🐠',
      character: Fish,
      gradient: 'from-blue-400 to-cyan-400',
      bgGradient: 'from-blue-200 to-cyan-300 dark:from-blue-900 dark:to-cyan-900',
      animation: 'animate-float-medium',
      type: 'ocean',
      id: 'young-2'
    },
    {
      title: "Dinosaur Discovery",
      description: "Explore prehistoric times with Dina!",
      difficulty: 'Hard',
      duration: '7 min',
      words: 550,
      image: '🦖',
      character: Footprints,
      gradient: 'from-orange-400 to-red-400',
      bgGradient: 'from-orange-200 to-red-300 dark:from-orange-900 dark:to-red-900',
      animation: 'animate-float-slow',
      type: 'dinosaur',
      id: 'young-3'
    },
    {
      title: "Unicorn Magic",
      description: "Join Stardust in a magical kingdom!",
      difficulty: 'Easy',
      duration: '5 min',
      words: 400,
      image: '🦄',
      character: Sparkles,
      gradient: 'from-pink-400 to-purple-400',
      bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-900',
      animation: 'animate-float-medium',
      type: 'unicorn',
      id: 'young-4'
    },
    {
      title: "Pirate Treasure",
      description: "Sail with Captain Finn on a treasure hunt!",
      difficulty: 'Medium',
      duration: '5 min',
      words: 350,
      image: '🏴‍☠️',
      character: Anchor,
      gradient: 'from-amber-400 to-yellow-400',
      bgGradient: 'from-amber-200 to-yellow-300 dark:from-amber-900 dark:to-yellow-900',
      animation: 'animate-bounce',
      type: 'pirate',
      id: 'young-5'
    },
    {
      title: "Superhero School",
      description: "Train with Captain Courage to be a hero!",
      difficulty: 'Medium',
      duration: '6 min',
      words: 420,
      image: '🦸',
      character: Shield,
      gradient: 'from-red-400 to-blue-500',
      bgGradient: 'from-red-200 to-blue-300 dark:from-red-900 dark:to-blue-900',
      animation: 'animate-float-fast',
      type: 'superhero',
      id: 'young-6'
    },
    {
      title: "Fairy Garden",
      description: "Discover tiny wonders with Twinkle the fairy!",
      difficulty: 'Easy',
      duration: '5 min',
      words: 365,
      image: '🧚',
      character: Sparkles,
      gradient: 'from-violet-400 to-cyan-400',
      bgGradient: 'from-violet-200 to-cyan-300 dark:from-violet-900 dark:to-cyan-900',
      animation: 'animate-float-slow',
      type: 'fairy',
      id: 'young-7'
    },
    {
      title: "Rainbow Castle",
      description: "Join Princess Aurora on a magical rainbow adventure!",
      difficulty: 'Easy',
      duration: '6 min',
      words: 350,
      image: '🌈',
      character: Crown,
      gradient: 'from-pink-400 to-purple-400',
      bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-900',
      animation: 'animate-float-slow',
      type: 'rainbow',
      id: 'young-8'
    },
    {
      title: "Jungle Explorer",
      description: "Join Captain Leo on an exciting jungle expedition!",
      difficulty: 'Medium',
      duration: '8 min',
      words: 350,
      image: '🦁',
      character: Compass,
      gradient: 'from-orange-400 to-yellow-400',
      bgGradient: 'from-orange-200 to-yellow-300 dark:from-orange-900 dark:to-yellow-900',
      animation: 'animate-float-slow',
      type: 'jungle',
      id: 'young-9'
    }
  ], []);

  // Load dynamic kids lessons from server (fallback to defaults)
  useEffect(() => {
    const loadLessons = async () => {
      try {
        const lessons: any[] = await (KidsApi as any).getLessons();
        if (Array.isArray(lessons) && lessons.length > 0) {
          const mapped = allStories.map((s, idx) => {
            const l = lessons[idx] || lessons[lessons.length - 1];
            const mappedType = l?.lesson_type || s.type;
            return {
              ...s,
              title: l?.title || s.title,
              type: mappedType
            };
          });
          setDynamicStories(mapped);
        } else {
          setDynamicStories(allStories);
        }
      } catch {
        setDynamicStories(allStories);
      }
    };
    loadLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Load stories 11-20 from dataset (metadata only)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadDatasetStories = async () => {
      try {
        // Try loading from JSON first (easier to maintain), fallback to CSV
        const stories = await StoryDatasetService.loadStoriesFromJSON('/datasets/young-kids-stories.json', 'young');
        if (stories.length === 0) {
          // Fallback to CSV if JSON doesn't exist
          const csvStories = await StoryDatasetService.loadStoriesFromCSV('/datasets/young-kids-stories.csv', 'young');
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

  // Load full story templates (with complete story content)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadTemplates = async () => {
      try {
        const templates = await StoryDatasetService.loadStoryTemplates('/datasets/young-kids-stories-templates.json', 'young');
        setStoryTemplates(templates);
        console.log(`📚 Loaded ${templates.length} story templates`);
      } catch (error) {
        console.error('Error loading story templates:', error);
        setStoryTemplates([]);
      }
    };
    
    loadTemplates();
  }, [isAuthenticated]);

  // Handle story opening from Favorites page
  useEffect(() => {
    if (location.state?.startStory && location.state?.storyType) {
      const { startStory, storyType } = location.state;
      
      // Find the story by ID
      const story = (dynamicStories || allStories).find(s => s.id === startStory);
      if (story) {
        // Set flag to indicate we're opening from Favorites
        setIsOpeningFromFavorites(true);
        
        // Set current story and open the appropriate adventure
        setCurrentStory(startStory);
        
        // Open the story adventure based on type (skip welcome message when coming from Favorites)
        // Open immediately without any delays when coming from Favorites
        if (storyType === 'forest') {
          setShowMagicForest(true);
        } else if (storyType === 'space') {
          setShowSpaceAdventure(true);
        } else if (storyType === 'ocean') {
          setShowUnderwaterWorld(true);
        } else if (storyType === 'dinosaur') {
          setShowDinosaurAdventure(true);
        } else if (storyType === 'unicorn') {
          setShowUnicornAdventure(true);
        } else if (storyType === 'pirate') {
          setShowPirateAdventure(true);
        } else if (storyType === 'superhero') {
          setShowSuperheroAdventure(true);
        } else if (storyType === 'fairy') {
          setShowFairyGardenAdventure(true);
        } else if (storyType === 'rainbow') {
          setShowRainbowCastleAdventure(true);
        } else if (storyType === 'jungle') {
          setShowJungleExplorerAdventure(true);
        }
        
        // Clear the location state to prevent re-opening
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, dynamicStories, allStories, navigate, location.pathname]);

  // Helper function to map story type to internal StoryWordsService ID
  const getInternalStoryId = (storyType: string): string => {
    const mapping: Record<string, string> = {
      'forest': 'magic-forest',
      'space': 'space-adventure',
      'ocean': 'underwater-world',
      'dinosaur': 'dinosaur-discovery',
      'unicorn': 'unicorn-magic',
      'pirate': 'pirate-treasure',
      'superhero': 'superhero-school',
      'fairy': 'fairy-garden',
      'rainbow': 'rainbow-castle',
      'jungle': 'jungle-explorer',
      // Template story types (11-20)
      'garden': 'enchanted-garden',
      'dragon': 'dragons-treasure',
      'school': 'magic-school',
      'ocean-deep': 'ocean-explorer',
      'time-travel': 'time-machine',
      'robot': 'friendly-robot',
      'cave': 'secret-cave',
      'flying': 'flying-carpet',
      'kingdom': 'lost-kingdom',
      'grand-finale': 'grand-adventure'
    };
    return mapping[storyType] || storyType;
  };

  // Merge base stories with dataset stories
  const allStoriesWithDataset = useMemo(() => {
    const baseStories = dynamicStories || allStories;
    const datasetStoriesMapped = datasetStories.map((ds) => {
      // Map dataset story to story format
      const CharacterIcon = ds.character ? 
        (ds.character === 'Rabbit' ? Rabbit :
         ds.character === 'Rocket' ? Rocket :
         ds.character === 'Fish' ? Fish :
         ds.character === 'Footprints' ? Footprints :
         ds.character === 'Sparkles' ? Sparkles :
         ds.character === 'Anchor' ? Anchor :
         ds.character === 'Shield' ? Shield :
         ds.character === 'Crown' ? Crown :
         ds.character === 'Compass' ? Compass : Rabbit) : Rabbit;
      
      return {
        title: ds.title,
        description: ds.description,
        difficulty: ds.difficulty,
        duration: ds.duration,
        words: ds.words,
        image: ds.image,
        character: CharacterIcon,
        gradient: ds.gradient || 'from-blue-400 to-cyan-400',
        bgGradient: ds.bgGradient || 'from-blue-200 to-cyan-300 dark:from-blue-900 dark:to-cyan-900',
        animation: ds.animation || 'animate-float-slow',
        type: ds.type,
        id: `young-${ds.storyNumber - 1}`, // Convert to 0-based index (story 11 = young-10)
        isFromDataset: true,
        datasetStory: ds
      };
    });
    
    return [...baseStories, ...datasetStoriesMapped];
  }, [dynamicStories, allStories, datasetStories]);

  // Calculate pagination
  const effectiveStories = allStoriesWithDataset;
  const startIndex = (currentPage - 1) * storiesPerPage;
  const paginatedStories = effectiveStories.slice(startIndex, startIndex + storiesPerPage);
  const totalPages = Math.ceil(effectiveStories.length / storiesPerPage);

  // Dynamic achievements based on real-time progress
  const achievements = [
    { 
      name: 'First Words', 
      icon: Star, 
      progress: Math.min(100, Math.round((points / 1000) * 100)), 
      emoji: '🌟',
      description: points >= 1000 ? '1000+ points' : `${points}/1000 points`,
      category: 'general'
    },
    { 
      name: 'Story Master', 
      icon: BookOpen, 
      progress: Math.min(100, favorites.filter(f => f.startsWith('young-')).length * 10), 
      emoji: '📖',
      description: `${favorites.filter(f => f.startsWith('young-')).length}/10 favorite stories`,
      category: 'stories'
    },
    { 
      name: 'Pronunciation Pro', 
      icon: Mic, 
      progress: Math.min(100, Math.min(pronunciationAttempts, 14) * 7.14), 
      emoji: '🎤',
      description: `${pronunciationAttempts} practiced`,
      category: 'pronunciation'
    },
    { 
      name: 'Vocabulary Builder', 
      icon: Zap, 
      progress: Math.min(100, Math.min(vocabularyAttempts, 14) * 7.14), 
      emoji: '⚡',
      description: `${vocabularyAttempts} words learned`,
      category: 'vocabulary'
    },
    { 
      name: 'Game Champion', 
      icon: Trophy, 
      progress: Math.min(100, gamesAttempts * 20), 
      emoji: '🎮',
      description: `${gamesAttempts}/5 games played`,
      category: 'games'
    },
  ];
  const completedAchievements = serverAchievements.length > 0
    ? serverAchievements.filter((a: any) => a.unlocked === true).length
    : achievements.filter(a => a.progress === 100).length;

  // Logic to unlock stories 11-20 based on completion of previous stories
  const unlockStories = (completedStories: number) => {
    return completedStories >= 10 ? Array.from({ length: 10 }, (_, i) => i + 11) : [];
  };
  const unlockedStories = unlockStories(completedAchievements);

  const handleStartLesson = async (storyId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const storyIndex = effectiveStories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return;

    // Play story-specific voice introduction (skip if opening from Favorites)
    if (isSoundEnabled && !isOpeningFromFavorites) {
      const story = effectiveStories[storyIndex];
      await EnhancedTTS.speak(
        `Welcome to ${story.title}! ${story.description} Let's begin our adventure!`, 
        { rate: 0.9, emotion: 'excited' }
      ).catch(() => {});
    }
    
    // Reset the flag after handling
    if (isOpeningFromFavorites) {
      setIsOpeningFromFavorites(false);
    }

    // storyIndex is already the correct index in allStories array
    setCurrentStory(storyId);
    setIsPlaying(true);
    
    // Mark story as enrolled when started (not completed, but enrolled for tracking)
    const story = effectiveStories[storyIndex];
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
            const { API } = await import('@/services/ApiService');
            await API.kids.toggleFavorite(storyId, true).catch(() => {});
          } catch (error) {
            console.warn('Error auto-adding to favorites:', error);
          }
        }
        localStorage.setItem(`young_favorites_${userId}`, JSON.stringify(updatedFavorites));
      } catch (error) {
        console.warn('Error auto-adding story to favorites:', error);
      }
    }
    
    // Check if this is a template story (11-20)
    const storyNumber = parseInt(storyId.replace('young-', ''), 10);
    if (storyNumber >= 10) {
      // This is a template story (11-20), use DynamicStoryAdventure
      const template = storyTemplates.find(t => t.storyNumber === storyNumber + 1);
      if (template && template.storySteps) {
        setCurrentTemplateStory({
          title: template.title,
          storySteps: template.storySteps,
          voiceProfile: template.voiceProfile || `Story${storyNumber + 1}`,
          characterName: template.character || 'Character',
          storyId: internalId,
          milestoneStepIds: template.milestoneStepIds || [] // Pass milestone step IDs for star awards
        });
        setIsPlaying(false);
        
        // Award points for starting a story ONLY if not already awarded
        if (!pointsAlreadyAwarded) {
          const pointsToAdd = 50;
          const newPoints = points + pointsToAdd;
          setPoints(newPoints);
          
          // Mark that points were awarded
          localStorage.setItem(enrollmentPointsKey, 'true');
          
          // Update streak correctly (check if user practiced yesterday)
          await incrementStreakIfNeeded('story-start');
          
          // Persist to server first, fallback to local
          try {
            const token = localStorage.getItem('speakbee_auth_token');
            const updateDetails = (details: any) => {
              details.readAloud = details.readAloud || {};
              const key = `story-${storyId}`;
              const prev = details.readAloud[key] || { bestScore: 0, attempts: 0 };
              details.readAloud[key] = { 
                bestScore: Math.max(prev.bestScore, 80), 
                attempts: prev.attempts + 1 
              };
              return details;
            };
            
            if (token && token !== 'local-token') {
              const current = await KidsApi.getProgress(token);
              const details = updateDetails((current as any).details || {});
              const currentPoints = (current as any)?.points ?? 0;
              const currentStreak = (current as any)?.streak ?? 0;
              await KidsApi.updateProgress(token, { 
                points: currentPoints + pointsToAdd, 
                streak: currentStreak, // Streak already updated by incrementStreakIfNeeded
                details 
              });
              // Check and refresh achievements after update
              await (KidsApi as any).checkAchievements(token);
              const ach = await (KidsApi as any).getAchievements(token);
              if (Array.isArray(ach)) setServerAchievements(ach);
            } else {
              await KidsProgressService.update(userId, (p) => {
                const details = updateDetails((p as any).details || {});
                return { 
                  ...p, 
                  points: p.points + pointsToAdd, 
                  streak: p.streak, // Streak already updated by incrementStreakIfNeeded
                  details 
                } as any;
              });
            }
          } catch (error) {
            console.error('Error updating progress:', error);
          }
        }
        
        return;
      } else {
        console.warn(`Template not found for story ${storyNumber + 1}`);
      }
    }
    
    // Open appropriate adventure module for hardcoded stories (1-10)
    const storyType = story.type;
    if (storyType === 'forest') {
      setShowMagicForest(true);
    } else if (storyType === 'space') {
      setShowSpaceAdventure(true);
    } else if (storyType === 'ocean') {
      setShowUnderwaterWorld(true);
    } else if (storyType === 'dinosaur') {
      setShowDinosaurAdventure(true);
    } else if (storyType === 'unicorn') {
      setShowUnicornAdventure(true);
    } else if (storyType === 'pirate') {
      setShowPirateAdventure(true);
    } else if (storyType === 'superhero') {
      setShowSuperheroAdventure(true);
    } else if (storyType === 'fairy') {
      setShowFairyGardenAdventure(true);
    } else if (storyType === 'rainbow') {
      setShowRainbowCastleAdventure(true);
    } else if (storyType === 'jungle') {
      setShowJungleExplorerAdventure(true);
    }
    
    // Add celebration effects - award points for starting a story ONLY if not already awarded
    if (!pointsAlreadyAwarded) {
      const pointsToAdd = 50;
      const newPoints = points + pointsToAdd;
      setPoints(newPoints);
      
      // Mark that points were awarded
      localStorage.setItem(enrollmentPointsKey, 'true');
      
      // Update streak correctly (check if user practiced yesterday)
      await incrementStreakIfNeeded('story-start');
      
      // Persist to server first, fallback to local
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        const updateDetails = (details: any) => {
          details.readAloud = details.readAloud || {};
          const key = `story-${storyId}`;
          const prev = details.readAloud[key] || { bestScore: 0, attempts: 0 };
          details.readAloud[key] = { 
            bestScore: Math.max(prev.bestScore, 80), 
            attempts: prev.attempts + 1 
          };
          return details;
        };
        
        if (token && token !== 'local-token') {
          const current = await KidsApi.getProgress(token);
          const details = updateDetails((current as any).details || {});
          const currentPoints = (current as any)?.points ?? 0;
          const currentStreak = (current as any)?.streak ?? 0;
          await KidsApi.updateProgress(token, { 
            points: currentPoints + pointsToAdd, 
            streak: currentStreak, // Streak already updated by incrementStreakIfNeeded
            details 
          });
          // Check and refresh achievements after update
          await (KidsApi as any).checkAchievements(token);
          const ach = await (KidsApi as any).getAchievements(token);
          if (Array.isArray(ach)) setServerAchievements(ach);
        } else {
          await KidsProgressService.update(userId, (p) => {
            const details = updateDetails((p as any).details || {});
            return { 
              ...p, 
              points: p.points + pointsToAdd, 
              streak: p.streak, // Streak already updated by incrementStreakIfNeeded
              details 
            } as any;
          });
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
    setIsPlaying(false);
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
        try {
          // Use the new API endpoint for favorites (saves to MySQL)
          const { API } = await import('@/services/ApiService');
          await API.kids.toggleFavorite(storyId, willAdd);
          
          // Also update progress for backward compatibility
          const current = await KidsApi.getProgress(token);
          const details = { ...((current as any).details || {}) };
          details.favorites = updatedFavorites;
          await KidsApi.updateProgress(token, { details });
        } catch (error) {
          console.error('Error updating favorites on server:', error);
          // Save to local storage as fallback
          localStorage.setItem(`young_favorites_${userId}`, JSON.stringify(updatedFavorites));
        }
      } else {
        // Fallback to local storage if offline
        await KidsProgressService.update(userId, (p) => {
          const details = { ...(p as any).details };
          details.favorites = updatedFavorites;
          return { ...p, details } as any;
        });
        // Also save to local storage
        localStorage.setItem(`young_favorites_${userId}`, JSON.stringify(updatedFavorites));
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      // Revert on error
      setFavorites(previousFavorites);
    }
  };

  const handleAdventureComplete = async (storyId: string, score: number) => {
    if (!isAuthenticated) return;

    // Find story in all available stories (including dataset stories)
    const storyIndex = effectiveStories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) {
      console.warn(`Story ${storyId} not found in effectiveStories`);
      return;
    }

    // Calculate points based on score: base points from score + completion bonus
    const basePoints = Math.round(score / 10);
    const completionBonus = 50; // Bonus for completing the story
    const pointsToAdd = basePoints + completionBonus;
    const newPoints = points + pointsToAdd;
    setPoints(newPoints);
    
    // Update streak correctly (check if user practiced yesterday)
    await incrementStreakIfNeeded('story-complete');
    
    // Get story information for enrollment
    const story = effectiveStories[storyIndex];
    const storyType = story.type;
    const storyTitle = story.title;
    
    // Map the story ID from young-X format to internal StoryWordsService format
    const internalStoryId = getInternalStoryId(storyType);
    
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      const key = `story-${storyIndex}`;
      
      // Record story completion and enrollment using internal story ID
      await KidsProgressService.recordStoryCompletion(
        userId,
        internalStoryId,
        storyTitle,
        storyType,
        score
      );
      
      // Reload vocabulary words and phrases to include data from this newly completed story
      // FILTERED TO YOUNG KIDS ONLY
      const storyWords = StoryWordsService.getWordsFromEnrolledStoriesByAge(userId, 'young');
      const detailedWords = storyWords.map(sw => ({
        word: sw.word,
        hint: sw.hint,
        storyId: sw.storyId,
        storyTitle: sw.storyTitle
      }));
      setEnrolledStoryWordsDetailed(detailedWords);
      const relevantWords = selectedStoryFilter === 'all' 
        ? detailedWords
        : detailedWords.filter(w => w.storyId === selectedStoryFilter);
      console.log(`🎉 Story completed! Loaded ${relevantWords.length} total words from enrolled YOUNG stories${selectedStoryFilter !== 'all' ? ' (filtered)' : ''}`);

      const storyPhrases = StoryWordsService.getPhrasesFromEnrolledStoriesByAge(userId, 'young');
      const detailedPhrases = storyPhrases.map(sp => ({
        phrase: sp.phrase,
        phonemes: sp.phonemes,
        storyId: sp.storyId,
        storyTitle: sp.storyTitle
      }));
      setEnrolledStoryPhrasesDetailed(detailedPhrases);
      const relevantPhrases = selectedPhraseFilter === 'all' 
        ? detailedPhrases
        : detailedPhrases.filter(p => p.storyId === selectedPhraseFilter);
      console.log(`🎉 Story completed! Loaded ${relevantPhrases.length} total phrases from enrolled YOUNG stories${selectedPhraseFilter !== 'all' ? ' (filtered)' : ''}`);
      
      if (token && token !== 'local-token') {
        const current = await KidsApi.getProgress(token);
        const currentPoints = (current as any)?.points ?? 0;
        const currentStreak = (current as any)?.streak ?? 0;
        const details = { ...((current as any).details || {}) };
        details.readAloud = details.readAloud || {};
        const prev = details.readAloud[key] || { bestScore: 0, attempts: 0 };
        details.readAloud[key] = { 
          bestScore: Math.max(prev.bestScore, score), 
          attempts: prev.attempts + 1 
        };
        await KidsApi.updateProgress(token, { 
          points: currentPoints + pointsToAdd, 
          streak: currentStreak, // Streak already updated by incrementStreakIfNeeded
          details 
        });
        // Check and refresh achievements after update
        await (KidsApi as any).checkAchievements(token);
        const ach = await (KidsApi as any).getAchievements(token);
        if (Array.isArray(ach)) setServerAchievements(ach);
      } else {
        await KidsProgressService.update(userId, (p) => {
          const details = { ...(p as any).details };
          details.readAloud = details.readAloud || {};
          const prev = details.readAloud[key] || { bestScore: 0, attempts: 0 };
          details.readAloud[key] = { 
            bestScore: Math.max(prev.bestScore, score), 
            attempts: prev.attempts + 1 
          };
          return { 
            ...p, 
            points: p.points + pointsToAdd, 
            streak: p.streak, // Streak already updated by incrementStreakIfNeeded
            details 
          } as any;
        });
      }
    } catch (error) {
      console.error('Error updating adventure progress:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of stories section
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Play category-specific voice instructions
    const categoryInstructions = {
      stories: "Let's read amazing stories together!",
      vocabulary: "Time to learn new words!",
      pronunciation: "Let's practice speaking!",
      games: "Ready for some fun games?"
    };
    
    if (isSoundEnabled) {
      EnhancedTTS.speak(categoryInstructions[categoryId as keyof typeof categoryInstructions] || "Let's learn!", { 
        rate: 1.0, 
        emotion: 'happy' 
      }).catch(() => {});
    }
    
    setActiveCategory(categoryId);
    
    // Update URL to persist the section on refresh
    setSearchParams({ section: categoryId });
  };

  const awardEngagementPoints = async (delta: number) => {
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        const current = await KidsApi.getProgress(token);
        const currentPoints = (current as any)?.points ?? 0;
        await KidsApi.updateProgress(token, { points: currentPoints + delta });
        // Check and refresh achievements after points update
        await (KidsApi as any).checkAchievements(token);
        const ach = await (KidsApi as any).getAchievements(token);
        if (Array.isArray(ach)) {
          setServerAchievements(ach);
        } else if (Array.isArray((ach as any)?.data)) {
          setServerAchievements((ach as any).data);
        }
      } else {
        await KidsProgressService.update(userId, (p) => ({ ...p, points: p.points + delta } as any));
      }
      setPoints((p) => p + delta);
    } catch (error) {
      console.error('Error awarding engagement points:', error);
    }
  };

  const incrementStreakIfNeeded = async (source: string) => {
    try {
      const today = new Date();
      const todayKey = today.toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toDateString();
      
      const localKey = `kids_streak_last_engagement_${userId}`;
      const last = localStorage.getItem(localKey);
      
      // Already counted today - don't increment again
      if (last === todayKey) return;

      const token = localStorage.getItem('speakbee_auth_token');
      let currentStreak = streak;
      let newStreak: number;
      
      // Calculate new streak based on last practice date
      if (last === yesterdayKey) {
        // Continued streak - user practiced yesterday
        newStreak = Math.max(1, currentStreak) + 1;
      } else if (!last) {
        // First time practicing or no record
        newStreak = Math.max(1, currentStreak);
      } else {
        // Streak broken - user didn't practice yesterday (or it's been more than 1 day)
        newStreak = 1;
      }

      if (token && token !== 'local-token') {
        try {
          const current = await KidsApi.getProgress(token);
          currentStreak = (current as any)?.streak ?? 0;
          
          // Recalculate if we have server data
          const serverLastDate = (current as any)?.details?.engagement?.lastStreakDate;
          if (serverLastDate === yesterdayKey) {
            // Continued streak - user practiced yesterday
            newStreak = Math.max(1, currentStreak) + 1;
          } else if (serverLastDate === todayKey) {
            // Already counted today - don't increment
            return;
          } else if (!serverLastDate) {
            // No server record - use calculated value
            newStreak = Math.max(1, currentStreak);
          } else {
            // Streak broken
            newStreak = 1;
          }
          
          const details = { ...((current as any)?.details || {}) };
          details.engagement = details.engagement || {};
          details.engagement.lastStreakDate = todayKey;
          details.engagement.source = source;
          await KidsApi.updateProgress(token, { streak: newStreak, details });
        } catch (error: any) {
          // If 401, token is invalid - fallback to local
          if (error?.message?.includes('token not valid') || error?.message?.includes('401')) {
            localStorage.removeItem('speakbee_auth_token');
            console.warn('Token expired during streak update, using local storage');
            // Continue with local update
          } else {
            throw error; // Re-throw other errors
          }
        }
      }
      
      // Always update local storage
      await KidsProgressService.update(userId, (p) => {
        const anyP: any = p as any;
        const details = { ...(anyP.details || {}) };
        details.engagement = details.engagement || {};
        details.engagement.lastStreakDate = todayKey;
        details.engagement.source = source;
        return { ...(p as any), streak: newStreak, details } as any;
      });
      
      setStreak(newStreak);
      localStorage.setItem(localKey, todayKey);
    } catch (error) {
      console.error('Error updating streak:', error);
      // Don't fail silently - at least log the error
    }
  };


  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // Redirect to home page when user closes the auth modal without logging in
    navigate('/');
  };

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          initialMode={authMode}
          redirectFromKids={true}
          onAuthSuccess={handleAuthSuccess}
        />
        <Card className="max-w-md w-full shadow-xl border-none">
          <CardContent className="py-10 px-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sun className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-foreground">
                Little Learners
              </h1>
              <p className="text-base text-muted-foreground">
                Magical stories, fun games, and exciting adventures for young minds. Sign in to keep learning where you left off.
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
        redirectFromKids={true}
        onAuthSuccess={handleAuthSuccess}
      />
      <main className="container mx-auto max-w-6xl px-4 pt-24 pb-16 space-y-10">
        <section>
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#74C69D] text-white shadow-xl">
            <CardHeader className="space-y-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3 max-w-2xl">
                  <Badge className="bg-white/25 text-white uppercase tracking-wide">
                    Little Learners
                  </Badge>
                  <CardTitle className="text-3xl md:text-4xl font-semibold text-white leading-tight">
                    Magical stories, fun games, and exciting adventures for young minds
                  </CardTitle>
                  <p className="text-white/85 text-base md:text-lg leading-relaxed">
                    Explore personalised lessons, practise new words, and celebrate progress with a calm, app-like experience made for young learners and their grown-ups.
                  </p>
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
                    title={isMusicEnabled ? 'Pause background music' : 'Play background music'}
                  >
                    <Music className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHelp((prev) => !prev)}
                    className="rounded-full bg-white/15 text-white hover:bg-white/25"
                    title="Show quick tips"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SyncStatusIndicator showDetails={false} className="bg-white/15 text-white backdrop-blur-sm" />
                <Badge className="bg-white/15 text-white">
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
                  <Badge className="bg-white/10 text-white">
                    Initialising learning environment…
                  </Badge>
                )}
              </div>
              {showHelp && (
                <Card className="bg-white/80 text-slate-800 backdrop-blur-md shadow-lg md:absolute md:right-6 md:top-6 md:max-w-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900">Quick tips</CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Tap a tile to start learning. Stories unlock new words and phrases automatically.
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
            <span className="text-sm text-muted-foreground">
              Updated continuously while you learn
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sparkle points</CardTitle>
                <Trophy className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-3xl font-semibold text-foreground">{points}</p>
                <p className="text-sm text-muted-foreground">Earn points by starting stories, practising words, and playing games.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily streak</CardTitle>
                <Zap className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-3xl font-semibold text-foreground">{streak} days</p>
                <p className="text-sm text-muted-foreground">Keep learning every day to unlock exclusive character rewards.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Achievements</CardTitle>
                <Award className="h-5 w-5 text-sky-500" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-semibold text-foreground">{completedAchievements}</p>
                  <p className="text-sm text-muted-foreground">of {achievements.length} milestones</p>
                </div>
                <Progress value={(completedAchievements / achievements.length) * 100} />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">Learning hub</h2>
            <p className="text-sm text-muted-foreground">
              Switch between stories, practice, and games at any time.
            </p>
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
                  const CharacterIcon = story.character;
                  const internalId = getInternalStoryId(story.type);
                  // Check if enrolled: either through words/phrases (internal ID) OR through completed story IDs
                  // Also check StoryWordsService directly for enrolled stories (both started and completed)
                  const storyEnrollments = StoryWordsService.getEnrolledStories(userId);
                  const isEnrolledInService = storyEnrollments.some(e => e.storyId === internalId);
                  const isEnrolled = enrolledInternalStoryIds.has(internalId) || 
                                    completedStoryIds.has(internalId) ||
                                    isEnrolledInService;
                  
                  // Check if story is from dataset and if it's unlocked
                  const storyIndex = parseInt(story.id.replace('young-', ''), 10);
                  const isDatasetStory = storyIndex >= 10; // Stories 11-20 (indices 10-19)
                  
                  let isUnlocked = true; // Base stories 1-10 are always unlocked
                  
                  if (isDatasetStory) {
                    // For story 11 (index 10), check if story 10 (index 9) is completed
                    // For story 12 (index 11), check if story 11 (index 10) is completed, etc.
                    const previousStoryIndex = storyIndex - 1;
                    
                    if (previousStoryIndex < 10) {
                      // Previous story is in base stories (1-10)
                      const previousStory = (dynamicStories || allStories)[previousStoryIndex];
                      if (previousStory) {
                        const previousInternalId = getInternalStoryId(previousStory.type);
                        isUnlocked = completedStoryIds.has(previousInternalId) || 
                                    enrolledInternalStoryIds.has(previousInternalId);
                      }
                    } else {
                      // Previous story is also a dataset story (11-20)
                      // Check if previous dataset story is completed
                      const previousDatasetStory = datasetStories.find(
                        ds => ds.storyNumber - 1 === previousStoryIndex
                      );
                      if (previousDatasetStory) {
                        const previousInternalId = getInternalStoryId(previousDatasetStory.type);
                        isUnlocked = completedStoryIds.has(previousInternalId) || 
                                    enrolledInternalStoryIds.has(previousInternalId);
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
                          <span className={cn('text-3xl', story.animation)}>{story.image}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(story.id)}
                            className="rounded-full bg-black/15 text-white hover:bg-black/25"
                          >
                            <Heart className={cn('h-4 w-4', favorites.includes(story.id) && 'fill-current')} />
                          </Button>
                        </div>
                        <div className="mt-4 space-y-1.5">
                          <CardTitle className="text-lg font-semibold text-white">{story.title}</CardTitle>
                          <p className="text-xs text-white/85 leading-relaxed">{story.description}</p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-white/80">
                          <Badge className="bg-white/20 text-white">
                            ⏱ {story.duration}
                          </Badge>
                          <Badge className="bg-white/20 text-white">
                            📚 {story.words} words
                          </Badge>
                          <Badge className={cn('bg-white/20 text-white')}>
                            🎯 {story.difficulty}
                          </Badge>
                        </div>
                        {isEnrolled && (
                          <Badge className="absolute left-3 top-3 bg-white/95 text-indigo-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Enrolled
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
                          <span className="truncate">Adventure type: {story.type.replace('-', ' ')}</span>
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
                              Finish story {storyIndex} to unlock this adventure
                            </p>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleStartLesson(story.id)}
                            disabled={isPlaying && currentStory === story.id}
                            className="w-full py-2 text-sm"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {isPlaying && currentStory === story.id ? 'Starting...' : 'Start adventure'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-muted px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(startIndex + storiesPerPage, effectiveStories.length)} of {effectiveStories.length} adventures
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
                    <CardTitle className="text-lg font-semibold text-foreground">Unlock word games</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Complete a story to automatically add its vocabulary to your practice deck.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => handleCategoryClick('stories')} variant="default">
                      Browse stories
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Stories you finish will surface here instantly.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          Words from your adventures
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {vocabularyWordsToUse.length} words available for practice
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">
                        Filter
                      </label>
                      <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={selectedStoryFilter}
                        onChange={(e) => setSelectedStoryFilter(e.target.value)}
                      >
                        <option value="all">All stories</option>
                        {Array.from(new Map(enrolledStoryWordsDetailed.map(w => [w.storyId, w.storyTitle])).entries()).map(([id, title]) => (
                          <option key={id} value={id}>{title}</option>
                        ))}
                        {unlockedStories.length > 0 && (
                          <optgroup label="Unlocked stories">
                            {unlockedStories.map(id => {
                              const story = allStories.find(s => s.id === `young-${id - 1}`);
                              return (
                                story && (
                                  <option key={id} value={story.id}>
                                    {story.title}
                                  </option>
                                )
                              );
                            })}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>
                  <Vocabulary
                    key={`${selectedStoryFilter}-${vocabularyWordsToUse.length}`}
                    words={vocabularyWordsToUse}
                    onWordPracticed={async (word: string) => {
                      // Check if points were already awarded for this word
                      const wordPointsKey = `vocab_points_${userId}_${word}`;
                      const pointsAlreadyAwarded = localStorage.getItem(wordPointsKey) === 'true';
                      
                      // Only increment attempts if not already mastered
                      if (!pointsAlreadyAwarded) {
                        const newAttempts = vocabularyAttempts + 1;
                        setVocabularyAttempts(newAttempts);
                      }

                      const wordDetail = enrolledStoryWordsDetailed.find(w => w.word === word);
                      const storyId = wordDetail?.storyId;

                      try {
                        const token = localStorage.getItem('speakbee_auth_token');
                        if (token && token !== 'local-token') {
                          const { API } = await import('@/services/ApiService');
                          await API.kids.recordVocabularyPractice({
                            word,
                            story_id: storyId || '',
                            score: 100
                          }).catch(error => {
                            console.warn('Failed to save vocabulary practice to server:', error);
                          });

                          const current = await KidsApi.getProgress(token);
                          const details = { ...((current as any).details || {}) };
                          details.vocabulary = details.vocabulary || {};
                          details.vocabulary[word] = {
                            bestScore: 100,
                            attempts: (details.vocabulary[word]?.attempts || 0) + 1
                          };
                          await KidsApi.updateProgress(token, { details });
                        } else {
                          await KidsProgressService.update(userId, (p) => {
                            const anyP: any = p as any;
                            const details = { ...(anyP.details || {}) };
                            details.vocabulary = details.vocabulary || {};
                            details.vocabulary[word] = {
                              bestScore: 100,
                              attempts: (details.vocabulary[word]?.attempts || 0) + 1
                            };
                            return { ...p, details } as any;
                          });
                        }
                      } catch (error) {
                        console.error('Error saving vocabulary progress:', error);
                      }

                      // Only award points once per word
                      if (!pointsAlreadyAwarded) {
                        await awardEngagementPoints(20);
                        localStorage.setItem(wordPointsKey, 'true');
                        await incrementStreakIfNeeded('vocabulary');
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
                    <CardTitle className="text-lg font-semibold text-foreground">Unlock speak & repeat</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Complete a story to add its key phrases to your pronunciation studio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button onClick={() => handleCategoryClick('stories')} variant="default">
                      Complete a story
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Phrases unlock instantly after finishing an adventure.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Mic className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          Speak & repeat studio
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {pronunciationItems.length} phrases ready for practice
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase">
                        Filter
                      </label>
                      <select
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        value={selectedPhraseFilter}
                        onChange={(e) => setSelectedPhraseFilter(e.target.value)}
                      >
                        <option value="all">All stories</option>
                        {Array.from(new Map(enrolledStoryPhrasesDetailed.map(p => [p.storyId, p.storyTitle])).entries()).map(([id, title]) => (
                          <option key={id} value={id}>{title}</option>
                        ))}
                        {unlockedStories.length > 0 && (
                          <optgroup label="Unlocked stories">
                            {unlockedStories.map(id => {
                              const story = allStories.find(s => s.id === `young-${id - 1}`);
                              return (
                                story && (
                                  <option key={id} value={story.id}>
                                    {story.title}
                                  </option>
                                )
                              );
                            })}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>
                  <Pronunciation
                    key={`${selectedPhraseFilter}-${pronunciationItems.length}`}
                    items={pronunciationItems}
                    onPhrasePracticed={async (phrase: string) => {
                      // Check if points were already awarded for this phrase
                      const phrasePointsKey = `pronunciation_points_${userId}_${phrase}`;
                      const pointsAlreadyAwarded = localStorage.getItem(phrasePointsKey) === 'true';
                      
                      // Only increment attempts if not already mastered
                      if (!pointsAlreadyAwarded) {
                        const newAttempts = pronunciationAttempts + 1;
                        setPronunciationAttempts(newAttempts);
                      }

                      const phraseDetail = enrolledStoryPhrasesDetailed.find(p => p.phrase === phrase);
                      const storyId = phraseDetail?.storyId;

                      try {
                        const token = localStorage.getItem('speakbee_auth_token');
                        if (token && token !== 'local-token') {
                          const { API } = await import('@/services/ApiService');
                          await API.kids.recordPronunciationPractice({
                            phrase,
                            story_id: storyId || '',
                            score: 100
                          }).catch(error => {
                            console.warn('Failed to save pronunciation practice to server:', error);
                          });

                          const current = await KidsApi.getProgress(token);
                          const details = { ...((current as any).details || {}) };
                          details.pronunciation = details.pronunciation || {};
                          details.pronunciation[phrase] = {
                            bestScore: 100,
                            attempts: (details.pronunciation[phrase]?.attempts || 0) + 1
                          };
                          await KidsApi.updateProgress(token, { details });
                        } else {
                          await KidsProgressService.update(userId, (p) => {
                            const anyP: any = p as any;
                            const details = { ...(anyP.details || {}) };
                            details.pronunciation = details.pronunciation || {};
                            details.pronunciation[phrase] = {
                              bestScore: 100,
                              attempts: (details.pronunciation[phrase]?.attempts || 0) + 1
                            };
                            return { ...p, details } as any;
                          });
                        }
                      } catch (error) {
                        console.error('Error saving pronunciation progress:', error);
                      }

                      // Only award points once per phrase
                      if (!pointsAlreadyAwarded) {
                        await awardEngagementPoints(30);
                        localStorage.setItem(phrasePointsKey, 'true');
                        await incrementStreakIfNeeded('pronunciation');
                      }
                    }}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="games" className="mt-0">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Interactive games</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Reinforce new skills with quick mini-games designed for short learning bursts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InteractiveGames isTeenKids={false} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
            <p className="text-sm text-muted-foreground">
              Collect badges as you explore stories, words, and games.
            </p>
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
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full',
                          isComplete ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground'
                        )}>
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
                    <p className="text-sm font-semibold text-foreground">Listen & repeat</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Jump straight into pronunciation practice for unlocked phrases.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={async () => {
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
                    Record a quick pronunciation check-in to keep your streak alive.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={async () => {
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
                    <p className="text-sm font-semibold text-foreground">Favourite stories</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review and launch adventures you’ve saved for quick access.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await awardEngagementPoints(5);
                    await incrementStreakIfNeeded('quick-favorites');
                    navigate('/favorites/young');
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
                    Download personalised completion certificates to celebrate milestones.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    try {
                      sessionStorage.setItem('speakbee_certificates_audience', 'young');
                    } catch {}
                    navigate('/certificates', { state: { audience: 'young' } });
                  }}
                >
                  Open certificates
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Adventure Modals */}
      {showMagicForest && (
        <MagicForestAdventure 
          onClose={() => setShowMagicForest(false)} 
          onComplete={(score) => {
            setShowMagicForest(false);
            handleAdventureComplete('young-0', score);
          }}
        />
      )}

      {showSpaceAdventure && (
        <SpaceAdventure 
          onClose={() => setShowSpaceAdventure(false)} 
          onComplete={(score) => {
            setShowSpaceAdventure(false);
            handleAdventureComplete('young-1', score);
          }}
        />
      )}

      {showUnderwaterWorld && (
        <UnderwaterWorld 
          onClose={() => setShowUnderwaterWorld(false)} 
          onComplete={(score) => {
            setShowUnderwaterWorld(false);
            handleAdventureComplete('young-2', score);
          }}
        />
      )}

      {showDinosaurAdventure && (
        <DinosaurDiscoveryAdventure 
          onClose={() => setShowDinosaurAdventure(false)} 
          onComplete={(score) => {
            setShowDinosaurAdventure(false);
            handleAdventureComplete('young-3', score);
          }}
        />
      )}

      {showUnicornAdventure && (
        <UnicornMagicAdventure 
          onClose={() => setShowUnicornAdventure(false)} 
          onComplete={(score) => {
            setShowUnicornAdventure(false);
            handleAdventureComplete('young-4', score);
          }}
        />
      )}

      {showPirateAdventure && (
        <PirateTreasureAdventure 
          onClose={() => setShowPirateAdventure(false)} 
          onComplete={(score) => {
            setShowPirateAdventure(false);
            handleAdventureComplete('young-5', score);
          }}
        />
      )}

      {showSuperheroAdventure && (
        <SuperheroAdventure 
          onClose={() => setShowSuperheroAdventure(false)} 
          onComplete={(score) => {
            setShowSuperheroAdventure(false);
            handleAdventureComplete('young-6', score);
          }}
        />
      )}

      {showFairyGardenAdventure && (
        <FairyGardenAdventure 
          onClose={() => setShowFairyGardenAdventure(false)}
          onComplete={(score) => {
            setShowFairyGardenAdventure(false);
            handleAdventureComplete('young-7', score);
          }}
        />
      )}

      {showRainbowCastleAdventure && (
        <RainbowCastleAdventure 
          onClose={() => setShowRainbowCastleAdventure(false)}
          onComplete={(score) => {
            setShowRainbowCastleAdventure(false);
            handleAdventureComplete('young-8', score);
          }}
        />
      )}

      {showJungleExplorerAdventure && (
        <JungleExplorerAdventure 
          onClose={() => setShowJungleExplorerAdventure(false)}
          onComplete={(score) => {
            setShowJungleExplorerAdventure(false);
            handleAdventureComplete('young-9', score);
          }}
        />
      )}

      {/* Dynamic Story Adventure for template stories (11-20) */}
      {currentTemplateStory && (
        <DynamicStoryAdventure
          onClose={() => {
            setCurrentTemplateStory(null);
            setIsPlaying(false);
          }}
          onComplete={(score) => {
            // Find the story in effectiveStories by matching the title
            // This ensures we use the correct storyId format (young-10, young-11, etc.)
            const story = effectiveStories.find(s => s.title === currentTemplateStory.title);
            
            if (story) {
              handleAdventureComplete(story.id, score);
            } else {
              // Fallback: construct storyId from template
              const template = storyTemplates.find(t => t.title === currentTemplateStory.title);
              if (template) {
                const storyId = `young-${template.storyNumber - 1}`;
                handleAdventureComplete(storyId, score);
              } else {
                console.warn('Could not find story for completion:', currentTemplateStory);
              }
            }
            setCurrentTemplateStory(null);
            setIsPlaying(false);
          }}
          storyData={currentTemplateStory}
        />
      )}

    </div>
  );
};

export default YoungKidsPage;