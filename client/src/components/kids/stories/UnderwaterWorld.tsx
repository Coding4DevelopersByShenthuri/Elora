import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Fish, Star, Volume2, Play, Heart, Zap, Waves, X, Ear, Award, Eye, Gauge, RotateCcw, FileText, Download } from 'lucide-react';
import HybridVoiceService, { STORY_VOICES, type DownloadStatus } from '@/services/HybridVoiceService';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

// Finn's unique voice profile
const FINN_VOICE = STORY_VOICES.Finn;

const storySteps = [
  {
    id: 'intro',
    title: '🌊 Welcome to the Ocean!',
    text: 'Hello little swimmer! I am Finn the friendly fish, and I\'m so happy to see you!... Today, we\'re diving deep into my beautiful underwater world!... You will meet colorful fish, singing whales, and discover amazing ocean treasures!... Your mission is to listen carefully and collect THREE shiny stars!... Ready to dive in? Let\'s splash into our ocean adventure!',
    emoji: '🐠',
    character: 'Finn',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: false,
    wordCount: 60,
    duration: 35
  },
  {
    id: 'swimming_fish',
    title: '🐠 Swimming Together',
    emoji: '🐠',
    character: 'Finn',
    bgColor: 'from-cyan-200 to-blue-200 dark:from-cyan-800 dark:to-blue-800',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Swimming is so much fun',
    audioInstruction: 'Listen to what Finn loves to do!',
    
    question: 'What does Finn say about swimming?',
    hint: 'Think about how Finn feels when swimming',
    
    choices: [
      { text: 'Swimming makes me tired', emoji: '🐠😫', meaning: 'exhausting' },
      { text: 'Swimming is so much fun', emoji: '🐠😊', meaning: 'joyful and fun' },
      { text: 'I never swim at all', emoji: '🐠🚫', meaning: 'not swimming' }
    ],
    
    revealText: 'Look at Finn swimming happily in the clear blue water! Finn says "Swimming is so much fun!" Can you swim with your arms? Swish swish! The ocean is Finn\'s home, and swimming makes every day an adventure!',
    
    maxReplays: 5,
    wordCount: 38,
    duration: 35
  },
  {
    id: 'coral_reef',
    title: '🪸 Colorful Coral',
    emoji: '🪸',
    character: 'Finn',
    bgColor: 'from-pink-100 to-orange-100 dark:from-pink-900 dark:to-orange-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Come see my beautiful colors',
    audioInstruction: 'Listen to what the coral reef says!',
    
    question: 'What does the coral want us to do?',
    hint: 'The coral is showing something pretty',
    
    choices: [
      { text: 'Come see my beautiful colors', emoji: '🪸🌈', meaning: 'showing pretty colors' },
      { text: 'Go away from me now', emoji: '🪸❌', meaning: 'telling us to leave' },
      { text: 'I am very plain', emoji: '🪸⚪', meaning: 'not colorful' }
    ],
    
    revealText: 'WOW! Look at the amazing coral reef! It\'s pink, orange, yellow, and purple! The coral says "Come see my beautiful colors!" Can you name all the colors you see? Coral reefs are homes for many tiny fish friends!',
    
    maxReplays: 5,
    wordCount: 40,
    duration: 36
  },
  {
    id: 'friendly_dolphin',
    title: '🐬 Playful Dolphin',
    emoji: '🐬',
    character: 'Finn',
    bgColor: 'from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Let us play and jump high',
    audioInstruction: 'Listen to what the dolphin wants to do!',
    
    question: 'What does the dolphin want us to do?',
    hint: 'Dolphins love to jump out of the water',
    
    choices: [
      { text: 'Let us sleep all day', emoji: '🐬😴', meaning: 'resting and sleeping' },
      { text: 'Let us stay very still', emoji: '🐬🧊', meaning: 'not moving' },
      { text: 'Let us play and jump high', emoji: '🐬🎉', meaning: 'playing and jumping' }
    ],
    
    revealText: 'A friendly dolphin swims up to us, clicking happily! The dolphin says "Let us play and jump high!" Can you pretend to jump like a dolphin? SPLASH! Dolphins are very playful and smart ocean friends who love to have fun!',
    
    maxReplays: 5,
    wordCount: 42,
    duration: 36
  },
  {
    id: 'first_star',
    title: '⭐ First Ocean Star',
    emoji: '⭐',
    character: 'Finn',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'true-false',
    
    audioText: 'Fish swim in the water',
    audioInstruction: 'Listen to this ocean fact!',
    
    question: 'True or False: Fish swim in the water?',
    hint: 'Where do fish live?',
    
    choices: [
      { text: 'Fish swim in the water', emoji: '✅', meaning: 'true - fish live in water' },
      { text: 'False - Fish fly in sky', emoji: '❌', meaning: 'incorrect - fish don\'t fly' }
    ],
    
    revealText: 'Hooray! We found our first shiny star at the bottom of the ocean! You\'re listening so well! It\'s TRUE - fish DO swim in the water! That\'s their home! Have you ever seen fish in a pond or aquarium? Two more stars to find!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 45,
    duration: 32
  },
  {
    id: 'singing_whale',
    title: '🐋 Singing Whale',
    emoji: '🐋',
    character: 'Finn',
    bgColor: 'from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'My song travels far and wide',
    audioInstruction: 'Listen to what the whale says about singing!',
    
    question: 'What does the whale say about its song?',
    hint: 'The whale\'s song goes a long way',
    
    choices: [
      { text: 'My song is very quiet', emoji: '🐋🤫', meaning: 'soft and silent' },
      { text: 'My song travels far and wide', emoji: '🐋🎵', meaning: 'goes long distances' },
      { text: 'I never sing at all', emoji: '🐋🚫', meaning: 'no singing' }
    ],
    
    revealText: 'Listen! Do you hear that beautiful sound? A big blue whale is singing! The whale says "My song travels far and wide!" Whale songs can travel through the whole ocean! Other whales can hear it from far away. How amazing!',
    
    maxReplays: 5,
    wordCount: 45,
    duration: 38
  },
  {
    id: 'second_star',
    title: '✨ Second Shining Star',
    emoji: '✨',
    character: 'Finn',
    bgColor: 'from-cyan-100 to-teal-100 dark:from-cyan-900 dark:to-teal-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'inference',
    
    audioText: 'The ocean is happy when we keep it clean',
    audioInstruction: 'Listen to what makes the ocean happy!',
    
    question: 'What makes the ocean happy?',
    hint: 'Think about taking care of the ocean',
    
    choices: [
      { text: 'Throwing trash in the water', emoji: '🌊🗑️', meaning: 'making it dirty' },
      { text: 'The ocean is happy when we keep it clean', emoji: '🌊✨', meaning: 'keeping it nice' },
      { text: 'The ocean never feels happy', emoji: '🌊😢', meaning: 'always sad' }
    ],
    
    revealText: 'Wonderful! Another star appeared near the coral! The ocean is happy when we keep it clean! That means no trash in the water! When we take care of the ocean, all the fish and animals can stay healthy and happy! Just one more star!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 48,
    duration: 38
  },
  {
    id: 'treasure_chest',
    title: '💎 Ocean Treasure',
    emoji: '💎',
    character: 'Finn',
    bgColor: 'from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Friends are the best treasure',
    audioInstruction: 'Listen to the treasure\'s secret message!',
    
    question: 'What is the best treasure?',
    hint: 'It\'s not gold or jewels!',
    
    choices: [
      { text: 'Gold coins are best', emoji: '💰', meaning: 'money and gold' },
      { text: 'Friends are the best treasure', emoji: '👯💎', meaning: 'friendship is precious' },
      { text: 'Nothing is a treasure', emoji: '❌', meaning: 'no treasures exist' }
    ],
    
    revealText: 'Look! We found a sparkling treasure chest! Inside is a special message: "Friends are the best treasure!" Can you say that? It\'s true - having friends is more valuable than any gold! Friends make us happy every day!',
    
    maxReplays: 5,
    wordCount: 42,
    duration: 36
  },
  {
    id: 'final_star',
    title: '🌟 Third Ocean Star',
    text: 'Amazing! ... YES! ... We collected all three shiny ocean stars! ... (You\'re such a wonderful listener!) The stars are making the whole ocean sparkle and glow! ... All the sea creatures are celebrating because of YOU! ... You are an INCREDIBLE ocean explorer! ... Finn is so proud of you!',
    emoji: '🌟',
    character: 'Finn',
    bgColor: 'from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800',
    interactive: false,
    starsNeeded: 3,
    wordCount: 42,
    duration: 28
  },
  {
    id: 'celebration',
    title: '🎉 Ocean Party!',
    text: 'Congratulations, ocean hero! ... The WHOLE ocean is celebrating YOU! ... Fish are swimming in happy circles, dolphins are jumping for joy, and whales are singing your victory song! ... You listened so carefully and learned so much! ... You\'re a SUPERSTAR swimmer! ... Give yourself a big splash of applause! 🌊✨',
    emoji: '🎉',
    character: 'Finn',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 45,
    duration: 38
  }
];

