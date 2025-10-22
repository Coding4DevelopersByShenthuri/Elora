/*
  ModelManager: Central service for managing offline AI models
  Handles downloading, caching, quantization, and version management
  Supports Whisper, DistilGPT-2, and other transformer models
*/

export interface ModelInfo {
  id: string;
  name: string;
  type: 'stt' | 'llm' | 'tts' | 'embedding';
  size: number; // in bytes
  quantization?: '4bit' | '8bit' | '16bit' | 'fp32';
  url: string;
  version: string;
  cached: boolean;
  lastUpdated?: Date;
  description: string;
}

export interface DownloadProgress {
  modelId: string;
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  status: 'downloading' | 'processing' | 'complete' | 'error';
}

class ModelManagerClass {
  private dbName = 'SpeakBeeModels';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Available models configuration
  private availableModels: ModelInfo[] = [
    {
      id: 'piper-en-us-lessac-medium',
      name: 'Piper TTS - Kid Voices',
      type: 'tts',
      size: 28 * 1024 * 1024, // ~28MB
      quantization: 'fp32',
      url: 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx',
      version: '1.0.0',
      cached: false,
      description: 'High-quality kid-friendly voices for stories (works offline!)'
    },
    {
      id: 'whisper-tiny-en',
      name: 'Whisper Tiny English',
      type: 'stt',
      size: 75 * 1024 * 1024, // ~75MB
      quantization: '8bit',
      url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin',
      version: '1.0.0',
      cached: false,
      description: 'Fast offline speech recognition, English only'
    },
    {
      id: 'whisper-base-en',
      name: 'Whisper Base English',
      type: 'stt',
      size: 142 * 1024 * 1024, // ~142MB
      quantization: '8bit',
      url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin',
      version: '1.0.0',
      cached: false,
      description: 'Balanced accuracy and speed for speech recognition'
    },
    {
      id: 'distilgpt2',
      name: 'DistilGPT-2',
      type: 'llm',
      size: 82 * 1024 * 1024, // ~82MB
      quantization: '8bit',
      url: 'https://huggingface.co/Xenova/distilgpt2/resolve/main/onnx/model_quantized.onnx',
      version: '1.0.0',
      cached: false,
      description: 'Small language model for feedback generation'
    },
    {
      id: 'gpt2',
      name: 'GPT-2 Small',
      type: 'llm',
      size: 124 * 1024 * 1024, // ~124MB
      quantization: '8bit',
      url: 'https://huggingface.co/Xenova/gpt2/resolve/main/onnx/model_quantized.onnx',
      version: '1.0.0',
      cached: false,
      description: 'General-purpose conversation model'
    },
    {
      id: 'tinybert-grammar',
      name: 'TinyBERT Grammar',
      type: 'llm',
      size: 28 * 1024 * 1024, // ~28MB
      quantization: '8bit',
      url: 'https://huggingface.co/Xenova/distilbert-base-uncased/resolve/main/onnx/model_quantized.onnx',
      version: '1.0.0',
      cached: false,
      description: 'Grammar and language understanding'
    }
  ];

  /**
   * Initialize IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.updateCachedStatus();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('models')) {
          const modelStore = db.createObjectStore('models', { keyPath: 'id' });
          modelStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Get list of all available models
   */
  async getAvailableModels(type?: ModelInfo['type']): Promise<ModelInfo[]> {
    await this.initialize();
    await this.updateCachedStatus();

    if (type) {
      return this.availableModels.filter(m => m.type === type);
    }
    return [...this.availableModels];
  }

  /**
   * Get model by ID
   */
  async getModelInfo(modelId: string): Promise<ModelInfo | null> {
    await this.initialize();
    await this.updateCachedStatus();
    return this.availableModels.find(m => m.id === modelId) || null;
  }

  /**
   * Check if model is cached
   */
  async isModelCached(modelId: string): Promise<boolean> {
    await this.initialize();
    
    try {
      const model = await this.getModelData(modelId);
      return model !== null;
    } catch {
      return false;
    }
  }

