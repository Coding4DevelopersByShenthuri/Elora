import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Rabbit, Star, Volume2, Play, Heart, Zap, Flower, Trees, CloudRain, X, Ear, Award, Eye, Gauge, RotateCcw, FileText, Download } from 'lucide-react';
import HybridVoiceService, { STORY_VOICES, type DownloadStatus } from '@/services/HybridVoiceService';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

// Luna's unique voice profile (uses hybrid voice system)
const LUNA_VOICE = STORY_VOICES.Luna;

const storySteps = [
  {
    id: 'intro',
    title: '🌳 Magic Forest Adventure',
    text: 'Hello little explorer! I am Luna the magical rabbit!.. Welcome to our enchanted forest where amazing adventures await us! Have you ever been to a forest or park? This one is extra magical!',
    emoji: '🐰',
    character: 'Luna',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: false,
    wordCount: 18,
    duration: 25
  },
  {
    id: 'whispering_trees',
    title: '🌲 Whispering Trees',
    emoji: '🌲',
    character: 'Luna',
    bgColor: 'from-green-200 to-teal-200 dark:from-green-800 dark:to-teal-800',
    interactive: true,
    listeningFirst: true,
    
    // What kids will HEAR (play this first, NO text shown)
    audioText: 'Welcome to our forest',
    audioInstruction: 'Listen to what the magical trees are whispering!',
    
    // Question AFTER audio (still no transcript)
    question: 'What greeting did the trees whisper to us?',
    hint: 'Listen for their friendly welcome',
    
    // Choices are aurally DIFFERENT (not just word matching)
    choices: [
      { text: 'Welcome to our forest', emoji: '🌲🤗', meaning: 'friendly greeting' },
      { text: 'Leave our forest now', emoji: '🌲❌', meaning: 'unfriendly command' },
      { text: 'The forest is sleeping', emoji: '🌲😴', meaning: 'quiet statement' }
    ],
    
    // Full text revealed AFTER answering correctly
    revealText: 'Look at these magnificent trees! They whisper secrets when the wind blows. Can you hear them saying "Welcome to our forest"? Let\'s say it together in a gentle whisper!',
    
    maxReplays: 5,
    wordCount: 25,
    duration: 35
  },
  {
    id: 'colorful_butterfly',
    title: '🦋 Rainbow Butterfly',
    emoji: '🦋',
    character: 'Luna',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'I love this sunny day',
    audioInstruction: 'Listen to what the butterfly is saying!',
    
    question: 'How does the butterfly feel about today?',
    hint: 'Think about the butterfly\'s emotion and the weather',
    
    choices: [
      { text: 'I love this sunny day', emoji: '🦋☀️', meaning: 'happy and sunny' },
      { text: 'I hate this rainy day', emoji: '🦋🌧️', meaning: 'sad and rainy' },
      { text: 'I fear this stormy day', emoji: '🦋⛈️', meaning: 'scared and stormy' }
    ],
    
    revealText: 'Oh wonderful! A rainbow butterfly is flying toward us! Its wings are so colorful - like a rainbow after rain! It says "I love this sunny day!" Can you repeat that with a happy voice?',
    
    maxReplays: 5,
    wordCount: 28,
    duration: 38
  },
  {
    id: 'sparkling_river',
    title: '💧 Sparkling River',
    emoji: '💧',
    character: 'Luna',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Flow flow flow so free',
    audioInstruction: 'Listen to the river\'s happy song!',
    
    question: 'What is the river singing about doing?',
    hint: 'The river loves to move without stopping',
    
    choices: [
      { text: 'Flow flow flow so free', emoji: '💧🎵', meaning: 'moving freely' },
      { text: 'Stop stop stop right here', emoji: '💧🛑', meaning: 'staying still' },
      { text: 'Sleep sleep sleep all day', emoji: '💧😴', meaning: 'resting quietly' }
    ],
    
    revealText: 'Listen to the happy river! Do you hear the water flowing? It\'s singing "Flow, flow, flow so free!" Can you sing that song with the river? Let\'s practice together!',
    
    maxReplays: 5,
    wordCount: 28,
    duration: 36
  },
  {
    id: 'talking_flowers',
    title: '🌸 Talking Flowers',
    emoji: '🌸',
    character: 'Luna',
    bgColor: 'from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Being kind makes everyone smile',
    audioInstruction: 'Listen to the wise flowers\' important message!',
    
    question: 'What do the flowers teach us about kindness?',
    hint: 'It\'s about how kindness affects others',
    
    choices: [
      { text: 'Being kind makes everyone smile', emoji: '🌸😊', meaning: 'kindness creates happiness' },
      { text: 'Being loud makes everyone listen', emoji: '🌸📢', meaning: 'volume gets attention' },
      { text: 'Being first makes everyone follow', emoji: '🌸🏃', meaning: 'speed creates leaders' }
    ],
    
    revealText: 'Amazing! These magical flowers can talk! They smell so sweet! They say "Being kind makes everyone smile!" Can you say that? Remember, being kind is like giving someone a warm hug with your words!',
    
    maxReplays: 5,
    wordCount: 28,
    duration: 38
  },
  {
    id: 'star_discovery',
    title: '⭐ First Magic Star',
    emoji: '⭐',
    character: 'Luna',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'true-false', // NEW: Different question type
    
    audioText: 'Stars help plants grow and animals sleep',
    audioInstruction: 'Listen to this interesting fact about stars!',
    
    question: 'True or False: Stars help plants grow and animals sleep?',
    hint: 'Think about what Luna said about stars',
    
    choices: [
      { text: 'True - Stars are helpful!', emoji: '✅', meaning: 'correct - stars do help' },
      { text: 'False - Stars do nothing', emoji: '❌', meaning: 'incorrect - stars are important' }
    ],
    
    revealText: 'Hooray! WOW! We found our first glowing star! You\'re doing an amazing job listening! It fell from the night sky - just like when you see stars twinkling at bedtime! Stars help plants grow and animals sleep. Two more to find! Can you guess where they might be?',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 28,
    duration: 30
  },
  {
    id: 'friendly_squirrel',
    title: '🐿️ Busy Squirrel',
    emoji: '🐿️',
    character: 'Luna',
    bgColor: 'from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Come play with me up high',
    audioInstruction: 'Listen to where the squirrel wants to play!',
    
    question: 'Where does the squirrel invite us to play?',
    hint: 'Squirrels love to climb and jump in trees',
    
    choices: [
      { text: 'Come play with me up high', emoji: '🐿️⬆️', meaning: 'high in the trees' },
      { text: 'Come rest with me down low', emoji: '🐿️⬇️', meaning: 'low on the ground' },
      { text: 'Come hide with me inside', emoji: '🐿️🏠', meaning: 'inside a hole' }
    ],
    
    revealText: 'Look up there! Can you see the squirrel jumping on the branches? A friendly squirrel is calling "Come play with me up high!" Can you say that? Let\'s practice! Have you ever seen a squirrel climb a tree?',
    
    maxReplays: 5,
    wordCount: 30,
    duration: 38
  },
  {
    id: 'second_star',
    title: '✨ Second Shining Star',
    emoji: '✨',
    character: 'Luna',
    bgColor: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'inference', // NEW: Inference question
    
    audioText: 'Stars twinkle because they are happy to see us exploring',
    audioInstruction: 'Listen to why stars twinkle!',
    
    question: 'Why do stars twinkle according to Luna?',
    hint: 'Think about what makes the stars happy',
    
    choices: [
      { text: 'They are happy to see us', emoji: '✨😊', meaning: 'emotional connection' },
      { text: 'The wind makes them move', emoji: '✨💨', meaning: 'physical reason' },
      { text: 'They want to go home', emoji: '✨🏠', meaning: 'different desire' }
    ],
    
    revealText: 'Incredible! You\'re such a great listener! Another star appeared near the old oak tree! Stars twinkle because they are happy to see us exploring. (Just like your eyes sparkle when you\'re happy!) One last star to go! We\'re almost there!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 26,
    duration: 30
  },
  {
    id: 'wise_owl',
    title: '🦉 Wise Old Owl',
    emoji: '🦉',
    character: 'Luna',
    bgColor: 'from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Always be curious and ask questions',
    audioInstruction: 'Listen to the owl\'s wise advice!',
    
    question: 'What does the wise owl tell us to do?',
    hint: 'It\'s about learning by wondering and asking',
    
    choices: [
      { text: 'Always be curious and ask questions', emoji: '🦉❓', meaning: 'keep learning and wondering' },
      { text: 'Always be silent and never speak', emoji: '🦉🤐', meaning: 'stay quiet always' },
      { text: 'Always be busy and never stop', emoji: '🦉🏃', meaning: 'move constantly' }
    ],
    
    revealText: 'Good evening! The wise owl greets us "Always be curious and ask questions!" Can you repeat that? Owls are very wise - they know that asking questions helps us learn, just like when you ask "Why?" at home!',
    
    maxReplays: 5,
    wordCount: 28,
    duration: 38
  },
  {
    id: 'final_star',
    title: '🌟 Third Magic Star',
    text: 'We did it! ... YES! ... All three magic stars are glowing brightly! ... (They\'re shining just for YOU because you listened so well!) They will keep our forest magical forever. ... You are an AMAZING explorer! ... I\'m so proud of how hard you tried!',
    emoji: '🌟',
    character: 'Luna',
    bgColor: 'from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900',
    interactive: false,
    starsNeeded: 3,
    wordCount: 23,
    duration: 30
  },
  {
    id: 'grand_celebration',
    title: '🎉 Forest Celebration!',
    text: 'Congratulations superstar! ... The WHOLE forest is celebrating YOU! ... Animals are dancing, flowers are singing, and magic sparkles everywhere!.  You made the forest happy with your wonderful listening! You should feel SO proud! ... Give yourself a BIG clap!',
    emoji: '🎉',
    character: 'Luna',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 22,
    duration: 40
  }
];

