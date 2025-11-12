import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Star, Volume2, Play, Zap, X, Ear, Award, Gauge, RotateCcw, FileText, Footprints, Trees, CloudRain, Flower, Heart } from 'lucide-react';
import OnlineTTS, { STORY_VOICES } from '@/services/OnlineTTS';
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
    
    revealText: 'Outstanding! The Pterodactyl announces "I soar above searching for fish!" These flying reptiles weren\'t actually dinosaurs—they were pterosaurs! They ruled the skies while dinosaurs ruled the land!',
    
    maxReplays: 5,
    wordCount: 52,
    duration: 44
  },
  {
    id: 'velociraptor_hunt',
    title: '🦖 Velociraptor Pack',
    emoji: '🦖',
    character: 'Dina',
    bgColor: 'from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'We hunt together as a clever pack',
    audioInstruction: 'Listen to how Velociraptors work together!',
    
    question: 'How do Velociraptors hunt their prey?',
    hint: 'They are known for their intelligence and teamwork',
    
    choices: [
      { text: 'We hunt together as a clever pack', emoji: '🦖🧠', meaning: 'teamwork and intelligence' },
      { text: 'I hunt alone in the shadows', emoji: '🦖🌙', meaning: 'solitary hunting' },
      { text: 'We wait for prey to come to us', emoji: '🦖⏳', meaning: 'passive waiting' }
    ],
    
    revealText: 'Brilliant observation! Velociraptors announce "We hunt together as a clever pack!" These intelligent predators used teamwork and strategy to catch their prey. They were much smaller than movies show, but incredibly smart!',
    
    maxReplays: 5,
    wordCount: 48,
    duration: 40
  },
  {
    id: 'first_fossil',
    title: '💎 First Fossil Discovery!',
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
      { text: 'Fossils are recent discoveries', emoji: '❌', meaning: 'incorrect - fossils are very old' }
    ],
    
    revealText: '🎉 CONGRATULATIONS! You\'ve discovered your FIRST precious fossil! 💎 It\'s absolutely TRUE—fossils preserve ancient life from millions of years ago! When organisms died, layers of sediment gradually turned their remains into stone. One fossil collected, two more to discover!',
    
    maxReplays: 5,
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
    
    revealText: 'Excellent observation! Stegosaurus states "My back plates regulate my temperature!" Scientists believe these distinctive plates helped control body heat! These herbivores were well-adapted to their environment!',
    
    maxReplays: 5,
    wordCount: 50,
    duration: 43
  },
  {
    id: 'second_fossil',
    title: '✨ Extinction Theory',
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
    
    revealText: '🎉 AMAZING! You\'ve discovered your SECOND precious fossil! 💎 "Dinosaurs became extinct because of environmental catastrophe!" Scientists theorize a massive asteroid impact 66 million years ago caused climate change, darkness, and food scarcity. Only birds—dinosaur descendants—survived. Two fossils collected, one more to discover!',
    
    maxReplays: 5,
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
    
    revealText: '🎉 PHENOMENAL! You\'ve discovered your THIRD and FINAL precious fossil! 💎 Brachiosaurus declares "My long neck reaches the tallest trees!" These gentle herbivorous giants stood 40 feet tall, accessing vegetation other dinosaurs couldn\'t reach. One Brachiosaurus weighed as much as 12 elephants! All three fossils collected! You are a BRILLIANT young scientist!',
    
    maxReplays: 5,
    wordCount: 48,
    duration: 42
  },
  {
    id: 'dinosaur_legacy',
    title: '🦕 Dinosaur Legacy',
    emoji: '🦕',
    character: 'Dina',
    bgColor: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Our legacy lives on through modern birds',
    audioInstruction: 'Listen to how dinosaurs continue to exist today!',
    
    question: 'How do dinosaurs still exist in our world today?',
    hint: 'Think about what creatures are related to dinosaurs',
    
    choices: [
      { text: 'Our legacy lives on through modern birds', emoji: '🦕🐦', meaning: 'birds are dinosaur descendants' },
      { text: 'We still roam the Earth as giants', emoji: '🦕🌍', meaning: 'dinosaurs still exist' },
      { text: 'We transformed into mammals', emoji: '🦕🐭', meaning: 'became mammals' }
    ],
    
    revealText: 'Incredible scientific insight! "Our legacy lives on through modern birds!" Birds are actually living dinosaurs—they evolved from theropod dinosaurs like Velociraptors! Every time you see a bird, you\'re seeing a dinosaur! Science is amazing!',
    
    maxReplays: 5,
    wordCount: 50,
    duration: 45
  },
  {
    id: 'celebration',
    title: '🎉 Scientific Triumph!',
    text: '🎉 EXPEDITION COMPLETE! 🎉 ... Congratulations, Master Paleontologist! ... You\'ve completed this extraordinary expedition! ... Museums worldwide will display your incredible fossil discoveries! ... You\'ve demonstrated exceptional listening skills, scientific reasoning, and intellectual curiosity! ... Your understanding of prehistoric life is impressive! ... Continue exploring and questioning the world around you! ... You\'re destined for great scientific adventures! 🦕✨',
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
  const [shuffledChoices, setShuffledChoices] = useState<any[] | null>(null);
  
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('slow'); // Default to slow for better comprehension
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [retryMode, setRetryMode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  const [accessibilityMode, setAccessibilityMode] = useState(false); // For hearing-impaired kids
  
  const [currentSession, setCurrentSession] = useState<StorySession | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [ttsInitialized, setTtsInitialized] = useState(false);
  const [isRevealTextPlaying, setIsRevealTextPlaying] = useState(false);

  const current = storySteps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / storySteps.length) * 100);
  const totalSteps = storySteps.length;
  const totalWords = storySteps.reduce((sum, step) => sum + step.wordCount, 0);
  const totalDuration = storySteps.reduce((sum, step) => sum + step.duration, 0);

  const maxReplays = (current as any).maxReplays || 5;
  const unlimitedReplays = true;

  useEffect(() => {
    const initializeVoice = async () => {
      try {
        // Initialize OnlineTTS (Web Speech API only)
        await OnlineTTS.initialize();
        
        // Check if TTS is available
        const available = OnlineTTS.isAvailable();
        setTtsAvailable(available);
        setTtsInitialized(true);
        
        if (!available) {
          console.warn('No voice synthesis available, falling back to text-only mode');
          // Transcript remains off by default - users can toggle if needed
        } else {
          const mode = OnlineTTS.getVoiceMode();
          console.log(`🎤 Voice mode: ${mode}`);
          
          // Log available voices for debugging
          OnlineTTS.logAvailableVoices();
        }
      } catch (error) {
        console.error('Failed to initialize TTS:', error);
        setTtsAvailable(false);
        // Transcript remains off by default - users can toggle if needed
      }
    };
    initializeVoice();
    
    // Initialize analytics session
    const initSession = async () => {
      await KidsListeningAnalytics.initialize(userId);
      const session = KidsListeningAnalytics.startSession(
        userId,
        'dinosaur-discovery',
        'Dinosaur Discovery'
      );
      setCurrentSession(session);
    };
    initSession();

    // Cleanup function to stop TTS when component unmounts
    return () => {
      console.log('🛑 Story component unmounting - stopping TTS immediately');
      OnlineTTS.stop();
    };
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

  const shuffleArray = (arr: any[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  useEffect(() => {
    if (current.listeningFirst && listeningPhase === 'question' && (current as any).choices) {
      setShuffledChoices(shuffleArray((current as any).choices));
    } else {
      setShuffledChoices(null);
    }
  }, [stepIndex, listeningPhase]);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const stripEmojis = (text: string): string => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{E0020}-\u{E007F}]/gu, '').trim();
  };

  // Enhanced audio playback (OnlineTTS: Web Speech API only)
  const playAudioWithCaptions = async (text: string) => {
    try {
      // Strip emojis/stickers before speaking to prevent TTS from reading emoji names
      const cleanText = stripEmojis(text);
      
      console.log(`🎤 Playing audio with Dina's voice:`, {
        text: cleanText.substring(0, 50) + '...',
        voice: DINA_VOICE,
        step: current.id,
        phase: listeningPhase,
        speed: playbackSpeed,
        isRevealText: !!(current as any).revealText && text === (current as any).revealText
      });
      
      // Ensure TTS is available before speaking
      if (!OnlineTTS.isAvailable()) {
        throw new Error('TTS not available');
      }
      
      await OnlineTTS.speak(
        cleanText,
        DINA_VOICE,
        {
          speed: playbackSpeed,
          showCaptions: false,
          onCaptionUpdate: () => {}
        }
      );
      
      console.log(`✅ Audio playback completed for step: ${current.id}`);
      } catch (error) {
        console.error('❌ Voice synthesis failed:', error);
        console.error('❌ Error details:', {
          step: current.id,
          phase: listeningPhase,
          ttsAvailable,
          isRevealText: !!(current as any).revealText && text === (current as any).revealText,
          textLength: text.length
        });
        
        // Don't mark TTS as unavailable immediately - try to recover
        console.log('🔄 Attempting to recover TTS...');
        try {
          await OnlineTTS.initialize();
          if (OnlineTTS.isAvailable()) {
            console.log('✅ TTS recovered successfully');
            // Don't throw error, just log it
            return;
          }
        } catch (recoveryError) {
          console.error('❌ TTS recovery failed:', recoveryError);
        }
        
        setTtsAvailable(false);
        // Transcript remains off by default - users can toggle if needed
        throw error;
      }
  };

  useEffect(() => {
    if (listeningPhase === 'listening' && current.listeningFirst && (current as any).audioText) {
      const playListeningAudio = async () => {
        setIsPlaying(true);
        setAudioWaveform(true);
        try {
          await playAudioWithCaptions((current as any).audioText);
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
    
    // Auto-play for reveal phase (after correct answer)
    if (listeningPhase === 'reveal' && current.listeningFirst && (current as any).revealText && ttsAvailable) {
      console.log('🎭 Auto-playing reveal text:', {
        stepId: current.id,
        revealText: (current as any).revealText.substring(0, 50) + '...',
        voice: DINA_VOICE,
        speed: playbackSpeed
      });
      
      const playReveal = async () => {
        setIsPlaying(true);
        setIsRevealTextPlaying(true);
        try {
          await playAudioWithCaptions((current as any).revealText);
          console.log('✅ Auto reveal text playback completed');
          
          // Wait a bit more after TTS completes to ensure full reading
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error('❌ Auto reveal text playback failed:', error);
        } finally {
          setIsPlaying(false);
          setIsRevealTextPlaying(false);
        }
      };
      playReveal();
    }
    
    if (!current.listeningFirst && current.text && ttsAvailable) {
      const playNarration = async () => {
        let textToRead = current.text;
        
        
        try {
          await playAudioWithCaptions(textToRead);
        } catch (error) {
          console.error('❌ TTS not available for non-interactive step:', error);
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
        KidsListeningAnalytics.completeSession(
          userId,
          currentSession,
          score,
          stars
        );
        console.log('📊 Session analytics saved');
      }
      
      // Stop TTS when story completes
      console.log('🛑 Story completed - stopping TTS');
      OnlineTTS.stop();
      
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
      await playAudioWithCaptions((current as any).audioText);
      setHasListened(true);
    } catch (error) {
      console.log('TTS not available, text mode enabled');
      setHasListened(true); // Still allow progression
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
      
      // Award fossils based on specific story steps (steps 3, 7, and 10)
      if (current.id === 'first_fossil') {
        // First fossil - after completing step 3 (first_fossil)
        setStars(1);
        console.log('💎 First fossil awarded! (1/3) - Step 3: First Fossil Discovery');
      } else if (current.id === 'second_fossil') {
        // Second fossil - after completing step 7 (second_fossil)
        setStars(2);
        console.log('💎 Second fossil awarded! (2/3) - Step 7: Extinction Theory');
      } else if (current.id === 'brachiosaurus_height') {
        // Third fossil - after completing step 9 (brachiosaurus_height)
        setStars(3);
        console.log('💎 Third fossil awarded! (3/3) - Step 9: Brachiosaurus Giant');
      }
      // Note: Fossils are awarded at steps 3, 7, and 9 for proper progression
    
    setShowFeedback(true);
      setRetryMode(false);
    
      // Auto-advance after showing feedback to reveal phase
    setTimeout(() => {
        setListeningPhase('reveal');
    }, 3000);
      
      // Calculate dynamic timing based on reveal text length
      const revealText = (current as any).revealText || '';
      const textLength = revealText.length;
      const wordsPerMinute = playbackSpeed === 'slow' ? 100 : playbackSpeed === 'slower' ? 70 : 140;
      // More generous timing calculation to ensure full reading
      const estimatedDuration = Math.max(20000, (textLength / 3) * (60000 / wordsPerMinute) + 5000); // At least 20 seconds + 5 second buffer
      
      console.log('⏱️ Dynamic timing calculation:', {
        textLength,
        wordsPerMinute,
        estimatedDuration: Math.round(estimatedDuration),
        playbackSpeed,
        revealText: revealText.substring(0, 50) + '...'
      });
      
      // Move to next step after reveal text has time to complete
      setTimeout(() => {
        // Double-check that reveal text is not still playing
        if (!isRevealTextPlaying) {
          handleNext();
        } else {
          console.log('⏳ Reveal text still playing, waiting a bit more...');
          // Wait a bit more if still playing
          setTimeout(() => {
            handleNext();
          }, 2000);
        }
      }, estimatedDuration);
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
    
    console.log('🎭 playRevealText called:', {
      stepId: current.id,
      hasRevealText: !!(current as any).revealText,
      hasText: !!current.text,
      ttsAvailable,
      textPreview: textToSpeak ? textToSpeak.substring(0, 50) + '...' : 'No text'
    });
    
    // Handle dynamic celebration text based on stars collected
    if (current.id === 'celebration') {
      console.log(`🎉 Manual playRevealText - Dinosaur Celebration - Fossils: ${stars}`);
      if (stars >= 3) {
        textToSpeak = current.text; // Use the base celebration text for 3 stars
      } else {
        textToSpeak = `Great work, young scientist! ... You discovered ${Math.floor(stars)} fossil${Math.floor(stars) !== 1 ? 's' : ''}! ... The dinosaurs are impressed by your dedication! ... Dina is proud of your effort! ... Every expedition teaches us something new. Keep exploring and you'll find all the fossils next time! 🦕`;
      }
      console.log(`🎉 Manual celebration text:`, textToSpeak.substring(0, 100) + '...');
    }
    
    if (!textToSpeak) {
      console.log('❌ No text to speak in playRevealText');
      return;
    }
    
    if (!ttsAvailable) {
      console.log('❌ TTS not available in playRevealText, attempting to reinitialize...');
      try {
        await OnlineTTS.initialize();
        if (OnlineTTS.isAvailable()) {
          console.log('✅ TTS reinitialized successfully');
          setTtsAvailable(true);
        } else {
          console.log('❌ TTS still not available after reinitialization');
          return;
        }
      } catch (error) {
        console.error('❌ TTS reinitialization failed:', error);
        return;
      }
    }
    
    console.log('🎤 Starting reveal text playback with Dina voice:', {
      text: textToSpeak.substring(0, 100) + '...',
      voice: DINA_VOICE,
      speed: playbackSpeed
    });
    
    setIsPlaying(true);
    setIsRevealTextPlaying(true);
    try {
      // Force stop any current speech first
      OnlineTTS.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use playAudioWithCaptions which ensures Dina's voice
      await playAudioWithCaptions(textToSpeak);
      console.log('✅ Reveal text playback completed successfully');
      
      // Wait a bit more to ensure full completion
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('❌ TTS error in playRevealText:', error);
      
      // Try to reinitialize TTS and retry once
      try {
        console.log('🔄 Attempting TTS reinitialization...');
        await OnlineTTS.initialize();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (OnlineTTS.isAvailable()) {
          console.log('🔄 Retrying reveal text with reinitialized TTS...');
          await playAudioWithCaptions(textToSpeak);
          console.log('✅ Retry successful');
          
          // Wait after retry too
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
      }
    } finally {
      setIsPlaying(false);
      setIsRevealTextPlaying(false);
    }
  };

  // Instant speed change function - no delays, immediate response
  const handleSpeedChange = (newSpeed: 'normal' | 'slow' | 'slower') => {
    console.log('🔄 INSTANT speed change - Current step:', current.id, 'New speed:', newSpeed);
    
    // Update speed state immediately
    setPlaybackSpeed(newSpeed);
    
    // Force stop any currently playing audio immediately
    OnlineTTS.stop();
    
    // Determine what text to replay
    let textToPlay = '';
    
    if (current.listeningFirst) {
      // Interactive steps with listening phases
      if (listeningPhase === 'listening' && (current as any).audioText) {
        textToPlay = (current as any).audioText;
        console.log('🎧 INSTANT replay listening audio:', textToPlay.substring(0, 50) + '...');
      } else if (listeningPhase === 'reveal' && (current as any).revealText) {
        textToPlay = (current as any).revealText;
        console.log('🎭 INSTANT replay reveal text:', textToPlay.substring(0, 50) + '...');
      }
    } else {
      // Non-interactive steps (like intro, celebration, etc.)
      if (current.text) {
        if (current.id === 'celebration') {
          textToPlay = stars >= 3 
            ? current.text // Use the base celebration text for 3 stars
            : `Great work, young scientist! ... You discovered ${Math.floor(stars)} fossil${Math.floor(stars) !== 1 ? 's' : ''}! ... The dinosaurs are impressed by your dedication! ... Dina is proud of your effort! ... Every expedition teaches us something new. Keep exploring and you'll find all the fossils next time! 🦕`;
          console.log('🎉 INSTANT replay celebration text:', textToPlay.substring(0, 50) + '...');
        } else {
          textToPlay = current.text;
          console.log('📖 INSTANT replay intro/narration text:', textToPlay.substring(0, 50) + '...');
        }
      }
    }
    
    if (!textToPlay) {
      console.log('❌ No text found to replay');
      return;
    }
    
    if (!ttsAvailable) {
      console.log('❌ TTS not available');
      return;
    }
    
    // Start playing immediately with new speed
    const playWithNewSpeed = async () => {
      try {
        const cleanText = stripEmojis(textToPlay);
        console.log('🎤 INSTANT speaking at new speed:', newSpeed, 'Text length:', cleanText.length);
        
        setIsPlaying(true);
        setIsRevealTextPlaying(listeningPhase === 'reveal');
        
        await OnlineTTS.speak(cleanText, DINA_VOICE, {
          speed: newSpeed,
          showCaptions: false,
          onCaptionUpdate: () => {}
        });
        
        console.log('✅ INSTANT speed change completed successfully');
        
      } catch (error) {
        console.error('❌ INSTANT speed change error:', error);
      } finally {
        setIsPlaying(false);
        setIsRevealTextPlaying(false);
      }
    };
    
    // Start playing immediately (no await to make it instant)
    playWithNewSpeed();
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

  const getCharacterAnimation = () => {
    if (current.id.includes('fossil')) return 'animate-bounce';
    return 'animate-float';
  };

  const getEnvironmentIcon = () => {
    switch (current.id) {
      case 't_rex_roar': return Trees;
      case 'triceratops_defense': return Sparkles;
      case 'pterodactyl_flight': return CloudRain;
      case 'stegosaurus_plates': return Flower;
      default: return Sparkles;
    }
  };

  const EnvironmentIcon = getEnvironmentIcon();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn("w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl transition-all duration-500 bg-gradient-to-br", current.bgColor, "flex flex-col")}>
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            onClick={() => {
              console.log('🛑 Close button clicked - stopping TTS immediately');
              OnlineTTS.stop();
              onClose();
            }} 
            className="h-10 w-10 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          >
            <X className="w-5 h-5 text-gray-700 hover:text-gray-900" />
          </Button>
        </div>

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
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
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                💎 {stars}/3 Fossils
              </div>
              
              {/* Accessibility Controls */}
              <div className="flex gap-1">
                {/* Speed Control - ALWAYS Available (works offline & online) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Cycle to next speed
                    const newSpeed = playbackSpeed === 'slow' ? 'slower' : playbackSpeed === 'slower' ? 'normal' : 'slow';
                    console.log('🔄 Speed button clicked - changing from', playbackSpeed, 'to', newSpeed);
                    
                    // Use the instant speed change function
                    handleSpeedChange(newSpeed);
                  }}
                  className="h-7 px-2 rounded-full text-xs bg-orange-100 dark:bg-orange-800 hover:bg-orange-200 dark:hover:bg-orange-700 border border-orange-300 dark:border-orange-600 text-orange-900 dark:text-orange-50 font-semibold shadow-sm transition-all"
                  title={`Playback speed (works offline & online): ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}
                >
                  <Gauge className="w-3.5 h-3.5 mr-1 text-orange-700 dark:text-orange-100" />
                  <span className="text-orange-900 dark:text-orange-50">
                    {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
                  </span>
                </Button>
                
                {/* Accessibility Mode Toggle (for hearing-impaired) */}
                {(listeningPhase === 'listening' || listeningPhase === 'question') && current.listeningFirst && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAccessibilityMode(!accessibilityMode);
                      if (!accessibilityMode) {
                        // Transcript remains off by default - users can toggle if needed
                        setCaptionsEnabled(true);
                      }
                    }}
                    className={cn(
                      "h-7 px-2 rounded-full text-xs",
                      accessibilityMode && "bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700"
                    )}
                    title="Accessibility mode (for hearing difficulties)"
                  >
                    👂 {accessibilityMode ? 'ON' : 'Help'}
                  </Button>
                )}
                
                {/* Transcript Toggle - Only in reveal phase OR accessibility mode */}
                {(listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className={cn(
                    "h-7 w-7 p-0 rounded-full border shadow-sm transition-all",
                    showTranscript 
                      ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-500 hover:bg-blue-200 dark:hover:bg-blue-700" 
                      : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                  )}
                  title="Toggle text transcript"
                >
                  <FileText className={cn(
                    "w-3.5 h-3.5 transition-colors",
                    showTranscript 
                      ? "text-blue-700 dark:text-blue-100" 
                      : "text-gray-800 dark:text-gray-100"
                  )} />
                </Button>
                )}
                
              </div>
            </div>
          </div>

          <Progress value={progress} className="h-2 sm:h-2 mb-3 sm:mb-4 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500" />
          </Progress>
          
          {/* TTS Status Banner */}
          {ttsInitialized && ttsAvailable && (
            <div className="mb-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 justify-center">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-bold">
                  🦕 Dina's voice is ready! Listen carefully to her scientific discoveries!
                </span>
              </div>
            </div>
          )}
          
          {/* Accessibility Mode Warning */}
          {accessibilityMode && (listeningPhase === 'listening' || listeningPhase === 'question') && (
            <div className="mb-2 bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-400 text-orange-900 dark:text-orange-200 px-4 py-2.5 rounded-lg shadow-md">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-lg">👂</span>
                <div className="text-xs sm:text-sm">
                  <strong>Accessibility Mode Active:</strong> Text shown for hearing support. 
                  <span className="block sm:inline sm:ml-1">Challenge reduced - encourage listening when possible!</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Live Caption Display - Only in reveal phase or accessibility mode */}
          {captionsEnabled && currentCaption && (listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode) && (
            <div className="mb-2 bg-black/80 text-white px-4 py-2 rounded-lg text-center text-sm sm:text-base font-semibold animate-fade-in">
              {currentCaption}
            </div>
          )}

          <div className="flex-1 overflow-y-auto pb-2 sm:pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {/* MOBILE: Original Single Column Layout */}
            <div className="sm:hidden text-center h-full flex flex-col justify-center">
              {/* Character and Scene */}
              <div className="relative mb-2 sm:mb-2 md:mb-3">
                <div className={cn(
                  "text-5xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 sm:mb-2", 
                  getCharacterAnimation()
                )}>
                  <span className={cn(
                    current.id === 'celebration' && 'animate-celebration-party'
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
                          ? 'text-amber-400 animate-pulse drop-shadow-lg' 
                          : 'text-gray-300 opacity-50'
                      )} 
                    />
                  ))}
                </div>

                {/* Environment Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <EnvironmentIcon className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-500 opacity-70" />
                </div>
              </div>

              {/* Mobile: PHASE 1 - LISTENING */}
              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-orange-100 dark:bg-orange-900/60 rounded-2xl p-6 backdrop-blur-sm border-2 border-orange-300 dark:border-orange-600 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-orange-600 dark:text-orange-400 animate-bounce" />
                      {(current as any).audioInstruction}
                    </h3>
                    
                    {/* Transcript (only in accessibility mode during listening phase) */}
                    {showTranscript && accessibilityMode && (
                      <div className="mb-4 bg-orange-50/90 dark:bg-orange-900/30 rounded-lg p-4 border-2 border-orange-300">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Accessibility Transcript:</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                          "{(current as any).audioText}"
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                          ⚠️ Try to listen carefully instead of reading!
                        </p>
                      </div>
                    )}
                    
                    {/* Audio waveform - hide if accessibility transcript is shown */}
                    {audioWaveform && !(showTranscript && accessibilityMode) && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-orange-500 rounded-full animate-waveform"
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
                          "rounded-xl px-6 py-3 text-base bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all",
                          isPlaying && "animate-pulse"
                        )}
                      >
                        <Volume2 className="w-5 h-5 mr-2" />
                        {isPlaying ? 'Playing...' : unlimitedReplays ? `Listen Again (${replaysUsed} plays)` : `Listen Again (${maxReplays - replaysUsed} left)`}
                      </Button>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        👂 Listen carefully! {unlimitedReplays ? 'Unlimited plays' : `${maxReplays} plays available`}.
                      </p>
                      
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
                  <div className="bg-yellow-50 dark:bg-yellow-900/40 rounded-lg sm:rounded-lg md:rounded-xl p-2.5 sm:p-2 md:p-3 border-2 border-yellow-300 dark:border-yellow-700">
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
                        Scientific Hint? 🦕
                      </Button>
                    )}
                  </div>

                  {/* Replay Button */}
                  <div className="flex justify-center mb-2 sm:mb-2">
                    <Button 
                      onClick={handleReplayAudio}
                      disabled={replaysUsed >= maxReplays || isPlaying}
                      className={cn(
                        "rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-xs sm:text-xs md:text-sm",
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
                          <span className="hidden sm:inline">🔊 Listen Again</span>
                          <span className="sm:hidden">🔊 Replay</span>
                        </>
                      )}
                    </Button>
                  </div>
                  {/* Choice Buttons */}
                  {(current as any).choices && (
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-2 md:gap-3 justify-center">
                      {(shuffledChoices || (current as any).choices).map((choice: any, idx: number) => {
                        const isSelected = selectedChoice === choice.text;
                        const isCorrect = choice.text === (current as any).audioText;
                        const showResult = showFeedback && isSelected;
                        
                        return (
                          <Button
                            key={idx}
                            onClick={() => handleChoice(choice)}
                            disabled={showFeedback}
                            className={cn(
                              "rounded-lg sm:rounded-lg md:rounded-xl px-3 sm:px-3 md:px-4 py-2.5 sm:py-2 md:py-2.5 text-xs sm:text-xs md:text-sm font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[55px] sm:min-h-[50px] md:min-h-[55px] relative",
                              showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-lg sm:shadow-2xl",
                              showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white shadow-md sm:shadow-xl",
                              !showResult && "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-500 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-lg"
                            )}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full">
                              <div className="flex-1 text-left">
                                <p className="font-bold text-xs sm:text-sm md:text-base">{stripEmojis(choice.text)}</p>
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
                  <div className="bg-green-100 dark:bg-green-900/60 rounded-2xl p-6 backdrop-blur-sm border-2 border-green-300 dark:border-green-600 shadow-2xl">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2 sm:gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-orange-500 hover:text-orange-600 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      >
                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </h3>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed sm:leading-relaxed mx-auto max-w-3xl font-medium">
                      {(current as any).revealText}
                    </p>
                    
                    <div className="mt-4 flex justify-center">
                      <Button 
                        onClick={handleNext} 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl px-8 py-3"
                      >
                        Continue Expedition! 🦕
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile: Non-interactive steps */}
              {!current.listeningFirst && (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 shadow-2xl max-w-4xl mx-auto">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2 sm:gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                      {current.text}
                    </p>
                    
                    <div className="flex justify-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>📝 {current.wordCount} words</span>
                      <span>⏱️ {current.duration}s</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-2 sm:pt-3">
                    <Button 
                      onClick={handleNext} 
                      className="rounded-lg sm:rounded-2xl md:rounded-3xl px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-xs sm:text-sm md:text-base"
                    >
                      {stepIndex === storySteps.length - 1 ? (
                        <>
                          <Zap className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2 animate-pulse" />
                          <span className="hidden sm:inline">Complete Discovery! ✨</span>
                          <span className="sm:hidden">Done! ✨</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2" />
                          <span className="hidden sm:inline">Continue Expedition! 🦕</span>
                          <span className="sm:hidden">Next 🦕</span>
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
                      current.id === 'celebration' && 'animate-celebration-party'
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
                            ? 'text-amber-400 animate-pulse drop-shadow-lg' 
                            : 'text-gray-300 opacity-50'
                        )} 
                      />
                    ))}
                  </div>

                  {/* Environment Icon */}
                  <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 animate-float-slow">
                    <EnvironmentIcon className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-orange-500 opacity-70" />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Content (Desktop) */}
              <div className="flex-1 flex flex-col justify-center sm:pr-4 overflow-hidden max-h-full">

              {/* Desktop: PHASE 1 - LISTENING */}
              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="w-full">
                  <div className="bg-orange-100 dark:bg-orange-900/60 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-orange-300 dark:border-orange-600 shadow-xl">
                    <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400 animate-bounce" />
                      <span>{(current as any).audioInstruction}</span>
                    </h3>
                    
                    {/* Transcript (only in accessibility mode during listening phase) */}
                    {showTranscript && accessibilityMode && (
                      <div className="mb-3 bg-orange-50/90 dark:bg-orange-900/30 rounded-lg p-3 border-2 border-orange-300">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Accessibility Transcript:</span>
                        </div>
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium">
                          "{(current as any).audioText}"
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1.5">
                          ⚠️ Try to listen carefully instead of reading!
                        </p>
                      </div>
                    )}
                    
                    {/* Audio waveform - hide if accessibility transcript is shown */}
                    {audioWaveform && !(showTranscript && accessibilityMode) && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-orange-500 rounded-full animate-waveform"
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
                          "rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all",
                          isPlaying && "animate-pulse"
                        )}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        {isPlaying ? 'Playing...' : unlimitedReplays ? `Listen Again (${replaysUsed} plays)` : `Listen Again (${maxReplays - replaysUsed})`}
                      </Button>
                      
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        👂 Listen carefully! {unlimitedReplays ? 'Unlimited plays' : `${maxReplays} plays available`}.
                      </p>
                      
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
                  <div className="bg-yellow-50 dark:bg-yellow-900/40 rounded-lg p-2.5 lg:p-3 border-2 border-yellow-300 dark:border-yellow-700">
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
                        Scientific Hint? 🦕
                      </Button>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={handleReplayAudio}
                      disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm"
                    >
                      <Volume2 className="w-3 h-3 mr-1.5" />
                      {unlimitedReplays ? `Replay (${replaysUsed})` : `Replay (${maxReplays - replaysUsed})`}
                    </Button>
                  </div>

                  {(current as any).choices && (
                    <div className="grid grid-cols-1 gap-1.5">
                      {(shuffledChoices || (current as any).choices).map((choice: any, idx: number) => {
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
                              !showResult && "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-500 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md"
                            )}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className="flex-1 text-left">
                                <p className="font-bold text-xs md:text-sm">{stripEmojis(choice.text)}</p>
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
                  <div className="bg-green-100 dark:bg-green-900/60 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-green-300 dark:border-green-600 shadow-xl">
                    <h3 className="text-sm md:text-base font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-orange-600 hover:text-orange-700 h-7 w-7 p-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-200 leading-relaxed px-2 font-medium">
                      {(current as any).revealText}
                    </p>
                    
                    <div className="mt-3 flex justify-center">
                      <Button 
                        onClick={handleNext} 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base"
                      >
                        Continue Expedition! 🦕
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop: Non-interactive steps */}
              {!current.listeningFirst && (
                <div className="w-full">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-5 mb-3 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 shadow-xl">
                    <h3 className="text-base md:text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-orange-600 hover:text-orange-700 h-7 w-7 p-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed px-2">
                      {current.text}
                    </p>
                    
                    <div className="flex justify-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>📝 {current.wordCount}</span>
                      <span>⏱️ {current.duration}s</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleNext} 
                      className="rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base"
                    >
                      {stepIndex === storySteps.length - 1 ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Complete Discovery! ✨
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continue Expedition! 🦕
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
            <Sparkles className="w-8 h-8 text-amber-400" />
          </div>
          <div className="hidden lg:block absolute bottom-20 left-12 animate-float-medium">
            <Heart className="w-8 h-8 text-red-400" />
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

export default DinosaurDiscoveryAdventure;
