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
  maxDuration?: number; // seconds (0 or undefined = no limit, keep listening until correct)
  disabled?: boolean;
  className?: string;
  autoAnalyze?: boolean; // If true, continuously analyzes during recording
  disabledWhileSpeaking?: boolean; // If true, disable recording while TTS is speaking
  skipPronunciationCheck?: boolean; // If true, skip pronunciation scoring and just call onCorrectPronunciation with any transcript
  autoStart?: boolean; // If true, automatically start recording when component mounts
}

const KidsVoiceRecorder = ({
  targetWord,
  onCorrectPronunciation,
  onRecordingStart,
  maxDuration = 10,
  disabled = false,
  className,
  autoAnalyze = true,
  disabledWhileSpeaking = false,
  skipPronunciationCheck = false,
  autoStart = false
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
  const skipFinalAnalysisRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Auto-start recording if enabled
  useEffect(() => {
    if (autoStart && !disabled && !disabledWhileSpeaking && !isRecording && !isAnalyzing) {
      // Small delay to ensure component is fully mounted and TTS has finished
      const timer = setTimeout(() => {
        if (!isRecording && !isAnalyzing) {
          startRecording().catch(err => {
            console.warn('Auto-start recording failed:', err);
          });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, disabled, disabledWhileSpeaking, isRecording, isAnalyzing]);

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

  const analyzeAudio = async (audioBlob: Blob, isImmediate: boolean = false): Promise<boolean> => {
    // Prevent multiple simultaneous analyses (unless immediate detection)
    if (isAnalyzing && !isImmediate) {
      return false;
    }
    
    try {
      setIsAnalyzing(true);
      
      // Transcribe with Whisper - use longer timeout for kids and enhanced prompts
      let transcript = '';
      try {
        // Create enhanced prompt with context about the target word
        // This helps Whisper better recognize what the kid is trying to say
        const enhancedPrompt = skipPronunciationCheck 
          ? undefined 
          : `The child is trying to say the word: "${targetWord}". ` +
            `The target word is "${targetWord.toLowerCase()}". ` +
            `Listen carefully for variations like "${targetWord.toLowerCase()}" or similar pronunciations.`;
        
        const result = await WhisperService.transcribe(audioBlob, {
          language: 'en',
          prompt: enhancedPrompt // Enhanced prompt with target word context
        });
        
        // Normalize transcript: lowercase and remove punctuation for better matching
        transcript = result.transcript.trim().toLowerCase()
          .replace(/[.,!?;:'"]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        console.log('🎤 Child said:', transcript, isImmediate ? '(immediate)' : '(final)', `[target: "${targetWord}"]`);
      } catch (error) {
        console.warn('Whisper transcription failed:', error);
        // For games/conversations, even if transcription fails, try with what we have
        if (skipPronunciationCheck && audioBlob.size > 1000) {
          // If we have audio but transcription failed, still proceed (might be noise issue)
          console.log('⚠️ Transcription failed but continuing with audio blob for games');
        } else {
          return false;
        }
      }

      // If skipPronunciationCheck is true (games/conversations), accept any valid transcript immediately
      if (skipPronunciationCheck) {
        // For games: accept transcript as soon as detected (even partial)
        // Minimum 2 characters to avoid false positives from noise
        if (transcript && transcript.length >= 2) {
          console.log('✅ Transcript received (pronunciation check skipped):', transcript);
          setShowSuccess(true);
          setFeedbackMessage('🎉 Got it!');
          
          // Auto-stop recording immediately
          await stopRecording(true);
          
          // Notify parent component immediately (no delay for games/conversations)
          onCorrectPronunciation(audioBlob, 100);
          
          return true;
        }
        // If transcript is too short but we have audio, wait a bit more
        if (!transcript && audioBlob.size > 2000 && !isImmediate) {
          // Might be still speaking, don't give up yet
          return false;
        }
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
      skipFinalAnalysisRef.current = false;
      
      // Audio constraints optimized for kids' voices with enhanced quality settings
      // Cast to any to allow Google-specific constraints (non-standard but widely supported in Chrome)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Optimize for kids' voices (higher frequency, higher quality)
          sampleRate: 48000,
          channelCount: 1, // Mono for better processing
          // Google-specific constraints for better quality (may be ignored in non-Chrome browsers)
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true
        } as any
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 192000 // Increased from 128k to 192k for better quality
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
        
        // Handle transcription based on skipPronunciationCheck flag
        if (skipPronunciationCheck) {
          // For games: just call onCorrectPronunciation with the audio blob
          // The parent component (handleVoiceInput) will transcribe it
          onCorrectPronunciation(blob, 100);
        } else {
          // For pronunciation practice: do full analysis
          if (!showSuccess && !skipFinalAnalysisRef.current && chunksRef.current.length > 0) {
            await analyzeAudio(blob);
          }
        }
        
        // Reset skip flag
        skipFinalAnalysisRef.current = false;
        
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
      
      // Start timer (only if maxDuration is set and > 0)
      if (maxDuration && maxDuration > 0) {
        timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            
            // Auto-stop at max duration only if not analyzing for correct pronunciation
            // For vocabulary practice, we want to keep listening until correct
            if (newTime >= maxDuration && !skipPronunciationCheck) {
              // Only auto-stop if maxDuration is reached (give user chance to try again)
              // For vocabulary, maxDuration is more of a safety limit
              stopRecording(false);
            }
            
            return newTime;
          });
        }, 1000);
      } else {
        // No time limit - keep listening until correct or manual stop
        setRecordingTime(0);
      }
      
      // Start continuous analysis if enabled
      if (autoAnalyze) {
        let analysisCycleCount = 0;
        let lastAnalysisTime = Date.now();
        analysisIntervalRef.current = window.setInterval(async () => {
          analysisCycleCount++;
          
          // For games/conversations (skipPronunciationCheck), analyze more frequently for immediate detection
          const analysisInterval = skipPronunciationCheck ? 800 : 1500; // 800ms for games, 1.5s for pronunciation
          const minChunks = skipPronunciationCheck ? 1 : 2; // Start analyzing sooner for games
          
          // Analyze more frequently for immediate detection
          if (chunksRef.current.length >= minChunks) {
            const currentBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
            const timeSinceLastAnalysis = Date.now() - lastAnalysisTime;
            
            // For games: analyze immediately, for pronunciation: every 1.5s
            if (skipPronunciationCheck || timeSinceLastAnalysis >= analysisInterval) {
              lastAnalysisTime = Date.now();
              
              // Analyze in background with immediate flag for games
              analyzeAudio(currentBlob, skipPronunciationCheck).catch(err => {
                console.warn('Background analysis error:', err);
              });
            }
          }
        }, skipPronunciationCheck ? 500 : 800); // Check every 500ms for games, 800ms for pronunciation
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
    
    // If recording stopped successfully (correct pronunciation), skip final analysis
    if (success) {
      skipFinalAnalysisRef.current = true;
    } else {
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
          disabled={disabled || disabledWhileSpeaking}
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
          {maxDuration && maxDuration > 0 ? (
            <div className="text-xl font-mono font-bold text-gray-700 dark:text-gray-300">
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </div>
          ) : (
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              Keep speaking until you get it right! ✨
            </div>
          )}
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

