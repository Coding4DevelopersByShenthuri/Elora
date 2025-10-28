import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Cpu, Code2, Gauge, Volume2, X, Zap, Play, FileText, RotateCcw } from 'lucide-react';
import OnlineTTS, { STORY_VOICES } from '@/services/OnlineTTS';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const NOVA_VOICE = STORY_VOICES.NovaTeen;

type Props = { onClose: () => void; onComplete: (score: number) => void };

const storySteps = [
  {
    id: 'intro',
    title: '💻 Welcome to Tech Innovator',
    text: 'Welcome to the Innovation Lab! You\'re about to become a tech innovator. Today you\'ll learn about coding, AI, robotics, and cyber security. Your mission is to listen carefully and answer questions to earn THREE innovation badges. Are you ready to code your future?',
    emoji: '💻',
    character: 'Nova',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: false,
    wordCount: 60,
    duration: 35
  },
  {
    id: 'coding_basics',
    title: '⌨️ Coding Basics',
    emoji: '⌨️',
    character: 'Nova',
    bgColor: 'from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Coding is like learning a language that computers understand',
    audioInstruction: 'Listen to what coding means for computers.',
    question: 'What is coding like for computers?',
    hint: 'Think about languages and communication',
    choices: [
      { text: 'Coding is just typing random letters', emoji: '⌨️❌', meaning: 'random' },
      { text: 'Coding is like learning a language that computers understand', emoji: '💬✅', meaning: 'communication' },
      { text: 'Coding means shouting at the screen', emoji: '🔊❌', meaning: 'noise' }
    ],
    revealText: 'Exactly! Coding is like learning a language that computers understand. Just like you learn English to talk to people, programmers learn coding languages to talk to computers!',
    maxReplays: 5,
    wordCount: 35,
    duration: 30
  },
  {
    id: 'variables',
    title: '📊 Variables',
    emoji: '📊',
    character: 'Nova',
    bgColor: 'from-indigo-100 to-sky-100 dark:from-indigo-900 dark:to-sky-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Variables store information like boxes hold items',
    audioInstruction: 'Listen to how variables work.',
    question: 'What do variables store?',
    hint: 'Think about storage and information',
    choices: [
      { text: 'Variables store confusion only', emoji: '🤯❌', meaning: 'chaos' },
      { text: 'Variables store information like boxes hold items', emoji: '📦✅', meaning: 'storage' },
      { text: 'Variables make noise', emoji: '🔊❌', meaning: 'sound' }
    ],
    revealText: '🌟 First innovation badge earned! Variables store information like boxes hold items. Three more badges to go! 🌟',
    maxReplays: 5,
    wordCount: 35,
    duration: 28
  },
  {
    id: 'functions',
    title: '⚙️ Functions',
    emoji: '⚙️',
    character: 'Nova',
    bgColor: 'from-fuchsia-100 to-rose-100 dark:from-fuchsia-900 dark:to-rose-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Functions are reusable blocks of code that perform specific tasks',
    audioInstruction: 'Listen to what functions can do.',
    question: 'What are functions?',
    hint: 'Think about doing tasks repeatedly',
    choices: [
      { text: 'Functions are random commands', emoji: '🎲❌', meaning: 'random' },
      { text: 'Functions are reusable blocks of code that perform specific tasks', emoji: '♻️✅', meaning: 'reusable' },
      { text: 'Functions never work', emoji: '💔❌', meaning: 'broken' }
    ],
    revealText: 'Perfect! Functions are reusable blocks of code that perform specific tasks. Think of them like recipes you can use over and over again!',
    maxReplays: 5,
    wordCount: 40,
    duration: 32
  },
  {
    id: 'ai_basics',
    title: '🤖 AI Basics',
    emoji: '🤖',
    character: 'Nova',
    bgColor: 'from-pink-100 to-red-100 dark:from-pink-900 dark:to-red-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Artificial Intelligence helps machines learn and make decisions',
    audioInstruction: 'Listen to what AI does.',
    question: 'What does AI help machines do?',
    hint: 'Think about learning and decisions',
    choices: [
      { text: 'AI makes machines sleep', emoji: '😴❌', meaning: 'rest' },
      { text: 'Artificial Intelligence helps machines learn and make decisions', emoji: '🧠✅', meaning: 'intelligence' },
      { text: 'AI makes machines forget', emoji: '🧹❌', meaning: 'erase' }
    ],
    revealText: 'Amazing! AI helps machines learn and make decisions, just like how you learn new things every day!',
    maxReplays: 5,
    wordCount: 40,
    duration: 32
  },
  {
    id: 'robotics',
    title: '🤖 Robotics',
    emoji: '🤖',
    character: 'Nova',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Robots can follow instructions to complete tasks',
    audioInstruction: 'Listen to what robots can do.',
    question: 'What can robots do?',
    hint: 'Think about following directions',
    choices: [
      { text: 'Robots just sit around', emoji: '🪑❌', meaning: 'inactive' },
      { text: 'Robots can follow instructions to complete tasks', emoji: '✅📝', meaning: 'follow' },
      { text: 'Robots only make noise', emoji: '🔊❌', meaning: 'sound' }
    ],
    revealText: 'Correct! Robots can follow instructions to complete tasks, just like you follow instructions in school!',
    maxReplays: 5,
    wordCount: 38,
    duration: 30
  },
  {
    id: 'debugging',
    title: '🔧 Debugging',
    emoji: '🔧',
    character: 'Nova',
    bgColor: 'from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Debugging is finding and fixing mistakes in code',
    audioInstruction: 'Listen to what debugging means.',
    question: 'What is debugging?',
    hint: 'Think about fixing problems',
    choices: [
      { text: 'Debugging is creating new problems', emoji: '💥❌', meaning: 'create' },
      { text: 'Debugging is finding and fixing mistakes in code', emoji: '🔨✅', meaning: 'repair' },
      { text: 'Debugging makes code worse', emoji: '📉❌', meaning: 'worse' }
    ],
    revealText: '🌟 Second innovation badge! Debugging is finding and fixing mistakes in code. One more badge to go! 🌟',
    maxReplays: 5,
    wordCount: 40,
    duration: 32
  },
  {
    id: 'cybersecurity',
    title: '🔒 Cybersecurity',
    emoji: '🔒',
    character: 'Nova',
    bgColor: 'from-sky-100 to-cyan-100 dark:from-sky-900 dark:to-cyan-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Cybersecurity protects information from hackers',
    audioInstruction: 'Listen to what cybersecurity protects.',
    question: 'What does cybersecurity protect?',
    hint: 'Think about protection and security',
    choices: [
      { text: 'Cybersecurity protects nothing', emoji: '🚫❌', meaning: 'nothing' },
      { text: 'Cybersecurity protects information from hackers', emoji: '🛡️✅', meaning: 'protection' },
      { text: 'Cybersecurity makes things unsafe', emoji: '⚠️❌', meaning: 'unsafe' }
    ],
    revealText: 'Excellent! Cybersecurity protects information from hackers, just like locks protect your door!',
    maxReplays: 5,
    wordCount: 38,
    duration: 30
  },
  {
    id: 'innovation',
    title: '💡 Innovation',
    emoji: '💡',
    character: 'Nova',
    bgColor: 'from-stone-100 to-zinc-100 dark:from-stone-900 dark:to-zinc-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Innovation means creating new and better solutions',
    audioInstruction: 'Listen to what innovation means.',
    question: 'What is innovation?',
    hint: 'Think about creating new things',
    choices: [
      { text: 'Innovation means copying old ideas', emoji: '📋❌', meaning: 'copy' },
      { text: 'Innovation means creating new and better solutions', emoji: '✨✅', meaning: 'create' },
      { text: 'Innovation means doing nothing', emoji: '😴❌', meaning: 'inactive' }
    ],
    revealText: '🌟 Final innovation badge earned! Innovation means creating new and better solutions. You\'re now a certified Tech Innovator! 🌟',
    maxReplays: 5,
    wordCount: 40,
    duration: 32
  },
  {
    id: 'debrief',
    title: '✅ Innovation Debrief',
    text: 'Congratulations! You\'ve mastered coding basics, variables, functions, AI, robotics, debugging, cybersecurity, and innovation. You\'re now a Tech Innovator! Keep coding your future!',
    emoji: '✅',
    character: 'Nova',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: false,
    wordCount: 45,
    duration: 30
  },
  {
    id: 'celebrate',
    title: '🎉 Tech Innovator Badge Earned',
    text: '',
    emoji: '🎉',
    character: 'Nova',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 50,
    duration: 36
  }
];

