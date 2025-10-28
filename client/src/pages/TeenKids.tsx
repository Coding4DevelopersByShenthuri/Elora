import { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Star, Trophy, Play, BookOpen, 
  Mic, Award, Zap, Heart, Sparkles,
  Globe, Users, MessageSquare, Brain,
  ChevronLeft, ChevronRight, Target,
  Shield, Download, Loader2, Crown, Compass,
  Music, VolumeX, HelpCircle,
  TrendingUp, Clock, CheckCircle
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
import MysteryDetectiveAdventure from '@/components/kids/stories/MysteryDetectiveAdventure';
import SpaceExplorerAdventure from '@/components/kids/stories/SpaceExplorerAdventure';
import EnvironmentalHeroAdventure from '@/components/kids/stories/EnvironmentalHeroAdventure';
import TechInnovatorAdventure from '@/components/kids/stories/TechInnovatorAdventure';
import GlobalCitizenAdventure from '@/components/kids/stories/GlobalCitizenAdventure';
import AuthModal from '@/components/auth/AuthModal';
import { useNavigate, useLocation } from 'react-router-dom';
import HybridServiceManager from '@/services/HybridServiceManager';
import { ModelManager } from '@/services/ModelManager';
import { WhisperService } from '@/services/WhisperService';
import { TransformersService } from '@/services/TransformersService';
import { TimeTracker } from '@/services/TimeTracker';
import EnhancedTTS from '@/services/EnhancedTTS';

const TeenKidsPage = () => {
  const [activeCategory, setActiveCategory] = useState('stories');
  const [isOpeningFromFavorites, setIsOpeningFromFavorites] = useState(false);
  const [currentStory, setCurrentStory] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  const location = useLocation();
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [floatingIcons, setFloatingIcons] = useState<Array<{id: number; type: string; x: number; y: number}>>([]);
  const [bounceAnimation, setBounceAnimation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pronunciationAttempts, setPronunciationAttempts] = useState(0);
  const [vocabularyAttempts, setVocabularyAttempts] = useState(0);
  const [enrolledWords, setEnrolledWords] = useState<Array<{ word: string; hint: string }>>([]);
  const [enrolledPhrases, setEnrolledPhrases] = useState<Array<{ phrase: string; phonemes: string }>>([]);
  const storiesPerPage = 4;
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
  
  // Story modal state
  const [showMysteryDetective, setShowMysteryDetective] = useState(false);
  const [showSpaceExplorer, setShowSpaceExplorer] = useState(false);
  const [showEnvironmentalHero, setShowEnvironmentalHero] = useState(false);
  const [showTechInnovator, setShowTechInnovator] = useState(false);
  const [showGlobalCitizen, setShowGlobalCitizen] = useState(false);

  // Reset bounce animation when all modals are closed
  useEffect(() => {
    const anyModalOpen = showMysteryDetective || showSpaceExplorer || showEnvironmentalHero || 
                         showTechInnovator || showGlobalCitizen;
    
    if (!anyModalOpen) {
      // Reset bounce animation when modal closes
      setBounceAnimation(false);
      setCurrentStory('');
      setIsPlaying(false);
    }
  }, [showMysteryDetective, showSpaceExplorer, showEnvironmentalHero, 
      showTechInnovator, showGlobalCitizen]);

  // Check authentication and user existence on mount
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!isAuthenticated) {
        const speakbeeUsers = JSON.parse(localStorage.getItem("speakbee_users") || "[]");
        const legacyUsers = JSON.parse(localStorage.getItem('users') || "[]");
        
        const hasExistingUsers = speakbeeUsers.length > 0 || legacyUsers.length > 0;
        
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
      console.log('🚀 Initializing Teen Learning Environment...');

      try {
        await HybridServiceManager.initialize({
          mode: 'hybrid',
          preferOffline: false,
          autoSync: true,
          syncInterval: 15
        });

        const health = await HybridServiceManager.getSystemHealth();
        console.log('📊 System Health:', health);

        const piperReady = await ModelManager.isModelCached('piper-en-us-lessac-medium');
        const whisperReady = await ModelManager.isModelCached('whisper-tiny-en');
        const llmReady = await ModelManager.isModelCached('distilgpt2');

        setModelsReady(piperReady || whisperReady || llmReady);

        if (!piperReady && !whisperReady && !llmReady) {
          console.log('📦 Models not found. User can download from Model Manager page.');
        } else {
          console.log('✅ Models ready! Initializing services...');
          
          await Promise.allSettled([
            WhisperService.initialize().catch(err => 
              console.warn('Whisper initialization skipped:', err)
            ),
            TransformersService.initialize().catch(err => 
              console.warn('Transformers initialization skipped:', err)
            )
          ]);
          
          console.log('✅ Teen Learning Environment Ready!');
        }
      } catch (error) {
        console.error('Error initializing services:', error);
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
        "Welcome to Teen Explorer Zone! Ready to level up your English skills?",
        "Hey there! Let's tackle some challenging adventures together!",
        "Welcome back! Time to master some advanced English concepts!",
        "Ready for some real-world English practice? Let's go!"
      ];
      
      const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      
      const timer = setTimeout(() => {
        if (!isOpeningFromFavorites) {
          EnhancedTTS.speak(randomMessage, { rate: 1.0, emotion: 'excited' }).catch(() => {});
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isSoundEnabled, isOpeningFromFavorites]);

  // Load progress and generate floating icons
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
                return `teen-${f}`;
              }
              return f;
            }) : [];
            setFavorites(convertedFavorites);
            
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
            const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
              if (typeof f === 'number') {
                return `teen-${f}`;
              }
              return f;
            }) : [];
            setFavorites(convertedFavorites);
            
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
          const convertedFavorites = Array.isArray(fav) ? fav.map((f: any) => {
            if (typeof f === 'number') {
              return `teen-${f}`;
            }
            return f;
          }) : [];
          setFavorites(convertedFavorites);
          
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
    
    const progressInterval = setInterval(loadProgress, 3000);
    
    return () => clearInterval(progressInterval);
  }, [userId, isAuthenticated]);

  const categories = [
    { id: 'stories', label: 'Adventure Stories', icon: BookOpen, emoji: '📚' },
    { id: 'vocabulary', label: 'Advanced Vocabulary', icon: Brain, emoji: '🧠' },
    { id: 'pronunciation', label: 'Speaking Practice', icon: Mic, emoji: '🎤' },
    { id: 'games', label: 'Challenge Games', icon: Trophy, emoji: '🏆' },
  ];

  // Advanced stories for teens
  const allStories = [
    {
      title: "Mystery Detective",
      description: "Solve crimes and mysteries while learning advanced English!",
      difficulty: 'Hard',
      duration: '12 min',
      words: 800,
      image: '🕵️',
      character: Target,
      gradient: 'from-gray-400 to-slate-400',
      bgGradient: 'from-gray-200 to-slate-300 dark:from-gray-900 dark:to-slate-900',
      animation: 'animate-float-slow',
      type: 'mystery',
      id: 'teen-0'
    },
    {
      title: "Space Explorer",
      description: "Navigate complex space missions and scientific discoveries!",
      difficulty: 'Hard',
      duration: '15 min',
      words: 950,
      image: '🚀',
      character: Globe,
      gradient: 'from-blue-400 to-indigo-400',
      bgGradient: 'from-blue-200 to-indigo-300 dark:from-blue-900 dark:to-indigo-900',
      animation: 'animate-bounce',
      type: 'space',
      id: 'teen-1'
    },
    {
      title: "Environmental Hero",
      description: "Learn about climate change and environmental solutions!",
      difficulty: 'Medium',
      duration: '10 min',
      words: 700,
      image: '🌍',
      character: Shield,
      gradient: 'from-green-400 to-emerald-400',
      bgGradient: 'from-green-200 to-emerald-300 dark:from-green-900 dark:to-emerald-900',
      animation: 'animate-float-medium',
      type: 'environment',
      id: 'teen-2'
    },
    {
      title: "Tech Innovator",
      description: "Explore the world of technology and innovation!",
      difficulty: 'Hard',
      duration: '12 min',
      words: 850,
      image: '💻',
      character: Brain,
      gradient: 'from-purple-400 to-pink-400',
      bgGradient: 'from-purple-200 to-pink-300 dark:from-purple-900 dark:to-pink-900',
      animation: 'animate-float-fast',
      type: 'technology',
      id: 'teen-3'
    },
    {
      title: "Global Citizen",
      description: "Learn about different cultures and global issues!",
      difficulty: 'Medium',
      duration: '11 min',
      words: 750,
      image: '🌐',
      character: Users,
      gradient: 'from-orange-400 to-red-400',
      bgGradient: 'from-orange-200 to-red-300 dark:from-orange-900 dark:to-red-900',
      animation: 'animate-float-slow',
      type: 'culture',
      id: 'teen-4'
    },
    {
      title: "Future Leader",
      description: "Develop leadership skills and critical thinking!",
      difficulty: 'Hard',
      duration: '13 min',
      words: 900,
      image: '👑',
      character: Crown,
      gradient: 'from-yellow-400 to-orange-400',
      bgGradient: 'from-yellow-200 to-orange-300 dark:from-yellow-900 dark:to-orange-900',
      animation: 'animate-bounce',
      type: 'leadership',
      id: 'teen-5'
    },
    {
      title: "Scientific Discovery",
      description: "Explore scientific concepts and research methods!",
      difficulty: 'Hard',
      duration: '14 min',
      words: 950,
      image: '🔬',
      character: Compass,
      gradient: 'from-cyan-400 to-blue-400',
      bgGradient: 'from-cyan-200 to-blue-300 dark:from-cyan-900 dark:to-blue-900',
      animation: 'animate-float-medium',
      type: 'science',
      id: 'teen-6'
    },
    {
      title: "Social Media Expert",
      description: "Navigate digital communication and online safety!",
      difficulty: 'Medium',
      duration: '9 min',
      words: 650,
      image: '📱',
      character: MessageSquare,
      gradient: 'from-pink-400 to-purple-400',
      bgGradient: 'from-pink-200 to-purple-300 dark:from-pink-900 dark:to-purple-900',
      animation: 'animate-float-fast',
      type: 'digital',
      id: 'teen-7'
    }
  ];

  // Handle story opening from Favorites page
  useEffect(() => {
    if (location.state?.startStory && location.state?.storyType) {
      const { startStory, storyTitle } = location.state;
      
      // Find the story by ID
      const story = allStories.find(s => s.id === startStory);
      if (story) {
        // Set flag to indicate we're opening from Favorites
        setIsOpeningFromFavorites(true);
        
        // Set current story
        setCurrentStory(startStory);
        setIsPlaying(true);
        setBounceAnimation(true);
        
        // Skip welcome message when coming from Favorites - go directly to story
        // For now, show a message that the story is being prepared
        // In the future, this will open the actual teen story adventure
        if (isSoundEnabled) {
          EnhancedTTS.speak(
            `Opening ${storyTitle}! This teen story adventure is coming soon. For now, you can explore other features.`, 
            { rate: 0.9, emotion: 'excited' }
          ).catch(() => {});
        }
        
        // Clear the location state to prevent re-opening
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, allStories, navigate, location.pathname, isSoundEnabled]);

  // Calculate pagination
  const startIndex = (currentPage - 1) * storiesPerPage;
  const paginatedStories = allStories.slice(startIndex, startIndex + storiesPerPage);
  const totalPages = Math.ceil(allStories.length / storiesPerPage);

  // Advanced achievements
  const achievements = [
    { 
      name: 'Advanced Learner', 
      icon: Star, 
      progress: Math.min(100, Math.round((points / 2000) * 100)), 
      emoji: '🌟',
      description: `${points}/2000 points`
    },
    { 
      name: 'Story Master', 
      icon: BookOpen, 
      progress: Math.min(100, favorites.length * 12.5), 
      emoji: '📖',
      description: `${favorites.length}/8 favorite stories`
    },
    { 
      name: 'Speaking Pro', 
      icon: Mic, 
      progress: Math.min(100, pronunciationAttempts * 5), 
      emoji: '🎤',
      description: `${pronunciationAttempts}/20 practiced`
    },
    { 
      name: 'Vocabulary Expert', 
      icon: Brain, 
      progress: Math.min(100, vocabularyAttempts * 5), 
      emoji: '🧠',
      description: `${vocabularyAttempts}/20 words learned`
    },
  ];
  const completedAchievements = achievements.filter(a => a.progress === 100).length;

  // Advanced vocabulary words for teens
  const vocabWords = [
    { word: 'investigate', hint: '🔍 Say: in-VES-ti-gate' },
    { word: 'environment', hint: '🌍 Say: en-VY-ron-ment' },
    { word: 'technology', hint: '💻 Say: tek-NOL-o-gy' },
    { word: 'innovation', hint: '💡 Say: in-no-VAY-shun' },
    { word: 'leadership', hint: '👑 Say: LEE-der-ship' },
    { word: 'discovery', hint: '🔬 Say: dis-KUV-er-ee' },
    { word: 'communication', hint: '💬 Say: com-mu-ni-KAY-shun' },
    { word: 'responsibility', hint: '⚖️ Say: re-spon-si-BIL-i-ty' },
    { word: 'sustainability', hint: '♻️ Say: sus-tain-a-BIL-i-ty' },
    { word: 'collaboration', hint: '🤝 Say: col-lab-or-AY-shun' },
    { word: 'creativity', hint: '🎨 Say: cree-a-TIV-i-ty' },
    { word: 'entrepreneur', hint: '💼 Say: on-tre-pre-NUR' },
    { word: 'philosophy', hint: '🤔 Say: fi-LOS-o-fy' },
    { word: 'psychology', hint: '🧠 Say: sy-KOL-o-gy' }
  ];

  const vocabularyWordsToUse = enrolledWords.length > 0 ? enrolledWords : vocabWords;

  const pronounceItems = [
    { phrase: 'Critical thinking skills', phonemes: '🧠 Say: KRIT-i-kal THINK-ing skilz' },
    { phrase: 'Environmental protection', phonemes: '🌍 Say: en-vy-ron-MEN-tal pro-TEK-shun' },
    { phrase: 'Technological advancement', phonemes: '💻 Say: tek-no-LOJ-i-kal ad-VANS-ment' },
    { phrase: 'Social responsibility', phonemes: '🤝 Say: SO-shul re-spon-si-BIL-i-ty' },
    { phrase: 'Global communication', phonemes: '🌐 Say: GLO-bal com-mu-ni-KAY-shun' },
    { phrase: 'Innovation and creativity', phonemes: '💡 Say: in-no-VAY-shun and cree-a-TIV-i-ty' },
    { phrase: 'Sustainable development', phonemes: '♻️ Say: sus-TAIN-a-bul de-VEL-op-ment' },
    { phrase: 'Digital transformation', phonemes: '📱 Say: DIJ-i-tal trans-for-MAY-shun' },
    { phrase: 'Scientific methodology', phonemes: '🔬 Say: sy-en-TIF-ik meth-o-DOL-o-gy' },
    { phrase: 'Cultural diversity', phonemes: '🌍 Say: KUL-chur-al di-VUR-si-ty' },
    { phrase: 'Economic globalization', phonemes: '💰 Say: ee-ko-NOM-ik glo-bal-i-ZAY-shun' },
    { phrase: 'Educational excellence', phonemes: '🎓 Say: ed-u-KAY-shun-al EK-se-lens' },
    { phrase: 'Professional development', phonemes: '💼 Say: pro-FESH-un-al de-VEL-op-ment' },
    { phrase: 'Interdisciplinary approach', phonemes: '🔗 Say: in-ter-DIS-i-plin-ar-ee a-PROCH' }
  ];

  const handleStartLesson = async (storyId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const storyIndex = allStories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return;

    handleElementClick(`story-${storyId}`);
    
    // Play story-specific voice introduction (skip if opening from Favorites)
    if (isSoundEnabled && !isOpeningFromFavorites) {
      const story = allStories[storyIndex];
      await EnhancedTTS.speak(
        `Welcome to ${story.title}! ${story.description} Let's begin this challenging adventure!`, 
        { rate: 1.0, emotion: 'excited' }
      ).catch(() => {});
    }
    
    // Reset the flag after handling
    if (isOpeningFromFavorites) {
      setIsOpeningFromFavorites(false);
    }

    setCurrentStory(storyId);
    setIsPlaying(true);
    setBounceAnimation(true);
    
    // Open appropriate adventure modal based on story type
    const storyType = allStories[storyIndex].type;
    if (storyType === 'mystery') {
      setShowMysteryDetective(true);
      setIsPlaying(false);
      return;
    }
    if (storyType === 'space') {
      setShowSpaceExplorer(true);
      setIsPlaying(false);
      return;
    }
    if (storyType === 'environment') {
      setShowEnvironmentalHero(true);
      setIsPlaying(false);
      return;
    }
    if (storyType === 'technology') {
      setShowTechInnovator(true);
      setIsPlaying(false);
      return;
    }
    if (storyType === 'culture') {
      setShowGlobalCitizen(true);
      setIsPlaying(false);
      return;
    }
    
    // Add celebration effects
    const newPoints = points + 100;
    const newStreak = streak + 1;
    setPoints(newPoints);
    setStreak(newStreak);
    
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
    
    setTimeout(() => {
      setFloatingIcons(prev => prev.filter(icon => !newParticles.find(p => p.id === icon.id)));
    }, 2000);
    
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    handleElementClick(`category-${categoryId}`);
    
    const categoryInstructions = {
      stories: "Let's dive into some challenging adventure stories!",
      vocabulary: "Time to expand your advanced vocabulary!",
      pronunciation: "Let's practice professional speaking skills!",
      games: "Ready for some brain-challenging games?"
    };
    
    if (isSoundEnabled) {
      EnhancedTTS.speak(categoryInstructions[categoryId as keyof typeof categoryInstructions] || "Let's learn!", { 
        rate: 1.0, 
        emotion: 'excited' 
      }).catch(() => {});
    }
    
    setActiveCategory(categoryId);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    navigate('/');
  };

  // Interactive functions
  const playSound = async (soundType: 'success' | 'celebration' | 'error') => {
    if (!isSoundEnabled) return;
    
    try {
      const soundMessages = {
        success: 'Excellent work!',
        celebration: 'Outstanding achievement!',
        error: 'Try again!'
      };
      
      await EnhancedTTS.speak(soundMessages[soundType], { 
        rate: 1.0, 
        emotion: soundType === 'celebration' ? 'excited' : 'excited' 
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
            <Brain className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-blue-500 mx-auto" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#118AB2] bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6 px-2">
            Welcome to Teen Explorer Zone!
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 px-2">
            {authMode === 'login' 
              ? 'Please sign in to continue your advanced learning journey! 🚀' 
              : 'Create an account to start your advanced learning journey! 🚀'}
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

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-10 left-4 sm:left-10 animate-float-slow">
          <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-blue-200/60 dark:text-blue-700/60" />
        </div>
        <div className="absolute top-20 right-4 sm:right-20 animate-float-medium">
          <TrendingUp className="w-10 h-10 sm:w-16 sm:h-16 text-green-200/60 dark:text-green-800/60" />
        </div>
        <div className="absolute bottom-20 left-4 sm:left-20 animate-float-fast">
          <Target className="w-10 h-10 sm:w-14 sm:h-14 text-purple-300/60 dark:text-purple-600/60" />
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
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
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
              onClick={() => setIsMusicEnabled(!isMusicEnabled)}
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
              onClick={() => setShowHelp(!showHelp)}
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
              <h3 className="font-bold text-sm mb-2 text-blue-600 dark:text-blue-400">🎯 Advanced Tips!</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Challenge yourself with harder stories!</li>
                <li>• Practice advanced vocabulary daily</li>
                <li>• Focus on real-world scenarios</li>
                <li>• Build critical thinking skills!</li>
              </ul>
            </div>
          )}
          
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
              Teen Explorers
            </h1>
          </div>
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-300 max-w-2xl mx-auto mb-3 sm:mb-4 px-4 cursor-pointer transition-all duration-300 hover:text-gray-700 dark:hover:text-gray-100"
            onClick={() => handleElementClick('subtitle')}
            onMouseEnter={() => handleElementHover('subtitle')}
          >
            Advanced adventures, challenging games, and real-world English skills!
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

        {/* Sync Status */}
        <div className="mb-4 sm:mb-6 w-full max-w-full px-2 sm:px-0">
          <SyncStatusIndicator showDetails={false} className="w-full sm:w-auto" />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 px-2 sm:px-0 relative">
          <Card 
            className={cn(
              "bg-yellow-50/30 dark:bg-yellow-900/10 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative cursor-pointer group",
              hoveredElement === 'points-card' && "scale-105 shadow-2xl"
            )}
            onMouseEnter={() => handleElementHover('points-card')}
            onClick={() => {
              handleElementClick('points-card');
              triggerCelebration();
            }}
          >
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
                Achievement Points ✨
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
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <TrendingUp className={cn(
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
                Advanced Achievements 🏆
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
                  case 'stories': return 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500';
                  case 'vocabulary': return 'bg-purple-50/40 dark:bg-purple-900/10 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500';
                  case 'pronunciation': return 'bg-green-50/40 dark:bg-green-900/10 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500';
                  case 'games': return 'bg-orange-50/40 dark:bg-orange-900/10 border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500';
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
                </Button>
              );
            })}
          </div>

          {/* Tablet & Desktop: Horizontal */}
          <div className="hidden sm:flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 px-2">
            {categories.map((category) => {
              const getCategoryColor = () => {
                switch(category.id) {
                  case 'stories': return 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500';
                  case 'vocabulary': return 'bg-purple-50/40 dark:bg-purple-900/10 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500';
                  case 'pronunciation': return 'bg-green-50/40 dark:bg-green-900/10 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500';
                  case 'games': return 'bg-orange-50/40 dark:bg-orange-900/10 border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500';
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
                </Button>
              );
            })}
          </div>
        </div>

        {/* Stories Grid */}
        {activeCategory === 'stories' && (
          <div className="mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0">
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
                      if (isSoundEnabled) {
                        EnhancedTTS.speak(
                          `${story.title}. ${story.description} Difficulty: ${story.difficulty}. Duration: ${story.duration}.`, 
                          { rate: 0.9, emotion: 'excited' }
                        ).catch(() => {});
                      }
                    }}
                  >
                    <CardContent className="p-0 overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl">
                      <div className={cn(
                        "p-4 sm:p-6 md:p-8 relative overflow-hidden bg-gradient-to-br",
                        story.bgGradient
                      )}>
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
                            {isPlaying && currentStory === story.id ? 'Starting...' : 'Start Challenge!'}
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
                Showing {startIndex + 1}-{Math.min(startIndex + storiesPerPage, allStories.length)} of {allStories.length} challenging adventures
              </p>
            </div>
          </div>
        )}

        {activeCategory === 'vocabulary' && (
          <div className="mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0 mx-auto w-full lg:max-w-7xl xl:max-w-[1400px]">
            <div>
              <Card className="border-2 border-purple-300/50 bg-purple-50/40 dark:bg-purple-900/10 backdrop-blur-sm shadow-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      Advanced Vocabulary Building
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {vocabularyWordsToUse.length} advanced words for real-world communication
                    </p>
                  </div>
                </div>
              </Card>
              <Vocabulary 
                words={vocabularyWordsToUse} 
                onWordPracticed={() => {
                  setVocabularyAttempts(prev => prev + 1);
                }}
              />
            </div>
          </div>
        )}
        
        {activeCategory === 'pronunciation' && (
          <div className="mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0 mx-auto w-full lg:max-w-7xl xl:max-w-[1400px]">
            <div>
              <Card className="border-2 border-green-300/50 bg-green-50/40 dark:bg-green-900/10 backdrop-blur-sm shadow-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Mic className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      Professional Speaking Practice
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {pronounceItems.length} advanced phrases for confident communication
                    </p>
                  </div>
                </div>
              </Card>
              <Pronunciation 
                items={pronounceItems}
                onPhrasePracticed={() => {
                  setPronunciationAttempts(prev => prev + 1);
                }}
              />
            </div>
          </div>
        )}
        
        {activeCategory === 'games' && (
          <div className="mb-8 sm:mb-10 md:mb-12 px-2 sm:px-0">
            <InteractiveGames />
          </div>
        )}

        {/* Achievements Section */}
        <Card className="bg-purple-100/50 dark:bg-purple-950/30 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-600 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl mb-6 sm:mb-8 mx-2 sm:mx-auto w-full lg:max-w-7xl xl:max-w-[1400px] relative">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-gray-900 dark:text-white flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span>Your Advanced Achievements!</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
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
                    if (isComplete) {
                      triggerCelebration();
                    }
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
                      {isComplete && (
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white absolute -top-1 -right-1 animate-ping" />
                      )}
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
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 dark:text-gray-500 mb-4 sm:mb-6 font-semibold">Ready for advanced challenges? Let's level up! 🚀</p>
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
              }}
              onMouseEnter={() => handleElementHover('quick-listen')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <Volume2 className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400 group-hover:animate-bounce flex-shrink-0 transition-all duration-300",
                hoveredElement === 'quick-listen' && "animate-bounce"
              )} />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Advanced Listening
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
              }}
              onMouseEnter={() => handleElementHover('quick-speak')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <Mic className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400 group-hover:animate-pulse flex-shrink-0 transition-all duration-300",
                hoveredElement === 'quick-speak' && "animate-pulse"
              )} />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Professional Speaking
              </span>
            </Button>
            <Button 
              variant="outline" 
              className={cn(
                "rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 bg-purple-50/40 dark:bg-purple-900/10 hover:bg-purple-100/60 dark:hover:bg-purple-900/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 group text-sm sm:text-base w-full sm:w-auto sm:flex-1 sm:min-w-[160px] cursor-pointer",
                hoveredElement === 'quick-favorites' && "scale-110 shadow-lg"
              )}
              onClick={() => {
                setPulseAnimation(true);
                setTimeout(() => setPulseAnimation(false), 1000);
                navigate('/favorites');
              }}
              onMouseEnter={() => handleElementHover('quick-favorites')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <Heart className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 dark:text-purple-400 group-hover:animate-pulse flex-shrink-0 transition-all duration-300",
                hoveredElement === 'quick-favorites' && "animate-pulse"
              )} />
              <span className="font-semibold text-gray-800 dark:text-gray-500 whitespace-nowrap group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Favorite Adventures {favorites.length > 0 && `(${favorites.length})`}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float-random {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float-random {
          animation: float-random 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 2.5s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 2s ease-in-out infinite;
        }
      `}</style>

      {/* Story Modals */}
      {showMysteryDetective && (
        <MysteryDetectiveAdventure 
          onClose={() => setShowMysteryDetective(false)} 
          onComplete={(score) => {
            setShowMysteryDetective(false);
            // Handle story completion - update progress, points, etc.
            const newPoints = points + 100;
            const newStreak = streak + 1;
            setPoints(newPoints);
            setStreak(newStreak);
          }}
        />
      )}
      {showSpaceExplorer && (
        <SpaceExplorerAdventure 
          onClose={() => setShowSpaceExplorer(false)} 
          onComplete={(score) => {
            setShowSpaceExplorer(false);
            const newPoints = points + 100;
            const newStreak = streak + 1;
            setPoints(newPoints);
            setStreak(newStreak);
          }}
        />
      )}
      {showEnvironmentalHero && (
        <EnvironmentalHeroAdventure 
          onClose={() => setShowEnvironmentalHero(false)} 
          onComplete={(score) => {
            setShowEnvironmentalHero(false);
            const newPoints = points + 100;
            const newStreak = streak + 1;
            setPoints(newPoints);
            setStreak(newStreak);
          }}
        />
      )}
      {showTechInnovator && (
        <TechInnovatorAdventure 
          onClose={() => setShowTechInnovator(false)} 
          onComplete={(score) => {
            setShowTechInnovator(false);
            const newPoints = points + 100;
            const newStreak = streak + 1;
            setPoints(newPoints);
            setStreak(newStreak);
          }}
        />
      )}
      {showGlobalCitizen && (
        <GlobalCitizenAdventure 
          onClose={() => setShowGlobalCitizen(false)} 
          onComplete={(score) => {
            setShowGlobalCitizen(false);
            const newPoints = points + 100;
            const newStreak = streak + 1;
            setPoints(newPoints);
            setStreak(newStreak);
          }}
        />
      )}
    </div>
  );
};

export default TeenKidsPage;
