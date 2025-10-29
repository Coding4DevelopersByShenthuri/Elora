import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, MessageSquare, ShieldCheck, Volume2, X, Zap, Play, FileText, RotateCcw, Wifi, Users, AlertTriangle } from 'lucide-react';
import OnlineTTS, { STORY_VOICES } from '@/services/OnlineTTS';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const PIXEL_VOICE = STORY_VOICES.PixelTeen;

type Props = { onClose: () => void; onComplete: (score: number) => void };

const storySteps = [
  {
    id: 'intro',
    title: '📱 Welcome to Social Media Expert',
    text: 'Today you will explore smart digital communication, privacy, empathy online, and how to spot misinformation. Listen carefully and earn THREE digital badges to become a Social Media Expert!',
    emoji: '📱',
    character: 'Pixel',
    bgColor: 'from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900',
    interactive: false,
    wordCount: 48,
    duration: 28
  },
  {
    id: 'privacy',
    title: '🔒 Privacy Basics',
    emoji: '🔒',
    character: 'Pixel',
    bgColor: 'from-violet-100 to-indigo-100 dark:from-violet-900 dark:to-indigo-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Privacy means controlling who can see your information',
    audioInstruction: 'Listen to what privacy means.',
    question: 'What is privacy?',
    hint: 'Think about who can see your data',
    choices: [
      { text: 'Privacy means posting everything publicly', emoji: '📣❌', meaning: 'public' },
      { text: 'Privacy means controlling who can see your information', emoji: '🛡️✅', meaning: 'control' },
      { text: 'Privacy is not important online', emoji: '⚠️❌', meaning: 'unsafe' }
    ],
    revealText: 'Correct! Privacy means controlling who can see your information. Use strong settings and share carefully.',
    maxReplays: 5,
    wordCount: 36,
    duration: 28
  },
  {
    id: 'footprint',
    title: '👣 Digital Footprint',
    emoji: '👣',
    character: 'Pixel',
    bgColor: 'from-rose-100 to-pink-100 dark:from-rose-900 dark:to-pink-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'A digital footprint is the record of what you do online',
    audioInstruction: 'Listen to what a digital footprint is.',
    question: 'What is a digital footprint?',
    hint: 'Think about the trace you leave online',
    choices: [
      { text: 'A digital footprint is just your shoe size', emoji: '👟❌', meaning: 'shoes' },
      { text: 'A digital footprint is the record of what you do online', emoji: '🌐✅', meaning: 'record' },
      { text: 'A digital footprint is a secret code', emoji: '🧩❌', meaning: 'code' }
    ],
    revealText: 'Exactly! Your digital footprint is the record of what you do online—post wisely and think long-term.',
    maxReplays: 5,
    wordCount: 38,
    duration: 28
  },
  {
    id: 'misinfo',
    title: '📰 Spot Misinformation',
    emoji: '📰',
    character: 'Pixel',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Misinformation is false or misleading content shared online',
    audioInstruction: 'Listen to what misinformation is.',
    question: 'What is misinformation?',
    hint: 'Think about content that is not accurate',
    choices: [
      { text: 'Misinformation is always honest and accurate', emoji: '✅❌', meaning: 'accurate' },
      { text: 'Misinformation is false or misleading content shared online', emoji: '⚠️✅', meaning: 'false' },
      { text: 'Misinformation is a harmless joke', emoji: '😂❌', meaning: 'joke' }
    ],
    revealText: 'Right! Misinformation is false or misleading content. Always check sources before sharing.',
    maxReplays: 5,
    wordCount: 39,
    duration: 30
  },
  {
    id: 'empathy',
    title: '💬 Empathy Online',
    emoji: '💬',
    character: 'Pixel',
    bgColor: 'from-cyan-100 to-sky-100 dark:from-cyan-900 dark:to-sky-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Empathy means understanding and respecting others feelings online',
    audioInstruction: 'Listen to what empathy means.',
    question: 'What does empathy mean online?',
    hint: 'Think about kindness and respect',
    choices: [
      { text: 'Empathy means ignoring everyone', emoji: '🙉❌', meaning: 'ignore' },
      { text: 'Empathy means understanding and respecting others feelings online', emoji: '🤝✅', meaning: 'respect' },
      { text: 'Empathy means starting arguments', emoji: '🔥❌', meaning: 'argue' }
    ],
    revealText: 'Great! Empathy means understanding and respecting others—use kind words and assume good intent.',
    maxReplays: 5,
    wordCount: 38,
    duration: 28
  },
  {
    id: 'settings',
    title: '🛠️ Smart Settings',
    emoji: '🛠️',
    character: 'Pixel',
    bgColor: 'from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Use strong passwords and two factor authentication to protect accounts',
    audioInstruction: 'Listen to how to secure your accounts.',
    question: 'How can you secure your accounts?',
    hint: 'Think passwords and extra verification',
    choices: [
      { text: 'Use weak passwords and share them', emoji: '🔓❌', meaning: 'weak' },
      { text: 'Use strong passwords and two factor authentication', emoji: '🛡️✅', meaning: 'secure' },
      { text: 'Never update settings', emoji: '⛔❌', meaning: 'never' }
    ],
    revealText: 'Exactly! Use strong passwords and two-factor authentication. Small steps make a big difference.',
    maxReplays: 5,
    wordCount: 36,
    duration: 28
  },
  {
    id: 'badges',
    title: '🏆 Digital Badges Earned',
    emoji: '🏆',
    character: 'Pixel',
    bgColor: 'from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900',
    interactive: false,
    wordCount: 42,
    duration: 32,
    text: 'Amazing! You learned privacy basics, digital footprints, misinformation, empathy, and smart settings. You are now a Social Media Expert—use your skills to make the internet better.'
  },
  {
    id: 'celebrate',
    title: '🎉 Social Media Expert',
    text: '',
    emoji: '🎉',
    character: 'Pixel',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 40,
    duration: 34
  }
];

