import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, ChevronRight, ChevronLeft, Star, Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import { WhisperService } from '@/services/WhisperService';
import { AdvancedPronunciationScorer } from '@/services/AdvancedPronunciationScorer';
import VoiceRecorder from './VoiceRecorder';
import HybridServiceManager from '@/services/HybridServiceManager';

type WordCard = { word: string; hint?: string };

export default function Vocabulary({ words }: { words: WordCard[] }) {
  const [current, setCurrent] = useState(0);
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set());
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const card = words[current];
  const progress = (masteredWords.size / words.length) * 100;

  useEffect(() => {
    // Load mastered words from local storage
    const saved = localStorage.getItem('mastered_vocabulary');
    if (saved) {
      setMasteredWords(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    // Save mastered words
    localStorage.setItem('mastered_vocabulary', JSON.stringify(Array.from(masteredWords)));
  }, [masteredWords]);

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

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    setShowSuccess(false);
    
    try {
      // Transcribe with Whisper
      let transcript = '';
      try {
        const result = await WhisperService.transcribe(blob);
        transcript = result.transcript;
      } catch (error) {
        console.warn('Whisper failed:', error);
        transcript = '';
      }

      // Score pronunciation
      const score = await AdvancedPronunciationScorer.scoreDetailed(
        card.word,
        transcript,
        blob
      );

      setLastScore(score.overall);
      setCurrentAttempts(prev => prev + 1);

      // Check if word is mastered (score >= 80)
      if (score.overall >= 80) {
        setMasteredWords(prev => new Set([...prev, current]));
        setShowSuccess(true);
        
        // Save vocabulary word
        await HybridServiceManager.saveVocabularyWord({
          word: card.word,
          definition: card.hint,
          mastered: true
        });

        // Celebrate!
        await EnhancedTTS.speak('Excellent! You mastered this word!', { 
          rate: 0.9, 
          emotion: 'happy' 
        });

        // Auto-advance after celebration
        setTimeout(() => {
          next();
        }, 2000);
      } else if (score.overall >= 60) {
        await EnhancedTTS.speak('Good try! Practice a bit more.', { rate: 0.9 });
      } else {
        await EnhancedTTS.speak('Keep trying! Listen to the word again.', { rate: 0.9 });
      }
    } catch (error) {
      console.error('Error processing vocabulary:', error);
    } finally {
      setIsProcessing(false);
    }
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
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="border-2 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-purple-500" />
              <div>
                <p className="font-bold text-gray-800 dark:text-white">
                  Vocabulary Progress
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {masteredWords.size} / {words.length} words mastered
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-800">
              {Math.round(progress)}%
            </div>
          </div>
          <div className="h-3 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Word Card */}
      <Card className={cn(
        "border-2 transition-all duration-300",
        masteredWords.has(current) 
          ? "border-green-200 bg-green-50 dark:bg-green-900/20" 
          : "border-blue-200"
      )}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-500">
              Word {current + 1} of {words.length}
            </span>
            {masteredWords.has(current) && (
              <span className="flex items-center gap-2 text-green-600">
                <Star className="w-5 h-5 fill-green-600" />
                Mastered!
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Word Display */}
          <div className="text-center space-y-4">
            <div className={cn(
              "text-6xl font-extrabold transition-all duration-300",
              showSuccess && "animate-bounce"
            )}>
              {showSuccess && '🎉 '}
              {card.word}
              {showSuccess && ' 🎉'}
            </div>
            
            {card.hint && (
              <div className="text-lg text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3">
                {card.hint}
              </div>
            )}

            {/* Listen Button */}
            <Button
              size="lg"
              onClick={speak}
              className="rounded-2xl px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500"
            >
              <Volume2 className="w-5 h-5 mr-2" />
              Listen to Word
            </Button>
          </div>

          {/* Voice Recorder */}
          {!isProcessing && (
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-center text-lg text-gray-600 dark:text-gray-300 mb-4">
                🎤 Now you say it!
              </p>
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={10}
                showPlayback={true}
              />
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="text-center space-y-4 py-6">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Checking your pronunciation...
              </p>
            </div>
          )}

          {/* Last Score */}
          {lastScore !== null && !isProcessing && (
            <div className={cn(
              "text-center p-6 rounded-2xl border-2",
              lastScore >= 80 && "bg-green-50 border-green-200 dark:bg-green-900/20",
              lastScore >= 60 && lastScore < 80 && "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20",
              lastScore < 60 && "bg-red-50 border-red-200 dark:bg-red-900/20"
            )}>
              <div className="text-4xl mb-2">{getScoreEmoji(lastScore)}</div>
              <div className={cn("text-3xl font-bold", getScoreColor(lastScore))}>
                {Math.round(lastScore)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Attempt {currentAttempts}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={prev}
              className="rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {words.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    idx === current && "scale-150",
                    masteredWords.has(idx) 
                      ? "bg-green-500" 
                      : idx === current 
                        ? "bg-blue-500" 
                        : "bg-gray-300"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={next}
              className="rounded-xl"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {showSuccess && (
        <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="py-6 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              Amazing! Word Mastered!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You can now use this word confidently!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


