import { userDataService } from '@/services/UserDataService';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  hasErrors?: boolean;
}

export interface GameSession {
  id: string;
  gameType: string;
  gameTitle: string;
  startTime: number;
  endTime?: number;
  score: number;
  rounds: number;
  difficulty: string;
  conversationHistory: ConversationMessage[];
  completed: boolean;
}

const HISTORY_RETENTION_DAYS = 30;
const HISTORY_RETENTION_MS = HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;

// Auto-cleanup runs when history is loaded (every time user visits history page)
const AUTO_CLEANUP_ENABLED = true;

/**
 * Get the key for storing deleted session IDs
 */
const getDeletedSessionsKey = (userId: string): string => {
  return `speakbee_deleted_game_sessions_${userId}`;
};

/**
 * Track a deleted session ID to prevent it from being re-added on sync
 * Tracks both the full sessionId and numeric ID (for server sessions)
 */
const trackDeletedSession = (userId: string, sessionId: string): void => {
  try {
    const key = getDeletedSessionsKey(userId);
    const deleted = JSON.parse(localStorage.getItem(key) || '[]') as string[];
    
    // Add the full sessionId
    if (!deleted.includes(sessionId)) {
      deleted.push(sessionId);
    }
    
    // If it's a server session, also track the numeric ID
    if (sessionId.startsWith('server-')) {
      const numericId = sessionId.replace('server-', '');
      if (!deleted.includes(numericId)) {
        deleted.push(numericId);
      }
    }
    
    // If it's a numeric ID, also track as "server-{id}" to catch server sessions
    if (sessionId.match(/^\d+$/)) {
      const serverId = `server-${sessionId}`;
      if (!deleted.includes(serverId)) {
        deleted.push(serverId);
      }
    }
    
    localStorage.setItem(key, JSON.stringify(deleted));
    console.log(`📝 Tracked deleted session: ${sessionId} (and related IDs)`);
  } catch (error) {
    console.warn('Error tracking deleted session:', error);
  }
};

/**
 * Check if a session ID was deleted
 * Checks both the full sessionId and the numeric ID (for server sessions)
 */
const isSessionDeleted = (userId: string, sessionId: string): boolean => {
  try {
    const key = getDeletedSessionsKey(userId);
    const deleted = JSON.parse(localStorage.getItem(key) || '[]') as string[];
    
    // Check if the full sessionId is in the deleted list
    if (deleted.includes(sessionId)) {
      return true;
    }
    
    // Also check if the numeric ID matches (for server sessions)
    // If sessionId is "server-123", also check if "123" or "server-123" is deleted
    if (sessionId.startsWith('server-')) {
      const numericId = sessionId.replace('server-', '');
      return deleted.includes(numericId) || deleted.includes(sessionId);
    }
    
    // If sessionId is numeric, also check if "server-{id}" is in deleted list
    if (sessionId.match(/^\d+$/)) {
      return deleted.includes(sessionId) || deleted.includes(`server-${sessionId}`);
    }
    
    return false;
  } catch {
    return false;
  }
};

/**
 * Clean up old deleted session IDs (older than 60 days)
 */
const cleanupOldDeletedSessions = (userId: string): void => {
  try {
    const key = getDeletedSessionsKey(userId);
    const deleted = JSON.parse(localStorage.getItem(key) || '[]') as string[];
    // Keep deleted session IDs for 60 days to prevent re-sync
    // After that, they can be safely removed from the list
    if (deleted.length > 1000) {
      // If list gets too large, keep only last 500
      const cleaned = deleted.slice(-500);
      localStorage.setItem(key, JSON.stringify(cleaned));
    }
  } catch (error) {
    console.warn('Error cleaning up deleted sessions list:', error);
  }
};

export class GameHistoryService {
  private static filterExpiredSessions(sessions: GameSession[]): GameSession[] {
    const cutoff = Date.now() - HISTORY_RETENTION_MS;
    return sessions.filter((session) => session.startTime >= cutoff);
  }

