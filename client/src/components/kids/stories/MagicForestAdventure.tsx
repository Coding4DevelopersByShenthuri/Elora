import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Rabbit, Star, Volume2, Play, Heart, Zap, Flower, Trees, CloudRain, X } from 'lucide-react';
import SpeechService from '@/services/SpeechService';
import { cn } from '@/lib/utils';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const storySteps = [
  {
    id: 'intro',
    title: '🌳 Magic Forest Adventure',
    text: 'Hello little explorer! I am Luna the magical rabbit! Welcome to our enchanted forest where amazing adventures await us!',
    emoji: '🐰',
    character: 'Luna',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: false,
    wordCount: 18,
    duration: 25
  },
  {
    id: 'whispering_trees',
    title: '🌲 Whispering Trees',
    text: 'Look at these magnificent trees! They whisper secrets when the wind blows. Can you count how many trees are dancing?',
    emoji: '🌲',
    character: 'Luna',
    bgColor: 'from-green-200 to-teal-200 dark:from-green-800 dark:to-teal-800',
    interactive: true,
    audioText: 'tree',
    choices: ['tree', 'flower', 'rock'],
    wordCount: 19,
    duration: 30,
    question: 'What whispers in the wind?',
    hint: 'It has leaves and branches'
  },
  {
    id: 'colorful_butterfly',
    title: '🦋 Rainbow Butterfly',
    text: 'Oh wonderful! A rainbow butterfly is flying toward us! Its wings have all the colors of the rainbow. What colors can you spot?',
    emoji: '🦋',
    character: 'Luna',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: true,
    audioText: 'butterfly',
    choices: ['bird', 'bee', 'butterfly'],
    wordCount: 24,
    duration: 35,
    question: 'What has colorful wings?',
    hint: 'It flies and loves flowers'
  },
  {
    id: 'sparkling_river',
    title: '💧 Sparkling River',
    text: 'Listen to the happy river! The water sparkles like diamonds under the sun. Can you hear the gentle water sounds?',
    emoji: '💧',
    character: 'Luna',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: true,
    audioText: 'water',
    choices: ['river', 'water', 'stream'],
    wordCount: 20,
    duration: 30,
    question: 'What sparkles and flows?',
    hint: 'You can drink it and swim in it'
  },
  {
    id: 'talking_flowers',
    title: '🌸 Talking Flowers',
    text: 'Amazing! These magical flowers can talk! They are telling us about friendship and kindness. What do flowers need to grow big and strong?',
    emoji: '🌸',
    character: 'Luna',
    bgColor: 'from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900',
    interactive: true,
    audioText: 'flower',
    choices: ['plant', 'grass', 'flower'],
    wordCount: 25,
    duration: 35,
    question: 'What blooms and smells nice?',
    hint: 'Bees love to visit them'
  },
  {
    id: 'star_discovery',
    title: '⭐ First Magic Star',
    text: 'Hooray! We found our first glowing star! It fell from the night sky. Stars help plants grow and animals sleep. Two more to find!',
    emoji: '⭐',
    character: 'Luna',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: false,
    starsNeeded: 3,
    wordCount: 28,
    duration: 30
  },
  {
    id: 'friendly_squirrel',
    title: '🐿️ Busy Squirrel',
    text: 'Look up there! A friendly squirrel is gathering nuts for winter. Squirrels have fluffy tails and love to climb trees very fast!',
    emoji: '🐿️',
    character: 'Luna',
    bgColor: 'from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900',
    interactive: true,
    audioText: 'squirrel',
    choices: ['rabbit', 'squirrel', 'mouse'],
    wordCount: 22,
    duration: 35,
    question: 'Who collects nuts for winter?',
    hint: 'It has a bushy tail and climbs trees'
  },
  {
    id: 'second_star',
    title: '✨ Second Shining Star',
    text: 'Incredible! Another star appeared near the old oak tree! Stars twinkle because they are happy to see us exploring. One last star to go!',
    emoji: '✨',
    character: 'Luna',
    bgColor: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
    interactive: false,
    starsNeeded: 3,
    wordCount: 26,
    duration: 30
  },
  {
    id: 'wise_owl',
    title: '🦉 Wise Old Owl',
    text: 'Good evening! The wise owl says hello! Owls can turn their heads almost all the way around and see in the dark. Amazing!',
    emoji: '🦉',
    character: 'Luna',
    bgColor: 'from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900',
    interactive: true,
    audioText: 'owl',
    choices: ['owl', 'eagle', 'hawk'],
    wordCount: 24,
    duration: 35,
    question: 'Who sees well at night?',
    hint: 'It says "hoot hoot" and sleeps during day'
  },
  {
    id: 'final_star',
    title: '🌟 Third Magic Star',
    text: 'We did it! All three magic stars are glowing brightly! They will keep our forest magical forever. You are an amazing explorer!',
    emoji: '🌟',
    character: 'Luna',
    bgColor: 'from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900',
    interactive: false,
    starsNeeded: 3,
    wordCount: 23,
    duration: 30
  },
  {
    id: 'grand_celebration',
    title: '🎉 Forest Celebration!',
    text: 'Congratulations superstar! The whole forest is celebrating! Animals are dancing, flowers are singing, and magic sparkles everywhere! You made the forest happy!',
    emoji: '🎉',
    character: 'Luna',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 22,
    duration: 40
  }
];

