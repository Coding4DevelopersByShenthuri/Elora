/**
 * TimeTracker Service
 * Tracks child's usage time and enforces daily limits
 */

interface TimeSession {
  startTime: number;
  endTime?: number;
  duration: number;
}

interface DailyUsage {
  date: string;
  totalMinutes: number;
  sessions: TimeSession[];
}

class TimeTrackerService {
  private userId: string = '';
  private sessionStart: number = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  initialize(userId: string) {
    this.userId = userId;
    this.startSession();
    
    // Update every minute
    this.timerInterval = setInterval(() => {
      this.updateCurrentSession();
    }, 60000); // 1 minute

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  startSession() {
    this.sessionStart = Date.now();
    console.log('⏱️ Time tracking session started');
  }

  endSession() {
    if (this.sessionStart > 0) {
      const duration = Math.floor((Date.now() - this.sessionStart) / 1000 / 60); // minutes
      this.addSessionTime(duration);
      this.sessionStart = 0;
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateCurrentSession() {
    if (this.sessionStart > 0) {
      const duration = Math.floor((Date.now() - this.sessionStart) / 1000 / 60); // minutes
      
      // Only save if at least 1 minute has passed
      if (duration >= 1) {
        this.addSessionTime(duration);
        this.sessionStart = Date.now(); // Reset for next minute
      }
    }
  }

  private addSessionTime(minutes: number) {
    if (minutes === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const key = `usage_${this.userId}_${today}`;
    
    let usage: DailyUsage = {
      date: today,
      totalMinutes: 0,
      sessions: []
    };

    const stored = localStorage.getItem(key);
    if (stored) {
      usage = JSON.parse(stored);
    }

    usage.totalMinutes += minutes;
    usage.sessions.push({
      startTime: Date.now() - (minutes * 60 * 1000),
      endTime: Date.now(),
      duration: minutes
    });

    localStorage.setItem(key, JSON.stringify(usage));
    
    // Update stats
    this.updateStats(minutes);

    console.log(`⏱️ Tracked ${minutes} minutes. Total today: ${usage.totalMinutes} minutes`);
  }

  private updateStats(minutesAdded: number) {
    const statsKey = `usage_stats_${this.userId}`;
    let stats = {
      totalMinutesToday: 0,
      totalMinutesWeek: 0,
      wordsLearned: 0,
      storiesCompleted: 0,
      gamesPlayed: 0,
      lastActive: new Date().toISOString()
    };

    const stored = localStorage.getItem(statsKey);
    if (stored) {
      stats = JSON.parse(stored);
    }

    stats.totalMinutesToday += minutesAdded;
    stats.lastActive = new Date().toISOString();

    localStorage.setItem(statsKey, JSON.stringify(stats));
  }

  getTodayUsage(): number {
    const today = new Date().toISOString().split('T')[0];
    const key = `usage_${this.userId}_${today}`;
    
    const stored = localStorage.getItem(key);
    if (stored) {
      const usage: DailyUsage = JSON.parse(stored);
      return usage.totalMinutes;
    }

    return 0;
  }

  getWeekUsage(): number {
    const now = new Date();
    let totalMinutes = 0;

    // Check last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const key = `usage_${this.userId}_${dateStr}`;
      
      const stored = localStorage.getItem(key);
      if (stored) {
        const usage: DailyUsage = JSON.parse(stored);
        totalMinutes += usage.totalMinutes;
      }
    }

    return totalMinutes;
  }

  getDailyLimit(): number {
    const limit = localStorage.getItem(`daily_limit_${this.userId}`);
    return limit ? parseInt(limit) : 30; // Default 30 minutes
  }

  getRemainingTime(): number {
    const used = this.getTodayUsage();
    const limit = this.getDailyLimit();
    return Math.max(0, limit - used);
  }

  hasReachedLimit(): boolean {
    return this.getRemainingTime() <= 0;
  }

  shouldShowWarning(): boolean {
    const remaining = this.getRemainingTime();
    const limit = this.getDailyLimit();
    const percentageUsed = ((limit - remaining) / limit) * 100;
    
    return percentageUsed >= 80; // Show warning at 80%
  }

  incrementActivity(type: 'word' | 'story' | 'game') {
    const statsKey = `usage_stats_${this.userId}`;
    let stats = {
      totalMinutesToday: 0,
      totalMinutesWeek: 0,
      wordsLearned: 0,
      storiesCompleted: 0,
      gamesPlayed: 0,
      lastActive: new Date().toISOString()
    };

    const stored = localStorage.getItem(statsKey);
    if (stored) {
      stats = JSON.parse(stored);
    }

    if (type === 'word') stats.wordsLearned++;
    if (type === 'story') stats.storiesCompleted++;
    if (type === 'game') stats.gamesPlayed++;

    stats.lastActive = new Date().toISOString();

    localStorage.setItem(statsKey, JSON.stringify(stats));
  }

  getStats() {
    const statsKey = `usage_stats_${this.userId}`;
    const stored = localStorage.getItem(statsKey);
    
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      totalMinutesToday: this.getTodayUsage(),
      totalMinutesWeek: this.getWeekUsage(),
      wordsLearned: 0,
      storiesCompleted: 0,
      gamesPlayed: 0,
      lastActive: new Date().toISOString()
    };
  }

  cleanup() {
    this.endSession();
  }
}

// Singleton instance
export const TimeTracker = new TimeTrackerService();

