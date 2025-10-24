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
   * Get list of available voices for debugging
   */
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.voices];
  }

  /**
   * Log available voices for debugging
   */
  static logAvailableVoices(): void {
    console.log('📢 Available voices:');
    this.voices.forEach((voice, index) => {
      console.log(`${index + 1}. ${voice.name} (${voice.lang}) - ${(voice as any).gender || 'unknown'} - ${voice.localService ? 'local' : 'remote'}`);
    });
  }

  /**
   * Get current voice mode
   */
  static getVoiceMode(): string {
    return 'Online (Web Speech API)';
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
      
      // Set voice if specified - with fallback logic
      if (voiceProfile.voiceName) {
        console.log(`🎤 Voice selection for ${voiceProfile.name}:`, {
          targetVoice: voiceProfile.voiceName,
          availableVoices: this.voices.length,
          voiceProfile: voiceProfile
        });
        
        // Try exact match first
        let voice = this.voices.find(v => v.name === voiceProfile.voiceName);
        
        // If exact match not found, try partial match
        if (!voice) {
          voice = this.voices.find(v => 
            v.name.toLowerCase().includes(voiceProfile.voiceName!.toLowerCase()) ||
            voiceProfile.voiceName!.toLowerCase().includes(v.name.toLowerCase())
          );
        }
        
        // If still not found, try to find a similar voice by gender/age
        if (!voice) {
          const targetName = voiceProfile.voiceName.toLowerCase();
          if (targetName.includes('female') || targetName.includes('woman') || targetName.includes('zira') || targetName.includes('susan')) {
            voice = this.voices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('susan') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'));
          } else if (targetName.includes('male') || targetName.includes('man') || targetName.includes('mark') || targetName.includes('david')) {
            voice = this.voices.find(v => v.name.toLowerCase().includes('mark') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('man'));
          }
        }
        
        // If still not found, use the first available voice as fallback
        if (!voice && this.voices.length > 0) {
          voice = this.voices[0];
          console.log(`🔄 Using fallback voice: ${voice.name} for ${voiceProfile.name}`);
        }
        
        if (voice) {
          utterance.voice = voice;
          console.log(`✅ Voice selected: ${voice.name} for ${voiceProfile.name}`, {
            voiceName: voice.name,
            voiceLang: voice.lang,
            voiceLocalService: voice.localService
          });
        } else {
          console.warn(`⚠️ Voice "${voiceProfile.voiceName}" not found, using default voice for ${voiceProfile.name}`);
          console.log('Available voices:', this.voices.map(v => v.name));
        }
      } else {
        console.log(`🎤 No specific voice requested for ${voiceProfile.name}, using default`);
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
        console.error('TTS error details:', {
          error: error.error,
          type: error.type,
          charIndex: error.charIndex,
          charCode: error.charCode,
          utterance: utterance.text.substring(0, 100) + '...'
        });
        
        // Try to recover from common TTS errors
        if (error.error === 'interrupted' || error.error === 'canceled') {
          console.log('🔄 TTS was interrupted or canceled, this is usually recoverable');
          resolve(); // Don't reject, just resolve
        } else {
          reject(error);
        }
      };

      this.synth!.speak(utterance);
    });
  }

}

/**
 * Story Character Voice Profiles
 * Each of the 8 stories uses actual Google/Microsoft voices
 */
export const STORY_VOICES: Record<string, VoiceProfile> = {
  // 1. Magic Forest Adventure - Luna (cheerful 6-year-old girl)
  Luna: {
    name: 'Luna',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira Desktop - English (United States)', // Microsoft's young female voice
    description: 'Sweet, gentle rabbit voice with magical wonder'
  },
  
  // 2. Space Adventure - Cosmo (excited 7-year-old boy)
  Cosmo: {
    name: 'Cosmo',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Mark Desktop - English (United States)', // Microsoft's young male voice
    description: 'Confident, adventurous astronaut voice'
  },
  
  // 3. Underwater World - Finn (gentle 6-year-old boy)
  Finn: {
    name: 'Finn',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft David Desktop - English (United States)', // Microsoft's young male voice
    description: 'Bubbly, cheerful fish voice with underwater flow'
  },
  
  // 4. Dinosaur Discovery - Dina (bold 8-year-old girl)
  Dina: {
    name: 'Dina',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira Desktop - English (United States)', // Microsoft's young female voice
    description: 'Curious, enthusiastic explorer voice with scientific wonder'
  },
  
  // 5. Unicorn Magic - Stardust (sweet 5-year-old girl)
  Stardust: {
    name: 'Stardust',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira Desktop - English (United States)', // Microsoft's young female voice
    description: 'Enchanting, graceful unicorn voice with dreamy magical quality'
  },
  
  // 6. Pirate Treasure - Captain Finn (brave 8-year-old boy)
  CaptainFinn: {
    name: 'Captain Finn',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Mark Desktop - English (United States)', // Microsoft's male voice
    description: 'Bold, adventurous pirate captain voice'
  },
  
  // 7. Superhero School - Captain Courage (determined 7-year-old)
  CaptainCourage: {
    name: 'Captain Courage',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Mark Desktop - English (United States)', // Microsoft's male voice
    description: 'Heroic, confident superhero voice with powerful determination'
  },
  
  // 8. Fairy Garden - Twinkle (whimsical 6-year-old girl)
  Twinkle: {
    name: 'Twinkle',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira Desktop - English (United States)', // Microsoft's young female voice
    description: 'Delicate, twinkling fairy voice with sweet magical tone'
  }
};

export default OnlineTTS;