const TechInnovatorAdventure = ({ onClose, onComplete }: Props) => {
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
  // Removed unused audio waveform state to satisfy linter
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('slow');
  const [retryMode, setRetryMode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
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

  const getCelebrationText = (): string => {
    if (current.id === 'celebrate') {
      if (stars >= 3) return "Outstanding! You earned all three innovation badges and the Tech Innovator title! Your coding skills are amazing! Keep innovating—your future in tech is bright!";
      if (stars === 2) return "Great work! You earned two innovation badges. Your tech knowledge is growing—one more badge next time for full Tech Innovator status! Keep coding!";
      if (stars === 1) return "Good progress! You earned one innovation badge. Keep learning these tech concepts and you'll become a Tech Innovator!";
      return "Tech journey complete. Every code teaches something. Keep learning and innovating!";
    }
    return (current as any).revealText || current.text || '';
  };

  useEffect(() => {
    const init = async () => {
      try { await OnlineTTS.initialize(); setTtsAvailable(OnlineTTS.isAvailable()); setTtsInitialized(true); OnlineTTS.logAvailableVoices(); } catch { setTtsAvailable(false); }
    };
    init();
    const initSession = async () => { await KidsListeningAnalytics.initialize(userId); const s = KidsListeningAnalytics.startSession(userId, 'tech-innovator-teen', 'Tech Innovator (Teen)'); setCurrentSession(s); };
    initSession();
    return () => { OnlineTTS.stop(); };
  }, [userId]);

  useEffect(() => { const t = setInterval(() => setTimeSpent(p => p + 1), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (current.listeningFirst) { setListeningPhase('listening'); setReplaysUsed(0); setHasListened(false); setAttemptCount(0); setRetryMode(false); } else { setListeningPhase('reveal'); }
    setSelectedChoice(null); setShowFeedback(false); setShowHint(false);
  }, [stepIndex]);

  const stripEmojis = (text: string): string => text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{E0020}-\u{E007F}]/gu, '').trim();

  const playAudioWithCaptions = async (text: string) => {
    try {
      const clean = stripEmojis(text);
      if (!OnlineTTS.isAvailable()) throw new Error('TTS not available');
      await OnlineTTS.speak(clean, NOVA_VOICE, { speed: playbackSpeed, showCaptions: false, onCaptionUpdate: () => {} });
    } catch (error) {
      console.error('TTS error:', error);
      setTtsAvailable(false);
      throw error;
    }
  };

  const playRevealText = async () => {
    let textToSpeak = '';
    if (current.id === 'celebrate') {
      textToSpeak = getCelebrationText();
    } else {
      textToSpeak = (current as any).revealText || current.text || '';
    }
    if (!textToSpeak) return;
    try {
      OnlineTTS.stop();
      await new Promise(r => setTimeout(r, 100));
      await playAudioWithCaptions(textToSpeak);
    } catch {}
  };

  useEffect(() => {
    const autoplay = async () => {
      if (!ttsAvailable) return;
      if (current.listeningFirst && listeningPhase === 'listening' && (current as any).audioText) {
        setIsPlaying(true);
        try { await playAudioWithCaptions((current as any).audioText); setHasListened(true); } catch { setHasListened(true); }
        setIsPlaying(false);
      } else if (listeningPhase === 'reveal' && current.listeningFirst && (current as any).revealText) {
        setIsPlaying(true); setIsRevealTextPlaying(true);
        try { await playAudioWithCaptions((current as any).revealText); await new Promise(r => setTimeout(r, 1000)); } catch {}
        setIsPlaying(false); setIsRevealTextPlaying(false);
      } else if (!current.listeningFirst) {
        const narration = current.id === 'celebrate' ? getCelebrationText() : (current.text || '');
        if (narration) {
          setIsPlaying(true);
          try { await playAudioWithCaptions(narration); } catch {}
          setIsPlaying(false);
        }
      }
    };
    autoplay();
  }, [listeningPhase, stepIndex, playbackSpeed, stars]);

  const handleNext = () => {
    if (stepIndex < storySteps.length - 1) { setStepIndex(i => i + 1); return; }
    const score = Math.min(100, 40 + correctAnswers * 20 + Math.max(0, 300 - timeSpent) * 0.1 + stars * 10);
    if (currentSession) KidsListeningAnalytics.completeSession(userId, currentSession, score, stars);
    OnlineTTS.stop(); onComplete(score);
  };

  const handleReplayAudio = async () => {
    if (!unlimitedReplays && replaysUsed >= maxReplays) return;
    if (!current.listeningFirst) return;
    setReplaysUsed(p => p + 1); setIsPlaying(true);
    try { await playAudioWithCaptions((current as any).audioText); setHasListened(true); } catch { setHasListened(true); }
    setIsPlaying(false);
  };

  const handleProceedToQuestion = () => { if (!hasListened) return; setListeningPhase('question'); setQuestionStartTime(Date.now()); };

  const handleChoice = async (choiceObj: any) => {
    const choice = typeof choiceObj === 'string' ? choiceObj : choiceObj.text;
    setSelectedChoice(choice);
    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);
    const questionTime = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = choice === (current as any).audioText;
    
    if (currentSession && current.listeningFirst) {
      const updated = KidsListeningAnalytics.recordAttempt(currentSession, current.id, (current as any).question || '', isCorrect, currentAttempt, replaysUsed, questionTime);
      setCurrentSession(updated);
    }

    if (isCorrect) {
      setCorrectAnswers(p => p + 1);
      if (current.id === 'variables') { setStars(1); console.log('⭐ First badge (1/3)'); }
      else if (current.id === 'debugging') { setStars(2); console.log('⭐ Second badge (2/3)'); }
      else if (current.id === 'innovation') { setStars(3); console.log('⭐ Third badge (3/3)'); }
      
      setShowFeedback(true); setRetryMode(false);
      setTimeout(() => setListeningPhase('reveal'), 2500);
      const revealText = (current as any).revealText || '';
      const wordCount = revealText.split(/\s+/).filter((w: string) => w.length > 0).length;
      const wpm = playbackSpeed === 'slow' ? 120 : playbackSpeed === 'slower' ? 80 : 160;
      const estimated = Math.max(15000, (wordCount / wpm) * 60000 + 3000);
      setTimeout(() => { if (!isRevealTextPlaying) handleNext(); else setTimeout(() => handleNext(), 3000); }, estimated);
    } else {
      // Show feedback and enable retry/skip on wrong answers (match MysteryDetective flow)
      setShowFeedback(true);
      setRetryMode(true);
    }
  };

  const handleRetry = () => { setRetryMode(false); setSelectedChoice(null); setShowFeedback(false); setListeningPhase('listening'); setReplaysUsed(0); };

  const getCorrectFeedback = () => {
    const messages = ["🎉 FANTASTIC! You earned a badge! 🌟", "🌟 AMAZING! You got it right!", "✨ WONDERFUL! Listening champion!", "🎯 PERFECT! Great job!", "💫 BRILLIANT! Badge earned!"];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => attempt === 1 ? `💪 Not quite! Listen carefully and try again! 🎧` : `🌟 Keep trying! Listen one more time! 👂`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn("w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500", "bg-gradient-to-br", current.bgColor, "flex flex-col")}>
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" onClick={() => { OnlineTTS.stop(); onClose(); }} className="h-10 w-10 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50">
            <X className="w-5 h-5 text-gray-700 hover:text-gray-900" />
          </Button>
        </div>

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-3 gap-2 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Cpu className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Tech Innovator</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">⭐ {stars}/3 Badges</div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => { const ns = playbackSpeed === 'slow' ? 'slower' : playbackSpeed === 'slower' ? 'normal' : 'slow'; setPlaybackSpeed(ns); OnlineTTS.stop(); }} className="h-7 px-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 bg-green-50 dark:bg-green-800 hover:bg-green-100 dark:hover:bg-green-700 border border-green-200 dark:border-green-600 text-green-800 dark:text-green-100">
                  <Gauge className="w-3.5 h-3.5 mr-1" />{playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
                </Button>
                {(listeningPhase === 'listening' || listeningPhase === 'question') && current.listeningFirst && (
                  <Button variant="ghost" size="sm" onClick={() => setAccessibilityMode(!accessibilityMode)} className={cn("h-7 px-2 rounded-full text-xs", accessibilityMode && "bg-orange-100 dark:bg-orange-900 border border-orange-300")}>
                    👂 {accessibilityMode ? 'ON' : 'Help'}
                  </Button>
                )}
                {(listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode) && (
                  <Button variant="ghost" size="sm" onClick={() => setShowTranscript(!showTranscript)} className={cn("h-7 w-7 p-0 rounded-full border", showTranscript ? "bg-blue-100 dark:bg-blue-800" : "bg-white/80 dark:bg-gray-700")}>
                    <FileText className={cn("w-3.5 h-3.5", showTranscript ? "text-blue-700 dark:text-blue-200" : "text-gray-700 dark:text-gray-200")} />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {ttsInitialized && ttsAvailable && (
            <div className="mb-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 justify-center"><Volume2 className="w-4 h-4" /><span className="text-xs sm:text-sm font-bold">Nova's voice is ready! Listen carefully!</span></div>
            </div>
          )}
          
          {accessibilityMode && (listeningPhase === 'listening' || listeningPhase === 'question') && (
            <div className="mb-2 bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-400 text-orange-900 dark:text-orange-200 px-4 py-2.5 rounded-lg shadow-md">
              <div className="flex items-center gap-2 justify-center"><span className="text-lg">👂</span><div className="text-xs sm:text-sm"><strong>Accessibility Mode Active:</strong> Text shown for hearing support.</div></div>
            </div>
          )}

          <Progress value={progress} className="h-2 sm:h-2 mb-3 sm:mb-4 bg-white/30"><div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500" /></Progress>

          <div className="flex-1 overflow-y-auto overflow-x-hidden sm:overflow-hidden pb-2 sm:pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {/* MOBILE: Original Single Column Layout */}
            <div className="sm:hidden text-center h-full flex flex-col justify-center">
              <div className="relative mb-2 sm:mb-2 md:mb-3">
                <div className={cn("text-5xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 sm:mb-2", "animate-float")}>
                  <span className={cn(current.id === 'celebrate' && 'animate-celebration-party')}>{current.emoji}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Sparkles key={i} className={cn("w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 transition-all duration-500 transform hover:scale-125", i < stars ? 'text-yellow-400 animate-pulse drop-shadow-lg' : 'text-gray-300 opacity-50')} />
                  ))}
                </div>
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <Cpu className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-600 opacity-70" />
                </div>
              </div>

              {!current.listeningFirst && (
                <>
                  <div className="mb-4 text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                      {/* Show only the title to avoid double emoji on mobile */}
                      <span>{current.title}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText} 
                        className="text-purple-600 hover:text-purple-700 h-7 w-7 p-0"
                        title="Replay this text with Nova voice"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{current.id === 'celebrate' ? getCelebrationText() : current.text}</p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button onClick={handleNext} className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-8 py-3 font-bold">
                      {stepIndex === storySteps.length - 1 ? 'Complete! ✨' : 'Continue →'}
                    </Button>
                  </div>
                </>
              )}
              
              {(current as any).listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-purple-50/70 dark:bg-purple-900/30 rounded-2xl p-6 backdrop-blur-sm border-2 border-purple-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Cpu className="w-6 h-6 text-purple-600 animate-bounce" />
                      {(current as any).audioInstruction}
                    </h3>
                    {(showTranscript && accessibilityMode) && (current as any).audioText && (
                      <div className="mb-4 bg-orange-50/90 dark:bg-orange-900/30 rounded-lg p-4 border-2 border-orange-300">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Accessibility Transcript:</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">"{(current as any).audioText}"</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">⚠️ Try to listen carefully instead of reading!</p>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-3 mt-4">
                      <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-6 py-3 text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all", isPlaying && "animate-pulse")}>
                        <Volume2 className="w-5 h-5 mr-2" />
                        {isPlaying ? 'Playing...' : unlimitedReplays ? `Listen Again (${replaysUsed} plays)` : `Listen Again (${maxReplays - replaysUsed} left)`}
                      </Button>
                      <p className="text-sm text-gray-600 dark:text-gray-300">👂 Listen carefully! {unlimitedReplays ? 'Unlimited plays' : `${maxReplays} plays available`}.</p>
                      {hasListened && (
                        <Button onClick={handleProceedToQuestion} className="mt-2 bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-3 font-bold animate-bounce">I'm Ready! ✓</Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {(current as any).listeningFirst && listeningPhase === 'question' && (
                <div className="space-y-2 sm:space-y-2 md:space-y-3 max-w-4xl mx-auto w-full">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border-2 border-yellow-300">
                    <h4 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-1">{(current as any).question}</h4>
                    {showHint ? (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">💡 {(current as any).hint}</p>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setShowHint(true)} className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs">Need a hint? 🧩</Button>
                    )}
                  </div>
                  <div className="flex justify-center mb-2">
                    <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold", isPlaying && "animate-pulse")}>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Replay
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">{(current as any).choices?.map((choice: any, idx: number) => {
                    const isSelected = selectedChoice === choice.text;
                    const isCorrect = choice.text === (current as any).audioText;
                    const showResult = showFeedback && isSelected;
                    return <Button key={idx} onClick={() => handleChoice(choice)} disabled={showFeedback} className={cn("rounded-xl px-4 py-3 text-sm font-bold h-auto min-h-[55px]", showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white animate-bounce", showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white", !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200")}> 
                      <div className="flex items-center gap-2 w-full"><span className="text-lg">{choice.emoji}</span><div className="flex-1 text-left"><p className="font-bold">{choice.text}</p><p className="text-xs opacity-70">{choice.meaning}</p></div></div>
                    </Button>;
                  })}</div>
                  {showFeedback && (
                    <div className="mt-2">
                      <div className={cn("text-center p-4 rounded-lg", selectedChoice === (current as any).audioText ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20")}> 
                        <p className={cn("font-bold", selectedChoice === (current as any).audioText ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300")}>{selectedChoice === (current as any).audioText ? getCorrectFeedback() : getWrongFeedback(attemptCount)}</p>
                      </div>
                      {selectedChoice !== (current as any).audioText && retryMode && (
                        <div className="flex justify-center gap-2 mt-2">
                          <Button onClick={handleRetry} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg px-4 py-2">
                            <RotateCcw className="w-4 h-4 mr-2" />Try Again
                          </Button>
                          <Button onClick={handleNext} variant="outline" className="px-4 py-2 border-2 border-gray-400">Skip</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {(current as any).listeningFirst && listeningPhase === 'reveal' && (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  <div className="bg-green-100/80 dark:bg-green-900/40 rounded-2xl p-6 border-2 border-green-300 shadow-xl">
                    <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText} 
                        className="text-purple-600 hover:text-purple-700 h-7 w-7 p-0"
                        title="Replay this text with Nova voice"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{(current as any).revealText}</p>
                    <div className="mt-4 flex justify-center"><Button onClick={handleNext} className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-8 py-3">Continue Adventure! 🚀</Button></div>
                  </div>
                </div>
              )}
            </div>

            {/* DESKTOP: Two Column Layout */}
            <div className="hidden sm:flex sm:flex-row h-full gap-4 lg:gap-6">
              <div className="sm:flex sm:flex-col sm:items-center sm:justify-center sm:w-1/4 lg:w-1/3 sm:pr-2 lg:pr-4">
                <div className="relative">
                  <div className={cn("text-7xl md:text-8xl lg:text-9xl mb-4 lg:mb-6", "animate-float")}>
                    <span className={cn(current.id === 'celebrate' && 'animate-celebration-party')}>{current.emoji}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Sparkles key={i} className={cn("w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 transition-all duration-500 transform hover:scale-125", i < stars ? 'text-yellow-400 animate-pulse drop-shadow-lg' : 'text-gray-300 opacity-50')} />
                    ))}
                  </div>
                  <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 animate-float-slow">
                    <Code2 className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-purple-600 opacity-70" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center sm:pr-4 overflow-hidden max-h-full">
                {!current.listeningFirst && (
                  <div className="w-full">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 lg:p-5 mb-3 backdrop-blur-sm border-2 border-white/20 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        {current.title}
                        <Button variant="ghost" size="sm" onClick={playRevealText} className="text-purple-600 hover:text-purple-700 h-7 w-7 p-0" title="Replay this text with Nova voice">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </h3>
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed px-2">
                        {current.id === 'celebrate' ? getCelebrationText() : current.text}
                      </p>
                      <div className="flex justify-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📝 {current.wordCount || 0}</span>
                        <span>⏱️ {current.duration || 0}s</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={handleNext} className="rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base">
                        {stepIndex === storySteps.length - 1 ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            Complete Mission ✨
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Continue 🚀
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {(current as any).listeningFirst && listeningPhase === 'listening' && (
                  <div className="w-full">
                    <div className="bg-purple-50/70 dark:bg-purple-900/30 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-purple-300 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        <Cpu className="w-5 h-5 md:w-6 md:h-6 text-purple-600 animate-bounce" />
                        <span>{(current as any).audioInstruction}</span>
                      </h3>
                      {showTranscript && accessibilityMode && (current as any).audioText && (
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
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 bg-purple-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <div className="flex flex-col items-center gap-2 mt-3">
                        <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all", isPlaying && "animate-pulse")}>
                          <Volume2 className="w-4 h-4 mr-2" />
                          {isPlaying ? 'Playing...' : unlimitedReplays ? `Listen Again (${replaysUsed} plays)` : `Listen Again (${maxReplays - replaysUsed})`}
                        </Button>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                          👂 Listen carefully! {unlimitedReplays ? 'Unlimited plays' : `${maxReplays} plays available`}.
                        </p>
                        {hasListened && (
                          <Button onClick={handleProceedToQuestion} className="mt-1 bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-bold animate-bounce">
                            I'm Ready ✓
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {(current as any).listeningFirst && listeningPhase === 'question' && (
                  <div className="space-y-2">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-2 border-yellow-300">
                      <h4 className="text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1">{(current as any).question}</h4>
                      {showHint ? <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">💡 {(current as any).hint}</p> : <Button variant="outline" size="sm" onClick={() => setShowHint(true)} className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 h-7 px-3">Need a hint? 🧩</Button>}
                    </div>
                    <div className="flex justify-center"><Button onClick={handleReplayAudio} disabled={isPlaying} className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-4 py-1.5 text-xs"><Volume2 className="w-3 h-3 mr-1.5" />Replay</Button></div>
                    <div className="grid grid-cols-1 gap-1.5">{(current as any).choices?.map((choice: any, idx: number) => {
                      const isSelected = selectedChoice === choice.text;
                      const isCorrect = choice.text === (current as any).audioText;
                      const showResult = showFeedback && isSelected;
                      return <Button key={idx} onClick={() => handleChoice(choice)} disabled={showFeedback} className={cn("rounded-lg px-2.5 py-2 text-xs md:text-sm font-bold h-auto min-h-[42px] relative", showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white", showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white", !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-300")}>
                        <div className="flex items-center gap-2"><span className="text-lg">{choice.emoji}</span><div className="flex-1 text-left"><p className="font-bold text-xs md:text-sm">{choice.text}</p><p className="text-xs opacity-70">{choice.meaning}</p></div></div>
                      </Button>;
                    })}</div>
                    {showFeedback && <div className="mt-1.5"><div className={cn("rounded-lg p-2", selectedChoice === (current as any).audioText ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-orange-50 dark:bg-orange-900/20 text-orange-700")}><p className="text-xs md:text-sm font-bold">{selectedChoice === (current as any).audioText ? getCorrectFeedback() : getWrongFeedback(attemptCount)}</p></div>{selectedChoice !== (current as any).audioText && retryMode && <div className="flex justify-center gap-2 mt-2"><Button onClick={handleRetry} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 py-2"><RotateCcw className="w-4 h-4 mr-1.5" />Try Again</Button><Button onClick={handleNext} variant="outline" className="rounded-lg px-5 py-2 border-2 border-gray-600">Skip</Button></div>}</div>}
                  </div>
                )}
                
                {(current as any).listeningFirst && listeningPhase === 'reveal' && (
                  <div className="bg-green-100/80 dark:bg-green-900/40 rounded-xl p-5 border-2 border-green-300 shadow-xl">
                    <h3 className="text-sm md:text-base font-bold mb-2 text-gray-800 dark:text-white">{current.title}</h3>
                    <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200 leading-relaxed px-2">{(current as any).revealText}</p>
                    <div className="mt-3 flex justify-center"><Button onClick={handleNext} className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base">Continue Adventure! 🚀</Button></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <style>{`
        @keyframes waveform { 0%, 100% { height: 20px; } 50% { height: 50px; } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes celebration-party { 0% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 5px gold); } 25% { transform: scale(1.2) rotate(90deg); filter: drop-shadow(0 0 10px #ff6b6b); } 50% { transform: scale(1.1) rotate(180deg); filter: drop-shadow(0 0 15px #4ecdc4); } 75% { transform: scale(1.3) rotate(270deg); filter: drop-shadow(0 0 12px #45b7d1); } 100% { transform: scale(1) rotate(360deg); filter: drop-shadow(0 0 5px gold); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-celebration-party { animation: celebration-party 2s ease-in-out infinite; }
        .animate-waveform { animation: waveform 0.6s ease-in-out infinite; }
        .scrollbar-thin::-webkit-scrollbar { width: 8px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.7); }
        .scrollbar-thin { scrollbar-width: thin; scrollbar-color: rgba(156, 163, 175, 0.5) transparent; }
      `}</style>
    </div>
  );
};

export default TechInnovatorAdventure;
