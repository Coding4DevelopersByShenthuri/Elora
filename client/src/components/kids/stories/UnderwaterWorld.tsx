import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Fish, Volume2, Play, Heart, Zap, Waves, X } from 'lucide-react';
import SpeechService from '@/services/SpeechService';
import { cn } from '@/lib/utils';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const storySteps = [
  {
    id: 'intro',
    title: '🌊 Ocean Adventure Begins!',
    text: 'Hello there, ocean explorer! I\'m Finn the friendly fish! Come dive with me into the magical underwater world where we\'ll meet amazing sea creatures and discover ocean secrets!',
    emoji: '🐠',
    character: 'Finn',
    bgColor: 'from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900',
    interactive: false,
    wordCount: 25,
    duration: 30
  },
  {
    id: 'coral_reef',
    title: '🐚 Beautiful Coral Reef',
    text: 'Wow! The coral reef says "Welcome to our colorful home!" Can you say that in a cheerful, welcoming voice? Let\'s greet the reef!',
    emoji: '🐚',
    character: 'Finn',
    bgColor: 'from-pink-100 to-orange-100 dark:from-pink-900 dark:to-orange-900',
    interactive: true,
    audioText: 'Welcome to our colorful home',
    choices: ['Welcome to our colorful home', 'Go away from here', 'This place is boring'],
    wordCount: 26,
    duration: 36,
    question: 'What does the coral reef say to us?',
    hint: 'The reef is happy to see us'
  },
  {
    id: 'dolphin_friend',
    title: '🐬 Playful Dolphin Friend!',
    text: 'Amazing! The dolphin says "Let\'s splash and play together!" Can you say that with a playful, excited voice? Ready to play!',
    emoji: '🐬',
    character: 'Finn',
    bgColor: 'from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900',
    interactive: true,
    audioText: 'Let us splash and play together',
    choices: ['Let us splash and play together', 'I want to be alone', 'Playing is not fun'],
    wordCount: 28,
    duration: 36,
    question: 'What does the dolphin want to do with us?',
    hint: 'Dolphins love to have fun in the water'
  },
  {
    id: 'first_pearl',
    title: '💎 First Shining Pearl!',
    text: 'Fantastic! We found our first glowing ocean pearl! Pearls help guide sea creatures and make the ocean sparkle. Three more pearls to collect!',
    emoji: '💎',
    character: 'Finn',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: false,
    pearlsNeeded: 4,
    wordCount: 21,
    duration: 25
  },
  {
    id: 'octopus_hide',
    title: '🐙 Clever Octopus Hideout!',
    text: 'The clever octopus says "I can hide anywhere I want!" Can you say that in a sneaky, playful voice? Let\'s practice being sneaky!',
    emoji: '🐙',
    character: 'Finn',
    bgColor: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
    interactive: true,
    audioText: 'I can hide anywhere I want',
    choices: ['I can hide anywhere I want', 'Everyone can always see me', 'I never play hide and seek'],
    wordCount: 28,
    duration: 36,
    question: 'What special skill does the octopus have?',
    hint: 'It can change colors to hide'
  },
  {
    id: 'whale_song',
    title: '🐋 Magical Whale Song!',
    text: 'The whale sings "The ocean is my home so deep!" Can you sing that in a deep, slow voice like a big whale? Let\'s sing!',
    emoji: '🐋',
    character: 'Finn',
    bgColor: 'from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900',
    interactive: true,
    audioText: 'The ocean is my home so deep',
    choices: ['The ocean is my home so deep', 'I live in the sky', 'I do not have a home'],
    wordCount: 30,
    duration: 38,
    question: 'What does the whale sing about?',
    hint: 'The whale loves living in the deep ocean'
  },
  {
    id: 'second_pearl',
    title: '✨ Second Sparkling Pearl!',
    text: 'Wonderful! Another pearl appeared near the whale! Pearls glow because they\'re happy to see explorers like us! Two more pearls to go!',
    emoji: '✨',
    character: 'Finn',
    bgColor: 'from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800',
    interactive: false,
    pearlsNeeded: 4,
    wordCount: 20,
    duration: 25
  },
  {
    id: 'sea_turtle',
    title: '🐢 Wise Sea Turtle!',
    text: 'The turtle says "Take your time and enjoy the journey!" Can you say that in a slow, wise voice? Let\'s be calm and wise!',
    emoji: '🐢',
    character: 'Finn',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: true,
    audioText: 'Take your time and enjoy the journey',
    choices: ['Take your time and enjoy the journey', 'Always rush and hurry', 'Never stop to rest'],
    wordCount: 28,
    duration: 36,
    question: 'What wise lesson does the turtle teach us?',
    hint: 'It\'s about not hurrying too much'
  },
  {
    id: 'seahorse_dance',
    title: '🦋 Magical Seahorse Dance!',
    text: 'The seahorses say "Dancing makes us happy!" Can you say that while moving gently like you\'re dancing? Let\'s dance with them!',
    emoji: '🦋',
    character: 'Finn',
    bgColor: 'from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900',
    interactive: true,
    audioText: 'Dancing makes us happy',
    choices: ['Dancing makes us happy', 'We never move around', 'Moving is very sad'],
    wordCount: 26,
    duration: 36,
    question: 'How do the seahorses feel when they dance?',
    hint: 'They feel good and joyful'
  },
  {
    id: 'third_pearl',
    title: '🌟 Third Glowing Pearl!',
    text: 'Excellent! We found our third pearl near the seahorses! It\'s shining extra bright to celebrate our adventure! Just one more pearl to find!',
    emoji: '🌟',
    character: 'Finn',
    bgColor: 'from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800',
    interactive: false,
    pearlsNeeded: 4,
    wordCount: 19,
    duration: 25
  },
  {
    id: 'treasure_chest',
    title: '📦 Sunken Treasure!',
    text: 'We found treasure! Let\'s shout "We discovered something amazing!" Can you say that with surprise and excitement? Let\'s celebrate!',
    emoji: '📦',
    character: 'Finn',
    bgColor: 'from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900',
    interactive: true,
    audioText: 'We discovered something amazing',
    choices: ['We discovered something amazing', 'We found nothing special', 'This is very boring'],
    wordCount: 28,
    duration: 36,
    question: 'How do we feel about finding the treasure?',
    hint: 'We are excited and surprised'
  },
  {
    id: 'final_pearl',
    title: '💫 Fourth Magic Pearl!',
    text: 'Hooray! We collected all four magic pearls! They\'re creating a beautiful pearl bridge across the ocean! You\'re an amazing ocean explorer!',
    emoji: '💫',
    character: 'Finn',
    bgColor: 'from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800',
    interactive: false,
    pearlsNeeded: 4,
    wordCount: 19,
    duration: 25
  },
  {
    id: 'celebration',
    title: '🎉 Ocean Hero Celebration!',
    text: 'Congratulations, ocean hero! You helped Finn complete the underwater mission! All the sea creatures are celebrating, and the ocean is sparkling with joy!',
    emoji: '🎉',
    character: 'Finn',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 20,
    duration: 35
  }
];

