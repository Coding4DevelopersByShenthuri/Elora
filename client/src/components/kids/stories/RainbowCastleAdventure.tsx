import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Crown, Star, Volume2, Play, Zap, X, Ear, Gauge, RotateCcw, FileText, Award, Castle, Rainbow } from 'lucide-react';
import OnlineTTS, { STORY_VOICES } from '@/services/OnlineTTS';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

// Princess Aurora's unique voice profile (uses OnlineTTS for unique Microsoft voice)
const AURORA_VOICE = STORY_VOICES.Aurora;

const storySteps = [
  {
    id: 'intro',
    title: '🏰 Welcome to Rainbow Castle!',
    text: 'Hello brave adventurer! I am Princess Aurora, and I\'m thrilled you\'re joining me!... Today, we\'re exploring my magnificent rainbow castle where magic sparkles everywhere!... You will meet friendly dragons, discover hidden treasures, and unlock magical secrets!... Your quest is to listen carefully to the castle\'s whispers and collect THREE royal gems!... Ready for this royal adventure? Let\'s begin our magical journey together!',
    emoji: '👑',
    character: 'Aurora',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: false,
    wordCount: 68,
    duration: 40
  },
  {
    id: 'castle_gates',
    title: '🚪 Golden Gates',
    emoji: '🚪',
    character: 'Aurora',
    bgColor: 'from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900',
    interactive: true,
    listeningFirst: true,
    
    // What kids will HEAR (play this first, NO text shown)
    audioText: 'Welcome to our royal castle',
    audioInstruction: 'Listen to what the golden gates are saying!',
    
    // Question AFTER audio (still no transcript)
    question: 'What greeting do the castle gates give us?',
    hint: 'It\'s a royal welcome',
    
    // Choices are aurally DIFFERENT (correct answer in position 2)
    choices: [
      { text: 'Stay away from here', emoji: '🚪❌', meaning: 'unfriendly warning' },
      { text: 'Welcome to our royal castle', emoji: '🚪👑', meaning: 'royal greeting' },
      { text: 'The castle is closed today', emoji: '🚪🔒', meaning: 'not welcoming' }
    ],
    
    // Full text revealed AFTER answering correctly
    revealText: 'Magnificent! The golden gates shimmer and say "Welcome to our royal castle!" Can you hear the magic in their voice? These gates have welcomed princes and princesses for hundreds of years!',
    
    maxReplays: 5,
    wordCount: 32,
    duration: 35
  },
  {
    id: 'friendly_dragon',
    title: '🐉 Dragon Guardian',
    emoji: '🐉',
    character: 'Aurora',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'I protect the castle with love',
    audioInstruction: 'Listen to what the friendly dragon tells us!',
    
    question: 'What does the dragon say about protecting the castle?',
    hint: 'Dragons can be gentle guardians',
    
    // Choices aurally different (correct answer in position 3)
    choices: [
      { text: 'I scare everyone away', emoji: '🐉😠', meaning: 'mean protector' },
      { text: 'I sleep all day long', emoji: '🐉😴', meaning: 'lazy guardian' },
      { text: 'I protect the castle with love', emoji: '🐉💚', meaning: 'gentle protector' }
    ],
    
    revealText: 'Wonderful! A gentle green dragon flies down and says "I protect the castle with love!" This dragon is so kind and caring! Dragons can be the best friends when they choose to be gentle!',
    
    maxReplays: 5,
    wordCount: 30,
    duration: 36
  },
  {
    id: 'magic_fountain',
    title: '⛲ Magic Fountain',
    emoji: '⛲',
    character: 'Aurora',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Wishes come true here',
    audioInstruction: 'Listen to the magic fountain\'s special message!',
    
    question: 'What magical power does the fountain have?',
    hint: 'Think about what fountains can do',
    
    // Choices with magical themes (correct answer in position 1)
    choices: [
      { text: 'Wishes come true here', emoji: '⛲✨', meaning: 'magic wishes' },
      { text: 'Only water flows here', emoji: '⛲💧', meaning: 'just water' },
      { text: 'No magic happens here', emoji: '⛲🚫', meaning: 'no magic' }
    ],
    
    revealText: 'Amazing! You earned your first royal gem! The sparkling fountain bubbles and says "Wishes come true here!" This is where princesses make their most important wishes! Two more gems to find!',
    
    maxReplays: 5,
    wordCount: 28,
    duration: 34
  },
  {
    id: 'first_gem',
    title: '💎 Royal Facts',
    emoji: '💎',
    character: 'Aurora',
    bgColor: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'true-false',
    
    audioText: 'Castles are homes for royalty',
    audioInstruction: 'Listen to this royal fact!',
    
    question: 'True or False: Castles are homes for royalty?',
    hint: 'Think about who lives in castles',
    
    choices: [
      { text: 'True - Castles are homes for royalty', emoji: '✅', meaning: 'correct - kings and queens live there' },
      { text: 'False - Castles are just buildings', emoji: '❌', meaning: 'wrong - royalty does live in castles' }
    ],
    
    revealText: 'Excellent listening! It\'s TRUE - castles ARE homes for royalty! Kings, queens, princes, and princesses live in these magnificent buildings!',
    
    maxReplays: 5,
    wordCount: 35,
    duration: 32
  },
  {
    id: 'rainbow_bridge',
    title: '🌈 Rainbow Bridge',
    emoji: '🌈',
    character: 'Aurora',
    bgColor: 'from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Colors make everything beautiful',
    audioInstruction: 'Listen to what the rainbow bridge teaches us!',
    
    question: 'What does the rainbow bridge say about colors?',
    hint: 'Rainbows show us beautiful colors',
    
    // Color wisdom choices (correct answer in position 2)
    choices: [
      { text: 'Colors are not important', emoji: '🌈😞', meaning: 'colors don\'t matter' },
      { text: 'Colors make everything beautiful', emoji: '🌈🎨', meaning: 'colors bring beauty' },
      { text: 'Only one color is good', emoji: '🌈🔴', meaning: 'only one color' }
    ],
    
    revealText: 'Fantastic! You earned your second royal gem! The rainbow bridge sparkles and says "Colors make everything beautiful!" Just like how all the colors in a rainbow work together to create something amazing! One more gem to complete your royal collection!',
    
    maxReplays: 5,
    wordCount: 32,
    duration: 38
  },
  {
    id: 'second_gem',
    title: '✨ Castle Wisdom',
    emoji: '✨',
    character: 'Aurora',
    bgColor: 'from-gold-100 to-yellow-100 dark:from-gold-900 dark:to-yellow-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'inference',
    
    audioText: 'Kindness is the greatest magic',
    audioInstruction: 'Listen to the castle\'s ancient wisdom!',
    
    question: 'What is the most powerful magic according to the castle?',
    hint: 'Think about what makes people happy',
    
    // Wisdom choices (correct answer in position 3)
    choices: [
      { text: 'Being the strongest is best', emoji: '✨💪', meaning: 'physical power' },
      { text: 'Having lots of gold matters', emoji: '✨💰', meaning: 'material wealth' },
      { text: 'Kindness is the greatest magic', emoji: '✨💝', meaning: 'love and kindness' }
    ],
    
    revealText: 'Incredible! ... YES! ... You found all three royal gems! ... (They\'re sparkling in your royal crown!) "Kindness is the greatest magic!" When we are kind to others, we create the most wonderful magic of all! ... You are a TRUE royal friend! ... Princess Aurora is so proud of you!',
    
    maxReplays: 5,
    wordCount: 38,
    duration: 40
  },
  {
    id: 'final_gem',
    title: '🏰 Royal Castle',
    text: 'The castle is filled with so much magic! All the dragons, fountains, and rainbow bridges are happy because you listened so carefully to their royal messages. You have learned so much about kindness, colors, and the power of wishes!',
    emoji: '🏰',
    character: 'Aurora',
    bgColor: 'from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800',
    interactive: false,
    wordCount: 42,
    duration: 30
  },
  {
    id: 'royal_celebration',
    title: '🎉 Royal Celebration!',
    text: 'Congratulations, royal adventurer! ... The WHOLE castle is celebrating YOU! ... Dragons are dancing, fountains are sparkling, and rainbow bridges are glowing! ... You listened with such a royal heart! ... You\'re always welcome in our magical castle! ... Come visit again soon! ... Until next time, brave friend! 👑✨',
    emoji: '🎉',
    character: 'Aurora',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 45,
    duration: 38
  }
];

