import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Rocket, Star, Volume2, Play, Heart, Zap, Moon, X } from 'lucide-react';
import SpeechService from '@/services/SpeechService';
import { cn } from '@/lib/utils';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const storySteps = [
  {
    id: 'intro',
    title: '🚀 Space Adventure Begins!',
    text: "Hi there, space explorer! ... I'm Cosmo the astronaut! ... Our spaceship is ready to explore distant planets and discover amazing space secrets. ... Have you ever looked up at the stars at night? We're going there! ... Are you ready for this incredible journey?",
    emoji: '👨‍🚀',
    character: 'Cosmo',
    bgColor: 'from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900',
    interactive: false,
    wordCount: 28,
    duration: 30
  },
  {
    id: 'rocket_launch',
    title: '🚀 Rocket Launch!',
    text: "3... 2... 1... BLAST OFF! ... Let's all shout \"We are flying to the stars!\" ... Can you say that? ... Ready, go! Have you ever been on a really fast ride? This is even faster!",
    emoji: '🚀',
    character: 'Cosmo',
    bgColor: 'from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800',
    interactive: true,
    audioText: 'We are flying to the stars',
    choices: ['We are flying to the stars', 'We are staying on Earth', 'We are going swimming'],
    wordCount: 28,
    duration: 36,
    question: 'Where are we going on our rocket?',
    hint: 'We\'re traveling up high in the sky'
  },
  {
    id: 'planet_exploration',
    title: '🪐 Amazing Planet Discovery!',
    text: 'Wow! ... Look at this beautiful planet! ... This planet says "My rings make me special!" ... Can you repeat that? ... Let\'s practice saying it! Everyone is special in their own way, just like this planet!',
    emoji: '🪐',
    character: 'Cosmo',
    bgColor: 'from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900',
    interactive: true,
    audioText: 'My rings make me special',
    choices: ['My rings make me special', 'I have no rings at all', 'I am very boring'],
    wordCount: 28,
    duration: 36,
    question: 'What makes this planet feel special?',
    hint: 'Think about what makes it different'
  },
  {
    id: 'alien_meeting',
    title: '👽 Friendly Alien Encounter!',
    text: 'Incredible! ... Look, an alien friend! ... The friendly alien says "Hello new friend from Earth!" ... Can you say that back? ... Let\'s greet them! It\'s nice to make new friends, even in space!',
    emoji: '👽',
    character: 'Cosmo',
    bgColor: 'from-green-100 to-teal-100 dark:from-green-900 dark:to-teal-900',
    interactive: true,
    audioText: 'Hello new friend from Earth',
    choices: ['Hello new friend from Earth', 'Go away right now', 'I am scared of you'],
    wordCount: 30,
    duration: 38,
    question: 'How do we greet the friendly alien?',
    hint: 'We want to be nice and welcoming'
  },
  {
    id: 'first_star',
    title: '⭐ First Shining Star!',
    text: 'Fantastic! ... WOW! ... We found our first glowing space star! ... You\'re being such a great space explorer! ... Stars help guide spaceships and make the night sky beautiful — just like the stars you see before bedtime! ... Three more stars to collect! What do you think we\'ll find next?',
    emoji: '⭐',
    character: 'Cosmo',
    bgColor: 'from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900',
    interactive: false,
    starsNeeded: 4,
    wordCount: 23,
    duration: 25
  },
  {
    id: 'moon_landing',
    title: '🌙 Moon Landing Adventure!',
    text: 'Amazing! ... We landed on the moon! ... It\'s like a giant gray bouncy castle! ... Let\'s all say "I can jump so high here!" ... Can you say it? ... Imagine jumping higher than on a trampoline!',
    emoji: '🌙',
    character: 'Cosmo',
    bgColor: 'from-gray-100 to-slate-100 dark:from-gray-900 dark:to-slate-900',
    interactive: true,
    audioText: 'I can jump so high here',
    choices: ['I can jump so high here', 'I cannot move at all', 'I am very heavy here'],
    wordCount: 30,
    duration: 38,
    question: 'What can we do differently on the moon?',
    hint: 'The moon has less gravity than Earth'
  },
  {
    id: 'second_star',
    title: '✨ Second Sparkling Star!',
    text: 'Wonderful! ... You\'re doing such an excellent job! ... Another star appeared near the moon crater! ... Stars twinkle because they\'re happy to see brave explorers like us! ... (They\'re winking at you!) Two more stars to go! ... We\'re more than halfway there!',
    emoji: '✨',
    character: 'Cosmo',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: false,
    starsNeeded: 4,
    wordCount: 24,
    duration: 25
  },
  {
    id: 'black_hole',
    title: '🕳️ Mysterious Space Tunnel!',
    text: 'Look at that amazing black hole! ... It\'s spinning like a giant whirlpool! ... Cosmo says, "Stay far away, it\'s very powerful!" ... Can you say that? ... We need to stay safe in space!',
    emoji: '🕳️',
    character: 'Cosmo',
    bgColor: 'from-gray-200 to-blue-200 dark:from-gray-800 dark:to-blue-800',
    interactive: true,
    audioText: 'Stay far away it is very powerful',
    choices: ['Stay far away it is very powerful', 'Let us go inside now', 'It is not dangerous'],
    wordCount: 32,
    duration: 38,
    question: 'What does Cosmo warn us about the black hole?',
    hint: 'We need to be safe and careful'
  },
  {
    id: 'third_star',
    title: '🌟 Third Glowing Star!',
    text: 'Excellent! ... Amazing work! ... We found our third star near the space tunnel! ... It\'s shining extra bright to celebrate YOUR adventure! ... (You\'re such a smart space explorer!) Just one more star to find! ... We\'re almost done!',
    emoji: '🌟',
    character: 'Cosmo',
    bgColor: 'from-yellow-200 to-amber-200 dark:from-yellow-800 dark:to-amber-800',
    interactive: false,
    starsNeeded: 4,
    wordCount: 22,
    duration: 25
  },
  {
    id: 'constellation',
    title: '🔭 Beautiful Star Patterns!',
    text: 'Look at those star patterns! ... They make pictures in the sky! ... They say "We shine bright together!" ... Can you say that? ... Let\'s practice! Just like friends are better together, stars are too!',
    emoji: '🔭',
    character: 'Cosmo',
    bgColor: 'from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900',
    interactive: true,
    audioText: 'We shine bright together',
    choices: ['We shine bright together', 'We hide from each other', 'We are always alone'],
    wordCount: 28,
    duration: 36,
    question: 'What do the stars say about being together?',
    hint: 'They are happy to be close to each other'
  },
  {
    id: 'final_star',
    title: '💫 Fourth Magic Star!',
    text: 'Hooray! ... YES! YES! YES! ... We collected all four magic stars! ... (YOU did it!) They\'re creating a beautiful star bridge across the galaxy! ... You\'re an AMAZING space explorer! ... I\'m so proud of all your hard work and careful listening!',
    emoji: '💫',
    character: 'Cosmo',
    bgColor: 'from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800',
    interactive: false,
    starsNeeded: 4,
    wordCount: 21,
    duration: 25
  },
  {
    id: 'celebration',
    title: '🎉 Space Hero Celebration!',
    text: 'Congratulations, space hero! ... You helped Cosmo complete the mission! ... All the stars are shining brightly, and the WHOLE galaxy is celebrating YOUR amazing adventure! ... You listened so well and spoke so clearly! ... You\'re a SUPERSTAR! ... Give yourself the biggest space high-five! 🙌',
    emoji: '🎉',
    character: 'Cosmo',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 25,
    duration: 35
  }
];

