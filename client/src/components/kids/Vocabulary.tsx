import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, ChevronRight, ChevronLeft, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import KidsVoiceRecorder from './KidsVoiceRecorder';
import HybridServiceManager from '@/services/HybridServiceManager';

type WordCard = { word: string; hint?: string };

interface VocabularyProps {
  words: WordCard[];
  onWordPracticed?: (word: string) => void;
}

export default function Vocabulary({ words, onWordPracticed }: VocabularyProps) {
  const [current, setCurrent] = useState(0);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const card = words[current];
  
  // Calculate progress based on filtered words - only count mastered words that are in current word list
  const masteredCount = words.filter(word => masteredWords.has(word.word)).length;
  const progress = words.length > 0 ? (masteredCount / words.length) * 100 : 0;

  useEffect(() => {
    // Load mastered words from local storage (stored as word strings)
    const saved = localStorage.getItem('mastered_vocabulary');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle both old format (indices) and new format (word strings)
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'number') {
            // Old format: convert indices to word strings based on original word list
            // This won't work perfectly with filtering, but is best effort migration
            const oldWords = localStorage.getItem('vocabulary_words_list');
            if (oldWords) {
              const wordList = JSON.parse(oldWords);
              const wordStrings = parsed.map((idx: number) => wordList[idx]).filter(Boolean);
              setMasteredWords(new Set(wordStrings));
            } else {
              setMasteredWords(new Set());
            }
          } else {
            // New format: word strings
            setMasteredWords(new Set(parsed));
          }
        } else {
          setMasteredWords(new Set());
        }
      } catch (error) {
        console.warn('Error loading mastered vocabulary:', error);
        setMasteredWords(new Set());
      }
    }
  }, []);

  useEffect(() => {
    // Save mastered words as word strings
    localStorage.setItem('mastered_vocabulary', JSON.stringify(Array.from(masteredWords)));
  }, [masteredWords]);
  
  // Reset current word index if it's out of bounds when words change
  useEffect(() => {
    if (current >= words.length && words.length > 0) {
      setCurrent(0);
    }
  }, [words, current]);

  const speak = async () => {
    try {
      await EnhancedTTS.speak(card.word, { rate: 0.85, pitch: 1.0 });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Provide context - only speak the word, not the phonetic hint
      const example = `The word is: ${card.word}`;
      await EnhancedTTS.speak(example, { rate: 0.9 });
    } catch (error) {
      console.error('Error speaking word:', error);
    }
  };

  const handleCorrectPronunciation = async (_blob: Blob, score: number) => {
    // Mark as mastered immediately (by word string, not index)
    setLastScore(score);
    setCurrentAttempts(prev => prev + 1);
    setMasteredWords(prev => new Set([...prev, card.word]));
    setShowSuccess(true);
    
    // Notify parent component
    if (onWordPracticed) {
      onWordPracticed(card.word);
    }
    
    // Save vocabulary word
    try {
      await HybridServiceManager.saveVocabularyWord({
        word: card.word,
        definition: card.hint,
        mastered: true
      });
    } catch (error) {
      console.warn('Error saving vocabulary word:', error);
    }

    // Celebrate!
    try {
      await EnhancedTTS.speak('Excellent! You mastered this word!', { 
        rate: 0.9, 
        emotion: 'happy' 
      });
    } catch (error) {
      console.warn('TTS celebration failed:', error);
    }

    // Auto-advance to next word after celebration (fresh start)
    setTimeout(() => {
      next();
    }, 2000);
  };

  const next = () => {
    setCurrent((c) => (c + 1) % words.length);
    setCurrentAttempts(0);
    setLastScore(null);
    setShowSuccess(false);
  };

  const prev = () => {
    setCurrent((c) => (c - 1 + words.length) % words.length);
    setCurrentAttempts(0);
    setLastScore(null);
    setShowSuccess(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '😊';
    return '🤔';
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl lg:max-w-7xl xl:max-w-[1400px] mx-auto">
      {/* Progress Overview */}
      <Card className="border-2 border-yellow-300/50 bg-yellow-50/40 dark:bg-yellow-900/10 backdrop-blur-sm shadow-lg">
        <CardContent className="py-3 sm:py-4 px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">
                  Vocabulary Progress
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {masteredCount} / {words.length} words mastered
                </p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-700 dark:text-yellow-400">
              {Math.round(progress)}%
            </div>
          </div>
          <div className="h-2 sm:h-3 bg-yellow-200/60 dark:bg-yellow-800/40 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Word Card */}
          <Card 
        key={`word-card-${current}`}
        className={cn(
          "border-2 transition-all duration-300 animate-in fade-in slide-in-from-right-4 backdrop-blur-sm shadow-lg",
          masteredWords.has(card.word) 
            ? "border-green-300/50 bg-green-100/20 dark:bg-green-900/5" 
            : "border-blue-300/50 bg-blue-50/40 dark:bg-blue-900/10"
        )}
      >
        <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-500">
              Word {current + 1} of {words.length}
            </span>
                         {masteredWords.has(card.word) && (
               <span className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-green-900 dark:text-green-900 font-bold">
                 <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-green-700 dark:fill-green-500 flex-shrink-0" />
                 Mastered!
               </span>
             )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
          {/* Word Display */}
          <div className="text-center space-y-3 sm:space-y-4">
                         <div className={cn(
               "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold transition-all duration-500",
               showSuccess && "animate-bounce scale-110",
               masteredWords.has(card.word) && "text-green-700 dark:text-green-500"
             )}>

               {card.word}
               {showSuccess && ' 🎉'}
               {masteredWords.has(card.word) && !showSuccess && ' ✨'}
             </div>
            
            {card.hint && (
              <div className="text-sm sm:text-base md:text-lg text-pink-600 dark:text-pink-400 bg-pink-50/60 dark:bg-pink-900/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 max-w-md mx-auto border border-pink-300/50">
                {card.hint}
              </div>
            )}

            {/* Listen Button */}
            <Button
              size="lg"
              onClick={speak}
              className="rounded-xl sm:rounded-2xl px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-sm sm:text-base md:text-lg font-bold transition-all hover:scale-105 w-full sm:w-auto"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              Listen to Word
            </Button>
          </div>

          {/* Smart Voice Recorder - Auto-stops when correct */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
            <p className="text-center text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 font-semibold">
              🎤 Now you say it!
            </p>
            <KidsVoiceRecorder
              key={`recorder-${current}-${card.word}`}
              targetWord={card.word}
              onCorrectPronunciation={handleCorrectPronunciation}
              maxDuration={10}
              autoAnalyze={true}
            />
            <p className="text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 mt-3 px-4">
              💡 Tip: The recorder will automatically stop when you pronounce it correctly!
            </p>
          </div>

          {/* Last Score */}
          {lastScore !== null && (
            <div className={cn(
              "text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 backdrop-blur-sm shadow-lg",
              lastScore >= 80 && "bg-green-50/60 border-green-300/50 dark:bg-green-900/10",
              lastScore >= 60 && lastScore < 80 && "bg-yellow-50/60 border-yellow-300/50 dark:bg-yellow-900/10",
              lastScore < 60 && "bg-red-50/60 border-red-300/50 dark:bg-red-900/10"
            )}>
              <div className="text-3xl sm:text-4xl md:text-5xl mb-2">{getScoreEmoji(lastScore)}</div>
              <div className={cn("text-2xl sm:text-3xl md:text-4xl font-bold", getScoreColor(lastScore))}>
                {Math.round(lastScore)}%
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
                Attempt {currentAttempts}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 pt-4 sm:pt-6">
            <Button
              variant="outline"
              onClick={prev}
              className="rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:mr-1 md:mr-2 flex-shrink-0" />
              <span className="hidden md:inline">Previous</span>
            </Button>

            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
              {words.map((word, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300",
                    idx === current && "scale-125 sm:scale-150",
                    masteredWords.has(word.word) 
                      ? "bg-green-500" 
                      : idx === current 
                        ? "bg-blue-500" 
                        : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={next}
              className="rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="w-4 h-4 sm:ml-1 md:ml-2 flex-shrink-0" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {showSuccess && (
        <Card className="border-2 border-green-300/50 bg-green-50/40 dark:bg-green-900/10 backdrop-blur-sm shadow-lg">
          <CardContent className="py-4 sm:py-6 text-center px-3 sm:px-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              Amazing! Word Mastered!
            </h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              You can now use this word confidently!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


