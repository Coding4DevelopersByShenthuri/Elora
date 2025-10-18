import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Mountain, Star, Volume2, Play, Zap, X, Ear, Award, Eye, Gauge, RotateCcw, FileText, Footprints } from 'lucide-react';
import HybridVoiceService, { STORY_VOICES, type DownloadStatus } from '@/services/HybridVoiceService';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const DINA_VOICE = STORY_VOICES.Dina;

const storySteps = [
  {
    id: 'intro',
    title: '🦕 Welcome to Prehistoric Times!',
    text: 'Hello young paleontologist! I am Dina, your dinosaur exploration guide!... Today we\'re traveling back millions of years to discover the magnificent world of dinosaurs!... You will encounter enormous reptiles, learn about their fascinating behaviors, and uncover ancient secrets!... Your scientific mission is to listen carefully and collect THREE rare fossils by answering challenging questions!... Are you prepared for this extraordinary journey? Let\'s venture back in time!',
    emoji: '👩‍🔬',
    character: 'Dina',
    bgColor: 'from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900',
    interactive: false,
    wordCount: 70,
    duration: 40
  },
  {
    id: 't_rex_roar',
    title: '🦖 Tyrannosaurus Rex',
    emoji: '🦖',
    character: 'Dina',
    bgColor: 'from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'I dominated the Cretaceous period',
    audioInstruction: 'Listen to what the mighty T-Rex declares!',
    
    question: 'What does the T-Rex say about its time period?',
    hint: 'T-Rex was the apex predator of its era',
    
    choices: [
      { text: 'I hid from all predators', emoji: '🦖😨', meaning: 'fearful behavior' },
      { text: 'I dominated the Cretaceous period', emoji: '🦖👑', meaning: 'ruled the time period' },
      { text: 'I was very small and helpless', emoji: '🦖🐁', meaning: 'weak and tiny' }
    ],
    
    revealText: 'Magnificent! The Tyrannosaurus Rex stands before us—the most fearsome carnivore! It proclaims "I dominated the Cretaceous period!" This apex predator ruled 66 million years ago with powerful jaws and sharp teeth. Can you imagine seeing one? Scientists study fossils to understand these incredible creatures!',
    
    maxReplays: 5,
    wordCount: 48,
    duration: 42
  },
  {
    id: 'triceratops_defense',
    title: '🦕 Triceratops Defense',
    emoji: '🦕',
    character: 'Dina',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'My three horns protect my family',
    audioInstruction: 'Listen to how Triceratops describes its defense mechanism!',
    
    question: 'How does Triceratops protect itself and others?',
    hint: 'Look at the name "tri" means three',
    
    choices: [
      { text: 'My three horns protect my family', emoji: '🦕⚔️', meaning: 'defensive horns' },
      { text: 'I run away from danger quickly', emoji: '🦕💨', meaning: 'fleeing predators' },
      { text: 'I climb tall trees for safety', emoji: '🦕🌲', meaning: 'tree climbing' }
    ],
    
    revealText: 'Excellent observation! Triceratops announces "My three horns protect my family!" These herbivores used their distinctive three-horned faces and bony frills as defensive weapons against predators. They traveled in herds for additional protection. Triceratops means "three-horned face" in Latin!',
    
    maxReplays: 5,
    wordCount: 50,
    duration: 43
  },
  {
    id: 'pterodactyl_flight',
    title: '🦅 Pterodactyl Soaring',
    emoji: '🦅',
    character: 'Dina',
    bgColor: 'from-blue-100 to-sky-100 dark:from-blue-900 dark:to-sky-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'I soar above searching for fish',
    audioInstruction: 'Listen to the flying reptile\'s hunting strategy!',
    
    question: 'What does the Pterodactyl do while flying?',
    hint: 'Think about what it\'s looking for from the sky',
    
    choices: [
      { text: 'I soar above searching for fish', emoji: '🦅🐟', meaning: 'hunting from above' },
      { text: 'I burrow underground for safety', emoji: '🦅⬇️', meaning: 'digging holes' },
      { text: 'I swim in deep ocean waters', emoji: '🦅🌊', meaning: 'swimming deep' }
    ],
    
    revealText: 'Remarkable discovery! The Pterodactyl announces "I soar above searching for fish!" These flying reptiles weren\'t actually dinosaurs—they were pterosaurs! With massive wingspans, they glided over ancient seas and lakes, diving to catch fish. Imagine giant wings spanning up to 20 feet!',
    
    maxReplays: 5,
    wordCount: 52,
    duration: 44
  },
  {
    id: 'first_fossil',
    title: '💎 First Rare Fossil',
    emoji: '💎',
    character: 'Dina',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'true-false',
    
    audioText: 'Fossils preserve ancient life from millions of years ago',
    audioInstruction: 'Listen to this paleontology fact!',
    
    question: 'True or False: Fossils preserve ancient life from millions of years ago?',
    hint: 'Think about what fossils teach us',
    
    choices: [
      { text: 'Fossils preserve ancient life from millions of years ago', emoji: '✅', meaning: 'true - fossils are ancient remains' },
      { text: 'False - Fossils are recent discoveries', emoji: '❌', meaning: 'incorrect - fossils are very old' }
    ],
    
    revealText: 'Outstanding! We\'ve uncovered our first precious fossil! You\'re demonstrating exceptional scientific thinking! It\'s absolutely TRUE—fossils preserve ancient life from millions of years ago! When organisms died, layers of sediment gradually turned their remains into stone. Two more fossils to discover!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 52,
    duration: 38
  },
  {
    id: 'stegosaurus_plates',
    title: '🦕 Stegosaurus Plates',
    emoji: '🦕',
    character: 'Dina',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'My back plates regulate my temperature',
    audioInstruction: 'Listen to Stegosaurus explain its unique plates!',
    
    question: 'What purpose do Stegosaurus plates serve?',
    hint: 'They help control body heat',
    
    choices: [
      { text: 'My back plates store extra food', emoji: '🦕🍖', meaning: 'food storage' },
      { text: 'My back plates regulate my temperature', emoji: '🦕🌡️', meaning: 'temperature control' },
      { text: 'My back plates help me fly away', emoji: '🦕✈️', meaning: 'flight capability' }
    ],
    
    revealText: 'Brilliant deduction! Stegosaurus states "My back plates regulate my temperature!" Scientists believe these distinctive plates helped control body heat—cooling or warming depending on blood flow. The tail spikes (called thagomizer) defended against predators. Nature\'s engineering is amazing!',
    
    maxReplays: 5,
    wordCount: 50,
    duration: 43
  },
  {
    id: 'second_fossil',
    title: '✨ Second Ancient Fossil',
    emoji: '✨',
    character: 'Dina',
    bgColor: 'from-cyan-100 to-teal-100 dark:from-cyan-900 dark:to-teal-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'inference',
    
    audioText: 'Dinosaurs became extinct because of environmental catastrophe',
    audioInstruction: 'Listen to the extinction theory!',
    
    question: 'According to the fossil, why did dinosaurs disappear?',
    hint: 'A major disaster changed their world',
    
    choices: [
      { text: 'They all decided to migrate elsewhere', emoji: '🦕✈️', meaning: 'voluntary relocation' },
      { text: 'Dinosaurs became extinct because of environmental catastrophe', emoji: '🦕💥', meaning: 'natural disaster' },
      { text: 'They transformed into modern birds overnight', emoji: '🦕🦅', meaning: 'instant evolution' }
    ],
    
    revealText: 'Exceptional analysis! Another fossil reveals: "Dinosaurs became extinct because of environmental catastrophe!" Scientists theorize a massive asteroid impact 66 million years ago caused climate change, darkness, and food scarcity. Only birds—dinosaur descendants—survived. One final fossil awaits!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 48,
    duration: 42
  },
  {
    id: 'brachiosaurus_height',
    title: '🦕 Brachiosaurus Giant',
    emoji: '🦕',
    character: 'Dina',
    bgColor: 'from-green-200 to-lime-200 dark:from-green-800 dark:to-lime-800',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'My long neck reaches the tallest trees',
    audioInstruction: 'Listen to how Brachiosaurus feeds itself!',
    
    question: 'How does Brachiosaurus access its food?',
    hint: 'It eats leaves from very high places',
    
    choices: [
      { text: 'I dig deep underground for roots', emoji: '🦕⬇️', meaning: 'digging for food' },
      { text: 'My long neck reaches the tallest trees', emoji: '🦕🌲', meaning: 'reaching high branches' },
      { text: 'I hunt smaller dinosaurs for meals', emoji: '🦕🍖', meaning: 'carnivorous hunting' }
    ],
    
    revealText: 'Magnificent observation! Brachiosaurus declares "My long neck reaches the tallest trees!" These gentle herbivorous giants stood 40 feet tall, accessing vegetation other dinosaurs couldn\'t reach. One Brachiosaurus weighed as much as 12 elephants! Imagine that enormous, peaceful creature!',
    
    maxReplays: 5,
    wordCount: 48,
    duration: 42
  },
  {
    id: 'final_fossil',
    title: '🏆 Third Precious Fossil',
    text: 'Phenomenal achievement! ... INCREDIBLE! ... We\'ve collected all three rare fossils! ... (Your scientific expertise is extraordinary!) These fossils unlock millions of years of prehistoric secrets! ... The entire paleontology community celebrates your discovery! ... You are a BRILLIANT young scientist! ... Your curiosity and dedication are remarkable!',
    emoji: '🏆',
    character: 'Dina',
    bgColor: 'from-amber-200 to-yellow-200 dark:from-amber-800 dark:to-yellow-800',
    interactive: false,
    starsNeeded: 3,
    wordCount: 48,
    duration: 32
  },
  {
    id: 'celebration',
    title: '🎉 Scientific Triumph!',
    text: 'Congratulations, Master Paleontologist! ... You\'ve completed this extraordinary expedition! ... Museums worldwide will display your incredible fossil discoveries! ... You\'ve demonstrated exceptional listening skills, scientific reasoning, and intellectual curiosity! ... Your understanding of prehistoric life is impressive! ... Continue exploring and questioning the world around you! ... You\'re destined for great scientific adventures! 🦕✨',
    emoji: '🎉',
    character: 'Dina',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 52,
    duration: 42
  }
];