const SpaceAdventure = ({ onClose, onComplete }: Props) => {
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

  // Auto-play story narration with character voice
  useEffect(() => {
    if (current.text && SpeechService.isTTSSupported()) {
      const playNarration = async () => {
        try {
          // Use character-specific voice (Cosmo or other space characters)
          await SpeechService.speakAsCharacter(current.text, current.character as any);
        } catch (error) {
          console.log('TTS not available');
        }
      };
      playNarration();
    }
  }, [current.text, current.character]);

  const handleNext = () => {
    if (stepIndex < storySteps.length - 1) {
      setStepIndex(stepIndex + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      // Calculate score based on correct answers and time
      const accuracyScore = correctAnswers * 15;
      const timeBonus = Math.max(0, 480 - timeSpent) * 0.1; // 8 minutes limit
      const starBonus = stars * 10;
      const score = Math.min(100, 40 + accuracyScore + timeBonus + starBonus);
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
      // Add star for every correct answer in interactive steps
      setStars(prev => Math.min(4, prev + 1));
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
    if (current.id.includes('star')) return 'animate-bounce';
    return 'animate-float';
  };

  const getSpaceIcon = () => {
    switch (current.id) {
      case 'rocket_launch': return Rocket;
      case 'planet_exploration': return Sparkles;
      case 'alien_meeting': return Sparkles;
      case 'moon_landing': return Moon;
      case 'black_hole': return Sparkles;
      case 'constellation': return Star;
      default: return Sparkles;
    }
  };

  const SpaceIcon = getSpaceIcon();

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-3 gap-2 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Cosmo's Space Adventure</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                ⭐ {stars}/4 Stars
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2 sm:h-2 mb-3 sm:mb-4 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-500" />
          </Progress>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden pb-2 sm:pb-2">
            <div className="text-center h-full flex flex-col justify-center">
              {/* Character and Scene */}
              <div className="relative mb-2 sm:mb-2 md:mb-3">
                <div className={cn(
                  "text-5xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 sm:mb-2", 
                  getCharacterAnimation()
                )}>
                  <span className={cn(
                    current.id === 'celebration' && 'animate-celebration-party'
                  )}>
                    {current.emoji}
                  </span>
                </div>
                
                {/* Star Collection Display - Show in all steps like other stories */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-2">
                  {Array.from({ length: 4 }).map((_, i) => (
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

                {/* Space Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <SpaceIcon className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-400 opacity-70" />
                </div>
              </div>

              {/* Story Text */}
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-3 md:p-4 mb-3 sm:mb-3 backdrop-blur-sm border-2 border-white/20 sm:border-2 shadow-lg sm:shadow-2xl max-w-4xl mx-auto">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1.5 sm:mb-2 text-gray-800 dark:text-white flex items-center justify-center gap-2 sm:gap-2">
                  {current.title}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={playStoryText}
                    className="text-blue-500 hover:text-blue-600 h-7 w-7 sm:h-8 sm:w-8 p-0"
                  >
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </h3>
                <p className="text-sm sm:text-sm md:text-base lg:text-lg text-gray-700 dark:text-gray-200 leading-relaxed sm:leading-relaxed mx-auto max-w-3xl">
                  {current.text}
                </p>
                
                {/* Word Count and Duration */}
                <div className="flex justify-center gap-2 sm:gap-2 mt-2 sm:mt-2 text-xs sm:text-xs text-gray-500 dark:text-gray-400">
                  <span>📝 {current.wordCount} words</span>
                  <span>⏱️ {current.duration}s</span>
                </div>
              </div>

              {/* Interactive Elements */}
              {current.interactive && (
                <div className="space-y-2 sm:space-y-2 md:space-y-3 max-w-4xl mx-auto w-full">
                  {/* Question and Hint */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-lg md:rounded-xl p-2.5 sm:p-2 md:p-3 border border-blue-200 dark:border-blue-700">
                    <h4 className="text-sm sm:text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1.5 sm:mb-1">
                      {current.question}
                    </h4>
                    {showHint ? (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        💡 Space Hint: {current.hint}
                      </p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-100 text-xs sm:text-sm"
                      >
                        Need a space hint? 🚀
                      </Button>
                    )}
                  </div>

                  {/* Audio Play Button */}
                  {current.audioText && (
                    <div className="flex justify-center mb-2 sm:mb-2">
                      <Button 
                        onClick={playAudio}
                        disabled={isPlaying}
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
                            <span className="hidden sm:inline">Listen to the Space Word</span>
                            <span className="sm:hidden">🔊 Listen</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Choice Buttons */}
                  {current.choices && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-2 md:gap-3 justify-center">
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
                              "rounded-lg sm:rounded-lg md:rounded-xl px-3 sm:px-3 md:px-4 py-2.5 sm:py-2 md:py-2.5 text-xs sm:text-xs md:text-sm font-bold transition-all duration-300 transform hover:scale-105 h-auto min-h-[55px] sm:min-h-[50px] md:min-h-[55px]",
                              showResult && isCorrect && "bg-green-500 hover:bg-green-600 text-white animate-bounce shadow-lg sm:shadow-2xl",
                              showResult && !isCorrect && "bg-red-500 hover:bg-red-600 text-white shadow-md sm:shadow-xl",
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
                            )}
                          >
                            <span className="flex flex-col items-center gap-1 sm:gap-1">
                              <span className="text-lg sm:text-lg md:text-xl mb-0">
                                {choice === 'rocket' && '🚀'}
                                {choice === 'planet' && '🪐'}
                                {choice === 'alien' && '👽'}
                                {choice === 'moon' && '🌙'}
                                {choice === 'black hole' && '🕳️'}
                                {choice === 'stars' && '⭐'}
                                {choice === 'star' && '⭐'}
                                {choice === 'comet' && '☄️'}
                                {choice === 'robot' && '🤖'}
                                {choice === 'astronaut' && '👨‍🚀'}
                                {choice === 'earth' && '🌍'}
                                {choice === 'sun' && '☀️'}
                                {choice === 'clouds' && '☁️'}
                                {choice === 'planets' && '🪐'}
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
                        <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm md:text-base font-bold animate-bounce bg-green-50 dark:bg-green-900/20 rounded-lg sm:rounded-lg md:rounded-xl p-2.5 sm:p-2 md:p-3 border border-green-200 dark:border-green-700">
                          🎉 COSMIC! You listened so carefully and spoke perfectly! You earned a star! 🌟 You're a brilliant space explorer!
                        </div>
                      ) : (
                        <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm md:text-base font-bold bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-lg md:rounded-xl p-2.5 sm:p-2 md:p-3 border border-red-200 dark:border-red-700">
                          💪 GREAT effort! You're trying so hard and that's wonderful! The space word was "{current.audioText}" - Let's explore it together! You're doing SUPER!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Non-interactive steps */}
              {!current.interactive && (
                <div className="flex justify-center pt-2 sm:pt-2">
                  <Button 
                    onClick={handleNext} 
                    className="rounded-lg sm:rounded-xl md:rounded-2xl px-5 sm:px-5 md:px-6 py-2.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-xs sm:text-xs md:text-sm"
                  >
                    {stepIndex === storySteps.length - 1 ? (
                      <>
                        <Zap className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2 animate-pulse" />
                        <span className="hidden sm:inline">Complete Space Mission! ✨</span>
                        <span className="sm:hidden">Finish! ✨</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-2" />
                        <span className="hidden sm:inline">Continue Space Adventure! 🚀</span>
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
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 left-4 animate-float-medium">
            <Sparkles className="w-6 h-6 text-green-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 right-4 animate-float-fast">
            <Moon className="w-6 h-6 text-gray-400" />
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
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }
        
        .smooth-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
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

export default SpaceAdventure;