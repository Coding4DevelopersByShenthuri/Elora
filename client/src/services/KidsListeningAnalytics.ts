/**
 * KidsListeningAnalytics
 * 
 * Tracks detailed listening comprehension metrics for parental controls/analytics
 * Works offline (localStorage) and online (syncs to server)
 * 
 * Metrics Tracked:
 * - Accuracy per story
 * - Average replays needed
 * - First-attempt success rate
 * - Time spent per story
 * - Weak areas (which questions failed)
 * - Improvement trends over time
 */

export interface QuestionAttempt {
  questionId: string;
  questionText: string;
  correct: boolean;
  attemptNumber: number;
  replaysUsed: number;
  timeSpent: number; // seconds
  timestamp: number;
}

export interface StorySession {
  storyId: string;
  storyTitle: string;
  startTime: number;
  endTime: number;
  totalQuestions: number;
  correctAnswers: number;
  firstAttemptCorrect: number;
  totalReplays: number;
  attempts: QuestionAttempt[];
  score: number;
  starsEarned: number;
  completed: boolean;
}

export interface ListeningStats {
  totalStoriesCompleted: number;
  totalQuestionsAnswered: number;
  overallAccuracy: number; // percentage
  firstAttemptAccuracy: number; // percentage
  averageReplaysPerQuestion: number;
  totalTimeSpent: number; // minutes
  favoriteStories: string[];
  weakAreas: string[]; // Question types that need practice
  strongAreas: string[]; // Question types mastered
  improvementTrend: 'improving' | 'stable' | 'declining';
  sessions: StorySession[];
}

export class KidsListeningAnalytics {
  private static STORAGE_KEY = 'speakbee_kids_listening_analytics';

  /**
   * Initialize analytics for a user
   */
  static async initialize(userId: string): Promise<void> {
    const existing = this.getStats(userId);
    if (!existing) {
      const initialStats: ListeningStats = {
        totalStoriesCompleted: 0,
        totalQuestionsAnswered: 0,
        overallAccuracy: 0,
        firstAttemptAccuracy: 0,
        averageReplaysPerQuestion: 0,
        totalTimeSpent: 0,
        favoriteStories: [],
        weakAreas: [],
        strongAreas: [],
        improvementTrend: 'stable',
        sessions: []
      };
      this.saveStats(userId, initialStats);
    }
  }

  /**
   * Start a new story session
   */
  static startSession(_userId: string, storyId: string, storyTitle: string): StorySession {
    return {
      storyId,
      storyTitle,
      startTime: Date.now(),
      endTime: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      firstAttemptCorrect: 0,
      totalReplays: 0,
      attempts: [],
      score: 0,
      starsEarned: 0,
      completed: false
    };
  }

  /**
   * Record a question attempt
   */
  static recordAttempt(
    session: StorySession,
    questionId: string,
    questionText: string,
    correct: boolean,
    attemptNumber: number,
    replaysUsed: number,
    timeSpent: number,
  ): StorySession {
    const attempt: QuestionAttempt = {
      questionId,
      questionText,
      correct,
      attemptNumber,
      replaysUsed,
      timeSpent,
      timestamp: Date.now()
    };

    session.attempts.push(attempt);
    session.totalQuestions = new Set(session.attempts.map(a => a.questionId)).size;
    session.totalReplays += replaysUsed;
    
    if (correct) {
      session.correctAnswers++;
      if (attemptNumber === 1) {
        session.firstAttemptCorrect++;
      }
    }

    return session;
  }

  /**
   * Complete a story session
   */
  static completeSession(
    userId: string,
    session: StorySession,
    finalScore: number,
    starsEarned: number
  ): void {
    session.endTime = Date.now();
    session.score = finalScore;
    session.starsEarned = starsEarned;
    session.completed = true;

    // Save to user's analytics
    const stats = this.getStats(userId) || this.createDefaultStats();
    stats.sessions.push(session);
    
    // Update aggregate stats
    this.updateAggregateStats(stats);
    
    // Save (async - syncs to MySQL)
    this.saveStats(userId, stats);
    
    // Sync to server if online
    this.syncToServer(userId, session).catch(err => 
      console.log('Analytics sync will retry later:', err)
    );
  }

  /**
   * Update aggregate statistics
   */
  private static updateAggregateStats(stats: ListeningStats): void {
    const completedSessions = stats.sessions.filter(s => s.completed);
    
    if (completedSessions.length === 0) return;

    // Total stats
    stats.totalStoriesCompleted = completedSessions.length;
    stats.totalQuestionsAnswered = completedSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    
    // Accuracy (prevent division by zero)
    const totalCorrect = completedSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    stats.overallAccuracy = stats.totalQuestionsAnswered > 0 
      ? (totalCorrect / stats.totalQuestionsAnswered) * 100 
      : 0;
    
    const totalFirstAttempt = completedSessions.reduce((sum, s) => sum + s.firstAttemptCorrect, 0);
    stats.firstAttemptAccuracy = stats.totalQuestionsAnswered > 0
      ? (totalFirstAttempt / stats.totalQuestionsAnswered) * 100
      : 0;
    
    // Average replays (prevent division by zero)
    const totalReplays = completedSessions.reduce((sum, s) => sum + s.totalReplays, 0);
    stats.averageReplaysPerQuestion = stats.totalQuestionsAnswered > 0
      ? totalReplays / stats.totalQuestionsAnswered
      : 0;
    
    // Time spent
    const totalTime = completedSessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
    stats.totalTimeSpent = Math.round(totalTime / 1000 / 60); // Convert to minutes
    
    // Identify weak and strong areas
    this.identifyLearningAreas(stats, completedSessions);
    
    // Calculate improvement trend
    this.calculateImprovementTrend(stats, completedSessions);
  }

