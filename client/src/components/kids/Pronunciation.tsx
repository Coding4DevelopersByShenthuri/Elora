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
        completeness: pronScore.completeness,
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
    <div className="space-y-6">
      {/* Main Card */}
      {(step === 'intro' || step === 'record') && (
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-2xl">
              <span className="flex items-center gap-3">
                <Mic className="w-6 h-6 text-orange-500" />
                Speak & Repeat
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {idx + 1} / {items.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Phrase Display */}
            <div className="text-center space-y-4">
              <div className="text-4xl font-extrabold text-gray-800 dark:text-white bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6">
                {current.phrase}
              </div>
              
              {current.phonemes && (
                <div className="text-xl text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                  {current.phonemes}
                </div>
              )}

              {/* Listen Button */}
              <Button
                size="lg"
                onClick={listen}
                disabled={isSpeaking}
                className="rounded-2xl px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500"
              >
                {isSpeaking ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Speaking...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 mr-2" />
                    Listen to Teacher
                  </>
                )}
              </Button>
            </div>

            {/* Intro Step */}
            {step === 'intro' && (
              <div className="text-center space-y-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  👂 First, listen to the teacher
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Then record yourself saying the same phrase
                </p>
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="rounded-2xl px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Ready to Record
                </Button>
              </div>
            )}

            {/* Record Step */}
            {step === 'record' && !isProcessing && (
              <div className="space-y-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <p className="text-center text-lg text-gray-600 dark:text-gray-300">
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
              <div className="text-center space-y-4 py-8">
                <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto" />
                <p className="text-xl font-semibold text-gray-800 dark:text-white">
                  Analyzing your pronunciation...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Checking each sound 🔊
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
                {items.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i === idx ? "bg-orange-500 scale-150" : "bg-gray-300"
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


