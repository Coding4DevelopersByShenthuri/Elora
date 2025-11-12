import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Leaf, Recycle, Globe, Gauge, Volume2, X, Award, Zap, Play, FileText, RotateCcw } from 'lucide-react';
import OnlineTTS, { STORY_VOICES } from '@/services/OnlineTTS';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const TERRA_VOICE = STORY_VOICES.TerraTeen;

const storySteps = [
  {
    id: 'intro',
    title: '🌍 Welcome to Environmental Hero',
    text: "Mission briefing: You're joining the Global Environmental Initiative as an eco-warrior. Today you'll discover climate solutions, renewable energy, and conservation practices while mastering English through environmental action.",
    emoji: '🌍',
    character: 'Mission Coordinator',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: false,
    wordCount: 75,
    duration: 40
  },
  {
    id: 'climate_awareness',
    title: '🌡️ Climate Awareness',
    emoji: '🌡️',
    character: 'Terra',
    bgColor: 'from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Climate change affects every ecosystem',
    audioInstruction: 'Listen to the climate principle.',
    question: 'What does climate change affect?',
    hint: 'Think about the scope of impact',
    choices: [
      { text: 'Climate change affects only cities', emoji: '🏙️❌', meaning: 'limited scope' },
      { text: 'Climate change affects every ecosystem', emoji: '🌍✅', meaning: 'global impact' },
      { text: 'Climate change has no effects', emoji: '🚫🌍', meaning: 'denial' }
    ],
    revealText: 'Correct. Climate change affects every ecosystem globally. From rainforests to oceans, all habitats experience environmental shifts. Understanding this interconnectedness is key to finding solutions.',
    maxReplays: 5,
    wordCount: 60,
    duration: 50
  },
  {
    id: 'renewable_energy',
    title: '⚡ Renewable Energy',
    emoji: '⚡',
    character: 'Terra',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Renewable energy sources reduce carbon emissions',
    audioInstruction: 'Listen to the energy principle.',
    question: 'What do renewable energy sources reduce?',
    hint: 'Think about environmental impact',
    choices: [
      { text: 'Renewable energy increases pollution', emoji: '💨❌', meaning: 'incorrect' },
      { text: 'Renewable energy sources reduce carbon emissions', emoji: '⚡✅', meaning: 'clean solution' },
      { text: 'Renewable energy has no impact', emoji: '➖📊', meaning: 'neutral' }
    ],
    revealText: 'Excellent work! Renewable energy sources like solar and wind reduce carbon emissions significantly. For your dedication to understanding sustainable solutions, you\'ve earned your first eco-badge! Keep learning—two more badges await!',
    maxReplays: 5,
    wordCount: 70,
    duration: 52
  },
  {
    id: 'conservation',
    title: '🌿 Conservation',
    emoji: '🌿',
    character: 'Terra',
    bgColor: 'from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Conservation protects biodiversity',
    audioInstruction: 'Listen to the conservation principle.',
    question: 'What does conservation protect?',
    hint: 'Think about biological diversity',
    choices: [
      { text: 'Conservation protects only plants', emoji: '🌱❌', meaning: 'limited protection' },
      { text: 'Conservation protects biodiversity', emoji: '🦎✅', meaning: 'comprehensive' },
      { text: 'Conservation is unnecessary', emoji: '🚫🌿', meaning: 'not needed' }
    ],
    revealText: 'Exactly. Conservation protects biodiversity—the incredible variety of life on Earth. Every species matters in our interconnected ecosystems.',
    maxReplays: 5,
    wordCount: 55,
    duration: 48
  },
  {
    id: 'sustainability',
    title: '♻️ Sustainability',
    emoji: '♻️',
    character: 'Terra',
    bgColor: 'from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Sustainability balances present needs and future resources',
    audioInstruction: 'Listen to the sustainability definition.',
    question: 'What does sustainability balance?',
    hint: 'Think about time and resources',
    choices: [
      { text: 'Sustainability ignores the future', emoji: '⏰❌', meaning: 'short-term only' },
      { text: 'Sustainability balances present needs and future resources', emoji: '⚖️✅', meaning: 'balanced approach' },
      { text: 'Sustainability is impossible', emoji: '🎯❌', meaning: 'not feasible' }
    ],
    revealText: 'Outstanding progress! You\'ve demonstrated deep understanding of environmental systems. For your comprehensive knowledge and eco-conscious mindset, you\'ve earned your second eco-badge! Keep protecting the planet—one more badge to achieve!',
    maxReplays: 5,
    wordCount: 68,
    duration: 54
  },
  {
    id: 'ocean_health',
    title: '🌊 Ocean Health',
    emoji: '🌊',
    character: 'Terra',
    bgColor: 'from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Ocean health impacts global climate patterns',
    audioInstruction: 'Listen to the ocean principle.',
    question: 'What does ocean health impact?',
    hint: 'Consider global weather systems',
    choices: [
      { text: 'Ocean health affects only local areas', emoji: '🏖️❌', meaning: 'localized' },
      { text: 'Ocean health impacts global climate patterns', emoji: '🌊✅', meaning: 'worldwide' },
      { text: 'Ocean health has no climate impact', emoji: '🧊❌', meaning: 'no connection' }
    ],
    revealText: 'Perfect. Ocean health impacts global climate patterns. Our oceans regulate temperature, weather, and atmospheric conditions worldwide.',
    maxReplays: 5,
    wordCount: 58,
    duration: 50
  },
  {
    id: 'carbon_footprint',
    title: '👣 Carbon Footprint',
    emoji: '👣',
    character: 'Terra',
    bgColor: 'from-gray-100 to-slate-100 dark:from-gray-900 dark:to-slate-900',
    interactive: true,
    listeningFirst: true,
    audioText: 'Reducing carbon footprint requires individual and collective action',
    audioInstruction: 'Listen to the action principle.',
    question: 'What does reducing carbon footprint require?',
    hint: 'Think about who needs to act',
    choices: [
      { text: 'Reducing carbon footprint requires only governments', emoji: '🏛️❌', meaning: 'top-down only' },
      { text: 'Reducing carbon footprint requires individual and collective action', emoji: '👥✅', meaning: 'everyone involved' },
      { text: 'Reducing carbon footprint is impossible', emoji: '🚫👣', meaning: 'not achievable' }
    ],
    revealText: 'Magnificent achievement! You\'ve proven yourself as a true environmental warrior. For mastering all environmental principles and completing all challenges with excellence, you\'ve earned your third eco-badge! Together we can save the planet! Congratulations eco-champion!',
    maxReplays: 5,
    wordCount: 75,
    duration: 58
  },
  {
    id: 'mission_debrief',
    title: '✅ Mission Debrief',
    emoji: '✅',
    character: 'Terra',
    bgColor: 'from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900',
    interactive: false,
    text: 'Mission complete. You mastered climate awareness, renewable energy, conservation practices, sustainability principles, ocean health, and carbon footprint reduction. You\'re now an environmental hero ready to make real change!',
    wordCount: 68,
    duration: 45
  },
  {
    id: 'celebration',
    title: '🎉 Earth Saved!',
    emoji: '🎉',
    character: 'Terra',
    bgColor: 'from-green-400 to-blue-400 dark:from-green-800 dark:to-blue-800',
    interactive: false,
    text: 'Outstanding performance! You earned the Environmental Hero badge. Your planet needs warriors like you! Together we can create a sustainable future!',
    wordCount: 52,
    duration: 38
  }
];

