import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Shield, Star, Volume2, Play, Zap, X, Ear, Gauge, RotateCcw } from 'lucide-react';
import HybridVoiceService, { STORY_VOICES } from '@/services/HybridVoiceService';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const CAPTAIN_COURAGE_VOICE = STORY_VOICES.Captain;

const storySteps = [
  {
    id: 'intro',
    title: '🦸 Welcome to Hero Training!',
    text: 'Hello future superhero! I am Captain Courage, and welcome to Superhero School!... Today you\'ll learn how to be a real hero and help people!... You will train your powers, learn hero rules, and pass important tests!... Your heroic mission is to listen carefully and earn THREE hero badges!... Ready to become a hero? Let\'s start training!',
    emoji: '🦸',
    character: 'Captain',
    bgColor: 'from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900',
    interactive: false,
    wordCount: 60,
    duration: 36
  },
  {
    id: 'hero_motto',
    title: '💪 Hero Motto',
    emoji: '💪',
    character: 'Captain',
    bgColor: 'from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'With great power comes great responsibility',
    audioInstruction: 'Listen to the important hero motto!',
    
    question: 'What is our hero motto?',
    hint: 'It\'s about being responsible',
    
    choices: [
      { text: 'With great power comes great responsibility', emoji: '💪🛡️', meaning: 'being responsible with power' },
      { text: 'Heroes only care about winning', emoji: '💪🏆', meaning: 'just winning' },
      { text: 'Use power however you want', emoji: '💪🎭', meaning: 'no responsibility' }
    ],
    
    revealText: 'Excellent! All heroes must remember "With great power comes great responsibility!" This means when you have special abilities or strength, you must use them to help others, not hurt them! Being a hero is about making good choices!',
    
    maxReplays: 5,
    wordCount: 45,
    duration: 38
  },
  {
    id: 'helping_others',
    title: '❤️ Helping Hearts',
    emoji: '❤️',
    character: 'Captain',
    bgColor: 'from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'True heroes help people in need',
    audioInstruction: 'Listen to what real heroes do!',
    
    question: 'What do true heroes do?',
    hint: 'Think about helping others',
    
    choices: [
      { text: 'Heroes ignore people crying', emoji: '❤️😢', meaning: 'ignoring problems' },
      { text: 'True heroes help people in need', emoji: '❤️🤝', meaning: 'helping those who need it' },
      { text: 'Heroes only help themselves', emoji: '❤️🙅', meaning: 'selfish behavior' }
    ],
    
    revealText: 'Perfect! Captain Courage teaches "True heroes help people in need!" Whether someone dropped their books, feels sad, or is lost—heroes notice and offer help! Being kind and helpful makes you a hero every single day!',
    
    maxReplays: 5,
    wordCount: 42,
    duration: 37
  },
  {
    id: 'brave_heart',
    title: '🛡️ Courage Shield',
    emoji: '🛡️',
    character: 'Captain',
    bgColor: 'from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Bravery means facing your fears',
    audioInstruction: 'Listen to what bravery really means!',
    
    question: 'What does bravery mean?',
    hint: 'It\'s about being courageous',
    
    choices: [
      { text: 'Never being scared ever', emoji: '🛡️😎', meaning: 'no fear at all' },
      { text: 'Running from all problems', emoji: '🛡️🏃', meaning: 'avoiding everything' },
      { text: 'Bravery means facing your fears', emoji: '🛡️💪', meaning: 'being courageous despite fear' }
    ],
    
    revealText: 'Heroic! The shield shows "Bravery means facing your fears!" Being brave doesn\'t mean you\'re never scared—it means you do the right thing even when you feel afraid! Every hero has fears, but they face them with courage!',
    
    maxReplays: 5,
    wordCount: 45,
    duration: 38
  },
  {
    id: 'first_badge',
    title: '🏅 First Hero Badge',
    emoji: '🏅',
    character: 'Captain',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'true-false',
    
    audioText: 'Heroes never give up trying',
    audioInstruction: 'Listen to this hero truth!',
    
    question: 'True or False: Heroes never give up trying?',
    hint: 'Think about persistence',
    
    choices: [
      { text: 'Heroes never give up trying', emoji: '✅', meaning: 'true - heroes persevere' },
      { text: 'False - Heroes quit easily', emoji: '❌', meaning: 'incorrect - heroes persist' }
    ],
    
    revealText: 'Amazing! You earned your first hero badge! It\'s TRUE - heroes never give up trying! When something is hard, real heroes keep trying and never quit! They practice, learn from mistakes, and get stronger! Two more badges to earn!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 45,
    duration: 36
  },
  {
    id: 'teamwork_power',
    title: '🤝 Teamwork Training',
    emoji: '🤝',
    character: 'Captain',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: true,
    listeningFirst: true,
    
    audioText: 'Together we are stronger',
    audioInstruction: 'Listen to the teamwork lesson!',
    
    question: 'What does teamwork teach us?',
    hint: 'Working together makes us powerful',
    
    choices: [
      { text: 'Heroes always work alone', emoji: '🤝🚫', meaning: 'solo only' },
      { text: 'Together we are stronger', emoji: '🤝💪', meaning: 'united power' },
      { text: 'Teams are not important', emoji: '🤝😞', meaning: 'teamwork doesn\'t matter' }
    ],
    
    revealText: 'Powerful! The training reveals "Together we are stronger!" Even the mightiest heroes work with teams! When friends help each other and share their different talents, they can accomplish amazing things! Teamwork makes the dream work!',
    
    maxReplays: 5,
    wordCount: 42,
    duration: 37
  },
  {
    id: 'second_badge',
    title: '✨ Second Hero Badge',
    emoji: '✨',
    character: 'Captain',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'inference',
    
    audioText: 'Kindness is the greatest superpower',
    audioInstruction: 'Listen to the ultimate power!',
    
    question: 'What is the greatest superpower?',
    hint: 'It\'s not flying or strength',
    
    choices: [
      { text: 'Super speed is best', emoji: '✨⚡', meaning: 'physical speed' },
      { text: 'Kindness is the greatest superpower', emoji: '✨❤️', meaning: 'compassion and care' },
      { text: 'Being invisible is greatest', emoji: '✨👻', meaning: 'stealth ability' }
    ],
    
    revealText: 'Magnificent! Second badge earned! "Kindness is the greatest superpower!" You can have super strength or fly, but being kind to everyone is what makes a true hero! Kind words and actions change the world! One final badge!',
    
    maxReplays: 5,
    starsNeeded: 3,
    wordCount: 45,
    duration: 38
  },
  {
    id: 'final_badge',
    title: '🏆 Third Hero Badge',
    text: 'Incredible! ... YES! ... You earned all three hero badges! ... (You\'re officially a superhero now!) You learned about responsibility, courage, and kindness! ... You are a TRUE HERO! ... Captain Courage is so proud of you! ... You\'ll help make the world better!',
    emoji: '🏆',
    character: 'Captain',
    bgColor: 'from-gold-200 to-amber-200 dark:from-gold-800 dark:to-amber-800',
    interactive: false,
    starsNeeded: 3,
    wordCount: 45,
    duration: 30
  },
  {
    id: 'celebration',
    title: '🎉 Hero Graduation!',
    text: 'Congratulations, SUPERHERO! ... You graduated from Hero School! ... You learned the most important hero lessons—helping others, staying brave, never giving up, and being kind! ... The world needs heroes like YOU! ... Remember, being a hero happens every day through small kind actions! ... Go forth and be amazing! 🦸✨',
    emoji: '🎉',
    character: 'Captain',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 50,
    duration: 40
  }
];

