import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import EnhancedTTS from '@/services/EnhancedTTS';
import { WhisperService } from '@/services/WhisperService';
import { AdvancedPronunciationScorer } from '@/services/AdvancedPronunciationScorer';
import { SLMInference } from '@/services/SLMInference';
import VoiceRecorder from './VoiceRecorder';
import PronunciationFeedbackDisplay from './PronunciationFeedbackDisplay';

type ReadAloudLesson = {
  id: string;
  title: string;
  text: string;
  targetWords?: string[];
};

export default function ReadAloud({ lesson }: { lesson: ReadAloudLesson }) {
  const [step, setStep] = useState<'intro' | 'listen' | 'record' | 'feedback'>('intro');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  const phonemeHints = useMemo(() => {
    const hints: Record<string, string> = {
      rabbit: '/ˈræb.ɪt/',
      forest: '/ˈfɒr.ɪst/',
      astronaut: '/ˈæs.trə.nɔːt/',
      planet: '/ˈplæn.ɪt/',
      animals: '/ˈæn.ɪ.məlz/',
      dinosaur: '/ˈdaɪ.nə.sɔːr/',
      unicorn: '/ˈjuː.nɪ.kɔːrn/',
      pirate: '/ˈpaɪ.rət/',
      treasure: '/ˈtreʒ.ər/',
      superhero: '/ˈsuː.pə.hɪə.rəʊ/',
      fairy: '/ˈfeə.ri/',
      magic: '/ˈmædʒ.ɪk/'
    };
    return hints;
  }, []);

  const words = useMemo(() => lesson.text.split(/\s+/), [lesson.text]);

  useEffect(() => {
    return () => {
      EnhancedTTS.stop();
    };
  }, []);

  const speakLesson = async () => {
    setIsSpeaking(true);
    setStep('listen');
    
    try {
      // Speak word by word with highlighting
      for (let i = 0; i < words.length; i++) {
        setCurrentWordIndex(i);
        await EnhancedTTS.speak(words[i], { rate: 0.85, pitch: 1.0 });
        await new Promise(resolve => setTimeout(resolve, 300)); // Pause between words
      }
      
      setCurrentWordIndex(-1);
      
      // Speak full sentence
      await EnhancedTTS.speak(lesson.text, { rate: 0.9 });
      
      // Encourage to try
      await new Promise(resolve => setTimeout(resolve, 500));
      await EnhancedTTS.speak("Now it's your turn! Tap the microphone to record yourself.", { 
        rate: 0.9, 
        emotion: 'happy' 
      });
      
      setStep('record');
    } catch (error) {
      console.error('Error speaking lesson:', error);
    } finally {
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Step 1: Transcribe with Whisper (offline)
      console.log('🎤 Transcribing speech with Whisper...');
      let transcript = '';
      
      try {
        const whisperResult = await WhisperService.transcribe(blob);
        transcript = whisperResult.transcript;
        console.log('✅ Whisper transcription:', transcript);
      } catch (whisperError) {
        console.warn('Whisper failed, using Web Speech API fallback:', whisperError);
        // Fallback: Try to use Web Speech API (if available)
        transcript = 'Transcription unavailable';
      }
      
      // Step 2: Score pronunciation (offline)
      console.log('📊 Scoring pronunciation...');
      const pronScore = await AdvancedPronunciationScorer.scoreDetailed(
        lesson.text,
        transcript,
        blob
      );
      
      // Step 3: Generate AI feedback (offline)
      console.log('🤖 Generating AI feedback with SLM...');
      let aiFeedback;
      try {
        aiFeedback = await SLMInference.generateFeedback({
          userText: transcript,
          expectedText: lesson.text,
          exerciseType: 'pronunciation',
          userLevel: 'beginner'
        });
      } catch (slmError) {
        console.warn('SLM feedback generation failed:', slmError);
        aiFeedback = {
          feedback: pronScore.overall >= 80 
            ? "Great job! Your pronunciation is excellent!" 
            : "Good effort! Keep practicing to improve.",
          suggestions: []
        };
      }
      
      // Combine all feedback
      const combinedFeedback = {
        overall: pronScore.overall,
        accuracy: pronScore.accuracy,
        fluency: pronScore.fluency,
        completeness: pronScore.overall, // Use overall as completeness fallback
        wordScores: pronScore.wordScores,
        recommendations: [
          aiFeedback.feedback,
          ...pronScore.recommendations,
          ...(aiFeedback.suggestions || [])
        ].filter(Boolean).slice(0, 3),
        transcript,
        expectedText: lesson.text
      };
      
      setFeedback(combinedFeedback);
      setStep('feedback');
      
    } catch (error) {
      console.error('Error processing recording:', error);
      alert('Sorry, there was an error processing your recording. Please try again.');
      setStep('record');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTryAgain = () => {
    setFeedback(null);
    setStep('record');
  };

  const handleReset = () => {
    setFeedback(null);
    setStep('intro');
  };

  return (
    <div className="space-y-6">
      {/* Lesson Card */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <BookOpen className="w-6 h-6 text-blue-500" />
            {lesson.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Display with Phoneme Hints */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <p className="leading-relaxed text-lg">
              {words.map((w, i) => {
                const clean = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
                const hint = phonemeHints[clean];
                const isHighlighted = currentWordIndex === i;
                
                return (
                  <span key={i} className="mr-2 inline-block mb-2">
                    <span className={cn(
                      "font-semibold transition-all duration-300",
                      isHighlighted && "text-2xl text-blue-600 dark:text-blue-400 animate-pulse"
                    )}>
                      {w}
                    </span>
                    {hint && (
                      <span className="ml-1 text-xs text-pink-500 dark:text-pink-400">
                        {hint}
                      </span>
                    )}
                  </span>
                );
              })}
            </p>
          </div>

          {/* Step: Intro */}
          {step === 'intro' && (
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                👂 First, listen carefully to the teacher
              </p>
              <Button
                size="lg"
                onClick={speakLesson}
                disabled={isSpeaking}
                className="rounded-2xl px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500"
              >
                {isSpeaking ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Teacher Speaking...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 mr-2" />
                    Listen to Teacher
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step: Listen */}
          {step === 'listen' && (
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce mb-4">👂</div>
              <p className="text-xl font-semibold text-gray-800 dark:text-white">
                Listen carefully...
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Pay attention to how each word sounds
              </p>
            </div>
          )}

          {/* Step: Record */}
          {step === 'record' && !isProcessing && (
            <div className="space-y-4">
              <p className="text-center text-lg text-gray-600 dark:text-gray-300 mb-4">
                🎤 Now you try! Read the sentence above
              </p>
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={30}
                showPlayback={true}
              />
              <div className="flex justify-center gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={speakLesson}
                  disabled={isSpeaking}
                  className="rounded-2xl"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Hear Again
                </Button>
              </div>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
              <p className="text-xl font-semibold text-gray-800 dark:text-white">
                Analyzing your pronunciation...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI is checking your speech 🤖
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Display */}
      {step === 'feedback' && feedback && (
        <PronunciationFeedbackDisplay
          feedback={feedback}
          onTryAgain={handleTryAgain}
          onNext={handleReset}
          showDetailed={true}
        />
      )}
    </div>
  );
}


