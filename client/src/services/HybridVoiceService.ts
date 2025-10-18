/**
 * HybridVoiceService
 * 
 * Provides intelligent voice synthesis that works both online and offline:
 * - OFFLINE: Uses Piper TTS for high-quality kid voices (if downloaded)
 * - ONLINE: Falls back to Web Speech API with optimized settings
 * - GRACEFUL DEGRADATION: Falls back to text-only mode if neither works
 * 
 * Features:
 * - Real kid voices for each story character (offline)
 * - Adjustable playback speed
 * - Caption support
 * - Multi-language support
 */

import PiperTTS from './PiperTTS';
import SpeechService from './SpeechService';

export interface VoiceProfile {
  name: string;
  pitch: number;
  rate: number;
  volume: number;
  piperModel?: string; // Piper voice model for offline (e.g., 'en_US-libritts_r-medium')
}

export interface PlaybackOptions {
  speed?: 'normal' | 'slow' | 'slower';
  showCaptions?: boolean;
  onCaptionUpdate?: (text: string) => void;
}

export interface DownloadStatus {
  downloading: boolean;
  progress: number; // 0-100
  modelName: string;
  error?: string;
}

export class HybridVoiceService {
  private static piperInitialized = false;
  private static piperAvailable = false;
  private static downloadStatus: DownloadStatus = {
    downloading: false,
    progress: 0,
    modelName: ''
  };
  private static downloadCallbacks: ((status: DownloadStatus) => void)[] = [];

  /**
   * Initialize Piper TTS for offline use
   * For online users without models, automatically starts download
   */
  static async initialize(): Promise<boolean> {
    if (this.piperInitialized) return this.piperAvailable;
    
    try {
      // Try to initialize Piper TTS (will fallback internally if not available)
      await PiperTTS.initialize();
      this.piperAvailable = true;
      this.piperInitialized = true;
      
      console.log('✅ Piper TTS initialized for offline kid voices');
      return true;
    } catch (error) {
      console.log('ℹ️ Piper TTS not available');
      
      // Check if user is online and can auto-download
      if (navigator.onLine) {
        console.log('🌐 Online user detected. Starting auto-download of kid voices...');
        this.startBackgroundDownload().catch(err => 
          console.log('Background download will retry later:', err)
        );
      } else {
        console.log('📴 Offline mode - will use Web Speech API fallback');
      }
      
      this.piperAvailable = false;
      this.piperInitialized = true;
      return false;
    }
  }

  /**
   * Start background download of Piper kid voice models
   */
  private static async startBackgroundDownload(): Promise<void> {
    try {
      this.downloadStatus = {
        downloading: true,
        progress: 0,
        modelName: 'Kid Voice Pack'
      };
      this.notifyDownloadProgress();

      // Import VoiceModelManager dynamically to avoid circular dependencies
      const { VoiceModelManager } = await import('./VoiceModelManager');
      
      // Download lightweight kid voice model (~8-15MB)
      const modelId = 'piper-en-us-lessac-medium'; // Lightweight kid-friendly voice
      
      await VoiceModelManager.downloadModel(modelId, (progress) => {
        this.downloadStatus.progress = progress.percentage;
        this.notifyDownloadProgress();
        
        if (progress.percentage % 20 === 0) {
          console.log(`📥 Downloading kid voices: ${progress.percentage.toFixed(0)}%`);
        }
      });

      // Reinitialize Piper with new model
      await PiperTTS.initialize();
      this.piperAvailable = true;
      
      this.downloadStatus = {
        downloading: false,
        progress: 100,
        modelName: 'Kid Voice Pack'
      };
      this.notifyDownloadProgress();
      
      console.log('✅ Kid voices downloaded! Now works offline too! 🎉');
      console.log('💡 Story will use high-quality kid voices from now on');
      
    } catch (error) {
      console.error('Failed to download kid voices:', error);
      this.downloadStatus = {
        downloading: false,
        progress: 0,
        modelName: '',
        error: 'Download failed. Using browser voices instead.'
      };
      this.notifyDownloadProgress();
    }
  }

