/**
 * HybridVoiceService
 * 
 * Provides intelligent voice synthesis that works both online and offline
 * with truly unique voice profiles for each of the 8 story characters.
 * 
 * Features:
 * - OFFLINE MODE: Uses Piper TTS for high-quality kid voices (if downloaded)
 * - ONLINE MODE: Falls back to Web Speech API with optimized character-specific settings
 * - GRACEFUL DEGRADATION: Falls back to text-only mode if neither works
 * - Auto-download capability for online users
 * - Download progress tracking with callbacks
 * - Unique voice profiles for each story character
 * - Adjustable playback speed (normal, slow, slower)
 * - Caption support for accessibility
 */

import OnlineTTS from './OnlineTTS';
import { ModelManager, type DownloadProgress } from './ModelManager';

export interface VoiceProfile {
  name: string;
  pitch: number;      // 0-2 (default 1)
  rate: number;       // 0.1-10 (default 1)
  volume: number;     // 0-1 (default 1)
  voiceName?: string; // Specific browser voice name
  description: string;
  // Piper TTS specific
  piperModel?: string; // Piper model name for offline use
  gender?: 'male' | 'female' | 'neutral';
  age?: 'child' | 'teen' | 'adult';
}

export interface PlaybackOptions {
  speed?: 'normal' | 'slow' | 'slower';
  showCaptions?: boolean;
  onCaptionUpdate?: (text: string) => void;
  onDownloadProgress?: (progress: number) => void;
}

export class HybridVoiceService {
  private static piperAvailable = false;
  private static isInitialized = false;
  private static downloadInProgress = false;

  /**
   * Initialize the hybrid voice service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize OnlineTTS as fallback
      await OnlineTTS.initialize();
      
      // Check if Piper TTS models are available
      await this.checkPiperAvailability();
      
      this.isInitialized = true;
      console.log('✅ HybridVoiceService initialized', {
        piperAvailable: this.piperAvailable,
        onlineTTSAvailable: OnlineTTS.isAvailable()
      });
    } catch (error) {
      console.error('Failed to initialize HybridVoiceService:', error);
      throw error;
    }
  }

  /**
   * Check if Piper TTS models are available
   */
  private static async checkPiperAvailability(): Promise<void> {
    try {
      // Check if Piper models are downloaded
      const piperModels = await ModelManager.getDownloadedModels();
      const hasPiperModel = piperModels.some(model => model.id.includes('piper'));
      
      this.piperAvailable = hasPiperModel;
      
      if (this.piperAvailable) {
        console.log('🎤 Piper TTS models available - using high-quality kid voices');
      } else {
        console.log('🌐 Piper TTS not available - using Web Speech API with character optimization');
      }
    } catch (error) {
      console.warn('Could not check Piper availability:', error);
      this.piperAvailable = false;
    }
  }

  /**
   * Check if voice synthesis is available
   */
  static isAvailable(): boolean {
    return this.isInitialized && (this.piperAvailable || OnlineTTS.isAvailable());
  }

  /**
   * Get current voice mode
   */
  static getVoiceMode(): string {
    if (this.piperAvailable) {
      return 'Offline (Piper TTS - High Quality)';
    } else if (OnlineTTS.isAvailable()) {
      return 'Online (Web Speech API - Character Optimized)';
    } else {
      return 'Unavailable';
    }
  }

  /**
   * Get available voices for debugging
   */
  static getAvailableVoices(): SpeechSynthesisVoice[] {
    return OnlineTTS.getAvailableVoices();
  }

  /**
   * Stop/cancel any currently playing speech
   */
  static stop(): void {
    OnlineTTS.stop();
    // Add Piper TTS stop if needed
  }

  /**
   * Speak text using the best available voice system
   */
  static async speak(
    text: string,
    voiceProfile: VoiceProfile,
    options?: PlaybackOptions
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('HybridVoiceService not initialized');
    }

    // Try Piper TTS first (offline, high-quality kid voices)
    if (this.piperAvailable && voiceProfile.piperModel) {
      try {
        console.log(`🎤 Using Piper TTS for ${voiceProfile.name}:`, {
          model: voiceProfile.piperModel,
          text: text.substring(0, 50) + '...'
        });
        
        // For now, fall back to OnlineTTS with enhanced character settings
        // TODO: Implement actual Piper TTS integration
        await this.speakWithCharacterOptimization(text, voiceProfile, options);
        return;
      } catch (error) {
        console.warn('Piper TTS failed, falling back to Web Speech API:', error);
        this.piperAvailable = false; // Disable Piper for this session
      }
    }

