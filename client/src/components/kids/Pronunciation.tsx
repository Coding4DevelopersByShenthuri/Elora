import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, ChevronRight, ChevronLeft, Mic, Loader2, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import KidsVoiceRecorder from './KidsVoiceRecorder';
import HybridServiceManager from '@/services/HybridServiceManager';

type PronounceItem = { phrase: string; phonemes?: string };

interface PronunciationProps {
  items: PronounceItem[];
  onPhrasePracticed?: (phrase: string) => void;
}

export default function Pronunciation({ items, onPhrasePracticed }: PronunciationProps) {
  const [current, setCurrent] = useState(0);
  const [masteredPhrases, setMasteredPhrases] = useState<Set<number>>(new Set());
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const phrase = items[current];
  const progress = (masteredPhrases.size / items.length) * 100;

  useEffect(() => {
    // Load mastered phrases from local storage
    const saved = localStorage.getItem('mastered_phrases');
    if (saved) {
      setMasteredPhrases(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    // Save mastered phrases
    localStorage.setItem('mastered_phrases', JSON.stringify(Array.from(masteredPhrases)));
  }, [masteredPhrases]);

  const speak = async () => {
    setIsSpeaking(true);
    try {
      await EnhancedTTS.speak(phrase.phrase, { rate: 0.85, pitch: 1.0 });
      
      // Give context about phonemes if available
      if (phrase.phonemes) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await EnhancedTTS.speak(
          "Pay attention to how each sound is pronounced.",
          { rate: 0.9 }
        );
      }
    } catch (error) {
      console.error('Error speaking phrase:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleCorrectPronunciation = async (_blob: Blob, score: number) => {
    // Mark as mastered immediately
    setLastScore(score);
    setCurrentAttempts(prev => prev + 1);
    setMasteredPhrases(prev => new Set([...prev, current]));
    setShowSuccess(true);
    
    // Notify parent component
    if (onPhrasePracticed) {
      onPhrasePracticed(phrase.phrase);
    }
    
    // Save pronunciation phrase as vocabulary word
    try {
      await HybridServiceManager.saveVocabularyWord({
        word: phrase.phrase,
        definition: phrase.phonemes,
        mastered: true
      });
    } catch (error) {
      console.warn('Error saving pronunciation phrase:', error);
    }

    // Celebrate!
    try {
      await EnhancedTTS.speak('Excellent! You mastered this phrase!', { 
        rate: 0.9, 
        emotion: 'happy' 
      });
    } catch (error) {
      console.warn('TTS celebration failed:', error);
    }

    // Auto-advance to next phrase after celebration (fresh start)
    setTimeout(() => {
      next();
    }, 2000);
  };

  const next = () => {
    setCurrent((c) => (c + 1) % items.length);
    setCurrentAttempts(0);
    setLastScore(null);
    setShowSuccess(false);
  };

  const prev = () => {
    setCurrent((c) => (c - 1 + items.length) % items.length);
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
      <Card className="border-2 border-orange-300/50 bg-orange-50/40 dark:bg-orange-900/10 backdrop-blur-sm shadow-lg">
        <CardContent className="py-3 sm:py-4 px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">
                  Pronunciation Progress
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {masteredPhrases.size} / {items.length} phrases mastered
                </p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-700 dark:text-orange-400">
              {Math.round(progress)}%
            </div>
          </div>
          <div className="h-2 sm:h-3 bg-orange-200/60 dark:bg-orange-800/40 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Phrase Card */}
      <Card 
        key={`phrase-card-${current}`}
        className={cn(
          "border-2 transition-all duration-300 animate-in fade-in slide-in-from-right-4 backdrop-blur-sm shadow-lg",
          masteredPhrases.has(current) 
            ? "border-green-300/50 bg-green-100/20 dark:bg-green-900/5" 
            : "border-orange-300/50 bg-orange-50/40 dark:bg-orange-900/10"
        )}
      >
        <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-500">
              Phrase {current + 1} of {items.length}
            </span>
            {masteredPhrases.has(current) && (
              <span className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-green-900 dark:text-green-900 font-bold">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-green-700 dark:fill-green-500 flex-shrink-0" />
                Mastered!
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
          {/* Phrase Display */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className={cn(
              "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold transition-all duration-500",
              showSuccess && "animate-bounce scale-110",
              masteredPhrases.has(current) && "text-green-700 dark:text-green-500",
              "text-gray-800 dark:text-white bg-gradient-to-br from-orange-100/40 to-red-100/40 dark:from-orange-900/15 dark:to-red-900/15 rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-orange-200/30 dark:border-orange-700/30"
            )}>
              {phrase.phrase}
              {showSuccess && ' 🎉'}
              {masteredPhrases.has(current) && !showSuccess && ' ✨'}
            </div>
            
            {phrase.phonemes && (
              <div className="text-sm sm:text-base md:text-lg lg:text-xl text-pink-600 dark:text-pink-400 bg-pink-100/30 dark:bg-pink-900/15 rounded-lg sm:rounded-xl p-3 sm:p-4 max-w-2xl mx-auto backdrop-blur-sm border border-pink-200/30 dark:border-pink-700/30">
                {phrase.phonemes}
              </div>
            )}

            {/* Listen Button */}
            <Button
              size="lg"
              onClick={speak}
              disabled={isSpeaking}
              className="rounded-xl sm:rounded-2xl px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-sm sm:text-base md:text-lg font-bold transition-all hover:scale-105 w-full sm:w-auto"
            >
              {isSpeaking ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin flex-shrink-0" />
                  Speaking...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  Listen to Teacher
                </>
              )}
            </Button>
          </div>

          {/* Smart Voice Recorder - Auto-stops when correct */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
            <p className="text-center text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 font-semibold">
              🎤 Now you say it!
            </p>
            <KidsVoiceRecorder
              key={`recorder-${current}-${phrase.phrase}`}
              targetWord={phrase.phrase}
              onCorrectPronunciation={handleCorrectPronunciation}
              maxDuration={15}
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
              {items.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300",
                    idx === current && "scale-125 sm:scale-150",
                    masteredPhrases.has(idx) 
                      ? "bg-green-500" 
                      : idx === current 
                        ? "bg-orange-500" 
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
              Amazing! Phrase Mastered! 🎉
            </h3>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              You can now use this phrase confidently!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