  /**
   * Download and cache a model
   */
  async downloadModel(
    modelId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    await this.initialize();

    const modelInfo = this.availableModels.find(m => m.id === modelId);
    if (!modelInfo) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Check if already cached
    if (await this.isModelCached(modelId)) {
      console.log(`Model ${modelId} already cached`);
      onProgress?.({
        modelId,
        loaded: modelInfo.size,
        total: modelInfo.size,
        percentage: 100,
        status: 'complete'
      });
      return;
    }

    try {
      onProgress?.({
        modelId,
        loaded: 0,
        total: modelInfo.size,
        percentage: 0,
        status: 'downloading'
      });

      // Download model
      const response = await fetch(modelInfo.url);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const contentLength = parseInt(
        response.headers.get('content-length') || modelInfo.size.toString()
      );
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      const startTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const speed = receivedLength / elapsedSeconds;

        onProgress?.({
          modelId,
          loaded: receivedLength,
          total: contentLength,
          percentage: (receivedLength / contentLength) * 100,
          speed,
          status: 'downloading'
        });
      }

      // Combine chunks
      onProgress?.({
        modelId,
        loaded: receivedLength,
        total: contentLength,
        percentage: 99,
        status: 'processing'
      });

      const modelData = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        modelData.set(chunk, position);
        position += chunk.length;
      }

      // Cache model
      await this.cacheModel(modelId, modelData, modelInfo);

      onProgress?.({
        modelId,
        loaded: receivedLength,
        total: contentLength,
        percentage: 100,
        status: 'complete'
      });

      console.log(`✅ Model ${modelId} downloaded and cached`);
    } catch (error) {
      console.error(`Failed to download model ${modelId}:`, error);
      onProgress?.({
        modelId,
        loaded: 0,
        total: modelInfo.size,
        percentage: 0,
        status: 'error'
      });
      throw error;
    }
  }

  /**
   * Get cached model data
   */
  async getModelData(modelId: string): Promise<Uint8Array | null> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('models', 'readonly');
      const store = tx.objectStore('models');
      const request = store.get(modelId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.data || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache model data
   */
  private async cacheModel(
    modelId: string,
    data: Uint8Array,
    info: ModelInfo
  ): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('models', 'readwrite');
      const store = tx.objectStore('models');

      const modelEntry = {
        id: modelId,
        data,
        info: {
          ...info,
          cached: true,
          lastUpdated: new Date()
        }
      };

      const request = store.put(modelEntry);
      
      request.onsuccess = () => {
        // Update in-memory status
        const model = this.availableModels.find(m => m.id === modelId);
        if (model) {
          model.cached = true;
          model.lastUpdated = new Date();
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete cached model
   */
  async deleteModel(modelId: string): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('models', 'readwrite');
      const store = tx.objectStore('models');
      const request = store.delete(modelId);

      request.onsuccess = () => {
        // Update in-memory status
        const model = this.availableModels.find(m => m.id === modelId);
        if (model) {
          model.cached = false;
          model.lastUpdated = undefined;
        }
        console.log(`Model ${modelId} deleted`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get total cache size
   */
  async getCacheSize(): Promise<number> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('models', 'readonly');
      const store = tx.objectStore('models');
      const request = store.getAllKeys();

      request.onsuccess = async () => {
        let totalSize = 0;
        const keys = request.result;

        for (const key of keys) {
          const data = await this.getModelData(key as string);
          if (data) totalSize += data.byteLength;
        }

        resolve(totalSize);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cached models
   */
  async clearCache(): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('models', 'readwrite');
      const store = tx.objectStore('models');
      const request = store.clear();

      request.onsuccess = () => {
        // Update all model statuses
        this.availableModels.forEach(model => {
          model.cached = false;
          model.lastUpdated = undefined;
        });
        console.log('All models cleared from cache');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update cached status for all models
   */
  private async updateCachedStatus(): Promise<void> {
    for (const model of this.availableModels) {
      model.cached = await this.isModelCached(model.id);
    }
  }

  /**
   * Get storage quota information
   */
  async getStorageInfo(): Promise<{
    usage: number;
    quota: number;
    available: number;
    percentage: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const available = quota - usage;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return { usage, quota, available, percentage };
    }

    return { usage: 0, quota: 0, available: 0, percentage: 0 };
  }

  /**
   * Preload recommended models for user level
   */
  async preloadRecommendedModels(
    userLevel: 'beginner' | 'intermediate' | 'advanced' | 'kids',
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    // Recommended model combinations based on user level
    const recommendations: Record<string, string[]> = {
      kids: ['whisper-tiny-en', 'tinybert-grammar'],
      beginner: ['whisper-tiny-en', 'distilgpt2'],
      intermediate: ['whisper-base-en', 'gpt2'],
      advanced: ['whisper-base-en', 'gpt2']
    };

    const modelIds = recommendations[userLevel] || recommendations.beginner;

    for (const modelId of modelIds) {
      try {
        await this.downloadModel(modelId, onProgress);
      } catch (error) {
        console.error(`Failed to preload model ${modelId}:`, error);
      }
    }
  }
}

// Singleton instance
export const ModelManager = new ModelManagerClass();
export default ModelManager;

