/*
  HybridServiceManager: Intelligent Offline + Online Coordinator
  
  This service manages the seamless integration between:
  1. OFFLINE: Local SLM services (Whisper, DistilGPT-2, Pronunciation Scoring)
  2. ONLINE: Django REST API (User data, progress tracking, cloud sync)
  
  Strategy:
  - Core AI features work 100% offline (speech, conversation, scoring)
  - User data syncs to cloud when online (optional)
  - Automatic fallback when offline
  - Background sync when connection restored
*/

import API from './ApiService';
import { ModelManager } from './ModelManager';

export type OperationMode = 'offline' | 'online' | 'hybrid';

export interface HybridConfig {
  mode?: OperationMode;
  preferOffline?: boolean; // Prefer offline even when online (for privacy/speed)
  autoSync?: boolean; // Auto-sync to cloud when online
  syncInterval?: number; // Minutes between syncs
  enableTelemetry?: boolean; // Send performance data to server
}

export interface SessionData {
  sessionType: 'pronunciation' | 'conversation' | 'vocabulary' | 'grammar';
  score: number;
  duration: number; // minutes
  details: any;
  timestamp: Date;
  synced: boolean;
}

class HybridServiceManagerClass {
  private mode: OperationMode = 'hybrid';
  private config: HybridConfig = {
    mode: 'hybrid',
    preferOffline: false, // Use server when available
    autoSync: true,
    syncInterval: 15, // 15 minutes
    enableTelemetry: false
  };
  
  private syncTimer: number | null = null;
  private pendingSessions: SessionData[] = [];
  
  /**
   * Initialize hybrid service manager
   */
  async initialize(config?: HybridConfig): Promise<void> {
    console.log('🔄 Initializing Hybrid Service Manager...');
    
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Determine operation mode
    this.mode = this.detectOperationMode();
    console.log(`📡 Operation mode: ${this.mode}`);
    
    // Initialize offline services
    try {
      console.log('🤖 Initializing offline AI services...');
      
      // Check if models are available
      const modelsAvailable = await ModelManager.isModelCached('whisper-tiny-en') ||
                              await ModelManager.isModelCached('distilgpt2');
      
      if (!modelsAvailable) {
        console.log('📦 No models found. Download will be required for offline features.');
      }
      
      console.log('✅ Hybrid Service Manager initialized');
    } catch (error) {
      console.error('Failed to initialize hybrid services:', error);
    }
    
    // Start auto-sync if enabled and online
    if (this.config.autoSync && this.isOnline()) {
      this.startAutoSync();
    }
    
    // Monitor connection changes
    this.setupConnectionMonitoring();
    
    // Load pending sessions from storage
    await this.loadPendingSessions();
  }
  
