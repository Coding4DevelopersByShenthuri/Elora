import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Star, Volume2, Play, Heart, Zap, Flower, Cloud, X } from 'lucide-react';
import SpeechService from '@/services/SpeechService';
import { cn } from '@/lib/utils';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const storySteps = [
  {
    id: 'intro',
    title: '🌈 Unicorn Magic!',
    text: 'Welcome to Sparkle Kingdom! ... I am Stardust the unicorn! ... (Use a MAGICAL, SPARKLY, ENCHANTING voice—like a beautiful unicorn!) Everything here glows with rainbow colors. ... Can you see the magic sparkles? Have you ever seen a rainbow? This kingdom has rainbows everywhere!',
    emoji: '🦄',
    character: 'Stardust',
    bgColor: 'from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900',
    interactive: false,
    wordCount: 20,
    duration: 25
  },
  {
    id: 'rainbow_bridge',
    title: '🌉 Rainbow Bridge',
    text: 'Look at this beautiful rainbow bridge! ... The rainbow bridge says "Walk across me carefully!" ... (Say it in a GENTLE, MAGICAL, PEACEFUL voice—like walking on something precious!) Can you say that? ... Let us say it together! Rainbows are delicate and special!',
    emoji: '🌈',
    character: 'Stardust',
    bgColor: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
    interactive: true,
    audioText: 'Walk across me carefully',
    choices: ['Walk across me carefully', 'Run very fast across', 'Jump up and down'],
    wordCount: 26,
    duration: 36,
    question: 'What does the rainbow bridge want us to do?',
    hint: 'We should move slowly and safely'
  },
  {
    id: 'first_star',
    title: '⭐ First Magic Star!',
    text: 'Wonderful! ... YAY! ... We found our first glowing star! ... You are such a magical explorer! ... Stars in Sparkle Kingdom grant special wishes—like wishing on a star at night! ... Two more stars to collect! ... What will we find next?',
    emoji: '⭐',
    character: 'Stardust',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: false,
    starsNeeded: 3,
    wordCount: 21,
    duration: 25
  },
  {
    id: 'talking_flowers',
    title: '🌸 Singing Flowers',
    text: 'Listen to the beautiful flowers! ... The flowers sing "Kind words make us bloom!" ... (Sing it SWEETLY and GENTLY—like a soft, beautiful song!) Can you sing that? ... Let us sing with the flowers! Kind words are like sunshine for flowers and friends!',
    emoji: '🌸',
    character: 'Stardust',
    bgColor: 'from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900',
    interactive: true,
    audioText: 'Kind words make us bloom',
    choices: ['Kind words make us bloom', 'Mean words are the best', 'We do not like singing'],
    wordCount: 26,
    duration: 36,
    question: 'What makes the flowers bloom and grow?',
    hint: 'They love hearing nice things'
  },
  {
    id: 'fluffy_clouds',
    title: '☁️ Fluffy Cloud Friends',
    text: 'Look at these soft, fluffy clouds! ... The clouds say "We love floating free in the sky!" ... (Say it in a LIGHT, AIRY, FLOATING voice while imagining you are drifting gently!) Can you say that? ... Let us float! Have you ever watched clouds float by?',
    emoji: '☁️',
    character: 'Stardust',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: true,
    audioText: 'We love floating free in the sky',
    choices: ['We love floating free in the sky', 'We fall down to the ground', 'We cannot move at all'],
    wordCount: 28,
    duration: 38,
    question: 'What do the clouds enjoy doing?',
    hint: 'They drift gently through the air'
  },
  {
    id: 'second_star',
    title: '✨ Second Sparkling Star!',
    text: 'Amazing! ... You are doing so wonderfully! ... Another star appeared near the singing flowers! ... Stars twinkle when they hear beautiful music—just like they are dancing! ... One more star to find! ... We are almost there!',
    emoji: '✨',
    character: 'Stardust',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: false,
    starsNeeded: 3,
    wordCount: 22,
    duration: 25
  },
  {
    id: 'crystal_cave',
    title: '💎 Crystal Cave',
    text: 'Listen to the singing crystals! ... The crystals hum "We sing together in harmony!" ... (Say it with a MUSICAL, FLOWING, HARMONIOUS voice—like beautiful notes blending together!) Can you say that? ... Let us harmonize! Crystals make beautiful sounds when they sing together!',
    emoji: '💎',
    character: 'Stardust',
    bgColor: 'from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900',
    interactive: true,
    audioText: 'We sing together in harmony',
    choices: ['We sing together in harmony', 'We make terrible sounds', 'We are always silent'],
    wordCount: 28,
    duration: 36,
    question: 'What do the crystals create together?',
    hint: 'They make beautiful sounds that blend'
  },
  {
    id: 'butterfly_garden',
    title: '🦋 Magic Butterflies',
    text: 'Here come the colorful butterflies! ... The butterflies say "Our wings spread beauty everywhere!" ... (Say it in a GENTLE, FLUTTERING, GRACEFUL voice while moving your arms like butterfly wings!) Can you say that? ... Let us flutter! Have you ever seen butterflies flying in a garden?',
    emoji: '🦋',
    character: 'Stardust',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: true,
    audioText: 'Our wings spread beauty everywhere',
    choices: ['Our wings spread beauty everywhere', 'We make everything ugly', 'We cannot fly at all'],
    wordCount: 28,
    duration: 38,
    question: 'What do the butterflies do with their wings?',
    hint: 'They make things beautiful as they fly'
  },
  {
    id: 'third_star',
    title: '🌟 Third Glowing Star!',
    text: 'Fantastic! ... YES! ... We found our third star near the butterflies! ... All three stars are glowing brightly now! ... (They are shining because of YOU!) The magic is complete! ... You are an AMAZING magical explorer! ... I am so proud of you!',
    emoji: '🌟',
    character: 'Stardust',
    bgColor: 'from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800',
    interactive: false,
    starsNeeded: 3,
    wordCount: 21,
    duration: 25
  },
  {
    id: 'wishing_fountain',
    title: '⛲ Magic Fountain',
    text: 'Here is the magical wishing fountain! ... The fountain says "Make a wish and believe in magic!" ... (Say it with HOPE and WONDER—like making a birthday wish!) Can you say that? ... Let us make wishes! What would you wish for?',
    emoji: '⛲',
    character: 'Stardust',
    bgColor: 'from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900',
    interactive: true,
    audioText: 'Make a wish and believe in magic',
    choices: ['Make a wish and believe in magic', 'Wishes never come true', 'Magic is not real'],
    wordCount: 28,
    duration: 38,
    question: 'What does the fountain encourage us to do?',
    hint: 'It wants us to hope and dream'
  },
  {
    id: 'grand_celebration',
    title: '🎉 Sparkle Kingdom Celebration!',
    text: 'Congratulations! ... You helped restore all the magic to Sparkle Kingdom! ... The flowers are singing, crystals are humming, and rainbows are everywhere! ... You listened so beautifully and spoke with such magical voices! ... You are a SUPERSTAR unicorn friend! ... Spread your magic with a big smile! ✨🦄',
    emoji: '🎉',
    character: 'Stardust',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 23,
    duration: 35
  }
];

