/*
  SpeechService provides offline-friendly TTS and STT facades.
  - TTS: Uses Web Speech API speechSynthesis when available (runs locally in modern browsers/OS voices)
  - STT: Uses Web Speech API SpeechRecognition when available (implementation varies by browser)
  - Character Voices: Each character has unique voice settings for expressive storytelling
  For strict offline with deterministic models (e.g., Vosk/Whisper.cpp), integrate via WebAssembly/WebWorker later.
*/

import { getCharacterVoice, type CharacterType } from './CharacterVoiceService';

export type SpeechRecognitionResult = {
  transcript: string;
  confidence?: number;
  durationMs?: number;
};

export interface StartRecognitionOptions {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  timeoutMs?: number;
  onInterimResult?: (transcript: string, isFinal: boolean) => void;
  autoStopOnSilence?: boolean; // Auto-stop after detecting speech and silence
  silenceTimeoutMs?: number; // How long to wait after speech before stopping
}

export class SpeechService {
  private static ttsDefaultLang = 'en-US';

  static isTTSSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  static speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number; lang?: string; voiceName?: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isTTSSupported()) {
        return reject(new Error('TTS not supported'));
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = opts?.rate ?? 1.0;
      utterance.pitch = opts?.pitch ?? 1.0;
      utterance.volume = opts?.volume ?? 1.0;
      utterance.lang = opts?.lang ?? this.ttsDefaultLang;

      if (opts?.voiceName) {
        const voice = window.speechSynthesis.getVoices().find(v => v.name === opts.voiceName);
        if (voice) utterance.voice = voice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e.error ?? new Error('TTS error'));

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Speak text using a specific character's voice
   * Each character has unique pitch, rate, and volume for expressive storytelling
   * Text is split by natural pauses (...) for better pacing
   */
  static async speakAsCharacter(text: string, character: CharacterType, opts?: { lang?: string; voiceName?: string }): Promise<void> {
    const characterVoice = getCharacterVoice(character);
    
    // Debug log to verify character voice is being used
    console.log(`🎭 Speaking as "${character}":`, {
      pitch: characterVoice.pitch,
      rate: characterVoice.rate,
      volume: characterVoice.volume,
      description: characterVoice.description
    });
    
    // Split by natural pauses (...) for better pacing
    const segments = text.split(/\s*\.\.\.\s*/).filter(seg => seg.trim());
    
    // Speak each segment sequentially with pauses
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i].trim();
      
      if (segment) {
        await this.speak(segment, {
          rate: characterVoice.rate,
          pitch: characterVoice.pitch,
          volume: characterVoice.volume,
          lang: opts?.lang ?? this.ttsDefaultLang,
          voiceName: opts?.voiceName
        });

        // Add a natural pause between segments (except after the last one)
        if (i < segments.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }
    }
  }

  static cancelSpeak(): void {
    if (this.isTTSSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  // STT (Web Speech API wrapper)
  static isSTTSupported(): boolean {
    return typeof (window as any).webkitSpeechRecognition !== 'undefined' || typeof (window as any).SpeechRecognition !== 'undefined';
  }

  static startRecognition(options?: StartRecognitionOptions): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      const RecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!RecognitionCtor) {
        return reject(new Error('STT not supported'));
      }

      const recognition = new RecognitionCtor();
      recognition.lang = options?.lang ?? 'en-US';
      recognition.interimResults = options?.interimResults ?? true; // Default to true for better real-time detection
      recognition.continuous = options?.continuous ?? (options?.interimResults === true); // Enable continuous if interim results are enabled

      let resolved = false;
      let startTime = Date.now();
      let timer: number | undefined;
      let silenceTimer: number | undefined;
      let lastSpeechTime = Date.now();
      let finalTranscript = '';
      let bestConfidence = 0;

      const clearTimer = () => {
        if (timer !== undefined) window.clearTimeout(timer);
        timer = undefined;
      };

      const clearSilenceTimer = () => {
        if (silenceTimer !== undefined) window.clearTimeout(silenceTimer);
        silenceTimer = undefined;
      };

      // Use longer timeout for kids (30 seconds default, or user-specified)
      const timeoutMs = options?.timeoutMs ?? 30000;
      
      if (timeoutMs > 0) {
        timer = window.setTimeout(() => {
          if (!resolved) {
            try { recognition.stop(); } catch {}
            // Return the best transcript we have if any
            if (finalTranscript) {
              resolved = true;
              resolve({ transcript: finalTranscript, confidence: bestConfidence, durationMs: Date.now() - startTime });
            } else {
              reject(new Error('STT timeout'));
            }
          }
        }, timeoutMs);
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let hasFinal = false;

        // Process all results (interim and final)
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const isFinal = event.results[i].isFinal;
          const confidence = event.results[i][0].confidence || 0.8;

          if (isFinal) {
            finalTranscript += transcript + ' ';
            hasFinal = true;
            bestConfidence = Math.max(bestConfidence, confidence);
          } else {
            interimTranscript += transcript;
          }

          // Call interim callback if provided
          if (options?.onInterimResult) {
            options.onInterimResult(transcript, isFinal);
          }
        }

        // Update last speech time for silence detection
        lastSpeechTime = Date.now();

        // If we have a final result and auto-stop is enabled, wait for silence then stop
        if (hasFinal && options?.autoStopOnSilence) {
          clearSilenceTimer();
          const silenceTimeout = options.silenceTimeoutMs ?? 1500; // Default 1.5 seconds of silence
          
          silenceTimer = window.setTimeout(() => {
            if (!resolved && finalTranscript.trim()) {
              resolved = true;
              clearTimer();
              clearSilenceTimer();
              try { recognition.stop(); } catch {}
              resolve({ 
                transcript: finalTranscript.trim(), 
                confidence: bestConfidence || 0.8, 
                durationMs: Date.now() - startTime 
              });
            }
          }, silenceTimeout);
        }

        // For immediate detection mode (games/conversations with autoStopOnSilence)
        // Resolve as soon as we have meaningful speech (even if interim)
        if (options?.autoStopOnSilence && !resolved) {
          const meaningfulSpeech = finalTranscript.trim() || interimTranscript.trim();
          
          // If we have meaningful speech (at least 2 characters), start the silence timer
          if (meaningfulSpeech.length >= 2 && !hasFinal) {
            // We have interim speech, wait for final or silence
            clearSilenceTimer();
            const silenceTimeout = options.silenceTimeoutMs ?? 1500;
            
            // Start shorter silence timer for interim results (1 second)
            silenceTimer = window.setTimeout(() => {
              if (!resolved && meaningfulSpeech.trim().length >= 2) {
                resolved = true;
                clearTimer();
                clearSilenceTimer();
                try { recognition.stop(); } catch {}
                resolve({ 
                  transcript: meaningfulSpeech.trim(), 
                  confidence: 0.7, // Lower confidence for interim, but acceptable for real-time
                  durationMs: Date.now() - startTime 
                });
              }
            }, 1000); // 1 second for interim results
          }
        }
        
        // If we have interim results and callback, notify immediately
        if (interimTranscript && options?.onInterimResult) {
          options.onInterimResult(interimTranscript, false);
        }
      };

      recognition.onerror = (event: any) => {
        clearTimer();
        clearSilenceTimer();
        
        // Map error codes to user-friendly messages
        let errorMessage = 'STT error';
        const errorCode = event.error || '';
        
        if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
          errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
        } else if (errorCode === 'no-speech') {
          errorMessage = 'No speech detected. Please try speaking again.';
        } else if (errorCode === 'aborted') {
          errorMessage = 'Speech recognition was aborted.';
        } else if (errorCode === 'audio-capture') {
          errorMessage = 'No microphone found. Please connect a microphone.';
        } else if (errorCode === 'network') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = event.error || 'Speech recognition error occurred.';
        }
        
        // If we have a transcript, return it instead of error
        if (finalTranscript.trim() && !resolved) {
          resolved = true;
          resolve({ 
            transcript: finalTranscript.trim(), 
            confidence: bestConfidence || 0.7, 
            durationMs: Date.now() - startTime 
          });
        } else {
          reject(new Error(errorMessage));
        }
      };

      recognition.onend = () => {
        clearTimer();
        clearSilenceTimer();
        if (!resolved) {
          // Return what we have if available
          if (finalTranscript.trim()) {
            resolved = true;
            resolve({ 
              transcript: finalTranscript.trim(), 
              confidence: bestConfidence || 0.7, 
              durationMs: Date.now() - startTime 
            });
          } else {
            reject(new Error('No speech detected'));
          }
        }
      };

      try {
        recognition.start();
      } catch (e) {
        clearTimer();
        clearSilenceTimer();
        reject(e as Error);
      }
    });
  }
}

export default SpeechService;