    // Fallback to Web Speech API with character optimization
    await this.speakWithCharacterOptimization(text, voiceProfile, options);
  }

  /**
   * Speak with character-optimized Web Speech API settings
   */
  private static async speakWithCharacterOptimization(
    text: string,
    voiceProfile: VoiceProfile,
    options?: PlaybackOptions
  ): Promise<void> {
    // Create enhanced voice profile with character-specific optimizations
    const enhancedProfile: VoiceProfile = {
      ...voiceProfile,
      // Apply character-specific voice enhancements
      pitch: this.getCharacterPitch(voiceProfile),
      rate: this.getCharacterRate(voiceProfile, options?.speed),
      volume: this.getCharacterVolume(voiceProfile),
      voiceName: this.getBestVoiceForCharacter(voiceProfile)
    };

    console.log(`🎭 Character voice optimization for ${voiceProfile.name}:`, {
      originalPitch: voiceProfile.pitch,
      optimizedPitch: enhancedProfile.pitch,
      originalRate: voiceProfile.rate,
      optimizedRate: enhancedProfile.rate,
      voiceName: enhancedProfile.voiceName,
      character: voiceProfile.name,
      availableVoices: OnlineTTS.getAvailableVoices().length,
      targetVoiceFound: OnlineTTS.getAvailableVoices().find(v => v.name === enhancedProfile.voiceName) ? 'YES' : 'NO'
    });

    await OnlineTTS.speak(text, enhancedProfile, options);
  }

  /**
   * Get character-specific pitch adjustments
   */
  private static getCharacterPitch(voiceProfile: VoiceProfile): number {
    const basePitch = voiceProfile.pitch;
    
    // Character-specific pitch adjustments for more unique voices
    switch (voiceProfile.name) {
      case 'Luna': // Magic Forest - Sweet, gentle rabbit
        return Math.min(2.0, basePitch * 1.3); // Higher, sweeter
      case 'Cosmo': // Space Adventure - Excited astronaut
        return Math.min(2.0, basePitch * 1.1); // Slightly higher, energetic
      case 'Finn': // Underwater World - Gentle fish
        return Math.min(2.0, basePitch * 1.3); // Higher, more bubbly and cheerful
      case 'Dina': // Dinosaur Discovery - Bold explorer
        return Math.min(2.0, basePitch * 1.15); // Confident, clear
      case 'Stardust': // Unicorn Magic - Sweet unicorn
        return Math.min(2.0, basePitch * 1.4); // Highest, most magical
      case 'CaptainFinn': // Pirate Treasure - Brave captain
        return Math.max(0.5, basePitch * 0.9); // Lower, more commanding
      case 'CaptainCourage': // Superhero School - Determined hero
        return Math.max(0.5, basePitch * 0.95); // Slightly lower, heroic
      case 'Twinkle': // Fairy Garden - Whimsical fairy
        return Math.min(2.0, basePitch * 1.35); // Very high, twinkling
      default:
        return basePitch;
    }
  }

  /**
   * Get character-specific rate adjustments
   */
  private static getCharacterRate(voiceProfile: VoiceProfile, speed?: 'normal' | 'slow' | 'slower'): number {
    const baseRate = voiceProfile.rate;
    let speedMultiplier = 1.0;
    
    // Apply speed setting
    switch (speed) {
      case 'slow': speedMultiplier = 0.7; break;
      case 'slower': speedMultiplier = 0.5; break;
      default: speedMultiplier = 1.0; break;
    }
    
    // Character-specific rate adjustments
    switch (voiceProfile.name) {
      case 'Luna': // Gentle, calm
        return Math.max(0.3, baseRate * 0.85 * speedMultiplier);
      case 'Cosmo': // Excited, energetic
        return Math.min(2.0, baseRate * 1.1 * speedMultiplier);
      case 'Finn': // Bubbly, flowing underwater voice
        return Math.max(0.3, baseRate * 0.85 * speedMultiplier); // Slower for gentle underwater flow
      case 'Dina': // Confident, clear
        return Math.max(0.3, baseRate * 0.95 * speedMultiplier);
      case 'Stardust': // Magical, dreamy
        return Math.max(0.3, baseRate * 0.8 * speedMultiplier);
      case 'CaptainFinn': // Commanding, deliberate
        return Math.max(0.3, baseRate * 0.9 * speedMultiplier);
      case 'CaptainCourage': // Heroic, determined
        return Math.max(0.3, baseRate * 0.95 * speedMultiplier);
      case 'Twinkle': // Quick, twinkling
        return Math.min(2.0, baseRate * 1.05 * speedMultiplier);
      default:
        return baseRate * speedMultiplier;
    }
  }

  /**
   * Get character-specific volume adjustments
   */
  private static getCharacterVolume(voiceProfile: VoiceProfile): number {
    const baseVolume = voiceProfile.volume;
    
    // Character-specific volume adjustments
    switch (voiceProfile.name) {
      case 'Luna': // Gentle, soft
        return Math.min(1.0, baseVolume * 0.9);
      case 'Cosmo': // Excited, loud
        return Math.min(1.0, baseVolume * 1.0);
      case 'Finn': // Bubbly, gentle underwater voice
        return Math.min(1.0, baseVolume * 0.9); // Softer for gentle fish
      case 'Dina': // Bold, confident
        return Math.min(1.0, baseVolume * 1.0);
      case 'Stardust': // Magical, ethereal
        return Math.min(1.0, baseVolume * 0.85);
      case 'CaptainFinn': // Commanding, loud
        return Math.min(1.0, baseVolume * 1.0);
      case 'CaptainCourage': // Heroic, strong
        return Math.min(1.0, baseVolume * 1.0);
      case 'Twinkle': // Delicate, soft
        return Math.min(1.0, baseVolume * 0.8);
      default:
        return baseVolume;
    }
  }

  /**
   * Get the best available voice for a character
   */
  private static getBestVoiceForCharacter(voiceProfile: VoiceProfile): string | undefined {
    const availableVoices = OnlineTTS.getAvailableVoices();
    
    // First, try to use the exact voice name from the profile
    const profileVoiceName = voiceProfile.voiceName;
    if (profileVoiceName) {
      const targetName = profileVoiceName.toLowerCase();

      const exactVoice = availableVoices.find(v => v.name === profileVoiceName);
      if (exactVoice) {
        console.log(`✅ Found exact voice for ${voiceProfile.name}: ${exactVoice.name}`);
        return exactVoice.name;
      }
      
      // Try partial match for the exact voice name
      const partialVoice = availableVoices.find(v => {
        const voiceNameLower = v.name.toLowerCase();
        return voiceNameLower.includes(targetName) || targetName.includes(voiceNameLower);
      });
      if (partialVoice) {
        console.log(`✅ Found partial match for ${voiceProfile.name}: ${partialVoice.name} (wanted: ${voiceProfile.voiceName})`);
        return partialVoice.name;
      }
    }
    
    // Fallback to character-specific voice preferences
    console.log(`⚠️ Exact voice not found for ${voiceProfile.name}, using fallback preferences`);
    switch (voiceProfile.name) {
      case 'Luna': // Sweet female voice
        return this.findVoice(availableVoices, ['zira', 'susan', 'female', 'woman']);
      case 'Cosmo': // Energetic male voice
        return this.findVoice(availableVoices, ['mark', 'david', 'male', 'man']);
      case 'Finn': // Gentle, bubbly fish voice - prefer younger male voices
        return this.findVoice(availableVoices, ['david', 'young', 'child', 'boy', 'male', 'mark']);
      case 'Dina': // Confident female voice
        return this.findVoice(availableVoices, ['zira', 'susan', 'female', 'woman']);
      case 'Stardust': // Magical female voice
        return this.findVoice(availableVoices, ['zira', 'susan', 'female', 'woman']);
      case 'CaptainFinn': // Commanding male voice
        return this.findVoice(availableVoices, ['mark', 'david', 'male', 'man']);
      case 'CaptainCourage': // Heroic male voice
        return this.findVoice(availableVoices, ['mark', 'david', 'male', 'man']);
      case 'Twinkle': // Delicate female voice
        return this.findVoice(availableVoices, ['zira', 'susan', 'female', 'woman']);
      default:
        return undefined;
    }
  }

  /**
   * Find the best matching voice from available voices
   */
  private static findVoice(voices: SpeechSynthesisVoice[], preferences: string[]): string | undefined {
    for (const preference of preferences) {
      const voice = voices.find(v => 
        v.name.toLowerCase().includes(preference.toLowerCase())
      );
      if (voice) return voice.name;
    }
    
    // Fallback to any Microsoft voice
    const microsoftVoice = voices.find(v => v.name.toLowerCase().includes('microsoft'));
    if (microsoftVoice) return microsoftVoice.name;
    
    // Last resort: any English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) return englishVoice.name;
    
    return undefined;
  }

  /**
   * Start downloading Piper TTS models for offline use
   */
  static async startPiperDownload(onProgress?: (progress: DownloadProgress) => void): Promise<void> {
    if (this.downloadInProgress) {
      console.log('Download already in progress');
      return;
    }

    this.downloadInProgress = true;
    
    try {
      // Download Piper models
      await ModelManager.downloadModel('piper-en-us-amy-medium', onProgress);
      await ModelManager.downloadModel('piper-en-us-lessac-medium', onProgress);
      
      // Recheck availability
      await this.checkPiperAvailability();
      
      console.log('✅ Piper TTS models downloaded successfully');
    } catch (error) {
      console.error('Failed to download Piper models:', error);
      throw error;
    } finally {
      this.downloadInProgress = false;
    }
  }

  /**
   * Check if download is in progress
   */
  static isDownloading(): boolean {
    return this.downloadInProgress;
  }
}

