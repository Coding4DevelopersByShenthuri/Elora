/**
 * MultiCategoryProgressService
 * 
 * Service for managing and aggregating progress across all learning categories.
 * Handles synchronization between local storage and server, and provides
 * unified progress views.
 */

import ApiService from './ApiService';

export type LearningCategory = 
  | 'young_kids' 
  | 'teen_kids' 
  | 'adults_beginner' 
  | 'adults_intermediate' 
  | 'adults_advanced' 
  | 'ielts_pte';

export interface CategoryProgress {
  id?: number;
  category: LearningCategory;
  category_display: string;
  total_points: number;
  total_streak: number;
  lessons_completed: number;
  practice_time_minutes: number;
  average_score: number;
  last_activity: string | null;
  last_activity_formatted: string | null;
  first_access: string;
  days_active: number;
  progress_percentage: number;
  level: number;
  stories_completed: number;
  vocabulary_words: number;
  pronunciation_attempts: number;
  games_completed: number;
  details: Record<string, any>;
  updated_at: string;
}

export interface AggregatedProgress {
  total_points: number;
  total_streak: number;
  total_lessons_completed: number;
  total_practice_time: number;
  average_score: number;
  categories_count: number;
  active_categories_count: number;
  categories: CategoryProgress[];
  most_active_category: string | null;
  recommended_category: string | null;
}

export interface CategoryProgressUpdate {
  points?: number;
  time_minutes?: number;
  lessons?: number;
  score?: number;
  stories_completed?: number;
  vocabulary_words?: number;
  pronunciation_attempts?: number;
  games_completed?: number;
  streak?: number;
}

class MultiCategoryProgressServiceClass {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get progress for all categories
   */
  async getAllCategoriesProgress(userId: string, forceRefresh = false): Promise<CategoryProgress[]> {
    const cacheKey = `all_categories_${userId}`;
    
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (!token || token === 'local-token') {
        // Offline mode - return empty array or local data
        return this.getLocalCategoriesProgress(userId);
      }

      const response = await ApiService.get('/user/multi-category-progress/');
      
      // Handle both array response and object with data property
      let data: CategoryProgress[];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        data = [];
      }
      
      // Log for debugging
      console.log(`Loaded ${data.length} category progress records`);
      if (data.length > 0) {
        console.log('Categories:', data.map(c => `${c.category_display}: ${c.total_points} pts`));
      }
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      // Also save to local storage for offline access
      this.saveLocalCategoriesProgress(userId, data);

