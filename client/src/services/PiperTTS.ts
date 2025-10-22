/*
  PiperTTS: High-quality offline TTS using Piper (Coqui successor)
  Piper is a fast, local neural TTS system that runs on CPU
  Uses ONNX models for efficient inference
  
  Integration Guide:
  1. Download Piper voices from https://github.com/rhasspy/piper
  2. Serve ONNX models via ModelManager
  3. Use Web Audio API for playback
*/

import { ModelManager } from './ModelManager';
import { VoiceModelManager } from './VoiceModelManager';

export interface PiperVoice {
  id: string;
  name: string;
  language: string;
  quality: 'low' | 'medium' | 'high';
  speaker?: string;
  gender: 'male' | 'female' | 'neutral';
  sampleRate: number;
  modelUrl: string;
  configUrl: string;
}

export interface PiperTTSOptions {
  voice?: string;
  speakingRate?: number; // 0.5 - 2.0
  pitch?: number; // -10 to +10 semitones
  volumeGainDb?: number; // Volume adjustment in dB
  sentenceSilence?: number; // Silence between sentences (seconds)
  lengthScale?: number; // Speech duration multiplier
  noiseScale?: number; // Variation in speech
  noiseW?: number; // Variation in duration
}

class PiperTTSClass {
  private worker: Worker | null = null;
  private audioContext: AudioContext | null = null;
  private isInitialized = false;
  private currentVoice: string | null = null;

  // Available Piper voices (these would be hosted or bundled)
  private availableVoices: PiperVoice[] = [
    {
      id: 'en-us-lessac-medium',
      name: 'Lessac (US English)',
      language: 'en-US',
      quality: 'medium',
      gender: 'male',
      sampleRate: 22050,
      modelUrl: 'https://your-cdn.com/piper-voices/en_US-lessac-medium.onnx',
      configUrl: 'https://your-cdn.com/piper-voices/en_US-lessac-medium.json'
    },
    {
      id: 'en-us-amy-medium',
      name: 'Amy (US English)',
      language: 'en-US',
      quality: 'medium',
      gender: 'female',
      sampleRate: 22050,
      modelUrl: 'https://your-cdn.com/piper-voices/en_US-amy-medium.onnx',
      configUrl: 'https://your-cdn.com/piper-voices/en_US-amy-medium.json'
    },
    {
      id: 'en-gb-alan-medium',
      name: 'Alan (British English)',
      language: 'en-GB',
      quality: 'medium',
      gender: 'male',
      sampleRate: 22050,
      modelUrl: 'https://your-cdn.com/piper-voices/en_GB-alan-medium.onnx',
      configUrl: 'https://your-cdn.com/piper-voices/en_GB-alan-medium.json'
    }
  ];

