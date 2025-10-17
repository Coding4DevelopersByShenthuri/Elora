import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Zap, Volume2, Play, Heart, X, Mountain, Cloud, Sun, Footprints } from 'lucide-react';
import SpeechService from '@/services/SpeechService';
import { cn } from '@/lib/utils';

type Props = {
  onClose: () => void;
  onComplete: (score: number) => void;
};

const storySteps = [
  {
    id: 'intro',
    title: '🦕 Dino World Adventure!',
    text: 'Hello, paleontologist! ... I am Dina the dinosaur explorer! ... Our time machine is ready to take us back to the age of dinosaurs! ... Can you hear the ground shaking? Have you ever seen dinosaur bones in a museum? We are going back in time!',
    emoji: '👩‍🔬',
    character: 'Dina',
    bgColor: 'from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900',
    interactive: false,
    wordCount: 25,
    duration: 30
  },
  {
    id: 't_rex',
    title: '🦖 T-Rex Encounter!',
    text: 'WOW! Look at that HUGE T-Rex! ... The T-Rex roars "I am the king of dinosaurs!" ... Can you roar that out loud? ... Let us roar together! T-Rex was the strongest dinosaur!',
    emoji: '🦖',
    character: 'Dina',
    bgColor: 'from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900',
    interactive: true,
    audioText: 'I am the king of dinosaurs',
    choices: ['I am the king of dinosaurs', 'I am very small and weak', 'I am scared of everything'],
    wordCount: 28,
    duration: 36,
    question: 'What does the T-Rex say about itself?',
    hint: 'The T-Rex is very strong and powerful'
  },
  {
    id: 'first_fossil',
    title: '💎 First Dino Fossil!',
    text: 'Fantastic! ... WOW! ... We found our first dinosaur fossil! ... You are being such an amazing paleontologist! ... Fossils help us learn about ancient creatures—just like puzzle pieces from long ago! ... Two more fossils to discover! ... What dinosaur do you think we will find next?',
    emoji: '💎',
    character: 'Dina',
    bgColor: 'from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900',
    interactive: false,
    fossilsNeeded: 3,
    wordCount: 20,
    duration: 25
  },
  {
    id: 'herbivore_herd',
    title: '🦕 Gentle Giants',
    text: 'Look how tall this dinosaur is! ... The Brachiosaurus says "I can reach the highest leaves!" ... Can you say that while stretching up really tall? ... Let us stretch high! This dinosaur was as tall as a building!',
    emoji: '🦕',
    character: 'Dina',
    bgColor: 'from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    interactive: true,
    audioText: 'I can reach the highest leaves',
    choices: ['I can reach the highest leaves', 'I cannot reach anything', 'I eat rocks not leaves'],
    wordCount: 30,
    duration: 38,
    question: 'What special thing can the Brachiosaurus do?',
    hint: 'Its long neck helps it reach very high'
  },
  {
    id: 'triceratops',
    title: '🦏 Three-Horned Friend!',
    text: 'Here comes a Triceratops with three horns! ... The Triceratops says "My horns keep me safe!" ... Can you say that? ... Let us be strong together! Those horns are like a knight\'s shield!',
    emoji: '🦏',
    character: 'Dina',
    bgColor: 'from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900',
    interactive: true,
    audioText: 'My horns keep me safe',
    choices: ['My horns keep me safe', 'I have no protection', 'I am always in danger'],
    wordCount: 28,
    duration: 36,
    question: 'How does the Triceratops protect itself?',
    hint: 'It uses the horns on its head'
  },
  {
    id: 'second_fossil',
    title: '✨ Second Ancient Fossil!',
    text: 'Incredible! ... You are such a great dinosaur detective! ... Another fossil appeared near the volcano! ... These bones tell stories from millions of years ago—before you, me, or even your grandparents were born! ... One last fossil to find! ... We are almost done!',
    emoji: '✨',
    character: 'Dina',
    bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    interactive: false,
    fossilsNeeded: 3,
    wordCount: 21,
    duration: 25
  },
  {
    id: 'stegosaurus',
    title: '🦎 Spiky Stegosaurus!',
    text: 'Look at those amazing plates on its back! ... The Stegosaurus says "My plates are special and unique!" ... Can you say that? ... Let us be proud! Everyone is unique and special, just like you!',
    emoji: '🦎',
    character: 'Dina',
    bgColor: 'from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900',
    interactive: true,
    audioText: 'My plates are special and unique',
    choices: ['My plates are special and unique', 'I look like everyone else', 'I have nothing special'],
    wordCount: 28,
    duration: 36,
    question: 'What makes the Stegosaurus unique?',
    hint: 'The plates on its back make it special'
  },
  {
    id: 'velociraptor',
    title: '🐆 Speedy Raptor!',
    text: 'Here come some fast Velociraptors! ... The Velociraptors say "We work together as a team!" ... Can you say that? ... Let us be a team! Working together makes us stronger!',
    emoji: '🐆',
    character: 'Dina',
    bgColor: 'from-gray-100 to-slate-100 dark:from-gray-900 dark:to-slate-900',
    interactive: true,
    audioText: 'We work together as a team',
    choices: ['We work together as a team', 'We always work alone', 'We never help each other'],
    wordCount: 28,
    duration: 36,
    question: 'What do the Velociraptors do together?',
    hint: 'They help and cooperate with each other'
  },
  {
    id: 'third_fossil',
    title: '🌟 Third Magic Fossil!',
    text: 'We did it! ... YES! ... All three fossils are glowing brightly! ... (They are shining because YOU found them!) They will help scientists learn about dinosaur history forever. ... You are an AMAZING paleontologist! ... I am so proud of how much you have learned!',
    emoji: '🌟',
    character: 'Dina',
    bgColor: 'from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800',
    interactive: false,
    fossilsNeeded: 3,
    wordCount: 23,
    duration: 30
  },
  {
    id: 'flying_dino',
    title: '🦅 Flying Reptile!',
    text: 'Look up in the sky! ... The Pterodactyl calls "I fly high in the sky!" ... Can you say that? ... Let us fly! Pterodactyls were like the birds of dinosaur times!',
    emoji: '🦅',
    character: 'Dina',
    bgColor: 'from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800',
    interactive: true,
    audioText: 'I fly high in the sky',
    choices: ['I fly high in the sky', 'I stay on the ground', 'I cannot fly at all'],
    wordCount: 28,
    duration: 36,
    question: 'Where does the Pterodactyl travel?',
    hint: 'It moves through the air above us'
  },
  {
    id: 'volcano',
    title: '🌋 Ancient Volcano!',
    text: 'Oh my! We see the volcano smoking! ... Let us say "We need to stay far away!" ... Can you say that? ... Let us be careful! Volcanoes are hot and powerful!',
    emoji: '🌋',
    character: 'Dina',
    bgColor: 'from-red-200 to-orange-200 dark:from-red-800 dark:to-orange-800',
    interactive: true,
    audioText: 'We need to stay far away',
    choices: ['We need to stay far away', 'Let us go very close', 'It is not dangerous'],
    wordCount: 30,
    duration: 38,
    question: 'What should we do near the volcano?',
    hint: 'We should keep a safe distance'
  },
  {
    id: 'final_celebration',
    title: '🎉 Dino Discovery Celebration!',
    text: 'Congratulations, dinosaur expert! ... You helped Dina complete the prehistoric mission! ... All the dinosaurs are celebrating YOU, and we have learned so much about ancient times! ... You listened so carefully and spoke with such wonderful voices! ... You are a SUPERSTAR paleontologist! ... Give yourself a ROAR of celebration! 🦖',
    emoji: '🎉',
    character: 'Dina',
    bgColor: 'from-rainbow-100 to-sparkle-100 dark:from-rainbow-900 dark:to-sparkle-900',
    interactive: false,
    wordCount: 24,
    duration: 35
  }
];