      return data;
    } catch (error) {
      console.error('Error fetching all categories progress:', error);
      // Fallback to local storage
      return this.getLocalCategoriesProgress(userId);
    }
  }

  /**
   * Get progress for a specific category
   */
  async getCategoryProgress(
    userId: string, 
    category: LearningCategory,
    forceRefresh = false
  ): Promise<CategoryProgress | null> {
    const cacheKey = `category_${userId}_${category}`;
    
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (!token || token === 'local-token') {
        return this.getLocalCategoryProgress(userId, category);
      }

      const response = await ApiService.get(`/user/multi-category-progress/${category}/`);
      const data = response.data as CategoryProgress;
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      // Update local storage
      const allCategories = await this.getAllCategoriesProgress(userId);
      const updated = allCategories.map(c => 
        c.category === category ? data : c
      );
      this.saveLocalCategoriesProgress(userId, updated);

      return data;
    } catch (error) {
      console.error(`Error fetching category progress for ${category}:`, error);
      return this.getLocalCategoryProgress(userId, category);
    }
  }

  /**
   * Get aggregated progress across all categories
   */
  async getAggregatedProgress(userId: string, forceRefresh = false): Promise<AggregatedProgress> {
    const cacheKey = `aggregated_${userId}`;
    
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (!token || token === 'local-token') {
        return this.getLocalAggregatedProgress(userId);
      }

      const response = await ApiService.get('/user/multi-category-progress/aggregated/');
      const data = response.data as AggregatedProgress;
      
      // Log for debugging
      console.log('Aggregated progress:', {
        total_points: data.total_points,
        total_streak: data.total_streak,
        categories_count: data.categories_count,
        categories: data.categories?.map(c => c.category_display) || []
      });
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error fetching aggregated progress:', error);
      return this.getLocalAggregatedProgress(userId);
    }
  }

  /**
   * Update progress for a specific category
   */
  async updateCategoryProgress(
    userId: string,
    category: LearningCategory,
    update: CategoryProgressUpdate
  ): Promise<CategoryProgress> {
    try {
      const token = localStorage.getItem('speakbee_auth_token');
      
      // Update local storage immediately for instant feedback
      const localProgress = this.getLocalCategoryProgress(userId, category);
      const updatedLocal: CategoryProgress = {
        ...localProgress,
        total_points: (localProgress?.total_points || 0) + (update.points || 0),
        total_streak: Math.max(localProgress?.total_streak || 0, update.streak || 0),
        lessons_completed: (localProgress?.lessons_completed || 0) + (update.lessons || 0),
        practice_time_minutes: (localProgress?.practice_time_minutes || 0) + (update.time_minutes || 0),
        stories_completed: (localProgress?.stories_completed || 0) + (update.stories_completed || 0),
        vocabulary_words: update.vocabulary_words ?? localProgress?.vocabulary_words ?? 0,
        pronunciation_attempts: (localProgress?.pronunciation_attempts || 0) + (update.pronunciation_attempts || 0),
        games_completed: (localProgress?.games_completed || 0) + (update.games_completed || 0),
        last_activity: new Date().toISOString(),
        last_activity_formatted: new Date().toISOString(),
        category_display: this.getCategoryDisplayName(category),
      };

      // Update local storage
      const allCategories = await this.getAllCategoriesProgress(userId);
      const categoryIndex = allCategories.findIndex(c => c.category === category);
      if (categoryIndex >= 0) {
        allCategories[categoryIndex] = updatedLocal;
      } else {
        allCategories.push(updatedLocal);
      }
      this.saveLocalCategoriesProgress(userId, allCategories);

      // Clear cache
      this.cache.delete(`category_${userId}_${category}`);
      this.cache.delete(`all_categories_${userId}`);
      this.cache.delete(`aggregated_${userId}`);

      // Sync to server if online
      if (token && token !== 'local-token') {
        try {
          const response = await ApiService.post(
            `/user/multi-category-progress/${category}/update/`,
            update
          );
          return response.data as CategoryProgress;
        } catch (error) {
          console.error('Error syncing category progress to server:', error);
          // Continue with local update even if server sync fails
        }
      }

      return updatedLocal;
    } catch (error) {
      console.error(`Error updating category progress for ${category}:`, error);
      throw error;
    }
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: LearningCategory): string {
    const names: Record<LearningCategory, string> = {
      young_kids: 'Young Kids (4-10)',
      teen_kids: 'Teen Kids (11-17)',
      adults_beginner: 'Adults Beginner',
      adults_intermediate: 'Adults Intermediate',
      adults_advanced: 'Adults Advanced',
      ielts_pte: 'IELTS/PTE',
    };
    return names[category] || category;
  }

  /**
   * Get category route path
   */
  getCategoryRoute(category: LearningCategory): string {
    const routes: Record<LearningCategory, string> = {
      young_kids: '/kids/young',
      teen_kids: '/kids/teen',
      adults_beginner: '/adults/beginners',
      adults_intermediate: '/adults/intermediates',
      adults_advanced: '/adults/advanced',
      ielts_pte: '/ielts-pte',
    };
    return routes[category] || '/';
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // Private helper methods

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private getLocalCategoriesProgress(userId: string): CategoryProgress[] {
    try {
      const stored = localStorage.getItem(`multi_category_progress_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading local categories progress:', error);
    }
    return [];
  }

  private saveLocalCategoriesProgress(userId: string, progress: CategoryProgress[]): void {
    try {
      localStorage.setItem(`multi_category_progress_${userId}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving local categories progress:', error);
    }
  }

  private getLocalCategoryProgress(
    userId: string,
    category: LearningCategory
  ): CategoryProgress | null {
    const allCategories = this.getLocalCategoriesProgress(userId);
    return allCategories.find(c => c.category === category) || null;
  }

  private getLocalAggregatedProgress(userId: string): AggregatedProgress {
    const categories = this.getLocalCategoriesProgress(userId);
    
    const total_points = categories.reduce((sum, c) => sum + c.total_points, 0);
    const total_streak = Math.max(...categories.map(c => c.total_streak), 0);
    const total_lessons = categories.reduce((sum, c) => sum + c.lessons_completed, 0);
    const total_time = categories.reduce((sum, c) => sum + c.practice_time_minutes, 0);
    
    const scores = categories.filter(c => c.average_score > 0).map(c => c.average_score);
    const avg_score = scores.length > 0 
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
      : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeCategories = categories.filter(c => {
      if (!c.last_activity) return false;
      return new Date(c.last_activity) >= thirtyDaysAgo;
    });

    const mostActive = categories.length > 0
      ? categories.reduce((prev, curr) => {
          const prevDate = prev.last_activity ? new Date(prev.last_activity) : new Date(0);
          const currDate = curr.last_activity ? new Date(curr.last_activity) : new Date(0);
          return currDate > prevDate ? curr : prev;
        }).category
      : null;

    return {
      total_points,
      total_streak,
      total_lessons_completed: total_lessons,
      total_practice_time: total_time,
      average_score: avg_score,
      categories_count: categories.length,
      active_categories_count: activeCategories.length,
      categories,
      most_active_category: mostActive,
      recommended_category: null, // Will be set by recommendation service
    };
  }
}

export const MultiCategoryProgressService = new MultiCategoryProgressServiceClass();
export default MultiCategoryProgressService;