  /**
   * Subscribe to download progress updates
   */
  static onDownloadProgress(callback: (status: DownloadStatus) => void): () => void {
    this.downloadCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.downloadCallbacks = this.downloadCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of download progress
   */
  private static notifyDownloadProgress(): void {
    this.downloadCallbacks.forEach(cb => cb(this.downloadStatus));
  }

  /**
   * Get current download status
   */
  static getDownloadStatus(): DownloadStatus {
    return { ...this.downloadStatus };
  }

  /**
   * Check if voice synthesis is available (either Piper or Web Speech)
   */
  static isAvailable(): boolean {
    return this.piperAvailable || SpeechService.isTTSSupported();
  }

  /**
   * Get adjusted playback rate based on speed setting
   * Updated with more pronounced speed differences for better kid comprehension
   */
  private static getAdjustedRate(baseRate: number, speed: 'normal' | 'slow' | 'slower'): number {
    switch (speed) {
      case 'slow': return baseRate * 0.7;    // 30% slower - noticeably slower
      case 'slower': return baseRate * 0.5;  // 50% slower - very slow for maximum comprehension
      default: return baseRate;               // Normal speed
    }
  }

  /**
   * Stop/cancel any currently playing speech
   */
  static stop(): void {
    try {
      // Stop Piper TTS if available and has stop method
      if (this.piperAvailable && typeof (PiperTTS as any).stop === 'function') {
        (PiperTTS as any).stop();
      }
      
      // Stop Web Speech API if available
      if (typeof (SpeechService as any).stopSpeaking === 'function') {
        (SpeechService as any).stopSpeaking();
      } else if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Fallback to direct speechSynthesis cancel
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      // Silently handle errors - stopping speech is not critical
      console.log('Could not stop speech:', error);
    }
  }

  /**
   * Speak text using the best available method
   * Prioritizes Piper TTS offline, falls back to Web Speech API
   */
  static async speak(
    text: string,
    voiceProfile: VoiceProfile,
    options?: PlaybackOptions
  ): Promise<void> {
    const speed = options?.speed || 'normal';
    const adjustedRate = this.getAdjustedRate(voiceProfile.rate, speed);

    // Show caption if requested
    if (options?.showCaptions && options?.onCaptionUpdate) {
      options.onCaptionUpdate(text);
    }

    try {
      // Try Piper TTS first (offline, high-quality kid voices)
      if (this.piperAvailable && voiceProfile.piperModel) {
        await PiperTTS.speak(text, {
          voice: voiceProfile.piperModel,
          lengthScale: 1.0 / adjustedRate, // Convert rate to Piper's length scale
          noiseScale: 0.667,
          noiseW: 0.8
        });
        return;
      }

      // Fallback to Web Speech API (online/browser native)
      await SpeechService.speak(text, {
        pitch: voiceProfile.pitch,
        rate: adjustedRate,
        volume: voiceProfile.volume
      });
    } catch (error) {
      console.error('Voice synthesis failed:', error);
      throw error;
    } finally {
      // Clear caption after delay
      if (options?.showCaptions && options?.onCaptionUpdate) {
        setTimeout(() => options.onCaptionUpdate?.(''), 500);
      }
    }
  }

  /**
   * Get voice mode (tells us what's being used)
   */
  static getVoiceMode(): 'piper-offline' | 'webspeech-online' | 'text-only' {
    if (this.piperAvailable) return 'piper-offline';
    if (SpeechService.isTTSSupported()) return 'webspeech-online';
    return 'text-only';
  }
}

/**
 * Story Character Voice Profiles
 * Each character has unique settings for expressive storytelling
 */
export const STORY_VOICES: Record<string, VoiceProfile> = {
  // Magic Forest - Luna (cheerful 6-year-old girl)
  Luna: {
    name: 'Luna',
    pitch: 1.2,
    rate: 0.9,
    volume: 1.0,
    piperModel: 'en_US-amy-medium' // Piper kid voice (if available)
  },
  
  // Space Adventure - Cosmo (excited 7-year-old boy)
  Cosmo: {
    name: 'Cosmo',
    pitch: 1.1,
    rate: 1.0,
    volume: 1.0,
    piperModel: 'en_US-ryan-medium'
  },
  
  // Underwater World - Finn (gentle 6-year-old boy)
  Finn: {
    name: 'Finn',
    pitch: 1.0,
    rate: 0.85,
    volume: 1.0,
    piperModel: 'en_US-ryan-low'
  },
  
  // Dinosaur Discovery - Dina (bold 8-year-old girl)
  Dina: {
    name: 'Dina',
    pitch: 1.15,
    rate: 1.05,
    volume: 1.0,
    piperModel: 'en_US-amy-high'
  },
  
  // Unicorn Magic - Stardust (sweet 5-year-old girl)
  Stardust: {
    name: 'Stardust',
    pitch: 1.25,
    rate: 0.88,
    volume: 1.0,
    piperModel: 'en_US-amy-medium'
  },
  
  // Pirate Treasure - Captain Finn (brave 8-year-old boy)
  CaptainFinn: {
    name: 'Captain Finn',
    pitch: 1.05,
    rate: 0.95,
    volume: 1.0,
    piperModel: 'en_US-ryan-medium'
  },
  
  // Superhero School - Captain Courage (determined 7-year-old)
  CaptainCourage: {
    name: 'Captain Courage',
    pitch: 1.08,
    rate: 1.0,
    volume: 1.0,
    piperModel: 'en_US-ryan-high'
  },
  
  // Fairy Garden - Twinkle (whimsical 6-year-old girl)
  Twinkle: {
    name: 'Twinkle',
    pitch: 1.22,
    rate: 0.92,
    volume: 1.0,
    piperModel: 'en_US-amy-medium'
  }
};

export default HybridVoiceService;

