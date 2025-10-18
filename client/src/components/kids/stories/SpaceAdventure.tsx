import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Rocket, Star, Volume2, Play, Zap, X, Ear, Award, Eye, Gauge, RotateCcw, FileText, Download } from 'lucide-react';
import HybridVoiceService, { STORY_VOICES, type DownloadStatus } from '@/services/HybridVoiceService';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

// Cosmo's unique voice profile
const COSMO_VOICE = STORY_VOICES.Cosmo;

const storySteps = [
  {
    id: 'intro',
    title: '🚀 Welcome to Space!',
    text: 'Hello space explorer! I am Cosmo the astronaut, and I\'m thrilled you\'re joining me!... Today, we\'re blasting off on an incredible journey through the stars and planets!... You will meet friendly aliens, discover amazing space secrets, and explore the whole galaxy!... Your mission is to listen very carefully to what you hear, and answer questions to collect THREE magic stars!... Ready for lift-off? Let\'s begin our cosmic adventure together!',
    emoji: '👨‍🚀',
    character: 'Cosmo',
    bgColor: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
    interactive: false,
    wordCount: 65,
    duration: 38
  },
  {
    id: 'rocket_launch',
    title: '🚀 Blast Off!',
    emoji: '🚀',
    character: 'Cosmo',
    bgColor: 'from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'We are flying to the stars',
    audioInstruction: 'Listen to what we shout as we blast off!',
    
    question: 'Where are we flying in our rocket?',
    hint: 'We\'re going up high into space',
    
    choices: [
      { text: 'We are going swimming', emoji: '🏊', meaning: 'in the water' },
      { text: 'We are flying to the stars', emoji: '🚀✨', meaning: 'up to space' },
      { text: 'We are staying on Earth', emoji: '🌍', meaning: 'not leaving' }
    ],
    
    revealText: '3... 2... 1... BLAST OFF! Our rocket is zooming into space! Can you feel it? We shout "We are flying to the stars!" Say it with me! The Earth is getting smaller below us. Have you ever been on a really fast ride? This is even faster!',
    
    maxReplays: 5,
    wordCount: 45,
    duration: 38
  },
  {
    id: 'friendly_alien',
    title: '👽 Alien Friend',
    emoji: '👽',
    character: 'Cosmo',
    bgColor: 'from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Hello new friend from Earth',
    audioInstruction: 'Listen to how the friendly alien greets us!',
    
    question: 'What does the friendly alien say to us?',
    hint: 'The alien is being very nice and welcoming',
    
    choices: [
      { text: 'Go away right now', emoji: '👽❌', meaning: 'unfriendly and mean' },
      { text: 'I am scared of you', emoji: '👽😰', meaning: 'frightened' },
      { text: 'Hello new friend from Earth', emoji: '👽👋', meaning: 'friendly greeting' }
    ],
    
    revealText: 'Incredible! Look, a friendly green alien is waving at us! The alien smiles and says "Hello new friend from Earth!" Can you say that back? Let\'s wave and greet them! It\'s wonderful to make new friends, even in space! This alien has big eyes and loves to smile!',
    
    maxReplays: 5,
    wordCount: 48,
    duration: 38
  },
  {
    id: 'planet_rings',
    title: '🪐 Beautiful Planet',
    emoji: '🪐',
    character: 'Cosmo',
    bgColor: 'from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'My rings make me special',
    audioInstruction: 'Listen to what the planet is proud of!',
    
    question: 'What makes this planet feel special?',
    hint: 'It\'s something beautiful around the planet',
    
    choices: [
      { text: 'My rings make me special', emoji: '🪐💍', meaning: 'beautiful rings' },
      { text: 'I have no rings at all', emoji: '🌑', meaning: 'plain and simple' },
      { text: 'I am very boring', emoji: '😔', meaning: 'not interesting' }
    ],
    
    revealText: 'WOW! Look at this gorgeous planet with sparkly rings! The planet proudly says "My rings make me special!" Can you repeat that? The rings spin around like a colorful hula hoop! Everyone is special in their own way, just like this amazing planet with its beautiful rings!',
    
    maxReplays: 5,
    wordCount: 50,
    duration: 40
  },
  {
    id: 'first_star',
    title: '⭐ First Cosmic Star',
    emoji: '⭐',
    character: 'Cosmo',
    bgColor: 'from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'true-false',
    
    audioText: 'Stars twinkle in the night sky',
    audioInstruction: 'Listen to this space fact!',
    
    question: 'True or False: Stars twinkle in the night sky?',
    hint: 'Think about when you see stars',
    
    choices: [
      { text: 'Stars twinkle in the night sky', emoji: '✅', meaning: 'true - we see them sparkle' },
      { text: 'False - Stars never twinkle', emoji: '❌', meaning: 'incorrect - they do twinkle' }
    ],
    
    revealText: 'Fantastic! WOW! We found our first glowing space star! You\'re being such a brilliant listener! It\'s TRUE - stars DO twinkle in the night sky, making beautiful patterns! They guide spaceships and make the darkness sparkle! Have you made a wish on a star? Two more stars to collect!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 50,
    duration: 32
  },
  {
    id: 'moon_landing',
    title: '🌙 Moon Adventure',
    emoji: '🌙',
    character: 'Cosmo',
    bgColor: 'from-gray-100 to-slate-100 dark:from-gray-900 dark:to-slate-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'I can jump so high here',
    audioInstruction: 'Listen to what we can do on the moon!',
    
    question: 'What special thing can we do on the moon?',
    hint: 'The moon has less gravity than Earth',
    
    choices: [
      { text: 'I cannot move at all', emoji: '🌙🚫', meaning: 'stuck in place' },
      { text: 'I can jump so high here', emoji: '🌙⬆️', meaning: 'jumping really high' },
      { text: 'I am very heavy here', emoji: '🌙⬇️', meaning: 'weighed down' }
    ],
    
    revealText: 'Amazing! We landed on the moon! It\'s covered in soft gray dust! On the moon we say "I can jump so high here!" Can you pretend to jump? BOING! We can bounce like we\'re on a trampoline but even higher! The moon\'s lower gravity makes us super jumpers!',
    
    maxReplays: 5,
    wordCount: 52,
    duration: 40
  },
  {
    id: 'second_star',
    title: '✨ Second Shining Star',
    emoji: '✨',
    character: 'Cosmo',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'inference',
    
    audioText: 'Stars are happy when explorers visit space',
    audioInstruction: 'Listen to why stars shine brightly!',
    
    question: 'Why are stars shining so brightly?',
    hint: 'Think about how stars feel about space explorers',
    
    choices: [
      { text: 'They want to hide away', emoji: '✨🙈', meaning: 'shy and hiding' },
      { text: 'Stars are happy when explorers visit space', emoji: '✨😊', meaning: 'joyful and welcoming' },
      { text: 'They are feeling very cold', emoji: '✨❄️', meaning: 'chilly temperature' }
    ],
    
    revealText: 'Wonderful! You\'re listening so carefully! Another star appeared near the moon crater! Stars are happy when explorers visit space - they love having visitors! (They\'re winking at you right now!) Just one more star to go! We\'re almost there, space explorer!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 45,
    duration: 35
  },
  {
    id: 'constellation',
    title: '⭐ Star Patterns',
    emoji: '🔭',
    character: 'Cosmo',
    bgColor: 'from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'We shine bright together',
    audioInstruction: 'Listen to what the star pattern says!',
    
    question: 'What do the stars say about being together?',
    hint: 'They are happy to be close to each other',
    
    choices: [
      { text: 'We hide from each other', emoji: '⭐🙈', meaning: 'staying apart' },
      { text: 'We are always alone', emoji: '⭐😢', meaning: 'lonely and separated' },
      { text: 'We shine bright together', emoji: '⭐✨', meaning: 'united and strong' }
    ],
    
    revealText: 'Beautiful! Look at those amazing star patterns in the sky! They make pictures like connect-the-dots! The stars say "We shine bright together!" Can you say that? Friends are better together, just like stars! Teamwork makes us all shine brighter!',
    
    maxReplays: 5,
    wordCount: 45,
    duration: 38
  },
  {
    id: 'final_star',
    title: '🌟 Third Magic Star',
    text: 'Hooray! ... YES! YES! YES! ... We collected all three magic stars! ... (YOU did it, amazing space explorer!) They\'re creating a beautiful star bridge across the galaxy, lighting up the whole universe! ... You are a FANTASTIC cosmic adventurer! ... I\'m so proud of your careful listening and brave exploring!',
    emoji: '🌟',
    character: 'Cosmo',
    bgColor: 'from-yellow-200 to-amber-200 dark:from-yellow-800 dark:to-amber-800',
    interactive: false,
    starsNeeded: 3,
    wordCount: 45,
    duration: 30
  },
  {
    id: 'celebration',
    title: '🎉 Space Hero Celebration!',
    text: 'Congratulations, SPACE HERO! ... You helped Cosmo complete the mission! ... All the stars are shining brightly, and the WHOLE galaxy is celebrating YOUR amazing adventure! ... Aliens are dancing, planets are spinning with joy, and rockets are doing loop-de-loops! ... You listened so well! ... You\'re a SUPERSTAR! ... Give yourself the biggest space high-five! 🙌✨',
    emoji: '🎉',
    character: 'Cosmo',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 48,
    duration: 40
  }
];