  /**
   * Detect optimal operation mode
   */
  private detectOperationMode(): OperationMode {
    // Check if user explicitly set mode
    if (this.config.mode && this.config.mode !== 'hybrid') {
      return this.config.mode;
    }
    
    // Auto-detect based on conditions
    const hasInternet = navigator.onLine;
    const hasLocalModels = localStorage.getItem('models_downloaded') === 'true';
    
    if (!hasInternet && hasLocalModels) {
      return 'offline';
    }
    
    if (hasInternet && !hasLocalModels) {
      return 'online';
    }
    
    // Default to hybrid (best of both)
    return 'hybrid';
  }
  
  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }
  
  /**
   * Get current operation mode
   */
  getMode(): OperationMode {
    return this.mode;
  }
  
  /**
   * Set operation mode manually
   */
  setMode(mode: OperationMode): void {
    this.mode = mode;
    console.log(`📡 Mode changed to: ${mode}`);
    
    if (mode === 'online' || (mode === 'hybrid' && this.isOnline())) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }
  
  /**
   * Record practice session (hybrid: local + optional cloud sync)
   */
  async recordSession(data: Omit<SessionData, 'timestamp' | 'synced'>): Promise<void> {
    const session: SessionData = {
      ...data,
      timestamp: new Date(),
      synced: false
    };
    
    // Always store locally first (offline-first approach)
    this.pendingSessions.push(session);
    await this.savePendingSessions();
    
    // Try to sync immediately if online and not preferring offline
    if (this.isOnline() && !this.config.preferOffline) {
      await this.syncSession(session);
    }
  }
  
  /**
   * Sync a single session to server
   */
  private async syncSession(session: SessionData): Promise<boolean> {
    try {
      const result = await API.progress.recordPractice({
        session_type: session.sessionType,
        duration_minutes: session.duration,
        score: session.score,
        points_earned: Math.round(session.score / 10),
        details: session.details
      });
      
      if (result.success) {
        session.synced = true;
        await this.savePendingSessions();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to sync session:', error);
      return false;
    }
  }
  
  /**
   * Sync all pending sessions
   */
  async syncAllPendingSessions(): Promise<{ synced: number; failed: number }> {
    if (!this.isOnline()) {
      return { synced: 0, failed: 0 };
    }
    
    let synced = 0;
    let failed = 0;
    
    console.log(`🔄 Syncing ${this.pendingSessions.length} pending sessions...`);
    
    for (const session of this.pendingSessions) {
      if (!session.synced) {
        const success = await this.syncSession(session);
        if (success) {
          synced++;
        } else {
          failed++;
        }
      }
    }
    
    // Remove synced sessions
    this.pendingSessions = this.pendingSessions.filter(s => !s.synced);
    await this.savePendingSessions();
    
    console.log(`✅ Synced: ${synced}, Failed: ${failed}`);
    return { synced, failed };
  }
  
  /**
   * Get user progress (hybrid: try online first, fallback to local)
   */
  async getUserProgress(type?: string): Promise<any> {
    // Try online first if available and not preferring offline
    if (this.isOnline() && !this.config.preferOffline) {
      try {
        const result = await API.progress.getMyProgress(type);
        if (result.success && 'data' in result) {
          // Cache locally
          localStorage.setItem('cached_progress', JSON.stringify(result.data));
          return result.data;
        }
      } catch (error) {
        console.warn('Failed to get online progress, using local cache');
      }
    }
    
    // Fallback to local cache
    const cached = localStorage.getItem('cached_progress');
    return cached ? JSON.parse(cached) : [];
  }
  
  /**
   * Get user statistics (hybrid: try online first, calculate locally as fallback)
   */
  async getUserStats(): Promise<any> {
    // Try online first
    if (this.isOnline() && !this.config.preferOffline) {
      try {
        const result = await API.stats.getUserStats();
        if (result.success && 'data' in result) {
          return result.data;
        }
      } catch (error) {
        console.warn('Failed to get online stats, calculating locally');
      }
    }
    
    // Calculate from local sessions
    return this.calculateLocalStats();
  }
  
  /**
   * Calculate statistics from local data
   */
  private calculateLocalStats(): any {
    const totalSessions = this.pendingSessions.length;
    const totalPoints = this.pendingSessions.reduce((sum, s) => sum + Math.round(s.score / 10), 0);
    const avgScore = totalSessions > 0
      ? this.pendingSessions.reduce((sum, s) => sum + s.score, 0) / totalSessions
      : 0;
    const totalMinutes = this.pendingSessions.reduce((sum, s) => sum + s.duration, 0);
    
    return {
      total_points: totalPoints,
      level: Math.floor(Math.sqrt(totalPoints / 100)) + 1,
      lessons_completed: totalSessions,
      practice_time_minutes: totalMinutes,
      average_score: Math.round(avgScore * 100) / 100,
      current_streak: 0, // Would need more complex logic
      vocabulary_count: 0 // Would need vocabulary tracking
    };
  }
  
  /**
   * Save vocabulary word (hybrid: local + optional sync)
   */
  async saveVocabularyWord(word: {
    word: string;
    definition?: string;
    example?: string;
    mastered?: boolean;
  }): Promise<void> {
    // Save locally
    const localVocab = JSON.parse(localStorage.getItem('vocabulary') || '[]');
    localVocab.push({ ...word, timestamp: new Date(), synced: false });
    localStorage.setItem('vocabulary', JSON.stringify(localVocab));
    
    // Sync if online
    if (this.isOnline() && !this.config.preferOffline) {
      try {
        await API.vocabulary.addWord({
          word: word.word,
          definition: word.definition,
          example_sentence: word.example,
          is_correct: word.mastered
        });
      } catch (error) {
        console.warn('Failed to sync vocabulary word');
      }
    }
  }
  
  /**
   * Start auto-sync timer
   */
  private startAutoSync(): void {
    if (this.syncTimer) return; // Already running
    
    const intervalMs = (this.config.syncInterval || 15) * 60 * 1000;
    
    this.syncTimer = window.setInterval(() => {
      if (this.isOnline()) {
        console.log('⏰ Auto-sync triggered');
        this.syncAllPendingSessions();
      }
    }, intervalMs);
    
    console.log(`⏰ Auto-sync enabled (every ${this.config.syncInterval} minutes)`);
  }
  
  /**
   * Stop auto-sync timer
   */
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('⏰ Auto-sync disabled');
    }
  }
  
  /**
   * Setup connection monitoring
   */
  private setupConnectionMonitoring(): void {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.mode = this.detectOperationMode();
      
      if (this.config.autoSync) {
        this.syncAllPendingSessions();
        this.startAutoSync();
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Connection lost, switching to offline mode');
      this.mode = 'offline';
      this.stopAutoSync();
    });
  }
  
  /**
   * Load pending sessions from storage
   */
  private async loadPendingSessions(): Promise<void> {
    try {
      const stored = localStorage.getItem('pending_sessions');
      if (stored) {
        this.pendingSessions = JSON.parse(stored);
        console.log(`📦 Loaded ${this.pendingSessions.length} pending sessions`);
      }
    } catch (error) {
      console.error('Failed to load pending sessions:', error);
    }
  }
  
  /**
   * Save pending sessions to storage
   */
  private async savePendingSessions(): Promise<void> {
    try {
      localStorage.setItem('pending_sessions', JSON.stringify(this.pendingSessions));
    } catch (error) {
      console.error('Failed to save pending sessions:', error);
    }
  }
  
  /**
   * Get sync status
   */
  getSyncStatus(): {
    mode: OperationMode;
    online: boolean;
    pendingSessions: number;
    autoSyncEnabled: boolean;
  } {
    return {
      mode: this.mode,
      online: this.isOnline(),
      pendingSessions: this.pendingSessions.filter(s => !s.synced).length,
      autoSyncEnabled: this.syncTimer !== null
    };
  }
  
  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<void> {
    console.log('🔄 Force sync initiated...');
    await this.syncAllPendingSessions();
  }
  
  /**
   * Clear all local data (careful!)
   */
  async clearLocalData(): Promise<void> {
    console.warn('⚠️ Clearing all local data');
    this.pendingSessions = [];
    localStorage.removeItem('pending_sessions');
    localStorage.removeItem('cached_progress');
    localStorage.removeItem('vocabulary');
  }
  
  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    offlineReady: boolean;
    onlineReady: boolean;
    modelsDownloaded: number;
    cacheSize: number;
    pendingSync: number;
  }> {
    const models = await ModelManager.getAvailableModels();
    const downloadedModels = models.filter(m => m.cached).length;
    const cacheSize = await ModelManager.getCacheSize();
    
    return {
      offlineReady: downloadedModels > 0,
      onlineReady: this.isOnline(),
      modelsDownloaded: downloadedModels,
      cacheSize,
      pendingSync: this.pendingSessions.filter(s => !s.synced).length
    };
  }
}

// Singleton instance
export const HybridServiceManager = new HybridServiceManagerClass();
export default HybridServiceManager;