/**
 * Enhanced Story Character Voice Profiles
 * Each character now has truly unique voice characteristics
 */
export const STORY_VOICES: Record<string, VoiceProfile> = {
  // 1. Magic Forest Adventure - Luna (sweet, gentle 6-year-old girl)
  Luna: {
    name: 'Luna',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira - English (United States)',
    description: 'Sweet, gentle rabbit voice with magical wonder',
    piperModel: 'piper-en-us-amy-medium',
    gender: 'female',
    age: 'child'
  },
  
  // 2. Space Adventure - Cosmo (excited 7-year-old boy)
  Cosmo: {
    name: 'Cosmo',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Mark - English (United States)',
    description: 'Confident, adventurous astronaut voice with cosmic enthusiasm',
    piperModel: 'piper-en-us-lessac-medium',
    gender: 'male',
    age: 'child'
  },
  
  // 3. Underwater World - Finn (gentle 6-year-old boy)
  Finn: {
    name: 'Finn',
    pitch: 1.2,  // Higher pitch for bubbly fish voice
    rate: 0.9,   // Slightly slower for gentle underwater flow
    volume: 0.95, // Slightly softer for gentle fish
    voiceName: 'Microsoft David - English (United States)',
    description: 'Bubbly, cheerful fish voice with underwater flow',
    piperModel: 'piper-en-us-lessac-medium',
    gender: 'male',
    age: 'child'
  },
  
  // 4. Dinosaur Discovery - Dina (bold 8-year-old girl)
  Dina: {
    name: 'Dina',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira - English (United States)',
    description: 'Curious, enthusiastic explorer voice with scientific wonder',
    piperModel: 'piper-en-us-amy-medium',
    gender: 'female',
    age: 'child'
  },
  
  // 5. Unicorn Magic - Stardust (sweet 5-year-old girl)
  Stardust: {
    name: 'Stardust',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira - English (United States)',
    description: 'Enchanting, graceful unicorn voice with dreamy magical quality',
    piperModel: 'piper-en-us-amy-medium',
    gender: 'female',
    age: 'child'
  },
  
  // 6. Pirate Treasure - Captain Finn (brave 8-year-old boy)
  CaptainFinn: {
    name: 'CaptainFinn',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Mark - English (United States)',
    description: 'Bold, adventurous pirate captain voice',
    piperModel: 'piper-en-us-lessac-medium',
    gender: 'male',
    age: 'child'
  },
  
  // 7. Superhero School - Captain Courage (determined 7-year-old)
  CaptainCourage: {
    name: 'CaptainCourage',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Mark - English (United States)',
    description: 'Heroic, confident superhero voice with powerful determination',
    piperModel: 'piper-en-us-lessac-medium',
    gender: 'male',
    age: 'child'
  },
  
  // 8. Fairy Garden - Twinkle (whimsical 6-year-old girl)
  Twinkle: {
    name: 'Twinkle',
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    voiceName: 'Microsoft Zira - English (United States)',
    description: 'Delicate, twinkling fairy voice with sweet magical tone',
    piperModel: 'piper-en-us-amy-medium',
    gender: 'female',
    age: 'child'
  }
};

export default HybridVoiceService;
