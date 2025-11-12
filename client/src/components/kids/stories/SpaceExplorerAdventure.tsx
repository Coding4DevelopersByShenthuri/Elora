import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Rocket, Satellite, Globe, Gauge, Volume2, X, Award, Zap, Play, FileText, RotateCcw } from 'lucide-react';
import OnlineTTS, { STORY_VOICES } from '@/services/OnlineTTS';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

// Unique online voice for teen space story
const ASTRA_VOICE = STORY_VOICES.AstraTeen;

const storySteps = [
  {
    id: 'intro',
    title: '🚀 Welcome to Space Explorer',
    text: "Mission briefing: You're joining Orbital Station Vega as a junior specialist. Today you'll practice real mission skills: listening precisely, thinking critically, and making safe choices.", 
    emoji: '🚀',
    character: 'Mission Control',
    bgColor: 'from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900',
    interactive: false,
    wordCount: 70,
    duration: 35
  },
  {
    id: 'comm_protocol',
    title: '🛰️ Comms Check',
    emoji: '🛰️',
    character: 'Mission Control',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Communications require clarity and acknowledgement',
    audioInstruction: 'Listen to the comms protocol principle.',
    question: 'What do clear communications require?',
    hint: 'Think about confirmation of instructions',
    choices: [
      { text: 'Communications require speed and slang', emoji: '🏎️💬', meaning: 'fast but unclear' },
      { text: 'Communications require clarity and acknowledgement', emoji: '🛰️✅', meaning: 'precise and confirmed' },
      { text: 'Communications require silence', emoji: '🤫🛰️', meaning: 'no feedback' }
    ],
    revealText: 'Correct. In aerospace operations, clarity and acknowledgement are essential. A short, precise message followed by an explicit read-back prevents costly mistakes.',
    maxReplays: 5,
    wordCount: 58,
    duration: 45
  },
  {
    id: 'navigation_basics',
    title: '🧭 Navigation Training',
    emoji: '🧭',
    character: 'Mission Control',
    bgColor: 'from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Navigation requires precise calculations and star charts',
    audioInstruction: 'Listen to the navigation principle.',
    question: 'What does proper navigation require?',
    hint: 'Think about what helps ships find their way',
    choices: [
      { text: 'Navigation requires guessing and luck', emoji: '🎲🧭', meaning: 'random direction' },
      { text: 'Navigation requires precise calculations and star charts', emoji: '🌟📐', meaning: 'exact measurements' },
      { text: 'Navigation requires no planning', emoji: '🚫🧭', meaning: 'improvised route' }
    ],
    revealText: 'Excellent work! Navigation requires precise calculations and star charts. For your dedication to mastering this critical skill, you\'ve earned your first mission star! Keep listening carefully—more challenges await! Two more stars to discover!',
    maxReplays: 5,
    wordCount: 70,
    duration: 50
  },
  {
    id: 'orbital_basics',
    title: '🪐 Orbital Basics',
    emoji: '🪐',
    character: 'Mission Control',
    bgColor: 'from-cyan-100 to-teal-100 dark:from-cyan-900 dark:to-teal-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Lower orbits require higher speed',
    audioInstruction: 'Listen and remember this orbital fact.',
    question: 'What do lower orbits require?',
    hint: 'Compare speed at different altitudes',
    choices: [
      { text: 'Lower orbits require higher speed', emoji: '🛰️⚡', meaning: 'faster at lower altitude' },
      { text: 'Lower orbits require lower speed', emoji: '🐢', meaning: 'slower at lower altitude' },
      { text: 'Orbit speed is identical everywhere', emoji: '🔁', meaning: 'no variation' }
    ],
    revealText: 'Exactly. To maintain a stable lower orbit, spacecraft travel faster. This is a foundational concept in orbital mechanics and navigation planning.',
    maxReplays: 5,
    wordCount: 60,
    duration: 48
  },
  {
    id: 'safety',
    title: '🧯 Safety First',
    emoji: '🧯',
    character: 'Mission Control',
    bgColor: 'from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900',
    interactive: true,
    listeningFirst: true,
    questionType: 'true-false',
    audioText: 'Procedure discipline protects the crew',
    audioInstruction: 'Listen to the core safety principle.',
    question: 'True or False: Procedure discipline protects the crew.',
    hint: 'Consider why checklists exist',
    choices: [
      { text: 'Procedure discipline protects the crew', emoji: '✅', meaning: 'correct' },
      { text: 'Procedures slow people down', emoji: '❌', meaning: 'incorrect' }
    ],
    revealText: 'Correct. Procedures and checklists exist to reduce risk. In complex systems, discipline prevents small errors from becoming emergencies.',
    maxReplays: 5,
    wordCount: 55,
    duration: 42
  },
  {
    id: 'problem_solving',
    title: '🧠 Problem Solving',
    emoji: '🧠',
    character: 'Mission Control',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Define the problem before proposing solutions',
    audioInstruction: 'Listen to the troubleshooting mindset.',
    question: 'What should you do before proposing solutions?',
    hint: 'Order of operations in troubleshooting',
    choices: [
      { text: 'Define the problem before proposing solutions', emoji: '🧩✅', meaning: 'clarify then act' },
      { text: 'Try random fixes immediately', emoji: '🎲', meaning: 'guessing' },
      { text: 'Ignore the data', emoji: '🙈', meaning: 'avoid evidence' }
    ],
    revealText: 'Excellent progress! You\'ve demonstrated exceptional problem-solving skills. For your critical thinking and methodical approach, you\'ve earned your second mission star! Keep up the great work—one more star to achieve!',
    maxReplays: 5,
    wordCount: 70,
    duration: 52
  },
  {
    id: 'critical_thinking',
    title: '💡 Critical Analysis',
    emoji: '💡',
    character: 'Mission Control',
    bgColor: 'from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Analyze the data systematically before making decisions',
    audioInstruction: 'Listen to the analytical mindset.',
    question: 'What should you do before making critical decisions?',
    hint: 'Think about the proper sequence',
    choices: [
      { text: 'Analyze the data systematically before making decisions', emoji: '📊✅', meaning: 'orderly evaluation' },
      { text: 'Make decisions instantly without data', emoji: '⚡❌', meaning: 'hasty judgment' },
      { text: 'Ignore all available information', emoji: '🙈📊', meaning: 'data-blind choices' }
    ],
    revealText: 'Outstanding. Analyze the data systematically before making decisions. This methodical approach ensures mission success and crew safety.',
    maxReplays: 5,
    wordCount: 62,
    duration: 48
  },
  {
    id: 'systems_check',
    title: '⚙️ Systems Inspection',
    emoji: '⚙️',
    character: 'Mission Control',
    bgColor: 'from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Systems monitoring requires constant attention',
    audioInstruction: 'Listen to the monitoring principle.',
    question: 'What does effective systems monitoring require?',
    hint: 'Consider what monitoring demands',
    choices: [
      { text: 'Systems monitoring requires occasional checking', emoji: '👀❌', meaning: 'infrequent review' },
      { text: 'Systems monitoring requires constant attention', emoji: '👁️✅', meaning: 'continuous vigilance' },
      { text: 'Systems monitoring requires no oversight', emoji: '🚫👀', meaning: 'neglected systems' }
    ],
    revealText: 'Perfect. Systems monitoring requires constant attention. Operational awareness prevents critical failures and ensures mission success.',
    maxReplays: 5,
    wordCount: 58,
    duration: 46
  },
  {
    id: 'final_challenge',
    title: '🎯 Final Challenge',
    emoji: '🎯',
    character: 'Mission Control',
    bgColor: 'from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Mission success depends on careful preparation and excellent teamwork',
    audioInstruction: 'Listen to the final mission principle.',
    question: 'What does mission success depend on?',
    hint: 'Consider the key factors',
    choices: [
      { text: 'Mission success depends on luck only', emoji: '🍀❌', meaning: 'random chance' },
      { text: 'Mission success depends on careful preparation and excellent teamwork', emoji: '🎯✅', meaning: 'organized collaboration' },
      { text: 'Mission success requires no planning', emoji: '🚫📋', meaning: 'improvisation only' }
    ],
    revealText: 'Magnificent performance! Mission success depends on careful preparation and excellent teamwork. For completing all challenges with excellence and earning all three mission stars, you\'ve proven yourself as a true space specialist! Congratulations on this stellar achievement!',
    maxReplays: 5,
    wordCount: 75,
    duration: 55
  },
  {
    id: 'debrief',
    title: '✅ Mission Debrief',
    emoji: '✅',
    character: 'Mission Control',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: false,
    text: 'Debrief complete. You practiced precise communication, navigation protocols, safety discipline, systematic problem-solving, critical analysis, systems monitoring, and teamwork—skills essential for real space missions.',
    wordCount: 65,
    duration: 42
  },
  {
    id: 'celebrate',
    title: '🎉 Mission Complete',
    emoji: '🎉',
    character: 'Mission Control',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    text: 'Outstanding performance. You earned the Space Explorer badge. Keep training—your next mission awaits among the stars.',
    wordCount: 48,
    duration: 35
  }
];