const SocialMediaExpertAdventure = ({ onClose, onComplete }: Props) => {
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
  const [playbackSpeed, setPlaybackSpeed] = useState<'normal' | 'slow' | 'slower'>('slow');
  const [retryMode, setRetryMode] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [ttsAvailable, setTtsAvailable] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [currentSession, setCurrentSession] = useState<StorySession | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [ttsInitialized, setTtsInitialized] = useState(false);
  const [isRevealTextPlaying, setIsRevealTextPlaying] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<any[] | null>(null);

  const current = storySteps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / storySteps.length) * 100);
  const totalSteps = storySteps.length;
  const totalWords = storySteps.reduce((sum, step) => sum + (step as any).wordCount, 0);
  const totalDuration = storySteps.reduce((sum, step) => sum + (step as any).duration, 0);
  const maxReplays = (current as any).maxReplays || 5;
  const unlimitedReplays = true;

  const getCelebrationText = (): string => {
    if (current.id === 'celebrate') {
      if (stars >= 3) return "Outstanding! You earned all three digital badges. Lead with kindness, privacy, and truth online!";
      if (stars === 2) return "Great work! You earned two digital badges. One more to become a full Social Media Expert!";
      if (stars === 1) return "Good start! You earned one digital badge. Keep practicing smart online habits!";
      return "Digital journey complete. Every post shapes your future—choose wisely!";
    }
    return (current as any).revealText || (current as any).text || '';
  };

  const estimateReadMs = (text: string): number => {
    const textLength = text.length;
    const wpm = playbackSpeed === 'slow' ? 120 : playbackSpeed === 'slower' ? 80 : 160;
    return Math.max(1500, (textLength / 5) * (60000 / wpm));
  };

  useEffect(() => {
    const init = async () => {
      try {
        await OnlineTTS.initialize();
        setTtsAvailable(OnlineTTS.isAvailable());
        setTtsInitialized(true);
        OnlineTTS.logAvailableVoices();
      } catch {
        setTtsAvailable(false);
      }
    };
    init();
    const initSession = async () => {
      await KidsListeningAnalytics.initialize(userId);
      const s = KidsListeningAnalytics.startSession(userId, 'social-media-expert-teen', 'Social Media Expert (Teen)');
      setCurrentSession(s);
    };
    initSession();
    return () => { OnlineTTS.stop(); };
  }, [userId]);

  useEffect(() => { const t = setInterval(() => setTimeSpent(p => p + 1), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if ((current as any).listeningFirst) { setListeningPhase('listening'); setReplaysUsed(0); setHasListened(false); setAttemptCount(0); setRetryMode(false); } else { setListeningPhase('reveal'); }
    setSelectedChoice(null); setShowFeedback(false); setShowHint(false);
    setCanContinue(false);
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
    if ((current as any).listeningFirst && listeningPhase === 'question' && (current as any).choices) {
      setShuffledChoices(shuffleArray((current as any).choices));
    } else {
      setShuffledChoices(null);
    }
  }, [stepIndex, listeningPhase]);

  const stripEmojis = (text: string): string => text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{E0020}-\u{E007F}]/gu, '').trim();

  const playAudioWithCaptions = async (text: string) => {
    try {
      const clean = stripEmojis(text);
      if (!OnlineTTS.isAvailable()) throw new Error('TTS not available');
      await OnlineTTS.speak(clean, PIXEL_VOICE, { speed: playbackSpeed, showCaptions: false, onCaptionUpdate: () => {} });
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
      textToSpeak = (current as any).revealText || (current as any).text || '';
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
        } else if (!(current as any).listeningFirst && (current as any).text) {
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
          await new Promise(r => setTimeout(r, 1000));
        } catch {}
        setIsPlaying(false); setIsRevealTextPlaying(false);
      } else if (!(current as any).listeningFirst && (current as any).text) {
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

  useEffect(() => { /* bind animation states */ }, [audioWaveform, isRevealTextPlaying]);

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

  const isCorrectChoice = (choiceText: string): boolean => {
    const answer = (current as any).audioText as string;
    return choiceText === answer || answer.includes(choiceText);
  };

  const handleChoice = async (choiceObj: any) => {
    const choice = typeof choiceObj === 'string' ? choiceObj : choiceObj.text;
    setSelectedChoice(choice);
    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);
    const questionTime = Math.round((Date.now() - questionStartTime) / 1000);
    // Check for exact match first, then check if choice is contained in audioText
    const isCorrect = isCorrectChoice(choice);

    if (currentSession && (current as any).listeningFirst) {
      const updated = KidsListeningAnalytics.recordAttempt(currentSession, (current as any).id, (current as any).question || '', isCorrect, currentAttempt, replaysUsed, questionTime);
      setCurrentSession(updated);
    }

    if (isCorrect) {
      setCorrectAnswers(p => p + 1);
      if (current.id === 'privacy') { setStars(1); }
      else if (current.id === 'misinfo') { setStars(2); }
      else if (current.id === 'settings') { setStars(3); }

      setShowFeedback(true); setRetryMode(false);
      setTimeout(() => setListeningPhase('reveal'), 2000);
      const revealText = ((current as any).revealText || '') as string;
      const wpm = playbackSpeed === 'slow' ? 120 : playbackSpeed === 'slower' ? 80 : 160;
      const estimated = Math.max(9000, (revealText.length / 5) * (60000 / wpm) + 1500);
      setTimeout(() => {
        if (!isRevealTextPlaying) {
          handleNext();
        } else {
          setTimeout(() => handleNext(), 1500);
        }
      }, estimated);
    } else { setRetryMode(true); setShowFeedback(true); }
  };

  const handleRetry = () => { setRetryMode(false); setSelectedChoice(null); setShowFeedback(false); setListeningPhase('listening'); setReplaysUsed(0); };

  const getCorrectFeedback = () => {
    const messages = ["🎉 Excellent! Digital badge unlocked!", "🌟 Great judgment!", "✨ Smart move!", "🎯 Nailed it!", "💫 Pro-level insight!"];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  const getWrongFeedback = (attempt: number) => attempt === 1 ? '💪 Not yet! Listen again carefully.' : '🌟 Keep trying—replay and focus on key words!';

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
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Social Media Expert</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">⭐ {stars}/3 Badges</div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => { const ns = playbackSpeed === 'slow' ? 'slower' : playbackSpeed === 'slower' ? 'normal' : 'slow'; setPlaybackSpeed(ns); OnlineTTS.stop(); }} className="h-7 px-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 bg-pink-50 dark:bg-pink-800 hover:bg-pink-100 dark:hover:bg-pink-700 border border-pink-200 dark:border-pink-600 text-pink-800 dark:text-pink-100">
                  <Wifi className="w-3.5 h-3.5 mr-1" />{playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
                </Button>
                {(listeningPhase === 'listening' || listeningPhase === 'question') && (current as any).listeningFirst && (
                  <Button variant="ghost" size="sm" onClick={() => setAccessibilityMode(!accessibilityMode)} className={cn("h-7 px-2 rounded-full text-xs", accessibilityMode && "bg-purple-100 dark:bg-purple-900 border border-purple-300")}>👂 {accessibilityMode ? 'ON' : 'Help'}</Button>
                )}
                {(listeningPhase === 'reveal' || !(current as any).listeningFirst || accessibilityMode) && (
                  <Button variant="ghost" size="sm" onClick={() => setShowTranscript(!showTranscript)} className={cn("h-7 w-7 p-0 rounded-full border", showTranscript ? "bg-blue-100 dark:bg-blue-800" : "bg-white/80 dark:bg-gray-700")}>
                    <FileText className={cn("w-3.5 h-3.5", showTranscript ? "text-blue-700 dark:text-blue-200" : "text-gray-700 dark:text-gray-200")} />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {ttsInitialized && ttsAvailable && (
            <div className="mb-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 justify-center"><Volume2 className="w-4 h-4" /><span className="text-xs sm:text-sm font-bold">Pixel's voice is ready! Listen closely!</span></div>
            </div>
          )}

          <Progress value={progress} className="h-2 sm:h-2 mb-3 sm:mb-4 bg-white/30"><div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500" /></Progress>

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
                  <ShieldCheck className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-pink-600 opacity-70" />
                </div>
              </div>

              {!(current as any).listeningFirst && (
                <>
                  <div className="mb-4 text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                      <span>{current.title}</span>
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-pink-600 hover:text-pink-700 h-8 w-8 p-0 rounded-full" title="Replay this text with Pixel voice">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{current.id === 'celebrate' ? getCelebrationText() : (current as any).text}</p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button onClick={handleNext} disabled={!canContinue} className={cn("bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-8 py-3 font-bold", !canContinue && "opacity-60 cursor-not-allowed") }>
                      {stepIndex === storySteps.length - 1 ? 'Complete! ✨' : 'Continue →'}
                    </Button>
                  </div>
                </>
              )}

              {(current as any).listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-pink-300 shadow-lg">
                    <Volume2 className="w-8 h-8 text-pink-600 mx-auto mb-2 animate-pulse" />
                    {(showTranscript || accessibilityMode) && (current as any).audioText && <p className="text-sm sm:text-base mb-2 font-semibold text-gray-900 dark:text-white">{(current as any).audioText}</p>}
                    <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("w-full mt-3", "bg-pink-600 hover:bg-pink-700 text-white rounded-xl px-6 py-3", isPlaying && "animate-pulse")}><Volume2 className="mr-2 h-4 w-4" />{isPlaying ? 'Playing...' : '🔊 Play Audio'}</Button>
                    {hasListened && <Button onClick={handleProceedToQuestion} className="mt-2 w-full bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-6 py-3 font-bold animate-bounce">I'm Ready! ✓</Button>}
                  </div>
                </div>
              )}

              {(current as any).listeningFirst && listeningPhase === 'question' && (
                <div className="space-y-2 max-w-4xl mx-auto w-full">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-1">{(current as any).question}</h4>
                    {showHint ? <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">💡 {(current as any).hint}</p> : <Button variant="outline" size="sm" onClick={() => setShowHint(true)} className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs">Need a hint? 🧩</Button>}
                  </div>
                  <div className="flex justify-center mb-2"><Button onClick={handleReplayAudio} disabled={isPlaying} className="rounded-xl px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold"><Volume2 className="w-4 h-4 mr-2" />Listen Again</Button></div>
                  <div className="grid grid-cols-1 gap-3">{(shuffledChoices || (current as any).choices)?.map((choice: any, idx: number) => {
                    const isSelected = selectedChoice === choice.text;
                    const correctForChoice = isCorrectChoice(choice.text);
                    const showResult = showFeedback && isSelected;
                    return <Button key={idx} onClick={() => handleChoice(choice)} disabled={showFeedback} className={cn("rounded-xl px-4 py-3 text-sm font-bold h-auto min-h-[55px]", showResult && correctForChoice && "bg-green-500 hover:bg-green-600 text-white animate-bounce", showResult && !correctForChoice && "bg-red-500 hover:bg-red-600 text-white", !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200")}> 
                      <div className="flex items-center gap-2 w-full"><div className="flex-1 text-left"><p className="font-bold">{stripEmojis(choice.text)}</p><p className="text-xs opacity-70">{choice.meaning}</p></div></div>
                    </Button>;
                  })}</div>
                  {showFeedback && <div className="mt-2"><div className={cn("text-center p-4 rounded-lg", isCorrectChoice(selectedChoice || '') ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900")}>
                    <p className={cn("font-bold", isCorrectChoice(selectedChoice || '') ? "text-green-800" : "text-red-800")}>{isCorrectChoice(selectedChoice || '') ? getCorrectFeedback() : getWrongFeedback(attemptCount)}</p>
                  </div>{selectedChoice !== (current as any).audioText && retryMode && <div className="flex justify-center gap-2 mt-2"><Button onClick={handleRetry} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2"><RotateCcw className="w-4 h-4 mr-2" />Try Again</Button><Button onClick={handleNext} variant="outline" className="px-4 py-2 border-2 border-gray-400">Skip</Button></div>}</div>}
                </div>
              )}

              {(current as any).listeningFirst && listeningPhase === 'reveal' && (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  <div className="bg-blue-100/80 dark:bg-blue-900/40 rounded-2xl p-6 border-2 border-blue-300 shadow-xl">
                    <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-pink-600 hover:text-pink-700 h-7 w-7 p-0" title="Replay this text with Pixel voice">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{(current as any).revealText}</p>
                    <div className="mt-4 flex justify-center"><Button onClick={handleNext} disabled={!canContinue} className={cn("bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-8 py-3", !canContinue && "opacity-60 cursor-not-allowed")}>Continue 🚀</Button></div>
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
                    <AlertTriangle className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-pink-600 opacity-70" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center sm:pr-4 overflow-hidden max-h-full">
                {!(current as any).listeningFirst && (
                  <div className="w-full">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 lg:p-5 mb-3 backdrop-blur-sm border-2 border-white/20 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        {current.title}
                        <Button variant="ghost" size="sm" onClick={playRevealText} className="text-pink-600 hover:text-pink-700 h-7 w-7 p-0" title="Replay this text with Pixel voice">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </h3>
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed px-2">
                        {current.id === 'celebrate' ? getCelebrationText() : (current as any).text}
                      </p>
                      <div className="flex justify-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📝 {(current as any).wordCount || 0}</span>
                        <span>⏱️ {(current as any).duration || 0}s</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={handleNext} disabled={!canContinue} className={cn("rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base", !canContinue && "opacity-60 cursor-not-allowed") }>
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
                    <div className="bg-pink-50/70 dark:bg-pink-900/30 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-pink-300 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-pink-600 animate-bounce" />
                        <span>{(current as any).audioInstruction}</span>
                      </h3>
                      {showTranscript && accessibilityMode && (current as any).audioText && (
                        <div className="mb-3 bg-pink-50/90 dark:bg-pink-900/30 rounded-lg p-3 border-2 border-pink-300">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-pink-600" />
                            <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">Accessibility Transcript:</span>
                          </div>
                          <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium">
                            "{(current as any).audioText}"
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 bg-pink-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <div className="flex flex-col items-center gap-2 mt-3">
                        <Button onClick={handleReplayAudio} disabled={isPlaying} className={cn("rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all", isPlaying && "animate-pulse")}>
                          <Volume2 className="w-4 h-4 mr-2" />
                          {isPlaying ? 'Playing...' : unlimitedReplays ? `Listen Again (${replaysUsed} plays)` : `Listen Again (${maxReplays - replaysUsed})`}
                        </Button>
                        {hasListened && (
                          <Button onClick={handleProceedToQuestion} className="mt-1 bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-bold animate-bounce">
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
                    <div className="flex justify-center"><Button onClick={handleReplayAudio} disabled={isPlaying} className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg px-4 py-1.5 text-xs"><Volume2 className="w-3 h-3 mr-1.5" />Replay</Button></div>
                    <div className="grid grid-cols-1 gap-1.5">{(shuffledChoices || (current as any).choices)?.map((choice: any, idx: number) => {
                      const isSelected = selectedChoice === choice.text;
                      const correctForChoice = isCorrectChoice(choice.text);
                      const showResult = showFeedback && isSelected;
                      return <Button key={idx} onClick={() => handleChoice(choice)} disabled={showFeedback} className={cn("rounded-lg px-2.5 py-2 text-xs md:text-sm font-bold h-auto min-h[42px] relative", showResult && correctForChoice && "bg-green-500 hover:bg-green-600 text-white", showResult && !correctForChoice && "bg-red-500 hover:bg-red-600 text-white", !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-300")}> 
                        <div className="flex items-center gap-2"><div className="flex-1 text-left"><p className="font-bold text-xs md:text-sm">{stripEmojis(choice.text)}</p><p className="text-xs opacity-70">{choice.meaning}</p></div></div>
                      </Button>;
                    })}</div>
                    {showFeedback && <div className="mt-1.5"><div className={cn("rounded-lg p-2", isCorrectChoice(selectedChoice || '') ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-rose-50 dark:bg-rose-900/20 text-rose-700")}><p className="text-xs md:text-sm font-bold">{isCorrectChoice(selectedChoice || '') ? getCorrectFeedback() : getWrongFeedback(attemptCount)}</p></div>{!isCorrectChoice(selectedChoice || '') && retryMode && <div className="flex justify-center gap-2 mt-2"><Button onClick={handleRetry} className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg px-5 py-2"><RotateCcw className="w-4 h-4 mr-1.5" />Try Again</Button><Button onClick={handleNext} variant="outline" className="rounded-lg px-5 py-2 border-2 border-gray-600">Skip</Button></div>}</div>}
                  </div>
                )}

                {(current as any).listeningFirst && listeningPhase === 'reveal' && (
                  <div className="bg-blue-100/80 dark:bg-blue-900/40 rounded-xl p-5 border-2 border-blue-300 shadow-xl">
                    <h3 className="text-sm md:text-base font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      {current.title}
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-pink-600 hover:text-pink-700 h-7 w-7 p-0" title="Replay this text with Pixel voice">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200 leading-relaxed px-2">{(current as any).revealText}</p>
                    <div className="mt-3 flex justify-center"><Button onClick={handleNext} disabled={!canContinue} className={cn("bg-pink-500 hover:bg-pink-600 text-white rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base", !canContinue && "opacity-60 cursor-not-allowed")}>Continue 🚀</Button></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes waveform { 0%, 100% { height: 20px; } 50% { height: 50px; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
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

export default SocialMediaExpertAdventure;