  /**
   * Identify weak and strong areas
   */
  private static identifyLearningAreas(stats: ListeningStats, sessions: StorySession[]): void {
    const questionPerformance: Record<string, { correct: number; total: number }> = {};
    
    sessions.forEach(session => {
      session.attempts.forEach(attempt => {
        if (!questionPerformance[attempt.questionText]) {
          questionPerformance[attempt.questionText] = { correct: 0, total: 0 };
        }
        questionPerformance[attempt.questionText].total++;
        if (attempt.correct) {
          questionPerformance[attempt.questionText].correct++;
        }
      });
    });

    const weakThreshold = 0.6; // < 60% accuracy
    const strongThreshold = 0.9; // > 90% accuracy

    stats.weakAreas = [];
    stats.strongAreas = [];

    Object.entries(questionPerformance).forEach(([question, perf]) => {
      const accuracy = perf.correct / perf.total;
      if (accuracy < weakThreshold && perf.total >= 2) {
        stats.weakAreas.push(question);
      } else if (accuracy >= strongThreshold && perf.total >= 2) {
        stats.strongAreas.push(question);
      }
    });
  }

  /**
   * Calculate improvement trend
   */
  private static calculateImprovementTrend(stats: ListeningStats, sessions: StorySession[]): void {
    if (sessions.length < 3) {
      stats.improvementTrend = 'stable';
      return;
    }

    // Compare recent 3 sessions with previous 3
    const recent = sessions.slice(-3);
    const previous = sessions.slice(-6, -3);
    
    if (previous.length === 0) {
      stats.improvementTrend = 'stable';
      return;
    }

    const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    const previousAvg = previous.reduce((sum, s) => sum + s.score, 0) / previous.length;

    if (recentAvg > previousAvg + 5) {
      stats.improvementTrend = 'improving';
    } else if (recentAvg < previousAvg - 5) {
      stats.improvementTrend = 'declining';
    } else {
      stats.improvementTrend = 'stable';
    }
  }

  /**
   * Get stats for a user
   */
  static getStats(userId: string): ListeningStats | null {
    try {
      const key = `${this.STORAGE_KEY}_${userId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading analytics:', error);
      return null;
    }
  }

  /**
   * Save stats for a user (local + sync to MySQL)
   */
  private static async saveStats(userId: string, stats: ListeningStats): Promise<void> {
    try {
      // Save locally first (offline-first)
      const key = `${this.STORAGE_KEY}_${userId}`;
      localStorage.setItem(key, JSON.stringify(stats));
      
      // Sync to MySQL if online
      if (navigator.onLine) {
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/kids/analytics`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                user_id: userId,
                stats: stats
              })
            });
          } catch (error) {
            console.log('Analytics sync will retry later:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }

  /**
   * Create default stats
   */
  private static createDefaultStats(): ListeningStats {
    return {
      totalStoriesCompleted: 0,
      totalQuestionsAnswered: 0,
      overallAccuracy: 0,
      firstAttemptAccuracy: 0,
      averageReplaysPerQuestion: 0,
      totalTimeSpent: 0,
      favoriteStories: [],
      weakAreas: [],
      strongAreas: [],
      improvementTrend: 'stable',
      sessions: []
    };
  }

  /**
   * Sync to server (online mode)
   */
  private static async syncToServer(userId: string, session: StorySession): Promise<void> {
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (!token || token === 'local-token') return;

      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/kids/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          session_data: session
        })
      });
    } catch (error) {
      // Silent fail - will retry on next sync
      console.log('Analytics sync failed, stored locally:', error);
    }
  }

  /**
   * Get parent-friendly summary
   */
  static getParentSummary(userId: string): string {
    const stats = this.getStats(userId);
    if (!stats || stats.totalStoriesCompleted === 0) {
      return 'No listening activities completed yet.';
    }

    const summary = `
📊 **Listening Skills Summary**

✅ Stories Completed: ${stats.totalStoriesCompleted}
📝 Questions Answered: ${stats.totalQuestionsAnswered}
🎯 Overall Accuracy: ${stats.overallAccuracy.toFixed(1)}%
⭐ First-Try Success: ${stats.firstAttemptAccuracy.toFixed(1)}%
🔁 Avg Replays Needed: ${stats.averageReplaysPerQuestion.toFixed(1)}
⏱️ Total Time: ${stats.totalTimeSpent} minutes

📈 Trend: ${stats.improvementTrend === 'improving' ? '📈 Improving!' : stats.improvementTrend === 'declining' ? '📉 Needs support' : '➡️ Steady progress'}

${stats.strongAreas.length > 0 ? `💪 Strong Areas:\n${stats.strongAreas.slice(0, 3).join('\n')}` : ''}

${stats.weakAreas.length > 0 ? `🎯 Practice Needed:\n${stats.weakAreas.slice(0, 3).join('\n')}` : ''}
    `.trim();

    return summary;
  }

  /**
   * Export analytics as JSON (for parent download)
   */
  static exportData(userId: string): string {
    const stats = this.getStats(userId);
    return JSON.stringify(stats, null, 2);
  }
}

export default KidsListeningAnalytics;