  /**
   * Get voice model from VoiceModelManager (for hybrid voice system)
   */
  private async getVoiceFromVoiceModelManager(voiceModelId: string): Promise<ArrayBuffer | null> {
    try {
      // Try to get from VoiceModelManager's cache
      // VoiceModelManager stores with IDs like 'piper-en-us-lessac-medium'
      const cached = await VoiceModelManager.getCachedModel(voiceModelId);
      if (cached) {
        // Convert Uint8Array to ArrayBuffer (slice creates a copy)
        return cached.buffer.slice(0) as ArrayBuffer;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Initialize Piper TTS
   */
  async initialize(voiceId?: string): Promise<void> {
    try {
      // Create audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Select voice
      const voice = voiceId 
        ? this.availableVoices.find(v => v.id === voiceId)
        : this.availableVoices[0];

      if (!voice) {
        throw new Error('Voice not found');
      }

      // Check if voice model is cached (try VoiceModelManager first for new downloads)
      const voiceModelId = `piper-${voice.id}`;
      let voiceData: ArrayBuffer | null = null;
      
      // Try VoiceModelManager (for HybridVoiceService downloads)
      try {
        voiceData = await this.getVoiceFromVoiceModelManager(voiceModelId);
      } catch (error) {
        console.log('Voice not in VoiceModelManager, trying ModelManager...');
      }
      
      // Fallback to ModelManager (for legacy/AI Tutor system)
      if (!voiceData) {
        const modelCached = await ModelManager.isModelCached(voiceModelId);
        if (modelCached) {
          const modelData = await ModelManager.getModelData(voiceModelId);
          if (modelData) {
            voiceData = modelData.buffer.slice(0) as ArrayBuffer;
          }
        }
      }
      
      if (!voiceData) {
        console.log(`Piper voice not cached: ${voice.name}`);
        console.warn('⚠️ Voice model not found. Will use Web Speech API fallback.');
        this.isInitialized = false;
        return;
      }

      // Create worker for Piper inference
      this.worker = new Worker(
        new URL('./workers/piper.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Load voice in worker (voiceData already checked above)

      await this.sendWorkerMessage({
        type: 'load',
        voiceData,
        voiceConfig: voice
      });

      this.currentVoice = voice.id;
      this.isInitialized = true;
      console.log(`✅ Piper TTS initialized with voice: ${voice.name}`);
    } catch (error) {
      console.error('Failed to initialize Piper TTS:', error);
      console.log('Falling back to Web Speech API');
      this.isInitialized = false;
    }
  }

  /**
   * Synthesize speech
   */
  async speak(text: string, options: PiperTTSOptions = {}): Promise<void> {
    if (!this.isInitialized || !this.worker || !this.audioContext) {
      // Fallback to Web Speech API
      return this.fallbackToWebSpeech(text, options);
    }

    try {
      // Send text to worker for synthesis
      const result = await this.sendWorkerMessage({
        type: 'synthesize',
        text,
        options: {
          speakingRate: options.speakingRate || 1.0,
          lengthScale: options.lengthScale || 1.0,
          noiseScale: options.noiseScale || 0.667,
          noiseW: options.noiseW || 0.8,
          sentenceSilence: options.sentenceSilence || 0.2
        }
      });

      // Play audio
      await this.playAudio(result.audioData, options);
    } catch (error) {
      console.error('Piper synthesis failed:', error);
      // Fallback
      await this.fallbackToWebSpeech(text, options);
    }
  }

  /**
   * Synthesize and return audio blob (for recording/download)
   */
  async synthesizeToBlob(text: string, options: PiperTTSOptions = {}): Promise<Blob> {
    if (!this.isInitialized || !this.worker) {
      throw new Error('Piper TTS not initialized');
    }

    try {
      const result = await this.sendWorkerMessage({
        type: 'synthesize',
        text,
        options
      });

      // Convert Float32Array to WAV blob
      return this.audioDataToWav(
        result.audioData,
        this.availableVoices.find(v => v.id === this.currentVoice)?.sampleRate || 22050
      );
    } catch (error) {
      console.error('Synthesis to blob failed:', error);
      throw error;
    }
  }

  /**
   * Play audio data
   */
  private async playAudio(audioData: Float32Array, options: PiperTTSOptions): Promise<void> {
    if (!this.audioContext) return;

    const voice = this.availableVoices.find(v => v.id === this.currentVoice);
    const sampleRate = voice?.sampleRate || 22050;

    // Create audio buffer
    const audioBuffer = this.audioContext.createBuffer(
      1, // mono
      audioData.length,
      sampleRate
    );

    audioBuffer.getChannelData(0).set(audioData);

    // Create source
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Apply pitch shift if requested
    if (options.pitch && options.pitch !== 0) {
      source.detune.value = options.pitch * 100; // Convert semitones to cents
    }

    // Apply playback rate
    if (options.speakingRate && options.speakingRate !== 1.0) {
      source.playbackRate.value = options.speakingRate;
    }

    // Apply volume
    const gainNode = this.audioContext.createGain();
    if (options.volumeGainDb) {
      gainNode.gain.value = Math.pow(10, options.volumeGainDb / 20);
    }

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Play
    return new Promise((resolve) => {
      source.onended = () => resolve();
      source.start(0);
    });
  }

  /**
   * Convert audio data to WAV blob
   */
  private audioDataToWav(audioData: Float32Array, sampleRate: number): Blob {
    const numChannels = 1;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const buffer = new ArrayBuffer(44 + audioData.length * bytesPerSample);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + audioData.length * bytesPerSample, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Format chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, audioData.length * bytesPerSample, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.max(-1, Math.min(1, audioData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  /**
   * Fallback to Web Speech API
   */
  private async fallbackToWebSpeech(text: string, options: PiperTTSOptions): Promise<void> {
    const { EnhancedTTS } = await import('./EnhancedTTS');
    
    await EnhancedTTS.speak(text, {
      rate: options.speakingRate || 1.0,
      pitch: options.pitch ? 1.0 + (options.pitch / 10) : 1.0,
      volume: options.volumeGainDb ? Math.pow(10, options.volumeGainDb / 20) : 1.0
    });
  }

  /**
   * Get available voices
   */
  getVoices(): PiperVoice[] {
    return [...this.availableVoices];
  }

  /**
   * Get voices by language
   */
  getVoicesByLanguage(language: string): PiperVoice[] {
    return this.availableVoices.filter(v => v.language.startsWith(language));
  }

  /**
   * Get recommended voice for user level
   */
  getRecommendedVoice(userLevel: 'beginner' | 'intermediate' | 'advanced'): PiperVoice | null {
    // For beginners, prefer clearer, slower voices
    if (userLevel === 'beginner') {
      return this.availableVoices.find(v => v.gender === 'female') || this.availableVoices[0];
    }

    return this.availableVoices[0];
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if a voice is available
   */
  async isVoiceAvailable(voiceId: string): Promise<boolean> {
    return await ModelManager.isModelCached(`piper-${voiceId}`);
  }

  /**
   * Download a voice
   */
  async downloadVoice(
    voiceId: string,
    _onProgress?: (progress: number) => void
  ): Promise<void> {
    const voice = this.availableVoices.find(v => v.id === voiceId);
    if (!voice) {
      throw new Error('Voice not found');
    }

    // Download ONNX model
    console.log(`Downloading ${voice.name}...`);
    
    // In production, this would:
    // 1. Fetch the ONNX model from voice.modelUrl
    // 2. Fetch the config from voice.configUrl
    // 3. Cache both in ModelManager
    
    console.warn('⚠️ Voice download not yet implemented');
    console.log('To add Piper voices:');
    console.log('1. Download from: https://github.com/rhasspy/piper/releases');
    console.log('2. Host ONNX files on your CDN');
    console.log('3. Update availableVoices URLs');
  }

  /**
   * Send message to worker
   */
  private sendWorkerMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
      }, 30000);

      const messageHandler = (e: MessageEvent) => {
        clearTimeout(timeout);
        this.worker?.removeEventListener('message', messageHandler);
        
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data);
        }
      };

      this.worker.addEventListener('message', messageHandler);
      this.worker.postMessage(message);
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
    this.currentVoice = null;
  }
}

// Singleton instance
export const PiperTTS = new PiperTTSClass();
export default PiperTTS;