const RainbowCastleAdventure = ({ onClose, onComplete }: Props) => {
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
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('slow'); // Default to slow for better comprehension
  const [retryMode, setRetryMode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false); // For hearing-impaired kids
  
  // Analytics tracking
  const [currentSession, setCurrentSession] = useState<StorySession | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  
  // TTS availability status
  const [ttsInitialized, setTtsInitialized] = useState(false);
  const [isRevealTextPlaying, setIsRevealTextPlaying] = useState(false);

  const current = storySteps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / storySteps.length) * 100);
  const totalSteps = storySteps.length;
  const totalWords = storySteps.reduce((sum, step) => sum + step.wordCount, 0);
  const totalDuration = storySteps.reduce((sum, step) => sum + step.duration, 0);

  // Increased replay limits + unlimited option
  const maxReplays = (current as any).maxReplays || 5; // Increased from 3 to 5
  const unlimitedReplays = true; // Allow unlimited for accessibility

  // Initialize online TTS on mount
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
        'rainbow-castle',
        'Rainbow Castle Adventure'
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
    // Don't reset accessibility mode - keep it persistent across steps if enabled
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

  // Enhanced audio playback (OnlineTTS: Web Speech API only)
  const playAudioWithCaptions = async (text: string) => {
    try {
      // Strip emojis/stickers before speaking to prevent TTS from reading emoji names
      const cleanText = stripEmojis(text);
      
      console.log(`🎤 Playing audio with Aurora's voice:`, {
        text: cleanText.substring(0, 50) + '...',
        voice: AURORA_VOICE,
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
        AURORA_VOICE,
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
        voice: AURORA_VOICE,
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
        if (current.id === 'royal_celebration') {
          console.log(`🎉 Castle Celebration step - Stars collected: ${stars}`);
          if (stars >= 3) {
            textToRead = "Congratulations royal adventurer! ... The WHOLE castle is celebrating YOU! ... Dragons are dancing, fountains are sparkling, and rainbow bridges are glowing! ... You listened with such a royal heart! You should feel SO proud! ... Give yourself royal applause!";
          } else {
            textToRead = `Wonderful work, brave friend! ... You earned ${Math.floor(stars)} gem${Math.floor(stars) !== 1 ? 's' : ''}! ... The castle friends are so happy you tried your best! ... Princess Aurora is proud of you! ... Every royal adventure teaches us something new. Keep listening carefully and you'll collect all the gems next time! 💎`;
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
    let isCorrect = false;
    
    // Handle true/false questions specially
    if ((current as any).questionType === 'true-false') {
      // For true/false questions, check if the choice contains the correct answer
      const audioText = (current as any).audioText;
      if (audioText === 'Castles are homes for royalty') {
        // The statement is true, so "True - ..." is correct
        isCorrect = choice.includes('True - Castles are homes for royalty');
      }
    } else {
      // For regular listening questions, use exact match
      isCorrect = choice === (current as any).audioText;
    }
    
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
      
      // Award stars based on specific story steps (steps 4, 6, and 7)
      if (current.id === 'magic_fountain') {
        // First star - after completing step 4 (magic fountain)
        setStars(1);
        console.log('⭐ First star awarded! (1/3) - Step 4: Magic Fountain');
      } else if (current.id === 'rainbow_bridge') {
        // Second star - after completing step 6 (rainbow bridge)
        setStars(2);
        console.log('⭐ Second star awarded! (2/3) - Step 6: Rainbow Bridge');
      } else if (current.id === 'second_gem') {
        // Third star - after completing step 7 (second gem)
        setStars(3);
        console.log('⭐ Third star awarded! (3/3) - Step 7: Second Gem');
      }
      // Note: Stars are awarded at steps 4, 6, and 7 for better progression
    
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
    if (current.id === 'royal_celebration') {
      console.log(`🎉 Manual playRevealText - Castle Celebration - Stars: ${stars}`);
      if (stars >= 3) {
        textToSpeak = "Congratulations royal adventurer! ... The WHOLE castle is celebrating YOU! ... Dragons are dancing, fountains are sparkling, and rainbow bridges are glowing! ... You listened with such a royal heart! You should feel SO proud! ... Give yourself royal applause!";
      } else {
        textToSpeak = `Wonderful work, brave friend! ... You earned ${Math.floor(stars)} gem${Math.floor(stars) !== 1 ? 's' : ''}! ... The castle friends are so happy you tried your best! ... Princess Aurora is proud of you! ... Every royal adventure teaches us something new. Keep listening carefully and you'll collect all the gems next time! 💎`;
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
    
    console.log('🎤 Starting reveal text playback with Aurora voice:', {
      text: textToSpeak.substring(0, 100) + '...',
      voice: AURORA_VOICE,
      speed: playbackSpeed
    });
    
    setIsPlaying(true);
    setIsRevealTextPlaying(true);
    try {
      // Force stop any current speech first
      OnlineTTS.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use playAudioWithCaptions which ensures Aurora's voice
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
        if (current.id === 'royal_celebration') {
          textToPlay = stars >= 3 
            ? "Congratulations royal adventurer! ... The WHOLE castle is celebrating YOU! ... Dragons are dancing, fountains are sparkling, and rainbow bridges are glowing! ... You listened with such a royal heart! You should feel SO proud! ... Give yourself royal applause!"
            : `Wonderful work, brave friend! ... You earned ${Math.floor(stars)} gem${Math.floor(stars) !== 1 ? 's' : ''}! ... The castle friends are so happy you tried your best! ... Princess Aurora is proud of you! ... Every royal adventure teaches us something new. Keep listening carefully and you'll collect all the gems next time! 💎`;
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
        
        await OnlineTTS.speak(cleanText, AURORA_VOICE, {
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

  // Get varied feedback messages
  const getCorrectFeedback = () => {
    const messages = [
      "👑 ROYAL! You earned a gem! 💎",
      "💎 MAGNIFICENT! Perfect!",
      "✨ SPLENDID! Amazing!",
      "🎯 EXCELLENT! Great job!",
      "💫 WONDERFUL! Gem earned!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => {
    if (attempt === 1) {
      return `💝 Not quite, brave friend! Listen carefully and try again! 🎧`;
    } else {
      return `👑 Keep trying! Listen one more time to find the royal answer! 👂`;
    }
  };

  const getCharacterAnimation = () => {
    if (current.id.includes('gem')) return 'animate-bounce';
    return 'animate-float';
  };

  const getEnvironmentIcon = () => {
    switch (current.id) {
      case 'castle_gates': return Castle;
      case 'friendly_dragon': return Sparkles;
      case 'magic_fountain': return Rainbow;
      case 'rainbow_bridge': return Rainbow;
      default: return Crown;
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

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-3 gap-2 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Aurora's Rainbow Castle</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                💎 {stars}/3 Gems
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
                  className="h-7 px-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 bg-purple-50 dark:bg-purple-800 hover:bg-purple-100 dark:hover:bg-purple-700 border border-purple-200 dark:border-purple-600 text-purple-800 dark:text-purple-100"
                  title={`Playback speed (works offline & online): ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}
                >
                  <Gauge className="w-3.5 h-3.5 mr-1 text-purple-600 dark:text-purple-200" />
                  {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
                </Button>
                
                {/* Accessibility Mode Toggle (for hearing-impaired) */}
                {(listeningPhase === 'listening' || listeningPhase === 'question') && current.listeningFirst && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAccessibilityMode(!accessibilityMode);
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
          
          {/* TTS Status Banner */}
          {ttsInitialized && ttsAvailable && (
            <div className="mb-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 justify-center">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-bold">
                  Aurora's voice is ready! Listen carefully to her royal words!
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
                    current.id === 'royal_celebration' && 'animate-celebration-party'
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
                          ? 'text-purple-400 animate-pulse drop-shadow-lg' 
                          : 'text-gray-300 opacity-50'
                      )} 
                    />
                  ))}
                </div>

                {/* Environment Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <EnvironmentIcon className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-500 opacity-70" />
                </div>
              </div>

              {/* Mobile: PHASE 1 - LISTENING */}
              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-purple-100/80 dark:bg-purple-900/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-purple-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-purple-600 animate-bounce" />
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
                            className="w-2 bg-purple-500 rounded-full animate-waveform"
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
                          "rounded-xl px-6 py-3 text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all",
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
                          "rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-xs sm:text-xs md:text-sm",
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
                            <span className="hidden sm:inline">Listen to the Royal Word</span>
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
                        // Handle true/false questions specially
                        let isCorrect = false;
                        if ((current as any).questionType === 'true-false') {
                          const audioText = (current as any).audioText;
                          if (audioText === 'Castles are homes for royalty') {
                            isCorrect = choice.text.includes('True - Castles are homes for royalty');
                          }
                        } else {
                          isCorrect = choice.text === (current as any).audioText;
                        }
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
                        className="text-purple-500 hover:text-purple-600 h-7 w-7 sm:h-8 sm:w-8 p-0"
                        title="Replay this text with Aurora's voice"
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
                        Continue Adventure! 👑
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
                        className="text-purple-600 hover:text-purple-700"
                        title="Replay this text with Aurora's voice"
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </h3>
                    
                    <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                      {/* Dynamic message based on stars collected */}
                      {current.id === 'royal_celebration' ? (
                        stars >= 3 ? (
                          // 3 gems - Full celebration
                          "Congratulations royal adventurer! ... The WHOLE castle is celebrating YOU! ... Dragons are dancing, fountains are sparkling, and rainbow bridges are glowing! ... You listened with such a royal heart! You should feel SO proud! ... Give yourself royal applause!"
                        ) : (
                          // 1-2 gems - Encouraging message
                          `Wonderful work, brave friend! ... You earned ${Math.floor(stars)} gem${Math.floor(stars) !== 1 ? 's' : ''}! ... The castle friends are so happy you tried your best! ... Princess Aurora is proud of you! ... Every royal adventure teaches us something new. Keep listening carefully and you'll collect all the gems next time! 💎`
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
                        <span className="hidden sm:inline">Complete Royal Journey! ✨</span>
                        <span className="sm:hidden">Done! ✨</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2" />
                        <span className="hidden sm:inline">Continue Adventure! 👑</span>
                        <span className="sm:hidden">Next 👑</span>
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
                      current.id === 'royal_celebration' && 'animate-celebration-party'
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
                            ? 'text-purple-400 animate-pulse drop-shadow-lg' 
                            : 'text-gray-300 opacity-50'
                        )} 
                      />
                    ))}
          </div>

                  {/* Environment Icon */}
                  <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 animate-float-slow">
                    <EnvironmentIcon className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-purple-500 opacity-70" />
          </div>
          </div>
              </div>

              {/* RIGHT SIDE: Content (Desktop) */}
              <div className="flex-1 flex flex-col justify-center sm:pr-4 overflow-hidden max-h-full">

              {/* Desktop: PHASE 1 - LISTENING */}
              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="w-full">
                  <div className="bg-purple-100/80 dark:bg-purple-900/40 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-purple-300 shadow-xl">
                    <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-5 h-5 md:w-6 md:h-6 text-purple-600 animate-bounce" />
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
                            className="w-2 bg-purple-500 rounded-full animate-waveform"
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
                          "rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all",
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
                        Need a hint? 🧩
                      </Button>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      onClick={handleReplayAudio}
                      disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                      className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm"
                    >
                      <Volume2 className="w-3 h-3 mr-1.5" />
                      {unlimitedReplays ? `Replay (${replaysUsed})` : `Replay (${maxReplays - replaysUsed})`}
                    </Button>
                  </div>

                  {(current as any).choices && (
                    <div className="grid grid-cols-1 gap-1.5">
                      {(current as any).choices.map((choice: any, idx: number) => {
                        const isSelected = selectedChoice === choice.text;
                        // Handle true/false questions specially
                        let isCorrect = false;
                        if ((current as any).questionType === 'true-false') {
                          const audioText = (current as any).audioText;
                          if (audioText === 'Castles are homes for royalty') {
                            isCorrect = choice.text.includes('True - Castles are homes for royalty');
                          }
                        } else {
                          isCorrect = choice.text === (current as any).audioText;
                        }
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
                        className="text-purple-600 hover:text-purple-700 h-7 w-7 p-0"
                        title="Replay this text with Aurora's voice"
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
                        Continue Adventure! 👑
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
                        className="text-purple-600 hover:text-purple-700 h-7 w-7 p-0"
                        title="Replay this text with Aurora's voice"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed px-2">
                      {/* Dynamic message based on stars collected */}
                      {current.id === 'royal_celebration' ? (
                        stars >= 3 ? (
                          // 3 gems - Full celebration
                          "Congratulations royal adventurer! ... The WHOLE castle is celebrating YOU! ... Dragons are dancing, fountains are sparkling, and rainbow bridges are glowing! ... You listened with such a royal heart! You should feel SO proud! ... Give yourself royal applause!"
                        ) : (
                          // 1-2 gems - Encouraging message
                          `Wonderful work, brave friend! ... You earned ${Math.floor(stars)} gem${Math.floor(stars) !== 1 ? 's' : ''}! ... The castle friends are so happy you tried your best! ... Princess Aurora is proud of you! ... Every royal adventure teaches us something new. Keep listening carefully and you'll collect all the gems next time! 💎`
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
                          Complete Royal Journey! ✨
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continue Adventure! 👑
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
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <div className="hidden lg:block absolute bottom-20 left-12 animate-float-medium">
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="hidden lg:block absolute top-1/2 left-4 animate-float-fast">
            <Rainbow className="w-7 h-7 text-pink-400" />
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

export default RainbowCastleAdventure;
