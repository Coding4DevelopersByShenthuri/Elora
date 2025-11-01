import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Volume2, Star, Trophy, Play, BookOpen, 
  Mic, Award, Zap, Heart, Sparkles,
  Rabbit, Fish, Rocket, Cloud,
  Sun, CloudRain, Footprints,
  ChevronLeft, ChevronRight, Anchor,
  Shield, Download, Loader2, Crown, Compass,
  Music, VolumeX, HelpCircle, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import AuthModal from '@/components/auth/AuthModal';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import HybridServiceManager from '@/services/HybridServiceManager';
import { ModelManager } from '@/services/ModelManager';
import { WhisperService } from '@/services/WhisperService';
import { TransformersService } from '@/services/TransformersService';
import { TimeTracker } from '@/services/TimeTracker';
import EnhancedTTS from '@/services/EnhancedTTS';

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
  const [floatingIcons, setFloatingIcons] = useState<Array<{id: number; type: string; x: number; y: number}>>([]);
  const [bounceAnimation, setBounceAnimation] = useState(false);
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
  const [enrolledWords, setEnrolledWords] = useState<Array<{ word: string; hint: string }>>([]);
  const [enrolledStoryWordsDetailed, setEnrolledStoryWordsDetailed] = useState<Array<{ word: string; hint: string; storyId: string; storyTitle: string }>>([]);
  const [selectedStoryFilter, setSelectedStoryFilter] = useState<string>('all');
  const [enrolledPhrases, setEnrolledPhrases] = useState<Array<{ phrase: string; phonemes: string }>>([]);
  const [enrolledStoryPhrasesDetailed, setEnrolledStoryPhrasesDetailed] = useState<Array<{ phrase: string; phonemes: string; storyId: string; storyTitle: string }>>([]);
  const [selectedPhraseFilter, setSelectedPhraseFilter] = useState<string>('all');
  const storiesPerPage = 4;
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [dynamicStories, setDynamicStories] = useState<typeof allStories | null>(null);
  const [serverAchievements, setServerAchievements] = useState<any[]>([]);

  // Enrolled internal story IDs, derived from enrolled words/phrases (populated after completion)
  const enrolledInternalStoryIds = useMemo(() => {
    const ids = new Set<string>();
    enrolledStoryWordsDetailed.forEach(w => ids.add(w.storyId));
    enrolledStoryPhrasesDetailed.forEach(p => ids.add(p.storyId));
    return ids;
  }, [enrolledStoryWordsDetailed, enrolledStoryPhrasesDetailed]);

  // Interactive features state
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null);

  // SLM & Model Management State
  const [modelsReady, setModelsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  

  // Sync activeCategory with URL on mount or URL change
  useEffect(() => {
    const urlCategory = searchParams.get('section') || 'stories';
    if (urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
          mode: 'hybrid',
          preferOffline: false,
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
        if (token && token !== 'local-token') {
          try {
            const serverProgress = await KidsApi.getProgress(token);
            setPoints(serverProgress.points ?? 0);
            setStreak(serverProgress.streak ?? 0);
            const fav = (serverProgress as any)?.details?.favorites ?? [];
            // Convert old number-based favorites to new string-based format
            const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
              if (typeof f === 'number') {
                return `young-${f}`;
              }
              return f;
            }) : [];
            setFavorites(convertedFavorites);
            
            // Load pronunciation, vocabulary, and games attempts
            const details = (serverProgress as any)?.details || {};
            const pronCount = Object.keys(details.pronunciation || {}).length;
            const vocabCount = Object.keys(details.vocabulary || {}).length;
            // Track game attempts: use actual attempts count if available, otherwise estimate from points
            const gamesAttemptsCount = Number(details.games?.attempts || 0);
            const gamesPoints = Number(details.games?.points || 0);
            // Calculate game attempts: prefer actual count, fallback to estimation from points (average 15 points per attempt)
            const estimatedGamesAttempts = gamesAttemptsCount > 0 
              ? gamesAttemptsCount 
              : Math.floor(gamesPoints / 15);
            setPronunciationAttempts(pronCount);
            setVocabularyAttempts(vocabCount);
            setGamesAttempts(estimatedGamesAttempts);
          } catch {
            const localProgress = await KidsProgressService.get(userId);
            setPoints(localProgress.points);
            setStreak(localProgress.streak);
            const fav = (localProgress as any).details?.favorites ?? [];
            const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
              if (typeof f === 'number') {
                return `young-${f}`;
              }
              return f;
            }) : [];
            setFavorites(convertedFavorites);
            
            const details = (localProgress as any).details || {};
            const pronCount = Object.keys(details.pronunciation || {}).length;
            const vocabCount = Object.keys(details.vocabulary || {}).length;
            const gamesCount = Array.isArray(details.games?.types) ? details.games.types.length : 0;
            const gamesPoints = Number(details.games?.points || 0);
            const estimatedGamesAttempts = gamesCount > 0 
              ? Math.max(gamesCount, Math.floor(gamesPoints / 15)) 
              : Math.floor(gamesPoints / 15);
            setPronunciationAttempts(pronCount);
            setVocabularyAttempts(vocabCount);
            setGamesAttempts(estimatedGamesAttempts);
          }
        } else {
          const localProgress = await KidsProgressService.get(userId);
          setPoints(localProgress.points);
          setStreak(localProgress.streak);
          const fav = (localProgress as any).details?.favorites ?? [];
          const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
            if (typeof f === 'number') {
              return `young-${f}`;
            }
            return f;
          }) : [];
          setFavorites(convertedFavorites);
          
          const details = (localProgress as any).details || {};
          const pronCount = Object.keys(details.pronunciation || {}).length;
          const vocabCount = Object.keys(details.vocabulary || {}).length;
          const gamesCount = Array.isArray(details.games?.types) ? details.games.types.length : 0;
          const gamesPoints = Number(details.games?.points || 0);
          const estimatedGamesAttempts = gamesCount > 0 ? Math.max(gamesCount, Math.floor(gamesPoints / 10)) : 0;
          setPronunciationAttempts(pronCount);
          setVocabularyAttempts(vocabCount);
          setGamesAttempts(estimatedGamesAttempts);
        }
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

    const icons = ['star', 'heart', 'sparkles', 'zap'];
    const newFloatingIcons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      type: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    }));
    setFloatingIcons(newFloatingIcons);
    
    // Set up real-time polling for progress updates every 3 seconds
    const progressInterval = setInterval(loadProgress, 3000);
    
    return () => clearInterval(progressInterval);
  }, [userId, isAuthenticated]);

  // Load vocabulary words and phrases from enrolled stories
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadVocabularyWordsAndPhrases = () => {
      try {
        // Get words from enrolled stories
        const storyWords = StoryWordsService.getWordsFromEnrolledStories(userId);
        // Save detailed for filtering; do NOT fallback to defaults for Word Games
        const detailed = storyWords.map(sw => ({
          word: sw.word,
          hint: sw.hint,
          storyId: sw.storyId,
          storyTitle: sw.storyTitle
        }));
        setEnrolledStoryWordsDetailed(detailed);
        // Apply current filter immediately
        const filtered = selectedStoryFilter === 'all' 
          ? detailed
          : detailed.filter(w => w.storyId === selectedStoryFilter);
        const words = filtered.map(w => ({ word: w.word, hint: w.hint }));
        console.log(`📚 Loaded ${words.length} words from enrolled stories${selectedStoryFilter !== 'all' ? ' (filtered)' : ''}`);
        setEnrolledWords(words);

        // Get phrases from enrolled stories
        const storyPhrases = StoryWordsService.getPhrasesFromEnrolledStories(userId);
        // Save detailed for filtering; do NOT fallback to defaults for Speak & Repeat
        const detailedPhrases = storyPhrases.map(sp => ({
          phrase: sp.phrase,
          phonemes: sp.phonemes,
          storyId: sp.storyId,
          storyTitle: sp.storyTitle
        }));
        setEnrolledStoryPhrasesDetailed(detailedPhrases);
        // Apply current filter immediately
        const filteredPhrases = selectedPhraseFilter === 'all' 
          ? detailedPhrases
          : detailedPhrases.filter(p => p.storyId === selectedPhraseFilter);
        const phrases = filteredPhrases.map(p => ({ phrase: p.phrase, phonemes: p.phonemes }));
        console.log(`🎤 Loaded ${phrases.length} phrases from enrolled stories${selectedPhraseFilter !== 'all' ? ' (filtered)' : ''}`);
        setEnrolledPhrases(phrases);
      } catch (error) {
        console.error('Error loading vocabulary words and phrases:', error);
        // For Word Games and Speak & Repeat, do not fallback to defaults; show empty state
        setEnrolledWords([]);
        setEnrolledPhrases([]);
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

  const allStories = [
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
  ];

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
        setIsPlaying(true);
        setBounceAnimation(true);
        
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

  // Calculate pagination
  const effectiveStories = dynamicStories || allStories;
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

  // Use enrolled words only for Word Games (no fallback to defaults)
  const vocabularyWordsToUse = enrolledWords;

  const handleStartLesson = async (storyId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const storyIndex = effectiveStories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return;

    handleElementClick(`story-${storyId}`);
    
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
    setBounceAnimation(true);
    
    // Open appropriate adventure module
    const storyType = effectiveStories[storyIndex].type;
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
    
    // Add celebration effects - award points for starting a story
    const pointsToAdd = 50;
    const newPoints = points + pointsToAdd;
    setPoints(newPoints);
    
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
    
    // Reset bounce animation
    setTimeout(() => setBounceAnimation(false), 1000);
    
    // Add floating particles
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      type: ['star', 'heart', 'sparkles'][Math.floor(Math.random() * 3)],
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setFloatingIcons(prev => [...prev, ...newParticles]);
    
    // Remove particles after animation
    setTimeout(() => {
      setFloatingIcons(prev => prev.filter(icon => !newParticles.find(p => p.id === icon.id)));
    }, 2000);

    // Story intro voice disabled - only story content should be read by unique voices
    // The story title and description are now silent to avoid confusion with character voices
    
    setIsPlaying(false);
  };

  const toggleFavorite = async (storyId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const next = favorites.includes(storyId)
      ? favorites.filter(id => id !== storyId)
      : [...favorites, storyId];
    setFavorites(next);
    
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        try {
          const current = await KidsApi.getProgress(token);
          const details = { ...((current as any).details || {}), favorites: next };
          await KidsApi.updateProgress(token, { details });
          return;
        } catch (error) {
          console.error('Error updating favorites on server:', error);
        }
      }
      
      await KidsProgressService.update(userId, (p) => {
        const details = { ...(p as any).details };
        details.favorites = next;
        return { ...p, details } as any;
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'star': return Star;
      case 'heart': return Heart;
      case 'sparkles': return Sparkles;
      case 'zap': return Zap;
      default: return Star;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'star': return 'text-yellow-400 dark:text-yellow-300';
      case 'heart': return 'text-pink-400 dark:text-pink-300';
      case 'sparkles': return 'text-purple-400 dark:text-purple-300';
      case 'zap': return 'text-blue-400 dark:text-blue-300';
      default: return 'text-yellow-400 dark:text-yellow-300';
    }
  };

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
      'jungle': 'jungle-explorer'
    };
    return mapping[storyType] || storyType;
  };

  const handleAdventureComplete = async (storyId: string, score: number) => {
    if (!isAuthenticated) return;

    const storyIndex = (dynamicStories || allStories).findIndex(s => s.id === storyId);
    if (storyIndex === -1) return;

    // Calculate points based on score: base points from score + completion bonus
    const basePoints = Math.round(score / 10);
    const completionBonus = 50; // Bonus for completing the story
    const pointsToAdd = basePoints + completionBonus;
    const newPoints = points + pointsToAdd;
    setPoints(newPoints);
    
    // Update streak correctly (check if user practiced yesterday)
    await incrementStreakIfNeeded('story-complete');
    
    // Get story information for enrollment
    const story = (dynamicStories || allStories)[storyIndex];
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
      const storyWords = StoryWordsService.getWordsFromEnrolledStories(userId);
      const detailedWords = storyWords.map(sw => ({
        word: sw.word,
        hint: sw.hint,
        storyId: sw.storyId,
        storyTitle: sw.storyTitle
      }));
      setEnrolledStoryWordsDetailed(detailedWords);
      const filteredWords = selectedStoryFilter === 'all' 
        ? detailedWords
        : detailedWords.filter(w => w.storyId === selectedStoryFilter);
      const words = filteredWords.map(w => ({ word: w.word, hint: w.hint }));
      console.log(`🎉 Story completed! Loaded ${words.length} total words from enrolled stories`);
      setEnrolledWords(words);

      const storyPhrases = StoryWordsService.getPhrasesFromEnrolledStories(userId);
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
      const phrases = filteredPhrases.map(p => ({ phrase: p.phrase, phonemes: p.phonemes }));
      console.log(`🎉 Story completed! Loaded ${phrases.length} total phrases from enrolled stories`);
      setEnrolledPhrases(phrases);
      
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
    
    handleElementClick(`category-${categoryId}`);
    
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
        newStreak = currentStreak + 1;
      } else if (!last) {
        // First time practicing
        newStreak = 1;
      } else {
        // Streak broken - user didn't practice yesterday (or it's been more than 1 day)
        newStreak = 1;
      }

      if (token && token !== 'local-token') {
        const current = await KidsApi.getProgress(token);
        currentStreak = (current as any)?.streak ?? 0;
        
        // Recalculate if we have server data
        const serverLastDate = (current as any)?.details?.engagement?.lastStreakDate;
        if (serverLastDate === yesterdayKey) {
          newStreak = currentStreak + 1;
        } else if (!serverLastDate || serverLastDate !== todayKey) {
          newStreak = 1;
        } else {
          return; // Already counted today
        }
        
        const details = { ...((current as any)?.details || {}) };
        details.engagement = details.engagement || {};
        details.engagement.lastStreakDate = todayKey;
        details.engagement.source = source;
        await KidsApi.updateProgress(token, { streak: newStreak, details });
      } else {
        await KidsProgressService.update(userId, (p) => {
          const anyP: any = p as any;
          const details = { ...(anyP.details || {}) };
          details.engagement = details.engagement || {};
          details.engagement.lastStreakDate = todayKey;
          details.engagement.source = source;
          return { ...(p as any), streak: newStreak, details } as any;
        });
      }
      setStreak(newStreak);
      localStorage.setItem(localKey, todayKey);
    } catch (_) {}
  };


  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // Redirect to home page when user closes the auth modal without logging in
    navigate('/');
  };

  // Interactive functions
  const playSound = async (soundType: 'success' | 'celebration' | 'error') => {
    if (!isSoundEnabled) return;
    
    try {
      const soundMessages = {
        success: 'Great job!',
        celebration: 'Congratulations!',
        error: 'Try again!'
      };
      
      await EnhancedTTS.speak(soundMessages[soundType], { 
        rate: 1.2, 
        emotion: soundType === 'celebration' ? 'excited' : 'happy' 
      });
    } catch (error) {
      console.log('Sound playback not available');
    }
  };

  const triggerCelebration = () => {
    setCelebrating(true);
    playSound('celebration');
    setTimeout(() => setCelebrating(false), 3000);
  };

  const handleElementHover = (elementId: string) => {
    setHoveredElement(elementId);
  };

  const handleElementClick = (elementId: string) => {
    setPulseAnimation(true);
    setTimeout(() => setPulseAnimation(false), 1000);
    console.log(`Clicked element: ${elementId}`);
  };

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6">
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleAuthModalClose}
          initialMode={authMode}
          redirectFromKids={true}
          onAuthSuccess={handleAuthSuccess}
        />
        <div className="text-center p-4 sm:p-6 md:p-8 max-w-2xl w-full">
          <div className="animate-bounce mb-4 sm:mb-6">
            <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-yellow-500 mx-auto" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6 px-2">
            Welcome to Kids Learning Zone!
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-2">
            {authMode === 'login' 
              ? 'Please sign in to continue your magical learning adventure! 🎉' 
              : 'Create an account to start your magical learning adventure! 🎉'}
          </p>
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 md:px-10 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg w-full sm:w-auto transition-all hover:scale-105"
          >
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen pb-16 sm:pb-20 pt-24 sm:pt-32 md:pt-40 relative overflow-hidden"
    >
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
        initialMode={authMode}
        redirectFromKids={true}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Animated Background Elements - Hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-10 left-4 sm:left-10 animate-float-slow">
          <Cloud className="w-8 h-8 sm:w-12 sm:h-12 text-blue-200/60 dark:text-blue-700/60" />
        </div>
        <div className="absolute top-20 right-4 sm:right-20 animate-float-medium">
          <Sun className="w-10 h-10 sm:w-16 sm:h-16 text-yellow-200/60 dark:text-yellow-800/60" />
        </div>
        <div className="absolute bottom-20 left-4 sm:left-20 animate-float-fast">
          <CloudRain className="w-10 h-10 sm:w-14 sm:h-14 text-blue-300/60 dark:text-blue-600/60" />
        </div>
      </div>

      {/* My Badges Strip */}
      {serverAchievements && serverAchievements.length > 0 && (
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10 mb-4 sm:mb-6">
          <Card className="bg-white/80 dark:bg-gray-900/40 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-3 sm:p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-sm sm:text-base font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  My Badges
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {serverAchievements.filter((a: any) => a.unlocked).length} unlocked
                </div>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-1">
                {serverAchievements
                  .filter((a: any) => a.unlocked)
                  .slice(0, 12)
                  .map((a: any, idx: number) => (
                    <div key={`${a.id || a.name || idx}`}
                      className="min-w-[90px] bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg px-3 py-2 text-center">
                      <div className="text-lg">🏅</div>
                      <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate" title={(a.title || a.name || 'Badge') as string}>
                        {(a.title || a.name || 'Badge') as string}
                      </div>
                    </div>
                  ))}
                {serverAchievements.filter((a: any) => !a.unlocked).length > 0 && (
                  <div className="min-w-[120px] bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-3 py-2 text-center">
                    <div className="text-lg">✨</div>
                    <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Coming Next</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {(() => {
                        const locked = serverAchievements.filter((a: any) => !a.unlocked);
                        const next = locked.sort((a: any, b: any) => (b.progress || 0) - (a.progress || 0))[0];
                        return (next?.title || next?.name || 'Keep going!') as string;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Icons */}
      {floatingIcons.map((icon) => {
        const IconComponent = getIconComponent(icon.type);
        return (
          <div
            key={icon.id}
            className="absolute pointer-events-none animate-float-random"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <IconComponent className={cn("w-6 h-6", getIconColor(icon.type))} />
          </div>
        );
      })}

      {/* Celebration Effects */}
      {celebrating && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 relative">
          {/* Interactive Controls */}
          <div className="absolute top-0 right-0 flex gap-2 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsSoundEnabled(!isSoundEnabled);
                // Don't play sound feedback for sound toggle button
              }}
              className={cn(
                "rounded-full p-2 transition-all duration-300 hover:scale-110",
                isSoundEnabled ? "text-green-600 hover:bg-green-100" : "text-gray-400 hover:bg-gray-100"
              )}
              title={isSoundEnabled ? "Sound On" : "Sound Off"}
            >
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMusicEnabled(!isMusicEnabled);
                // Don't play sound feedback for music toggle button
              }}
              className={cn(
                "rounded-full p-2 transition-all duration-300 hover:scale-110",
                isMusicEnabled ? "text-purple-600 hover:bg-purple-100" : "text-gray-400 hover:bg-gray-100"
              )}
              title={isMusicEnabled ? "Music On" : "Music Off"}
            >
              <Music className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowHelp(!showHelp);
                // Don't play sound feedback for help toggle button
              }}
              className={cn(
                "rounded-full p-2 transition-all duration-300 hover:scale-110",
                showHelp ? "text-blue-600 hover:bg-blue-100" : "text-gray-400 hover:bg-gray-100"
              )}
              title="Help & Tips"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>

          {/* Help Panel */}
          {showHelp && (
            <div className="absolute top-12 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-xs z-30 border-2 border-blue-200 dark:border-blue-600">
              <h3 className="font-bold text-sm mb-2 text-blue-600 dark:text-blue-400">🎯 Quick Tips!</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Click any story to start learning!</li>
                <li>• Use the microphone to practice speaking</li>
                <li>• Complete stories to unlock new words</li>
                <li>• Play games to earn more points!</li>
              </ul>
            </div>
          )}

          {/* Decorative stars - Green and Orange */}
          <div 
            className={cn(
              "absolute -top-4 left-1/4 w-8 h-8 text-green-500 opacity-60 hidden md:block animate-pulse cursor-pointer transition-transform duration-300",
              hoveredElement === 'star-1' && "scale-125"
            )}
            onMouseEnter={() => handleElementHover('star-1')}
            onClick={() => handleElementClick('star-1')}
          >
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z"/>
            </svg>
          </div>
          <div 
            className={cn(
              "absolute -top-2 right-1/4 w-10 h-10 text-orange-500 opacity-70 hidden md:block animate-bounce cursor-pointer transition-transform duration-300",
              hoveredElement === 'star-2' && "scale-125"
            )}
            onMouseEnter={() => handleElementHover('star-2')}
            onClick={() => handleElementClick('star-2')}
          >
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z"/>
            </svg>
          </div>
          
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2">
            <div className="relative">
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full blur-md opacity-60 animate-pulse transition-all duration-300",
                celebrating && "animate-ping"
              )}></div>
            </div>
            <h1 
              className={cn(
                "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent cursor-pointer transition-all duration-300 hover:scale-105",
                pulseAnimation && "animate-pulse"
              )}
              onClick={() => {
                handleElementClick('title');
              }}
              onMouseEnter={() => handleElementHover('title')}
            >
               Little Learners
            </h1>
          </div>
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-300 max-w-2xl mx-auto mb-3 sm:mb-4 px-4 cursor-pointer transition-all duration-300 hover:text-gray-700 dark:hover:text-gray-100"
            onClick={() => handleElementClick('subtitle')}
            onMouseEnter={() => handleElementHover('subtitle')}
          >
              Magical stories, fun games, and exciting adventures for young minds!                   
          </p>
          
          {/* AI Status Badge */}
          <div className="flex items-center justify-center gap-2 flex-wrap px-4">
            {modelsReady && (
              <span className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 dark:bg-green-900/20 border-2 border-green-300 rounded-full text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">AI Teacher Ready (Offline)</span>
                <span className="sm:hidden">AI Ready</span>
              </span>
            )}
            {!modelsReady && !isInitializing && (
              <button
                onClick={() => navigate('/model-manager')}
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-300 rounded-full text-xs sm:text-sm font-semibold text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Download AI Tutor</span>
                <span className="sm:hidden">Download AI</span>
              </button>
            )}
            {isInitializing && (
              <span className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-300 rounded-full text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-400">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                Setting up...
              </span>
            )}
          </div>
        </div>

      
        <div className="mb-4 sm:mb-6 w-full max-w-full px-2 sm:px-0">
          <SyncStatusIndicator showDetails={false} className="w-full sm:w-auto" />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 px-2 sm:px-0 relative">
          {/* Decorative circles - Green */}
          <div 
            className={cn(
              "absolute -top-4 -left-4 w-12 h-12 text-green-500 opacity-30 hidden lg:block cursor-pointer transition-all duration-300",
              hoveredElement === 'deco-circle' && "scale-110 opacity-60"
            )}
            onMouseEnter={() => handleElementHover('deco-circle')}
            onClick={() => handleElementClick('deco-circle')}
          >
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" strokeDasharray="10,5"/>
            </svg>
          </div>
          {/* Decorative arrow - Orange */}
          <div 
            className={cn(
              "absolute -bottom-6 -right-6 w-16 h-16 text-orange-500 opacity-40 hidden lg:block cursor-pointer transition-all duration-300",
              hoveredElement === 'deco-arrow' && "scale-110 opacity-60"
            )}
            onMouseEnter={() => handleElementHover('deco-arrow')}
            onClick={() => handleElementClick('deco-arrow')}
          >
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <path d="M20 20C40 10 60 30 80 20C85 18 90 22 90 25C90 30 85 35 80 30C70 25 50 15 30 25C25 27 20 25 20 20Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
            </svg>
          </div>
          <Card 
            className={cn(
              "bg-yellow-50/30 dark:bg-yellow-900/10 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative cursor-pointer group",
              hoveredElement === 'points-card' && "scale-105 shadow-2xl"
            )}
            onMouseEnter={() => handleElementHover('points-card')}
            onClick={() => {
              handleElementClick('points-card');
            }}
          >
            {/* Decorative dot - Orange */}
            <div className="absolute -top-2 -right-2 w-6 h-6 text-orange-500 opacity-70 group-hover:animate-spin">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Trophy className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-600 dark:text-yellow-500 flex-shrink-0 transition-all duration-300",
                  hoveredElement === 'points-card' && "animate-bounce"
                )} />
                <span className={cn(
                  "text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white transition-all duration-300",
                  celebrating && "animate-pulse"
                )}>{points}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-300 font-bold group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                Sparkle Points ✨
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className={cn(
              "bg-green-50/30 dark:bg-green-900/10 backdrop-blur-sm border-2 border-green-200 dark:border-green-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative cursor-pointer group",
              hoveredElement === 'streak-card' && "scale-105 shadow-2xl"
            )}
            onMouseEnter={() => handleElementHover('streak-card')}
            onClick={() => {
              handleElementClick('streak-card');
            }}
          >
            {/* Decorative star - Green */}
            <div className="absolute -top-2 -right-2 w-6 h-6 text-green-500 opacity-70 group-hover:animate-spin">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z"/>
              </svg>
            </div>
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Zap className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600 dark:text-green-500 flex-shrink-0 transition-all duration-300",
                  hoveredElement === 'streak-card' && "animate-pulse"
                )} />
                <span className={cn(
                  "text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white transition-all duration-300",
                  celebrating && "animate-pulse"
                )}>{streak} days</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-300 font-bold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Learning Streak 🔥
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className={cn(
              "bg-blue-50/30 dark:bg-blue-900/10 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative cursor-pointer group",
              hoveredElement === 'achievements-card' && "scale-105 shadow-2xl"
            )}
            onMouseEnter={() => handleElementHover('achievements-card')}
            onClick={() => {
              handleElementClick('achievements-card');
              if (completedAchievements > 0) {
                triggerCelebration();
              }
            }}
          >
            {/* Decorative squiggle - Orange */}
            <div className="absolute top-2 right-2 w-8 h-8 text-orange-500 opacity-60 group-hover:animate-bounce">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path d="M10 50Q30 20 50 50T90 50" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Award className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-500 flex-shrink-0 transition-all duration-300",
                  hoveredElement === 'achievements-card' && "animate-bounce"
                )} />
                <span className={cn(
                  "text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white transition-all duration-300",
                  celebrating && "animate-pulse"
                )}>{completedAchievements}/{achievements.length}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-300 font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Super Achievements 🏆
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Navigation */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          {/* Mobile: Vertical Stack */}
          <div className="grid grid-cols-2 sm:hidden gap-2 px-2">
            {categories.map((category) => {
              const getCategoryColor = () => {
                switch(category.id) {
                  case 'stories': return 'bg-pink-50/40 dark:bg-pink-900/10 border-pink-300 dark:border-pink-600 hover:border-pink-400 dark:hover:border-pink-500';
                  case 'vocabulary': return 'bg-yellow-50/40 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-600 hover:border-yellow-400 dark:hover:border-yellow-500';
                  case 'pronunciation': return 'bg-orange-50/40 dark:bg-orange-900/10 border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500';
                  case 'games': return 'bg-purple-50/40 dark:bg-purple-900/10 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500';
                  default: return 'bg-gray-50/40 dark:bg-gray-900/10 border-gray-300 dark:border-gray-600';
                }
              };
              
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className={cn(
                    "rounded-xl px-3 py-4 text-sm font-bold transition-all duration-300 relative overflow-hidden group h-auto min-h-[80px] flex flex-col items-center justify-center gap-2 cursor-pointer",
                    activeCategory === category.id 
                      ? "bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white shadow-xl scale-105" 
                      : `${getCategoryColor()} backdrop-blur-sm text-gray-800 dark:text-white border-2 hover:shadow-md hover:scale-105`,
                    hoveredElement === `category-${category.id}` && "scale-110 shadow-lg"
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                  onMouseEnter={() => handleElementHover(`category-${category.id}`)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <span className={cn(
                    "text-3xl flex-shrink-0 transition-all duration-300",
                    hoveredElement === `category-${category.id}` && "animate-bounce"
                  )}>{category.emoji}</span>
                  <span className="text-xs font-semibold text-center leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.label}
                  </span>
                  {activeCategory === category.id && (
                    <Sparkles className="w-3 h-3 absolute top-1 right-1 animate-spin flex-shrink-0" />
                  )}
                  {hoveredElement === `category-${category.id}` && !activeCategory && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl animate-pulse" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Tablet & Desktop: Horizontal */}
          <div className="hidden sm:flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 px-2">
            {categories.map((category) => {
              const getCategoryColor = () => {
                switch(category.id) {
                  case 'stories': return 'bg-pink-50/40 dark:bg-pink-900/10 border-pink-300 dark:border-pink-600 hover:border-pink-400 dark:hover:border-pink-500';
                  case 'vocabulary': return 'bg-yellow-50/40 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-600 hover:border-yellow-400 dark:hover:border-yellow-500';
                  case 'pronunciation': return 'bg-orange-50/40 dark:bg-orange-900/10 border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500';
                  case 'games': return 'bg-purple-50/40 dark:bg-purple-900/10 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500';
                  default: return 'bg-gray-50/40 dark:bg-gray-900/10 border-gray-300 dark:border-gray-600';
                }
              };
              
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className={cn(
                    "rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg lg:text-xl font-bold transition-all duration-300 relative overflow-hidden group cursor-pointer",
                    activeCategory === category.id 
                      ? "bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white shadow-2xl transform hover:scale-110" 
                      : `${getCategoryColor()} backdrop-blur-sm text-gray-800 dark:text-white border-2 hover:shadow-lg hover:scale-105`,
                    hoveredElement === `category-${category.id}` && "scale-110 shadow-lg"
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                  onMouseEnter={() => handleElementHover(`category-${category.id}`)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <span className={cn(
                    "text-lg sm:text-xl md:text-2xl lg:text-3xl mr-1.5 sm:mr-2 md:mr-3 flex-shrink-0 transition-all duration-300",
                    hoveredElement === `category-${category.id}` && "animate-bounce"
                  )}>{category.emoji}</span>
                  <span className="whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.label}
                  </span>
                  {activeCategory === category.id && (
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1.5 sm:ml-2 animate-spin flex-shrink-0" />
                  )}
                  {hoveredElement === `category-${category.id}` && !activeCategory && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl animate-pulse" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stories Grid or Module Content */}
        {activeCategory === 'stories' && (
          <div className="mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0">
            {/* Stories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-6 sm:mb-8">
              {paginatedStories.map((story) => {
                const CharacterIcon = story.character;
                return (
                  <Card 
                    key={story.id} 
                    className={cn(
                      "group cursor-pointer bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-transparent hover:border-[#FF6B6B] transition-all duration-500 hover:shadow-2xl overflow-hidden w-full",
                      bounceAnimation && currentStory === story.id && "animate-bounce",
                      hoveredElement === `story-card-${story.id}` && "scale-105 shadow-2xl"
                    )}
                    onMouseEnter={() => {
                      setCurrentStory(story.id);
                      handleElementHover(`story-card-${story.id}`);
                    }}
                    onMouseLeave={() => setHoveredElement(null)}
                    onClick={() => {
                      // Play story preview on click
                      if (isSoundEnabled) {
                        EnhancedTTS.speak(
                          `${story.title}. ${story.description} Difficulty: ${story.difficulty}. Duration: ${story.duration}.`, 
                          { rate: 0.8, emotion: 'happy' }
                        ).catch(() => {});
                      }
                    }}
                  >
                    <CardContent className="p-0 overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl">
                      <div className={cn(
                        "p-4 sm:p-6 md:p-8 relative overflow-hidden bg-gradient-to-br",
                        story.bgGradient
                      )}>
                        {enrolledInternalStoryIds.has(getInternalStoryId(story.type)) && (
                          <div className="absolute top-2 left-2 bg-white/85 dark:bg-gray-900/60 border border-indigo-400/70 text-indigo-700 dark:text-indigo-300 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm backdrop-blur-sm inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            Enrolled
                          </div>
                        )}
                        <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/20 dark:bg-black/20 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/20 dark:bg-black/20 rounded-full -ml-8 sm:-ml-12 -mb-8 sm:-mb-12"></div>
                        <div className="relative z-10 text-center">
                          <div className={cn(
                            "text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transform transition-transform duration-300 group-hover:scale-110", 
                            story.animation,
                            hoveredElement === `story-card-${story.id}` && "animate-bounce"
                          )}>
                            {story.image}
                          </div>
                          <CharacterIcon className={cn(
                            "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-gray-600 dark:text-gray-300 opacity-80 transition-all duration-300",
                            hoveredElement === `story-card-${story.id}` && "animate-pulse scale-110"
                          )} />
                          <h3 className={cn(
                            "text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-gray-800 dark:text-white transition-all duration-300",
                            hoveredElement === `story-card-${story.id}` && "text-blue-600 dark:text-blue-400"
                          )}>
                            {story.title}
                          </h3>
                          <p className={cn(
                            "text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300 px-2 transition-all duration-300",
                            hoveredElement === `story-card-${story.id}` && "text-gray-700 dark:text-gray-200"
                          )}>
                            {story.description}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 md:p-6">
                        <div className="flex justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                          <span className="flex items-center gap-0.5 sm:gap-1 font-semibold">📚 {story.words}</span>
                          <span className="flex items-center gap-0.5 sm:gap-1 font-semibold">⏱️ {story.duration}</span>
                          <span className={cn(
                            "font-semibold",
                            story.difficulty === 'Easy' && "text-green-500 dark:text-green-400",
                            story.difficulty === 'Medium' && "text-yellow-500 dark:text-yellow-400",
                            story.difficulty === 'Hard' && "text-red-500 dark:text-red-400"
                          )}>
                            🎯 {story.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(story.id);
                            }} 
                            className={cn(
                              "rounded-lg sm:rounded-xl text-base sm:text-lg bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", 
                              favorites.includes(story.id) && "border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                            )}
                          >
                            ❤
                          </Button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {favorites.includes(story.id) ? 'In favorites' : 'Add to favorites'}
                          </span>
                        </div>
                        <Button 
                          className={cn(
                            "w-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 group-hover:shadow-xl relative overflow-hidden text-sm sm:text-base",
                            bounceAnimation && currentStory === story.id && "animate-pulse"
                          )}
                          onClick={() => handleStartLesson(story.id)}
                          disabled={isPlaying}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                            {isPlaying && currentStory === story.id ? 'Starting...' : 'Start Adventure!'}
                          </span>
                          <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8 px-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg sm:rounded-xl px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold disabled:opacity-50 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-gray-300 dark:border-gray-600 text-teal-800 dark:text-teal-800"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-4 sm:h-4 sm:mr-1 md:mr-2 text-teal-800" />
                  <span className="hidden md:inline">Previous</span>
                </Button>
                
                <div className="flex items-center gap-1 sm:gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-bold",
                        currentPage === page 
                          ? "bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white shadow-lg" 
                          : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-gray-300 dark:border-gray-600 text-teal-800 dark:text-teal-800"
                      )}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg sm:rounded-xl px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold disabled:opacity-50 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-gray-300 dark:border-gray-600 text-teal-800 dark:text-teal-800"
                >
                  <span className="hidden md:inline">Next</span>
                  <ChevronRight className="w-4 h-4 sm:w-4 sm:h-4 sm:ml-1 md:ml-2 text-teal-800" />
                </Button>
              </div>
            )}

            {/* Page Info */}
            <div className="text-center mt-3 sm:mt-4 px-4">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + storiesPerPage, allStories.length)} of {allStories.length} amazing stories
              </p>
            </div>
          </div>
        )}

        {activeCategory === 'vocabulary' && (
          <div className="mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0 mx-auto w-full lg:max-w-7xl xl:max-w-[1400px]">
            {vocabularyWordsToUse.length === 0 ? (
              <Card className="border-2 border-yellow-300/50 bg-yellow-50/40 dark:bg-yellow-900/10 backdrop-blur-sm shadow-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                  📚 No Words Yet!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Complete a story first to unlock vocabulary words from that story!
                </p>
                <Button
                  onClick={() => setActiveCategory('stories')}
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white font-bold py-3 px-6 rounded-xl"
                >
                  Go to Stories →
                </Button>
              </Card>
            ) : (
              <div>
                {/* Story filter for Word Games (dropdown of enrolled stories) */}
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Story:</label>
                  <select
                    className="text-xs font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={selectedStoryFilter}
                    onChange={(e) => setSelectedStoryFilter(e.target.value)}
                  >
                    <option value="all">All Stories</option>
                    {Array.from(new Map(
                      enrolledStoryWordsDetailed.map(w => [w.storyId, w.storyTitle])
                    ).entries()).map(([sid, title]) => (
                      <option key={String(sid)} value={String(sid)}>{String(title)}</option>
                    ))}
                  </select>
                </div>
                <Card className="border-2 border-blue-300/50 bg-blue-50/40 dark:bg-blue-900/10 backdrop-blur-sm shadow-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        Words from Your {selectedStoryFilter === 'all' ? 'Stories' : 'Selected Story'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {vocabularyWordsToUse.length} words from your enrolled stories
                      </p>
                    </div>
                  </div>
                </Card>
                <Vocabulary 
                  words={vocabularyWordsToUse} 
                  onWordPracticed={async (word: string) => {
                    // Track vocabulary attempts
                    const newAttempts = vocabularyAttempts + 1;
                    setVocabularyAttempts(newAttempts);
                    
                    // Save to progress details
                    try {
                      const token = localStorage.getItem('speakbee_auth_token');
                      if (token && token !== 'local-token') {
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
                    
                    // Award points for vocabulary practice (base 20 points per word)
                    await awardEngagementPoints(20);
                    
                    // Update streak correctly (check if user practiced yesterday)
                    await incrementStreakIfNeeded('vocabulary');
                  }}
                />
              </div>
            )}
          </div>
        )}
        
        {activeCategory === 'pronunciation' && (
          <div className="mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0 mx-auto w-full lg:max-w-7xl xl:max-w-[1400px]">
            {enrolledPhrases.length === 0 ? (
              <Card className="border-2 border-orange-300/50 bg-orange-50/40 dark:bg-orange-900/10 backdrop-blur-sm shadow-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                  🎤 No Phrases Yet!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Complete a story first to unlock pronunciation phrases from that story!
                </p>
                <Button
                  onClick={() => setActiveCategory('stories')}
                  className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white font-bold py-3 px-6 rounded-xl"
                >
                  Go to Stories →
                </Button>
              </Card>
            ) : (
              <div>
                {/* Story filter for Speak & Repeat (dropdown of enrolled stories) */}
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Story:</label>
                  <select
                    className="text-xs font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={selectedPhraseFilter}
                    onChange={(e) => setSelectedPhraseFilter(e.target.value)}
                  >
                    <option value="all">All Stories</option>
                    {Array.from(new Map(
                      enrolledStoryPhrasesDetailed.map(p => [p.storyId, p.storyTitle])
                    ).entries()).map(([sid, title]) => (
                      <option key={String(sid)} value={String(sid)}>{String(title)}</option>
                    ))}
                  </select>
                </div>
                <Card className="border-2 border-orange-300/50 bg-orange-50/40 dark:bg-orange-900/10 backdrop-blur-sm shadow-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Mic className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        Phrases from Your {selectedPhraseFilter === 'all' ? 'Stories' : 'Selected Story'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {enrolledPhrases.length} phrases from your enrolled stories
                      </p>
                    </div>
                  </div>
                </Card>
                <Pronunciation 
                  items={enrolledPhrases}
                  onPhrasePracticed={async (phrase: string) => {
                    // Track pronunciation attempts
                    const newAttempts = pronunciationAttempts + 1;
                    setPronunciationAttempts(newAttempts);
                    
                    // Save to progress details
                    try {
                      const token = localStorage.getItem('speakbee_auth_token');
                      if (token && token !== 'local-token') {
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
                    
                    // Award points for pronunciation practice (base 30 points per phrase)
                    await awardEngagementPoints(30);
                    
                    // Update streak correctly (check if user practiced yesterday)
                    await incrementStreakIfNeeded('pronunciation');
                  }}
                />
              </div>
            )}
          </div>
        )}
        
        {activeCategory === 'games' && (
          <div className="mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0">
            <InteractiveGames />
          </div>
        )}

        {/* Achievements Section */}
        <Card className="bg-purple-100/50 dark:bg-purple-950/30 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-600 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl mb-6 sm:mb-8 mx-2 sm:mx-auto w-full lg:max-w-7xl xl:max-w-[1400px] relative">
          {/* Decorative elements - Green and Orange */}
          <div className="absolute -top-4 -left-4 w-12 h-12 text-green-500 opacity-60 hidden md:block animate-bounce">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z"/>
            </svg>
          </div>
          <div className="absolute -top-4 -right-4 w-10 h-10 text-orange-500 opacity-70 hidden md:block animate-pulse">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <circle cx="50" cy="50" r="40"/>
            </svg>
          </div>
          <div className="absolute -bottom-4 left-1/2 w-14 h-14 text-green-500 opacity-50 hidden md:block">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <path d="M10 50Q30 20 50 50T90 50" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-gray-900 dark:text-white flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span>Your Super Achievements!</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {achievements.map((achievement, index) => {
              const isComplete = achievement.progress === 100;
              return (
                <div 
                  key={index} 
                  className={cn(
                    "text-center group cursor-pointer transform hover:scale-110 transition-all duration-300 relative",
                    hoveredElement === `achievement-${index}` && "scale-110"
                  )}
                  onMouseEnter={() => handleElementHover(`achievement-${index}`)}
                  onMouseLeave={() => setHoveredElement(null)}
                  onClick={() => {
                    handleElementClick(`achievement-${index}`);
                    setSelectedAchievement(selectedAchievement === index ? null : index);
                  }}
                >
                  <div className="relative inline-block mb-2 sm:mb-3">
                    <div className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1 sm:mb-2 transition-all duration-300",
                      isComplete 
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg" 
                        : "bg-white/80 dark:bg-gray-700 border-2 border-purple-200 dark:border-gray-600",
                      hoveredElement === `achievement-${index}` && "shadow-xl scale-110"
                    )}>
                      <span className={cn(
                        "text-xl sm:text-2xl transition-all duration-300",
                        hoveredElement === `achievement-${index}` && "animate-bounce"
                      )}>{achievement.emoji}</span>
                    </div>
                  </div>
                  <p className={cn(
                    "text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 px-1 transition-all duration-300",
                    hoveredElement === `achievement-${index}` && "text-blue-600 dark:text-blue-400"
                  )}>{achievement.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 mb-2 font-semibold">{achievement.description}</p>
                  <Progress value={achievement.progress} className="h-2 sm:h-3 bg-purple-200/60 dark:bg-gray-600 rounded-full mb-1 sm:mb-2">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        isComplete ? "bg-gradient-to-r from-yellow-400 to-orange-400" : "bg-gradient-to-r from-blue-400 to-purple-400"
                      )}
                    />
                  </Progress>
                  <span className={cn(
                    "text-s font-bold text-teal-700 transition-all duration-300",
                    hoveredElement === `achievement-${index}` && "text-blue-600 dark:text-blue-400"
                  )}>{achievement.progress.toFixed(0)}%</span>
                  
                  {/* Achievement Details Popup */}
                  {selectedAchievement === index && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 z-50 border-2 border-blue-200 dark:border-blue-600 min-w-[200px]">
                      <h4 className="font-bold text-sm mb-2 text-blue-600 dark:text-blue-400">
                        {achievement.name} {achievement.emoji}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        {achievement.description}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Progress: {achievement.progress.toFixed(0)}%
                      </div>
                      {isComplete && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">
                          🎉 Completed!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="text-center px-4 sm:px-6">
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-500 mb-4 sm:mb-6 font-semibold">Ready for more fun? Let's play! 🎯</p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto">
            <Button 
              variant="outline" 
              className={cn(
                "rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 border-2 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 bg-green-50/40 dark:bg-green-900/10 hover:bg-green-100/60 dark:hover:bg-green-900/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 group text-sm sm:text-base w-full sm:w-auto sm:flex-1 sm:min-w-[160px] cursor-pointer",
                hoveredElement === 'quick-listen' && "scale-110 shadow-lg"
              )}
              onClick={() => {
                handleElementClick('quick-listen');
                handleCategoryClick('pronunciation');
                awardEngagementPoints(5);
                incrementStreakIfNeeded('quick-listen');
              }}
              onMouseEnter={() => handleElementHover('quick-listen')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <Volume2 className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400 group-hover:animate-bounce flex-shrink-0 transition-all duration-300",
                hoveredElement === 'quick-listen' && "animate-bounce"
              )} />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Listen & Repeat
              </span>
            </Button>
            <Button 
              variant="outline" 
              className={cn(
                "rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-100/60 dark:hover:bg-blue-900/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 group text-sm sm:text-base w-full sm:w-auto sm:flex-1 sm:min-w-[160px] cursor-pointer",
                hoveredElement === 'quick-speak' && "scale-110 shadow-lg"
              )}
              onClick={() => {
                handleElementClick('quick-speak');
                handleCategoryClick('pronunciation');
                awardEngagementPoints(5);
                incrementStreakIfNeeded('quick-speak');
              }}
              onMouseEnter={() => handleElementHover('quick-speak')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <Mic className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400 group-hover:animate-pulse flex-shrink-0 transition-all duration-300",
                hoveredElement === 'quick-speak' && "animate-pulse"
              )} />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Speak Now
              </span>
            </Button>
            <Button 
              variant="outline" 
              className={cn(
                "rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 border-2 border-pink-300 dark:border-pink-600 hover:border-pink-400 dark:hover:border-pink-500 bg-pink-50/40 dark:bg-pink-900/10 hover:bg-pink-100/60 dark:hover:bg-pink-900/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 group text-sm sm:text-base w-full sm:w-auto sm:flex-1 sm:min-w-[160px] cursor-pointer",
                hoveredElement === 'quick-favorites' && "scale-110 shadow-lg"
              )}
              onClick={() => {
                // Don't play sound feedback for navigation buttons
                setPulseAnimation(true);
                setTimeout(() => setPulseAnimation(false), 1000);
                awardEngagementPoints(5);
                incrementStreakIfNeeded('quick-favorites');
                navigate('/favorites/young');
              }}
              onMouseEnter={() => handleElementHover('quick-favorites')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <Heart className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-600 dark:text-pink-400 group-hover:animate-pulse flex-shrink-0 transition-all duration-300",
                hoveredElement === 'quick-favorites' && "animate-pulse"
              )} />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                Favorite Stories {(() => { const youngFavorites = favorites.filter(f => f.startsWith('young-')); return youngFavorites.length > 0 ? `(${youngFavorites.length})` : ''; })()}
              </span>
            </Button>
            <Button 
              variant="outline" 
              className={cn(
                "rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 bg-purple-50/40 dark:bg-purple-900/10 hover:bg-purple-100/60 dark:hover:bg-purple-900/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 group text-sm sm:text-base w-full sm:w-auto sm:flex-1 sm:min-w-[160px] cursor-pointer",
                hoveredElement === 'quick-certificates' && "scale-110 shadow-lg"
              )}
              onClick={() => {
                handleElementClick('quick-certificates');
                navigate('/kids/certificates');
              }}
              onMouseEnter={() => handleElementHover('quick-certificates')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <Crown className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 dark:text-purple-400 group-hover:animate-pulse flex-shrink-0 transition-all duration-300",
                hoveredElement === 'quick-certificates' && "animate-pulse"
              )} />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Certificates
              </span>
            </Button>
          </div>
        </div>
      </div>

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

      {/* Custom Animations */}
      <style>{`
        @keyframes float-random {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float-random {
          animation: float-random 6s ease-in-out infinite;
        }
        .animate-gradient {
          background: linear-gradient(-45deg, #FF6B6B, #4ECDC4, #118AB2, #FFD166);
          background-size: 400% 400%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default YoungKidsPage;