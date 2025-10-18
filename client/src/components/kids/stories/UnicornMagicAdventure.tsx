import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Star, Volume2, Play, Zap, X, Ear, Award, Gauge, RotateCcw, FileText, Heart } from 'lucide-react';
import HybridVoiceService, { STORY_VOICES, type DownloadStatus } from '@/services/HybridVoiceService';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

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
    
    revealText: 'Beautiful! These flowers are singing a sweet song! They say "Love makes everything bloom!" When we show love and kindness, everything grows better! The flowers smile when we\'re nice! Can you smell how sweet they are?',
    
    maxReplays: 5,
    wordCount: 40,
    duration: 36
  },
  {
    id: 'first_star',
    title: '⭐ First Magic Star',
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
      { text: 'False - Unicorns have no horns', emoji: '❌', meaning: 'incorrect - they do have horns' }
    ],
    
    revealText: 'Hooray! We found our first sparkly star! You\'re listening so well! It\'s TRUE - unicorns DO have magical horns! My horn can make magic and spread happiness! Have you ever imagined riding a unicorn? Two more stars to find!',
    
    maxReplays: 5,
    starsNeeded: 3,
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
    
    revealText: 'Amazing! We\'re inside a sparkling crystal cave! The crystals glow and whisper "Dreams can come true here!" If you believe in magic and work hard, your dreams can happen! What do you dream about? Crystals are so pretty!',
    
    maxReplays: 5,
    wordCount: 42,
    duration: 37
  },
  {
    id: 'second_star',
    title: '✨ Second Shining Star',
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
    
    revealText: 'Wonderful! Another star appeared! The magic tells us "Magic happens when we believe!" When you believe in yourself and in magic, amazing things can happen! Just like how you\'re collecting stars today! One more star to go!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 42,
    duration: 36
  },
  {
    id: 'final_star',
    title: '🌟 Third Magic Star',
    text: 'Yay! ... We did it! ... All three magic stars are glowing! ... (You made them shine so bright!) The whole kingdom is celebrating because of YOU! ... You are an AMAZING magical explorer! ... Stardust is so proud of you! ... You spread so much magic today!',
    emoji: '🌟',
    character: 'Stardust',
    bgColor: 'from-yellow-200 to-pink-200 dark:from-yellow-800 dark:to-pink-800',
    interactive: false,
    starsNeeded: 3,
    wordCount: 40,
    duration: 28
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
      const session = KidsListeningAnalytics.startSession(userId, 'unicorn-magic', 'Unicorn Magic');
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
      
      await HybridVoiceService.speak(cleanText, STARDUST_VOICE, {
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
            textToRead = "Congratulations magical friend! ... The WHOLE enchanted kingdom is celebrating YOU! ... Unicorns are dancing, rainbows are glowing, and pure magic fills the sky! ... You made the magical world so proud with your wonderful listening! You should feel SO special! ... Give yourself a magical twirl!";
          } else {
            textToRead = `Beautiful work, little dreamer! ... You collected ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The unicorns are happy you tried your best! ... Rainbow is proud of you! ... Every magical journey helps us learn. Keep believing and you'll collect all the stars next time! 🦄`;
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
        textToSpeak = "Congratulations magical friend! ... The WHOLE enchanted kingdom is celebrating YOU! ... Unicorns are dancing, rainbows are glowing, and pure magic fills the sky! ... You made the magical world so proud with your wonderful listening! You should feel SO special! ... Give yourself a magical twirl!";
      } else {
        textToSpeak = `Beautiful work, little dreamer! ... You collected ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The unicorns are happy you tried your best! ... Rainbow is proud of you! ... Every magical journey helps us learn. Keep believing and you'll collect all the stars next time! 🦄`;
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
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs bg-white/50 px-3 py-1 rounded-full">⭐ {stars}/3 Stars</div>
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
                      textToPlay = stars >= 3 ? "Congratulations magical friend! ... The WHOLE enchanted kingdom is celebrating YOU! ... Unicorns are dancing, rainbows are glowing, and pure magic fills the sky! ... You made the magical world so proud with your wonderful listening! You should feel SO special! ... Give yourself a magical twirl!" : `Beautiful work, little dreamer! ... You collected ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The unicorns are happy you tried your best! ... Rainbow is proud of you! ... Every magical journey helps us learn. Keep believing and you'll collect all the stars next time! 🦄`;
                    } else {
                      textToPlay = current.text;
                    }
                  }
                  if (textToPlay && ttsAvailable) {
                    await HybridVoiceService.speak(stripEmojis(textToPlay), STARDUST_VOICE, { speed: newSpeed, showCaptions: captionsEnabled, onCaptionUpdate: setCurrentCaption });
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
                  <div className="bg-purple-100/80 rounded-2xl p-6 backdrop-blur-sm border-2 border-purple-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-purple-600 animate-bounce" />
                      {(current as any).audioInstruction}
                    </h3>
                    {audioWaveform && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 bg-purple-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
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
                        Magic Hint? 🦄
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
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-purple-500 h-7 w-7 p-0">
                        <Volume2 className="w-3.5 h-3.5" />
                      </Button>
                    </h3>
                    <p className="text-sm leading-relaxed">{(current as any).revealText}</p>
                    <div className="mt-4 flex justify-center">
                      <Button onClick={handleNext} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl px-8 py-3">
                        Continue Magic! 🦄
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
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-purple-600">
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
                      {stepIndex === storySteps.length - 1 ? <><Zap className="w-4 h-4 mr-2 animate-pulse" />Complete! ✨</> : <><Play className="w-4 h-4 mr-2" />Continue 🦄</>}
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

export default UnicornMagicAdventure;
