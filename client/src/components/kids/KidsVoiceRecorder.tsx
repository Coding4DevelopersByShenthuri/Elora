import { useState, useRef, useEffect } from 'react';
import { Mic, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WhisperService } from '@/services/WhisperService';
import { AdvancedPronunciationScorer } from '@/services/AdvancedPronunciationScorer';

interface KidsVoiceRecorderProps {
  targetWord: string; // The word the child should pronounce
  onCorrectPronunciation: (audioBlob: Blob, score: number) => void;
  onRecordingStart?: () => void;
  maxDuration?: number; // seconds
  disabled?: boolean;
  className?: string;
  autoAnalyze?: boolean; // If true, continuously analyzes during recording
  disabledWhileSpeaking?: boolean; // If true, disable recording while TTS is speaking
}

const KidsVoiceRecorder = ({
  targetWord,
  onCorrectPronunciation,
  onRecordingStart,
  maxDuration = 10,
  disabled = false,
  className,
  autoAnalyze = true,
  disabledWhileSpeaking = false
}: KidsVoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recorder in cleanup:', e);
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const analyzeAudio = async (audioBlob: Blob): Promise<boolean> => {
    try {
      setIsAnalyzing(true);
      
      // Transcribe with Whisper
      let transcript = '';
      try {
        const result = await WhisperService.transcribe(audioBlob);
        transcript = result.transcript.trim();
        console.log('🎤 Child said:', transcript);
      } catch (error) {
        console.warn('Whisper transcription failed:', error);
        return false;
      }

      // Check if the pronunciation is correct for kids
      const isCorrect = await AdvancedPronunciationScorer.isCorrectForKids(
        targetWord,
        transcript,
        audioBlob
      );

      if (isCorrect) {
        // Get detailed score for reporting
        const detailedScore = await AdvancedPronunciationScorer.scoreForKids(
          targetWord,
          transcript,
          audioBlob
        );
        
        console.log('✅ Correct pronunciation detected! Score:', detailedScore.overall);
        setShowSuccess(true);
        setFeedbackMessage('🎉 Perfect! You said it correctly!');
        
        // Auto-stop recording
        await stopRecording(true);
        
        // Notify parent component
        setTimeout(() => {
          onCorrectPronunciation(audioBlob, detailedScore.overall);
        }, 1000);
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error analyzing audio:', error);
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      setFeedbackMessage('');
      setShowSuccess(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Optimize for kids' voices (higher frequency)
          sampleRate: 48000
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        
        // Final analysis if not already marked as success
        if (!showSuccess && chunksRef.current.length > 0) {
          await analyzeAudio(blob);
        }
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      // Start recording with small chunks for real-time analysis
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      setFeedbackMessage('🎤 Listening carefully...');
      
      if (onRecordingStart) {
        onRecordingStart();
      }
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Auto-stop at max duration
          if (newTime >= maxDuration) {
            stopRecording(false);
          }
          
          return newTime;
        });
      }, 1000);
      
      // Start continuous analysis if enabled
      if (autoAnalyze) {
        let analysisCycleCount = 0;
        analysisIntervalRef.current = window.setInterval(async () => {
          analysisCycleCount++;
          
          // Only analyze after 2 seconds of recording and every 1.5 seconds
          if (chunksRef.current.length >= 2 && analysisCycleCount % 2 === 0) {
            const currentBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
            
            // Analyze in background
            analyzeAudio(currentBlob).catch(err => {
              console.warn('Background analysis error:', err);
            });
          }
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setFeedbackMessage('❌ Could not access microphone. Please allow permissions.');
    }
  };

  const stopRecording = async (success: boolean = false) => {
    // Stop immediately without checking isRecording state
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recorder:', e);
      }
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    if (!success) {
      setFeedbackMessage('👍 Good try! Let\'s check your pronunciation...');
    }
  };

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Recording Button */}
      <div className="relative">
        {isRecording && !showSuccess && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-75"></div>
        )}
        {showSuccess && (
          <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-75"></div>
        )}
        <Button
          size="lg"
          variant={showSuccess ? "default" : isRecording ? "secondary" : "default"}
          className={cn(
            "rounded-full w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 relative z-10 transition-all duration-300 text-white font-bold",
            showSuccess 
              ? "bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 cursor-default" 
              : isRecording
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500"
                : "bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B]"
          )}
          onClick={showSuccess ? undefined : (isRecording ? () => stopRecording(false) : startRecording)}
          disabled={disabled || disabledWhileSpeaking || isAnalyzing}
        >
          {showSuccess ? (
            <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white animate-bounce" />
          ) : isAnalyzing ? (
            <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 text-white animate-spin" />
          ) : isRecording ? (
            <div className="flex flex-col items-center">
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
              <span className="text-xs mt-1">Stop</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              <span className="text-xs mt-1">Say it!</span>
            </div>
          )}
        </Button>
      </div>

      {/* Recording Status */}
      {isRecording && !showSuccess && (
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500 animate-spin" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Listening...
            </span>
          </div>
          <div className="text-xl font-mono font-bold text-gray-700 dark:text-gray-300">
            {formatTime(recordingTime)} / {formatTime(maxDuration)}
          </div>
        </div>
      )}

      {/* Analyzing Status */}
      {isAnalyzing && !showSuccess && (
        <div className="flex items-center gap-2 animate-pulse">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
            Checking pronunciation...
          </span>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <div className="text-4xl">🎉</div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Perfect! Word Mastered!
          </span>
        </div>
      )}

      {/* Feedback Message */}
      {feedbackMessage && !showSuccess && (
        <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-400 font-semibold max-w-xs px-4">
          {feedbackMessage}
        </p>
      )}

      {/* Instructions */}
      {!isRecording && !showSuccess && !feedbackMessage && (
        <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-500 max-w-xs px-4">
          🎤 Click to start! Say "<span className="font-bold text-purple-600 dark:text-purple-400">{targetWord}</span>" clearly
        </p>
      )}
    </div>
  );
};

export default KidsVoiceRecorder;

