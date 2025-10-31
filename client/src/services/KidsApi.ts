// Offline-first Kids API with IndexedDB fallback
class OfflineKidsApi {
  static baseUrl = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
  static dbName = 'KidsApiCache';
  static dbVersion = 1;
  private static db: IDBDatabase | null = null;

  // Initialize IndexedDB
  private static async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('progress')) {
          const store = db.createObjectStore('progress', { keyPath: 'userId' });
          store.createIndex('userId', 'userId', { unique: true });
        }

        if (!db.objectStoreNames.contains('pendingSync')) {
          const store = db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Check if online
  private static isOnline(): boolean {
    return navigator.onLine;
  }

  // Get data from IndexedDB
  private static async getFromCache(storeName: string, key: string): Promise<any> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save data to IndexedDB
  private static async saveToCache(storeName: string, data: any): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Queue sync operation for when online
  private static async queueSync(operation: any): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      const request = store.add({
        ...operation,
        timestamp: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  static async getLessons() {
    // Try to get from server if online
    if (this.isOnline()) {
      try {
        const res = await fetch(`${this.baseUrl}/api/kids/lessons`, {
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        if (res.ok) {
          const data = await res.json();
          // Cache the result
          await this.saveToCache('lessons', { id: 'default', data, timestamp: Date.now() });
          return data;
        }
      } catch (error) {
        console.warn('Failed to fetch lessons from server, using cache:', error);
      }
    }

    // Fallback to cache or default data
    const cached = await this.getFromCache('lessons', 'default');
    if (cached?.data) {
      return cached.data;
    }

    // Return default lessons if no cache
    return this.getDefaultLessons();
  }

  static async getProgress(token: string) {
    const userId = this.getUserIdFromToken(token);
    
    if (this.isOnline()) {
      try {
        const res = await fetch(`${this.baseUrl}/api/kids/progress`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          const data = await res.json();
          await this.saveToCache('progress', { userId, data, timestamp: Date.now() });
          return data;
        }
      } catch (error) {
        console.warn('Failed to fetch progress from server, using cache:', error);
      }
    }

    // Fallback to cache
    const cached = await this.getFromCache('progress', userId);
    if (cached?.data) {
      return cached.data;
    }

    // Return default progress
    return { userId, points: 0, streak: 0, lessons: [] };
  }

  static async updateProgress(token: string, payload: any) {
    const userId = this.getUserIdFromToken(token);

    // Always save locally first
    await this.saveToCache('progress', { 
      userId, 
      data: payload, 
      timestamp: Date.now() 
    });

    if (this.isOnline()) {
      try {
        const res = await fetch(`${this.baseUrl}/api/kids/progress/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          return res.json();
        }
      } catch (error) {
        console.warn('Failed to sync progress to server, queuing for later:', error);
      }
    }

    // Queue for sync when online
    await this.queueSync({
      type: 'updateProgress',
      token,
      payload
    });

    return { success: true, offline: true };
  }

  static async getAchievements(token: string) {
    // Try online first
    if (this.isOnline()) {
      try {
        const res = await fetch(`${this.baseUrl}/api/kids/achievements`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          return res.json();
        }
      } catch (error) {
        console.warn('Failed to fetch achievements from server:', error);
      }
    }
    // Fallback: minimal offline structure
    return [];
  }

  static async checkAchievements(token: string) {
    if (this.isOnline()) {
      try {
        const res = await fetch(`${this.baseUrl}/api/achievements/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          return res.json();
        }
      } catch (error) {
        console.warn('Failed to check achievements:', error);
      }
    }
    return { success: true, offline: !this.isOnline() } as any;
  }

  static async issueCertificate(token: string, payload: { cert_id: string; title: string; file_url?: string }) {
    if (this.isOnline()) {
      try {
        const res = await fetch(`${this.baseUrl}/api/kids/certificates/issue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) return res.json();
      } catch (e) {
        console.warn('Failed to issue certificate:', e);
      }
    }
    return { success: true, offline: !this.isOnline() } as any;
  }

  static async unlockTrophy(token: string, payload: { trophy_id: string; title: string }) {
    if (this.isOnline()) {
      try {
        const res = await fetch(`${this.baseUrl}/api/kids/trophies/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) return res.json();
      } catch (e) {
        console.warn('Failed to unlock trophy:', e);
      }
    }
    return { success: true, offline: !this.isOnline() } as any;
  }

  static async getIssuedCertificates(token: string) {
    if (this.isOnline()) {
      try {
        const res = await fetch(`${this.baseUrl}/api/kids/certificates/my`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) return res.json();
      } catch (e) {
        console.warn('Failed to fetch certificates:', e);
      }
    }
    return [];
  }

  // Helper to extract user ID from token (simplified)
  private static getUserIdFromToken(_token: string): string {
    try {
      // In a real app, decode JWT token
      // For now, use a simple approach
      const userData = localStorage.getItem('speakbee_current_user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || 'anonymous';
      }
    } catch (error) {
      console.error('Failed to get user ID from token:', error);
    }
    return 'anonymous';
  }

  // Default lessons for offline mode
  private static getDefaultLessons() {
    return [
      {
        id: 'lesson-1',
        title: 'Basic Pronunciation',
        description: 'Learn to pronounce basic words',
        level: 'beginner',
        exercises: []
      },
      {
        id: 'lesson-2',
        title: 'Reading Aloud',
        description: 'Practice reading simple sentences',
        level: 'beginner',
        exercises: []
      },
      {
        id: 'lesson-3',
        title: 'Vocabulary Building',
        description: 'Expand your vocabulary',
        level: 'intermediate',
        exercises: []
      }
    ];
  }

  // Sync pending operations (call this when connection is restored)
  static async syncPendingOperations() {
    if (!this.isOnline()) return;

    const db = await this.initDB();
    const transaction = db.transaction(['pendingSync'], 'readonly');
    const store = transaction.objectStore('pendingSync');
    const request = store.getAll();

    request.onsuccess = async () => {
      const pending = request.result;
      for (const op of pending) {
        try {
          if (op.type === 'updateProgress') {
            await fetch(`${this.baseUrl}/api/kids/progress/update`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${op.token}`
              },
              body: JSON.stringify(op.payload)
            });
            // Remove from pending after successful sync
            const delTransaction = db.transaction(['pendingSync'], 'readwrite');
            const delStore = delTransaction.objectStore('pendingSync');
            delStore.delete(op.id);
          }
        } catch (error) {
          console.error('Failed to sync operation:', error);
        }
      }
    };
  }
}

// Set up online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Connection restored, syncing pending operations...');
    OfflineKidsApi.syncPendingOperations();
  });
}

export class KidsApi extends OfflineKidsApi {}
export default KidsApi;


