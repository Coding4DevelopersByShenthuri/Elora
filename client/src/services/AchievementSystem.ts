/*
  AchievementSystem: Gamification with badges, rewards, and milestones
  Tracks user progress and unlocks achievements
*/

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or icon name
  category: 'practice' | 'streak' | 'mastery' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  requirement: {
    type: 'count' | 'streak' | 'score' | 'time' | 'custom';
    target: number;
    metric: string;
  };
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lessonsCompleted: number;
  practiceTime: number; // minutes
  achievements: Achievement[];
  badges: string[];
}

class AchievementSystemClass {
  private achievements: Achievement[] = [];

  constructor() {
    this.initializeAchievements();
  }

  /**
   * Initialize all available achievements
   */
  private initializeAchievements(): void {
    this.achievements = [
      // Practice Achievements
      {
        id: 'first_lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        category: 'practice',
        tier: 'bronze',
        points: 10,
        requirement: { type: 'count', target: 1, metric: 'lessonsCompleted' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'ten_lessons',
        title: 'Dedicated Learner',
        description: 'Complete 10 lessons',
        icon: '📚',
        category: 'practice',
        tier: 'silver',
        points: 50,
        requirement: { type: 'count', target: 10, metric: 'lessonsCompleted' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'fifty_lessons',
        title: 'Knowledge Seeker',
        description: 'Complete 50 lessons',
        icon: '🎓',
        category: 'practice',
        tier: 'gold',
        points: 200,
        requirement: { type: 'count', target: 50, metric: 'lessonsCompleted' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'hundred_lessons',
        title: 'Master Student',
        description: 'Complete 100 lessons',
        icon: '👑',
        category: 'practice',
        tier: 'platinum',
        points: 500,
        requirement: { type: 'count', target: 100, metric: 'lessonsCompleted' },
        unlocked: false,
        progress: 0
      },

      // Streak Achievements
      {
        id: 'three_day_streak',
        title: 'Getting Started',
        description: 'Practice for 3 days in a row',
        icon: '🔥',
        category: 'streak',
        tier: 'bronze',
        points: 20,
        requirement: { type: 'streak', target: 3, metric: 'currentStreak' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Practice for 7 days in a row',
        icon: '⚡',
        category: 'streak',
        tier: 'silver',
        points: 50,
        requirement: { type: 'streak', target: 7, metric: 'currentStreak' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'month_streak',
        title: 'Consistency Champion',
        description: 'Practice for 30 days in a row',
        icon: '💎',
        category: 'streak',
        tier: 'gold',
        points: 300,
        requirement: { type: 'streak', target: 30, metric: 'currentStreak' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'hundred_day_streak',
        title: 'Unstoppable',
        description: 'Practice for 100 days in a row',
        icon: '🏆',
        category: 'streak',
        tier: 'platinum',
        points: 1000,
        requirement: { type: 'streak', target: 100, metric: 'currentStreak' },
        unlocked: false,
        progress: 0
      },

      // Mastery Achievements
      {
        id: 'perfect_score',
        title: 'Perfectionist',
        description: 'Get 100% on any lesson',
        icon: '⭐',
        category: 'mastery',
        tier: 'silver',
        points: 30,
        requirement: { type: 'score', target: 100, metric: 'maxScore' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'five_perfect_scores',
        title: 'Excellence Seeker',
        description: 'Get 100% on 5 lessons',
        icon: '🌟',
        category: 'mastery',
        tier: 'gold',
        points: 150,
        requirement: { type: 'count', target: 5, metric: 'perfectScores' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'pronunciation_master',
        title: 'Pronunciation Master',
        description: 'Score 90+ on pronunciation 10 times',
        icon: '🗣️',
        category: 'mastery',
        tier: 'gold',
        points: 200,
        requirement: { type: 'count', target: 10, metric: 'highPronunciation' },
        unlocked: false,
        progress: 0
      },

      // Time Achievements
      {
        id: 'one_hour',
        title: 'Time Invested',
        description: 'Practice for 1 hour total',
        icon: '⏰',
        category: 'practice',
        tier: 'bronze',
        points: 15,
        requirement: { type: 'time', target: 60, metric: 'practiceTime' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'ten_hours',
        title: 'Dedicated Time',
        description: 'Practice for 10 hours total',
        icon: '⏳',
        category: 'practice',
        tier: 'silver',
        points: 100,
        requirement: { type: 'time', target: 600, metric: 'practiceTime' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'fifty_hours',
        title: 'Time Master',
        description: 'Practice for 50 hours total',
        icon: '🕐',
        category: 'practice',
        tier: 'gold',
        points: 400,
        requirement: { type: 'time', target: 3000, metric: 'practiceTime' },
        unlocked: false,
        progress: 0
      },

      // Special Achievements
      {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Complete a lesson before 8 AM',
        icon: '🌅',
        category: 'special',
        tier: 'bronze',
        points: 25,
        requirement: { type: 'custom', target: 1, metric: 'earlyMorning' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Complete a lesson after 10 PM',
        icon: '🦉',
        category: 'special',
        tier: 'bronze',
        points: 25,
        requirement: { type: 'custom', target: 1, metric: 'lateNight' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'weekend_warrior',
        title: 'Weekend Warrior',
        description: 'Practice on both Saturday and Sunday',
        icon: '🎮',
        category: 'special',
        tier: 'silver',
        points: 40,
        requirement: { type: 'custom', target: 1, metric: 'weekendPractice' },
        unlocked: false,
        progress: 0
      },
      {
        id: 'vocabulary_builder',
        title: 'Vocabulary Builder',
        description: 'Learn 100 new words',
        icon: '📖',
        category: 'mastery',
        tier: 'gold',
        points: 250,
        requirement: { type: 'count', target: 100, metric: 'wordsLearned' },
        unlocked: false,
        progress: 0
      }
    ];
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  /**
   * Get achievements by tier
   */
  getAchievementsByTier(tier: Achievement['tier']): Achievement[] {
    return this.achievements.filter(a => a.tier === tier);
  }

  /**
   * Check and update achievements based on user progress
   */
  checkAchievements(progress: UserProgress): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      const { target, metric } = achievement.requirement;
      let currentValue = 0;

      // Get current value based on metric
      switch (metric) {
        case 'lessonsCompleted':
          currentValue = progress.lessonsCompleted;
          break;
        case 'currentStreak':
          currentValue = progress.currentStreak;
          break;
        case 'practiceTime':
          currentValue = progress.practiceTime;
          break;
        case 'maxScore':
        case 'perfectScores':
        case 'highPronunciation':
        case 'wordsLearned':
        case 'earlyMorning':
        case 'lateNight':
        case 'weekendPractice':
          // These would be tracked separately in the progress object
          currentValue = (progress as any)[metric] || 0;
          break;
      }

      // Update progress percentage
      achievement.progress = Math.min(100, (currentValue / target) * 100);

      // Check if achievement is unlocked
      if (currentValue >= target) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  /**
   * Calculate user level based on total points
   */
  calculateLevel(totalPoints: number): number {
    // Level formula: sqrt(points / 100)
    return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  }

  /**
   * Get points needed for next level
   */
  getPointsForNextLevel(currentLevel: number): number {
    const nextLevel = currentLevel + 1;
    return Math.pow(nextLevel - 1, 2) * 100;
  }

  /**
   * Get progress to next level
   */
  getLevelProgress(totalPoints: number): {
    currentLevel: number;
    nextLevel: number;
    currentLevelPoints: number;
    nextLevelPoints: number;
    progress: number;
  } {
    const currentLevel = this.calculateLevel(totalPoints);
    const nextLevel = currentLevel + 1;
    const currentLevelPoints = Math.pow(currentLevel - 1, 2) * 100;
    const nextLevelPoints = Math.pow(nextLevel - 1, 2) * 100;
    const pointsInLevel = totalPoints - currentLevelPoints;
    const pointsNeeded = nextLevelPoints - currentLevelPoints;
    const progress = (pointsInLevel / pointsNeeded) * 100;

    return {
      currentLevel,
      nextLevel,
      currentLevelPoints,
      nextLevelPoints,
      progress: Math.min(100, progress)
    };
  }

  /**
   * Get achievement statistics
   */
  getStatistics(): {
    total: number;
    unlocked: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    totalPoints: number;
  } {
    const unlocked = this.getUnlockedAchievements();
    
    return {
      total: this.achievements.length,
      unlocked: unlocked.length,
      bronze: unlocked.filter(a => a.tier === 'bronze').length,
      silver: unlocked.filter(a => a.tier === 'silver').length,
      gold: unlocked.filter(a => a.tier === 'gold').length,
      platinum: unlocked.filter(a => a.tier === 'platinum').length,
      totalPoints: unlocked.reduce((sum, a) => sum + a.points, 0)
    };
  }

  /**
   * Get next achievable achievements
   */
  getNextAchievements(limit: number = 3): Achievement[] {
    return this.achievements
      .filter(a => !a.unlocked)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit);
  }

  /**
   * Reset all achievements (for testing)
   */
  resetAchievements(): void {
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.unlockedAt = undefined;
      achievement.progress = 0;
    });
  }
}

// Singleton instance
export const AchievementSystem = new AchievementSystemClass();
export default AchievementSystem;

