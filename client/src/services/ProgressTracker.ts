/*
  ProgressTracker: Track and analyze user learning progress
  Provides insights, statistics, and recommendations
*/

import { userDataService, type UserLearningData } from './UserDataService';
import { AchievementSystem, type UserProgress } from './AchievementSystem';

export interface DailyProgress {
  date: string;
  lessonsCompleted: number;
  practiceTime: number; // minutes
  points: number;
  averageScore: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalLessons: number;
  totalTime: number;
  totalPoints: number;
  averageScore: number;
  streak: number;
  daysActive: number;
}

export interface LearningInsight {
  type: 'strength' | 'weakness' | 'recommendation' | 'milestone';
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

class ProgressTrackerClass {
  /**
   * Get user's current progress
   */
  async getUserProgress(userId: string): Promise<UserProgress> {
    const data = await userDataService.getUserLearningData(userId);
    
    if (!data) {
      return {
        totalPoints: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lessonsCompleted: 0,
        practiceTime: 0,
        achievements: [],
        badges: []
      };
    }

    return {
      totalPoints: data.totalPoints,
      level: AchievementSystem.calculateLevel(data.totalPoints),
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      lessonsCompleted: data.lessonsCompleted,
      practiceTime: data.totalPracticeTime,
      achievements: AchievementSystem.getAllAchievements(),
      badges: []
    };
  }

  /**
   * Record lesson completion
   */
  async recordLessonCompletion(
    userId: string,
    lessonId: string,
    score: number,
    timeSpent: number
  ): Promise<void> {
    const data = await userDataService.getUserLearningData(userId);
    if (!data) return;

    // Update stats
    data.lessonsCompleted += 1;
    data.totalPracticeTime += timeSpent;
    data.totalPoints += this.calculatePoints(score, timeSpent);

    // Update streak
    this.updateStreak(data);

    // Record practice session
    data.practiceSessions.push({
      id: `session-${Date.now()}`,
      lessonId,
      score,
      duration: timeSpent,
      date: new Date().toISOString(),
      type: 'lesson'
    });

    // Check achievements
    const progress = await this.getUserProgress(userId);
    const newAchievements = AchievementSystem.checkAchievements(progress);

    if (newAchievements.length > 0) {
      // Award points for achievements
      const achievementPoints = newAchievements.reduce((sum, a) => sum + a.points, 0);
      data.totalPoints += achievementPoints;
    }

    await userDataService.saveUserLearningData(userId, data);
  }

  /**
   * Calculate points based on score and time
   */
  private calculatePoints(score: number, timeSpent: number): number {
    // Base points from score
    const basePoints = Math.round(score / 10);
    
    // Bonus for time spent (up to 10 bonus points)
    const timeBonus = Math.min(10, Math.floor(timeSpent / 5));
    
    // Perfect score bonus
    const perfectBonus = score === 100 ? 20 : 0;

    return basePoints + timeBonus + perfectBonus;
  }

  /**
   * Update user's streak
   */
  private updateStreak(data: UserLearningData): void {
    const today = new Date().toISOString().split('T')[0];
    const lastSession = data.practiceSessions[data.practiceSessions.length - 2];
    
    if (!lastSession) {
      data.currentStreak = 1;
      return;
    }

    const lastDate = new Date(lastSession.date).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (lastDate === yesterday) {
      // Continued streak
      data.currentStreak += 1;
      data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
    } else if (lastDate === today) {
      // Same day, don't change streak
      return;
    } else {
      // Streak broken
      data.currentStreak = 1;
    }
  }

  /**
   * Get daily progress for last N days
   */
  async getDailyProgress(userId: string, days: number = 30): Promise<DailyProgress[]> {
    const data = await userDataService.getUserLearningData(userId);
    if (!data) return [];

    const dailyMap = new Map<string, DailyProgress>();

    // Initialize last N days
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      dailyMap.set(date, {
        date,
        lessonsCompleted: 0,
        practiceTime: 0,
        points: 0,
        averageScore: 0
      });
    }

