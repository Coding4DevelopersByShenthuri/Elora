import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Flower, Star, Volume2, Play, Zap, X, Ear, Gauge, RotateCcw } from 'lucide-react';
import HybridVoiceService, { STORY_VOICES } from '@/services/HybridVoiceService';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const TWINKLE_VOICE = STORY_VOICES.Twinkle;

const storySteps = [
  {
    id: 'intro',
    title: '🧚 Welcome to Fairy Garden!',
    text: 'Hello tiny friend! I am Twinkle the fairy!... Welcome to my secret garden where tiny magic happens everywhere!... You will see sparkly flowers, meet bug friends, and discover little wonders!... Your special job is to listen gently and collect THREE flower petals!... Ready to fly? Let\'s go!',
    emoji: '🧚',
    character: 'Twinkle',
    bgColor: 'from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900',
    interactive: false,
    wordCount: 54,
    duration: 32
  },
  {
    id: 'morning_dew',
    title: '💧 Sparkly Dewdrops',
    emoji: '💧',
    character: 'Twinkle',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Dewdrops shine like tiny diamonds',
    audioInstruction: 'Listen to what the dewdrops are like!',
    
    question: 'What do the dewdrops look like?',
    hint: 'Think about something sparkly',
    
    choices: [
      { text: 'Dewdrops shine like tiny diamonds', emoji: '💧💎', meaning: 'sparkly and pretty' },
      { text: 'Dewdrops are very dull', emoji: '💧😐', meaning: 'not shiny' },
      { text: 'Dewdrops are big puddles', emoji: '💧🌊', meaning: 'large water' }
    ],
    
    revealText: 'Beautiful! Look at the morning dewdrops on the leaves! They sparkle and shine just like tiny diamonds! When sunlight touches them, they glow with rainbow colors! Dewdrops are nature\'s little jewels!',
    
    maxReplays: 5,
    wordCount: 36,
    duration: 34
  },
  {
    id: 'ladybug_friend',
    title: '🐞 Ladybug Lucy',
    emoji: '🐞',
    character: 'Twinkle',
    bgColor: 'from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Hello little fairy friend',
    audioInstruction: 'Listen to the ladybug\'s greeting!',
    
    question: 'What does Ladybug Lucy say?',
    hint: 'It\'s a friendly hello',
    
    choices: [
      { text: 'Go away from here', emoji: '🐞❌', meaning: 'not friendly' },
      { text: 'Hello little fairy friend', emoji: '🐞👋', meaning: 'sweet greeting' },
      { text: 'I am very busy now', emoji: '🐞💼', meaning: 'too busy' }
    ],
    
    revealText: 'Sweet! A tiny red ladybug crawls up and says "Hello little fairy friend!" Ladybugs are so gentle and kind! Lucy has black spots on her red back! Can you count the spots? Making bug friends is wonderful!',
    
    maxReplays: 5,
    wordCount: 38,
    duration: 35
  },
  {
    id: 'blooming_flower',
    title: '🌸 Happy Flowers',
    emoji: '🌸',
    character: 'Twinkle',
    bgColor: 'from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'We grow with love and sunshine',
    audioInstruction: 'Listen to how flowers grow!',
    
    question: 'What helps flowers grow?',
    hint: 'Flowers need care',
    
    choices: [
      { text: 'We grow with love and sunshine', emoji: '🌸☀️', meaning: 'love and warmth' },
      { text: 'We never need anything', emoji: '🌸🚫', meaning: 'no care needed' },
      { text: 'We only grow in darkness', emoji: '🌸🌙', meaning: 'only night time' }
    ],
    
    revealText: 'Lovely! The pretty flowers smile and say "We grow with love and sunshine!" Just like you, flowers need care, kindness, and bright sunlight to grow big and beautiful! When we give love, everything blooms!',
    
    maxReplays: 5,
    wordCount: 38,
    duration: 36
  },
  {
    id: 'first_petal',
    title: '🌺 First Flower Petal',
    emoji: '🌺',
    character: 'Twinkle',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'true-false',
    
    audioText: 'Fairies are very small and gentle',
    audioInstruction: 'Listen to this fairy fact!',
    
    question: 'True or False: Fairies are very small and gentle?',
    hint: 'Think about Twinkle',
    
    choices: [
      { text: 'Fairies are very small and gentle', emoji: '✅', meaning: 'true - fairies are tiny and kind' },
      { text: 'False - Fairies are big and scary', emoji: '❌', meaning: 'incorrect - fairies are gentle' }
    ],
    
    revealText: 'Perfect! You earned your first petal! It\'s TRUE - fairies ARE very small and gentle! We flutter on tiny wings and speak in soft voices! Fairies love nature and kindness! Two more petals to collect!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 40,
    duration: 34
  },
  {
    id: 'butterfly_dance',
    title: '🦋 Butterfly Ballet',
    emoji: '🦋',
    character: 'Twinkle',
    bgColor: 'from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Dancing makes my heart happy',
    audioInstruction: 'Listen to why the butterfly dances!',
    
    question: 'Why does the butterfly dance?',
    hint: 'It\'s about feeling joyful',
    
    choices: [
      { text: 'Dancing makes my heart happy', emoji: '🦋💃', meaning: 'brings joy' },
      { text: 'I never dance at all', emoji: '🦋🚫', meaning: 'no dancing' },
      { text: 'Dancing is too tiring', emoji: '🦋😓', meaning: 'too hard' }
    ],
    
    revealText: 'Joyful! The butterfly twirls and says "Dancing makes my heart happy!" When we move to music or spin around, it fills us with happiness! Dancing is a beautiful way to show joy! Let\'s dance together!',
    
    maxReplays: 5,
    wordCount: 38,
    duration: 36
  },
  {
    id: 'second_petal',
    title: '✨ Second Flower Petal',
    emoji: '✨',
    character: 'Twinkle',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'inference',
    
    audioText: 'Small things can be very special',
    audioInstruction: 'Listen to the garden\'s wisdom!',
    
    question: 'What does the garden teach us?',
    hint: 'Size doesn\'t matter',
    
    choices: [
      { text: 'Only big things matter', emoji: '✨🏔️', meaning: 'size is important' },
      { text: 'Small things can be very special', emoji: '✨💝', meaning: 'tiny is wonderful' },
      { text: 'Nothing is ever special', emoji: '✨😞', meaning: 'nothing matters' }
    ],
    
    revealText: 'Wise! Another petal appears! "Small things can be very special!" A tiny seed becomes a flower, small acts of kindness change the world, and little fairies make big magic! Being small doesn\'t mean less important! One petal left!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 40,
    duration: 38
  },
  {
    id: 'final_petal',
    title: '🌼 Third Flower Petal',
    text: 'Wonderful! ... You found all three flower petals! ... (They\'re making a beautiful crown for you!) The whole garden celebrates your gentle listening! ... You are a MAGICAL friend! ... Twinkle is so happy you visited! ... You made the garden bloom brighter!',
    emoji: '🌼',
    character: 'Twinkle',
    bgColor: 'from-yellow-200 to-pink-200 dark:from-yellow-800 dark:to-pink-800',
    interactive: false,
    starsNeeded: 3,
    wordCount: 38,
    duration: 28
  },
  {
    id: 'celebration',
    title: '🎉 Garden Party!',
    text: 'Congratulations, dear friend! ... The WHOLE garden is having a party for YOU! ... Flowers are blooming, butterflies are dancing, and dewdrops are sparkling! ... You listened with such a gentle heart! ... You\'re always welcome in our fairy garden! ... Come visit again soon! ... Until next time, little friend! 🧚✨',
    emoji: '🎉',
    character: 'Twinkle',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 42,
    duration: 36
  }
];