const EnvironmentalHeroAdventure = ({ onClose, onComplete }: Props) => {
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
  const ecoBadges = Math.min(3, stars);
  const STAR_AWARD_STEPS = new Set(['renewable_energy', 'sustainability', 'carbon_footprint']);

  const getRevealText = () => current.revealText || current.text || '';

  const getCelebrationText = () => {
    if (current.id === 'celebration') {
      if (stars >= 3) {
        return "Outstanding performance, eco-warrior! You completed the mission flawlessly and earned all three eco-badges! Your expertise in climate science, renewable energy, conservation, sustainability, ocean protection, and carbon reduction has earned you the prestigious Environmental Hero badge. You're ready to make real-world environmental change! Keep protecting our planet!";
      } else if (stars === 2) {
        return `Well done, eco-warrior! You earned ${stars} eco-badges showing strong environmental awareness. Your commitment to sustainability is developing nicely. Complete all challenges next time to earn the third badge and unlock the full Environmental Hero achievement. You're making a difference!`;
      } else if (stars === 1) {
        return `Good effort, eco-warrior! You earned ${stars} eco-badge demonstrating your environmental awareness. Protecting the planet requires understanding many concepts. Continue practicing and you'll become a sustainability expert! Keep fighting for Earth!`;
      } else {
        return "Mission complete, eco-warrior! You explored environmental action and gained valuable experience. While you didn't earn all badges this time, every effort contributes to saving the planet. Keep learning and taking action. The Earth needs you!";
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
      const session = KidsListeningAnalytics.startSession(userId, 'environmental-hero-teen', 'Environmental Hero (Teen)');
      setCurrentSession(session);
    };
    start();

    return () => OnlineTTS.stop();
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

  // Shuffle answers when a question is shown so correct answer position varies
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
    await OnlineTTS.speak(clean, TERRA_VOICE, { speed: playbackSpeed, showCaptions: false });
  };

  const playRevealText = async () => {
    const textToSpeak = current.id === 'celebration' ? getCelebrationText() : getRevealText();
    if (!textToSpeak) return;
    try {
      OnlineTTS.stop();
      await new Promise(r => setTimeout(r, 100));
      await speak(textToSpeak);
    } catch {}
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
    (async () => {
      try {
        const clean = stripEmojis(textToPlay);
        await OnlineTTS.speak(clean, TERRA_VOICE, { speed: newSpeed, showCaptions: false });
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
        if (current.id === 'celebration') textToSpeak = getCelebrationText();
        try { await speak(textToSpeak); } finally { setIsPlaying(false); }
      } else if (current.listeningFirst && listeningPhase === 'reveal' && current.revealText) {
        setIsPlaying(true);
        setIsRevealTextPlaying(true);
        try { await speak(getRevealText()); } finally { setIsPlaying(false); setIsRevealTextPlaying(false); }
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
    const isCorrect = text === current.audioText;

    if (currentSession && current.listeningFirst) {
      KidsListeningAnalytics.recordAttempt(currentSession, current.id, current.question || '', isCorrect, 1, replaysUsed, 0);
    }

    setShowFeedback(true);
    if (isCorrect) {
      setCorrectAnswers(a => a + 1);
      if (STAR_AWARD_STEPS.has(current.id)) {
        setStars(prev => {
          const newStars = Math.min(3, prev + 1);
          console.log(`⭐ Eco-badge ${newStars}/3 awarded! Step: ${current.id}`);
          return newStars;
        });
      }
      setTimeout(() => setListeningPhase('reveal'), 2500);
      const revealText = getRevealText() || '';
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
      <Card className={cn('w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500', 'bg-gradient-to-br', (storySteps[stepIndex] as any).bgColor, 'flex flex-col')}>
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" onClick={() => { OnlineTTS.stop(); onClose(); }} className="h-10 w-10 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50">
            <X className="w-5 h-5 text-gray-700 hover:text-gray-900" />
          </Button>
        </div>

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-3 gap-2 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-green-700 dark:text-green-200 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Environmental Hero</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                🌿 {ecoBadges}/3 Badges
              </div>
              {(listeningPhase === 'listening' || listeningPhase === 'question') && current.listeningFirst && (
                <Button variant="ghost" size="sm" onClick={() => setAccessibilityMode(!accessibilityMode)} className={cn('h-7 px-2 rounded-full text-xs', accessibilityMode && 'bg-orange-100 dark:bg-orange-900 border border-orange-300')} title="Accessibility mode">
                  👂 {accessibilityMode ? 'ON' : 'Help'}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => { const newSpeed = playbackSpeed === 'slow' ? 'slower' : playbackSpeed === 'slower' ? 'normal' : 'slow'; handleSpeedChange(newSpeed); }} className="h-7 px-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600" title={`Playback speed: ${playbackSpeed}`}>
                <Gauge className="w-3.5 h-3.5 mr-1" />
                {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
              </Button>
              {(listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode) && (
                <Button variant="ghost" size="sm" onClick={() => setShowTranscript(t => !t)} className="h-7 w-7 p-0 rounded-full border" title="Toggle transcript">
                  <FileText className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {ttsInitialized && ttsAvailable && (
            <div className="mb-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 justify-center">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-bold">Terra voice ready. Save the planet, warrior!</span>
              </div>
            </div>
          )}

          <Progress value={progress} className="h-2 sm:h-2 mb-3 sm:mb-4 bg-white/30">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500" />
          </Progress>

          <div className="flex-1 overflow-y-auto overflow-x-hidden sm:overflow-hidden pb-2 sm:pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            <div className="sm:hidden text-center h-full flex flex-col justify-center">
              <div className="relative mb-3 sm:mb-4">
                <div className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 animate-float">
                  <span>{current.emoji}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={cn('text-xl sm:text-2xl transition-all', i < ecoBadges ? 'text-yellow-400 animate-pulse drop-shadow-lg' : 'text-gray-300 opacity-50')}>🌿</span>
                  ))}
                </div>
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <Globe className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-600 opacity-70" />
                </div>
              </div>

              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-green-50/70 dark:bg-green-900/30 rounded-2xl p-6 backdrop-blur-sm border-2 border-green-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Recycle className="w-5 h-5 text-green-600" />
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
                        <div key={i} className="w-2 bg-green-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <Button onClick={handleReplay} disabled={isPlaying} className={cn('rounded-xl px-6 py-3 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold transition-all', isPlaying && 'animate-pulse')}>
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
                    <Button onClick={handleReplay} disabled={isPlaying} className="rounded-lg px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold transition-all text-xs">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Replay
                    </Button>
                  </div>
                  {current.choices && (
                    <div className="grid grid-cols-1 gap-2.5">
                      {(shuffledChoices || current.choices).map((choice: any, idx: number) => {
                        const isSelected = selectedChoice === choice.text;
                        const isCorrect = choice.text === current.audioText;
                        const showResult = showFeedback && isSelected;
                        return (
                          <Button key={idx} onClick={() => handleChoice(choice)} disabled={showFeedback} className={cn('rounded-lg px-3 py-2.5 text-xs font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[55px]', showResult && isCorrect && 'bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-2xl', showResult && !isCorrect && 'bg-red-500 hover:bg-red-600 text-white shadow-xl', !showResult && 'bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:shadow-lg')}>
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
                      {selectedChoice === current.audioText ? (
                        <div className="text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border-2 border-green-400">
                          ✅ Excellent! Clear thinking.
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
                      <Button variant="ghost" size="sm" onClick={playRevealText} className="text-green-600 hover:text-green-700 h-7 w-7 p-0" title="Replay this text with Terra voice">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </h3>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                      {current.id === 'celebration' ? getCelebrationText() : (current.revealText || current.text)}
                    </p>
                    <div className="flex justify-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>📝 {current.wordCount || 0} words</span>
                      <span>⏱️ {current.duration || 0}s</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={handleNext} className="rounded-lg sm:rounded-2xl px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold transition-all shadow-lg">
                      {stepIndex === storySteps.length - 1 ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          <span className="hidden sm:inline">Complete Mission ✨</span>
                          <span className="sm:hidden">Done ✨</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Continue 🌿</span>
                          <span className="sm:hidden">Next 🌿</span>
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
                      <span key={i} className={cn('text-3xl md:text-4xl transition-all', i < ecoBadges ? 'text-yellow-400 animate-pulse drop-shadow-lg' : 'text-gray-300 opacity-50')}>🌿</span>
                    ))}
                  </div>
                  <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 animate-float-slow">
                    <Globe className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-gray-600 opacity-70" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center sm:pr-4 overflow-hidden max-h-full">
                {/* Listening, Question, Reveal phases similar to SpaceExplorer but with green theme */}
                {current.listeningFirst && listeningPhase === 'listening' && (
                  <div className="w-full">
                    <div className="bg-green-50/70 dark:bg-green-900/30 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-green-300 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        <Recycle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                        <span>{current.audioInstruction}</span>
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2 bg-green-500 rounded-full animate-waveform" style={{ height: '40px', animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                      <div className="flex flex-col items-center gap-2 mt-3">
                        <Button onClick={handleReplay} disabled={isPlaying} className={cn('rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold transition-all', isPlaying && 'animate-pulse')}>
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
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={handleReplay} disabled={isPlaying} className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm">
                        <Volume2 className="w-3 h-3 mr-1.5" /> Replay
                      </Button>
                    </div>
                    {current.choices && (
                      <div className="grid grid-cols-1 gap-1.5">
                        {(shuffledChoices || current.choices).map((choice: any, idx: number) => {
                          const isSelected = selectedChoice === choice.text;
                          const isCorrect = choice.text === current.audioText;
                          const showResult = showFeedback && isSelected;
                          return (
                            <Button key={idx} onClick={() => handleChoice(choice)} disabled={showFeedback} className={cn('rounded-lg px-2.5 py-2 text-xs md:text-sm font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[42px] relative', showResult && isCorrect && 'bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-xl', showResult && !isCorrect && 'bg-red-500 hover:bg-red-600 text-white shadow-lg', !showResult && 'bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400 hover:shadow-md')}>
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
                        {selectedChoice === current.audioText ? (
                          <div className="text-green-600 dark:text-green-400 text-xs md:text-sm font-bold bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border-2 border-green-400">
                            ✅ Excellent! Clear thinking.
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
                        <Button variant="ghost" size="sm" onClick={playRevealText} className="text-green-600 hover:text-green-700 h-7 w-7 p-0" title="Replay this text with Terra voice">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </h3>
                      <p className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-200 leading-relaxed px-2 font-medium">
                        {current.id === 'celebration' ? getCelebrationText() : (current.revealText || current.text)}
                      </p>
                      <div className="flex justify-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📝 {current.wordCount || 0}</span>
                        <span>⏱️ {current.duration || 0}s</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={handleNext} className="rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold transition-all shadow-lg text-sm md:text-base">
                        {stepIndex === storySteps.length - 1 ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-pulse" /> Complete Mission ✨
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" /> Continue 🌿
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
            <Leaf className="w-8 h-8 text-green-400" />
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

export default EnvironmentalHeroAdventure;

