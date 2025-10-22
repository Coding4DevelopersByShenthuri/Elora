import { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Star, Trophy, Play, BookOpen, 
  Mic, Award, Zap, Heart, Sparkles,
  Rabbit, Fish, Rocket, Cloud,
  Sun, CloudRain, Footprints,
  ChevronLeft, ChevronRight, Anchor,
  Shield, Download, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import KidsProgressService from '@/services/KidsProgressService';
import KidsApi from '@/services/KidsApi';
import SpeechService from '@/services/SpeechService';
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
import AuthModal from '@/components/auth/AuthModal';
import { useNavigate } from 'react-router-dom';
import HybridServiceManager from '@/services/HybridServiceManager';
import { ModelManager } from '@/services/ModelManager';
import { WhisperService } from '@/services/WhisperService';
import { TransformersService } from '@/services/TransformersService';
import { TimeTracker } from '@/services/TimeTracker';

const KidsPage = () => {
  const [activeCategory, setActiveCategory] = useState('stories');
  const [currentStory, setCurrentStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pronunciationAttempts, setPronunciationAttempts] = useState(0);
  const [vocabularyAttempts, setVocabularyAttempts] = useState(0);
  const storiesPerPage = 4;
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // SLM & Model Management State
  const [modelsReady, setModelsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  

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
            setFavorites(Array.isArray(fav) ? fav : []);
            
            // Load pronunciation and vocabulary attempts
            const details = (serverProgress as any)?.details || {};
            const pronCount = Object.keys(details.pronunciation || {}).length;
            const vocabCount = Object.keys(details.vocabulary || {}).length;
            setPronunciationAttempts(pronCount);
            setVocabularyAttempts(vocabCount);
          } catch {
            const localProgress = await KidsProgressService.get(userId);
            setPoints(localProgress.points);
            setStreak(localProgress.streak);
            const fav = (localProgress as any).details?.favorites ?? [];
            setFavorites(Array.isArray(fav) ? fav : []);
            
            const details = (localProgress as any).details || {};
            const pronCount = Object.keys(details.pronunciation || {}).length;
            const vocabCount = Object.keys(details.vocabulary || {}).length;
            setPronunciationAttempts(pronCount);
            setVocabularyAttempts(vocabCount);
          }
        } else {
          const localProgress = await KidsProgressService.get(userId);
          setPoints(localProgress.points);
          setStreak(localProgress.streak);
          const fav = (localProgress as any).details?.favorites ?? [];
          setFavorites(Array.isArray(fav) ? fav : []);
          
          const details = (localProgress as any).details || {};
          const pronCount = Object.keys(details.pronunciation || {}).length;
          const vocabCount = Object.keys(details.vocabulary || {}).length;
          setPronunciationAttempts(pronCount);
          setVocabularyAttempts(vocabCount);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    loadProgress();

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
      words: 445,
      image: '🌳',
      character: Rabbit,
      gradient: 'from-green-400 to-emerald-400',
      bgGradient: 'from-green-200 to-emerald-300 dark:from-green-900 dark:to-emerald-900',
      animation: 'animate-float-slow',
      type: 'forest'
    },
    {
      title: "Space Adventure",
      description: "Join Cosmo on a cosmic listening journey!",
      difficulty: 'Medium',
      duration: '7 min',
      words: 533,
      image: '🚀',
      character: Rocket,
      gradient: 'from-purple-400 to-indigo-400',
      bgGradient: 'from-purple-200 to-indigo-300 dark:from-purple-900 dark:to-indigo-900',
      animation: 'animate-bounce',
      type: 'space'
    },
    {
      title: "Underwater World",
      description: "Dive with Finn and discover ocean secrets!",
      difficulty: 'Easy',
      duration: '6 min',
      words: 507,
      image: '🐠',
      character: Fish,
      gradient: 'from-blue-400 to-cyan-400',
      bgGradient: 'from-blue-200 to-cyan-300 dark:from-blue-900 dark:to-cyan-900',
      animation: 'animate-float-medium',
      type: 'ocean'
    },
    {
      title: "Dinosaur Discovery",
      description: "Explore prehistoric times with Dina!",
      difficulty: 'Hard',
      duration: '7 min',
      words: 518,
      image: '🦖',
      character: Footprints,
      gradient: 'from-orange-400 to-red-400',
      bgGradient: 'from-orange-200 to-red-300 dark:from-orange-900 dark:to-red-900',
      animation: 'animate-float-slow',
      type: 'dinosaur'
    },
    {
      title: "Unicorn Magic",
      description: "Join Stardust in a magical kingdom!",
      difficulty: 'Easy',
      duration: '5 min',
      words: 391,
      image: '🦄',
      character: Sparkles,
      gradient: 'from-pink-400 to-purple-400',
      bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-900',
      animation: 'animate-float-medium',
      type: 'unicorn'
    },
    {
      title: "Pirate Treasure",
      description: "Sail with Captain Finn on a treasure hunt!",
      difficulty: 'Medium',
      duration: '5 min',
      words: 428,
      image: '🏴‍☠️',
      character: Anchor,
      gradient: 'from-amber-400 to-yellow-400',
      bgGradient: 'from-amber-200 to-yellow-300 dark:from-amber-900 dark:to-yellow-900',
      animation: 'animate-bounce',
      type: 'pirate'
    },
    {
      title: "Superhero School",
      description: "Train with Captain Courage to be a hero!",
      difficulty: 'Medium',
      duration: '6 min',
      words: 419,
      image: '🦸',
      character: Shield,
      gradient: 'from-red-400 to-blue-500',
      bgGradient: 'from-red-200 to-blue-300 dark:from-red-900 dark:to-blue-900',
      animation: 'animate-float-fast',
      type: 'superhero'
    },
    {
      title: "Fairy Garden",
      description: "Discover tiny wonders with Twinkle the fairy!",
      difficulty: 'Easy',
      duration: '5 min',
      words: 364,
      image: '🧚',
      character: Sparkles,
      gradient: 'from-violet-400 to-cyan-400',
      bgGradient: 'from-violet-200 to-cyan-300 dark:from-violet-900 dark:to-cyan-900',
      animation: 'animate-float-slow',
      type: 'fairy'
    }
  ];

  // Calculate pagination
  const startIndex = (currentPage - 1) * storiesPerPage;
  const paginatedStories = allStories.slice(startIndex, startIndex + storiesPerPage);
  const totalPages = Math.ceil(allStories.length / storiesPerPage);

  // Dynamic achievements based on real-time progress
  const achievements = [
    { 
      name: 'First Words', 
      icon: Star, 
      progress: Math.min(100, Math.round((points / 1000) * 100)), 
      emoji: '🌟',
      description: `${points}/1000 points`
    },
    { 
      name: 'Story Master', 
      icon: BookOpen, 
      progress: Math.min(100, favorites.length * 12.5), 
      emoji: '📖',
      description: `${favorites.length}/8 favorite stories`
    },
    { 
      name: 'Pronunciation Pro', 
      icon: Mic, 
      progress: Math.min(100, pronunciationAttempts * 7.14), 
      emoji: '🎤',
      description: `${pronunciationAttempts}/14 practiced`
    },
    { 
      name: 'Vocabulary Builder', 
      icon: Zap, 
      progress: Math.min(100, vocabularyAttempts * 7.14), 
      emoji: '⚡',
      description: `${vocabularyAttempts}/14 words learned`
    },
  ];
  const completedAchievements = achievements.filter(a => a.progress === 100).length;

  // Offline kids lesson content for modules
  const vocabWords = [
    { word: 'rabbit', hint: '🐰 Say: RAB-it' },
    { word: 'forest', hint: '🌲 Say: FOR-est' },
    { word: 'planet', hint: '🪐 Say: PLAN-it' },
    { word: 'dinosaur', hint: '🦖 Say: DY-no-sawr' },
    { word: 'unicorn', hint: '🦄 Say: YOU-ni-corn' },
    { word: 'pirate', hint: '🏴‍☠️ Say: PY-rate' },
    { word: 'treasure', hint: '💎 Say: TREZH-er' },
    { word: 'parrot', hint: '🦜 Say: PAIR-ut' },
    { word: 'superhero', hint: '🦸 Say: SOO-per-hero' },
    { word: 'rescue', hint: '🚁 Say: RES-kyoo' },
    { word: 'fairy', hint: '🧚 Say: FAIR-ee' },
    { word: 'magic', hint: '✨ Say: MAJ-ik' },
    { word: 'moonflower', hint: '🌙🌸 Say: MOON-flow-er' },
    { word: 'sparkle', hint: '⭐ Say: SPAR-kul' }
  ];

  const pronounceItems = [
    { phrase: 'Hello Luna', phonemes: '👋 Say: heh-LOW LOO-nah' },
    { phrase: 'Magic forest', phonemes: '✨🌲 Say: MAJ-ik FOR-est' },
    { phrase: 'Happy rabbit', phonemes: '😊🐰 Say: HAP-ee RAB-it' },
    { phrase: 'Big dinosaur', phonemes: '🦖 Say: BIG DY-no-sawr' },
    { phrase: 'Rainbow unicorn', phonemes: '🌈🦄 Say: RAIN-bow YOU-ni-corn' },
    { phrase: 'Pirate treasure', phonemes: '🏴‍☠️💎 Say: PY-rate TREZH-er' },
    { phrase: 'Captain Finn', phonemes: '⚓ Say: CAP-tin FIN' },
    { phrase: 'Buried treasure', phonemes: '🏝️💰 Say: BER-eed TREZH-er' },
    { phrase: 'Superhero training', phonemes: '🦸‍♂️💪 Say: SOO-per-hero TRAIN-ing' },
    { phrase: 'Rescue mission', phonemes: '🚁🆘 Say: RES-kyoo MISH-un' },
    { phrase: 'Fairy dust', phonemes: '🧚✨ Say: FAIR-ee DUST' },
    { phrase: 'Magic sparkles', phonemes: '✨⭐ Say: MAJ-ik SPAR-kulz' },
    { phrase: 'Talking bunnies', phonemes: '🐰💬 Say: TAWK-ing BUN-eez' },
    { phrase: 'Glowing moonflowers', phonemes: '🌙🌸 Say: GLOW-ing MOON-flow-erz' }
  ];

  const handleStartLesson = async (storyIndex: number) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const actualIndex = startIndex + storyIndex;
    setCurrentStory(actualIndex);
    setIsPlaying(true);
    setBounceAnimation(true);
    
    // Open appropriate adventure module
    const storyType = allStories[actualIndex].type;
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
    }
    
    // Add celebration effects
    const newPoints = points + 50;
    const newStreak = streak + 1;
    setPoints(newPoints);
    setStreak(newStreak);
    
    // Persist to server first, fallback to local
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      const updateDetails = (details: any) => {
        details.readAloud = details.readAloud || {};
        const key = `story-${actualIndex}`;
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
        await KidsApi.updateProgress(token, { 
          points: newPoints, 
          streak: newStreak, 
          details 
        });
      } else {
        await KidsProgressService.update(userId, (p) => {
          const details = updateDetails((p as any).details || {});
          return { 
            ...p, 
            points: newPoints, 
            streak: newStreak, 
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

    // Speak story intro (offline TTS baseline)
    try {
      const story = allStories[actualIndex];
      if (SpeechService.isTTSSupported()) {
        await SpeechService.speak(`${story.title}. ${story.description}`, { rate: 0.95 });
      }
    } catch (error) {
      console.error('Error speaking story intro:', error);
    }
    
    setIsPlaying(false);
  };

  const toggleFavorite = async (storyIndex: number) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const next = favorites.includes(storyIndex)
      ? favorites.filter(i => i !== storyIndex)
      : [...favorites, storyIndex];
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

  const handleAdventureComplete = async (storyIndex: number, score: number) => {
    if (!isAuthenticated) return;

    const newPoints = points + 100;
    const newStreak = streak + 1;
    setPoints(newPoints);
    setStreak(newStreak);
    
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      const key = `story-${storyIndex}`;
      
      if (token && token !== 'local-token') {
        const current = await KidsApi.getProgress(token);
        const details = { ...((current as any).details || {}) };
        details.readAloud = details.readAloud || {};
        const prev = details.readAloud[key] || { bestScore: 0, attempts: 0 };
        details.readAloud[key] = { 
          bestScore: Math.max(prev.bestScore, score), 
          attempts: prev.attempts + 1 
        };
        await KidsApi.updateProgress(token, { 
          points: newPoints, 
          streak: newStreak, 
          details 
        });
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
            points: newPoints, 
            streak: newStreak, 
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
    setActiveCategory(categoryId);
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

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 relative">
          {/* Decorative stars - Green and Orange */}
          <div className="absolute -top-4 left-1/4 w-8 h-8 text-green-500 opacity-60 hidden md:block animate-pulse">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z"/>
            </svg>
          </div>
          <div className="absolute -top-2 right-1/4 w-10 h-10 text-orange-500 opacity-70 hidden md:block animate-bounce">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z"/>
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full blur-md opacity-60 animate-pulse"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent">
              Kids Learning Zone
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-300 max-w-2xl mx-auto mb-3 sm:mb-4 px-4">
            Fun stories, exciting games, and magical adventures to learn English!
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
          <div className="absolute -top-4 -left-4 w-12 h-12 text-green-500 opacity-30 hidden lg:block">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" strokeDasharray="10,5"/>
            </svg>
          </div>
          {/* Decorative arrow - Orange */}
          <div className="absolute -bottom-6 -right-6 w-16 h-16 text-orange-500 opacity-40 hidden lg:block">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <path d="M20 20C40 10 60 30 80 20C85 18 90 22 90 25C90 30 85 35 80 30C70 25 50 15 30 25C25 27 20 25 20 20Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
            </svg>
          </div>
          <Card className="bg-yellow-50/30 dark:bg-yellow-900/10 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
            {/* Decorative dot - Orange */}
            <div className="absolute -top-2 -right-2 w-6 h-6 text-orange-500 opacity-70">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{points}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-300 font-bold">Sparkle Points ✨</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50/30 dark:bg-green-900/10 backdrop-blur-sm border-2 border-green-200 dark:border-green-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
            {/* Decorative star - Green */}
            <div className="absolute -top-2 -right-2 w-6 h-6 text-green-500 opacity-70">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                <path d="M50 10L60 40L90 50L60 60L50 90L40 60L10 50L40 40Z"/>
              </svg>
            </div>
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-600 dark:text-green-500 animate-pulse flex-shrink-0" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{streak} days</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-300 font-bold">Learning Streak 🔥</p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50/30 dark:bg-blue-900/10 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
            {/* Decorative squiggle - Orange */}
            <div className="absolute top-2 right-2 w-8 h-8 text-orange-500 opacity-60">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <path d="M10 50Q30 20 50 50T90 50" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{completedAchievements}/{achievements.length}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-300 font-bold">Super Achievements 🏆</p>
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
                    "rounded-xl px-3 py-4 text-sm font-bold transition-all duration-300 relative overflow-hidden group h-auto min-h-[80px] flex flex-col items-center justify-center gap-2",
                    activeCategory === category.id 
                      ? "bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white shadow-xl" 
                      : `${getCategoryColor()} backdrop-blur-sm text-gray-800 dark:text-white border-2 hover:shadow-md`
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <span className="text-3xl flex-shrink-0">{category.emoji}</span>
                  <span className="text-xs font-semibold text-center leading-tight">{category.label}</span>
                  {activeCategory === category.id && (
                    <Sparkles className="w-3 h-3 absolute top-1 right-1 animate-spin flex-shrink-0" />
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
                    "rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg lg:text-xl font-bold transition-all duration-300 relative overflow-hidden group",
                    activeCategory === category.id 
                      ? "bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white shadow-2xl transform hover:scale-110" 
                      : `${getCategoryColor()} backdrop-blur-sm text-gray-800 dark:text-white border-2 hover:shadow-lg hover:scale-105`
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl mr-1.5 sm:mr-2 md:mr-3 flex-shrink-0">{category.emoji}</span>
                  <span className="whitespace-nowrap">{category.label}</span>
                  {activeCategory === category.id && (
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1.5 sm:ml-2 animate-spin flex-shrink-0" />
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
                const actualIndex = allStories.findIndex(s => s.title === story.title);
                const CharacterIcon = story.character;
                return (
                  <Card 
                    key={actualIndex} 
                    className={cn(
                      "group cursor-pointer bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-transparent hover:border-[#FF6B6B] transition-all duration-500 hover:shadow-2xl overflow-hidden w-full",
                      bounceAnimation && currentStory === actualIndex && "animate-bounce"
                    )}
                    onMouseEnter={() => setCurrentStory(actualIndex)}
                  >
                    <CardContent className="p-0 overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl">
                      <div className={cn(
                        "p-4 sm:p-6 md:p-8 relative overflow-hidden bg-gradient-to-br",
                        story.bgGradient
                      )}>
                        <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/20 dark:bg-black/20 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/20 dark:bg-black/20 rounded-full -ml-8 sm:-ml-12 -mb-8 sm:-mb-12"></div>
                        <div className="relative z-10 text-center">
                          <div className={cn("text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transform transition-transform duration-300 group-hover:scale-110", story.animation)}>
                            {story.image}
                          </div>
                          <CharacterIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-gray-600 dark:text-gray-300 opacity-80" />
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-gray-800 dark:text-white">
                            {story.title}
                          </h3>
                          <p className="text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300 px-2">
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
                              toggleFavorite(actualIndex);
                            }} 
                            className={cn(
                              "rounded-lg sm:rounded-xl text-base sm:text-lg bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", 
                              favorites.includes(actualIndex) && "border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                            )}
                          >
                            ❤
                          </Button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {favorites.includes(actualIndex) ? 'In favorites' : 'Add to favorites'}
                          </span>
                        </div>
                        <Button 
                          className={cn(
                            "w-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B] text-white font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 group-hover:shadow-xl relative overflow-hidden text-sm sm:text-base",
                            bounceAnimation && currentStory === actualIndex && "animate-pulse"
                          )}
                          onClick={() => handleStartLesson(actualIndex)}
                          disabled={isPlaying}
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                            {isPlaying && currentStory === actualIndex ? 'Starting...' : 'Start Adventure!'}
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
            <Vocabulary 
              words={vocabWords} 
              onWordPracticed={() => {
                // Track vocabulary attempts
                setVocabularyAttempts(prev => prev + 1);
              }}
            />
          </div>
        )}
        
        {activeCategory === 'pronunciation' && (
          <div className="mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0">
            <Pronunciation 
              items={pronounceItems}
              onPhrasePracticed={() => {
                // Track pronunciation attempts
                setPronunciationAttempts(prev => prev + 1);
              }}
            />
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {achievements.map((achievement, index) => {
              const isComplete = achievement.progress === 100;
              return (
                <div key={index} className="text-center group cursor-pointer transform hover:scale-110 transition-transform duration-300">
                  <div className="relative inline-block mb-2 sm:mb-3">
                    <div className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-1 sm:mb-2 transition-all duration-300",
                      isComplete 
                        ? "bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg" 
                        : "bg-white/80 dark:bg-gray-700 border-2 border-purple-200 dark:border-gray-600"
                    )}>
                      <span className="text-xl sm:text-2xl">{achievement.emoji}</span>
                      {isComplete && (
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white absolute -top-1 -right-1 animate-ping" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 px-1">{achievement.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 mb-2 font-semibold">{achievement.description}</p>
                  <Progress value={achievement.progress} className="h-2 sm:h-3 bg-purple-200/60 dark:bg-gray-600 rounded-full mb-1 sm:mb-2">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        isComplete ? "bg-gradient-to-r from-yellow-400 to-orange-400" : "bg-gradient-to-r from-blue-400 to-purple-400"
                      )}
                    />
                  </Progress>
                  <span className="text-s font-bold text-teal-700">{achievement.progress.toFixed(0)}%</span>
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
              className="rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 border-2 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 bg-green-50/40 dark:bg-green-900/10 hover:bg-green-100/60 dark:hover:bg-green-900/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 group text-sm sm:text-base w-full sm:w-auto sm:flex-1 sm:min-w-[160px]"
              onClick={() => handleCategoryClick('pronunciation')}
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400 group-hover:animate-bounce flex-shrink-0" />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap">Listen & Repeat</span>
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 border-2 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-100/60 dark:hover:bg-blue-900/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 group text-sm sm:text-base w-full sm:w-auto sm:flex-1 sm:min-w-[160px]"
              onClick={() => handleCategoryClick('pronunciation')}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400 group-hover:animate-pulse flex-shrink-0" />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap">Speak Now</span>
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 border-2 border-pink-300 dark:border-pink-600 hover:border-pink-400 dark:hover:border-pink-500 bg-pink-50/40 dark:bg-pink-900/10 hover:bg-pink-100/60 dark:hover:bg-pink-900/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 group text-sm sm:text-base w-full sm:w-auto sm:flex-1 sm:min-w-[160px]"
              onClick={() => navigate('/favorites')}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-pink-600 dark:text-pink-400 group-hover:animate-pulse flex-shrink-0" />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap">
                Favorite Stories {favorites.length > 0 && `(${favorites.length})`}
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
            handleAdventureComplete(0, score);
          }}
        />
      )}

      {showSpaceAdventure && (
        <SpaceAdventure 
          onClose={() => setShowSpaceAdventure(false)} 
          onComplete={(score) => {
            setShowSpaceAdventure(false);
            handleAdventureComplete(1, score);
          }}
        />
      )}

      {showUnderwaterWorld && (
        <UnderwaterWorld 
          onClose={() => setShowUnderwaterWorld(false)} 
          onComplete={(score) => {
            setShowUnderwaterWorld(false);
            handleAdventureComplete(2, score);
          }}
        />
      )}

      {showDinosaurAdventure && (
        <DinosaurDiscoveryAdventure 
          onClose={() => setShowDinosaurAdventure(false)} 
          onComplete={(score) => {
            setShowDinosaurAdventure(false);
            handleAdventureComplete(3, score);
          }}
        />
      )}

      {showUnicornAdventure && (
        <UnicornMagicAdventure 
          onClose={() => setShowUnicornAdventure(false)} 
          onComplete={(score) => {
            setShowUnicornAdventure(false);
            handleAdventureComplete(4, score);
          }}
        />
      )}

      {showPirateAdventure && (
        <PirateTreasureAdventure 
          onClose={() => setShowPirateAdventure(false)} 
          onComplete={(score) => {
            setShowPirateAdventure(false);
            handleAdventureComplete(5, score);
          }}
        />
      )}

      {showSuperheroAdventure && (
        <SuperheroAdventure 
          onClose={() => setShowSuperheroAdventure(false)} 
          onComplete={(score) => {
            setShowSuperheroAdventure(false);
            handleAdventureComplete(6, score);
          }}
        />
      )}

      {showFairyGardenAdventure && (
        <FairyGardenAdventure 
          onClose={() => setShowFairyGardenAdventure(false)} 
          onComplete={(score) => {
            setShowFairyGardenAdventure(false);
            handleAdventureComplete(7, score);
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

export default KidsPage;