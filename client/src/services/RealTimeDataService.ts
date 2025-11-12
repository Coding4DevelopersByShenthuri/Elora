/**
 * RealTimeDataService
 * 
 * Centralized service for managing real-time data updates across the entire application.
 * Handles polling, visibility-based updates, focus-based refresh, and efficient caching.
 */

type DataType = 
  | 'category_progress'
  | 'aggregated_progress'
  | 'notifications'
  | 'user_progress'
  | 'achievements'
  | 'kids_progress'
  | 'teen_progress'
  | 'admin_stats'
  | 'admin_users'
  | 'admin_achievements'
  | 'admin_surveys'
  | 'admin_vocabulary'
  | 'admin_progress'
  | 'admin_practice'
  | 'admin_lessons';

interface Subscriber {
  id: string;
  dataType: DataType;
  callback: (data: any) => void;
  interval?: number; // Custom interval in ms, defaults to service default
  immediate?: boolean; // Fetch immediately on subscribe
}

interface DataCache {
  data: any;
  timestamp: number;
  subscribers: Set<string>;
}

class RealTimeDataServiceClass {
  private subscribers: Map<string, Subscriber> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private cache: Map<DataType, DataCache> = new Map();
  private isPageVisible: boolean = !document.hidden;
  private isWindowFocused: boolean = document.hasFocus();
  
  // Default intervals for different data types (in milliseconds)
  private readonly DEFAULT_INTERVALS: Record<DataType, number> = {
    category_progress: 15000, // 15 seconds
    aggregated_progress: 15000, // 15 seconds
    notifications: 10000, // 10 seconds
    user_progress: 20000, // 20 seconds
    achievements: 30000, // 30 seconds
    kids_progress: 5000, // 5 seconds (more frequent for active learning)
    teen_progress: 5000, // 5 seconds
    admin_stats: 30000, // 30 seconds
    admin_users: 30000, // 30 seconds
    admin_achievements: 30000, // 30 seconds
    admin_surveys: 30000, // 30 seconds
    admin_vocabulary: 30000, // 30 seconds
    admin_progress: 30000, // 30 seconds
    admin_practice: 30000, // 30 seconds
    admin_lessons: 30000, // 30 seconds
  };

  // Cache duration (data is considered fresh for this long)
  private readonly CACHE_DURATION: Record<DataType, number> = {
    category_progress: 10000, // 10 seconds
    aggregated_progress: 10000,
    notifications: 5000, // 5 seconds
    user_progress: 15000, // 15 seconds
    achievements: 60000, // 60 seconds
    kids_progress: 3000, // 3 seconds
    teen_progress: 3000,
    admin_stats: 20000, // 20 seconds
    admin_users: 20000,
    admin_achievements: 20000,
    admin_surveys: 20000,
    admin_vocabulary: 20000,
    admin_progress: 20000,
    admin_practice: 20000,
    admin_lessons: 20000,
  };

  constructor() {
    this.setupVisibilityListeners();
    this.setupFocusListeners();
  }

  /**
   * Subscribe to real-time data updates
   */
  subscribe(
    dataType: DataType,
    callback: (data: any) => void,
    options?: { interval?: number; immediate?: boolean }
  ): string {
    const subscriberId = `${dataType}_${Date.now()}_${Math.random()}`;
    const subscriber: Subscriber = {
      id: subscriberId,
      dataType,
      callback,
      interval: options?.interval,
      immediate: options?.immediate ?? true,
    };

    this.subscribers.set(subscriberId, subscriber);

    // Update cache entry to track subscriber
    const cached = this.cache.get(dataType);
    if (cached) {
      cached.subscribers.add(subscriberId);
    } else {
      this.cache.set(dataType, {
        data: null,
        timestamp: 0,
        subscribers: new Set([subscriberId]),
      });
    }

    // Start polling if not already started
    this.startPolling(dataType);

    // Fetch immediately if requested
    if (subscriber.immediate) {
      this.fetchData(dataType).catch(err => {
        console.error(`[RealTimeData] Error fetching ${dataType} on subscribe:`, err);
      });
    }

    return subscriberId;
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriberId: string): void {
    const subscriber = this.subscribers.get(subscriberId);
    if (!subscriber) return;

    this.subscribers.delete(subscriberId);

    // Update cache entry
    const cached = this.cache.get(subscriber.dataType);
    if (cached) {
      cached.subscribers.delete(subscriberId);
    }

    // Stop polling if no more subscribers
    this.stopPollingIfNeeded(subscriber.dataType);
  }

  /**
   * Manually trigger a data fetch
   */
  async refresh(dataType: DataType, force = false): Promise<any> {
    return this.fetchData(dataType, force);
  }

  /**
   * Get cached data (if available and fresh)
   */
  getCachedData(dataType: DataType): any | null {
    const cached = this.cache.get(dataType);
    if (!cached) return null;

    const cacheAge = Date.now() - cached.timestamp;
    const maxAge = this.CACHE_DURATION[dataType];

    if (cacheAge < maxAge) {
      return cached.data;
    }

    return null;
  }