const UnicornMagicAdventure = ({ onClose, onComplete }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [stars, setStars] = useState(0);
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
          await SpeechService.speak(current.text, { rate: 0.8, pitch: 1.2 });
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
      const accuracyScore = correctAnswers * 20;
      const timeBonus = Math.max(0, 300 - timeSpent) * 0.1;
      const starBonus = stars * 10;
      const score = Math.min(100, 40 + accuracyScore + timeBonus + starBonus);
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
      // Add star for every correct answer in interactive steps
      setStars(prev => Math.min(3, prev + 1));
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
        await SpeechService.speak(current.text, { rate: 0.8, pitch: 1.2 });
      } catch (error) {
        console.log('TTS not available');
      }
      setIsPlaying(false);
    }
  };

  const getCharacterAnimation = () => {
    if (current.id.includes('star')) return 'animate-bounce';
    return 'animate-float';
  };

  const getMagicIcon = () => {
    switch (current.id) {
      case 'rainbow_bridge': return Sparkles;
      case 'talking_flowers': return Flower;
      case 'fluffy_clouds': return Cloud;
      case 'crystal_cave': return Sparkles;
      case 'butterfly_garden': return Sparkles;
      case 'wishing_fountain': return Sparkles;
      default: return Sparkles;
    }
  };

  const MagicIcon = getMagicIcon();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-5xl h-[95vh] rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500",
        "bg-gradient-to-br", current.bgColor,
        "flex flex-col"
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

        <CardContent className="p-2 sm:p-4 md:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden" ref={contentRef}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 animate-bounce" />
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Stardust's Magic Adventure</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                ⭐ {stars}/3 Stars
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2 mb-3 sm:mb-4 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500" />
          </Progress>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden pb-2">
            <div className="text-center h-full flex flex-col justify-center">
              {/* Character and Scene */}
              <div className="relative mb-1 sm:mb-2 md:mb-3">
                <div className={cn(
                  "text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-1 sm:mb-2", 
                  getCharacterAnimation()
                )}>
                  <span className={cn(
                    current.id === 'grand_celebration' && 'animate-celebration-party'
                  )}>
                    {current.emoji}
                  </span>
                </div>
                
                {/* Star Collection Display - Show in all steps like pirate story */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 transition-all duration-500 transform hover:scale-125",
                        i < stars 
                          ? 'text-yellow-400 animate-pulse drop-shadow-lg' 
                          : 'text-gray-300 opacity-50'
                      )} 
                    />
                  ))}
                </div>

                {/* Magic Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <MagicIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-pink-500 opacity-70" />
                </div>
              </div>

              {/* Story Text */}
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 backdrop-blur-sm border-2 border-white/20 shadow-lg sm:shadow-2xl max-w-4xl mx-auto">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1 sm:mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2">
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
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-200 leading-snug sm:leading-relaxed mx-auto max-w-3xl">
                  {current.text}
                </p>
                
                {/* Word Count and Duration */}
                <div className="flex justify-center gap-2 mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  <span>📝 {current.wordCount} words</span>
                  <span>⏱️ {current.duration}s</span>
                </div>
              </div>

              {/* Interactive Elements */}
              {current.interactive && (
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3 max-w-4xl mx-auto w-full">
                  {/* Question and Hint */}
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 border border-pink-200 dark:border-pink-700">
                    <h4 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1">
                      {current.question}
                    </h4>
                    {showHint ? (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        💡 Magic Hint: {current.hint}
                      </p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-pink-600 border-pink-300 hover:bg-pink-100 text-xs sm:text-sm"
                      >
                        Need a magic hint? ✨
                      </Button>
                    )}
                  </div>

                  {/* Audio Play Button */}
                  {current.audioText && (
                    <div className="flex justify-center mb-1.5 sm:mb-2">
                      <Button 
                        onClick={playAudio}
                        disabled={isPlaying}
                        className={cn(
                          "rounded-lg sm:rounded-xl md:rounded-2xl px-3 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-[10px] sm:text-xs md:text-sm",
                          isPlaying && "animate-pulse"
                        )}
                      >
                        {isPlaying ? (
                          <>
                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                            Listening...
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Listen to the Magic Word</span>
                            <span className="sm:hidden">🔊 Listen</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Choice Buttons */}
                  {current.choices && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 justify-center">
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
                              "rounded-md sm:rounded-lg md:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[45px] sm:min-h-[50px] md:min-h-[55px]",
                              showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-lg sm:shadow-2xl",
                              showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white shadow-md sm:shadow-xl",
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:shadow-lg"
                            )}
                          >
                            <span className="flex flex-col items-center gap-0.5 sm:gap-1">
                              <span className="text-base sm:text-lg md:text-xl mb-0.5">
                                {choice === 'rainbow' && '🌈'}
                                {choice === 'flowers' && '🌸'}
                                {choice === 'clouds' && '☁️'}
                                {choice === 'crystals' && '💎'}
                                {choice === 'butterflies' && '🦋'}
                                {choice === 'fountain' && '⛲'}
                                {choice === 'cloud' && '☁️'}
                                {choice === 'river' && '🌊'}
                                {choice === 'trees' && '🌳'}
                                {choice === 'rocks' && '🪨'}
                                {choice === 'stars' && '⭐'}
                                {choice === 'rain' && '🌧️'}
                                {choice === 'diamonds' && '💎'}
                                {choice === 'pearls' && '🔮'}
                                {choice === 'bees' && '🐝'}
                                {choice === 'birds' && '🐦'}
                                {choice === 'river' && '🌊'}
                                {choice === 'waterfall' && '💦'}
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
                    <div className="mt-2 sm:mt-3 animate-fade-in">
                      {selectedChoice === current.audioText ? (
                        <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm md:text-base font-bold animate-bounce bg-green-50 dark:bg-green-900/20 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 border border-green-200 dark:border-green-700">
                          🎉 MAGICAL! You used such a beautiful, enchanting voice and listened perfectly! You earned a star! 🌟 You are a wonderful unicorn friend!
                        </div>
                      ) : (
                        <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm md:text-base font-bold bg-red-50 dark:bg-red-900/20 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 border border-red-200 dark:border-red-700">
                          💪 BEAUTIFUL try! You are working so magically! The magic word was "{current.audioText}" - Let us practice it together! You are doing WONDERFUL!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Non-interactive steps */}
              {!current.interactive && (
                <div className="flex justify-center pt-1.5 sm:pt-2">
                  <Button 
                    onClick={handleNext} 
                    className="rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-[10px] sm:text-xs md:text-sm"
                  >
                    {stepIndex === storySteps.length - 1 ? (
                      <>
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-pulse" />
                        <span className="hidden sm:inline">Complete Magic Journey! ✨</span>
                        <span className="sm:hidden">Finish! ✨</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Continue Magic Adventure! 🦄</span>
                        <span className="sm:hidden">Continue 🦄</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="hidden sm:block absolute top-4 left-4 animate-float-slow">
            <Sparkles className="w-6 h-6 text-pink-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 left-4 animate-float-medium">
            <Heart className="w-6 h-6 text-purple-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 right-4 animate-float-fast">
            <Star className="w-6 h-6 text-yellow-400" />
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
          background: rgba(236, 72, 153, 0.3);
          border-radius: 10px;
        }
        
        .smooth-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.5);
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

export default UnicornMagicAdventure;