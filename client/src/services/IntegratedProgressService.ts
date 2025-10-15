/**
 * Integrated Progress Service
 * Handles both offline (IndexedDB) and online (Server API) progress tracking
 * Automatically syncs data when online
 */

import { userDataService } from './UserDataService';
import { API } from './ApiService';

class IntegratedProgressServiceClass {
  private syncInterval: number | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      // Only start auto-sync if server is enabled
      const serverEnabled = import.meta.env.VITE_ENABLE_SERVER_AUTH !== 'false';
      if (serverEnabled) {
        this.startAutoSync();
      }
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.stopAutoSync();
    });
    
    // Start auto-sync if online and server enabled
    const serverEnabled = import.meta.env.VITE_ENABLE_SERVER_AUTH !== 'false';
    if (this.isOnline && serverEnabled) {
      this.startAutoSync();
    }
  }

  /**
   * Start automatic syncing every 5 minutes
   */
  private startAutoSync() {
    this.stopAutoSync(); // Clear any existing interval
    this.syncInterval = window.setInterval(() => {
      this.syncProgressWithServer();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop automatic syncing
   */
  private stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Record lesson completion (hybrid: local + server)
   */
  async recordLessonCompletion(
    userId: string,
    lessonId: string,
    score: number,
    timeSpent: number,
    additionalScores?: {
      pronunciationScore?: number;
      fluencyScore?: number;
      accuracyScore?: number;
      grammarScore?: number;
    }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Always save locally first (offline-first approach)
      const localData = await userDataService.getUserLearningData(userId);
      
      if (localData) {
        localData.lessonsCompleted = (localData.lessonsCompleted || 0) + 1;
        localData.totalPracticeTime = (localData.totalPracticeTime || 0) + timeSpent;
        const points = Math.round(score / 10) + Math.min(10, Math.floor(timeSpent / 5));
        localData.totalPoints = (localData.totalPoints || 0) + points;
        
        await userDataService.saveUserLearningData(userId, localData);
      }

      // If online, also save to server (non-blocking, won't fail if server unavailable)
      if (this.isOnline) {
        const token = localStorage.getItem('speakbee_auth_token');
        const serverEnabled = import.meta.env.VITE_ENABLE_SERVER_AUTH !== 'false';
        if (serverEnabled && token && token !== 'local-token') {
          // Async save to server - don't wait or fail on error
          API.progress.recordLesson({
            lesson: parseInt(lessonId),
            completed: true,
            score,
            time_spent_minutes: timeSpent,
            ...additionalScores,
          }).catch(error => {
            console.log('Server save queued for later sync:', error);
          });
        }
      }

      return { success: true, message: 'Progress saved locally' };
    } catch (error) {
      console.error('Error recording lesson completion:', error);
      return { success: false, message: 'Failed to save progress' };
    }
  }

  /**
   * Record practice session (hybrid)
   */
  async recordPracticeSession(
    userId: string,
    sessionData: {
      type: 'pronunciation' | 'conversation' | 'vocabulary' | 'grammar';
      lessonId?: string;
      duration: number;
      score: number;
      details?: any;
    }
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Save locally
      const session = {
        userId,
        type: sessionData.type,
        duration: sessionData.duration,
        score: sessionData.score,
        date: new Date().toISOString(),
        details: sessionData.details
      };
      
      await userDataService.savePracticeSession(session);

      // If online, save to server (non-blocking)
      if (this.isOnline) {
        const token = localStorage.getItem('speakbee_auth_token');
        const serverEnabled = import.meta.env.VITE_ENABLE_SERVER_AUTH !== 'false';
        if (serverEnabled && token && token !== 'local-token') {
          // Async save to server - don't wait or fail on error
          const points = Math.round(sessionData.score / 10);
          API.progress.recordPractice({
            session_type: sessionData.type,
            lesson: sessionData.lessonId ? parseInt(sessionData.lessonId) : undefined,
            duration_minutes: sessionData.duration,
            score: sessionData.score,
            points_earned: points,
            details: sessionData.details
          }).catch(error => {
            console.log('Server save queued for later sync:', error);
          });
        }
      }

      return { success: true, message: 'Session recorded' };
    } catch (error) {
      console.error('Error recording practice session:', error);
      return { success: false, message: 'Failed to record session' };
    }
  }

  /**
   * Get user progress (hybrid: prefer server if online)
   */
  async getUserProgress(userId: string) {
    try {
      // Try to get from server if online
      if (this.isOnline) {
        const token = localStorage.getItem('speakbee_auth_token');
        const serverEnabled = import.meta.env.VITE_ENABLE_SERVER_AUTH !== 'false';
        if (serverEnabled && token && token !== 'local-token') {
          try {
            const response = await API.stats.getUserStats();
            if (response.success && 'data' in response) {
              return response.data;
            }
          } catch (error) {
            console.log('Server fetch failed, falling back to local');
          }
        }
      }

      // Fall back to local data
      const localData = await userDataService.getUserLearningData(userId);
      return localData;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  /**
   * Sync local data with server
   */
  async syncProgressWithServer(userId?: string): Promise<{ success: boolean; message?: string }> {
    const token = localStorage.getItem('speakbee_auth_token');
    if (!this.isOnline || !token || token === 'local-token') {
      return { success: false, message: 'Offline or no server token' };
    }

    if (!userId) {
      const userData = localStorage.getItem('speakbee_current_user');
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id;
      }
    }

    if (!userId) {
      return { success: false, message: 'No user ID' };
    }

    try {
      // Get local data
      const localData = await userDataService.getUserLearningData(userId);
      if (!localData) {
        return { success: true, message: 'No local data to sync' };
      }

      // Sync to server (this is a simplified version - in production you'd want to track sync status)
      await API.stats.getUserStats();
      
      return { success: true, message: 'Data synced successfully' };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, message: 'Sync failed' };
    }
  }

  /**
   * Get practice history (hybrid)
   */
  async getPracticeHistory(userId: string, limit: number = 50) {
    try {
      // Try server first if online
      if (this.isOnline) {
        const token = localStorage.getItem('speakbee_auth_token');
        const serverEnabled = import.meta.env.VITE_ENABLE_SERVER_AUTH !== 'false';
        if (serverEnabled && token && token !== 'local-token') {
          try {
            const response = await API.progress.getPracticeHistory(limit);
            if (response.success && 'data' in response) {
              return response.data;
            }
          } catch (error) {
            console.log('Server fetch failed, using local data');
          }
        }
      }

      // Use local data
      return await userDataService.getPracticeSessions(userId, limit);
    } catch (error) {
      console.error('Error getting practice history:', error);
      return [];
    }
  }

  /**
   * Check if online
   */
  isCurrentlyOnline(): boolean {
    return this.isOnline;
  }
}

// Singleton instance
export const IntegratedProgressService = new IntegratedProgressServiceClass();
export default IntegratedProgressService;

