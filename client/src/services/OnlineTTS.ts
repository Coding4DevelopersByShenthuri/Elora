/**
 * OnlineTTS Service
 * 
 * Provides online-only text-to-speech using Web Speech API
 * with unique voice profiles for each of the 8 stories.
 * 
 * Features:
 * - 8 unique voice profiles for different story characters
 * - Web Speech API only (no offline models)
 * - Adjustable playback speed
 * - Caption support
 * - Character-specific voice settings
 */

export interface VoiceProfile {
  name: string;
  pitch: number;      // 0-2 (default 1)
  rate: number;       // 0.1-10 (default 1)
  volume: number;     // 0-1 (default 1)
  voiceName?: string; // Specific browser voice name
  description: string;
}

export interface PlaybackOptions {
  speed?: 'normal' | 'slow' | 'slower';
  showCaptions?: boolean;
  onCaptionUpdate?: (text: string) => void;
}

export class OnlineTTS {
  private static synth: SpeechSynthesis | null = null;
  private static voices: SpeechSynthesisVoice[] = [];
  private static isInitialized = false;

  /**
   * Initialize the TTS service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();

      // Voices load asynchronously in some browsers
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }

      this.isInitialized = true;
      console.log('✅ OnlineTTS initialized with Web Speech API');
    } else {
      throw new Error('Speech synthesis not supported in this browser');
    }
  }

  /**
   * Load available voices from the browser
   */
  private static loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    console.log(`📢 Loaded ${this.voices.length} browser voices`);
  }

  /**
   * Check if TTS is available
   */
  static isAvailable(): boolean {
    return this.isInitialized && this.synth !== null;
  }

  /**
   * Get adjusted playback rate based on speed setting
   */
  private static getAdjustedRate(baseRate: number, speed: 'normal' | 'slow' | 'slower'): number {
    switch (speed) {
      case 'slow': return baseRate * 0.7;    // 30% slower
      case 'slower': return baseRate * 0.5;  // 50% slower
      default: return baseRate;               // Normal speed
    }
  }

  /**
   * Stop/cancel any currently playing speech
   */
  static stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Speak text using a specific voice profile
   */
  static async speak(
    text: string,
    voiceProfile: VoiceProfile,
    options?: PlaybackOptions
  ): Promise<void> {
    if (!this.isInitialized || !this.synth) {
      throw new Error('TTS not initialized');
    }

    const speed = options?.speed || 'normal';
    const adjustedRate = this.getAdjustedRate(voiceProfile.rate, speed);

    // Show caption if requested
    if (options?.showCaptions && options?.onCaptionUpdate) {
      options.onCaptionUpdate(text);
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synth!.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice if specified
      if (voiceProfile.voiceName) {
        const voice = this.voices.find(v => v.name === voiceProfile.voiceName);
        if (voice) {
          utterance.voice = voice;
        }
      }

      // Set voice parameters
      utterance.pitch = voiceProfile.pitch;
      utterance.rate = adjustedRate;
      utterance.volume = voiceProfile.volume;
      utterance.lang = 'en-US';

      utterance.onend = () => {
        // Clear caption after delay
        if (options?.showCaptions && options?.onCaptionUpdate) {
          setTimeout(() => options.onCaptionUpdate?.(''), 500);
        }
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('TTS error:', error);
        reject(error);
      };

      this.synth!.speak(utterance);
    });
  }

  /**
   * Get available browser voices
   */
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.voices];
  }

  /**
   * Get voice mode (always 'online' for this service)
   */
  static getVoiceMode(): 'online' {
    return 'online';
  }
}

/**
 * Story Character Voice Profiles
 * Each of the 8 stories has a unique voice character
 */
export const STORY_VOICES: Record<string, VoiceProfile> = {
  // 1. Magic Forest Adventure - Luna (cheerful 6-year-old girl)
  Luna: {
    name: 'Luna',
    pitch: 1.4,
    rate: 0.9,
    volume: 0.95,
    voiceName: undefined, // Let browser choose best female voice
    description: 'Sweet, gentle rabbit voice with magical wonder'
  },
  
  // 2. Space Adventure - Cosmo (excited 7-year-old boy)
  Cosmo: {
    name: 'Cosmo',
    pitch: 1.1,
    rate: 1.0,
    volume: 0.98,
    voiceName: undefined, // Let browser choose best male voice
    description: 'Confident, adventurous astronaut voice'
  },
  
  // 3. Underwater World - Finn (gentle 6-year-old boy)
  Finn: {
    name: 'Finn',
    pitch: 1.2,
    rate: 0.85,
    volume: 0.9,
    voiceName: undefined,
    description: 'Bubbly, cheerful fish voice with underwater flow'
  },
  
  // 4. Dinosaur Discovery - Dina (bold 8-year-old girl)
  Dina: {
    name: 'Dina',
    pitch: 1.15,
    rate: 0.88,
    volume: 0.93,
    voiceName: undefined,
    description: 'Curious, enthusiastic explorer voice with scientific wonder'
  },
  
  // 5. Unicorn Magic - Stardust (sweet 5-year-old girl)
  Stardust: {
    name: 'Stardust',
    pitch: 1.5,
    rate: 0.87,
    volume: 0.92,
    voiceName: undefined,
    description: 'Enchanting, graceful unicorn voice with dreamy magical quality'
  },
  
  // 6. Pirate Treasure - Captain Finn (brave 8-year-old boy)
  CaptainFinn: {
    name: 'Captain Finn',
    pitch: 0.9,
    rate: 0.85,
    volume: 1.0,
    voiceName: undefined,
    description: 'Bold, adventurous pirate captain voice'
  },
  
  // 7. Superhero School - Captain Courage (determined 7-year-old)
  CaptainCourage: {
    name: 'Captain Courage',
    pitch: 1.0,
    rate: 0.92,
    volume: 0.98,
    voiceName: undefined,
    description: 'Heroic, confident superhero voice with powerful determination'
  },
  
  // 8. Fairy Garden - Twinkle (whimsical 6-year-old girl)
  Twinkle: {
    name: 'Twinkle',
    pitch: 1.6,
    rate: 0.93,
    volume: 0.88,
    voiceName: undefined,
    description: 'Delicate, twinkling fairy voice with sweet magical tone'
  }
};

export default OnlineTTS;
