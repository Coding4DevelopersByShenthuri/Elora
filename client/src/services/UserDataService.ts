export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  timeSpent: number; 
  attempts: number;
  lastAttempt: string;
  pronunciationScore?: number;
  fluencyScore?: number;
  accuracyScore?: number;
}

export interface PracticeSession {
  id: string;
  type: 'pronunciation' | 'conversation' | 'vocabulary' | 'grammar';
  duration: number;
  score: number;
  date: string;
  details: any;
}

export interface UserLearningData {
  userId: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  totalPracticeTime: number;
  lessonsCompleted: number;
  lessons: LessonProgress[];
  practiceSessions: PracticeSession[];
  vocabulary: LearnedWord[];
  achievements: string[];
  settings: UserSettings;
}

export interface LearnedWord {
  word: string;
  mastery: number;
  lastPracticed: string;
  timesPracticed: number;
}

export interface UserSettings {
  voiceSpeed: 'slow' | 'normal' | 'fast';
  difficulty: 'easy' | 'medium' | 'hard';
  notifications: boolean;
  autoPlay: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface OutboxItem {
  id?: number;
  timestamp: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  entity: string; // 'LessonProgress', 'PracticeSession', etc.
  operation: 'create' | 'update' | 'delete';
  data: any;
  retries: number;
  error?: string;
}

class UserDataService {
  private dbName = 'Elora';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for user learning data
        if (!db.objectStoreNames.contains('userLearningData')) {
          const store = db.createObjectStore('userLearningData', { keyPath: 'userId' });
          store.createIndex('userId', 'userId', { unique: true });
        }

        // Create object store for practice sessions
        if (!db.objectStoreNames.contains('practiceSessions')) {
          const store = db.createObjectStore('practiceSessions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }

        // Create object store for audio recordings
        if (!db.objectStoreNames.contains('audioRecordings')) {
          const store = db.createObjectStore('audioRecordings', { keyPath: 'id', autoIncrement: true });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('sessionId', 'sessionId', { unique: false });
        }
        
        // Create outbox store for offline sync
        if (!db.objectStoreNames.contains('syncOutbox')) {
          const store = db.createObjectStore('syncOutbox', { keyPath: 'id', autoIncrement: true });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('entity', 'entity', { unique: false });
        }
      };
    });
  }

  // Save user learning data
  async saveUserLearningData(userId: string, data: Partial<UserLearningData>): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userLearningData'], 'readwrite');
      const store = transaction.objectStore('userLearningData');

      // Get existing data first
      const getRequest = store.get(userId);
      
      getRequest.onsuccess = () => {
        const existingData = getRequest.result || { userId };
        const updatedData = { ...existingData, ...data };
        
        const putRequest = store.put(updatedData);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Get user learning data
  async getUserLearningData(userId: string): Promise<UserLearningData | null> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userLearningData'], 'readonly');
      const store = transaction.objectStore('userLearningData');
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get user learning data synchronously (for quick reads)
  getUserLearningDataSync(userId: string): UserLearningData | null {
    if (!this.db) {
      // Try to open synchronously - this will fail if DB isn't initialized
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`elora_user_data_${userId}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        return null;
      }
      return null;
    }

    try {
      const transaction = this.db.transaction(['userLearningData'], 'readonly');
      const store = transaction.objectStore('userLearningData');
      const request = store.get(userId);
      
      // This is a synchronous read attempt - may not work in all browsers
      // Fallback to async if needed
      return request.result || null;
    } catch {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`elora_user_data_${userId}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        return null;
      }
      return null;
    }
  }

  // Save practice session
  async savePracticeSession(session: Omit<PracticeSession, 'id'> & { userId: string }): Promise<number> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['practiceSessions'], 'readwrite');
      const store = transaction.objectStore('practiceSessions');
      
      const request = store.add(session);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // Get user's practice sessions
  async getPracticeSessions(userId: string, limit?: number): Promise<PracticeSession[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['practiceSessions'], 'readonly');
      const store = transaction.objectStore('practiceSessions');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        let sessions = request.result as PracticeSession[];
        if (limit) {
          sessions = sessions.slice(-limit);
        }
        resolve(sessions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Save audio recording (for pronunciation analysis)
  async saveAudioRecording(recording: {
    userId: string;
    sessionId: string;
    audioBlob: Blob;
    timestamp: string;
    word?: string;
    sentence?: string;
    score?: number;
  }): Promise<number> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audioRecordings'], 'readwrite');
      const store = transaction.objectStore('audioRecordings');
      
      const request = store.add(recording);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // Get audio recordings for a user
  async getAudioRecordings(userId: string): Promise<any[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['audioRecordings'], 'readonly');
      const store = transaction.objectStore('audioRecordings');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Export all user data (for backup)
  async exportUserData(userId: string): Promise<{
    learningData: UserLearningData | null;
    practiceSessions: PracticeSession[];
    audioRecordings: any[];
  }> {
    const [learningData, practiceSessions, audioRecordings] = await Promise.all([
      this.getUserLearningData(userId),
      this.getPracticeSessions(userId),
      this.getAudioRecordings(userId)
    ]);

    return {
      learningData,
      practiceSessions,
      audioRecordings
    };
  }

  // Import user data (for restore)
  async importUserData(userId: string, data: any): Promise<void> {
    if (data.learningData) {
      await this.saveUserLearningData(userId, data.learningData);
    }
  }

  // Clear all user data (account deletion)
  async clearUserData(userId: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ['userLearningData', 'practiceSessions', 'audioRecordings'], 
        'readwrite'
      );

      // Clear learning data
      transaction.objectStore('userLearningData').delete(userId);

      // Clear practice sessions
      const sessionStore = transaction.objectStore('practiceSessions');
      const sessionIndex = sessionStore.index('userId');
      const sessionRequest = sessionIndex.getAllKeys(userId);
      sessionRequest.onsuccess = () => {
        sessionRequest.result.forEach(key => {
          sessionStore.delete(key);
        });
      };

      // Clear audio recordings
      const audioStore = transaction.objectStore('audioRecordings');
      const audioIndex = audioStore.index('userId');
      const audioRequest = audioIndex.getAllKeys(userId);
      audioRequest.onsuccess = () => {
        audioRequest.result.forEach(key => {
          audioStore.delete(key);
        });
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // ============= Outbox Management for Offline Sync =============
  
  // Add item to outbox (for offline sync)
  async addToOutbox(item: Omit<OutboxItem, 'id' | 'status' | 'retries'>): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncOutbox'], 'readwrite');
      const store = transaction.objectStore('syncOutbox');
      
      const outboxItem: OutboxItem = {
        ...item,
        status: 'pending',
        retries: 0
      };
      
      const request = store.add(outboxItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending outbox items
  async getPendingOutbox(): Promise<OutboxItem[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncOutbox'], 'readonly');
      const store = transaction.objectStore('syncOutbox');
      const index = store.index('status');
      
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Update outbox item status
  async updateOutboxStatus(id: number, status: OutboxItem['status'], error?: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncOutbox'], 'readwrite');
      const store = transaction.objectStore('syncOutbox');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = status;
          item.retries += 1;
          if (error) item.error = error;
          
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Delete synced items from outbox
  async deleteOutboxItem(id: number): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncOutbox'], 'readwrite');
      const store = transaction.objectStore('syncOutbox');
      
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const userDataService = new UserDataService();