const DinosaurAdventure = ({ onClose, onComplete }: Props) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [fossils, setFossils] = useState(0);
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
      const accuracyScore = correctAnswers * 20;
      const timeBonus = Math.max(0, 300 - timeSpent) * 0.1;
      const fossilBonus = fossils * 10;
      const score = Math.min(100, 40 + accuracyScore + timeBonus + fossilBonus);
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
      setFossils(prev => Math.min(3, prev + 1));
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
        await SpeechService.speakAsCharacter(current.audioText, current.character as any);
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
        await SpeechService.speakAsCharacter(current.text, current.character as any);
      } catch (error) {
        console.log('TTS not available');
      }
      setIsPlaying(false);
    }
  };

  const getCharacterAnimation = () => {
    if (current.id.includes('fossil')) return 'animate-bounce';
    return 'animate-float';
  };

  const getDinoIcon = () => {
    switch (current.id) {
      case 't_rex': return Footprints;
      case 'herbivore_herd': return Mountain;
      case 'triceratops': return Sun;
      case 'stegosaurus': return Sparkles;
      case 'velociraptor': return Footprints;
      case 'flying_dino': return Cloud;
      case 'volcano': return Sparkles;
      default: return Sparkles;
    }
  };

  const DinoIcon = getDinoIcon();

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
                <Footprints className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 animate-bounce" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Dina's Dino Adventure</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Step {stepIndex + 1} of {totalSteps} • {totalWords} words • {Math.round(totalDuration/60)}min
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full border border-white/20">
                💎 {fossils}/3 Fossils
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="h-2 mb-3 sm:mb-4 bg-white/30 flex-shrink-0">
            <div className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-500" />
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
                    current.id === 'final_celebration' && 'animate-celebration-party'
                  )}>
                    {current.emoji}
                  </span>
                </div>
                
                {/* Fossil Collection Display - Show in all steps like other stories */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-all duration-500 transform hover:scale-125 flex items-center justify-center",
                        i < fossils 
                          ? 'text-amber-600 animate-pulse drop-shadow-lg' 
                          : 'text-gray-300 opacity-50'
                      )} 
                    >
                      💎
                    </div>
                  ))}
                </div>

                {/* Dino Icon */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 animate-float-slow">
                  <DinoIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-500 opacity-70" />
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
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 border border-orange-200 dark:border-orange-700">
                    <h4 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 dark:text-white mb-1">
                      {current.question}
                    </h4>
                    {showHint ? (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        💡 Dino Hint: {current.hint}
                      </p>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-orange-600 border-orange-300 hover:bg-orange-100 text-xs sm:text-sm"
                      >
                        Need a dino hint? 🦖
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
                          "rounded-lg sm:rounded-xl md:rounded-2xl px-3 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold transition-all duration-300 transform hover:scale-105 text-[10px] sm:text-xs md:text-sm",
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
                            <span className="hidden sm:inline">Listen to the Dino Word</span>
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
                              !showResult && "bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg"
                            )}
                          >
                            <span className="flex flex-col items-center gap-0.5 sm:gap-1">
                              <span className="text-base sm:text-lg md:text-xl mb-0.5">
                                {choice === 'T-Rex' && '🦖'}
                                {choice === 'Brachiosaurus' && '🦕'}
                                {choice === 'Triceratops' && '🦏'}
                                {choice === 'Stegosaurus' && '🦎'}
                                {choice === 'Velociraptor' && '🐆'}
                                {choice === 'Pterodactyl' && '🦅'}
                                {choice === 'volcano' && '🌋'}
                                {choice === 'Ankylosaurus' && '🛡️'}
                                {choice === 'Dragon' && '🐉'}
                                {choice === 'Eagle' && '🦅'}
                                {choice === 'mountain' && '⛰️'}
                                {choice === 'waterfall' && '🌊'}
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
                    <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm md:text-base font-bold bg-red-50 dark:bg-red-900/20 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2 md:p-3 border border-red-200 dark:border-red-700">
                      💪 GREAT effort! You are trying so hard and that is wonderful! The dino word was "{current.audioText}" - Let us explore it together! You are doing SUPER!
                    </div>
                  )}
                </div>
              )}

              {/* Non-interactive steps */}
              {!current.interactive && (
                <div className="flex justify-center pt-1.5 sm:pt-2">
                  <Button 
                    onClick={handleNext} 
                    className="rounded-lg sm:rounded-xl md:rounded-2xl px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold transition-all duration-300 hover:scale-105 transform shadow-lg sm:shadow-2xl text-[10px] sm:text-xs md:text-sm"
                  >
                    {stepIndex === storySteps.length - 1 ? (
                      <>
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-pulse" />
                        <span className="hidden sm:inline">Complete Dino Mission! ✨</span>
                        <span className="sm:hidden">Finish! ✨</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Continue Dino Adventure! 🦕</span>
                        <span className="sm:hidden">Continue 🦕</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Floating Elements */}
          <div className="hidden sm:block absolute top-4 left-4 animate-float-slow">
            <Footprints className="w-6 h-6 text-orange-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 left-4 animate-float-medium">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="hidden sm:block absolute bottom-4 right-4 animate-float-fast">
            <Mountain className="w-6 h-6 text-gray-400" />
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
          background: rgba(249, 115, 22, 0.3);
          border-radius: 10px;
        }
        
        .smooth-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.5);
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

export default DinosaurAdventure;