const SuperheroSchoolAdventure = ({ onClose, onComplete }: Props) => {
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
      const session = KidsListeningAnalytics.startSession(userId, 'superhero-school', 'Superhero School');
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
      
      await HybridVoiceService.speak(cleanText, CAPTAIN_COURAGE_VOICE, {
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
            textToRead = "Congratulations superhero! ... The WHOLE academy is celebrating YOU! ... Heroes are cheering, badges are shining, and courage fills the air! ... You made the hero world proud with your super listening! You should feel SO powerful! ... Give yourself a hero salute!";
          } else {
            textToRead = `Great training, young hero! ... You earned ${Math.floor(stars)} badge${Math.floor(stars) !== 1 ? 's' : ''}! ... The academy is inspired by your effort! ... Captain Courage is proud of you! ... Every hero learns through practice. Keep training and you'll earn all the badges next time! 🦸`;
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
        textToSpeak = "Congratulations superhero! ... The WHOLE academy is celebrating YOU! ... Heroes are cheering, badges are shining, and courage fills the air! ... You made the hero world proud with your super listening! You should feel SO powerful! ... Give yourself a hero salute!";
      } else {
        textToSpeak = `Great training, young hero! ... You earned ${Math.floor(stars)} badge${Math.floor(stars) !== 1 ? 's' : ''}! ... The academy is inspired by your effort! ... Captain Courage is proud of you! ... Every hero learns through practice. Keep training and you'll earn all the badges next time! 🦸`;
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
      "🦸 HEROIC! You earned a badge! 🏅",
      "🏅 SUPER! Perfect hero!",
      "✨ POWERFUL! Amazing!",
      "🎯 CHAMPION! Great work!",
      "💫 MIGHTY! Badge earned!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => {
    if (attempt === 1) {
      return `💪 Not quite, hero! Listen carefully and try again! 🎧`;
    } else {
      return `🦸 Keep training! Listen one more time to find the hero answer! 👂`;
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
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Captain Courage's Hero School</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs bg-white/50 px-3 py-1 rounded-full">🏅 {stars}/3 Badges</div>
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
                      textToPlay = stars >= 3 ? "Congratulations superhero! ... The WHOLE academy is celebrating YOU! ... Heroes are cheering, badges are shining, and courage fills the air! ... You made the hero world proud with your super listening! You should feel SO powerful! ... Give yourself a hero salute!" : `Great training, young hero! ... You earned ${Math.floor(stars)} badge${Math.floor(stars) !== 1 ? 's' : ''}! ... The academy is inspired by your effort! ... Captain Courage is proud of you! ... Every hero learns through practice. Keep training and you'll earn all the badges next time! 🦸`;
                    } else {
                      textToPlay = current.text;
                    }
                  }
                  if (textToPlay && ttsAvailable) {
                    await HybridVoiceService.speak(textToPlay, CAPTAIN_COURAGE_VOICE, { speed: newSpeed });
                  }
                } catch (error) {
                  console.log('Could not replay at new speed');
                }
              }} className="h-7 px-2 rounded-full text-xs bg-blue-50 border" title={`Playback speed: ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}>
                <Gauge className="w-3.5 h-3.5 mr-1" />
                {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
              </Button>
            </div>
          </div>

          <Progress value={progress} className="h-2 mb-3 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full transition-all duration-500" />
          </Progress>

          <div className="flex-1 overflow-y-auto pb-2">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="relative mb-2">
                <div className="text-5xl mb-2 animate-float">{current.emoji}</div>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star key={i} className={cn("w-5 h-5 transition-all", i < stars ? 'text-blue-400 animate-pulse' : 'text-gray-300 opacity-50')} />
                  ))}
                </div>
              </div>

              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-blue-100/80 rounded-2xl p-6 backdrop-blur-sm border-2 border-blue-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
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
                      <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold", isPlaying && "animate-pulse")}>
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
                        Hero Hint? 🦸
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-center mb-2">
                    <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-xs", isPlaying && "animate-pulse")}>
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
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-blue-500 h-7 w-7 p-0">
                        <Volume2 className="w-3.5 h-3.5" />
                      </Button>
                    </h3>
                    <p className="text-sm leading-relaxed">{(current as any).revealText}</p>
                    <div className="mt-4 flex justify-center">
                      <Button onClick={handleNext} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl px-8 py-3">
                        Continue! 🦸
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
                    <Button onClick={handleNext} className="rounded-2xl px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-2xl">
                      {stepIndex === storySteps.length - 1 ? <><Zap className="w-4 h-4 mr-2 animate-pulse" />Complete! ✨</> : <><Play className="w-4 h-4 mr-2" />Continue 🦸</>}
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

export default SuperheroSchoolAdventure;
