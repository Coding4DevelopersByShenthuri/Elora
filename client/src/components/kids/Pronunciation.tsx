import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, ChevronRight, ChevronLeft, Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import { WhisperService } from '@/services/WhisperService';
import { AdvancedPronunciationScorer } from '@/services/AdvancedPronunciationScorer';
import VoiceRecorder from './VoiceRecorder';
import PronunciationFeedbackDisplay from './PronunciationFeedbackDisplay';

type PronounceItem = { phrase: string; phonemes?: string };

export default function Pronunciation({ items }: { items: PronounceItem[] }) {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<'intro' | 'record' | 'feedback'>('intro');
  const [feedback, setFeedback] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const current = items[idx];

  const listen = async () => {
    setIsSpeaking(true);
    try {
      await EnhancedTTS.speak(current.phrase, { rate: 0.85, pitch: 1.0 });
      
      // Give context about phonemes if available
      if (current.phonemes) {
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

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Transcribe with Whisper
      let transcript = '';
      try {
        const result = await WhisperService.transcribe(blob);
        transcript = result.transcript;
        console.log('Transcription:', transcript);
      } catch (error) {
        console.warn('Whisper failed:', error);
        transcript = '';
      }

      // Score pronunciation
      const pronScore = await AdvancedPronunciationScorer.scoreDetailed(
        current.phrase,
        transcript,
        blob
      );

      // Create feedback object
      const combinedFeedback = {
        overall: pronScore.overall,
        accuracy: pronScore.accuracy,
        fluency: pronScore.fluency,
        wordScores: pronScore.wordScores,
        recommendations: pronScore.recommendations,
        transcript,
        expectedText: current.phrase
      };

      setFeedback(combinedFeedback);
      setStep('feedback');
    } catch (error) {
      console.error('Error processing pronunciation:', error);
      alert('Sorry, there was an error. Please try again.');
      setStep('record');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTryAgain = () => {
    setFeedback(null);
    setStep('record');
  };

  const next = () => {
    setIdx((i) => (i + 1) % items.length);
    setStep('intro');
    setFeedback(null);
  };

  const prev = () => {
    setIdx((i) => (i - 1 + items.length) % items.length);
    setStep('intro');
    setFeedback(null);
  };

  const startRecording = () => {
    setStep('record');
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Main Card */}
      {(step === 'intro' || step === 'record') && (
        <Card className="bg-transparent backdrop-blur-sm border-2 border-orange-200 dark:border-orange-600">
          <CardHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl">
              <span className="flex items-center gap-2 sm:gap-3">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                <span className="text-gray-800 dark:text-white">Speak & Repeat</span>
              </span>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {idx + 1} / {items.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
            {/* Phrase Display */}
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 dark:text-white bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                {current.phrase}
              </div>
              
              {current.phonemes && (
                <div className="text-base sm:text-lg md:text-xl text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 max-w-2xl mx-auto">
                  {current.phonemes}
                </div>
              )}

              {/* Listen Button */}
              <Button
                size="lg"
                onClick={listen}
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
                    <span className="hidden sm:inline">Listen to Teacher</span>
                    <span className="sm:hidden">Listen</span>
                  </>
                )}
              </Button>
            </div>

            {/* Intro Step */}
            {step === 'intro' && (
              <div className="text-center space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 font-semibold px-4">
                  👂 First, listen to the teacher
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
                  Then record yourself saying the same phrase
                </p>
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="rounded-xl sm:rounded-2xl px-6 sm:px-8 md:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-sm sm:text-base md:text-lg font-bold transition-all hover:scale-105 w-full sm:w-auto"
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  Ready to Record
                </Button>
              </div>
            )}

            {/* Record Step */}
            {step === 'record' && !isProcessing && (
              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <p className="text-center text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 font-semibold px-4">
                  🎤 Say the phrase above
                </p>
                <VoiceRecorder
                  onRecordingComplete={handleRecordingComplete}
                  maxDuration={15}
                  showPlayback={true}
                />
              </div>
            )}

            {/* Processing */}
            {isProcessing && (
              <div className="text-center space-y-3 sm:space-y-4 py-6 sm:py-8">
                <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-orange-500 animate-spin mx-auto" />
                <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-white px-4">
                  Analyzing your pronunciation...
                </p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 px-4">
                  Checking each sound 🔊
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
                {items.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300",
                      i === idx ? "bg-orange-500 scale-125 sm:scale-150" : "bg-gray-300 dark:bg-gray-600"
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
      )}

      {/* Feedback Display */}
      {step === 'feedback' && feedback && (
        <PronunciationFeedbackDisplay
          feedback={feedback}
          onTryAgain={handleTryAgain}
          onNext={next}
          showDetailed={true}
        />
      )}
    </div>
  );
}