    // Aggregate sessions by day
    data.practiceSessions.forEach(session => {
      const date = new Date(session.date).toISOString().split('T')[0];
      const daily = dailyMap.get(date);
      
      if (daily) {
        daily.lessonsCompleted += 1;
        daily.practiceTime += session.duration;
        daily.points += this.calculatePoints(session.score, session.duration);
        daily.averageScore = (daily.averageScore * (daily.lessonsCompleted - 1) + session.score) / daily.lessonsCompleted;
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get weekly statistics
   */
  async getWeeklyStats(userId: string): Promise<WeeklyStats> {
    const data = await userDataService.getUserLearningData(userId);
    if (!data) {
      return {
        weekStart: '',
        weekEnd: '',
        totalLessons: 0,
        totalTime: 0,
        totalPoints: 0,
        averageScore: 0,
        streak: 0,
        daysActive: 0
      };
    }

    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 86400000);
    
    const weekSessions = data.practiceSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStart && sessionDate <= now;
    });

    const uniqueDays = new Set(
      weekSessions.map(s => new Date(s.date).toISOString().split('T')[0])
    );

    const totalScore = weekSessions.reduce((sum, s) => sum + s.score, 0);
    const averageScore = weekSessions.length > 0 ? totalScore / weekSessions.length : 0;

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: now.toISOString().split('T')[0],
      totalLessons: weekSessions.length,
      totalTime: weekSessions.reduce((sum, s) => sum + s.duration, 0),
      totalPoints: weekSessions.reduce((sum, s) => this.calculatePoints(s.score, s.duration), 0),
      averageScore,
      streak: data.currentStreak,
      daysActive: uniqueDays.size
    };
  }

  /**
   * Get learning insights and recommendations
   */
  async getLearningInsights(userId: string): Promise<LearningInsight[]> {
    const data = await userDataService.getUserLearningData(userId);
    if (!data) return [];

    const insights: LearningInsight[] = [];
    const recentSessions = data.practiceSessions.slice(-10);

    // Analyze recent performance
    const avgScore = recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length;

    // Strength: High scores
    if (avgScore >= 85) {
      insights.push({
        type: 'strength',
        title: 'Excellent Performance',
        description: `You're scoring an average of ${avgScore.toFixed(0)}% on recent lessons. Keep up the great work!`,
        icon: '🌟',
        priority: 'high'
      });
    }

    // Weakness: Low scores
    if (avgScore < 60) {
      insights.push({
        type: 'weakness',
        title: 'Room for Improvement',
        description: 'Consider reviewing previous lessons or trying easier content to build confidence.',
        icon: '📚',
        priority: 'high'
      });
    }

    // Streak insights
    if (data.currentStreak >= 7) {
      insights.push({
        type: 'milestone',
        title: `${data.currentStreak} Day Streak!`,
        description: 'Amazing consistency! You\'re building a strong learning habit.',
        icon: '🔥',
        priority: 'high'
      });
    } else if (data.currentStreak === 0) {
      insights.push({
        type: 'recommendation',
        title: 'Start a Streak',
        description: 'Practice daily to build momentum and improve faster.',
        icon: '⚡',
        priority: 'medium'
      });
    }

    // Practice time insights
    const weeklyTime = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    if (weeklyTime < 60) {
      insights.push({
        type: 'recommendation',
        title: 'Increase Practice Time',
        description: 'Try to practice for at least 15 minutes per day for better results.',
        icon: '⏰',
        priority: 'medium'
      });
    }

    // Milestone: Lessons completed
    if (data.lessonsCompleted === 10 || data.lessonsCompleted === 50 || data.lessonsCompleted === 100) {
      insights.push({
        type: 'milestone',
        title: `${data.lessonsCompleted} Lessons Completed!`,
        description: 'You\'re making great progress on your learning journey.',
        icon: '🎯',
        priority: 'high'
      });
    }

    return insights;
  }

  /**
   * Get performance trends
   */
  async getPerformanceTrends(userId: string): Promise<{
    improving: boolean;
    trend: number; // -1 to 1
    recommendation: string;
  }> {
    const data = await userDataService.getUserLearningData(userId);
    if (!data || data.practiceSessions.length < 5) {
      return {
        improving: true,
        trend: 0,
        recommendation: 'Complete more lessons to see your progress trends.'
      };
    }

    // Compare first half vs second half of recent sessions
    const recent = data.practiceSessions.slice(-10);
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.score, 0) / secondHalf.length;

    const trend = (secondAvg - firstAvg) / 100;
    const improving = trend > 0;

    let recommendation = '';
    if (improving) {
      recommendation = 'Great progress! You\'re improving with each lesson.';
    } else if (trend < -0.1) {
      recommendation = 'Scores are declining. Consider reviewing fundamentals or taking a break.';
    } else {
      recommendation = 'Performance is stable. Try challenging yourself with harder content.';
    }

    return { improving, trend, recommendation };
  }
}

// Singleton instance
export const ProgressTracker = new ProgressTrackerClass();
export default ProgressTracker;

