/**
 * VoiceModelManager: Handles downloading and caching Piper TTS voice models
 * Supports background downloads for online users
 * 
 * Note: This is separate from the AI Tutor's ModelManager
 */

export interface DownloadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

export class VoiceModelManager {
  private static readonly MODEL_CACHE_KEY = 'piper_models_cache';
  private static readonly MODEL_URLS: Record<string, string> = {
    'piper-en-us-lessac-medium': 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx',
    'piper-en-us-amy-medium': 'https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/amy/medium/en_US-amy-medium.onnx',
  };

  /**
   * Download a Piper model with progress tracking
   */
  static async downloadModel(
    modelId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const modelUrl = this.MODEL_URLS[modelId];
    
    if (!modelUrl) {
      throw new Error(`Model ${modelId} not found in registry`);
    }

    console.log(`📥 Starting download: ${modelId}`);

    try {
      // Check if already cached
      const cached = await this.getCachedModel(modelId);
      if (cached) {
        console.log(`✅ Model ${modelId} already cached`);
        onProgress?.({ percentage: 100, loaded: 1, total: 1 });
        return;
      }

      // Fetch with progress tracking
      const response = await fetch(modelUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        const percentage = total > 0 ? (loaded / total) * 100 : 0;
        onProgress?.({ percentage, loaded, total });
      }

      // Combine chunks into single array
      const modelData = new Uint8Array(loaded);
      let position = 0;
      for (const chunk of chunks) {
        modelData.set(chunk, position);
        position += chunk.length;
      }

      // Cache the model
      await this.cacheModel(modelId, modelData);
      
      console.log(`✅ Model ${modelId} downloaded and cached (${(loaded / 1024 / 1024).toFixed(2)}MB)`);
      onProgress?.({ percentage: 100, loaded, total });
      
    } catch (error) {
      console.error(`❌ Failed to download model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Cache model data in IndexedDB
   */
  private static async cacheModel(modelId: string, data: Uint8Array): Promise<void> {
    try {
      if ('indexedDB' in window) {
        const db = await this.openDatabase();
        const transaction = db.transaction(['models'], 'readwrite');
        const store = transaction.objectStore('models');
        
        await new Promise((resolve, reject) => {
          const request = store.put({ id: modelId, data, timestamp: Date.now() });
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });
        
        db.close();
      } else {
        // Fallback to localStorage (not recommended for large files, but better than nothing)
        console.warn('IndexedDB not available, using localStorage fallback');
        localStorage.setItem(`${this.MODEL_CACHE_KEY}_${modelId}`, JSON.stringify({
          id: modelId,
          data: Array.from(data),
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Failed to cache model:', error);
      throw error;
    }
  }

  /**
   * Get cached model from storage (public for PiperTTS integration)
   */
  static async getCachedModel(modelId: string): Promise<Uint8Array | null> {
    try {
      if ('indexedDB' in window) {
        const db = await this.openDatabase();
        const transaction = db.transaction(['models'], 'readonly');
        const store = transaction.objectStore('models');
        
        const result = await new Promise<any>((resolve, reject) => {
          const request = store.get(modelId);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        db.close();
        
        return result?.data || null;
      } else {
        // Fallback to localStorage
        const cached = localStorage.getItem(`${this.MODEL_CACHE_KEY}_${modelId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          return new Uint8Array(parsed.data);
        }
      }
    } catch (error) {
      console.error('Failed to get cached model:', error);
    }
    
    return null;
  }

  /**
   * Open IndexedDB database
   */
  private static async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PiperModelsDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Clear all cached models
   */
  static async clearCache(): Promise<void> {
    try {
      if ('indexedDB' in window) {
        const db = await this.openDatabase();
        const transaction = db.transaction(['models'], 'readwrite');
        const store = transaction.objectStore('models');
        
        await new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve(undefined);
          request.onerror = () => reject(request.error);
        });
        
        db.close();
      } else {
        // Clear from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(this.MODEL_CACHE_KEY)) {
            localStorage.removeItem(key);
          }
        });
      }
      
      console.log('✅ Model cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Get cache size
   */
  static async getCacheSize(): Promise<number> {
    try {
      if ('indexedDB' in window) {
        const db = await this.openDatabase();
        const transaction = db.transaction(['models'], 'readonly');
        const store = transaction.objectStore('models');
        
        const allModels = await new Promise<any[]>((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        db.close();
        
        let totalSize = 0;
        allModels.forEach(model => {
          if (model.data) {
            totalSize += model.data.byteLength;
          }
        });
        
        return totalSize;
      }
    } catch (error) {
      console.error('Failed to get cache size:', error);
    }
    
    return 0;
  }
}

export default VoiceModelManager;