  /**
   * Clear cache for a specific data type
   */
  clearCache(dataType?: DataType): void {
    if (dataType) {
      this.cache.delete(dataType);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Start polling for a data type
   */
  private startPolling(dataType: DataType): void {
    // Check if already polling
    if (this.intervals.has(dataType)) return;

    const interval = this.DEFAULT_INTERVALS[dataType];
    const poll = () => {
      // Only poll if page is visible and window is focused
      if (this.isPageVisible && this.isWindowFocused) {
        this.fetchData(dataType).catch(err => {
          console.error(`[RealTimeData] Error polling ${dataType}:`, err);
        });
      }
    };

    // Start polling
    const intervalId = setInterval(poll, interval);
    this.intervals.set(dataType, intervalId);
  }

  /**
   * Stop polling if no subscribers
   */
  private stopPollingIfNeeded(dataType: DataType): void {
    const cached = this.cache.get(dataType);
    if (!cached || cached.subscribers.size === 0) {
      const intervalId = this.intervals.get(dataType);
      if (intervalId) {
        clearInterval(intervalId);
        this.intervals.delete(dataType);
      }
    }
  }

  /**
   * Fetch data for a specific type
   */
  private async fetchData(dataType: DataType, force = false): Promise<any> {
    // Check cache first (unless forced)
    if (!force) {
      const cached = this.getCachedData(dataType);
      if (cached !== null) {
        // Notify subscribers with cached data
        this.notifySubscribers(dataType, cached);
        return cached;
      }
    }

    try {
      const data = await this.fetchDataFromSource(dataType);
      
      // Update cache
      const cached = this.cache.get(dataType) || {
        data: null,
        timestamp: 0,
        subscribers: new Set<string>(),
      };
      cached.data = data;
      cached.timestamp = Date.now();
      this.cache.set(dataType, cached);

      // Notify all subscribers
      this.notifySubscribers(dataType, data);

      return data;
    } catch (error) {
      console.error(`[RealTimeData] Error fetching ${dataType}:`, error);
      throw error;
    }
  }

  /**
   * Fetch data from the appropriate source
   */
  private async fetchDataFromSource(dataType: DataType): Promise<any> {
    const userId = localStorage.getItem('speakbee_current_user')
      ? JSON.parse(localStorage.getItem('speakbee_current_user') || '{}')?.id
      : null;

    if (!userId && !dataType.startsWith('admin_')) {
      throw new Error('User not authenticated');
    }

    switch (dataType) {
      case 'category_progress': {
        const { default: MultiCategoryProgressService } = await import('./MultiCategoryProgressService');
        return MultiCategoryProgressService.getAllCategoriesProgress(String(userId), true);
      }

      case 'aggregated_progress': {
        const { default: MultiCategoryProgressService } = await import('./MultiCategoryProgressService');
        return MultiCategoryProgressService.getAggregatedProgress(String(userId), true);
      }

      case 'notifications': {
        const { default: UserNotificationsService } = await import('./UserNotificationsService');
        return UserNotificationsService.getAll(userId, { forceRefresh: true });
      }

      case 'user_progress': {
        const { ProgressTracker } = await import('./ProgressTracker');
        return ProgressTracker.getUserProgress(String(userId));
      }

      case 'achievements': {
        const { AchievementSystem } = await import('./AchievementSystem');
        return AchievementSystem.getAllAchievements();
      }

      case 'kids_progress': {
        const { default: KidsProgressService } = await import('./KidsProgressService');
        return KidsProgressService.get(String(userId));
      }

      case 'teen_progress': {
        const { default: TeenApi } = await import('./TeenApi');
        const token = localStorage.getItem('speakbee_auth_token');
        if (token && token !== 'local-token') {
          return TeenApi.getDashboard(token);
        }
        return null;
      }

      case 'admin_stats':
      case 'admin_users':
      case 'admin_achievements':
      case 'admin_surveys':
      case 'admin_vocabulary':
      case 'admin_progress':
      case 'admin_practice':
      case 'admin_lessons':
        // Admin data fetching is handled by AdminApiService
        // Return null here - admin pages should handle their own fetching
        return null;

      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  /**
   * Notify all subscribers of a data type
   */
  private notifySubscribers(dataType: DataType, data: any): void {
    this.subscribers.forEach((subscriber) => {
      if (subscriber.dataType === dataType) {
        try {
          subscriber.callback(data);
        } catch (error) {
          console.error(`[RealTimeData] Error in subscriber callback for ${dataType}:`, error);
        }
      }
    });
  }

  /**
   * Setup visibility change listeners
   */
  private setupVisibilityListeners(): void {
    document.addEventListener('visibilitychange', () => {
      this.isPageVisible = !document.hidden;
      
      // When page becomes visible, refresh all active data types
      if (this.isPageVisible) {
        this.cache.forEach((_, dataType) => {
          if (this.intervals.has(dataType)) {
            this.fetchData(dataType, true).catch(err => {
              console.error(`[RealTimeData] Error refreshing ${dataType} on visibility:`, err);
            });
          }
        });
      }
    });
  }

  /**
   * Setup window focus listeners
   */
  private setupFocusListeners(): void {
    window.addEventListener('focus', () => {
      this.isWindowFocused = true;
      
      // Refresh data when window regains focus
      this.cache.forEach((_, dataType) => {
        if (this.intervals.has(dataType)) {
          this.fetchData(dataType, true).catch(err => {
            console.error(`[RealTimeData] Error refreshing ${dataType} on focus:`, err);
          });
        }
      });
    });

    window.addEventListener('blur', () => {
      this.isWindowFocused = false;
    });
  }

  /**
   * Get current polling status
   */
  getStatus(): { activePolling: DataType[]; subscribers: number } {
    return {
      activePolling: Array.from(this.intervals.keys()),
      subscribers: this.subscribers.size,
    };
  }

  /**
   * Cleanup all subscriptions and intervals
   */
  cleanup(): void {
    this.intervals.forEach((intervalId) => clearInterval(intervalId));
    this.intervals.clear();
    this.subscribers.clear();
    this.cache.clear();
  }
}

export const RealTimeDataService = new RealTimeDataServiceClass();
export default RealTimeDataService;

