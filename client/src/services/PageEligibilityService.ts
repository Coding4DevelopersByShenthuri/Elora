/**
 * Page Eligibility Service
 * 
 * Manages page unlocking based on user progress and eligibility criteria.
 * Pages are unlocked when users meet specific milestones (stories completed, 
 * points earned, streak maintained, etc.)
 */

import { API } from './ApiService';

export type PagePath = 
  | '/kids/young'
  | '/kids/teen'
  | '/adults/beginners'
  | '/adults/intermediates'
  | '/adults/advanced'
  | '/ielts-pte';

export interface EligibilityCriteria {
  stories_completed?: number;
  points?: number;
  streak?: number;
  vocabulary_words?: number;
  pronunciation_practices?: number;
  games_played?: number;
  achievements?: number;
  [key: string]: number | undefined;
}

export interface EligibilityProgress {
  [criterion: string]: {
    required: number;
    current: number;
    met: boolean;
    progress_percent: number;
  };
}

export interface PageEligibility {
  page_path: PagePath;
  required_criteria: EligibilityCriteria;
  current_progress: EligibilityProgress;
  is_unlocked: boolean;
  unlocked_at: string | null;
  progress_percent: number; // Overall progress percentage
}

class PageEligibilityServiceClass {
  private cache: Map<PagePath, PageEligibility | null> = new Map();
  private cacheExpiry: Map<PagePath, number> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  /**
   * Get eligibility status for a specific page
   */
  async getEligibility(pagePath: PagePath, forceRefresh = false): Promise<PageEligibility | null> {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.cache.get(pagePath);
      const expiry = this.cacheExpiry.get(pagePath);
      if (cached && expiry && Date.now() < expiry) {
        return cached;
      }
    }

