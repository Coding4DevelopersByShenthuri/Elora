import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Anchor, Star, Volume2, Play, Heart, Zap, Telescope, Ship, X } from 'lucide-react';
import SpeechService from '@/services/SpeechService';
import { cn } from '@/lib/utils';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const pirateStory = [
  {
    id: 'intro',
    title: '🏴‍☠️ Ahoy, Matey!',
    text: 'Ahoy there, shipmate! ... I\'m Captain Finn! ... Our pirate ship is ready to find buried treasure! ... Can you hear the ocean waves? Have you ever been on a boat or seen the ocean? This is a pirate adventure!',
    emoji: '🧔‍♂️',
    character: 'Captain Finn',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: false,
    wordCount: 18,
    duration: 25
  },
  {
    id: 'treasure_map',
    title: '🗺️ Secret Map!',
    text: 'Look at this old treasure map! ... The map says "X marks the spot where treasure hides!" ... Can you say that? ... Arrr, let\'s shout it! X means "here" on a treasure map!',
    emoji: '🗺️',
    character: 'Captain Finn',
    bgColor: 'from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900',
    interactive: true,
    audioText: 'X marks the spot where treasure hides',
    choices: ['X marks the spot where treasure hides', 'The treasure is not here', 'We cannot find anything'],
    wordCount: 28,
    duration: 38,
    question: 'What does the map tell us about the treasure?',
    hint: 'It shows us exactly where to look'
  },
  {
    id: 'parrot_friend',
    title: '🦜 Polly the Parrot',
    text: 'Here\'s Polly the colorful parrot! ... Polly squawks "Follow me to the treasure island!" ... (Squawk it like a parrot - high and fun!) Can you squawk that? ... Let\'s squawk together! Squawk! Have you ever seen a parrot talk?',
    emoji: '🦜',
    character: 'Polly',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: true,
    audioText: 'Follow me to the treasure island',
    choices: ['Follow me to the treasure island', 'Stay right here forever', 'Go back to the ship'],
    wordCount: 28,
    duration: 38,
    question: 'Where does Polly want to lead us?',
    hint: 'She wants to take us somewhere special'
  },
  {
    id: 'treasure_chest',
    title: '📦 Buried Treasure!',
    text: 'Yo ho ho! ... We did it! ... Let\'s all shout "We found the treasure chest!" ... (Shout it with joy and excitement - as LOUD as you can like a happy pirate!) Can you shout that? ... Arrr, let\'s celebrate! The treasure is full of gold and jewels!',
    emoji: '📦',
    character: 'Captain Finn',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: true,
    audioText: 'We found the treasure chest',
    choices: ['We found the treasure chest', 'We did not find anything', 'This is empty and sad'],
    wordCount: 28,
    duration: 38,
    question: 'What amazing thing did we discover?',
    hint: 'We found what we were looking for'
  },
  {
    id: 'victory_celebration',
    title: '🎉 Pirate Party!',
    text: 'Hooray! ... We\'re rich pirates now! ... Time to celebrate with music, dancing, and a grand pirate feast! ... You\'re a TRUE pirate adventurer! ... You listened perfectly and spoke like a real pirate! ... Give yourself a BIG CHEER! Arrr! 🏴‍☠️',
    emoji: '🎉',
    character: 'Captain Finn & Polly',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: false,
    wordCount: 22,
    duration: 35
  }
];

