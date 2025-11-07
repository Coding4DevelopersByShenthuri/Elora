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

export class GameHistoryService {

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
    
    // Keep only last 100 sessions locally
    const sorted = localHistory.sort((a, b) => b.startTime - a.startTime);
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

            // Merge local and server sessions, removing duplicates
            const allSessions = [...localHistory, ...serverSessions];
            const uniqueSessions = allSessions.filter((session, index, self) =>
              index === self.findIndex(s => 
                s.id === session.id || 
                (s.gameType === session.gameType && 
                 Math.abs(s.startTime - session.startTime) < 60000) // Within 1 minute = same session
              )
            );

            return uniqueSessions.sort((a, b) => b.startTime - a.startTime);
          }
        }
      } catch (error) {
        console.warn('Error loading game history from server:', error);
      }
    }

    return localHistory.sort((a, b) => b.startTime - a.startTime);
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
   * Delete a game session
   */
  static async deleteGameSession(userId: string, sessionId: string): Promise<void> {
    await userDataService.initDB();
    const history = await this.getGameHistory(userId);
    const filtered = history.filter(s => s.id !== sessionId);
    await userDataService.saveUserLearningData(userId, { 
      gameHistory: filtered 
    } as any);
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

