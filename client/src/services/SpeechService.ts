/*
  SpeechService provides offline-friendly TTS and STT facades.
  - TTS: Uses Web Speech API speechSynthesis when available (runs locally in modern browsers/OS voices)
  - STT: Uses Web Speech API SpeechRecognition when available (implementation varies by browser)
  For strict offline with deterministic models (e.g., Vosk/Whisper.cpp), integrate via WebAssembly/WebWorker later.
*/

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
      recognition.interimResults = options?.interimResults ?? false;
      recognition.continuous = options?.continuous ?? false;

      let resolved = false;
      let startTime = Date.now();
      let timer: number | undefined;

      const clearTimer = () => {
        if (timer !== undefined) window.clearTimeout(timer);
        timer = undefined;
      };

      if (options?.timeoutMs && options.timeoutMs > 0) {
        timer = window.setTimeout(() => {
          if (!resolved) {
            try { recognition.stop(); } catch {}
            reject(new Error('STT timeout'));
          }
        }, options.timeoutMs);
      }

      recognition.onresult = (event: any) => {
        const result = event.results[0][0];
        resolved = true;
        clearTimer();
        resolve({ transcript: result.transcript, confidence: result.confidence, durationMs: Date.now() - startTime });
      };

      recognition.onerror = (event: any) => {
        clearTimer();
        reject(new Error(event.error || 'STT error'));
      };

      recognition.onend = () => {
        clearTimer();
        if (!resolved) {
          reject(new Error('No speech detected'));
        }
      };

      try {
        recognition.start();
      } catch (e) {
        clearTimer();
        reject(e as Error);
      }
    });
  }
}

export default SpeechService;