  /**
   * Save a game session (to both local storage and MySQL)
   */
  static async saveGameSession(userId: string, session: GameSession): Promise<void> {
    // Save to local storage first
    await userDataService.initDB();
    
    // Get local history (sync version for quick access)
    let localHistory: GameSession[] = [];
    try {
      let data: any = null;
      try {
        data = userDataService.getUserLearningDataSync(userId);
      } catch {
        const stored = localStorage.getItem(`elora_user_data_${userId}`);
        if (stored) {
          data = JSON.parse(stored);
        }
      }
      localHistory = (data as any)?.gameHistory || [];
    } catch {
      localHistory = [];
    }
    
    // Add or update session
    const existingIndex = localHistory.findIndex((s: GameSession) => s.id === session.id);
    if (existingIndex >= 0) {
      localHistory[existingIndex] = session;
    } else {
      localHistory.push(session);
    }
    
    // Remove expired sessions and keep only last 100
    const cleaned = this.filterExpiredSessions(localHistory);
    const sorted = cleaned.sort((a, b) => b.startTime - a.startTime);
    const limited = sorted.slice(0, 100);
    
    await userDataService.saveUserLearningData(userId, { 
      gameHistory: limited 
    } as any);

    // Save to MySQL database via API
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (token && token !== 'local-token') {
        const { API } = await import('@/services/ApiService');
        const durationSeconds = session.endTime 
          ? Math.floor((session.endTime - session.startTime) / 1000)
          : 0;
        
        await API.kids.recordGameSession({
          game_type: session.gameType,
          game_title: session.gameTitle,
          score: session.score,
          points_earned: session.score,
          rounds: session.rounds,
          difficulty: session.difficulty,
          duration_seconds: durationSeconds,
          completed: session.completed,
          details: {
            conversationHistory: session.conversationHistory,
            sessionId: session.id,
            startTime: session.startTime,
            endTime: session.endTime
          }
        }).catch(error => {
          console.warn('Failed to save game session to server:', error);
        });
      }
    } catch (error) {
      console.error('Error saving game session to MySQL:', error);
    }
  }

  /**
   * Get all game sessions for a user (from both local and MySQL)
   * Automatically cleans up old sessions (older than HISTORY_RETENTION_DAYS)
   */
  static async getGameHistory(userId: string, syncFromServer: boolean = true): Promise<GameSession[]> {
    // Get local history
    let localHistory: GameSession[] = [];
    try {
      let data: any = null;
      try {
        data = userDataService.getUserLearningDataSync(userId);
      } catch {
        const stored = localStorage.getItem(`elora_user_data_${userId}`);
        if (stored) {
          data = JSON.parse(stored);
        }
      }
      localHistory = (data as any)?.gameHistory || [];
    } catch {
      localHistory = [];
    }

    // Automatically clean up expired sessions (older than HISTORY_RETENTION_DAYS)
    const cleanedLocal = this.filterExpiredSessions(localHistory);
    if (cleanedLocal.length !== localHistory.length) {
      await userDataService.saveUserLearningData(userId, {
        gameHistory: cleanedLocal
      } as any);
      console.log(`🧹 Auto-cleaned ${localHistory.length - cleanedLocal.length} expired game session(s)`);
    }

    // Try to sync from server if authenticated
    if (syncFromServer) {
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          const { API } = await import('@/services/ApiService');
          const response = await API.kids.getGameSessions?.();
          
          if (response && 'success' in response && response.success && 'data' in response && Array.isArray(response.data)) {
            // Convert server sessions to GameSession format
            const serverSessions: GameSession[] = response.data.map((s: any) => {
              const startTime = s.created_at ? new Date(s.created_at).getTime() : Date.now();
              return {
                id: `server-${s.id}`,
                gameType: s.game_type,
                gameTitle: s.game_title || s.game_type,
                startTime: startTime,
                endTime: s.duration_seconds ? startTime + (s.duration_seconds * 1000) : undefined,
                score: s.score || s.points_earned || 0,
                rounds: s.rounds || 0,
                difficulty: s.difficulty || 'beginner',
                conversationHistory: s.details?.conversationHistory || [],
                completed: s.completed || false
              };
            });

            // Filter out deleted sessions from server sync
            const filteredServerSessions = serverSessions.filter(s => !isSessionDeleted(userId, s.id));
            
            // Merge local and server sessions, removing duplicates and deleted sessions
            const allSessions = [...cleanedLocal, ...filteredServerSessions];
            const uniqueSessions = allSessions.filter((session, index, self) => {
              // Skip if this session was deleted
              if (isSessionDeleted(userId, session.id)) {
                return false;
              }
              
              // Remove duplicates
              return index === self.findIndex(s => 
                s.id === session.id || 
                (s.gameType === session.gameType && 
                 Math.abs(s.startTime - session.startTime) < 60000) // Within 1 minute = same session
              );
            });

            // Clean up old deleted session IDs periodically
            cleanupOldDeletedSessions(userId);
            
            const cleaned = this.filterExpiredSessions(uniqueSessions);
            return cleaned.sort((a, b) => b.startTime - a.startTime);
          }
        }
      } catch (error) {
        console.warn('Error loading game history from server:', error);
      }
    }

    return cleanedLocal.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Get game sessions by game type
   */
  static async getGameHistoryByType(userId: string, gameType: string): Promise<GameSession[]> {
    const history = await this.getGameHistory(userId);
    return history.filter(s => s.gameType === gameType)
      .sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Get a specific game session by ID
   */
  static async getGameSession(userId: string, sessionId: string): Promise<GameSession | null> {
    const history = await this.getGameHistory(userId);
    return history.find((s: GameSession) => s.id === sessionId) || null;
  }

  /**
   * Delete a game session permanently (history only, points are preserved)
   * Deletes from both local storage and server (if session exists on server)
   * Tracks deleted session ID to prevent it from being re-added on sync
   */
  static async deleteGameSession(userId: string, sessionId: string): Promise<void> {
    await userDataService.initDB();
    
    // Get the session to check if it exists on server
    const history = await this.getGameHistory(userId, false); // Don't sync from server during delete
    const sessionToDelete = history.find(s => s.id === sessionId);
    
    // Track this session as deleted to prevent re-sync
    trackDeletedSession(userId, sessionId);
    
    // Delete from local storage
    const filtered = history.filter(s => s.id !== sessionId);
    const cleaned = this.filterExpiredSessions(filtered);
    await userDataService.saveUserLearningData(userId, { 
      gameHistory: cleaned 
    } as any);
    
    // Delete from server if session exists there (has server- prefix or is a numeric ID from server)
    if (sessionToDelete) {
      try {
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          const { API } = await import('@/services/ApiService');
          
          // Extract numeric ID from sessionId (format: "server-123" or just "123")
          // If it starts with "server-", it's definitely from server
          // If it's a numeric string, it might be from server (try to delete)
          const numericId = sessionId.startsWith('server-') 
            ? sessionId.replace('server-', '') 
            : (sessionId.match(/^\d+$/) ? sessionId : null);
          
          // Only try to delete from server if we have a numeric ID
          if (numericId) {
            // Delete from server using the DELETE endpoint
            await API.kids.deleteGameSession(numericId).then(() => {
              console.log(`✅ Deleted game session ${sessionId} from server`);
            }).catch(error => {
              // If 404, session might not exist on server (local-only session) - this is okay
              if ((error as any)?.status !== 404) {
                console.warn('Failed to delete game session from server:', error);
              }
              // Don't throw - local deletion succeeded, server deletion is optional
              // The session ID is tracked as deleted, so it won't be re-added on sync
            });
          }
        }
      } catch (error) {
        console.warn('Error deleting game session from server:', error);
        // Don't throw - local deletion succeeded
        // The session ID is tracked as deleted, so it won't be re-added on sync
      }
    }
    
    console.log(`✅ Game session deleted permanently: ${sessionId} (points preserved)`);
  }

  /**
   * Automatically clean up old game sessions (older than HISTORY_RETENTION_DAYS)
   * This is called automatically when history is loaded
   */
  static async autoCleanupOldSessions(userId: string): Promise<{ deleted: number }> {
    if (!AUTO_CLEANUP_ENABLED) {
      return { deleted: 0 };
    }

    await userDataService.initDB();
    const history = await this.getGameHistory(userId, false); // Don't sync during cleanup
    
    const beforeCount = history.length;
    const cleaned = this.filterExpiredSessions(history);
    const deleted = beforeCount - cleaned.length;
    
    if (deleted > 0) {
      // Save cleaned history
      await userDataService.saveUserLearningData(userId, {
        gameHistory: cleaned
      } as any);
      
      console.log(`🧹 Auto-cleaned ${deleted} old game session(s) (older than ${HISTORY_RETENTION_DAYS} days)`);
    }
    
    return { deleted };
  }

  /**
   * Get statistics for a game type
   */
  static async getGameStatistics(userId: string, gameType: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    totalScore: number;
    averageScore: number;
    bestScore: number;
    totalRounds: number;
  }> {
    const sessions = await this.getGameHistoryByType(userId, gameType);
    const completed = sessions.filter(s => s.completed);
    
    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      totalScore: sessions.reduce((sum, s) => sum + s.score, 0),
      averageScore: sessions.length > 0 
        ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
        : 0,
      bestScore: sessions.length > 0 
        ? Math.max(...sessions.map(s => s.score))
        : 0,
      totalRounds: sessions.reduce((sum, s) => sum + s.rounds, 0)
    };
  }
}

export default GameHistoryService;

