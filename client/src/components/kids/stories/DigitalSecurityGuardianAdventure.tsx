import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ShieldCheck, Lock, Gauge, Volume2, X, Zap, Play, FileText, RotateCcw, ShieldAlert, KeyRound } from 'lucide-react';
import OnlineTTS, { STORY_VOICES } from '@/services/OnlineTTS';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const CIPHER_VOICE = STORY_VOICES.DigitalSecurityTeen;

type Props = { onClose: () => void; onComplete: (score: number) => void };

const storySteps = [
  {
    id: 'intro',
    title: '🔐 Welcome to Digital Security Guardian',
    text: "You're joining the Cyber Squad today! We'll master passwords, fight phishing, protect privacy, and keep devices safe. Listen carefully and earn THREE security badges to complete your mission.",
    emoji: '🔐',
    character: 'Cipher',
    bgColor: 'from-rose-100 to-red-100 dark:from-rose-900 dark:to-red-900',
    interactive: false,
    wordCount: 64,
    duration: 36
  },
  {
    id: 'passwords',
    title: '🔑 Strong Passwords',
    emoji: '🔑',
    character: 'Cipher',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'A strong password is long and unique, uses letters, numbers, and symbols, and is different for every account',
    audioInstruction: 'Listen to what makes a strong password.',
    question: 'What makes a strong password?',
    hint: 'Think: long, unique, mixed characters',
    choices: [
      { text: 'Short and easy to remember like 123456', emoji: '❌', meaning: 'weak' },
      { text: 'Your name and birthday', emoji: '🎂❌', meaning: 'personal info' },
      { text: 'A strong password is long and unique, uses letters, numbers, and symbols, and is different for every account', emoji: '✅', meaning: 'strong' }
    ],
    revealText: 'Correct! Strong passwords are long and unique, with letters, numbers, and symbols—never reuse them!',
    maxReplays: 5,
    wordCount: 44,
    duration: 30
  },
  {
    id: 'phishing',
    title: '🎣 Phishing Traps',
    emoji: '🎣',
    character: 'Cipher',
    bgColor: 'from-sky-100 to-cyan-100 dark:from-sky-900 dark:to-cyan-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Phishing messages try to trick you into sharing passwords or clicking fake links—check the sender and URL carefully',
    audioInstruction: 'Listen to how phishing works and how to spot it.',
    question: 'How do you spot phishing?',
    hint: 'Think: sender and URL',
    choices: [
      { text: 'Click every link to see what it is', emoji: '⚠️❌', meaning: 'unsafe' },
      { text: 'Share passwords if the email looks urgent', emoji: '🚫❌', meaning: 'never share' },
      { text: 'Phishing messages try to trick you into sharing passwords or clicking fake links—check the sender and URL carefully', emoji: '🔍✅', meaning: 'verify' }
    ],
    revealText: 'Exactly! Always verify the sender and hover over links to check the URL before you click.',
    maxReplays: 5,
    wordCount: 44,
    duration: 30
  },
  {
    id: 'two_factor',
    title: '🛡️ Two-Factor Authentication',
    emoji: '🛡️',
    character: 'Cipher',
    bgColor: 'from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Two-factor authentication adds a second step like a code or app, protecting your account even if a password leaks',
    audioInstruction: 'Listen to what two-factor authentication does.',
    question: 'Why use two-factor authentication?',
    hint: 'Think: second step protection',
    choices: [
      { text: 'It makes logging in slower for no reason', emoji: '🐌❌', meaning: 'inconvenience' },
      { text: 'Two-factor authentication adds a second step like a code or app, protecting your account even if a password leaks', emoji: '🛡️✅', meaning: 'extra protection' },
      { text: 'It replaces passwords completely', emoji: '🔄❌', meaning: 'not true' }
    ],
    revealText: 'Great! Two-factor adds a second step—like a code—so your account stays safe even if a password leaks.',
    maxReplays: 5,
    wordCount: 45,
    duration: 30
  },
  {
    id: 'privacy',
    title: '🕵️ Privacy & Digital Footprint',
    emoji: '🕵️',
    character: 'Cipher',
    bgColor: 'from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Your digital footprint is what you share online—protect it by limiting personal details and using privacy settings',
    audioInstruction: 'Listen to how to protect your privacy online.',
    question: 'How do you protect your digital footprint?',
    hint: 'Think: share less, use settings',
    choices: [
      { text: 'Share your location and school publicly', emoji: '📍❌', meaning: 'unsafe' },
      { text: 'Your digital footprint is what you share online—protect it by limiting personal details and using privacy settings', emoji: '🔒✅', meaning: 'protect' },
      { text: 'Post everything as soon as possible', emoji: '📸❌', meaning: 'oversharing' }
    ],
    revealText: 'Correct! Share less personal information and use privacy settings to control who sees your content.',
    maxReplays: 5,
    wordCount: 45,
    duration: 30
  },
  {
    id: 'downloads',
    title: '⬇️ Safe Downloads',
    emoji: '⬇️',
    character: 'Cipher',
    bgColor: 'from-stone-100 to-zinc-100 dark:from-stone-900 dark:to-zinc-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Download apps and files only from trusted sources—avoid random sites and check reviews before installing',
    audioInstruction: 'Listen to how to download safely.',
    question: 'How do you download safely?',
    hint: 'Think: trusted sources',
    choices: [
      { text: 'Download anything that is free', emoji: '💸❌', meaning: 'risky' },
      { text: 'Download apps and files only from trusted sources—avoid random sites and check reviews before installing', emoji: '✅', meaning: 'safe' },
      { text: 'Turn off antivirus for faster installs', emoji: '🧪❌', meaning: 'dangerous' }
    ],
    revealText: 'Right! Use trusted sources and check reviews. Keep security tools on while installing software.',
    maxReplays: 5,
    wordCount: 44,
    duration: 30
  },
  {
    id: 'report',
    title: '📣 Report & Block',
    emoji: '📣',
    character: 'Cipher',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'If you see bullying, scams, or threats—report, block, and tell a trusted adult or school counselor',
    audioInstruction: 'Listen to what to do when something feels wrong online.',
    question: 'What should you do if you see harmful behavior online?',
    hint: 'Think: report, block, tell',
    choices: [
      { text: 'Join the argument to defend yourself', emoji: '⚔️❌', meaning: 'escalation' },
      { text: 'Ignore it and hope it stops', emoji: '🙈❌', meaning: 'inaction' },
      { text: 'If you see bullying, scams, or threats—report, block, and tell a trusted adult or school counselor', emoji: '🛑✅', meaning: 'action' }
    ],
    revealText: 'Exactly! Report, block, and tell a trusted adult. You are never alone—get help and stay safe.',
    maxReplays: 5,
    wordCount: 46,
    duration: 30
  },
  {
    id: 'debrief',
    title: '✅ Security Debrief',
    text: "Excellent work! You learned about strong passwords, phishing traps, two-factor authentication, privacy, safe downloads, and reporting. You're becoming a true Digital Security Guardian!",
    emoji: '✅',
    character: 'Cipher',
    bgColor: 'from-rose-100 to-red-100 dark:from-rose-900 dark:to-red-900',
    interactive: false,
    wordCount: 48,
    duration: 34
  },
  {
    id: 'celebrate',
    title: '🎉 Security Badges Earned!',
    text: '',
    emoji: '🎉',
    character: 'Cipher',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 48,
    duration: 36
  }
];

