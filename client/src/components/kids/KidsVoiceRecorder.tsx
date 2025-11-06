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
  const [isTtsCooldown, setIsTtsCooldown] = useState(false);
  const [detectedText, setDetectedText] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const skipFinalAnalysisRef = useRef<boolean>(false);
  const ttsCooldownRef = useRef<boolean>(false);
  const webSpeechRecognitionRef = useRef<any>(null);
  const webSpeechTranscriptRef = useRef<string>('');

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Stop recording immediately when TTS starts speaking (disabledWhileSpeaking becomes true)
  useEffect(() => {
    if (disabledWhileSpeaking && isRecording) {
      console.log('🛑 TTS started - stopping recording to prevent TTS audio capture');
      // Clear any chunks collected - we don't want to analyze TTS audio
      chunksRef.current = [];
      skipFinalAnalysisRef.current = true; // Skip final analysis to prevent processing TTS audio
      
      // Stop recording immediately
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn('Error stopping recorder:', e);
        }
      }
      setIsRecording(false);
      
      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
      
      // Set cooldown to prevent immediate re-recording
      ttsCooldownRef.current = true;
      setIsTtsCooldown(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledWhileSpeaking, isRecording]);

  // Handle cooldown period when TTS finishes
  useEffect(() => {
    if (!disabledWhileSpeaking && ttsCooldownRef.current) {
      // TTS finished - maintain cooldown for additional safety
      // The parent component (Vocabulary/Pronunciation) already waits 1.5 seconds
      // We'll add an additional buffer to be safe
      const cooldownTimer = setTimeout(() => {
        ttsCooldownRef.current = false;
        setIsTtsCooldown(false);
        console.log('✅ Cooldown period ended - recording can now start');
      }, 2000); // 2 seconds after TTS ends (additional safety buffer)
      
      return () => clearTimeout(cooldownTimer);
    }
  }, [disabledWhileSpeaking]);

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
      
      // Transcribe with Whisper - optimized for kids' voices with enhanced prompts
      let transcript = '';
      try {
        // Simplified prompt for kids - direct and immediate
        const targetLower = targetWord.toLowerCase();
        const enhancedPrompt = skipPronunciationCheck 
          ? `Child speaking: "${targetLower}"`
          : `Child saying: "${targetWord}". Target: "${targetLower}"`;
        
        // Faster transcription for immediate detection
        const result = await WhisperService.transcribe(audioBlob, {
          language: 'en',
          prompt: enhancedPrompt,
          timeout: 8000,
          sampleRate: 48000
        } as any);
        
        // Normalize transcript: lowercase and remove punctuation for better matching
        transcript = result.transcript.trim().toLowerCase()
          .replace(/[.,!?;:'"]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        console.log('🎤 Child said:', transcript, isImmediate ? '(immediate)' : '(final)', `[target: "${targetWord}"]`, `[confidence: ${result.confidence || 'N/A'}]`);
        
        // If transcript is empty or too short, try Web Speech API fallback immediately
        if (!transcript || transcript.length < 1) {
          console.log('⚠️ Whisper returned empty transcript, trying Web Speech API...');
          throw new Error('Empty transcript from Whisper');
        }
      } catch (error: any) {
        console.warn('Whisper transcription failed or empty:', error);
        
          // Use Web Speech API transcript if available (collected during recording)
        if (webSpeechTranscriptRef.current && webSpeechTranscriptRef.current.length > 0) {
          transcript = webSpeechTranscriptRef.current.trim().toLowerCase()
            .replace(/[.,!?;:'"]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          console.log('✅ Using Web Speech API transcript collected during recording:', transcript);
        } else {
          console.warn('⚠️ No Web Speech API transcript available either');
        }
        
        // If still no transcript, log the issue
        if (!transcript || transcript.length < 1) {
          console.error('❌ NO TRANSCRIPT DETECTED:', {
            audioSize: audioBlob.size,
            isImmediate,
            whisperFailed: true,
            webSpeechAvailable: webSpeechTranscriptRef.current?.length > 0
          });
          
          // For very short audio, might still be speaking
          if (audioBlob.size < 2000 && !isImmediate) {
            console.log('⚠️ Audio too short, waiting for more...');
            return false;
          } else {
            // Show feedback that nothing was detected
            setFeedbackMessage('🎤 I didn\'t hear anything. Please try speaking again!');
            return false;
          }
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

      // If we have a transcript, check if the pronunciation is correct for kids
      if (transcript && transcript.length > 0) {
        console.log(`🔍 Checking pronunciation: target="${targetWord}" vs detected="${transcript}"`);
        
        const isCorrect = await AdvancedPronunciationScorer.isCorrectForKids(
          targetWord,
          transcript,
          audioBlob
        );

        if (isCorrect) {
          // Get score for reporting (simplified, fast)
          const detailedScore = await AdvancedPronunciationScorer.scoreForKids(
            targetWord,
            transcript,
            audioBlob
          );
          
          console.log('✅ Correct pronunciation detected! Score:', detailedScore.overall, `[target: "${targetWord}", detected: "${transcript}"]`);
          setShowSuccess(true);
          setFeedbackMessage('🎉 Perfect! You said it correctly!');
          
          // Auto-stop recording immediately
          await stopRecording(true);
          
          // Notify parent component immediately (no delay)
          onCorrectPronunciation(audioBlob, detailedScore.overall);
          
          return true;
        } else {
          // Show feedback that we're still listening with what we heard
          console.log(`❌ Pronunciation check failed: target="${targetWord}", detected="${transcript}"`);
          setFeedbackMessage(`💬 I heard: "${transcript}". Try saying "${targetWord}" again!`);
        }
      } else {
        // No transcript yet, but we have audio - might still be speaking
        if (audioBlob.size > 2000) {
          setFeedbackMessage('🎤 Keep speaking... I\'m listening!');
          console.log('⚠️ Audio detected but no transcript yet (size:', audioBlob.size, 'bytes)');
        } else {
          console.log('⚠️ Very short audio, might be noise (size:', audioBlob.size, 'bytes)');
        }
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
    // Prevent starting if TTS is speaking or if we're in cooldown period after TTS
    if (disabledWhileSpeaking || isTtsCooldown) {
      console.log('⏸️ Cannot start recording - TTS is speaking or cooldown active');
      setFeedbackMessage('⏸️ Please wait for the audio to finish...');
      return;
    }
    
    try {
      setFeedbackMessage('');
      setShowSuccess(false);
      setDetectedText(''); // Reset detected text display
      skipFinalAnalysisRef.current = false;
      webSpeechTranscriptRef.current = ''; // Reset Web Speech transcript
      
      // Start Web Speech API recognition in parallel for better detection
      try {
        const { SpeechService } = await import('@/services/SpeechService');
        if (SpeechService.isSTTSupported()) {
          console.log('🎤 Starting Web Speech API recognition in parallel for target:', targetWord);
          
          // Start recognition and collect transcripts in real-time
          SpeechService.startRecognition({
            lang: 'en-US',
            timeoutMs: maxDuration && maxDuration > 0 ? maxDuration * 1000 : 30000,
            interimResults: true,
            continuous: true,
            autoStopOnSilence: false, // Don't auto-stop, we'll stop manually
            onInterimResult: (transcript: string, isFinal: boolean) => {
              if (transcript && transcript.trim().length > 0) {
                const normalized = transcript.trim().toLowerCase()
                  .replace(/[.,!?;:'"]/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
                
                if (normalized.length > 0) {
                  webSpeechTranscriptRef.current = normalized;
                  setDetectedText(normalized); // Update UI with detected text
                  console.log('📝 Web Speech API interim:', normalized, isFinal ? '(final)' : '(interim)');
                  
                  // Try immediate matching if we have a good transcript
                  if (isFinal && normalized.length >= 2) {
                    // Check if it matches immediately
                    AdvancedPronunciationScorer.isCorrectForKids(targetWord, normalized)
                      .then(isCorrect => {
                        if (isCorrect && isRecording) {
                          console.log('✅ Web Speech API detected correct pronunciation immediately!');
                          // Stop recording and trigger success
                          (async () => {
                            await stopRecording(true);
                            // Wait a moment for blob to be ready
                            setTimeout(() => {
                              // Get audio blob from chunks
                              const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                              if (audioBlob.size > 0) {
                                onCorrectPronunciation(audioBlob, 100);
                              } else {
                                // If no blob, create minimal one
                                const dummyBlob = new Blob([''], { type: 'audio/webm' });
                                onCorrectPronunciation(dummyBlob, 100);
                              }
                            }, 100);
                          })();
                        }
                      })
                      .catch(err => console.warn('Error in immediate check:', err));
                  }
                }
              }
            }
          }).then(result => {
            if (result.transcript) {
              const normalized = result.transcript.trim().toLowerCase()
                .replace(/[.,!?;:'"]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              webSpeechTranscriptRef.current = normalized;
              console.log('✅ Web Speech API final result:', normalized);
            }
          }).catch(err => {
            console.warn('Web Speech API error (non-fatal):', err);
          });
        }
      } catch (err) {
        console.warn('Could not start Web Speech API (non-fatal):', err);
      }
      
      // Audio constraints optimized for kids' voices with enhanced quality settings
      // Kids have higher-pitched voices, so we need higher sample rate and better sensitivity
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true, // Important for kids who may speak quieter
          // Optimize for kids' voices (higher frequency range, higher quality)
          sampleRate: 48000, // Higher sample rate captures more detail
          channelCount: 1, // Mono for better processing
          // Sensitivity settings for kids (they may speak at different volumes)
          volume: 1.0,
          // Google-specific constraints for better quality (may be ignored in non-Chrome browsers)
          googEchoCancellation: true,
          googAutoGainControl: true, // Critical for kids - adjusts volume automatically
          googNoiseSuppression: true,
          googHighpassFilter: true, // Filters out low-frequency noise
          googTypingNoiseDetection: true,
          googAudioMirroring: false
        } as any
      });
      
      streamRef.current = stream;
      
      // Try to get the best available codec for kids' voices
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 192000 // Higher bitrate for better quality (captures kids' voices better)
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
      
      // Start continuous analysis if enabled - MORE FREQUENT for immediate detection
      if (autoAnalyze) {
        let analysisCycleCount = 0;
        let lastAnalysisTime = Date.now();
        analysisIntervalRef.current = window.setInterval(async () => {
          analysisCycleCount++;
          
          // For kids: analyze VERY frequently for immediate detection
          // Pronunciation/Vocabulary: analyze every 800ms (faster than before)
          const analysisInterval = skipPronunciationCheck ? 500 : 800; // Faster for immediate detection
          const minChunks = skipPronunciationCheck ? 1 : 1; // Start analyzing immediately with first chunk
          
          // Analyze more frequently for immediate detection (especially important for kids)
          if (chunksRef.current.length >= minChunks) {
            const currentBlob = new Blob(chunksRef.current, { type: mimeType });
            const timeSinceLastAnalysis = Date.now() - lastAnalysisTime;
            
            // Analyze more frequently for immediate detection
            if (skipPronunciationCheck || timeSinceLastAnalysis >= analysisInterval) {
              lastAnalysisTime = Date.now();
              
              // Analyze in background with immediate flag
              // Don't wait for result - let it run in parallel
              analyzeAudio(currentBlob, skipPronunciationCheck).catch(err => {
                console.warn('Background analysis error:', err);
              });
            }
          }
        }, skipPronunciationCheck ? 300 : 500); // Check every 300ms for games, 500ms for pronunciation (MUCH faster for kids)
      }
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setFeedbackMessage('❌ Could not access microphone. Please allow permissions.');
    }
  };

  const stopRecording = async (success: boolean = false) => {
    // Stop Web Speech API recognition if active
    if (webSpeechRecognitionRef.current) {
      try {
        // The recognition should stop automatically, but we can try to stop it
        // Note: SpeechService doesn't expose a stop method, it stops automatically
        webSpeechRecognitionRef.current = null;
      } catch (e) {
        console.warn('Error stopping Web Speech recognition:', e);
      }
    }
    
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
    
    // Log final Web Speech transcript
    if (webSpeechTranscriptRef.current) {
      console.log('📝 Final Web Speech API transcript:', webSpeechTranscriptRef.current);
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
          disabled={disabled || disabledWhileSpeaking || isTtsCooldown}
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
          {/* Show detected text in real-time */}
          {detectedText && (
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-900/20 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-700">
              📝 I heard: "{detectedText}"
            </div>
          )}
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
        <div className="space-y-2">
          <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-400 font-semibold max-w-xs px-4">
            {feedbackMessage}
          </p>
          {/* Show what was detected if available */}
          {webSpeechTranscriptRef.current && webSpeechTranscriptRef.current.length > 0 && (
            <div className="text-xs text-center text-blue-600 dark:text-blue-400 max-w-xs px-4">
              📝 Detected: "{webSpeechTranscriptRef.current}"
            </div>
          )}
          {(feedbackMessage.includes('Could not') || feedbackMessage.includes('hear') || feedbackMessage.includes("didn't")) && (
            <div className="text-xs text-center text-gray-500 dark:text-gray-500 max-w-xs px-4 space-y-1">
              <p>💡 Tips for better recognition:</p>
              <ul className="list-disc list-inside text-left space-y-0.5">
                <li>Speak clearly and at a normal volume</li>
                <li>Make sure your microphone isn't muted</li>
                <li>Try moving closer to the microphone</li>
                <li>Reduce background noise</li>
                <li>Wait for the "Listening..." message before speaking</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!isRecording && !showSuccess && !feedbackMessage && (
        <div className="space-y-2">
          <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-500 max-w-xs px-4">
            🎤 Click to start! Say "<span className="font-bold text-purple-600 dark:text-purple-400">{targetWord}</span>" clearly
          </p>
          <p className="text-xs text-center text-gray-500 dark:text-gray-500 max-w-xs px-4">
            💡 Speak clearly and at a normal volume. The AI will listen carefully!
          </p>
          <p className="text-xs text-center text-blue-600 dark:text-blue-400 max-w-xs px-4 font-semibold">
            🔊 Using Web Speech API + Whisper for best detection
          </p>
          {(disabledWhileSpeaking || isTtsCooldown) && (
            <p className="text-xs text-center text-orange-600 dark:text-orange-400 max-w-xs px-4 font-semibold">
              ⏸️ Please wait for the audio to finish before recording...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default KidsVoiceRecorder;

