import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Star, Volume2, Play, Heart, Zap, Flower, Trees, CloudRain, X, Ear, Award, Gauge, RotateCcw, FileText } from 'lucide-react';
import OnlineTTS, { STORY_VOICES, type VoiceProfile } from '@/services/OnlineTTS';
import KidsListeningAnalytics, { type StorySession } from '@/services/KidsListeningAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type StoryStep = {
  id: string;
  title: string;
  text?: string;
  emoji: string;
  character: string;
  bgColor: string;
  interactive: boolean;
  listeningFirst?: boolean;
  audioText?: string;
  audioInstruction?: string;
  question?: string;
  hint?: string;
  choices?: Array<{ text: string; emoji: string; meaning: string }>;
  revealText?: string;
  maxReplays?: number;
  wordCount: number;
  duration: number;
};

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
  storyData: {
    title: string;
    storySteps: StoryStep[];
    voiceProfile: string; // Key from STORY_VOICES
    characterName: string;
    storyId: string; // For analytics
  };
};

const DynamicStoryAdventure = ({ onClose, onComplete, storyData }: Props) => {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : 'local-user';
  
  const storySteps = storyData.storySteps;
  const voiceProfile: VoiceProfile = STORY_VOICES[storyData.voiceProfile] || STORY_VOICES.Luna;
  
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

  const maxReplays = current.maxReplays || 5;
  const unlimitedReplays = true;

  // Initialize online TTS on mount
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        await OnlineTTS.initialize();
        const available = OnlineTTS.isAvailable();
        setTtsAvailable(available);
        setTtsInitialized(true);
        
        if (!available) {
          console.warn('No voice synthesis available, falling back to text-only mode');
        } else {
          const mode = OnlineTTS.getVoiceMode();
          console.log(`🎤 Voice mode: ${mode}`);
          OnlineTTS.logAvailableVoices();
        }
      } catch (error) {
        console.error('Failed to initialize TTS:', error);
        setTtsAvailable(false);
      }
    };
    initializeVoice();
    
    const initSession = async () => {
      await KidsListeningAnalytics.initialize(userId);
      const session = KidsListeningAnalytics.startSession(
        userId,
        storyData.storyId,
        storyData.title
      );
      setCurrentSession(session);
    };
    initSession();

    return () => {
      console.log('🛑 Story component unmounting - stopping TTS immediately');
      OnlineTTS.stop();
    };
  }, [userId, storyData.storyId, storyData.title]);

  // Reset state on step change
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
  }, [stepIndex, current]);

  // Shuffle helper
  const shuffleArray = (arr: any[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Recompute shuffled choices
  useEffect(() => {
    if (current.listeningFirst && listeningPhase === 'question' && current.choices) {
      setShuffledChoices(shuffleArray(current.choices));
    } else {
      setShuffledChoices(null);
    }
  }, [stepIndex, listeningPhase, current]);

  // Timer for tracking session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to remove emojis from text before TTS
  const stripEmojis = (text: string): string => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{E0020}-\u{E007F}]/gu, '').trim();
  };

  // Enhanced audio playback
  const playAudioWithCaptions = async (text: string) => {
    try {
      const cleanText = stripEmojis(text);
      
      console.log(`🎤 Playing audio with ${voiceProfile.name}'s voice:`, {
        text: cleanText.substring(0, 50) + '...',
        voice: voiceProfile,
        step: current.id,
        phase: listeningPhase,
        speed: playbackSpeed,
      });
      
      if (!OnlineTTS.isAvailable()) {
        throw new Error('TTS not available');
      }
      
      await OnlineTTS.speak(
        cleanText,
        voiceProfile,
        {
          speed: playbackSpeed,
          showCaptions: false,
          onCaptionUpdate: () => {}
        }
      );
      
      console.log(`✅ Audio playback completed for step: ${current.id}`);
    } catch (error) {
      console.error('❌ Voice synthesis failed:', error);
      console.log('🔄 Attempting to recover TTS...');
      try {
        await OnlineTTS.initialize();
        if (OnlineTTS.isAvailable()) {
          console.log('✅ TTS recovered successfully');
          return;
        }
      } catch (recoveryError) {
        console.error('❌ TTS recovery failed:', recoveryError);
      }
      
      setTtsAvailable(false);
      throw error;
    }
  };

  // Auto-play for listening phase
  useEffect(() => {
    if (listeningPhase === 'listening' && current.listeningFirst && current.audioText) {
      const playListeningAudio = async () => {
        setIsPlaying(true);
        setAudioWaveform(true);
        try {
          await playAudioWithCaptions(current.audioText!);
          setHasListened(true);
        } catch (error) {
          console.log('TTS not available, text mode enabled');
          setHasListened(true);
        }
        setIsPlaying(false);
        setAudioWaveform(false);
      };
      playListeningAudio();
    }
    
    // Auto-play for reveal phase
    if (listeningPhase === 'reveal' && current.listeningFirst && current.revealText && ttsAvailable) {
      const playReveal = async () => {
        setIsPlaying(true);
        setIsRevealTextPlaying(true);
        try {
          await playAudioWithCaptions(current.revealText!);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error('❌ Auto reveal text playback failed:', error);
        } finally {
          setIsPlaying(false);
          setIsRevealTextPlaying(false);
        }
      };
      playReveal();
    }
    
    // For non-interactive steps
    if (!current.listeningFirst && current.text && ttsAvailable) {
      const playNarration = async () => {
        let textToRead = current.text!;
        
        if (current.id === 'grand_celebration' || current.id.includes('celebration')) {
          if (stars >= 3) {
            textToRead = current.text!;
          } else {
            textToRead = `Great job! You earned ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! Keep practicing and you'll collect all the stars next time! 🌟`;
          }
        }
        
        try {
          await playAudioWithCaptions(textToRead);
        } catch (error) {
          console.error('❌ TTS not available for non-interactive step:', error);
        }
      };
      playNarration();
    }
  }, [listeningPhase, stepIndex, playbackSpeed, stars, current, ttsAvailable, voiceProfile]);

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
        KidsListeningAnalytics.completeSession(
          userId,
          currentSession,
          score,
          stars
        );
      }
      
      console.log('🛑 Story completed - stopping TTS');
      OnlineTTS.stop();
      
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
      await playAudioWithCaptions(current.audioText!);
      setHasListened(true);
    } catch (error) {
      console.log('TTS not available, text mode enabled');
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
    const isCorrect = choice === current.audioText;
    
    if (currentSession && current.listeningFirst) {
      const updatedSession = KidsListeningAnalytics.recordAttempt(
        currentSession,
        current.id,
        current.question || '',
        isCorrect,
        currentAttempt,
        replaysUsed,
        questionTime
      );
      setCurrentSession(updatedSession);
    }
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      
      // Award stars for interactive steps (typically every 2nd interactive step)
      const interactiveSteps = storySteps.filter(s => s.interactive && s.listeningFirst);
      const currentInteractiveIndex = interactiveSteps.findIndex(s => s.id === current.id);
      if (currentInteractiveIndex >= 0 && (currentInteractiveIndex + 1) % 2 === 0) {
        const newStars = Math.min(3, Math.floor((currentInteractiveIndex + 1) / 2));
        setStars(newStars);
        console.log(`⭐ Star awarded! (${newStars}/3)`);
      }
    
      setShowFeedback(true);
      setRetryMode(false);
    
      setTimeout(() => {
        setListeningPhase('reveal');
      }, 2500);
      
      const revealText = current.revealText || '';
      const textLength = revealText.length;
      const wordsPerMinute = playbackSpeed === 'slow' ? 120 : playbackSpeed === 'slower' ? 80 : 160;
      const estimatedDuration = Math.max(10000, (textLength / 5) * (60000 / wordsPerMinute) + 2000);
      
      setTimeout(() => {
        if (!isRevealTextPlaying) {
          handleNext();
        } else {
          setTimeout(() => {
            handleNext();
          }, 2000);
        }
      }, estimatedDuration);
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
    let textToSpeak = current.revealText || current.text;
    
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
    
    setIsPlaying(true);
    setIsRevealTextPlaying(true);
    try {
      OnlineTTS.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await playAudioWithCaptions(textToSpeak);
      console.log('✅ Reveal text playback completed successfully');
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('❌ TTS error in playRevealText:', error);
      
      try {
        console.log('🔄 Attempting TTS reinitialization...');
        await OnlineTTS.initialize();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (OnlineTTS.isAvailable()) {
          console.log('🔄 Retrying reveal text with reinitialized TTS...');
          await playAudioWithCaptions(textToSpeak);
          console.log('✅ Retry successful');
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
      }
    } finally {
      setIsPlaying(false);
      setIsRevealTextPlaying(false);
    }
  };

  // Instant speed change function
  const handleSpeedChange = (newSpeed: 'normal' | 'slow' | 'slower') => {
    console.log('🔄 INSTANT speed change - Current step:', current.id, 'New speed:', newSpeed);
    
    setPlaybackSpeed(newSpeed);
    OnlineTTS.stop();
    
    let textToPlay = '';
    
    if (current.listeningFirst) {
      if (listeningPhase === 'listening' && current.audioText) {
        textToPlay = current.audioText;
      } else if (listeningPhase === 'reveal' && current.revealText) {
        textToPlay = current.revealText;
      }
    } else {
      if (current.text) {
        textToPlay = current.text;
      }
    }
    
    if (!textToPlay || !ttsAvailable) return;
    
    const playWithNewSpeed = async () => {
      try {
        const cleanText = stripEmojis(textToPlay);
        setIsPlaying(true);
        setIsRevealTextPlaying(listeningPhase === 'reveal');
        
        await OnlineTTS.speak(cleanText, voiceProfile, {
          speed: newSpeed,
          showCaptions: false,
          onCaptionUpdate: () => {}
        });
      } catch (error) {
        console.error('❌ Speed change error:', error);
      } finally {
        setIsPlaying(false);
        setIsRevealTextPlaying(false);
      }
    };
    
    playWithNewSpeed();
  };

  const getCorrectFeedback = () => {
    const messages = [
      "🎉 FANTASTIC! You earned a star! 🌟",
      "🌟 AMAZING! You got it right!",
      "✨ WONDERFUL! Listening champion!",
      "🎯 PERFECT! Great job!",
      "💫 BRILLIANT! Star earned!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const getWrongFeedback = (attempt: number) => {
    if (attempt === 1) {
      return `💪 Not quite! Listen carefully and try again! 🎧`;
    } else {
      return `🌟 Keep trying! Listen one more time to find the answer! 👂`;
    }
  };

  const getCharacterAnimation = () => {
    if (current.id.includes('star') || current.id.includes('celebration')) return 'animate-bounce';
    return 'animate-float';
  };

  const getEnvironmentIcon = () => {
    // Map step IDs to environment icons - can be customized per story
    if (current.id.includes('tree') || current.id.includes('forest')) return Trees;
    if (current.id.includes('butterfly') || current.id.includes('sparkle')) return Sparkles;
    if (current.id.includes('river') || current.id.includes('water') || current.id.includes('rain')) return CloudRain;
    if (current.id.includes('flower') || current.id.includes('garden')) return Flower;
    return Sparkles; // Default
  };

  const EnvironmentIcon = getEnvironmentIcon();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-5xl sm:max-w-6xl lg:max-w-7xl h-[95vh] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500",
        "bg-gradient-to-br", current.bgColor,
        "flex flex-col"
      )}>
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
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 animate-bounce" />
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">{storyData.title}</h2>
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
                {/* Speed Control */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSpeed = playbackSpeed === 'slow' ? 'slower' : playbackSpeed === 'slower' ? 'normal' : 'slow';
                    handleSpeedChange(newSpeed);
                  }}
                  className="h-7 px-2 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 bg-green-50 dark:bg-green-800 hover:bg-green-100 dark:hover:bg-green-700 border border-green-200 dark:border-green-600 text-green-800 dark:text-green-100"
                  title={`Playback speed (works offline & online): ${playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow (Default)' : 'Very Slow'}`}
                >
                  <Gauge className="w-3.5 h-3.5 mr-1 text-green-600 dark:text-green-200" />
                  {playbackSpeed === 'normal' ? 'Normal' : playbackSpeed === 'slow' ? 'Slow' : 'Very Slow'}
                </Button>
                
                {/* Accessibility Mode Toggle */}
                {(listeningPhase === 'listening' || listeningPhase === 'question') && current.listeningFirst && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAccessibilityMode(!accessibilityMode);
                    }}
                    className={cn(
                      "h-7 px-2 rounded-full text-xs",
                      accessibilityMode && "bg-orange-100 dark:bg-orange-900 border border-orange-300"
                    )}
                    title="Accessibility mode (for hearing difficulties)"
                  >
                    👂 {accessibilityMode ? 'ON' : 'Help'}
                  </Button>
                )}
                
                {/* Transcript Toggle */}
                {(listeningPhase === 'reveal' || !current.listeningFirst || accessibilityMode) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTranscript(!showTranscript)}
                    className={cn(
                      "h-7 w-7 p-0 rounded-full border shadow-sm",
                      showTranscript 
                        ? "bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-700" 
                        : "bg-white/80 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    )}
                    title="Toggle text transcript"
                  >
                    <FileText className={cn(
                      "w-3.5 h-3.5",
                      showTranscript 
                        ? "text-blue-700 dark:text-blue-200" 
                        : "text-gray-700 dark:text-gray-200"
                    )} />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* TTS Status Banner */}
          {ttsInitialized && ttsAvailable && (
            <div className="mb-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2.5 rounded-lg shadow-lg animate-fade-in">
              <div className="flex items-center gap-2 justify-center">
                <Volume2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-bold">
                  {storyData.characterName}'s voice is ready! Listen carefully to their magical words!
                </span>
              </div>
            </div>
          )}
          
          {/* Accessibility Mode Warning */}
          {accessibilityMode && (listeningPhase === 'listening' || listeningPhase === 'question') && (
            <div className="mb-2 bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-400 text-orange-900 dark:text-orange-200 px-4 py-2.5 rounded-lg shadow-md">
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
            <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500" />
          </Progress>

          {/* Content Area */}
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
                    (current.id === 'grand_celebration' || current.id.includes('celebration')) && 'animate-celebration-party'
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
                          ? 'text-yellow-400 animate-pulse drop-shadow-lg' 
                          : 'text-gray-300 opacity-50'
                      )} 
                    />
                  ))}
                </div>

                {/* Environment Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <EnvironmentIcon className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-500 opacity-70" />
                </div>
              </div>

              {/* Mobile: PHASE 1 - LISTENING */}
              {current.listeningFirst && listeningPhase === 'listening' && (
                <div className="space-y-4 max-w-3xl mx-auto w-full">
                  <div className="bg-blue-100/80 dark:bg-blue-900/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-blue-300 shadow-2xl">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <Ear className="w-6 h-6 text-blue-600 animate-bounce" />
                      {current.audioInstruction}
                    </h3>
                    
                    {/* Transcript (only in accessibility mode during listening phase) */}
                    {showTranscript && accessibilityMode && (
                      <div className="mb-4 bg-orange-50/90 dark:bg-orange-900/30 rounded-lg p-4 border-2 border-orange-300">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Accessibility Transcript:</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                          "{current.audioText}"
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                          ⚠️ Try to listen carefully instead of reading!
                        </p>
                      </div>
                    )}
                    
                    {/* Audio waveform */}
                    {audioWaveform && !(showTranscript && accessibilityMode) && (
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-blue-500 rounded-full animate-waveform"
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
                          "rounded-xl px-6 py-3 text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold transition-all",
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
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg sm:rounded-lg md:rounded-xl p-2.5 sm:p-2 md:p-3 border border-yellow-200 dark:border-yellow-700">
                    <h4 className="text-sm sm:text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1.5 sm:mb-1">
                      {current.question}
                    </h4>
                    {showHint ? (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        💡 Hint: {current.hint}
                      </p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs sm:text-sm"
                      >
                        Need a hint? 🧩
                      </Button>
                    )}
                  </div>

                  {/* Replay Button */}
                  <div className="flex justify-center mb-2 sm:mb-2">
                    <Button 
                      onClick={handleReplayAudio}
                      disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                      className={cn(
                        "rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-xs sm:text-xs md:text-sm",
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
                          <span className="hidden sm:inline">Listen to the Magic Word</span>
                          <span className="sm:hidden">🔊 Listen</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Choice Buttons */}
                  {current.choices && (
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-2 md:gap-3 justify-center">
                      {(shuffledChoices || current.choices).map((choice: any, idx: number) => {
                        const isSelected = selectedChoice === choice.text;
                        const isCorrect = choice.text === current.audioText;
                        const showResult = showFeedback && isSelected;
                        
                        return (
                          <Button
                            key={idx}
                            onClick={() => handleChoice(choice)}
                            disabled={showFeedback}
                            className={cn(
                              "rounded-lg sm:rounded-lg md:rounded-xl px-3 sm:px-3 md:px-4 py-2.5 sm:py-2 md:py-2.5 text-xs sm:text-xs md:text-sm font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[55px] sm:min-h-[50px] md:min-h-[55px]",
                              showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-lg sm:shadow-2xl",
                              showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white shadow-md sm:shadow-xl",
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg"
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
                      {selectedChoice === current.audioText ? (
                        <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm md:text-base font-bold animate-bounce bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-lg md:rounded-xl p-2.5 sm:p-2 md:p-3 border border-green-200 dark:border-green-700">
                          {getCorrectFeedback()}
                          {attemptCount === 0 && (
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
                  <div className="bg-green-100/80 dark:bg-green-900/40 rounded-2xl p-6 backdrop-blur-sm border-2 border-green-300 shadow-2xl">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2 sm:gap-2">
                      {current.title}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={playRevealText}
                        className="text-blue-500 hover:text-blue-600 h-7 w-7 sm:h-8 sm:w-8 p-0"
                        title={`Replay this text with ${storyData.characterName}'s voice`}
                      >
                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                    </h3>
                    <p className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-200 leading-relaxed sm:leading-relaxed mx-auto max-w-3xl">
                      {current.revealText}
                    </p>
                    
                    <div className="mt-4 flex justify-center">
                      <Button 
                        onClick={handleNext} 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-2xl px-8 py-3"
                      >
                        Continue Adventure! 🚀
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
                        className="text-blue-600 hover:text-blue-700"
                        title={`Replay this text with ${storyData.characterName}'s voice`}
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </h3>
                    
                    <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                      {current.id === 'grand_celebration' || current.id.includes('celebration') ? (
                        stars >= 3 ? (
                          current.text
                        ) : (
                          `Great job, little explorer! ... You earned ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! ... Keep practicing and you'll collect all the stars next time! 🌟`
                        )
                      ) : (
                        current.text
                      )}
                    </p>
                    
                    <div className="flex justify-center gap-3 mt-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>📝 {current.wordCount} words</span>
                      <span>⏱️ {current.duration}s</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-2 sm:pt-3">
                    <Button 
                      onClick={handleNext} 
                      className="rounded-lg sm:rounded-2xl md:rounded-3xl px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-xs sm:text-sm md:text-base"
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
                          <span className="hidden sm:inline">Continue Adventure! 🚀</span>
                          <span className="sm:hidden">Next 🚀</span>
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
                      (current.id === 'grand_celebration' || current.id.includes('celebration')) && 'animate-celebration-party'
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
                            ? 'text-yellow-400 animate-pulse drop-shadow-lg' 
                            : 'text-gray-300 opacity-50'
                        )} 
                      />
                    ))}
                  </div>

                  {/* Environment Icon */}
                  <div className="absolute -top-6 -right-6 lg:-top-8 lg:-right-8 animate-float-slow">
                    <EnvironmentIcon className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-green-500 opacity-70" />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Content (Desktop) */}
              <div className="flex-1 flex flex-col justify-center sm:pr-4 overflow-hidden max-h-full">

                {/* Desktop: PHASE 1 - LISTENING */}
                {current.listeningFirst && listeningPhase === 'listening' && (
                  <div className="w-full">
                    <div className="bg-blue-100/80 dark:bg-blue-900/40 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-blue-300 shadow-xl">
                      <h3 className="text-base md:text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        <Ear className="w-5 h-5 md:w-6 md:h-6 text-blue-600 animate-bounce" />
                        <span>{current.audioInstruction}</span>
                      </h3>
                      
                      {/* Transcript (only in accessibility mode during listening phase) */}
                      {showTranscript && accessibilityMode && (
                        <div className="mb-3 bg-orange-50/90 dark:bg-orange-900/30 rounded-lg p-3 border-2 border-orange-300">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Accessibility Transcript:</span>
                          </div>
                          <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 font-medium">
                            "{current.audioText}"
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1.5">
                            ⚠️ Try to listen carefully instead of reading!
                          </p>
                        </div>
                      )}
                      
                      {/* Audio waveform */}
                      {audioWaveform && !(showTranscript && accessibilityMode) && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-2 bg-blue-500 rounded-full animate-waveform"
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
                            "rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold transition-all",
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
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2.5 lg:p-3 border-2 border-yellow-300">
                      <h4 className="text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1.5">
                        {current.question}
                      </h4>
                      {showHint ? (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                          💡 Hint: {current.hint}
                        </p>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowHint(true)}
                          className="text-yellow-600 border-yellow-300 hover:bg-yellow-100 text-xs h-7 px-3"
                        >
                          Need a hint? 🧩
                        </Button>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        onClick={handleReplayAudio}
                        disabled={!unlimitedReplays && replaysUsed >= maxReplays || isPlaying}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 md:px-5 py-1.5 md:py-2 text-xs md:text-sm"
                      >
                        <Volume2 className="w-3 h-3 mr-1.5" />
                        {unlimitedReplays ? `Replay (${replaysUsed})` : `Replay (${maxReplays - replaysUsed})`}
                      </Button>
                    </div>

                    {current.choices && (
                      <div className="grid grid-cols-1 gap-1.5">
                        {(shuffledChoices || current.choices).map((choice: any, idx: number) => {
                          const isSelected = selectedChoice === choice.text;
                          const isCorrect = choice.text === current.audioText;
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
                                !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400 hover:shadow-md"
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
                        {selectedChoice === current.audioText ? (
                          <div className="text-green-600 dark:text-green-400 text-xs md:text-sm font-bold bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border-2 border-green-400 shadow-sm">
                            {getCorrectFeedback()}
                            {attemptCount === 0 && (
                              <div className="mt-1 text-xs">
                                🏆 First try bonus!
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-orange-700 dark:text-orange-300 text-xs md:text-sm font-bold bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-2 border-2 border-orange-400 shadow-sm">
                              {getWrongFeedback(attemptCount)}
                            </div>
                            
                            {/* Retry Button - Desktop */}
                            {retryMode && (
                              <div className="flex flex-col sm:flex-row justify-center items-stretch gap-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-2.5 border-2 border-gray-300 dark:border-gray-600 shadow-md">
                                <Button
                                  onClick={handleRetry}
                                  className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white rounded-lg px-5 py-2 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-orange-300 animate-pulse-slow relative overflow-hidden"
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
                    <div className="bg-green-100/80 dark:bg-green-900/40 rounded-xl p-4 lg:p-5 backdrop-blur-sm border-2 border-green-300 shadow-xl">
                      <h3 className="text-sm md:text-base font-bold mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                        {current.title}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={playRevealText}
                          className="text-blue-600 hover:text-blue-700 h-7 w-7 p-0"
                          title={`Replay this text with ${storyData.characterName}'s voice`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </h3>
                      <p className="text-xs md:text-sm text-gray-700 dark:text-gray-200 leading-relaxed px-2">
                        {current.revealText}
                      </p>
                      
                      <div className="mt-3 flex justify-center">
                        <Button 
                          onClick={handleNext} 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl px-5 md:px-6 py-2 md:py-2.5 text-sm md:text-base"
                        >
                          Continue Adventure! 🚀
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
                          className="text-blue-600 hover:text-blue-700 h-7 w-7 p-0"
                          title={`Replay this text with ${storyData.characterName}'s voice`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </h3>
                      
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed px-2">
                        {current.id === 'grand_celebration' || current.id.includes('celebration') ? (
                          stars >= 3 ? (
                            current.text
                          ) : (
                            `Great job! You earned ${Math.floor(stars)} star${Math.floor(stars) !== 1 ? 's' : ''}! Keep practicing and you'll collect all the stars next time! 🌟`
                          )
                        ) : (
                          current.text
                        )}
                      </p>
                      
                      <div className="flex justify-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>📝 {current.wordCount}</span>
                        <span>⏱️ {current.duration}s</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleNext} 
                        className="rounded-xl px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg text-sm md:text-base"
                      >
                        {stepIndex === storySteps.length - 1 ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            Complete Adventure! ✨
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Continue Adventure! 🚀
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
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="hidden lg:block absolute bottom-20 left-12 animate-float-medium">
            <Heart className="w-8 h-8 text-pink-400" />
          </div>
          <div className="hidden lg:block absolute top-1/2 left-4 animate-float-fast">
            <Flower className="w-7 h-7 text-green-400" />
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

export default DynamicStoryAdventure;

