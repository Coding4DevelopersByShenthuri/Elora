import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Fish, Star, Volume2, Play, Zap, Waves, X, Ear, Award, Gauge, RotateCcw, FileText } from 'lucide-react';
import OnlineTTS, { STORY_VOICES } from '@/services/OnlineTTS';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

// Finn's unique voice profile (uses HybridVoiceService for optimal voice selection)
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
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [retryMode, setRetryMode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  
  const [currentSession, setCurrentSession] = useState<StorySession | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  
  // TTS availability status
  const [isRevealTextPlaying, setIsRevealTextPlaying] = useState(false);

  const current = storySteps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / storySteps.length) * 100);
  const totalSteps = storySteps.length;
  const totalWords = storySteps.reduce((sum, step) => sum + step.wordCount, 0);
  const totalDuration = storySteps.reduce((sum, step) => sum + step.duration, 0);

  const maxReplays = (current as any).maxReplays || 5;
  const unlimitedReplays = true;

  // Initialize online TTS on mount
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        // Initialize OnlineTTS (Web Speech API only)
        await OnlineTTS.initialize();
        
        // Check if TTS is available
        const available = OnlineTTS.isAvailable();
        setTtsAvailable(available);
        
        if (!available) {
          console.warn('No voice synthesis available, falling back to text-only mode');
          // Transcript remains off by default - users can toggle if needed
        } else {
          const mode = OnlineTTS.getVoiceMode();
          console.log(`🎤 Voice mode: ${mode}`);
          
          // VERIFY FINN'S UNIQUE VOICE PROFILE
          console.log('🐠 UNDERWATER WORLD VOICE VERIFICATION:', {
            character: 'Finn the Fish',
            voiceProfile: FINN_VOICE,
            voiceName: FINN_VOICE.voiceName,
            voiceDescription: FINN_VOICE.description,
            pitch: FINN_VOICE.pitch,
            rate: FINN_VOICE.rate,
            volume: FINN_VOICE.volume,
            isUniqueVoice: true,
            note: 'This is Finn\'s unique voice profile using OnlineTTS',
            expectedCharacteristics: 'Microsoft David voice for bubbly fish character'
          });
          
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
        'underwater-world',
        'Underwater World'
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
      
      console.log(`🎤 Playing audio with Finn's voice:`, {
        text: cleanText.substring(0, 50) + '...',
        voice: FINN_VOICE,
        step: current.id,
        phase: listeningPhase,
        speed: playbackSpeed,
        isRevealText: !!(current as any).revealText && text === (current as any).revealText,
        voiceCharacteristics: {
          pitch: FINN_VOICE.pitch,
          rate: FINN_VOICE.rate,
          volume: FINN_VOICE.volume,
          voiceName: FINN_VOICE.voiceName,
          description: FINN_VOICE.description
        }
      });
      
      // Ensure TTS is available before speaking
      if (!OnlineTTS.isAvailable()) {
        throw new Error('TTS not available');
      }
      
      await OnlineTTS.speak(
        cleanText,
        FINN_VOICE,
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

  // Auto-play for listening phase ONLY (no text shown)
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
        voice: FINN_VOICE,
        speed: playbackSpeed
      });
      
      const playReveal = async () => {
        setIsPlaying(true);
        setIsRevealTextPlaying(true);
        try {
          await playAudioWithCaptions((current as any).revealText);
          console.log('✅ Auto reveal text playback completed');
          
          // Wait a bit more after TTS completes to ensure full reading
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('❌ Auto reveal text playback failed:', error);
        } finally {
          setIsPlaying(false);
          setIsRevealTextPlaying(false);
        }
      };
      playReveal();
    }
    
    // For non-interactive steps, play the full text automatically
    if (!current.listeningFirst && current.text && ttsAvailable) {
      const playNarration = async () => {
        let textToRead = current.text;
        
        // Handle dynamic celebration text based on stars collected
        if (current.id === 'celebration') {
          console.log(`🎉 Ocean Celebration step - Stars collected: ${stars}`);
          if (stars >= 3) {
            textToRead = "Congratulations ocean hero! ... The WHOLE ocean is celebrating YOU! ... Fish are swimming in happy circles, dolphins are jumping for joy, and whales are singing your victory song! ... You listened so carefully and learned so much! ... You're a SUPERSTAR swimmer! ... Give yourself a big splash of applause! 🌊✨";
          } else {
            textToRead = `Great diving, young explorer! ... You found ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The sea creatures are happy with your effort! ... Finn is proud of you! ... Every ocean adventure teaches us something. Keep swimming and you'll find all the stars next time! 🐠`;
          }
          console.log(`🎉 Celebration text selected:`, textToRead.substring(0, 100) + '...');
        }
        
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
      
      // Stop TTS when story completes
      console.log('🛑 Story completed - stopping TTS');
      OnlineTTS.stop();
      
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
      
      // Award stars based on specific story steps
      if (current.id === 'first_star') {
        // First star - after completing first star step
        setStars(1);
        console.log('⭐ First star awarded! (1/3)');
      } else if (current.id === 'second_star') {
        // Second star - after completing second star step
        setStars(2);
        console.log('⭐ Second star awarded! (2/3)');
      } else if (current.id === 'final_star') {
        // Third star - after completing final star step
        setStars(3);
        console.log('⭐ Third star awarded! (3/3)');
      }
      // Note: Other interactive steps don't award stars, only the specific star steps do
    
    setShowFeedback(true);
      setRetryMode(false);
    
      // Auto-advance after showing feedback to reveal phase
    setTimeout(() => {
        setListeningPhase('reveal');
    }, 2500);
      
      // Calculate dynamic timing based on reveal text length
      const revealText = (current as any).revealText || '';
      const textLength = revealText.length;
      const wordsPerMinute = playbackSpeed === 'slow' ? 120 : playbackSpeed === 'slower' ? 80 : 160;
      const estimatedDuration = Math.max(10000, (textLength / 5) * (60000 / wordsPerMinute) + 2000); // At least 10 seconds + 2 second buffer
      
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
      console.log(`🎉 Manual playRevealText - Ocean Celebration - Stars: ${stars}`);
      if (stars >= 3) {
        textToSpeak = "Congratulations ocean hero! ... The WHOLE ocean is celebrating YOU! ... Fish are swimming in happy circles, dolphins are jumping for joy, and whales are singing your victory song! ... You listened so carefully and learned so much! ... You're a SUPERSTAR swimmer! ... Give yourself a big splash of applause! 🌊✨";
      } else {
        textToSpeak = `Great diving, young explorer! ... You found ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The sea creatures are happy with your effort! ... Finn is proud of you! ... Every ocean adventure teaches us something. Keep swimming and you'll find all the stars next time! 🐠`;
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
    
    console.log('🎤 Starting reveal text playback with Finn voice:', {
      text: textToSpeak.substring(0, 100) + '...',
      voice: FINN_VOICE,
      speed: playbackSpeed
    });
    
    setIsPlaying(true);
    setIsRevealTextPlaying(true);
    try {
      // Force stop any current speech first
      OnlineTTS.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use playAudioWithCaptions which ensures Finn's voice
      await playAudioWithCaptions(textToSpeak);
      console.log('✅ Reveal text playback completed successfully');
      
      // Wait a bit more to ensure full completion
      await new Promise(resolve => setTimeout(resolve, 500));
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
          await new Promise(resolve => setTimeout(resolve, 500));
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
            ? "Congratulations ocean hero! ... The WHOLE ocean is celebrating YOU! ... Fish are swimming in happy circles, dolphins are jumping for joy, and whales are singing your victory song! ... You listened so carefully and learned so much! ... You're a SUPERSTAR swimmer! ... Give yourself a big splash of applause! 🌊✨"
            : `Great diving, young explorer! ... You found ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The sea creatures are happy with your effort! ... Finn is proud of you! ... Every ocean adventure teaches us something. Keep swimming and you'll find all the stars next time! 🐠`;
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
        
        await OnlineTTS.speak(cleanText, FINN_VOICE, {
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
            onClick={() => {
              console.log('🛑 Close button clicked - stopping TTS immediately');
              OnlineTTS.stop();
              onClose();
            }}
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
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20 dark:border-gray-600">
                ⭐ {stars}/3 Stars
              </div>
              <div className="flex gap-1">
                {/* Speed Control - ALWAYS Available (works offline & online) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSpeed = playbackSpeed === 'slow' ? 'slower' : playbackSpeed === 'slower' ? 'normal' : 'slow';
                    handleSpeedChange(newSpeed);
                  }}
                  className="h-7 px-2 rounded-full text-xs bg-blue-50 dark:bg-blue-800 hover:bg-blue-100 dark:hover:bg-blue-700 border border-blue-200 dark:border-blue-600 text-blue-800 dark:text-blue-100 font-semibold shadow-sm"
                  title={`Playback speed (works offline & online): ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}
                >
                  <Gauge className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-200" />
                  {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
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
                      accessibilityMode && "bg-orange-100 dark:bg-orange-900 border border-orange-300"
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
                    "h-7 w-7 p-0 rounded-full border shadow-sm",
                    showTranscript 
                      ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-700" 
                      : "bg-white/80 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  )}
                  title="Toggle text transcript"
                >
                  <FileText className={cn(
                    "w-3.5 h-3.5",
                    showTranscript 
                      ? "text-blue-700 dark:text-blue-200" 
                      : "text-gray-700 dark:text-gray-200"
                  )} />
                </Button>
                )}
                
              </div>
            </div>
          </div>

          <Progress value={progress} className="h-2 mb-3 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500" />
          </Progress>

          {/* Accessibility Mode Warning */}
          {accessibilityMode && (listeningPhase === 'listening' || listeningPhase === 'question') && (
            <div className="mb-2 bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-400 text-orange-900 dark:text-orange-200 px-4 py-2.5 rounded-lg shadow-md flex-shrink-0">
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
            <div className="mb-2 bg-black/80 text-white px-4 py-2 rounded-lg text-center text-sm sm:text-base font-semibold animate-fade-in flex-shrink-0">
              {currentCaption}
            </div>
          )}

          <div className="flex-1 overflow-y-auto overflow-x-hidden sm:overflow-hidden pb-2 sm:pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {/* MOBILE: Original Single Column Layout */}
            <div className="sm:hidden text-center h-full flex flex-col justify-center">
              <div className="relative mb-2">
                <div className={cn("text-5xl sm:text-5xl md:text-6xl lg:text-7xl mb-2", getCharacterAnimation())}>
                  {current.emoji}
                </div>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star key={i} className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-all", i < stars ? 'text-yellow-400 animate-pulse' : 'text-gray-300 opacity-50')} />
                  ))}
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
                          <div key={i} className="w-2 bg-blue-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <Button 
                        onClick={handleReplayAudio}
                        disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                        className={cn(
                          "rounded-xl px-6 py-3 text-base bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold transition-all",
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
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="text-sm font-bold mb-1.5 text-gray-800 dark:text-white">{(current as any).question}</h4>
                    {showHint ? (
                      <p className="text-xs text-gray-600 dark:text-gray-300">💡 Hint: {(current as any).hint}</p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs"
                      >
                        Need a hint? 🐠
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-center mb-2">
                    <Button 
                      onClick={handleReplayAudio}
                      disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                      className={cn(
                        "rounded-xl px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-xs transition-all",
                        isPlaying && "animate-pulse"
                      )}
                    >
                      {isPlaying ? (
                        <>
                          <Volume2 className="w-4 h-4 mr-2 animate-spin" />
                          Listening...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          🔊 Listen
                        </>
                      )}
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
                    <div className="mt-2 animate-fade-in">
                      {selectedChoice === (current as any).audioText ? (
                        <div className="text-green-600 dark:text-green-400 text-xs font-bold animate-bounce bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 border border-green-200 dark:border-green-700">
                          {getCorrectFeedback()}
                          {attemptCount === 1 && (
                            <div className="mt-2 text-xs">
                              🏆 Perfect! First try bonus!
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-red-600 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5 border border-red-200 dark:border-red-700">
                            {getWrongFeedback(attemptCount)}
                          </div>
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
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
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
                    <p className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-200 leading-relaxed mx-auto max-w-3xl">
                      {(current as any).revealText}
                    </p>
                    <div className="mt-4 flex justify-center">
                      <Button 
                        onClick={handleNext} 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-2xl px-8 py-3"
                      >
                        Continue! 🌊
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile: Non-interactive steps */}
              {!current.listeningFirst && (
                <>
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 mb-4 backdrop-blur-sm border-2 border-white/20 shadow-2xl max-w-4xl mx-auto">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
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
                      {current.id === 'celebration' ? (
                        stars >= 3 ? (
                          "Congratulations ocean hero! ... The WHOLE ocean is celebrating YOU! ... Fish are swimming in happy circles, dolphins are jumping for joy, and whales are singing your victory song! ... You listened so carefully and learned so much! ... You're a SUPERSTAR swimmer! ... Give yourself a big splash of applause! 🌊✨"
                        ) : (
                          `Great diving, young explorer! ... You found ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The sea creatures are happy with your effort! ... Finn is proud of you! ... Every ocean adventure teaches us something. Keep swimming and you'll find all the stars next time! 🐠`
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
                      className="rounded-2xl px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-2xl"
                    >
                      {stepIndex === storySteps.length - 1 ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Complete! ✨
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continue 🌊
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
                    {current.emoji}
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

                  {/* Ocean Icon */}
                  <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 animate-float-slow">
                    <Waves className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-blue-500 opacity-70" />
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
                          "rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold transition-all",
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
                        Need a hint? 🐠
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
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:shadow-md"
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
                          {attemptCount === 1 && (
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
                          
                          {/* Retry Button - Desktop */}
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
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base"
                      >
                        Continue! 🌊
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
                      {current.id === 'celebration' ? (
                        stars >= 3 ? (
                          "Congratulations ocean hero! ... The WHOLE ocean is celebrating YOU! ... Fish are swimming in happy circles, dolphins are jumping for joy, and whales are singing your victory song! ... You listened so carefully and learned so much! ... You're a SUPERSTAR swimmer! ... Give yourself a big splash of applause! 🌊✨"
                        ) : (
                          `Great diving, young explorer! ... You found ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The sea creatures are happy with your effort! ... Finn is proud of you! ... Every ocean adventure teaches us something. Keep swimming and you'll find all the stars next time! 🐠`
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
                      className="rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base"
                    >
                      {stepIndex === storySteps.length - 1 ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Complete! ✨
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continue! 🌊
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              </div>
            </div>
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
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .animate-float-slow {
            animation-duration: 5s;
          }
        }
        
        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .animate-float-slow,
          .animate-float-medium,
          .animate-float-fast,
          .animate-float {
            animation: gentle-pulse 2s ease-in-out infinite;
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

export default UnderwaterWorld;