const DinosaurDiscoveryAdventure = ({ onClose, onComplete }: Props) => {
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
      const session = KidsListeningAnalytics.startSession(userId, 'dinosaur-discovery', 'Dinosaur Discovery');
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
      
      await HybridVoiceService.speak(cleanText, DINA_VOICE, {
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
            textToRead = "Congratulations paleontologist! ... The prehistoric world celebrates your discoveries! ... Dinosaurs roar with joy, fossils glow brightly, and ancient magic fills the air! ... You made history with your excellent listening! You should feel incredibly proud! ... Give yourself a mighty roar!";
          } else {
            textToRead = `Great work, young scientist! ... You discovered ${Math.floor(stars)} fossil${Math.floor(stars) !== 1 ? 's' : ''}! ... The dinosaurs are impressed by your dedication! ... Dina is proud of your effort! ... Every expedition teaches us something new. Keep exploring and you'll find all the fossils next time! 🦕`;
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
      const timeBonus = Math.max(0, 420 - timeSpent) * 0.1;
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
        textToSpeak = "Congratulations paleontologist! ... The prehistoric world celebrates your discoveries! ... Dinosaurs roar with joy, fossils glow brightly, and ancient magic fills the air! ... You made history with your excellent listening! You should feel incredibly proud! ... Give yourself a mighty roar!";
      } else {
        textToSpeak = `Great work, young scientist! ... You discovered ${Math.floor(stars)} fossil${Math.floor(stars) !== 1 ? 's' : ''}! ... The dinosaurs are impressed by your dedication! ... Dina is proud of your effort! ... Every expedition teaches us something new. Keep exploring and you'll find all the fossils next time! 🦕`;
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
      "🦕 ROAR-SOME! You earned a fossil! 💎",
      "💎 DINO-MITE! Excellent work!",
      "✨ PREHISTORIC PERFECT! Amazing!",
      "🎯 FOSSIL FOUND! Great scientist!",
      "🏆 BRILLIANT DISCOVERY!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => {
    if (attempt === 1) {
      return `💪 Not quite, young scientist! Listen carefully and investigate again! 🎧`;
    } else {
      return `🦕 Keep exploring! Listen one more time to discover the answer! 👂`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn("w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 bg-gradient-to-br", current.bgColor, "flex flex-col")}>
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" onClick={onClose} className="h-10 w-10 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border shadow-lg z-50">
            <X className="w-5 h-5 text-gray-700" />
          </Button>
        </div>

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Footprints className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Dina's Dinosaur Discovery</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs bg-white/50 px-3 py-1 rounded-full">💎 {stars}/3 Fossils</div>
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
                      textToPlay = stars >= 3 ? "Congratulations paleontologist! ... The prehistoric world celebrates your discoveries! ... Dinosaurs roar with joy, fossils glow brightly, and ancient magic fills the air! ... You made history with your excellent listening! You should feel incredibly proud! ... Give yourself a mighty roar!" : `Great work, young scientist! ... You discovered ${Math.floor(stars)} fossil${Math.floor(stars) !== 1 ? 's' : ''}! ... The dinosaurs are impressed by your dedication! ... Dina is proud of your effort! ... Every expedition teaches us something new. Keep exploring and you'll find all the fossils next time! 🦕`;
                    } else {
                      textToPlay = current.text;
                    }
                  }
                  if (textToPlay && ttsAvailable) {
                    await HybridVoiceService.speak(stripEmojis(textToPlay), DINA_VOICE, { speed: newSpeed, showCaptions: captionsEnabled, onCaptionUpdate: setCurrentCaption });
                  }
                } catch (error) {
                  console.log('Could not replay at new speed');
                }
              }} className="h-7 px-2 rounded-full text-xs bg-orange-50 border" title={`Playback speed: ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}>
                <Gauge className="w-3.5 h-3.5 mr-1" />
                {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
              </Button>
            </div>
          </div>

          <Progress value={progress} className="h-2 mb-3 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500" />
          </Progress>

          <div className="flex-1 overflow-y-auto pb-2">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="relative mb-2">
                <div className="text-5xl mb-2 animate-float">{current.emoji}</div>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star key={i} className={cn("w-5 h-5 transition-all", i < stars ? 'text-amber-400 animate-pulse' : 'text-gray-300 opacity-50')} />
                  ))}
                </div>
              </div>

              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-orange-100/80 dark:bg-orange-900/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-orange-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-orange-600 animate-bounce" />
                      {(current as any).audioInstruction}
                    </h3>
                    {audioWaveform && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 bg-orange-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold", isPlaying && "animate-pulse")}>
                        <Volume2 className="w-5 h-5 mr-2" />
                        {isPlaying ? 'Playing...' : `Listen Again (${replaysUsed} plays)`}
                      </Button>
                      {hasListened && (
                        <Button onClick={handleProceedToQuestion} className="bg-green-500 text-white rounded-xl px-6 py-3 font-bold animate-bounce">
                          Ready to Answer! ✓
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
                        Scientific Hint? 🦕
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-center mb-2">
                    <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs", isPlaying && "animate-pulse")}>
                      <Volume2 className="w-4 h-4 mr-2" />
                      🔊 Replay
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
                        <div className="text-green-600 text-xs font-bold bg-green-50 rounded-lg p-2.5 border">
                          {getCorrectFeedback()}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-red-600 text-xs font-bold bg-red-50 rounded-lg p-2.5 border">
                            {getWrongFeedback(attemptCount)}
                          </div>
                          {retryMode && (
                            <div className="flex gap-2">
                              <Button onClick={handleRetry} className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg px-4 py-2.5 text-sm font-bold">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Retry
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
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-orange-500 h-7 w-7 p-0">
                        <Volume2 className="w-3.5 h-3.5" />
                      </Button>
                    </h3>
                    <p className="text-sm leading-relaxed">{(current as any).revealText}</p>
                    <div className="mt-4 flex justify-center">
                      <Button onClick={handleNext} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl px-8 py-3">
                        Continue Expedition! 🦕
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
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-orange-600">
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
                    <Button onClick={handleNext} className="rounded-2xl px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-2xl">
                      {stepIndex === storySteps.length - 1 ? <><Zap className="w-4 h-4 mr-2 animate-pulse" />Complete Discovery! ✨</> : <><Play className="w-4 h-4 mr-2" />Continue! 🦕</>}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes waveform { 0%, 100% { height: 20px; } 50% { height: 50px; } }
        .animate-waveform { animation: waveform 0.6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default DinosaurDiscoveryAdventure;
