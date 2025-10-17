import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  maxDuration?: number; // seconds
  disabled?: boolean;
  className?: string;
  showPlayback?: boolean;
}

const VoiceRecorder = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  maxDuration = 30,
  disabled = false,
  className,
  showPlayback = true
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        onRecordingComplete(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      
      if (onRecordingStart) {
        onRecordingStart();
      }
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (onRecordingStop) {
        onRecordingStop();
      }
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Recording Button */}
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
        )}
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={cn(
            "rounded-full w-20 h-20 relative z-10 transition-all duration-300",
            isRecording 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] hover:from-[#4ECDC4] hover:to-[#FF6B6B]"
          )}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </Button>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-bold text-red-500">Recording...</span>
          </div>
          <div className="text-2xl font-mono font-bold text-gray-700 dark:text-gray-300">
            {formatTime(recordingTime)} / {formatTime(maxDuration)}
          </div>
        </div>
      )}

      {/* Playback Button */}
      {showPlayback && audioBlob && !isRecording && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={playRecording}
            disabled={isPlaying}
            className="rounded-xl"
          >
            {isPlaying ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4 mr-2" />
            )}
            {isPlaying ? 'Playing...' : 'Listen Back'}
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!isRecording && !audioBlob && (
        <p className="text-sm text-gray-600 dark:text-gray-500 text-center max-w-xs">
          🎤 Tap the microphone to start recording
        </p>
      )}
    </div>
  );
};

export default VoiceRecorder;

