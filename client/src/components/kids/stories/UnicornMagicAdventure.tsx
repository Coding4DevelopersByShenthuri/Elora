import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Star, Volume2, Play, Zap, X, Ear, Award, Gauge, RotateCcw, FileText, Heart, Flower, Trees, CloudRain } from 'lucide-react';
import OnlineTTS, { STORY_VOICES } from '@/services/OnlineTTS';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

// Stardust's unique voice profile (uses hybrid voice system)
const STARDUST_VOICE = STORY_VOICES.Stardust;

const storySteps = [
  {
    id: 'intro',
    title: '🦄 Welcome to Magic Land!',
    text: 'Hello magical friend! I am Stardust the unicorn!... Today we\'re visiting my sparkly kingdom where everything is full of magic and wonder!... You will see rainbow waterfalls, meet fairy friends, and discover magical treasures!... Your special mission is to listen carefully and collect THREE shining stars!... Ready to enter the magic? Let\'s go!',
    emoji: '🦄',
    character: 'Stardust',
    bgColor: 'from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900',
    interactive: false,
    wordCount: 58,
    duration: 34
  },
  {
    id: 'rainbow_waterfall',
    title: '🌈 Rainbow Waterfall',
    emoji: '🌈',
    character: 'Stardust',
    bgColor: 'from-blue-100 to-pink-100 dark:from-blue-900 dark:to-pink-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Magic sparkles everywhere',
    audioInstruction: 'Listen to what the rainbow says!',
    
    question: 'What does the rainbow say?',
    hint: 'It\'s about the magic all around us',
    
    choices: [
      { text: 'Everything is very dark', emoji: '🌈🌑', meaning: 'no light' },
      { text: 'Magic sparkles everywhere', emoji: '🌈✨', meaning: 'sparkly magic' },
      { text: 'Nothing is special here', emoji: '🌈😐', meaning: 'plain and boring' }
    ],
    
    revealText: 'WOW! Look at the beautiful rainbow waterfall! All the colors are so bright! The rainbow sings "Magic sparkles everywhere!" Can you see the sparkles? They\'re like tiny stars in the water! Everything in our magic land is special!',
    
    maxReplays: 5,
    wordCount: 42,
    duration: 36
  },
  {
    id: 'fairy_friends',
    title: '🧚 Fairy Friends',
    emoji: '🧚',
    character: 'Stardust',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Come play with us',
    audioInstruction: 'Listen to what the fairies say!',
    
    question: 'What do the fairies want us to do?',
    hint: 'They want to have fun together',
    
    choices: [
      { text: 'Go away from us', emoji: '🧚❌', meaning: 'telling us to leave' },
      { text: 'Stay very quiet', emoji: '🧚🤫', meaning: 'be silent' },
      { text: 'Come play with us', emoji: '🧚🎈', meaning: 'invite to play' }
    ],
    
    revealText: 'Look! Tiny fairies are flying around us! They giggle and say "Come play with us!" Fairies love to play games and dance! Can you wave to them? They\'re so friendly and full of joy! Playing together is the best!',
    
    maxReplays: 5,
    wordCount: 40,
    duration: 35
  },
  {
    id: 'magic_butterflies',
    title: '🦋 Dancing Butterflies',
    emoji: '🦋',
    character: 'Stardust',
    bgColor: 'from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Dance with joy and happiness',
    audioInstruction: 'Listen to what the butterflies whisper!',
    
    question: 'What do the magical butterflies want us to do?',
    hint: 'They want us to move and be happy',
    
    choices: [
      { text: 'Dance with joy and happiness', emoji: '🦋💃', meaning: 'dance happily' },
      { text: 'Sit very still and quiet', emoji: '🦋🤫', meaning: 'be motionless' },
      { text: 'Run away from them', emoji: '🦋🏃', meaning: 'escape' }
    ],
    
    revealText: 'Hooray! We found our first sparkly star! You\'re listening so well! The butterflies flutter around us saying "Dance with joy and happiness!" They love to dance in the magical breeze! Can you wiggle and dance like the butterflies? Dancing makes everything more fun! Two more stars to find!',
    
    maxReplays: 5,
    wordCount: 45,
    duration: 40
  },
  {
    id: 'magic_flowers',
    title: '🌸 Singing Flowers',
    emoji: '🌸',
    character: 'Stardust',
    bgColor: 'from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Love makes everything bloom',
    audioInstruction: 'Listen to the flowers\' sweet message!',
    
    question: 'What do the magic flowers say?',
    hint: 'It\'s about what makes things grow',
    
    choices: [
      { text: 'Love makes everything bloom', emoji: '🌸💕', meaning: 'love helps things grow' },
      { text: 'Sadness makes things wilt', emoji: '🌸😢', meaning: 'sadness hurts' },
      { text: 'Nothing ever grows here', emoji: '🌸🚫', meaning: 'no growth' }
    ],
    
    revealText: 'Beautiful! These flowers are singing a sweet song! They say "Love makes everything bloom!" When we show love and kindness, everything grows better! The magic flowers are so happy you listened carefully!',
    
    maxReplays: 5,
    wordCount: 35,
    duration: 32
  },
  {
    id: 'first_star',
    title: '⭐ Unicorn Facts',
    emoji: '⭐',
    character: 'Stardust',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'true-false',
    
    audioText: 'Unicorns have magical horns',
    audioInstruction: 'Listen to this unicorn fact!',
    
    question: 'True or False: Unicorns have magical horns?',
    hint: 'Look at Stardust!',
    
    choices: [
      { text: 'Unicorns have magical horns', emoji: '✅', meaning: 'true - unicorns are special' },
      { text: 'Unicorns have no horns', emoji: '❌', meaning: 'incorrect - they do have horns' }
    ],
    
    revealText: 'Great listening! It\'s TRUE - unicorns DO have magical horns! My horn can make magic and spread happiness! Have you ever imagined riding a unicorn? Unicorns are so magical and special!',
    
    maxReplays: 5,
    wordCount: 42,
    duration: 32
  },
  {
    id: 'crystal_cave',
    title: '💎 Crystal Cave',
    emoji: '💎',
    character: 'Stardust',
    bgColor: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Dreams can come true here',
    audioInstruction: 'Listen to what the crystal says!',
    
    question: 'What does the crystal tell us?',
    hint: 'It\'s about wishes and dreams',
    
    choices: [
      { text: 'Dreams can come true here', emoji: '💎💫', meaning: 'wishes come true' },
      { text: 'Never wish for anything', emoji: '💎🚫', meaning: 'no wishing' },
      { text: 'Dreams are silly things', emoji: '💎😞', meaning: 'dreams not important' }
    ],
    
    revealText: 'Yay! The crystals glow and whisper "Dreams can come true here!" If you believe in magic and work hard, your dreams can happen! The crystal cave is so beautiful and magical! Keep listening carefully to find more stars!',
    
    maxReplays: 5,
    wordCount: 35,
    duration: 37
  },
  {
    id: 'second_star',
    title: '✨ Magic Secrets',
    emoji: '✨',
    character: 'Stardust',
    bgColor: 'from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'inference',
    
    audioText: 'Magic happens when we believe',
    audioInstruction: 'Listen to the magic secret!',
    
    question: 'When does magic happen?',
    hint: 'Think about believing in magic',
    
    choices: [
      { text: 'Magic never really happens', emoji: '✨😞', meaning: 'no magic exists' },
      { text: 'Only at midnight exactly', emoji: '✨🕛', meaning: 'specific time only' },
      { text: 'Magic happens when we believe', emoji: '✨💫', meaning: 'believing makes magic' }
    ],
    
    revealText: 'Amazing! We found our second sparkly star! You\'re doing wonderfully! The magic tells us "Magic happens when we believe!" When you believe in yourself and in magic, amazing things can happen! That\'s such a beautiful secret! One more star to go!',
    
    maxReplays: 5,
    wordCount: 45,
    duration: 40
  },
  {
    id: 'final_star',
    title: '🌟 Magic Kingdom',
    emoji: '🌟',
    character: 'Stardust',
    bgColor: 'from-yellow-200 to-pink-200 dark:from-yellow-800 dark:to-pink-800',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'You are a magical superstar',
    audioInstruction: 'Listen to the final magical message!',
    
    question: 'What does the magic kingdom say about you?',
    hint: 'It\'s about how special you are',
    
    choices: [
      { text: 'You are a magical superstar', emoji: '🌟⭐', meaning: 'you are amazing' },
      { text: 'You need to try harder', emoji: '🌟😞', meaning: 'not good enough' },
      { text: 'Magic is not real', emoji: '🌟❌', meaning: 'no magic' }
    ],
    
    revealText: 'INCREDIBLE! We found our third and final sparkly star! You\'ve completed the magical journey! All three magic stars are now glowing brightly! The kingdom is filled with so much magic! All the fairies, flowers, and crystals are happy because you listened so carefully to their messages. You have learned so much about love, dreams, and believing in magic! You are truly a magical superstar!',
    
    maxReplays: 5,
    wordCount: 50,
    duration: 45
  },
  {
    id: 'celebration',
    title: '🎉 Magic Party!',
    text: 'Congratulations, magical superstar! ... The WHOLE kingdom is throwing a party for YOU! ... Fairies are dancing, flowers are singing, and rainbows are shining everywhere! ... You listened with your heart and your ears! ... You filled our world with happiness! ... You\'re a WONDERFUL friend! ... Keep believing in magic always! 🦄✨',
    emoji: '🎉',
    character: 'Stardust',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 45,
    duration: 38
  }
];