    try {
      const token = localStorage.getItem('speakbee_auth_token');
      if (!token || token === 'local-token') {
        // For local users, check eligibility based on local progress
        return await this.checkLocalEligibility(pagePath);
      }

      const response = await API.pageEligibility.getEligibility(pagePath);
      
      // Handle both direct data and nested data response
      const data = response?.data || response;
      
      if (data) {
        const eligibility = this.normalizeEligibility(data);
        this.cache.set(pagePath, eligibility);
        this.cacheExpiry.set(pagePath, Date.now() + this.CACHE_DURATION);
        return eligibility;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching eligibility for ${pagePath}:`, error);
      // Fallback to local check
      return await this.checkLocalEligibility(pagePath);
    }
  }

  /**
   * Check eligibility for all pages
   */
  async getAllEligibilities(forceRefresh = false): Promise<Map<PagePath, PageEligibility | null>> {
    const pages: PagePath[] = [
      '/kids/young',
      '/kids/teen',
      '/adults/beginners',
      '/adults/intermediates',
      '/adults/advanced',
      '/ielts-pte',
    ];

    const results = new Map<PagePath, PageEligibility | null>();
    
    await Promise.all(
      pages.map(async (page) => {
        const eligibility = await this.getEligibility(page, forceRefresh);
        results.set(page, eligibility);
      })
    );

    return results;
  }

  /**
   * Check if a page is unlocked
   */
  async isUnlocked(pagePath: PagePath): Promise<boolean> {
    const eligibility = await this.getEligibility(pagePath);
    return eligibility?.is_unlocked ?? false;
  }

  /**
   * Check local eligibility (for offline/local users)
   */
  private async checkLocalEligibility(pagePath: PagePath): Promise<PageEligibility | null> {
    try {
      // Get user progress from localStorage
      const userId = localStorage.getItem('speakbee_user_id') || 'local-user';
      
      // Load progress data
      const progressData = await this.getLocalProgressData(userId);
      
      // Define default eligibility criteria for each page
      const defaultCriteria: Record<PagePath, EligibilityCriteria> = {
        '/kids/young': {
          // YoungKids is always unlocked (entry point)
          stories_completed: 0,
        },
        '/kids/teen': {
          // Unlock TeenKids after completing 3 stories in YoungKids
          stories_completed: 3,
          points: 200,
        },
        '/adults/beginners': {
          // Beginners is unlocked after survey
          points: 0,
        },
        '/adults/intermediates': {
          // Unlock after completing 5 lessons in beginners
          points: 500,
        },
        '/adults/advanced': {
          // Unlock after completing 10 lessons in intermediates
          points: 1000,
        },
        '/ielts-pte': {
          // Unlock after survey indicates exam prep interest
          points: 0,
        },
      };

      const criteria = defaultCriteria[pagePath];
      if (!criteria) return null;

      // Calculate progress
      const progress: EligibilityProgress = {};
      let allMet = true;
      let totalProgress = 0;
      let totalWeight = 0;

      for (const [key, required] of Object.entries(criteria)) {
        const current = progressData[key] || 0;
        const met = current >= required;
        const progressPercent = required > 0 ? Math.min(100, (current / required) * 100) : 100;

        progress[key] = {
          required,
          current,
          met,
          progress_percent: progressPercent,
        };

        if (!met) allMet = false;
        totalProgress += progressPercent;
        totalWeight += 1;
      }

      const overallProgress = totalWeight > 0 ? totalProgress / totalWeight : 0;

      return {
        page_path: pagePath,
        required_criteria: criteria,
        current_progress: progress,
        is_unlocked: allMet,
        unlocked_at: allMet ? new Date().toISOString() : null,
        progress_percent: overallProgress,
      };
    } catch (error) {
      console.error('Error checking local eligibility:', error);
      return null;
    }
  }

  /**
   * Get local progress data from localStorage
   */
  private async getLocalProgressData(userId: string): Promise<Record<string, number>> {
    try {
      // Try to load from KidsProgressService
      const { default: KidsProgressService } = await import('./KidsProgressService');
      const kidsProgress = await KidsProgressService.get(userId);
      
      // Count completed stories
      const enrolledStories = (kidsProgress as any)?.details?.storyEnrollments || [];
      const completedStories = enrolledStories.filter((s: any) => s.completed).length;

      return {
        stories_completed: completedStories,
        points: kidsProgress.points || 0,
        streak: kidsProgress.streak || 0,
        vocabulary_words: Object.keys(kidsProgress.vocabulary || {}).length,
        pronunciation_practices: Object.keys(kidsProgress.pronunciation || {}).length,
        games_played: (kidsProgress as any)?.details?.games?.attempts || 0,
        achievements: 0, // Would need to load from achievement service
      };
    } catch (error) {
      console.error('Error loading local progress:', error);
      return {
        stories_completed: 0,
        points: 0,
        streak: 0,
        vocabulary_words: 0,
        pronunciation_practices: 0,
        games_played: 0,
        achievements: 0,
      };
    }
  }

  /**
   * Normalize eligibility data from API response
   */
  private normalizeEligibility(data: any): PageEligibility {
    // Calculate overall progress
    const progressEntries = Object.values(data.current_progress || {}) as Array<{
      progress_percent: number;
    }>;
    const totalProgress = progressEntries.reduce((sum, p) => sum + p.progress_percent, 0);
    const avgProgress = progressEntries.length > 0 ? totalProgress / progressEntries.length : 0;

    return {
      page_path: data.page_path,
      required_criteria: data.required_criteria || {},
      current_progress: data.current_progress || {},
      is_unlocked: data.is_unlocked || false,
      unlocked_at: data.unlocked_at || null,
      progress_percent: avgProgress,
    };
  }

  /**
   * Clear cache for a specific page or all pages
   */
  clearCache(pagePath?: PagePath): void {
    if (pagePath) {
      this.cache.delete(pagePath);
      this.cacheExpiry.delete(pagePath);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Refresh eligibility after progress update
   */
  async refreshEligibility(pagePath?: PagePath): Promise<void> {
    if (pagePath) {
      await this.getEligibility(pagePath, true);
    } else {
      await this.getAllEligibilities(true);
    }
  }
}

export const PageEligibilityService = new PageEligibilityServiceClass();
export default PageEligibilityService;