const UnderwaterWorld = ({ onClose, onComplete }: Props) => {
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
  
  const [listeningPhase, setListeningPhase] = useState<'listening' | 'question' | 'reveal'>('listening');
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [audioWaveform, setAudioWaveform] = useState(false);
  
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('slow'); // Default to slow for better comprehension
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  
  const [currentSession, setCurrentSession] = useState<StorySession | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus | null>(null);

  const current = storySteps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / storySteps.length) * 100);
  const totalSteps = storySteps.length;
  const totalWords = storySteps.reduce((sum, step) => sum + step.wordCount, 0);
  const totalDuration = storySteps.reduce((sum, step) => sum + step.duration, 0);

  const maxReplays = (current as any).maxReplays || 5;
  const unlimitedReplays = true;

  useEffect(() => {
    const initializeVoice = async () => {
      await HybridVoiceService.initialize();
      const available = HybridVoiceService.isAvailable();
      setTtsAvailable(available);
      if (!available) setShowTranscript(true);
    };
    initializeVoice();
    
    const unsubscribe = HybridVoiceService.onDownloadProgress((status) => {
      setDownloadStatus(status);
      if (!status.downloading && status.progress === 100) setTtsAvailable(true);
    });
    
    const initSession = async () => {
      await KidsListeningAnalytics.initialize(userId);
      const session = KidsListeningAnalytics.startSession(userId, 'underwater-world', 'Underwater World');
      setCurrentSession(session);
    };
    initSession();
    
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (current.listeningFirst) {
      setListeningPhase('listening');
      setReplaysUsed(0);
      setHasListened(false);
      setAttemptCount(0);
      setRetryMode(false);
    } else {
      setListeningPhase('reveal');
    }
    setSelectedChoice(null);
    setShowFeedback(false);
    setShowHint(false);
    setCurrentCaption('');
  }, [stepIndex]);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const stripEmojis = (text: string): string => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{E0020}-\u{E007F}]/gu, '').trim();
  };

  const playAudioWithCaptions = async (text: string, showCaptions: boolean = false) => {
    try {
      const cleanText = stripEmojis(text);
      const allowCaptions = showCaptions && captionsEnabled && 
        (listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode);
      
      await HybridVoiceService.speak(cleanText, FINN_VOICE, {
        speed: playbackSpeed,
        showCaptions: allowCaptions,
        onCaptionUpdate: allowCaptions ? setCurrentCaption : () => {}
      });
    } catch (error) {
      setTtsAvailable(false);
      if (listeningPhase === 'reveal' || !current.listeningFirst) setShowTranscript(true);
      throw error;
    }
  };

  useEffect(() => {
    if (listeningPhase === 'listening' && current.listeningFirst && (current as any).audioText) {
      const playListeningAudio = async () => {
        setIsPlaying(true);
        setAudioWaveform(true);
        try {
          await playAudioWithCaptions((current as any).audioText, true);
          setHasListened(true);
        } catch (error) {
          setHasListened(true);
        }
        setIsPlaying(false);
        setAudioWaveform(false);
      };
      playListeningAudio();
    }
    
    // Auto-play for reveal phase (after correct answer)
    if (listeningPhase === 'reveal' && current.listeningFirst && (current as any).revealText && ttsAvailable) {
      const playReveal = async () => {
        setIsPlaying(true);
        try {
          await playAudioWithCaptions((current as any).revealText, true);
        } catch (error) {
          console.log('TTS not available');
        }
        setIsPlaying(false);
      };
      playReveal();
    }
    
    if (!current.listeningFirst && current.text && ttsAvailable) {
      const playNarration = async () => {
        let textToRead = current.text;
        
        // Handle dynamic celebration text based on stars collected
        if (current.id === 'grand_celebration') {
          if (stars >= 3) {
            textToRead = "Congratulations ocean explorer! ... The WHOLE underwater world is celebrating YOU! ... Sea creatures are dancing, bubbles are sparkling, and ocean magic surrounds us! ... You made the ocean proud with your wonderful listening! You should feel SO special! ... Give yourself a splashy cheer!";
          } else {
            textToRead = `Great diving, young explorer! ... You found ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The sea creatures are happy with your effort! ... Finn is proud of you! ... Every ocean adventure teaches us something. Keep swimming and you'll find all the stars next time! 🐠`;
          }
        }
        
        try {
          await playAudioWithCaptions(textToRead, true);
        } catch (error) {
          console.log('TTS not available');
        }
      };
      playNarration();
    }
  }, [listeningPhase, stepIndex, playbackSpeed, stars]);

  const handleNext = () => {
    if (stepIndex < storySteps.length - 1) {
      setStepIndex(stepIndex + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      const accuracyScore = correctAnswers * 20;
      const timeBonus = Math.max(0, 360 - timeSpent) * 0.1;
      const starBonus = stars * 10;
      const score = Math.min(100, 40 + accuracyScore + timeBonus + starBonus);
      
      if (currentSession) {
        KidsListeningAnalytics.completeSession(userId, currentSession, score, stars);
      }
      onComplete(score);
    }
  };

  const handleReplayAudio = async () => {
    if (!unlimitedReplays && replaysUsed >= maxReplays) return;
    if (!current.listeningFirst) return;
    
    setReplaysUsed(prev => prev + 1);
    setIsPlaying(true);
    setAudioWaveform(true);
    
    try {
      await playAudioWithCaptions((current as any).audioText, true);
      setHasListened(true);
    } catch (error) {
      setHasListened(true);
    }
    
    setIsPlaying(false);
    setAudioWaveform(false);
  };
  
  const handleProceedToQuestion = () => {
    if (!hasListened) return;
    setListeningPhase('question');
    setQuestionStartTime(Date.now());
  };

  const handleChoice = async (choiceObj: any) => {
    const choice = typeof choiceObj === 'string' ? choiceObj : choiceObj.text;
    setSelectedChoice(choice);
    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);
    
    const questionTime = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = choice === (current as any).audioText;
    
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
      const starReward = currentAttempt === 1 ? 1 : 0.5;
      setStars(prev => Math.min(3, prev + starReward));
      setShowFeedback(true);
      setRetryMode(false);
      
      setTimeout(() => setListeningPhase('reveal'), 2500);
      setTimeout(() => handleNext(), 5000);
    } else {
      setShowFeedback(true);
      setRetryMode(true);
    }
  };
  
  const handleRetry = () => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setRetryMode(false);
    setListeningPhase('listening');
    setReplaysUsed(0);
  };

  const playRevealText = async () => {
    let textToSpeak = (current as any).revealText || current.text;
    
    // Handle dynamic celebration text based on stars collected
    if (current.id === 'grand_celebration') {
      if (stars >= 3) {
        textToSpeak = "Congratulations ocean explorer! ... The WHOLE underwater world is celebrating YOU! ... Sea creatures are dancing, bubbles are sparkling, and ocean magic surrounds us! ... You made the ocean proud with your wonderful listening! You should feel SO special! ... Give yourself a splashy cheer!";
      } else {
        textToSpeak = `Great diving, young explorer! ... You found ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The sea creatures are happy with your effort! ... Finn is proud of you! ... Every ocean adventure teaches us something. Keep swimming and you'll find all the stars next time! 🐠`;
      }
    }
    
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

  const getCorrectFeedback = () => {
    const messages = [
      "🌊 SPLASH-TASTIC! You earned a star! 🌟",
      "⭐ FIN-TASTIC! Perfect listening!",
      "✨ BUBBLE-ICIOUS! Amazing!",
      "🎯 PERFECT! Great ocean explorer!",
      "💫 BRILLIANT! Star earned!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => {
    if (attempt === 1) {
      return `💪 Not quite, swimmer! Listen carefully and try again! 🎧`;
    } else {
      return `🌊 Keep swimming! Listen one more time to find the answer! 👂`;
    }
  };

  const getCharacterAnimation = () => {
    if (current.id.includes('star')) return 'animate-bounce';
    return 'animate-float';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500",
        "bg-gradient-to-br", current.bgColor,
        "flex flex-col"
      )}>
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="h-10 w-10 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border shadow-lg z-50"
          >
            <X className="w-5 h-5 text-gray-700" />
          </Button>
        </div>

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Fish className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Finn's Underwater World</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs bg-white/50 px-3 py-1 rounded-full">
                ⭐ {stars}/3 Stars
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={async () => {
                  HybridVoiceService.stop();
                  const newSpeed = playbackSpeed === 'slow' ? 'slower' : playbackSpeed === 'slower' ? 'normal' : 'slow';
                  setPlaybackSpeed(newSpeed);
                  try {
                    let textToPlay = '';
                    if (listeningPhase === 'listening' && current.listeningFirst && (current as any).audioText) {
                      textToPlay = (current as any).audioText;
                    } else if (listeningPhase === 'reveal' && current.listeningFirst && (current as any).revealText) {
                      textToPlay = (current as any).revealText;
                    } else if (!current.listeningFirst && current.text) {
                      if (current.id === 'grand_celebration') {
                        textToPlay = stars >= 3 ? "Congratulations ocean explorer! ... The WHOLE underwater world is celebrating YOU! ... Sea creatures are dancing, bubbles are sparkling, and ocean magic surrounds us! ... You made the ocean proud with your wonderful listening! You should feel SO special! ... Give yourself a splashy cheer!" : `Great diving, young explorer! ... You found ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The sea creatures are happy with your effort! ... Finn is proud of you! ... Every ocean adventure teaches us something. Keep swimming and you'll find all the stars next time! 🐠`;
                      } else {
                        textToPlay = current.text;
                      }
                    }
                    if (textToPlay && ttsAvailable) {
                      await HybridVoiceService.speak(stripEmojis(textToPlay), FINN_VOICE, { speed: newSpeed, showCaptions: captionsEnabled, onCaptionUpdate: setCurrentCaption });
                    }
                  } catch (error) {
                    console.log('Could not replay at new speed');
                  }
                }} className="h-7 px-2 rounded-full text-xs bg-blue-50 border border-blue-200" title={`Playback speed: ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}>
                  <Gauge className="w-3.5 h-3.5 mr-1" />
                  {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
                </Button>
              </div>
            </div>
          </div>

          <Progress value={progress} className="h-2 mb-3 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500" />
          </Progress>

          <div className="flex-1 overflow-y-auto pb-2">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="relative mb-2">
                <div className={cn("text-5xl mb-2", getCharacterAnimation())}>
                  {current.emoji}
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star key={i} className={cn("w-5 h-5 transition-all", i < stars ? 'text-yellow-400 animate-pulse' : 'text-gray-300 opacity-50')} />
                  ))}
                </div>
              </div>

              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-blue-100/80 dark:bg-blue-900/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-blue-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-blue-600 animate-bounce" />
                      {(current as any).audioInstruction}
                    </h3>
                    {audioWaveform && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 bg-blue-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold", isPlaying && "animate-pulse")}>
                        <Volume2 className="w-5 h-5 mr-2" />
                        {isPlaying ? 'Playing...' : `Listen Again (${replaysUsed} plays)`}
                      </Button>
                      {hasListened && (
                        <Button onClick={handleProceedToQuestion} className="bg-green-500 text-white rounded-xl px-6 py-3 font-bold animate-bounce">
                          I'm Ready! ✓
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {current.listeningFirst && listeningPhase === 'question' && (
                <div className="space-y-2 max-w-4xl mx-auto w-full">
                  <div className="bg-yellow-50 rounded-lg p-2.5 border border-yellow-200">
                    <h4 className="text-sm font-bold mb-1.5">{(current as any).question}</h4>
                    {showHint ? (
                      <p className="text-xs">💡 {(current as any).hint}</p>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setShowHint(true)} className="text-yellow-600 text-xs">
                        Need a hint? 🐠
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-center mb-2">
                    <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-xs", isPlaying && "animate-pulse")}>
                      <Volume2 className="w-4 h-4 mr-2" />
                      🔊 Listen
                    </Button>
                  </div>
                  {(current as any).choices && (
                    <div className="grid grid-cols-1 gap-2.5">
                      {(current as any).choices.map((choice: any, idx: number) => {
                        const isSelected = selectedChoice === choice.text;
                        const isCorrect = choice.text === (current as any).audioText;
                        const showResult = showFeedback && isSelected;
                        return (
                          <Button key={idx} onClick={() => handleChoice(choice)} disabled={showFeedback} className={cn("rounded-lg px-3 py-2.5 text-xs font-bold h-auto min-h-[55px]", showResult && isCorrect && "bg-green-500 text-white animate-bounce", showResult && !isCorrect && "bg-red-500 text-white", !showResult && "bg-white/90 text-gray-700 border-2")}>
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-lg">{choice.emoji}</span>
                              <div className="flex-1 text-left">
                                <p className="font-bold text-xs">{choice.text}</p>
                                <p className="text-xs opacity-70">{choice.meaning}</p>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  {showFeedback && (
                    <div className="mt-2">
                      {selectedChoice === (current as any).audioText ? (
                        <div className="text-green-600 text-xs font-bold bg-green-50 rounded-lg p-2.5 border border-green-200">
                          {getCorrectFeedback()}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-red-600 text-xs font-bold bg-red-50 rounded-lg p-2.5 border border-red-200">
                            {getWrongFeedback(attemptCount)}
                          </div>
                          {retryMode && (
                            <div className="flex gap-2">
                              <Button onClick={handleRetry} className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg px-4 py-2.5 text-sm font-bold">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Try Again
                              </Button>
                              <Button onClick={handleNext} variant="outline" className="rounded-lg px-4 py-2.5 text-sm">Skip</Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {current.listeningFirst && listeningPhase === 'reveal' && (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  <div className="bg-green-100/80 rounded-2xl p-6 backdrop-blur-sm border-2 border-green-300">
                    <h3 className="text-lg font-bold mb-3 flex items-center justify-center gap-2">
                      {current.title}
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-blue-500 h-7 w-7 p-0">
                        <Volume2 className="w-3.5 h-3.5" />
                      </Button>
                    </h3>
                    <p className="text-sm leading-relaxed">{(current as any).revealText}</p>
                    <div className="mt-4 flex justify-center">
                      <Button onClick={handleNext} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl px-8 py-3">
                        Continue! 🌊
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!current.listeningFirst && (
                <>
                  <div className="bg-white/80 rounded-2xl p-6 mb-4 backdrop-blur-sm border-2 shadow-2xl max-w-4xl mx-auto">
                    <h3 className="text-lg font-bold mb-3 flex items-center justify-center gap-2">
                      {current.title}
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-blue-600">
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </h3>
                    <p className="text-base leading-relaxed">{current.text}</p>
                    <div className="flex justify-center gap-3 mt-4 text-sm text-gray-500">
                      <span>📝 {current.wordCount}</span>
                      <span>⏱️ {current.duration}s</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={handleNext} className="rounded-2xl px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-2xl">
                      {stepIndex === storySteps.length - 1 ? <><Zap className="w-4 h-4 mr-2 animate-pulse" />Complete! ✨</> : <><Play className="w-4 h-4 mr-2" />Continue 🌊</>}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes waveform {
          0%, 100% { height: 20px; }
          50% { height: 50px; }
        }
        .animate-waveform { animation: waveform 0.6s ease-in-out infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default UnderwaterWorld;