const DigitalSecurityGuardianAdventure = ({ onClose, onComplete }: Props) => {
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
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('slow');
  const [retryMode, setRetryMode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [currentSession, setCurrentSession] = useState<StorySession | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [ttsInitialized, setTtsInitialized] = useState(false);
  const [isRevealTextPlaying, setIsRevealTextPlaying] = useState(false);
  const [canContinue, setCanContinue] = useState(false);

  const current = storySteps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / storySteps.length) * 100);
  const totalSteps = storySteps.length;
  const totalWords = storySteps.reduce((sum, step) => sum + step.wordCount, 0);
  const totalDuration = storySteps.reduce((sum, step) => sum + step.duration, 0);
  const maxReplays = (current as any).maxReplays || 5;
  const unlimitedReplays = true;

  const getCelebrationText = (): string => {
    if (current.id === 'celebrate') {
      if (stars >= 3) return "Outstanding! You earned all three security badges! You're a true Digital Security Guardian—smart, careful, and ready to lead.";
      if (stars === 2) return 'Great work! Two security badges earned. One more to complete your guardian set—keep training!';
      if (stars === 1) return 'Good start! One security badge earned. Keep listening and practicing to master cyber safety!';
      return 'Mission complete. Every safe choice makes you stronger. Keep protecting your digital world!';
    }
    return (current as any).revealText || current.text || '';
  };

  const estimateReadMs = (text: string): number => {
    const textLength = text.length;
    const wpm = playbackSpeed === 'slow' ? 120 : playbackSpeed === 'slower' ? 80 : 160;
    return Math.max(1500, (textLength / 5) * (60000 / wpm));
  };

  useEffect(() => {
    const init = async () => {
      try { await OnlineTTS.initialize(); setTtsAvailable(OnlineTTS.isAvailable()); setTtsInitialized(true); OnlineTTS.logAvailableVoices(); } catch { setTtsAvailable(false); }
    };
    init();
    const initSession = async () => { await KidsListeningAnalytics.initialize(userId); const s = KidsListeningAnalytics.startSession(userId, 'digital-security-guardian-teen', 'Digital Security Guardian (Teen)'); setCurrentSession(s); };
    initSession();
    return () => { OnlineTTS.stop(); };
  }, [userId]);

  useEffect(() => { const t = setInterval(() => setTimeSpent(p => p + 1), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if ((current as any).listeningFirst) { setListeningPhase('listening'); setReplaysUsed(0); setHasListened(false); setAttemptCount(0); setRetryMode(false); } else { setListeningPhase('reveal'); }
    setSelectedChoice(null); setShowFeedback(false); setShowHint(false);
    setCanContinue(false);
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
    if ((current as any).listeningFirst && listeningPhase === 'question' && (current as any).choices) {
      setShuffledChoices(shuffleArray((current as any).choices));
    } else {
      setShuffledChoices(null);
    }
  }, [stepIndex, listeningPhase]);

  const stripEmojis = (text: string): string => {
    // Remove ALL emoji characters to prevent TTS from reading emojis (including stars ⭐, 🌟, etc.)
    return text.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, '').trim();
  };

  const playAudioWithCaptions = async (text: string) => {
    try {
      const clean = stripEmojis(text);
      if (!OnlineTTS.isAvailable()) throw new Error('TTS not available');
      await OnlineTTS.speak(clean, CIPHER_VOICE, { speed: playbackSpeed, showCaptions: false, onCaptionUpdate: () => {} });
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
      setCanContinue(false);
      await playAudioWithCaptions(textToSpeak);
      const ms = estimateReadMs(textToSpeak);
      setTimeout(() => setCanContinue(true), ms);
    } catch {}
  };

  useEffect(() => {
    const autoplay = async () => {
      if (!ttsAvailable) {
        if ((current as any).listeningFirst && listeningPhase === 'reveal' && (current as any).revealText) {
          const text = (current as any).revealText as string;
          setCanContinue(false);
          const ms = estimateReadMs(text);
          setTimeout(() => setCanContinue(true), ms);
        } else if (!(current as any).listeningFirst && ((current as any).text || current.id === 'celebrate')) {
          const text = current.id === 'celebrate' ? getCelebrationText() : (current as any).text;
          setCanContinue(false);
          const ms = estimateReadMs(text);
          setTimeout(() => setCanContinue(true), ms);
        }
        return;
      }
      if ((current as any).listeningFirst && listeningPhase === 'listening' && (current as any).audioText) {
        setIsPlaying(true); setAudioWaveform(true);
        try { await playAudioWithCaptions((current as any).audioText); setHasListened(true); } catch { setHasListened(true); }
        setIsPlaying(false); setAudioWaveform(false);
      } else if (listeningPhase === 'reveal' && (current as any).listeningFirst && (current as any).revealText) {
        setIsPlaying(true); setIsRevealTextPlaying(true);
        try {
          setCanContinue(false);
          const text = (current as any).revealText as string;
          await playAudioWithCaptions(text);
          const ms = estimateReadMs(text);
          setTimeout(() => setCanContinue(true), ms);
          // Wait for full reading time after TTS completes
          await new Promise(r => setTimeout(r, ms));
        } catch {}
        setIsPlaying(false); setIsRevealTextPlaying(false);
      } else if (!(current as any).listeningFirst && ((current as any).text || current.id === 'celebrate')) {
        setIsPlaying(true);
        try {
          const text = current.id === 'celebrate' ? getCelebrationText() : (current as any).text;
          setCanContinue(false);
          await playAudioWithCaptions(text);
          const ms = estimateReadMs(text);
          setTimeout(() => setCanContinue(true), ms);
        } catch {}
        setIsPlaying(false);
      }
    };
    autoplay();
  }, [listeningPhase, stepIndex, playbackSpeed, stars]);

  useEffect(() => { /* mark animation states as used */ }, [audioWaveform, isRevealTextPlaying]);

  const handleNext = () => {
    if (stepIndex < storySteps.length - 1) { setStepIndex(i => i + 1); return; }
    const score = Math.min(100, 40 + correctAnswers * 20 + Math.max(0, 300 - timeSpent) * 0.1 + stars * 10);
    if (currentSession) KidsListeningAnalytics.completeSession(userId, currentSession, score, stars);
    OnlineTTS.stop(); onComplete(score);
  };

  const handleReplayAudio = async () => {
    if (!unlimitedReplays && replaysUsed >= maxReplays) return;
    if (!(current as any).listeningFirst) return;
    setReplaysUsed(p => p + 1); setIsPlaying(true); setAudioWaveform(true);
    try { await playAudioWithCaptions((current as any).audioText); setHasListened(true); } catch { setHasListened(true); }
    setIsPlaying(false); setAudioWaveform(false);
  };

  const handleProceedToQuestion = () => { if (!hasListened) return; setListeningPhase('question'); setQuestionStartTime(Date.now()); };

  const handleChoice = async (choiceObj: any) => {
    const choice = typeof choiceObj === 'string' ? choiceObj : choiceObj.text;
    setSelectedChoice(choice);
    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);
    const questionTime = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = choice === (current as any).audioText;

    if (currentSession && (current as any).listeningFirst) {
      const updated = KidsListeningAnalytics.recordAttempt(currentSession, current.id, (current as any).question || '', isCorrect, currentAttempt, replaysUsed, questionTime);
      setCurrentSession(updated);
    }

    if (isCorrect) {
      setCorrectAnswers(p => p + 1);
      if (current.id === 'passwords') { setStars(1); }
      else if (current.id === 'phishing') { setStars(2); }
      else if (current.id === 'two_factor') { setStars(3); }

      setShowFeedback(true); setRetryMode(false);
      setTimeout(() => setListeningPhase('reveal'), 2500);
      const revealText = ((current as any).revealText || '') as string;
      const wpm = playbackSpeed === 'slow' ? 120 : playbackSpeed === 'slower' ? 80 : 160;
      const estimated = Math.max(10000, (revealText.length / 5) * (60000 / wpm) + 2000);
      setTimeout(() => {
        if (!isRevealTextPlaying) { handleNext(); } else { setTimeout(() => handleNext(), 2000); }
      }, estimated);
    } else { setRetryMode(true); setShowFeedback(true); }
  };

  const handleRetry = () => { setRetryMode(false); setSelectedChoice(null); setShowFeedback(false); setListeningPhase('listening'); setReplaysUsed(0); };

  const getCorrectFeedback = () => {
    const messages = [
      '🎉 Excellent! Security badge unlocked! 🌟',
      '🌟 Great detection! You chose the secure option!',
      '✅ Strong choice! That keeps you safe online!',
      '🔐 Perfect! You think like a security pro!',
      '🛡️ Awesome! Your cyber defense is strong!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getWrongFeedback = (attempt: number) => attempt === 1 ? '💪 Not quite—listen again and try the safest option!' : '🌟 Keep going! Replay and choose the most secure answer!';

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
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Digital Security Guardian</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">⭐ {stars}/3 Badges</div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => { const ns = playbackSpeed === 'slow' ? 'slower' : playbackSpeed === 'slower' ? 'normal' : 'slow'; setPlaybackSpeed(ns); OnlineTTS.stop(); }} className="h-7 px-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 bg-green-50 dark:bg-green-800 hover:bg-green-100 dark:hover:bg-green-700 border border-green-200 dark:border-green-600 text-green-800 dark:text-green-100">
                  <Gauge className="w-3.5 h-3.5 mr-1" />{playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
                </Button>
                {(listeningPhase === 'listening' || listeningPhase === 'question') && (current as any).listeningFirst && (
                  <Button variant="ghost" size="sm" onClick={() => setShowTranscript(!showTranscript)} className={cn("h-7 w-7 p-0 rounded-full border", showTranscript ? "bg-blue-100 dark:bg-blue-800" : "bg-white/80 dark:bg-gray-700")}>
                    <FileText className={cn("w-3.5 h-3.5", showTranscript ? "text-blue-700 dark:text-blue-200" : "text-gray-700 dark:text-gray-200")} />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {ttsInitialized && ttsAvailable && (
            <div className="mb-2 bg-gradient-to-r from-rose-500 to-red-500 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 justify-center"><Volume2 className="w-4 h-4" /><span className="text-xs sm:text-sm font-bold">Cipher's voice is ready! Listen carefully!</span></div>
            </div>
          )}

          <Progress value={progress} className="h-2 sm:h-2 mb-3 sm:mb-4 bg-white/30"><div className="h-full bg-gradient-to-r from-rose-400 to-red-400 rounded-full transition-all duration-500" /></Progress>

          <div className="flex-1 overflow-y-auto overflow-x-hidden sm:overflow-hidden pb-2 sm:pb-4 scrollbar-thin">
            {/* MOBILE */}
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
                  <ShieldCheck className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-rose-600 opacity-70" />
                </div>
              </div>

              {!(current as any).listeningFirst && (
                <>
                  <div className="mb-4 text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                      <span>{current.title}</span>
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-rose-600 hover:text-rose-700 h-8 w-8 p-0 rounded-full" title="Replay this text with Cipher voice">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{current.id === 'celebrate' ? getCelebrationText() : (current as any).text}</p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button onClick={handleNext} disabled={!canContinue} className={cn("bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-8 py-3 font-bold", !canContinue && "opacity-60 cursor-not-allowed") }>
                      {stepIndex === storySteps.length - 1 ? 'Complete! ✨' : 'Continue →'}
                    </Button>
                  </div>
                </>
              )}

              {(current as any).listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-rose-300 shadow-lg">
                    <Volume2 className="w-8 h-8 text-rose-600 mx-auto mb-2 animate-pulse" />
                    {showTranscript && (current as any).audioText && <p className="text-sm sm:text-base mb-2 font-semibold text-gray-900 dark:text-white">{(current as any).audioText}</p>}
                    {!showTranscript && <p className="text-sm text-gray-600 dark:text-gray-400">{isPlaying ? '👂 Listening...' : hasListened ? '👂 Ready to proceed!' : '👂 Press play to start!'}</p>}
                    <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("w-full mt-3", "bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 py-3", isPlaying && "animate-pulse")}><Volume2 className="mr-2 h-4 w-4" />{isPlaying ? 'Playing...' : '🔊 Play Audio'}</Button>
                    {hasListened && <Button onClick={handleProceedToQuestion} className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white rounded-xl px-6 py-3 font-bold animate-bounce">I'm Ready! ✓</Button>}
                  </div>
                </div>
              )}

              {(current as any).listeningFirst && listeningPhase === 'question' && (
                <div className="space-y-2 max-w-4xl mx-auto w-full">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-1">{(current as any).question}</h4>
                    {showHint ? <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">💡 {(current as any).hint}</p> : <Button variant="outline" size="sm" onClick={() => setShowHint(true)} className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs">Need a hint? 🧩</Button>}
                  </div>
                  <div className="flex justify-center mb-2"><Button onClick={handleReplayAudio} disabled={isPlaying} className="rounded-xl px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold"><Volume2 className="w-4 h-4 mr-2" />Listen Again</Button></div>
                  <div className="grid grid-cols-1 gap-3">{(shuffledChoices || (current as any).choices)?.map((choice: any, idx: number) => {
                    const isSelected = selectedChoice === choice.text;
                    const isCorrect = choice.text === (current as any).audioText;
                    const showResult = showFeedback && isSelected;
                    return <Button key={idx} onClick={() => handleChoice(choice)} disabled={showFeedback} className={cn("rounded-xl px-4 py-3 text-sm font-bold h-auto min-h-[55px]", showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white animate-bounce", showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white", !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200")}> 
                      <div className="flex items-center gap-2 w-full"><div className="flex-1 text-left"><p className="font-bold">{stripEmojis(choice.text)}</p><p className="text-xs opacity-70">{choice.meaning}</p></div></div>
                    </Button>;
                  })}</div>
                  {showFeedback && <div className="mt-2"><div className={cn("text-center p-4 rounded-lg", selectedChoice === (current as any).audioText ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900") }><p className={cn("font-bold", selectedChoice === (current as any).audioText ? "text-green-800" : "text-red-800")}>{selectedChoice === (current as any).audioText ? getCorrectFeedback() : getWrongFeedback(attemptCount)}</p></div>{selectedChoice !== (current as any).audioText && retryMode && <div className="flex justify-center gap-2 mt-2"><Button onClick={handleRetry} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2"><RotateCcw className="w-4 h-4 mr-2" />Try Again</Button><Button onClick={handleNext} variant="outline" className="px-4 py-2 border-2 border-gray-400">Skip</Button></div>}</div>}
                </div>
              )}

              {(current as any).listeningFirst && listeningPhase === 'reveal' && (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  <div className="bg-green-100/80 dark:bg-green-900/40 rounded-2xl p-6 border-2 border-green-300 shadow-xl">
                    <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-rose-600 hover:text-rose-700 h-7 w-7 p-0" title="Replay this text with Cipher voice">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-200 leading-relaxed font-medium">{(current as any).revealText}</p>
                    <div className="mt-4 flex justify-center"><Button onClick={handleNext} disabled={!canContinue} className={cn("bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-8 py-3", !canContinue && "opacity-60 cursor-not-allowed")}>Continue Mission! 🛡️</Button></div>
                  </div>
                </div>
              )}
            </div>

            {/* DESKTOP */}
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
                    <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-rose-600 opacity-70" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center sm:pr-4 overflow-hidden max-h-full">
                {!(current as any).listeningFirst && (
                  <div className="w-full">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 lg:p-5 mb-3 backdrop-blur-sm border-2 border-white/20 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        {current.title}
                        <Button variant="ghost" size="sm" onClick={playRevealText} className="text-rose-600 hover:text-rose-700 h-7 w-7 p-0" title="Replay this text with Cipher voice">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </h3>
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed px-2">
                        {current.id === 'celebrate' ? getCelebrationText() : (current as any).text}
                      </p>
                      <div className="flex justify-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📝 {current.wordCount || 0}</span>
                        <span>⏱️ {current.duration || 0}s</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={handleNext} disabled={!canContinue} className={cn("rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base", !canContinue && "opacity-60 cursor-not-allowed") }>
                        {stepIndex === storySteps.length - 1 ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            Complete Mission ✨
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Continue 🛡️
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {(current as any).listeningFirst && listeningPhase === 'listening' && (
                  <div className="w-full">
                    <div className="bg-rose-50/70 dark:bg-rose-900/30 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-rose-300 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        <KeyRound className="w-5 h-5 md:w-6 md:h-6 text-rose-600 animate-bounce" />
                        <span>{(current as any).audioInstruction}</span>
                      </h3>
                      {showTranscript && (current as any).audioText && (
                        <div className="mb-3 bg-rose-50/90 dark:bg-rose-900/30 rounded-lg p-3 border-2 border-rose-300">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-rose-600" />
                            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Accessibility Transcript:</span>
                          </div>
                          <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium">
                            "{(current as any).audioText}"
                          </p>
                          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">
                            ⚠️ Try to listen carefully instead of reading!
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 bg-rose-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <div className="flex flex-col items-center gap-2 mt-3">
                        <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-bold transition-all", isPlaying && "animate-pulse")}>
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
                    <div className="flex justify-center"><Button onClick={handleReplayAudio} disabled={isPlaying} className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg px-4 py-1.5 text-xs"><Volume2 className="w-3 h-3 mr-1.5" />Replay</Button></div>
                    <div className="grid grid-cols-1 gap-1.5">{(shuffledChoices || (current as any).choices)?.map((choice: any, idx: number) => {
                      const isSelected = selectedChoice === choice.text;
                      const isCorrect = choice.text === (current as any).audioText;
                      const showResult = showFeedback && isSelected;
                      return <Button key={idx} onClick={() => handleChoice(choice)} disabled={showFeedback} className={cn("rounded-lg px-2.5 py-2 text-xs md:text-sm font-bold h-auto min-h-[42px] relative", showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white", showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white", !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-300")}> 
                        <div className="flex items-center gap-2"><div className="flex-1 text-left"><p className="font-bold text-xs md:text-sm">{stripEmojis(choice.text)}</p><p className="text-xs opacity-70">{choice.meaning}</p></div></div>
                      </Button>;
                    })}</div>
                    {showFeedback && <div className="mt-1.5"><div className={cn("rounded-lg p-2", selectedChoice === (current as any).audioText ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-rose-50 dark:bg-rose-900/20 text-rose-700")}><p className="text-xs md:text-sm font-bold">{selectedChoice === (current as any).audioText ? getCorrectFeedback() : getWrongFeedback(attemptCount)}</p></div>{selectedChoice !== (current as any).audioText && retryMode && <div className="flex justify-center gap-2 mt-2"><Button onClick={handleRetry} className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg px-5 py-2"><RotateCcw className="w-4 h-4 mr-1.5" />Try Again</Button><Button onClick={handleNext} variant="outline" className="rounded-lg px-5 py-2 border-2 border-gray-600">Skip</Button></div>}</div>}
                  </div>
                )}

                {(current as any).listeningFirst && listeningPhase === 'reveal' && (
                  <div className="bg-green-100/80 dark:bg-green-900/40 rounded-xl p-5 border-2 border-green-300 shadow-xl">
                    <h3 className="text-sm md:text-base font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-rose-600 hover:text-rose-700 h-7 w-7 p-0" title="Replay this text with Cipher voice">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-200 leading-relaxed px-2 font-medium">{(current as any).revealText}</p>
                    <div className="mt-3 flex justify-center"><Button onClick={handleNext} disabled={!canContinue} className={cn("bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base", !canContinue && "opacity-60 cursor-not-allowed")}>Continue Mission! 🛡️</Button></div>
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

export default DigitalSecurityGuardianAdventure;