const SpaceAdventure = ({ onClose, onComplete }: Props) => {
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
      
      if (!available) {
        console.warn('No voice synthesis available');
        setShowTranscript(true);
      }
    };
    initializeVoice();
    
    const unsubscribe = HybridVoiceService.onDownloadProgress((status) => {
      setDownloadStatus(status);
      if (!status.downloading && status.progress === 100) {
        setTtsAvailable(true);
      }
    });
    
    const initSession = async () => {
      await KidsListeningAnalytics.initialize(userId);
      const session = KidsListeningAnalytics.startSession(
        userId,
        'space-adventure',
        'Space Adventure'
      );
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
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
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
      
      await HybridVoiceService.speak(
        cleanText,
        COSMO_VOICE,
        {
          speed: playbackSpeed,
          showCaptions: allowCaptions,
          onCaptionUpdate: allowCaptions ? setCurrentCaption : () => {}
        }
      );
    } catch (error) {
      console.log('Voice synthesis failed');
      setTtsAvailable(false);
      if (listeningPhase === 'reveal' || !current.listeningFirst) {
        setShowTranscript(true);
      }
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
            textToRead = "Congratulations space explorer! ... The WHOLE galaxy is celebrating YOU! ... Aliens are cheering, stars are glowing brightly, and cosmic magic fills the universe! ... You made the cosmos proud with your stellar listening! You should feel SO amazing! ... Give yourself a cosmic high-five!";
          } else {
            textToRead = `Great mission, young astronaut! ... You collected ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The galaxy is impressed by your bravery! ... Cosmo is proud of you! ... Every space journey teaches us something. Keep exploring and you'll collect all the stars next time! 🚀`;
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
        KidsListeningAnalytics.completeSession(
          userId,
          currentSession,
          score,
          stars
        );
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
      
      setTimeout(() => {
        setListeningPhase('reveal');
      }, 2500);
      
      setTimeout(() => {
        handleNext();
      }, 5000);
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
        textToSpeak = "Congratulations space explorer! ... The WHOLE galaxy is celebrating YOU! ... Aliens are cheering, stars are glowing brightly, and cosmic magic fills the universe! ... You made the cosmos proud with your stellar listening! You should feel SO amazing! ... Give yourself a cosmic high-five!";
      } else {
        textToSpeak = `Great mission, young astronaut! ... You collected ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The galaxy is impressed by your bravery! ... Cosmo is proud of you! ... Every space journey teaches us something. Keep exploring and you'll collect all the stars next time! 🚀`;
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
      "🚀 COSMIC! You earned a star! 🌟",
      "⭐ STELLAR! Perfect listening!",
      "✨ OUT OF THIS WORLD! Amazing!",
      "🎯 PERFECT! Great space explorer!",
      "💫 BRILLIANT! Star earned!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => {
    if (attempt === 1) {
      return `💪 Not quite, space explorer! Listen carefully and try again! 🎧`;
    } else {
      return `🚀 Keep exploring! Listen one more time to find the answer! 👂`;
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
            className="h-10 w-10 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          >
            <X className="w-5 h-5 text-gray-700 hover:text-gray-900" />
          </Button>
        </div>

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Cosmo's Space Adventure</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                ⭐ {stars}/3 Stars
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
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
                          textToPlay = stars >= 3 ? "Congratulations space explorer! ... The WHOLE galaxy is celebrating YOU! ... Aliens are cheering, stars are glowing brightly, and cosmic magic fills the universe! ... You made the cosmos proud with your stellar listening! You should feel SO amazing! ... Give yourself a cosmic high-five!" : `Great mission, young astronaut! ... You collected ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... The galaxy is impressed by your bravery! ... Cosmo is proud of you! ... Every space journey teaches us something. Keep exploring and you'll collect all the stars next time! 🚀`;
                        } else {
                          textToPlay = current.text;
                        }
                      }
                      if (textToPlay && ttsAvailable) {
                        await HybridVoiceService.speak(stripEmojis(textToPlay), COSMO_VOICE, { speed: newSpeed, showCaptions: captionsEnabled, onCaptionUpdate: setCurrentCaption });
                      }
                    } catch (error) {
                      console.log('Could not replay at new speed');
                    }
                  }}
                  className="h-7 px-2 rounded-full text-xs bg-purple-50 dark:bg-purple-900/30 border border-purple-200"
                  title={`Playback speed: ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}
                >
                  <Gauge className="w-3.5 h-3.5 mr-1" />
                  {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
                </Button>
                
                {(listeningPhase === 'listening' || listeningPhase === 'question') && current.listeningFirst && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAccessibilityMode(!accessibilityMode);
                      if (!accessibilityMode) {
                        setShowTranscript(true);
                        setCaptionsEnabled(true);
                      }
                    }}
                    className={cn(
                      "h-7 px-2 rounded-full text-xs",
                      accessibilityMode && "bg-orange-100 dark:bg-orange-900 border border-orange-300"
                    )}
                  >
                    👂 {accessibilityMode ? 'ON' : 'Help'}
                  </Button>
                )}
                
                {(listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTranscript(!showTranscript)}
                      className={cn(
                        "h-7 w-7 p-0 rounded-full",
                        showTranscript && "bg-blue-100 dark:bg-blue-900"
                      )}
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCaptionsEnabled(!captionsEnabled)}
                      className={cn(
                        "h-7 w-7 p-0 rounded-full",
                        captionsEnabled && "bg-purple-100 dark:bg-purple-900"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {downloadStatus?.downloading && (
            <div className="mb-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2.5 rounded-lg shadow-lg">
              <div className="flex items-center gap-3 mb-1.5">
                <Download className="w-4 h-4 animate-bounce" />
                <span className="text-xs sm:text-sm font-bold">
                  Downloading Space Voices... {Math.round(downloadStatus.progress)}%
                </span>
              </div>
              <Progress value={downloadStatus.progress} className="h-1.5 bg-white/30" />
            </div>
          )}
          
          {accessibilityMode && (listeningPhase === 'listening' || listeningPhase === 'question') && (
            <div className="mb-2 bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-400 text-orange-900 dark:text-orange-200 px-4 py-2.5 rounded-lg">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-lg">👂</span>
                <div className="text-xs sm:text-sm">
                  <strong>Accessibility Mode:</strong> Text shown. Try listening when possible!
                </div>
              </div>
            </div>
          )}
          
          {captionsEnabled && currentCaption && (listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode) && (
            <div className="mb-2 bg-black/80 text-white px-4 py-2 rounded-lg text-center text-sm sm:text-base font-semibold">
              {currentCaption}
            </div>
          )}

          <Progress value={progress} className="h-2 mb-3 sm:mb-4 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-500" />
          </Progress>

          <div className="flex-1 overflow-y-auto pb-2 sm:pb-4">
            <div className="sm:hidden text-center h-full flex flex-col justify-center">
              <div className="relative mb-2">
                <div className={cn("text-5xl sm:text-6xl mb-2", getCharacterAnimation())}>
                  {current.emoji}
                </div>
                
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500",
                        i < stars ? 'text-yellow-400 animate-pulse' : 'text-gray-300 opacity-50'
                      )} 
                    />
                  ))}
                </div>
              </div>

              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-purple-100/80 dark:bg-purple-900/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-purple-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-purple-600 animate-bounce" />
                      {(current as any).audioInstruction}
                    </h3>
                    
                    {showTranscript && accessibilityMode && (
                      <div className="mb-4 bg-orange-50/90 dark:bg-orange-900/30 rounded-lg p-4 border-2 border-orange-300">
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                          "{(current as any).audioText}"
                        </p>
                      </div>
                    )}
                    
                    {audioWaveform && !(showTranscript && accessibilityMode) && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-purple-500 rounded-full animate-waveform"
                            style={{ height: '40px', animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <Button 
                        onClick={handleReplayAudio}
                        disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                        className={cn(
                          "rounded-xl px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold",
                          isPlaying && "animate-pulse"
                        )}
                      >
                        <Volume2 className="w-5 h-5 mr-2" />
                        {isPlaying ? 'Playing...' : `Listen Again (${replaysUsed} plays)`}
                      </Button>
                      
                      {hasListened && (
                        <Button
                          onClick={handleProceedToQuestion}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-3 font-bold animate-bounce"
                        >
                          I'm Ready! ✓
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {current.listeningFirst && listeningPhase === 'question' && (
                <div className="space-y-2 max-w-4xl mx-auto w-full">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5 border border-yellow-200">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1.5">
                      {(current as any).question}
                    </h4>
                    {showHint ? (
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        💡 {(current as any).hint}
                      </p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs"
                      >
                        Need a hint? 🚀
                      </Button>
                    )}
                  </div>

                  <div className="flex justify-center mb-2">
                    <Button 
                      onClick={handleReplayAudio}
                      disabled={replaysUsed >= maxReplays || isPlaying}
                      className={cn(
                        "rounded-xl px-5 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xs",
                        isPlaying && "animate-pulse"
                      )}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      {isPlaying ? 'Listening...' : '🔊 Listen'}
                    </Button>
                  </div>

                  {(current as any).choices && (
                    <div className="grid grid-cols-1 gap-2.5">
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
                              "rounded-lg px-3 py-2.5 text-xs font-bold h-auto min-h-[55px]",
                              showResult && isCorrect && "bg-green-500 text-white animate-bounce",
                              showResult && !isCorrect && "bg-red-500 text-white",
                              !showResult && "bg-white/90 text-gray-700 border-2 border-gray-200"
                            )}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-lg">{choice.emoji}</span>
                              <div className="flex-1 text-left">
                                <p className="font-bold text-xs">{choice.text}</p>
                                <p className="text-xs opacity-70">{choice.meaning}</p>
                              </div>
                              {showResult && isCorrect && (
                                <Award className="w-4 h-4 text-yellow-300 animate-spin" />
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {showFeedback && (
                    <div className="mt-2 animate-fade-in">
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
                              <Button
                                onClick={handleRetry}
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg px-4 py-2.5 text-sm font-bold"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Try Again
                              </Button>
                              <Button
                                onClick={handleNext}
                                variant="outline"
                                className="rounded-lg px-4 py-2.5 text-sm"
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

              {current.listeningFirst && listeningPhase === 'reveal' && (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  <div className="bg-green-100/80 dark:bg-green-900/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-green-300">
                    <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-blue-500 h-7 w-7 p-0">
                        <Volume2 className="w-3.5 h-3.5" />
                      </Button>
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                      {(current as any).revealText}
                    </p>
                    <div className="mt-4 flex justify-center">
                      <Button 
                        onClick={handleNext} 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl px-8 py-3"
                      >
                        Continue! 🚀
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!current.listeningFirst && (
                <>
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 mb-4 backdrop-blur-sm border-2 border-white/20 shadow-2xl max-w-4xl mx-auto">
                    <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-blue-600">
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                      {current.text}
                    </p>
                    <div className="flex justify-center gap-3 mt-4 text-sm text-gray-500">
                      <span>📝 {current.wordCount}</span>
                      <span>⏱️ {current.duration}s</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleNext} 
                      className="rounded-2xl px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold shadow-2xl"
                    >
                      {stepIndex === storySteps.length - 1 ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Complete! ✨
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Continue 🚀
                        </>
                      )}
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
        .animate-waveform {
          animation: waveform 0.6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SpaceAdventure;