const UnderwaterWorld = ({ onClose, onComplete }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [pearls, setPearls] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const current = storySteps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / storySteps.length) * 100);
  const totalSteps = storySteps.length;
  const totalWords = storySteps.reduce((sum, step) => sum + step.wordCount, 0);
  const totalDuration = storySteps.reduce((sum, step) => sum + step.duration, 0);

  // Smooth scroll to top on step change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [stepIndex]);

  // Timer for tracking session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-play story narration
  useEffect(() => {
    if (current.text && SpeechService.isTTSSupported()) {
      const playNarration = async () => {
        try {
          await SpeechService.speak(current.text, { rate: 0.8, pitch: 1.1 });
        } catch (error) {
          console.log('TTS not available');
        }
      };
      playNarration();
    }
  }, [current.text]);

  const handleNext = () => {
    if (stepIndex < storySteps.length - 1) {
      setStepIndex(stepIndex + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      // Calculate score based on correct answers and time
      const accuracyScore = correctAnswers * 15;
      const timeBonus = Math.max(0, 480 - timeSpent) * 0.1;
      const pearlBonus = pearls * 10;
      const score = Math.min(100, 40 + accuracyScore + timeBonus + pearlBonus);
      onComplete(score);
    }
  };

  const handleChoice = async (choice: string) => {
    setSelectedChoice(choice);
    setIsPlaying(true);
    
    // Play the correct word with excitement
    if (current.audioText && SpeechService.isTTSSupported()) {
      try {
        await SpeechService.speak(current.audioText, { rate: 0.7, pitch: 1.3 });
      } catch (error) {
        console.log('TTS not available');
      }
    }
    
    setIsPlaying(false);
    
    // Check if choice is correct
    const isCorrect = choice === current.audioText;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      // Add pearl for every correct answer in interactive steps
      setPearls(prev => Math.min(4, prev + 1));
    }
    
    setShowFeedback(true);
    
    // Auto-advance after showing feedback
    setTimeout(() => {
      handleNext();
    }, 2500);
  };

  const playAudio = async () => {
    if (current.audioText && SpeechService.isTTSSupported()) {
      setIsPlaying(true);
      try {
        await SpeechService.speak(current.audioText, { rate: 0.7, pitch: 1.3 });
      } catch (error) {
        console.log('TTS not available');
      }
      setIsPlaying(false);
    }
  };

  const playStoryText = async () => {
    if (current.text && SpeechService.isTTSSupported()) {
      setIsPlaying(true);
      try {
        await SpeechService.speak(current.text, { rate: 0.8, pitch: 1.1 });
      } catch (error) {
        console.log('TTS not available');
      }
      setIsPlaying(false);
    }
  };

  const getCharacterAnimation = () => {
    if (current.id.includes('pearl')) return 'animate-bounce';
    return 'animate-float';
  };

  const getOceanIcon = () => {
    switch (current.id) {
      case 'coral_reef': return Sparkles;
      case 'dolphin_friend': return Waves;
      case 'octopus_hide': return Sparkles;
      case 'whale_song': return Waves;
      case 'sea_turtle': return Sparkles;
      case 'seahorse_dance': return Sparkles;
      case 'treasure_chest': return Sparkles;
      default: return Waves;
    }
  };

  const OceanIcon = getOceanIcon();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-4xl rounded-3xl overflow-hidden transition-all duration-500",
        "bg-gradient-to-br", current.bgColor,
        "max-h-[90vh] flex flex-col"
      )}>
        {/* Always Visible Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="h-10 w-10 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          >
            <X className="w-5 h-5 text-gray-700 hover:text-gray-900" />
          </Button>
        </div>

        <CardContent className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col overflow-hidden" ref={contentRef}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Fish className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600 animate-swim" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Finn's Ocean Adventure</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                💎 {pearls}/4 Pearls
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2 sm:h-3 mb-6 sm:mb-8 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-500" />
          </Progress>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto smooth-scroll pb-4">
            <div className="text-center">
              {/* Character and Scene */}
              <div className="relative mb-4 sm:mb-6">
                <div className={cn(
                  "text-6xl sm:text-7xl md:text-8xl mb-3 sm:mb-4", 
                  getCharacterAnimation()
                )}>
                  <span className={cn(
                    current.id === 'celebration' && 'animate-celebration-party'
                  )}>
                    {current.emoji}
                  </span>
                </div>
                
                {/* Pearl Collection Display - Show in all steps like other stories */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full transition-all duration-500 transform hover:scale-125 border-2 flex items-center justify-center",
                        i < pearls 
                          ? 'bg-white border-white shadow-lg animate-pulse drop-shadow-lg' 
                          : 'bg-gray-300/50 border-gray-400 opacity-50'
                      )} 
                    >
                      {i < pearls && <span className="text-yellow-400 text-lg">●</span>}
                    </div>
                  ))}
                </div>

                {/* Ocean Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <OceanIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-cyan-400 opacity-70" />
                </div>
              </div>

              {/* Story Text */}
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-sm border-2 border-white/20 shadow-lg sm:shadow-2xl">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
                  {current.title}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={playStoryText}
                    className="text-blue-500 hover:text-blue-600 h-6 w-6 sm:h-8 sm:w-8 p-0"
                  >
                    <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </h3>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed mx-auto">
                  {current.text}
                </p>
                
                {/* Word Count and Duration */}
                <div className="flex justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span>📝 {current.wordCount} words</span>
                  <span>⏱️ {current.duration}s</span>
                </div>
              </div>

              {/* Interactive Elements */}
              {current.interactive && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Question and Hint */}
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-cyan-200 dark:border-cyan-700">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2">
                      {current.question}
                    </h4>
                    {showHint ? (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        💡 Ocean Hint: {current.hint}
                      </p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-cyan-600 border-cyan-300 hover:bg-cyan-100 text-xs sm:text-sm"
                      >
                        Need an ocean hint? 🌊
                      </Button>
                    )}
                  </div>

                  {/* Audio Play Button */}
                  {current.audioText && (
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <Button 
                        onClick={playAudio}
                        disabled={isPlaying}
                        className={cn(
                          "rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base",
                          isPlaying && "animate-pulse"
                        )}
                      >
                        {isPlaying ? (
                          <>
                            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                            Listening...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            <span className="hidden sm:inline">Listen to the Ocean Word</span>
                            <span className="sm:hidden">🔊 Listen</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Choice Buttons */}
                  {current.choices && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 justify-center">
                      {current.choices.map((choice) => {
                        const isSelected = selectedChoice === choice;
                        const isCorrect = choice === current.audioText;
                        const showResult = showFeedback && isSelected;
                        
                        return (
                          <Button
                            key={choice}
                            onClick={() => handleChoice(choice)}
                            disabled={showFeedback}
                            className={cn(
                              "rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-lg font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[60px] sm:min-h-[80px]",
                              showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-lg sm:shadow-2xl",
                              showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white shadow-md sm:shadow-xl",
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-cyan-300 hover:shadow-lg"
                            )}
                          >
                            <span className="flex flex-col items-center gap-1">
                              <span className="text-xl sm:text-2xl mb-1">
                                {choice === 'coral' && '🐚'}
                                {choice === 'dolphin' && '🐬'}
                                {choice === 'octopus' && '🐙'}
                                {choice === 'whale' && '🐋'}
                                {choice === 'turtle' && '🐢'}
                                {choice === 'seahorse' && '🦋'}
                                {choice === 'treasure' && '📦'}
                                {choice === 'shell' && '🐚'}
                                {choice === 'rock' && '🪨'}
                                {choice === 'whale' && '🐋'}
                                {choice === 'shark' && '🦈'}
                                {choice === 'squid' && '🦑'}
                                {choice === 'jellyfish' && '🎐'}
                                {choice === 'seal' && '🔹'}
                                {choice === 'crab' && '🦀'}
                                {choice === 'lobster' && '🦞'}
                                {choice === 'starfish' && '⭐'}
                                {choice === 'shells' && '🐚'}
                                {choice === 'rocks' && '🪨'}
                              </span>
                              {choice}
                              {showResult && isCorrect && (
                                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300 animate-pulse" />
                              )}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {/* Feedback */}
                  {showFeedback && (
                    <div className="mt-3 sm:mt-4 animate-fade-in">
                      {selectedChoice === current.audioText ? (
                        <div className="text-green-600 dark:text-green-400 text-lg sm:text-xl font-bold animate-bounce bg-green-50 dark:bg-green-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-green-200 dark:border-green-700">
                          🎉 Splash-tastic! You earned a pearl! 💎
                        </div>
                      ) : (
                        <div className="text-red-600 dark:text-red-400 text-lg sm:text-xl font-bold bg-red-50 dark:bg-red-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-red-200 dark:border-red-700">
                          💪 Great try! The ocean word was "{current.audioText}" - Let's explore together!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Non-interactive steps */}
              {!current.interactive && (
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={handleNext} 
                    className="rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-sm sm:text-base"
                  >
                    {stepIndex === storySteps.length - 1 ? (
                      <>
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-pulse" />
                        <span className="hidden sm:inline">Complete Ocean Mission! ✨</span>
                        <span className="sm:hidden">Finish! ✨</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="hidden sm:inline">Continue Ocean Adventure! 🌊</span>
                        <span className="sm:hidden">Continue 🌊</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="hidden sm:block absolute top-4 left-4 animate-float-slow">
            <Waves className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 left-4 animate-float-medium">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 right-4 animate-float-fast">
            <Fish className="w-6 h-6 text-teal-400" />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Custom Animations */}
      <style>{`
        .smooth-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        
        .smooth-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .smooth-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .smooth-scroll::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
        }
        
        .smooth-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
        
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
        
        @keyframes swim {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          25% { transform: translateX(-2px) rotate(-5deg); }
          75% { transform: translateX(2px) rotate(5deg); }
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
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
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
        
        .animate-swim {
          animation: swim 2s ease-in-out infinite;
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
          .smooth-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          .smooth-scroll::-webkit-scrollbar {
            display: none;
          }
          
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
      `}</style>
    </div>
  );
};

export default UnderwaterWorld;