const PirateTreasureAdventure = ({ onClose, onComplete }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [treasurePieces, setTreasurePieces] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const current = pirateStory[stepIndex];
  const progress = Math.round(((stepIndex + 1) / pirateStory.length) * 100);
  const totalSteps = pirateStory.length;
  const totalWords = pirateStory.reduce((sum, step) => sum + step.wordCount, 0);
  const totalDuration = pirateStory.reduce((sum, step) => sum + step.duration, 0);

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

  // Auto-play story narration with character voice
  useEffect(() => {
    if (current.text && SpeechService.isTTSSupported()) {
      const playNarration = async () => {
        try {
          // Use character-specific voice (Captain Finn or Polly)
          await SpeechService.speakAsCharacter(current.text, current.character as any);
        } catch (error) {
          console.log('TTS not available');
        }
      };
      playNarration();
    }
  }, [current.text, current.character]);

  const handleNext = () => {
    if (stepIndex < pirateStory.length - 1) {
      setStepIndex(stepIndex + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      // Calculate score based on correct answers and time
      const accuracyScore = correctAnswers * 25;
      const timeBonus = Math.max(0, 200 - timeSpent) * 0.1;
      const treasureBonus = treasurePieces * 15;
      const score = Math.min(100, 40 + accuracyScore + timeBonus + treasureBonus);
      onComplete(score);
    }
  };

  const handleChoice = async (choice: string) => {
    setSelectedChoice(choice);
    setIsPlaying(true);
    
    // Play the correct word with character voice
    if (current.audioText && SpeechService.isTTSSupported()) {
      try {
        await SpeechService.speakAsCharacter(current.audioText, current.character as any);
      } catch (error) {
        console.log('TTS not available');
      }
    }
    
    setIsPlaying(false);
    
    // Check if choice is correct
    const isCorrect = choice === current.audioText;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setTreasurePieces(prev => Math.min(3, prev + 1));
    }
    
    setShowFeedback(true);
    
    // Auto-advance after showing feedback
    setTimeout(() => {
      handleNext();
    }, 2500);
  };

  // Helper function to remove emojis from text before TTS
  const stripEmojis = (text: string): string => {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{E0020}-\u{E007F}]/gu, '').trim();
  };

  const playAudio = async () => {
    if (current.audioText && SpeechService.isTTSSupported()) {
      setIsPlaying(true);
      try {
        const cleanText = stripEmojis(current.audioText);
        await SpeechService.speakAsCharacter(cleanText, current.character as any);
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
        const cleanText = stripEmojis(current.text);
        await SpeechService.speakAsCharacter(cleanText, current.character as any);
      } catch (error) {
        console.log('TTS not available');
      }
      setIsPlaying(false);
    }
  };

  const getCharacterAnimation = () => {
    if (current.id.includes('treasure')) return 'animate-bounce';
    return 'animate-float';
  };

  const getPirateIcon = () => {
    switch (current.id) {
      case 'treasure_map': return Telescope;
      case 'parrot_friend': return Sparkles;
      case 'treasure_chest': return Star;
      default: return Anchor;
    }
  };

  const PirateIcon = getPirateIcon();

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
                <Anchor className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Pirate Treasure Hunt</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                💎 {treasurePieces}/3 Treasure
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2 mb-3 sm:mb-4 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-blue-400 to-amber-400 rounded-full transition-all duration-500" />
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
                    current.id === 'victory_celebration' && 'animate-celebration-party'
                  )}>
                    {current.emoji}
                  </span>
                </div>
                
                {/* Treasure Collection Display */}
                {(current.id.includes('treasure') || current.id === 'victory_celebration') && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star 
                        key={i} 
                      className={cn(
                        "w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 transition-all duration-500 transform hover:scale-125",
                          i < treasurePieces 
                            ? 'text-yellow-400 animate-pulse drop-shadow-lg' 
                            : 'text-gray-300 opacity-50'
                        )} 
                      />
                    ))}
                  </div>
                )}

                {/* Pirate Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <PirateIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-amber-500 opacity-70" />
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
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 border border-amber-200 dark:border-amber-700">
                    <h4 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1">
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
                        className="text-amber-600 border-amber-300 hover:bg-amber-100 text-xs sm:text-sm"
                      >
                        Need a hint? 🏴‍☠️
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
                          "rounded-lg sm:rounded-xl md:rounded-2xl px-3 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-[10px] sm:text-xs md:text-sm",
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
                            <span className="hidden sm:inline">Listen to the Pirate Word</span>
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
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-amber-300 hover:shadow-lg"
                            )}
                          >
                            <span className="flex flex-col items-center gap-0.5 sm:gap-1">
                              <span className="text-base sm:text-lg md:text-xl mb-0.5">
                                {choice === 'map' && '🗺️'}
                                {choice === 'parrot' && '🦜'}
                                {choice === 'treasure' && '💎'}
                                {choice === 'book' && '📖'}
                                {choice === 'letter' && '✉️'}
                                {choice === 'seagull' && '🐦'}
                                {choice === 'pelican' && '🐦'}
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
                    <div className="mt-2 sm:mt-3 animate-fade-in">
                      {selectedChoice === current.audioText ? (
                        <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm md:text-base font-bold animate-bounce bg-green-50 dark:bg-green-900/20 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 border border-green-200 dark:border-green-700">
                          🎉 YO HO HO! You listened like a true pirate and spoke perfectly! Great pirate skills! 💎 Arrr, I\'m proud of you!
                        </div>
                      ) : (
                        <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm md:text-base font-bold bg-red-50 dark:bg-red-900/20 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 border border-red-200 dark:border-red-700">
                          💪 Shiver me timbers! That was a brave try! The pirate word was "{current.audioText}" - Let's practice it together, matey! You\'re doing GREAT!
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
                    className="rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-[10px] sm:text-xs md:text-sm"
                  >
                    {stepIndex === pirateStory.length - 1 ? (
                      <>
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-pulse" />
                        <span className="hidden sm:inline">Complete Pirate Adventure! 🏴‍☠️</span>
                        <span className="sm:hidden">Finish! 🏴‍☠️</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Continue Adventure! ⚓</span>
                        <span className="sm:hidden">Continue ⚓</span>
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
            <Ship className="w-6 h-6 text-blue-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 right-4 animate-float-fast">
            <Anchor className="w-6 h-6 text-gray-400" />
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
          background: rgba(245, 158, 11, 0.3);
          border-radius: 10px;
        }
        
        .smooth-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.5);
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

export default PirateTreasureAdventure;