const UnicornMagicAdventure = ({ onClose, onComplete }: Props) => {
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
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  
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
        'unicorn-magic',
        'Unicorn Magic'
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

  // Shuffle answers when entering a question step so correct answer position varies
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
      
      console.log(`🎤 Playing audio with Stardust's voice:`, {
        text: cleanText.substring(0, 50) + '...',
        voice: STARDUST_VOICE,
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
        STARDUST_VOICE,
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

  // SINGLE SEQUENTIAL AUDIO MANAGER - Prevents overlapping and messy playback
  useEffect(() => {
    const playSequentialAudio = async () => {
      // Always stop any current audio first
      await OnlineTTS.stop();
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait for complete stop
      
      console.log('🎵 Starting sequential audio playback:', {
        stepId: current.id,
        phase: listeningPhase,
        isInteractive: current.listeningFirst,
        hasAudioText: !!(current as any).audioText,
        hasRevealText: !!(current as any).revealText,
        hasText: !!current.text
      });
      
      try {
        // PHASE 1: LISTENING PHASE (Interactive steps only)
        if (listeningPhase === 'listening' && current.listeningFirst && (current as any).audioText) {
          console.log('🎧 Playing listening audio...');
          setIsPlaying(true);
          setAudioWaveform(true);
          
          await playAudioWithCaptions((current as any).audioText);
          setHasListened(true);
          
          setIsPlaying(false);
          setAudioWaveform(false);
          console.log('✅ Listening audio completed');
        }
        
        // PHASE 2: REVEAL PHASE (Interactive steps only)
        else if (listeningPhase === 'reveal' && current.listeningFirst && (current as any).revealText && ttsAvailable) {
          console.log('🎭 Playing reveal text...');
          setIsPlaying(true);
          setIsRevealTextPlaying(true);
          
          await playAudioWithCaptions((current as any).revealText);
          
          setIsPlaying(false);
          setIsRevealTextPlaying(false);
          console.log('✅ Reveal text completed');
        }
        
        // PHASE 3: NON-INTERACTIVE STEPS (Intro, celebration, etc.)
        else if (!current.listeningFirst && current.text && ttsAvailable) {
          console.log('📖 Playing narration...');
          let textToRead = current.text;
          
          // Handle dynamic celebration text based on stars collected
          if (current.id === 'celebration') {
            console.log(`🎉 Unicorn Celebration step - Stars collected: ${stars}`);
            if (stars >= 3) {
              textToRead = "Congratulations magical friend! ... The WHOLE enchanted kingdom is celebrating YOU! ... Unicorns are dancing, rainbows are glowing, and pure magic fills the sky! ... You made the magical world so proud with your wonderful listening! You should feel SO special! ... Give yourself a magical twirl!";
            } else {
              textToRead = `Beautiful work, little dreamer! ... You collected ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The unicorns are happy you tried your best! ... Rainbow is proud of you! ... Every magical journey helps us learn. Keep believing and you'll collect all the stars next time! 🦄`;
            }
            console.log(`🎉 Celebration text selected:`, textToRead.substring(0, 100) + '...');
          }
          
          setIsPlaying(true);
          await playAudioWithCaptions(textToRead);
          setIsPlaying(false);
          console.log('✅ Narration completed');
        }
        
        // Wait a moment after any audio completes
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('🎵 Sequential audio playback finished');
        
      } catch (error) {
        console.error('❌ Sequential audio playback failed:', error);
        setIsPlaying(false);
        setIsRevealTextPlaying(false);
        setAudioWaveform(false);
      }
    };
    
    // Only play audio if TTS is available
    if (ttsAvailable) {
      playSequentialAudio();
    }
  }, [listeningPhase, stepIndex, playbackSpeed, stars, ttsAvailable]);

  const handleNext = () => {
    console.log('🔄 handleNext called:', {
      stepIndex,
      totalSteps: storySteps.length,
      currentId: current.id,
      phase: listeningPhase
    });
    
    // Stop any current TTS before advancing
    OnlineTTS.stop();
    
    if (stepIndex < storySteps.length - 1) {
      setStepIndex(stepIndex + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
      setShowHint(false);
      setCurrentCaption('');
      console.log('✅ Advanced to next step:', stepIndex + 1);
    } else {
      // Calculate score based on correct answers and time
      const accuracyScore = correctAnswers * 20;
      const timeBonus = Math.max(0, 300 - timeSpent) * 0.1; // Bonus for faster completion
      const starBonus = stars * 10;
      const score = Math.min(100, 40 + accuracyScore + timeBonus + starBonus);
      
      console.log('🏁 Story completed!', {
        correctAnswers,
        timeSpent,
        stars,
        score
      });
      
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
    
    console.log('🔄 Manual replay requested:', {
      stepId: current.id,
      phase: listeningPhase,
      replaysUsed: replaysUsed + 1
    });
    
    setReplaysUsed(prev => prev + 1);
    
    // Stop any current audio first
    await OnlineTTS.stop();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsPlaying(true);
    setAudioWaveform(true);
    
    try {
      await playAudioWithCaptions((current as any).audioText);
      setHasListened(true);
      console.log('✅ Manual replay completed');
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
      
      // Award stars based on specific story steps (steps 3, 7, and 9)
      if (current.id === 'magic_butterflies') {
        // First star - after completing step 3 (magic butterflies)
        setStars(1);
        console.log('⭐ First star awarded! (1/3) - Step 3: Magic Butterflies');
      } else if (current.id === 'second_star') {
        // Second star - after completing step 7 (second star)
        setStars(2);
        console.log('⭐ Second star awarded! (2/3) - Step 7: Second Star');
      } else if (current.id === 'final_star') {
        // Third star - after completing step 9 (final star - step 8 in 0-indexed array)
        setStars(3);
        console.log('⭐ Third star awarded! (3/3) - Step 9: Final Star');
      }
      // Note: Stars are awarded at steps 3, 7, and 9 for proper progression
    
      setShowFeedback(true);
      setRetryMode(false);
    
      // Auto-advance after showing feedback to reveal phase
      setTimeout(() => {
        setListeningPhase('reveal');
      }, 2500);
      
      // Calculate dynamic timing based on reveal text length - more generous timing
      const revealText = (current as any).revealText || '';
      const textLength = revealText.length;
      const wordsPerMinute = playbackSpeed === 'slow' ? 100 : playbackSpeed === 'slower' ? 70 : 140;
      const estimatedDuration = Math.max(12000, (textLength / 4) * (60000 / wordsPerMinute) + 2000); // More conservative timing
      
      console.log('⏱️ Sequential timing calculation:', {
        textLength,
        wordsPerMinute,
        estimatedDuration: Math.round(estimatedDuration),
        playbackSpeed,
        revealText: revealText.substring(0, 50) + '...'
      });
      
      // Move to next step after reveal text has time to complete
      setTimeout(() => {
        console.log('🔄 Sequential advance check:', {
          isRevealTextPlaying,
          stepId: current.id,
          phase: listeningPhase
        });
        
        // Always advance after the calculated time - the sequential system ensures clean playback
        console.log('✅ Sequential timing complete, advancing to next step');
        handleNext();
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
    setListeningPhase('listening');
    setReplaysUsed(0);
  };

  const playRevealText = async () => {
    let textToSpeak = (current as any).revealText || current.text;
    
    console.log('🎭 Manual playRevealText called:', {
      stepId: current.id,
      hasRevealText: !!(current as any).revealText,
      hasText: !!current.text,
      ttsAvailable,
      textPreview: textToSpeak ? textToSpeak.substring(0, 50) + '...' : 'No text'
    });
    
    // Handle dynamic celebration text based on stars collected
    if (current.id === 'celebration') {
      console.log(`🎉 Manual playRevealText - Unicorn Celebration - Stars: ${stars}`);
      if (stars >= 3) {
        textToSpeak = "Congratulations magical friend! ... The WHOLE enchanted kingdom is celebrating YOU! ... Unicorns are dancing, rainbows are glowing, and pure magic fills the sky! ... You made the magical world so proud with your wonderful listening! You should feel SO special! ... Give yourself a magical twirl!";
      } else {
        textToSpeak = `Beautiful work, little dreamer! ... You collected ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The unicorns are happy you tried your best! ... Rainbow is proud of you! ... Every magical journey helps us learn. Keep believing and you'll collect all the stars next time! 🦄`;
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
    
    // Stop any current audio first
    await OnlineTTS.stop();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('🎤 Starting manual reveal text playback:', {
      text: textToSpeak.substring(0, 100) + '...',
      voice: STARDUST_VOICE,
      speed: playbackSpeed
    });
    
    setIsPlaying(true);
    setIsRevealTextPlaying(true);
    try {
      await playAudioWithCaptions(textToSpeak);
      console.log('✅ Manual reveal text playback completed successfully');
      
      // Wait to ensure full completion
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('❌ TTS error in playRevealText:', error);
    } finally {
      setIsPlaying(false);
      setIsRevealTextPlaying(false);
      console.log('🎭 Manual reveal text playback finished');
    }
  };

  // Sequential speed change function - ensures clean audio transitions
  const handleSpeedChange = (newSpeed: 'normal' | 'slow' | 'slower') => {
    console.log('🔄 Speed change requested:', {
      stepId: current.id,
      oldSpeed: playbackSpeed,
      newSpeed: newSpeed,
      phase: listeningPhase
    });
    
    // Update speed state immediately
    setPlaybackSpeed(newSpeed);
    
    // Determine what text to replay
    let textToPlay = '';
    
    if (current.listeningFirst) {
      // Interactive steps with listening phases
      if (listeningPhase === 'listening' && (current as any).audioText) {
        textToPlay = (current as any).audioText;
        console.log('🎧 Speed change - replay listening audio');
      } else if (listeningPhase === 'reveal' && (current as any).revealText) {
        textToPlay = (current as any).revealText;
        console.log('🎭 Speed change - replay reveal text');
      }
    } else {
      // Non-interactive steps (like intro, celebration, etc.)
      if (current.text) {
        if (current.id === 'celebration') {
          textToPlay = stars >= 3 
            ? "Congratulations magical friend! ... The WHOLE enchanted kingdom is celebrating YOU! ... Unicorns are dancing, rainbows are glowing, and pure magic fills the sky! ... You made the magical world so proud with your wonderful listening! You should feel SO special! ... Give yourself a magical twirl!"
            : `Beautiful work, little dreamer! ... You collected ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The unicorns are happy you tried your best! ... Rainbow is proud of you! ... Every magical journey helps us learn. Keep believing and you'll collect all the stars next time! 🦄`;
          console.log('🎉 Speed change - replay celebration text');
        } else {
          textToPlay = current.text;
          console.log('📖 Speed change - replay narration text');
        }
      }
    }
    
    if (!textToPlay) {
      console.log('❌ No text found to replay for speed change');
      return;
    }
    
    if (!ttsAvailable) {
      console.log('❌ TTS not available for speed change');
      return;
    }
    
    // Play with new speed using sequential system
    const playWithNewSpeed = async () => {
      try {
        // Stop any current audio first
        await OnlineTTS.stop();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const cleanText = stripEmojis(textToPlay);
        console.log('🎤 Playing with new speed:', newSpeed, 'Text length:', cleanText.length);
        
        setIsPlaying(true);
        setIsRevealTextPlaying(listeningPhase === 'reveal');
        
        await playAudioWithCaptions(cleanText);
        
        console.log('✅ Speed change playback completed');
        
        // Wait after completion
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('❌ Speed change playback error:', error);
      } finally {
        setIsPlaying(false);
        setIsRevealTextPlaying(false);
      }
    };
    
    // Start playing with new speed
    playWithNewSpeed();
  };

  const getCorrectFeedback = () => {
    const messages = [
      "🦄 MAGICAL! You earned a star! 🌟",
      "⭐ SPARKLY! Perfect!",
      "✨ WONDERFUL! Amazing!",
      "🎯 BEAUTIFUL! Great job!",
      "💫 BRILLIANT! Star earned!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => {
    if (attempt === 1) {
      return `💕 Not quite, magical friend! Listen carefully and try again! 🎧`;
    } else {
      return `🦄 Keep trying! Listen one more time to find the magic answer! 👂`;
    }
  };

  const getCharacterAnimation = () => {
    if (current.id.includes('star')) return 'animate-bounce';
    return 'animate-float';
  };

  const getEnvironmentIcon = () => {
    switch (current.id) {
      case 'rainbow_waterfall': return CloudRain;
      case 'fairy_friends': return Sparkles;
      case 'magic_flowers': return Flower;
      case 'crystal_cave': return Trees;
      default: return Sparkles;
    }
  };

  const EnvironmentIcon = getEnvironmentIcon();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn("w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 bg-gradient-to-br", current.bgColor, "flex flex-col")}>
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
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Stardust's Unicorn Magic</h2>
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
                  className="h-7 px-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 bg-pink-50 dark:bg-pink-800 hover:bg-pink-100 dark:hover:bg-pink-700 border border-pink-200 dark:border-pink-600 text-pink-800 dark:text-pink-100"
                  title={`Playback speed (works offline & online): ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}
                >
                  <Gauge className="w-3.5 h-3.5 mr-1 text-pink-600 dark:text-pink-200" />
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
                      accessibilityMode && "bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-700"
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
                      : "bg-white/80 dark:bg-gray-700 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
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
          
          {/* TTS Status Banner */}
          {ttsInitialized && ttsAvailable && (
            <div className="mb-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 justify-center">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-bold">
                  Stardust's voice is ready! Listen carefully to her magical words!
                </span>
              </div>
            </div>
          )}
          
          {/* Accessibility Mode Warning */}
          {accessibilityMode && (listeningPhase === 'listening' || listeningPhase === 'question') && (
            <div className="mb-2 bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-400 text-purple-900 dark:text-purple-200 px-4 py-2.5 rounded-lg shadow-md">
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
            <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500" />
          </Progress>
          
          {/* Live Caption Display - Only in reveal phase or accessibility mode */}
          {captionsEnabled && currentCaption && (listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode) && (
            <div className="mb-2 bg-black/80 text-white px-4 py-2 rounded-lg text-center text-sm sm:text-base font-semibold animate-fade-in">
              {currentCaption}
            </div>
          )}

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
                          ? 'text-pink-400 animate-pulse drop-shadow-lg' 
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
                  <div className="bg-purple-100/80 dark:bg-purple-900/60 rounded-2xl p-6 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-600 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-bounce" />
                      {(current as any).audioInstruction}
                    </h3>
                    
                    {/* Transcript (only in accessibility mode during listening phase) */}
                    {showTranscript && accessibilityMode && (
                      <div className="mb-4 bg-purple-50/90 dark:bg-purple-900/30 rounded-lg p-4 border-2 border-purple-300">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Accessibility Transcript:</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                          "{(current as any).audioText}"
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
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
                          "rounded-xl px-6 py-3 text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all",
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
                        Magic Hint? 🦄
                      </Button>
                    )}
                  </div>

                  {/* Replay Button */}
                  <div className="flex justify-center mb-2 sm:mb-2">
                    <Button 
                      onClick={handleReplayAudio}
                      disabled={replaysUsed >= maxReplays || isPlaying}
                      className={cn(
                        "rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-xs sm:text-xs md:text-sm",
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
                      {(shuffledChoices ?? (current as any).choices).map((choice: any, idx: number) => {
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
                              !showResult && "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-500 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-lg"
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
                          {attemptCount === 1 && (
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
                  <div className="bg-green-100/80 dark:bg-green-900/60 rounded-2xl p-6 backdrop-blur-sm border-2 border-green-300 dark:border-green-600 shadow-2xl">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2 sm:gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-purple-500 hover:text-purple-600 h-7 w-7 sm:h-8 sm:w-8 p-0"
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
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-2xl px-8 py-3"
                      >
                        Continue Magic! 🦄
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
                      className="rounded-lg sm:rounded-2xl md:rounded-3xl px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-xs sm:text-sm md:text-base"
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
                          <span className="hidden sm:inline">Continue Adventure! 🦄</span>
                          <span className="sm:hidden">Next 🦄</span>
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
                            ? 'text-pink-400 animate-pulse drop-shadow-lg' 
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
                  <div className="bg-purple-100/80 dark:bg-purple-900/60 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-600 shadow-xl">
                    <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400 animate-bounce" />
                      <span>{(current as any).audioInstruction}</span>
                    </h3>
                    
                    {/* Transcript (only in accessibility mode during listening phase) */}
                    {showTranscript && accessibilityMode && (
                      <div className="mb-3 bg-purple-50/90 dark:bg-purple-900/30 rounded-lg p-3 border-2 border-purple-300">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Accessibility Transcript:</span>
                        </div>
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium">
                          "{(current as any).audioText}"
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1.5">
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
                          "rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all",
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
                        Magic Hint? 🦄
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
                      {(shuffledChoices ?? (current as any).choices).map((choice: any, idx: number) => {
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
                              !showResult && "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-500 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md"
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
                          {attemptCount === 1 && (
                            <div className="mt-1 text-xs">
                              🏆 First try bonus!
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-purple-700 dark:text-purple-300 text-xs md:text-sm font-bold bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-2 border-2 border-purple-400 shadow-sm">
                            {getWrongFeedback(attemptCount)}
                          </div>
                          
                          {/* Retry Button - Desktop - COMPACT & VISIBLE */}
                          {retryMode && (
                            <div className="flex flex-col sm:flex-row justify-center items-stretch gap-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-2.5 border-2 border-gray-300 dark:border-gray-600 shadow-md">
                              <Button
                                onClick={handleRetry}
                                className="flex-1 sm:flex-none bg-gradient-to-r from-pink-500 via-pink-600 to-purple-500 hover:from-pink-600 hover:via-pink-700 hover:to-purple-600 text-white rounded-lg px-5 py-2 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-pink-300 animate-pulse-slow relative overflow-hidden"
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
                  <div className="bg-green-100/80 dark:bg-green-900/60 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-green-300 dark:border-green-600 shadow-xl">
                    <h3 className="text-sm md:text-base font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-purple-600 hover:text-purple-700 h-7 w-7 p-0"
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
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base"
                      >
                        Continue Magic! 🦄
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
                      className="rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base"
                    >
                      {stepIndex === storySteps.length - 1 ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Complete Magic Journey! ✨
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continue Magic! 🦄
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
            <Heart className="w-8 h-8 text-pink-400" />
          </div>
          <div className="hidden lg:block absolute top-1/2 left-4 animate-float-fast">
            <Flower className="w-7 h-7 text-purple-400" />
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

export default UnicornMagicAdventure;
