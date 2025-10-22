/*
  WhisperService: Offline speech-to-text using Whisper.cpp WebAssembly
  Falls back to Web Speech API if Whisper model isn't loaded
*/

export interface WhisperConfig {
  modelPath?: string;
  language?: string;
  useGPU?: boolean;
}

export interface WhisperResult {
  transcript: string;
  confidence: number;
  segments?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
  language?: string;
}

class WhisperServiceClass {
  private worker: Worker | null = null;
  private modelLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Initialize Whisper model (loads WASM and model weights)
   * Model is cached in IndexedDB for offline use
   */
  async initialize(config: WhisperConfig = {}): Promise<void> {
    if (this.modelLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = this._loadModel(config);
    return this.loadingPromise;
  }

  private async _loadModel(config: WhisperConfig): Promise<void> {
    try {
      // Check if model is cached
      const cached = await this.getCachedModel();
      
      if (!cached) {
        console.log('Whisper model not cached, will download on first use');
        // Don't block initialization - download lazily
        return;
      }

      // Create Web Worker for Whisper processing
      this.worker = new Worker(
        new URL('./workers/whisper.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Load model in worker
      await this.sendWorkerMessage({
        type: 'load',
        modelData: cached,
        config
      });

      this.modelLoaded = true;
      console.log('✅ Whisper model loaded successfully');
    } catch (error) {
      console.warn('⚠️ Whisper initialization failed, will use Web Speech API fallback:', error);
      this.modelLoaded = false;
    }
  }

  /**
   * Transcribe audio using Whisper
   * @param audioBlob - Audio data (WAV, MP3, etc.)
   * @param options - Transcription options
   */
  async transcribe(
    audioBlob: Blob,
    options: { language?: string; prompt?: string } = {}
  ): Promise<WhisperResult> {
    // If Whisper not loaded, use Web Speech API fallback
    if (!this.modelLoaded || !this.worker) {
      return this.fallbackToWebSpeech(audioBlob, options);
    }

    try {
      const audioBuffer = await audioBlob.arrayBuffer();
      
      const result = await this.sendWorkerMessage({
        type: 'transcribe',
        audioData: audioBuffer,
        language: options.language || 'en',
        prompt: options.prompt
      });

      return {
        transcript: result.text,
        confidence: result.confidence || 0.9,
        segments: result.segments,
        language: result.language
      };
    } catch (error) {
      console.warn('Whisper transcription failed, falling back to Web Speech API:', error);
      return this.fallbackToWebSpeech(audioBlob, options);
    }
  }

  /**
   * Fallback to browser's Web Speech API
   */
  private async fallbackToWebSpeech(
    _audioBlob: Blob,
    options: { language?: string }
  ): Promise<WhisperResult> {
    // Import existing SpeechService
    const { SpeechService } = await import('./SpeechService');
    
    if (!SpeechService.isSTTSupported()) {
      throw new Error('No speech recognition available');
    }

    const result = await SpeechService.startRecognition({
      lang: options.language || 'en-US',
      timeoutMs: 10000
    });

    return {
      transcript: result.transcript,
      confidence: result.confidence || 0.8,
      language: options.language || 'en'
    };
  }

  /**
   * Download and cache Whisper model
   */
  async downloadModel(
    modelUrl: string = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin',
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      const response = await fetch(modelUrl);
      if (!response.ok) throw new Error('Model download failed');

      const contentLength = parseInt(response.headers.get('content-length') || '0');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (onProgress && contentLength) {
          onProgress((receivedLength / contentLength) * 100);
        }
      }

      // Combine chunks
      const modelData = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        modelData.set(chunk, position);
        position += chunk.length;
      }

      // Cache in IndexedDB
      await this.cacheModel(modelData);
      console.log('✅ Whisper model downloaded and cached');

      // Initialize with cached model
      await this.initialize();
    } catch (error) {
      console.error('❌ Model download failed:', error);
      throw error;
    }
  }

  /**
   * Check if model is available offline
   */
  async isModelAvailable(): Promise<boolean> {
    const cached = await this.getCachedModel();
    return cached !== null;
  }

  /**
   * Get model size in MB
   */
  async getModelSize(): Promise<number> {
    const cached = await this.getCachedModel();
    if (!cached) return 0;
    return cached.byteLength / (1024 * 1024);
  }

  /**
   * Clear cached model
   */
  async clearModel(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('models', 'readwrite');
      const request = tx.objectStore('models').delete('whisper-tiny-en');
      
      request.onsuccess = () => {
        this.modelLoaded = false;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // IndexedDB helpers
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WhisperCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models');
        }
      };
    });
  }

  private async cacheModel(data: Uint8Array): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('models', 'readwrite');
      const request = tx.objectStore('models').put(data, 'whisper-tiny-en');
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getCachedModel(): Promise<Uint8Array | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('models', 'readonly');
        const request = tx.objectStore('models').get('whisper-tiny-en');
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  private sendWorkerMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
      }, 30000);

      this.worker.onmessage = (e) => {
        clearTimeout(timeout);
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data);
        }
      };

      this.worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

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
    this.modelLoaded = false;
    this.loadingPromise = null;
  }
}

// Singleton instance
export const WhisperService = new WhisperServiceClass();
export default WhisperService;