const SpaceExplorerAdventure = ({ onClose, onComplete }: Props) => {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [stars, setStars] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [listeningPhase, setListeningPhase] = useState<'listening' | 'question' | 'reveal'>('listening');
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [ttsInitialized, setTtsInitialized] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('normal');
  const [showTranscript, setShowTranscript] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [currentSession, setCurrentSession] = useState<StorySession | null>(null);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isRevealTextPlaying, setIsRevealTextPlaying] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<any[] | null>(null);

  const current = storySteps[stepIndex] as any;
  const progress = Math.round(((stepIndex + 1) / storySteps.length) * 100);
  const totalSteps = storySteps.length;
  const totalWords = storySteps.reduce((sum, step: any) => sum + (step.wordCount || 0), 0);
  const totalDuration = storySteps.reduce((sum, step: any) => sum + (step.duration || 0), 0);
  const missionBadges = Math.min(3, stars);
  // Stars awarded at steps 3, 7, 9 (indices 2, 6, 8 in storySteps array)
  const STAR_AWARD_STEPS = new Set(['navigation_basics', 'problem_solving', 'final_challenge']);

  const getRevealOrCelebrationText = (): string => {
    // Use the base revealText or text
    return current.revealText || current.text || '';
  };

  // Dynamic celebration text based on stars
  const getCelebrationText = (): string => {
    if (current.id === 'celebrate') {
      if (stars >= 3) {
        return "Outstanding performance, specialist! You completed the mission flawlessly and earned all three mission stars! Your expertise in communication, navigation, safety protocols, problem-solving, critical analysis, systems monitoring, and teamwork has earned you the prestigious Space Explorer badge. You're ready for real missions in deep space. Keep reaching for the stars!";
      } else if (stars === 2) {
        return "Well done, specialist! You earned two mission stars showing strong understanding of space operations. Your critical thinking and systematic approach are developing nicely. Complete all challenges next time to earn the third star and unlock the full Space Explorer achievement. You're building excellent space skills!";
      } else if (stars === 1) {
        return "Good effort, specialist! You earned one mission star demonstrating your commitment to learning. Space exploration requires mastering many skills. Continue practicing and you'll become a stellar space expert! Keep training—your next mission awaits!";
      } else {
        return "Mission complete, specialist! You explored space operations and gained valuable experience. While you didn't earn all stars this time, every mission teaches something valuable. Keep practicing your listening and critical thinking skills. The stars are waiting for you!";
      }
    }
    return current.text || '';
  };

  useEffect(() => {
    const init = async () => {
      try {
        await OnlineTTS.initialize();
        setTtsAvailable(OnlineTTS.isAvailable());
        setTtsInitialized(true);
        OnlineTTS.logAvailableVoices();
      } catch (e) {
        setTtsAvailable(false);
      }
    };
    init();

    const start = async () => {
      await KidsListeningAnalytics.initialize(userId);
      const session = KidsListeningAnalytics.startSession(userId, 'space-explorer-teen', 'Space Explorer (Teen)');
      setCurrentSession(session);
    };
    start();

    return () => {
      OnlineTTS.stop();
    };
  }, [userId]);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (current.listeningFirst) {
      setListeningPhase('listening');
      setReplaysUsed(0);
      setHasListened(false);
      setRetryMode(false);
      setSelectedChoice(null);
      setShowFeedback(false);
    } else {
      setListeningPhase('reveal');
      setSelectedChoice(null);
      setShowFeedback(false);
    }
  }, [stepIndex]);

  // Shuffle answers when entering question phase so correct answer position varies
  const shuffleArray = (arr: any[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  useEffect(() => {
    if (current.listeningFirst && listeningPhase === 'question' && current.choices) {
      setShuffledChoices(shuffleArray(current.choices));
    } else {
      setShuffledChoices(null);
    }
  }, [stepIndex, listeningPhase]);

  const stripEmojis = (text: string) => text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

  const speak = async (text: string) => {
    if (!OnlineTTS.isAvailable()) throw new Error('TTS not available');
    const clean = stripEmojis(text);
    await OnlineTTS.speak(clean, ASTRA_VOICE, { speed: playbackSpeed, showCaptions: false });
  };

  const playRevealText = async () => {
    let textToSpeak = '';
    if (current.id === 'celebrate') {
      textToSpeak = getCelebrationText();
    } else {
      textToSpeak = getRevealOrCelebrationText();
    }
    if (!textToSpeak) return;
    try {
      OnlineTTS.stop();
      await new Promise(r => setTimeout(r, 100));
      await speak(textToSpeak);
    } catch {
      // swallow - UI still shows text
    }
  };

  const handleSpeedChange = (newSpeed: 'normal' | 'slow' | 'slower') => {
    setPlaybackSpeed(newSpeed);
    OnlineTTS.stop();
    let textToPlay = '';
    if (current.listeningFirst) {
      if (listeningPhase === 'listening' && current.audioText) {
        textToPlay = current.audioText;
      } else if (listeningPhase === 'reveal' && current.revealText) {
        textToPlay = current.revealText;
      }
    } else if (current.text) {
      textToPlay = current.text;
    }
    if (!textToPlay || !OnlineTTS.isAvailable()) return;
    // replay immediately at new speed
    (async () => {
      try {
        const clean = stripEmojis(textToPlay);
        await OnlineTTS.speak(clean, ASTRA_VOICE, { speed: newSpeed, showCaptions: false });
      } catch {}
    })();
  };

  useEffect(() => {
    const autoplay = async () => {
      if (!ttsAvailable) return;
      if (current.listeningFirst && listeningPhase === 'listening' && current.audioText) {
        setIsPlaying(true);
        try { await speak(current.audioText); setHasListened(true); } finally { setIsPlaying(false); }
      } else if (!current.listeningFirst && current.text) {
        setIsPlaying(true);
        let textToSpeak = current.text;
        if (current.id === 'celebrate') {
          textToSpeak = getCelebrationText();
        }
        try { await speak(textToSpeak); } finally { setIsPlaying(false); }
      } else if (current.listeningFirst && listeningPhase === 'reveal' && current.revealText) {
        setIsPlaying(true);
        setIsRevealTextPlaying(true);
        try { await speak(getRevealOrCelebrationText()); } finally { setIsPlaying(false); setIsRevealTextPlaying(false); }
      }
    };
    autoplay();
  }, [stepIndex, listeningPhase, playbackSpeed, ttsAvailable, stars]);

  const handleReplay = async () => {
    if (!current.listeningFirst) return;
    setReplaysUsed(r => r + 1);
    setIsPlaying(true);
    try { await speak(current.audioText); setHasListened(true); } finally { setIsPlaying(false); }
  };

  const handleProceed = () => {
    if (!hasListened) return;
    setListeningPhase('question');
  };

  const handleChoice = (choice: any) => {
    const text = typeof choice === 'string' ? choice : choice.text;
    setSelectedChoice(text);
    let isCorrect = false;
    if (current.questionType === 'true-false') {
      isCorrect = text === 'True - Procedure discipline protects the crew';
    } else {
      isCorrect = text === current.audioText;
    }

    if (currentSession && current.listeningFirst) {
      KidsListeningAnalytics.recordAttempt(
        currentSession,
        current.id,
        current.question || '',
        isCorrect,
        1,
        replaysUsed,
        0
      );
    }

    setShowFeedback(true);
    if (isCorrect) {
      setCorrectAnswers(a => a + 1);
      
      // Star awarding on specific interactive steps (3rd, 7th, 9th steps = indices 2, 6, 8)
      if (STAR_AWARD_STEPS.has(current.id)) {
        setStars(prev => {
          const newStars = Math.min(3, prev + 1);
          console.log(`⭐ Star ${newStars}/3 awarded! Step: ${current.id}`);
          return newStars;
        });
      }
      
      // Move to reveal after brief feedback window
      setTimeout(() => setListeningPhase('reveal'), 2500);
      // Calculate dynamic time to allow full reveal TTS to play
      const revealText = getRevealOrCelebrationText() || '';
      const textLength = revealText.length;
      const wordsPerMinute = playbackSpeed === 'slow' ? 120 : playbackSpeed === 'slower' ? 80 : 160;
      const estimatedDuration = Math.max(10000, (textLength / 5) * (60000 / wordsPerMinute) + 2000);
      setTimeout(() => {
        if (!isRevealTextPlaying) {
          handleNext();
        } else {
          setTimeout(() => handleNext(), 2000);
        }
      }, estimatedDuration);
    } else {
      setRetryMode(true);
    }
  };

  const handleRetry = () => {
    setRetryMode(false);
    setSelectedChoice(null);
    setShowFeedback(false);
    setListeningPhase('listening');
    setReplaysUsed(0);
  };

  const handleNext = () => {
    if (stepIndex < storySteps.length - 1) {
      setStepIndex(i => i + 1);
      return;
    }
    const accuracyScore = correctAnswers * 20;
    const timeBonus = Math.max(0, 300 - timeSpent) * 0.1;
    const score = Math.min(100, 40 + accuracyScore + timeBonus);
    if (currentSession) {
      KidsListeningAnalytics.completeSession(userId, currentSession, score, 0);
    }
    OnlineTTS.stop();
    onComplete(score);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn(
        'w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500',
        'bg-gradient-to-br', (storySteps[stepIndex] as any).bgColor,
        'flex flex-col'
      )}>
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            onClick={() => { OnlineTTS.stop(); onClose(); }}
            className="h-10 w-10 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          >
            <X className="w-5 h-5 text-gray-700 hover:text-gray-900" />
          </Button>
        </div>

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-3 gap-2 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-700 dark:text-indigo-200 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Space Explorer</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                ⭐ {missionBadges}/3 Stars
              </div>
              {(listeningPhase === 'listening' || listeningPhase === 'question') && current.listeningFirst && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAccessibilityMode(!accessibilityMode)}
                  className={cn(
                    'h-7 px-2 rounded-full text-xs',
                    accessibilityMode && 'bg-orange-100 dark:bg-orange-900 border border-orange-300'
                  )}
                  title="Accessibility mode (for hearing difficulties)"
                >
                  👂 {accessibilityMode ? 'ON' : 'Help'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newSpeed = playbackSpeed === 'slow' ? 'slower' : playbackSpeed === 'slower' ? 'normal' : 'slow';
                  handleSpeedChange(newSpeed);
                }}
                className="h-7 px-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                title={`Playback speed: ${playbackSpeed}`}
              >
                <Gauge className="w-3.5 h-3.5 mr-1" />
                {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
              </Button>
              {(listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranscript(t => !t)}
                  className="h-7 w-7 p-0 rounded-full border"
                  title="Toggle transcript"
                >
                  <FileText className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {ttsInitialized && ttsAvailable && (
            <div className="mb-2 bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 justify-center">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-bold">Astra voice ready. Stay sharp, specialist.</span>
              </div>
            </div>
          )}

          <Progress value={progress} className="h-2 sm:h-2 mb-3 sm:mb-4 bg-white/30">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500" />
          </Progress>

          <div className="flex-1 overflow-y-auto overflow-x-hidden sm:overflow-hidden pb-2 sm:pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {/* Mobile: single-column layout */}
            <div className="sm:hidden text-center h-full flex flex-col justify-center">
              <div className="relative mb-3 sm:mb-4">
                <div className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 animate-float">
                <span>{current.emoji}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={cn('text-xl sm:text-2xl transition-all', i < missionBadges ? 'text-yellow-400 animate-pulse drop-shadow-lg' : 'text-gray-300 opacity-50')}>⭐</span>
                ))}
              </div>
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <Satellite className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-600 opacity-70" />
                </div>
              </div>

              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-blue-50/70 dark:bg-blue-900/30 rounded-2xl p-6 backdrop-blur-sm border-2 border-blue-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                  <Satellite className="w-5 h-5 text-blue-600" />
                  {current.audioInstruction}
                </h3>
                    {showTranscript && accessibilityMode && (
                      <div className="mb-4 bg-orange-50/90 dark:bg-orange-900/30 rounded-lg p-4 border-2 border-orange-300">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Accessibility Transcript:</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">"{current.audioText}"</p>
                      </div>
                    )}
                <div className="flex items-center justify-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-2 bg-blue-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                      ))}
                </div>
                <div className="flex flex-col items-center gap-3">
                      <Button onClick={handleReplay} disabled={isPlaying} className={cn('rounded-xl px-6 py-3 text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold transition-all', isPlaying && 'animate-pulse')}>
                    <Volume2 className="w-5 h-5 mr-2" />
                    {isPlaying ? 'Playing...' : `Listen Again (${replaysUsed})`}
                  </Button>
                      {hasListened && (
                    <Button onClick={handleProceed} className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-3 font-bold animate-bounce">
                          I'm Ready ✓
                    </Button>
                  )}
                    </div>
                </div>
              </div>
            )}

            {current.listeningFirst && listeningPhase === 'question' && (
                <div className="space-y-2 max-w-4xl mx-auto w-full">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1.5">{current.question}</h4>
                    {showHint ? (
                      <p className="text-xs text-gray-600 dark:text-gray-300">💡 Hint: {current.hint}</p>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setShowHint(true)} className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs">
                        Need a hint? 🧩
                      </Button>
                    )}
                </div>
                  <div className="flex justify-center mb-2">
                    <Button onClick={handleReplay} disabled={isPlaying} className="rounded-lg px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold transition-all text-xs">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Replay
                  </Button>
                </div>
                {current.choices && (
                    <div className="grid grid-cols-1 gap-2.5">
                    {(shuffledChoices || current.choices).map((choice: any, idx: number) => {
                      const isSelected = selectedChoice === choice.text;
                      const isCorrect = (current.questionType === 'true-false') ? choice.text === 'True - Procedure discipline protects the crew' : choice.text === current.audioText;
                      const showResult = showFeedback && isSelected;
                      return (
                        <Button
                          key={idx}
                          onClick={() => handleChoice(choice)}
                          disabled={showFeedback}
                          className={cn(
                              'rounded-lg px-3 py-2.5 text-xs font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[55px]',
                              showResult && isCorrect && 'bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-2xl',
                              showResult && !isCorrect && 'bg-red-500 hover:bg-red-600 text-white shadow-xl',
                              !showResult && 'bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg'
                          )}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-1 text-left">
                                <p className="font-bold text-xs">{stripEmojis(choice.text)}</p>
                              <p className="text-xs opacity-70">{choice.meaning}</p>
                            </div>
                            {showResult && isCorrect && (
                              <Award className="w-4 h-4 text-yellow-300 animate-spin absolute top-1 right-1" />
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}

                {showFeedback && (
                  <div className="mt-2">
                    {(current.questionType === 'true-false' ? selectedChoice === 'True - Procedure discipline protects the crew' : selectedChoice === current.audioText) ? (
                        <div className="text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border-2 border-green-400">
                        ✅ Excellent! Clear reasoning.
                      </div>
                    ) : (
                      <div className="space-y-2">
                          <div className="text-orange-700 dark:text-orange-300 text-xs font-bold bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-2 border-2 border-orange-400">
                          💡 Review and try again.
                        </div>
                        {retryMode && (
                          <div className="flex justify-center gap-2">
                              <Button onClick={handleRetry} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg px-5 py-2 text-sm font-bold shadow-lg transition-all">
                              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
                            </Button>
                              <Button onClick={handleNext} variant="outline" className="rounded-lg px-5 py-2 text-sm font-bold border-2 border-gray-600 hover:bg-gray-100">
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

            {(listeningPhase === 'reveal' || !current.listeningFirst) && (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 mb-2 backdrop-blur-sm border-2 border-white/20 shadow-2xl">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-blue-600 hover:text-blue-700 h-7 w-7 p-0" title="Replay this text with Astra voice">
                        <Volume2 className="w-4 h-4" />
                  </Button>
                </h3>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                  {current.id === 'celebrate' ? getCelebrationText() : (current.revealText || current.text)}
                </p>
                <div className="flex justify-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>📝 {current.wordCount || 0} words</span>
                  <span>⏱️ {current.duration || 0}s</span>
                </div>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={handleNext} className="rounded-lg sm:rounded-2xl px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold transition-all shadow-lg">
                      {stepIndex === storySteps.length - 1 ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          <span className="hidden sm:inline">Complete Mission ✨</span>
                          <span className="sm:hidden">Done ✨</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Continue 🚀</span>
                          <span className="sm:hidden">Next 🚀</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: two-column layout */}
            <div className="hidden sm:flex sm:flex-row h-full gap-4 lg:gap-6">
              <div className="sm:flex sm:flex-col sm:items-center sm:justify-center sm:w-1/4 lg:w-1/3 sm:pr-2 lg:pr-4">
                <div className="relative">
                  <div className="text-7xl md:text-8xl lg:text-9xl mb-4 lg:mb-6 animate-float">
                    <span>{current.emoji}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span key={i} className={cn('text-3xl md:text-4xl transition-all', i < missionBadges ? 'text-yellow-400 animate-pulse drop-shadow-lg' : 'text-gray-300 opacity-50')}>⭐</span>
                    ))}
                  </div>
                  <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 animate-float-slow">
                    <Satellite className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-gray-600 opacity-70" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center sm:pr-4 overflow-hidden max-h-full">
                {current.listeningFirst && listeningPhase === 'listening' && (
                  <div className="w-full">
                    <div className="bg-blue-50/70 dark:bg-blue-900/30 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-blue-300 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        <Satellite className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                        <span>{current.audioInstruction}</span>
                      </h3>
                      {showTranscript && (
                        <div className="mb-3 bg-white/80 dark:bg-gray-800/50 rounded-lg p-3 border">
                          <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium">"{current.audioText}"</p>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 bg-blue-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <div className="flex flex-col items-center gap-2 mt-3">
                        <Button onClick={handleReplay} disabled={isPlaying} className={cn('rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold transition-all', isPlaying && 'animate-pulse')}>
                          <Volume2 className="w-4 h-4 mr-2" />
                          {isPlaying ? 'Playing...' : `Listen Again (${replaysUsed})`}
                        </Button>
                        {hasListened && (
                          <Button onClick={handleProceed} className="mt-1 bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-bold animate-bounce">
                            I'm Ready ✓
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {current.listeningFirst && listeningPhase === 'question' && (
                  <div className="w-full space-y-2">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5 lg:p-3 border-2 border-yellow-300">
                      <h4 className="text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1.5">{current.question}</h4>
                      {showTranscript && (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Hint text: {current.hint}</p>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={handleReplay} disabled={isPlaying} className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm">
                        <Volume2 className="w-3 h-3 mr-1.5" /> Replay
                      </Button>
                    </div>
                    {current.choices && (
                      <div className="grid grid-cols-1 gap-1.5">
                        {(shuffledChoices || current.choices).map((choice: any, idx: number) => {
                          const isSelected = selectedChoice === choice.text;
                          const isCorrect = (current.questionType === 'true-false') ? choice.text === 'True - Procedure discipline protects the crew' : choice.text === current.audioText;
                          const showResult = showFeedback && isSelected;
                          return (
                            <Button
                              key={idx}
                              onClick={() => handleChoice(choice)}
                              disabled={showFeedback}
                              className={cn(
                                'rounded-lg px-2.5 py-2 text-xs md:text-sm font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[42px] relative',
                                showResult && isCorrect && 'bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-xl',
                                showResult && !isCorrect && 'bg-red-500 hover:bg-red-600 text-white shadow-lg',
                                !showResult && 'bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-300 hover:border-indigo-400 hover:shadow-md'
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
                      <div className="mt-1.5">
                        {(current.questionType === 'true-false' ? selectedChoice === 'True - Procedure discipline protects the crew' : selectedChoice === current.audioText) ? (
                          <div className="text-green-600 dark:text-green-400 text-xs md:text-sm font-bold bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border-2 border-green-400">
                            ✅ Excellent! Clear reasoning.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-orange-700 dark:text-orange-300 text-xs md:text-sm font-bold bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-2 border-2 border-orange-400">
                              💡 Review and try again.
                            </div>
                            {retryMode && (
                              <div className="flex flex-col sm:flex-row justify-center items-stretch gap-2">
                                <Button onClick={handleRetry} className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white rounded-lg px-5 py-2 text-sm font-bold shadow-lg transition-all">
                                  <RotateCcw className="w-4 h-4 mr-2" /> Try Again
                                </Button>
                                <Button onClick={handleNext} variant="outline" className="rounded-lg px-5 py-2 text-sm font-bold border-2 border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100">
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

                {(listeningPhase === 'reveal' || !current.listeningFirst) && (
                  <div className="w-full">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 lg:p-5 mb-3 backdrop-blur-sm border-2 border-white/20 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        {current.title}
                        <Button variant="ghost" size="sm" onClick={playRevealText} className="text-blue-600 hover:text-blue-700 h-7 w-7 p-0" title="Replay this text with Astra voice">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </h3>
                      <p className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-200 leading-relaxed px-2 font-medium">
                        {current.id === 'celebrate' ? getCelebrationText() : (current.revealText || current.text)}
                      </p>
                      <div className="flex justify-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📝 {current.wordCount || 0}</span>
                        <span>⏱️ {current.duration || 0}s</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={handleNext} className="rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold transition-all shadow-lg text-sm md:text-base">
                    {stepIndex === storySteps.length - 1 ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-pulse" /> Complete Mission ✨
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" /> Continue 🚀
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
              </div>
            </div>
          </div>

          <div className="hidden lg:block absolute top-20 left-8 animate-float-slow">
            <Globe className="w-8 h-8 text-indigo-400" />
          </div>
        </CardContent>

        <style>{`
          @keyframes waveform { 0%,100%{height:20px} 50%{height:50px} }
          .animate-waveform{ animation: waveform .6s ease-in-out infinite; }
          @keyframes float-slow { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } }
          .animate-float-slow{ animation: float-slow 4s ease-in-out infinite; }
          @keyframes float { 0%,100%{ transform: translateY(0px) } 50%{ transform: translateY(-20px) } }
          .animate-float{ animation: float 3s ease-in-out infinite; }
          @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
          .animate-fade-in { animation: fade-in .5s ease-out; }
          .scrollbar-thin::-webkit-scrollbar { width: 8px; }
          .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(156,163,175,.5); border-radius: 4px; }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(107,114,128,.7); }
          .scrollbar-thin { scrollbar-width: thin; scrollbar-color: rgba(156,163,175,.5) transparent; }
        `}</style>
      </Card>
    </div>
  );
};

export default SpaceExplorerAdventure;


