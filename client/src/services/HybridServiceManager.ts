import API from './ApiService';
import { verifyOnlineOnlyMode } from './OfflinePrefetch';

export type OperationMode = 'online';

export interface HybridConfig {
  /** reserved for backward compatibility */
  mode?: OperationMode;
}

class HybridServiceManagerClass {
  private mode: OperationMode = 'online';

  private async ensureOnline(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('An active internet connection is required to continue.');
    }
    await verifyOnlineOnlyMode();
  }

  async initialize(_: HybridConfig = {}): Promise<void> {
    await this.ensureOnline();
    this.mode = 'online';
  }

  getMode(): OperationMode {
    return this.mode;
  }

  setMode(_: OperationMode): void {
    // Online mode is mandatory; ignore attempts to change it
    this.mode = 'online';
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  getSyncStatus(): {
    mode: OperationMode;
    online: boolean;
    pendingSessions: number;
    autoSyncEnabled: boolean;
  } {
    return {
      mode: this.mode,
      online: this.isOnline(),
      pendingSessions: 0,
      autoSyncEnabled: false,
    };
  }

  async recordSession(data: {
    sessionType: 'pronunciation' | 'conversation' | 'vocabulary' | 'grammar';
    score: number;
    duration: number;
    details: unknown;
  }): Promise<void> {
    await this.ensureOnline();
    await API.progress.recordPractice({
      session_type: data.sessionType,
      duration_minutes: data.duration,
      score: data.score,
      points_earned: Math.round(data.score / 10),
      details: data.details,
    });
  }

  async getUserProgress(type?: string): Promise<any> {
    await this.ensureOnline();
    const response = await API.progress.getMyProgress(type);
    if (!response.success || !('data' in response)) {
      throw new Error(response.message || 'Unable to load progress.');
    }
    return response.data;
  }

  async getUserStats(): Promise<any> {
    await this.ensureOnline();
    const response = await API.stats.getUserStats();
    if (!response.success || !('data' in response)) {
      throw new Error(response.message || 'Unable to load statistics.');
    }
    return response.data;
  }

  async saveVocabularyWord(word: {
    word: string;
    definition?: string;
    example?: string;
    mastered?: boolean;
  }): Promise<void> {
    await this.ensureOnline();
    await API.vocabulary.addWord({
      word: word.word,
      definition: word.definition,
      example_sentence: word.example,
      is_correct: word.mastered,
    });
  }

  async forceSyncNow(): Promise<void> {
    await this.ensureOnline();
  }

  async clearLocalData(): Promise<void> {
    // No offline caches to clear in online-only mode
  }

  async getSystemHealth(): Promise<{
    offlineReady: boolean;
    onlineReady: boolean;
    modelsDownloaded: number;
    cacheSize: number;
    pendingSync: number;
  }> {
    await this.ensureOnline();
    return {
      offlineReady: false,
      onlineReady: true,
      modelsDownloaded: 0,
      cacheSize: 0,
      pendingSync: 0,
    };
  }

  async syncNow(): Promise<{
    outgoing: { synced: number; failed: number };
    incoming: { received: number };
    success: boolean;
  }> {
    await this.ensureOnline();
    return {
      outgoing: { synced: 0, failed: 0 },
      incoming: { received: 0 },
      success: true,
    };
  }
}

export const HybridServiceManager = new HybridServiceManagerClass();
export default HybridServiceManager;