const MagicForestAdventure = ({ onClose, onComplete }: Props) => {
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
      const timeBonus = Math.max(0, 300 - timeSpent) * 0.1; // Bonus for faster completion
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

  const getEnvironmentIcon = () => {
    switch (current.id) {
      case 'whispering_trees': return Trees;
      case 'colorful_butterfly': return Sparkles;
      case 'sparkling_river': return CloudRain;
      case 'talking_flowers': return Flower;
      default: return Sparkles;
    }
  };

  const EnvironmentIcon = getEnvironmentIcon();

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
                <Rabbit className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Luna's Magic Forest</h2>
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
          <Progress value={progress} className="h-2 sm:h-3 mb-6 sm:mb-8 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500" />
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
                    current.id === 'grand_celebration' && 'animate-celebration-party'
                  )}>
                    {current.emoji}
                  </span>
                </div>
                
                {/* Star Collection Display - Show in all steps like other stories */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-all duration-500 transform hover:scale-125",
                        i < stars 
                          ? 'text-yellow-400 animate-pulse drop-shadow-lg' 
                          : 'text-gray-300 opacity-50'
                      )} 
                    />
                  ))}
                </div>

                {/* Environment Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <EnvironmentIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-green-500 opacity-70" />
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
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-yellow-200 dark:border-yellow-700">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2">
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

                  {/* Audio Play Button */}
                  {current.audioText && (
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <Button 
                        onClick={playAudio}
                        disabled={isPlaying}
                        className={cn(
                          "rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base",
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
                            <span className="hidden sm:inline">🔊 Listen to the Magic Word</span>
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
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg"
                            )}
                          >
                            <span className="flex flex-col items-center gap-1">
                              <span className="text-xl sm:text-2xl mb-1">
                                {choice === 'tree' && '🌲'}
                                {choice === 'butterfly' && '🦋'}
                                {choice === 'water' && '💧'}
                                {choice === 'flower' && '🌸'}
                                {choice === 'squirrel' && '🐿️'}
                                {choice === 'owl' && '🦉'}
                                {choice === 'bird' && '🐦'}
                                {choice === 'bee' && '🐝'}
                                {choice === 'rock' && '🪨'}
                                {choice === 'river' && '🌊'}
                                {choice === 'stream' && '💦'}
                                {choice === 'plant' && '🌱'}
                                {choice === 'grass' && '🌿'}
                                {choice === 'rabbit' && '🐰'}
                                {choice === 'mouse' && '🐭'}
                                {choice === 'eagle' && '🦅'}
                                {choice === 'hawk' && '🦅'}
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
                          🎉 Fantastic! You earned a star! 🌟
                        </div>
                      ) : (
                        <div className="text-red-600 dark:text-red-400 text-lg sm:text-xl font-bold bg-red-50 dark:bg-red-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-red-200 dark:border-red-700">
                          💪 Great try! The magic word was "{current.audioText}" - Let's learn together!
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
                    className="rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-sm sm:text-base"
                  >
                    {stepIndex === storySteps.length - 1 ? (
                      <>
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-pulse" />
                        <span className="hidden sm:inline">Complete Magic Journey! ✨</span>
                        <span className="sm:hidden">Finish! ✨</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        <span className="hidden sm:inline">Continue Adventure! 🚀</span>
                        <span className="sm:hidden">Continue 🚀</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="hidden sm:block absolute top-4 left-4 animate-float-slow">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 left-4 animate-float-medium">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 right-4 animate-float-fast">
            <Flower className="w-6 h-6 text-green-400" />
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
          background: rgba(139, 92, 246, 0.3);
          border-radius: 10px;
        }
        
        .smooth-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
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

export default MagicForestAdventure;