const FairyGardenAdventure = ({ onClose, onComplete }: Props) => {
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
  
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('slow'); // Default to slow for better comprehension
  const [retryMode, setRetryMode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  
  const [currentSession, setCurrentSession] = useState<StorySession | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);

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
    };
    initializeVoice();
    
    const initSession = async () => {
      await KidsListeningAnalytics.initialize(userId);
      const session = KidsListeningAnalytics.startSession(userId, 'fairy-garden', 'Fairy Garden');
      setCurrentSession(session);
    };
    initSession();
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
  }, [stepIndex]);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const stripEmojis = (text: string): string => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{E0020}-\u{E007F}]/gu, '').trim();
  };

  const playAudioWithCaptions = async (text: string) => {
    try {
      const cleanText = stripEmojis(text);
      await HybridVoiceService.speak(cleanText, TWINKLE_VOICE, {
        speed: playbackSpeed
      });
    } catch (error) {
      setTtsAvailable(false);
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
          await playAudioWithCaptions((current as any).revealText);
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
            textToRead = "Congratulations tiny friend! ... The WHOLE fairy garden is celebrating YOU! ... Butterflies are dancing, flowers are singing sweet songs, and magical sparkles fill the air! ... You made the garden so happy with your gentle listening! You should feel SO proud! ... Give yourself fairy claps!";
          } else {
            textToRead = `Beautiful work, little one! ... You collected ${Math.floor(stars)} petal${Math.floor(stars) !== 1 ? 's' : ''}! ... The garden friends are so happy you tried gently! ... Twinkle is proud of you! ... Every tiny adventure helps us grow. Keep listening softly and you'll collect all the petals next time! 🌸`;
          }
        }
        
        try {
          await playAudioWithCaptions(textToRead);
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
      const timeBonus = Math.max(0, 300 - timeSpent) * 0.1;
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
      await playAudioWithCaptions((current as any).audioText);
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
        textToSpeak = "Congratulations tiny friend! ... The WHOLE fairy garden is celebrating YOU! ... Butterflies are dancing, flowers are singing sweet songs, and magical sparkles fill the air! ... You made the garden so happy with your gentle listening! You should feel SO proud! ... Give yourself fairy claps!";
      } else {
        textToSpeak = `Beautiful work, little one! ... You collected ${Math.floor(stars)} petal${Math.floor(stars) !== 1 ? 's' : ''}! ... The garden friends are so happy you tried gently! ... Twinkle is proud of you! ... Every tiny adventure helps us grow. Keep listening softly and you'll collect all the petals next time! 🌸`;
      }
    }
    
    if (textToSpeak && ttsAvailable) {
      setIsPlaying(true);
      try {
        await playAudioWithCaptions(textToSpeak);
      } catch (error) {
        console.log('TTS not available');
      }
      setIsPlaying(false);
    }
  };

  const getCorrectFeedback = () => {
    const messages = [
      "🧚 MAGICAL! You earned a petal! 🌺",
      "🌺 LOVELY! Perfect!",
      "✨ BEAUTIFUL! Amazing!",
      "🎯 SWEET! Great job!",
      "💫 WONDERFUL! Petal earned!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => {
    if (attempt === 1) {
      return `💕 Not quite, dear friend! Listen gently and try again! 🎧`;
    } else {
      return `🧚 Keep listening! Listen one more time to find the fairy answer! 👂`;
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
                <Flower className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Twinkle's Fairy Garden</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs bg-white/50 px-3 py-1 rounded-full">🌺 {stars}/3 Petals</div>
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
                      textToPlay = stars >= 3 ? "Congratulations tiny friend! ... The WHOLE fairy garden is celebrating YOU! ... Butterflies are dancing, flowers are singing sweet songs, and magical sparkles fill the air! ... You made the garden so happy with your gentle listening! You should feel SO proud! ... Give yourself fairy claps!" : `Beautiful work, little one! ... You collected ${Math.floor(stars)} petal${Math.floor(stars) !== 1 ? 's' : ''}! ... The garden friends are so happy you tried gently! ... Twinkle is proud of you! ... Every tiny adventure helps us grow. Keep listening softly and you'll collect all the petals next time! 🌸`;
                    } else {
                      textToPlay = current.text;
                    }
                  }
                  if (textToPlay && ttsAvailable) {
                    await HybridVoiceService.speak(textToPlay, TWINKLE_VOICE, { speed: newSpeed });
                  }
                } catch (error) {
                  console.log('Could not replay at new speed');
                }
              }} className="h-7 px-2 rounded-full text-xs bg-pink-50 border" title={`Playback speed: ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}>
                <Gauge className="w-3.5 h-3.5 mr-1" />
                {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
              </Button>
            </div>
          </div>

          <Progress value={progress} className="h-2 mb-3 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500" />
          </Progress>

          <div className="flex-1 overflow-y-auto pb-2">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="relative mb-2">
                <div className="text-5xl mb-2 animate-float">{current.emoji}</div>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star key={i} className={cn("w-5 h-5 transition-all", i < stars ? 'text-pink-400 animate-pulse' : 'text-gray-300 opacity-50')} />
                  ))}
                </div>
              </div>

              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-pink-100/80 rounded-2xl p-6 backdrop-blur-sm border-2 border-pink-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-pink-600 animate-bounce" />
                      {(current as any).audioInstruction}
                    </h3>
                    {audioWaveform && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 bg-pink-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold", isPlaying && "animate-pulse")}>
                        <Volume2 className="w-5 h-5 mr-2" />
                        {isPlaying ? 'Playing...' : `Listen Again (${replaysUsed} plays)`}
                      </Button>
                      {hasListened && (
                        <Button onClick={handleProceedToQuestion} className="bg-green-500 text-white rounded-xl px-6 py-3 font-bold animate-bounce">
                          Ready! ✓
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
                        Fairy Hint? 🧚
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-center mb-2">
                    <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xs", isPlaying && "animate-pulse")}>
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
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-pink-500 h-7 w-7 p-0">
                        <Volume2 className="w-3.5 h-3.5" />
                      </Button>
                    </h3>
                    <p className="text-sm leading-relaxed">{(current as any).revealText}</p>
                    <div className="mt-4 flex justify-center">
                      <Button onClick={handleNext} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl px-8 py-3">
                        Continue! 🧚
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
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-pink-600">
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
                    <Button onClick={handleNext} className="rounded-2xl px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-2xl">
                      {stepIndex === storySteps.length - 1 ? <><Zap className="w-4 h-4 mr-2 animate-pulse" />Complete! ✨</> : <><Play className="w-4 h-4 mr-2" />Continue 🧚</>}
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

export default FairyGardenAdventure;