const MagicForestAdventure = ({ onClose, onComplete }: Props) => {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  
  const [stepIndex, setStepIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  // NEW: Listening-first phase management
  const [listeningPhase, setListeningPhase] = useState<'listening' | 'question' | 'reveal'>('listening');
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState(false);
  
  // Accessibility & Enhanced Features
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('normal');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  
  // Analytics tracking
  const [currentSession, setCurrentSession] = useState<StorySession | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  
  // Download status for online users
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);

  const current = storySteps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / storySteps.length) * 100);
  const totalSteps = storySteps.length;
  const totalWords = storySteps.reduce((sum, step) => sum + step.wordCount, 0);
  const totalDuration = storySteps.reduce((sum, step) => sum + step.duration, 0);

  // Increased replay limits + unlimited option
  const maxReplays = (current as any).maxReplays || 5; // Increased from 3 to 5
  const unlimitedReplays = true; // Allow unlimited for accessibility

  // Check TTS availability and initialize hybrid voice on mount
  useEffect(() => {
    const initializeVoice = async () => {
      // Initialize Piper TTS (offline)
      await HybridVoiceService.initialize();
      
      // Check if any voice system is available
      const available = HybridVoiceService.isAvailable();
      setTtsAvailable(available);
      
      if (!available) {
        console.warn('No voice synthesis available, falling back to text-only mode');
        setShowTranscript(true); // Auto-enable transcript if no voice
      } else {
        const mode = HybridVoiceService.getVoiceMode();
        console.log(`🎤 Voice mode: ${mode}`);
      }
    };
    initializeVoice();
    
    // Subscribe to download progress
    const unsubscribe = HybridVoiceService.onDownloadProgress((status) => {
      setDownloadStatus(status);
      
      // Update TTS availability when download completes
      if (!status.downloading && status.progress === 100) {
        setTtsAvailable(true);
        console.log('🎉 High-quality kid voices now available!');
      }
    });
    
    // Initialize analytics session
    const initSession = async () => {
      await KidsListeningAnalytics.initialize(userId);
      const session = KidsListeningAnalytics.startSession(
        userId,
        'magic-forest',
        'The Magic Forest'
      );
      setCurrentSession(session);
    };
    initSession();
    
    // Cleanup subscription
    return () => unsubscribe();
  }, [userId]);

  // Reset state on step change
  useEffect(() => {
    // Reset listening phase for each new step
    if (current.listeningFirst) {
      setListeningPhase('listening');
      setReplaysUsed(0);
      setHasListened(false);
      setAttemptCount(0);
      setRetryMode(false);
    } else {
      setListeningPhase('reveal'); // Non-interactive steps show text immediately
    }
    
    setSelectedChoice(null);
    setShowFeedback(false);
    setShowHint(false);
    setCurrentCaption('');
  }, [stepIndex]);

  // Timer for tracking session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to remove emojis from text before TTS
  const stripEmojis = (text: string): string => {
    // Remove all emoji characters to prevent TTS from reading "tree emoji" etc.
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{E0020}-\u{E007F}]/gu, '').trim();
  };

  // Enhanced audio playback with captions (Hybrid: Piper offline or Web Speech online)
  const playAudioWithCaptions = async (text: string, showCaptions: boolean = false) => {
    try {
      // Strip emojis/stickers before speaking to prevent TTS from reading emoji names
      const cleanText = stripEmojis(text);
      
      await HybridVoiceService.speak(
        cleanText,
        LUNA_VOICE,
        {
          speed: playbackSpeed,
          showCaptions: showCaptions && captionsEnabled,
          onCaptionUpdate: setCurrentCaption
        }
      );
    } catch (error) {
      console.log('Voice synthesis failed, showing text instead');
      setTtsAvailable(false);
      setShowTranscript(true); // Auto-enable transcript on failure
      throw error;
    }
  };

  // Auto-play for listening phase ONLY (no text shown)
  useEffect(() => {
    if (listeningPhase === 'listening' && current.listeningFirst && (current as any).audioText) {
      const playListeningAudio = async () => {
        setIsPlaying(true);
        setAudioWaveform(true);
        try {
          await playAudioWithCaptions((current as any).audioText, true);
          setHasListened(true);
        } catch (error) {
          console.log('TTS not available, text mode enabled');
          setHasListened(true); // Allow progression even without TTS
        }
        setIsPlaying(false);
        setAudioWaveform(false);
      };
      playListeningAudio();
    }
    
    // For non-interactive steps, play the full text
    if (!current.listeningFirst && current.text && ttsAvailable) {
      const playNarration = async () => {
        try {
          await playAudioWithCaptions(current.text, true);
        } catch (error) {
          console.log('TTS not available');
        }
      };
      playNarration();
    }
  }, [listeningPhase, stepIndex, playbackSpeed]);

  const handleNext = () => {
    if (stepIndex < storySteps.length - 1) {
      setStepIndex(stepIndex + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      // Calculate score based on correct answers and time
      const accuracyScore = correctAnswers * 20;
      const timeBonus = Math.max(0, 300 - timeSpent) * 0.1; // Bonus for faster completion
      const starBonus = stars * 10;
      const score = Math.min(100, 40 + accuracyScore + timeBonus + starBonus);
      
      // Complete analytics session
      if (currentSession) {
        KidsListeningAnalytics.completeSession(
          userId,
          currentSession,
          score,
          stars
        );
        console.log('📊 Session analytics saved');
      }
      
      onComplete(score);
    }
  };

  const handleReplayAudio = async () => {
    // Allow unlimited replays for accessibility
    if (!unlimitedReplays && replaysUsed >= maxReplays) return;
    if (!current.listeningFirst) return;
    
    setReplaysUsed(prev => prev + 1);
    setIsPlaying(true);
    setAudioWaveform(true);
    
      try {
      await playAudioWithCaptions((current as any).audioText, true);
      setHasListened(true);
      } catch (error) {
      console.log('TTS not available, text mode enabled');
      setHasListened(true); // Still allow progression
    }
    
    setIsPlaying(false);
    setAudioWaveform(false);
  };
  
  const handleProceedToQuestion = () => {
    if (!hasListened) {
      // Must listen at least once
      return;
    }
    setListeningPhase('question');
    setQuestionStartTime(Date.now()); // Start tracking time for this question
  };

  const handleChoice = async (choiceObj: any) => {
    const choice = typeof choiceObj === 'string' ? choiceObj : choiceObj.text;
    setSelectedChoice(choice);
    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);
    
    // Calculate time spent on this question
    const questionTime = Math.round((Date.now() - questionStartTime) / 1000);
    
    // Check if choice is correct
    const isCorrect = choice === (current as any).audioText;
    
    // Record attempt in analytics
    if (currentSession && current.listeningFirst) {
      const updatedSession = KidsListeningAnalytics.recordAttempt(
        currentSession,
        current.id,
        (current as any).question || '',
        isCorrect,
        currentAttempt,
        replaysUsed,
        questionTime
      );
      setCurrentSession(updatedSession);
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      // Add star for correct answer (bonus for first attempt)
      const starReward = currentAttempt === 1 ? 1 : 0.5; // Full star for first try, half for retry
      setStars(prev => Math.min(3, prev + starReward));
    
    setShowFeedback(true);
      setRetryMode(false);
    
      // Auto-advance after showing feedback to reveal phase
    setTimeout(() => {
        setListeningPhase('reveal');
    }, 2500);
      
      // Then move to next step
      setTimeout(() => {
        handleNext();
      }, 5000);
    } else {
      // Wrong answer - offer retry
      setShowFeedback(true);
      setRetryMode(true);
      
      // Don't auto-advance on wrong answer - let them retry
    }
  };
  
  const handleRetry = () => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setRetryMode(false);
    setListeningPhase('listening'); // Go back to listening phase
    setReplaysUsed(0); // Reset replays for retry
  };

  const playRevealText = async () => {
    const textToSpeak = (current as any).revealText || current.text;
    if (textToSpeak && ttsAvailable) {
      setIsPlaying(true);
      try {
        await playAudioWithCaptions(textToSpeak, true);
      } catch (error) {
        console.log('TTS not available');
      }
      setIsPlaying(false);
    }
  };

  // Get varied feedback messages
  const getCorrectFeedback = () => {
    const messages = [
      "🎉 FANTASTIC! You earned a star! 🌟",
      "🌟 AMAZING! You got it right!",
      "✨ WONDERFUL! Listening champion!",
      "🎯 PERFECT! Great job!",
      "💫 BRILLIANT! Star earned!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => {
    if (attempt === 1) {
      return `💪 Good try! The answer was "${(current as any).audioText}". Try again?`;
    } else {
      return `🌟 Nice effort! It was "${(current as any).audioText}". One more time?`;
    }
  };

  const getCharacterAnimation = () => {
    if (current.id.includes('star')) return 'animate-bounce';
    return 'animate-float';
  };

  const getEnvironmentIcon = () => {
    switch (current.id) {
      case 'whispering_trees': return Trees;
      case 'colorful_butterfly': return Sparkles;
      case 'sparkling_river': return CloudRain;
      case 'talking_flowers': return Flower;
      default: return Sparkles;
    }
  };

  const EnvironmentIcon = getEnvironmentIcon();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500",
        "bg-gradient-to-br", current.bgColor,
        "flex flex-col"
      )}>
        {/* Always Visible Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="h-10 w-10 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          >
            <X className="w-5 h-5 text-gray-700 hover:text-gray-900" />
          </Button>
        </div>

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-3 gap-2 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Rabbit className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Luna's Magic Forest</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                ⭐ {stars}/3 Stars
              </div>
              
              {/* Accessibility Controls */}
              <div className="flex gap-1">
                {/* Transcript Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className={cn(
                    "h-7 w-7 p-0 rounded-full",
                    showTranscript && "bg-blue-100 dark:bg-blue-900"
                  )}
                  title="Toggle text transcript"
                >
                  <FileText className="w-3.5 h-3.5" />
                </Button>
                
                {/* Captions Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCaptionsEnabled(!captionsEnabled)}
                  className={cn(
                    "h-7 w-7 p-0 rounded-full",
                    captionsEnabled && "bg-purple-100 dark:bg-purple-900"
                  )}
                  title="Toggle captions"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                
                {/* Speed Control */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPlaybackSpeed(prev => 
                      prev === 'normal' ? 'slow' : prev === 'slow' ? 'slower' : 'normal'
                    );
                  }}
                  className="h-7 px-2 rounded-full text-xs"
                  title={`Speed: ${playbackSpeed}`}
                >
                  <Gauge className="w-3.5 h-3.5 mr-1" />
                  {playbackSpeed === 'normal' ? '1x' : playbackSpeed === 'slow' ? '0.8x' : '0.6x'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Download Progress Banner (Online Users) */}
          {downloadStatus?.downloading && (
            <div className="mb-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-3 mb-1.5">
                <Download className="w-4 h-4 animate-bounce" />
                <span className="text-xs sm:text-sm font-bold">
                  Downloading High-Quality Kid Voices... {Math.round(downloadStatus.progress)}%
                </span>
              </div>
              <Progress 
                value={downloadStatus.progress} 
                className="h-1.5 bg-white/30"
              >
                <div className="h-full bg-white rounded-full transition-all duration-500" />
              </Progress>
              <p className="text-xs opacity-90 mt-1">
                ✨ Your app will work offline after this download!
              </p>
            </div>
          )}
          
          {/* Download Complete Notification */}
          {downloadStatus && !downloadStatus.downloading && downloadStatus.progress === 100 && stepIndex < 2 && (
            <div className="mb-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-xl">🎉</span>
                <span className="text-xs sm:text-sm font-bold">
                  Kid voices ready! Now works offline too!
                </span>
                <span className="text-xl">✨</span>
              </div>
            </div>
          )}
          
          {/* Live Caption Display */}
          {captionsEnabled && currentCaption && (
            <div className="mb-2 bg-black/80 text-white px-4 py-2 rounded-lg text-center text-sm sm:text-base font-semibold animate-fade-in">
              {currentCaption}
            </div>
          )}

          {/* Progress Bar */}
          <Progress value={progress} className="h-2 sm:h-2 mb-3 sm:mb-4 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500" />
          </Progress>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden sm:overflow-hidden pb-2 sm:pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {/* MOBILE: Original Single Column Layout */}
            <div className="sm:hidden text-center h-full flex flex-col justify-center">
              {/* Character and Scene */}
              <div className="relative mb-2 sm:mb-2 md:mb-3">
                <div className={cn(
                  "text-5xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 sm:mb-2", 
                  getCharacterAnimation()
                )}>
                  <span className={cn(
                    current.id === 'grand_celebration' && 'animate-celebration-party'
                  )}>
                    {current.emoji}
                  </span>
                </div>
                
                {/* Star Collection Display */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 transition-all duration-500 transform hover:scale-125",
                        i < stars 
                          ? 'text-yellow-400 animate-pulse drop-shadow-lg' 
                          : 'text-gray-300 opacity-50'
                      )} 
                    />
                  ))}
                </div>

                {/* Environment Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <EnvironmentIcon className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-500 opacity-70" />
                </div>
              </div>

              {/* Mobile: PHASE 1 - LISTENING */}
              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-blue-100/80 dark:bg-blue-900/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-blue-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-blue-600 animate-bounce" />
                      {(current as any).audioInstruction}
                    </h3>
                    
                    {/* Transcript (if enabled) */}
                    {showTranscript && (
                      <div className="mb-4 bg-white/90 dark:bg-gray-700/90 rounded-lg p-4 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Transcript:</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                          "{(current as any).audioText}"
                        </p>
                      </div>
                    )}
                    
                    {audioWaveform && !showTranscript && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-blue-500 rounded-full animate-waveform"
                            style={{
                              height: '40px',
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center gap-3 mt-4">
                  <Button 
                        onClick={handleReplayAudio}
                        disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                        className={cn(
                          "rounded-xl px-6 py-3 text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold transition-all",
                          isPlaying && "animate-pulse"
                        )}
                      >
                        <Volume2 className="w-5 h-5 mr-2" />
                        {isPlaying ? 'Playing...' : unlimitedReplays ? `Listen Again (${replaysUsed} plays)` : `Listen Again (${maxReplays - replaysUsed} left)`}
                  </Button>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        👂 Listen carefully! {unlimitedReplays ? 'Unlimited plays' : `${maxReplays} plays available`}.
                      </p>
                      
                      {!ttsAvailable && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg">
                          ⚠️ Audio not available. Read the text above.
                        </p>
                      )}
                      
                      {hasListened && (
                        <Button
                          onClick={handleProceedToQuestion}
                          className="mt-2 bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-3 font-bold animate-bounce"
                        >
                          I'm Ready! ✓
                        </Button>
                      )}
                </div>
              </div>
                </div>
              )}

              {/* Mobile: PHASE 2 - QUESTION */}
              {current.listeningFirst && listeningPhase === 'question' && (
                <div className="space-y-2 sm:space-y-2 md:space-y-3 max-w-4xl mx-auto w-full">
                  {/* Question and Hint */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg sm:rounded-lg md:rounded-xl p-2.5 sm:p-2 md:p-3 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="text-sm sm:text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1.5 sm:mb-1">
                      {(current as any).question}
                    </h4>
                    {showHint ? (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        💡 Hint: {(current as any).hint}
                      </p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs sm:text-sm"
                      >
                        Need a hint? 🧩
                      </Button>
                    )}
                  </div>

                  {/* Replay Button */}
                    <div className="flex justify-center mb-2 sm:mb-2">
                      <Button 
                      onClick={handleReplayAudio}
                      disabled={replaysUsed >= maxReplays || isPlaying}
                        className={cn(
                          "rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-xs sm:text-xs md:text-sm",
                          isPlaying && "animate-pulse"
                        )}
                      >
                        {isPlaying ? (
                          <>
                            <Volume2 className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2 animate-spin" />
                            Listening...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2" />
                            <span className="hidden sm:inline">Listen to the Magic Word</span>
                            <span className="sm:hidden">🔊 Listen</span>
                          </>
                        )}
                      </Button>
                    </div>

                  {/* Choice Buttons */}
                  {(current as any).choices && (
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-2 md:gap-3 justify-center">
                      {(current as any).choices.map((choice: any, idx: number) => {
                        const isSelected = selectedChoice === choice.text;
                        const isCorrect = choice.text === (current as any).audioText;
                        const showResult = showFeedback && isSelected;
                        
                        return (
                          <Button
                            key={idx}
                            onClick={() => handleChoice(choice)}
                            disabled={showFeedback}
                            className={cn(
                              "rounded-lg sm:rounded-lg md:rounded-xl px-3 sm:px-3 md:px-4 py-2.5 sm:py-2 md:py-2.5 text-xs sm:text-xs md:text-sm font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[55px] sm:min-h-[50px] md:min-h-[55px]",
                              showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-lg sm:shadow-2xl",
                              showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white shadow-md sm:shadow-xl",
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg"
                            )}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full">
                              <span className="text-lg sm:text-lg md:text-xl">{choice.emoji}</span>
                              <div className="flex-1 text-left">
                                <p className="font-bold text-xs sm:text-sm md:text-base">{choice.text}</p>
                                <p className="text-xs opacity-70">{choice.meaning}</p>
                              </div>
                              {showResult && isCorrect && (
                                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-spin absolute top-1 right-1" />
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {/* Feedback */}
                  {showFeedback && (
                    <div className="mt-2 sm:mt-3 animate-fade-in">
                      {selectedChoice === (current as any).audioText ? (
                        <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm md:text-base font-bold animate-bounce bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-lg md:rounded-xl p-2.5 sm:p-2 md:p-3 border border-green-200 dark:border-green-700">
                          {getCorrectFeedback()}
                          {attemptCount === 0 && (
                            <div className="mt-2 text-xs">
                              🏆 Perfect! First try bonus!
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                        <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm md:text-base font-bold bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-lg md:rounded-xl p-2.5 sm:p-2 md:p-3 border border-red-200 dark:border-red-700">
                            {getWrongFeedback(attemptCount)}
                          </div>
                          
                          {/* Retry Button - Mobile */}
                          {retryMode && (
                            <div className="flex justify-center gap-2">
                              <Button
                                onClick={handleRetry}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg px-4 py-2.5 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Try Again
                              </Button>
                              <Button
                                onClick={handleNext}
                                variant="outline"
                                className="rounded-lg px-4 py-2.5 text-sm font-semibold border-2 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all"
                              >
                                Skip
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile: PHASE 3 - REVEAL */}
              {current.listeningFirst && listeningPhase === 'reveal' && (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  <div className="bg-green-100/80 dark:bg-green-900/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-green-300 shadow-2xl">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2 sm:gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-blue-500 hover:text-blue-600 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-200 leading-relaxed sm:leading-relaxed mx-auto max-w-3xl">
                      {(current as any).revealText}
                    </p>
                    
                    <div className="mt-4 flex justify-center">
                      <Button 
                        onClick={handleNext} 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl px-8 py-3"
                      >
                        Continue Adventure! 🚀
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile: Non-interactive steps */}
              {!current.listeningFirst && (
                <>
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 mb-4 backdrop-blur-sm border-2 border-white/20 shadow-2xl max-w-4xl mx-auto">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2 sm:gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                      {/* Dynamic message based on stars collected */}
                      {current.id === 'grand_celebration' ? (
                        stars >= 3 ? (
                          // 3 stars - Full celebration
                          "Congratulations superstar! ... The WHOLE forest is celebrating YOU! ... Animals are dancing, flowers are singing, and magic sparkles everywhere!. You made the forest happy with your wonderful listening! You should feel SO proud! ... Give yourself a BIG clap!"
                        ) : (
                          // 1-2 stars - Encouraging message
                          `Great job, little explorer! ... You earned ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The forest friends are so happy you tried your best! ... Luna the rabbit is proud of you! ... Every adventure is a chance to learn and grow. Keep practicing and you'll collect all the stars next time! 🌟`
                        )
                      ) : (
                        current.text
                      )}
                    </p>
                    
                    <div className="flex justify-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>📝 {current.wordCount} words</span>
                      <span>⏱️ {current.duration}s</span>
                    </div>
                  </div>
                  
                <div className="flex justify-center pt-2 sm:pt-3">
                  <Button 
                    onClick={handleNext} 
                    className="rounded-lg sm:rounded-2xl md:rounded-3xl px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-xs sm:text-sm md:text-base"
                  >
                    {stepIndex === storySteps.length - 1 ? (
                      <>
                        <Zap className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2 animate-pulse" />
                        <span className="hidden sm:inline">Complete Magic Journey! ✨</span>
                        <span className="sm:hidden">Done! ✨</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2" />
                        <span className="hidden sm:inline">Continue Adventure! 🚀</span>
                        <span className="sm:hidden">Next 🚀</span>
                      </>
                    )}
                  </Button>
                </div>
                </>
              )}
            </div>

            {/* Desktop: Two Column Layout */}
            <div className="hidden sm:flex sm:flex-row h-full gap-4 lg:gap-6">
              {/* LEFT SIDE: Visual Elements (Desktop Only) */}
              <div className="sm:flex sm:flex-col sm:items-center sm:justify-center sm:w-1/4 lg:w-1/3 sm:pr-2 lg:pr-4">
                <div className="relative">
                  <div className={cn(
                    "text-7xl md:text-8xl lg:text-9xl mb-4 lg:mb-6", 
                    getCharacterAnimation()
                  )}>
                    <span className={cn(
                      current.id === 'grand_celebration' && 'animate-celebration-party'
                    )}>
                      {current.emoji}
                    </span>
          </div>

                  {/* Star Collection Display */}
                  <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 transition-all duration-500 transform hover:scale-125",
                          i < stars 
                            ? 'text-yellow-400 animate-pulse drop-shadow-lg' 
                            : 'text-gray-300 opacity-50'
                        )} 
                      />
                    ))}
          </div>

                  {/* Environment Icon */}
                  <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 animate-float-slow">
                    <EnvironmentIcon className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-green-500 opacity-70" />
          </div>
          </div>
              </div>

              {/* RIGHT SIDE: Content (Desktop) */}
              <div className="flex-1 flex flex-col justify-center sm:pr-4 overflow-hidden max-h-full">

              {/* Desktop: PHASE 1 - LISTENING */}
              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="w-full">
                  <div className="bg-blue-100/80 dark:bg-blue-900/40 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-blue-300 shadow-xl">
                    <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-5 h-5 md:w-6 md:h-6 text-blue-600 animate-bounce" />
                      <span>{(current as any).audioInstruction}</span>
                    </h3>
                    
                    {/* Transcript (if enabled) */}
                    {showTranscript && (
                      <div className="mb-3 bg-white/90 dark:bg-gray-700/90 rounded-lg p-3 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Transcript:</span>
                        </div>
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium">
                          "{(current as any).audioText}"
                        </p>
                      </div>
                    )}
                    
                    {audioWaveform && !showTranscript && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-blue-500 rounded-full animate-waveform"
                            style={{
                              height: '40px',
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center gap-2 mt-3">
                      <Button
                        onClick={handleReplayAudio}
                        disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                        className={cn(
                          "rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold transition-all",
                          isPlaying && "animate-pulse"
                        )}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        {isPlaying ? 'Playing...' : unlimitedReplays ? `Listen Again (${replaysUsed} plays)` : `Listen Again (${maxReplays - replaysUsed})`}
                      </Button>
                      
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        👂 Listen carefully! {unlimitedReplays ? 'Unlimited plays' : `${maxReplays} plays available`}.
                      </p>
                      
                      {!ttsAvailable && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg">
                          ⚠️ Audio not available. Read the text above.
                        </p>
                      )}
                      
                      {hasListened && (
                        <Button
                          onClick={handleProceedToQuestion}
                          className="mt-1 bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-bold animate-bounce"
                        >
                          I'm Ready! ✓
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop: PHASE 2 - QUESTION */}
              {current.listeningFirst && listeningPhase === 'question' && (
                <div className="w-full space-y-2">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5 lg:p-3 border-2 border-yellow-300">
                    <h4 className="text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1.5">
                      {(current as any).question}
                    </h4>
                    {showHint ? (
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        💡 Hint: {(current as any).hint}
                      </p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs h-7 px-3"
                      >
                        Need a hint? 🧩
                      </Button>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={handleReplayAudio}
                      disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm"
                    >
                      <Volume2 className="w-3 h-3 mr-1.5" />
                      {unlimitedReplays ? `Replay (${replaysUsed})` : `Replay (${maxReplays - replaysUsed})`}
                    </Button>
                  </div>

                  {(current as any).choices && (
                    <div className="grid grid-cols-1 gap-1.5">
                      {(current as any).choices.map((choice: any, idx: number) => {
                        const isSelected = selectedChoice === choice.text;
                        const isCorrect = choice.text === (current as any).audioText;
                        const showResult = showFeedback && isSelected;
                        
                        return (
                          <Button
                            key={idx}
                            onClick={() => handleChoice(choice)}
                            disabled={showFeedback}
                            className={cn(
                              "rounded-lg px-2.5 py-2 text-xs md:text-sm font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[42px] relative",
                              showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-xl",
                              showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white shadow-lg",
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400 hover:shadow-md"
                            )}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-lg md:text-xl">{choice.emoji}</span>
                              <div className="flex-1 text-left">
                                <p className="font-bold text-xs md:text-sm">{choice.text}</p>
                                <p className="text-xs opacity-70">{choice.meaning}</p>
                              </div>
                              {showResult && isCorrect && (
                                <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-300 animate-spin absolute top-1 right-1" />
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {showFeedback && (
                    <div className="mt-1.5 animate-fade-in relative z-10">
                      {selectedChoice === (current as any).audioText ? (
                        <div className="text-green-600 dark:text-green-400 text-xs md:text-sm font-bold bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border-2 border-green-400 shadow-sm">
                          {getCorrectFeedback()}
                          {attemptCount === 0 && (
                            <div className="mt-1 text-xs">
                              🏆 First try bonus!
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-orange-700 dark:text-orange-300 text-xs md:text-sm font-bold bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-2 border-2 border-orange-400 shadow-sm">
                            {getWrongFeedback(attemptCount)}
                          </div>
                          
                          {/* Retry Button - Desktop - COMPACT & VISIBLE */}
                          {retryMode && (
                            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-2.5 border-2 border-gray-300 dark:border-gray-600 shadow-md">
                              <Button
                                onClick={handleRetry}
                                className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white rounded-lg px-5 py-2 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-orange-300 animate-pulse-slow relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
                                <RotateCcw className="w-4 h-4 mr-1.5 relative z-10" />
                                <span className="relative z-10">Try Again</span>
                              </Button>
                              <Button
                                onClick={handleNext}
                                variant="outline"
                                className="flex-1 sm:flex-none rounded-lg px-5 py-2 text-sm font-bold border-2 border-gray-600 dark:border-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                              >
                                <span>Skip</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Desktop: PHASE 3 - REVEAL */}
              {current.listeningFirst && listeningPhase === 'reveal' && (
                <div className="w-full">
                  <div className="bg-green-100/80 dark:bg-green-900/40 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-green-300 shadow-xl">
                    <h3 className="text-sm md:text-base font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-blue-600 hover:text-blue-700 h-7 w-7 p-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200 leading-relaxed px-2">
                      {(current as any).revealText}
                    </p>
                    
                    <div className="mt-3 flex justify-center">
                      <Button 
                        onClick={handleNext} 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base"
                      >
                        Continue Adventure! 🚀
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop: Non-interactive steps */}
              {!current.listeningFirst && (
                <div className="w-full">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 lg:p-5 mb-3 backdrop-blur-sm border-2 border-white/20 shadow-xl">
                    <h3 className="text-base md:text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-blue-600 hover:text-blue-700 h-7 w-7 p-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed px-2">
                      {/* Dynamic message based on stars collected */}
                      {current.id === 'grand_celebration' ? (
                        stars >= 3 ? (
                          // 3 stars - Full celebration
                          "Congratulations superstar! ... The WHOLE forest is celebrating YOU! ... Animals are dancing, flowers are singing, and magic sparkles everywhere!. You made the forest happy with your wonderful listening! You should feel SO proud! ... Give yourself a BIG clap!"
                        ) : (
                          // 1-2 stars - Encouraging message
                          `Great job, little explorer! ... You earned ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The forest friends are so happy you tried your best! ... Luna the rabbit is proud of you! ... Every adventure is a chance to learn and grow. Keep practicing and you'll collect all the stars next time! 🌟`
                        )
                      ) : (
                        current.text
                      )}
                    </p>
                    
                    <div className="flex justify-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>📝 {current.wordCount}</span>
                      <span>⏱️ {current.duration}s</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleNext} 
                      className="rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base"
                    >
                      {stepIndex === storySteps.length - 1 ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Complete Magic Journey! ✨
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continue Adventure! 🚀
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Floating Elements - Positioned around left visual area on desktop */}
          <div className="hidden lg:block absolute top-20 left-8 animate-float-slow">
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="hidden lg:block absolute bottom-20 left-12 animate-float-medium">
            <Heart className="w-8 h-8 text-pink-400" />
          </div>
          <div className="hidden lg:block absolute top-1/2 left-4 animate-float-fast">
            <Flower className="w-7 h-7 text-green-400" />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Custom Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(5deg); }
          66% { transform: translateY(-5px) rotate(-5deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes waveform {
          0%, 100% { height: 20px; }
          50% { height: 50px; }
        }
        
        @keyframes celebration-party {
          0% { 
            transform: scale(1) rotate(0deg); 
            filter: drop-shadow(0 0 5px gold);
          }
          25% { 
            transform: scale(1.2) rotate(90deg); 
            filter: drop-shadow(0 0 10px #ff6b6b);
          }
          50% { 
            transform: scale(1.1) rotate(180deg); 
            filter: drop-shadow(0 0 15px #4ecdc4);
          }
          75% { 
            transform: scale(1.3) rotate(270deg); 
            filter: drop-shadow(0 0 12px #45b7d1);
          }
          100% { 
            transform: scale(1) rotate(360deg); 
            filter: drop-shadow(0 0 5px gold);
          }
        }
        
        @keyframes celebration-sparkle {
          0%, 100% { 
            transform: scale(1);
            text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
          }
          50% { 
            transform: scale(1.15);
            text-shadow: 0 0 20px rgba(255, 215, 0, 0.8),
                        0 0 30px rgba(255, 105, 180, 0.6),
                        0 0 40px rgba(135, 206, 250, 0.4);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 20px 50px -12px rgba(251, 146, 60, 0.5), 0 10px 10px -5px rgba(239, 68, 68, 0.3);
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 3s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 2s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-gentle-pulse {
          animation: gentle-pulse 2s ease-in-out infinite;
        }
        
        .animate-waveform {
          animation: waveform 0.6s ease-in-out infinite;
        }
        
        .animate-celebration-party {
          animation: celebration-party 2s ease-in-out infinite;
          display: inline-block;
          transform-origin: center;
        }
        
        .animate-celebration-sparkle {
          animation: celebration-sparkle 1.5s ease-in-out infinite;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .animate-celebration-party {
            animation-duration: 2.5s;
          }
        }
        
        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .animate-celebration-party {
            animation: celebration-sparkle 2s ease-in-out infinite;
          }
        }
        
        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
        
        /* Firefox scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
      `}</style>
    </div>
  );
};

export default MagicForestAdventure;