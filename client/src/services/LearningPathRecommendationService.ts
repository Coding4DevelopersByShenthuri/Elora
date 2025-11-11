/**
 * LearningPathRecommendationService
 * 
 * Service for recommending the next learning category based on user performance,
 * engagement, and progression logic.
 */

import { MultiCategoryProgressService, type CategoryProgress, type LearningCategory } from './MultiCategoryProgressService';
import ApiService from './ApiService';

export interface CategoryRecommendation {
  category: LearningCategory;
  category_display: string;
  route: string;
  reason: string;
  confidence: number; // 0-100
  progress_towards_unlock?: {
    current: number;
    required: number;
    percentage: number;
  };
  is_unlocked: boolean;
}

export interface LearningPath {
  current_category: LearningCategory | null;
  recommended_category: LearningCategory | null;
  progression: LearningCategory[];
  completed_categories: LearningCategory[];
  next_steps: CategoryRecommendation[];
}

class LearningPathRecommendationServiceClass {
  private readonly CATEGORY_PROGRESSION: LearningCategory[] = [
    'young_kids',
    'teen_kids',
    'adults_beginner',
    'adults_intermediate',
    'adults_advanced',
    'ielts_pte',
  ];

  /**
   * Get recommended next category
   */
  async getRecommendedCategory(userId: string): Promise<CategoryRecommendation | null> {
    try {
      const aggregated = await MultiCategoryProgressService.getAggregatedProgress(userId);
      
      // Use server recommendation if available
      if (aggregated.recommended_category) {
        const categoryProgress = aggregated.categories.find(
          c => c.category === aggregated.recommended_category
        );
        
        if (categoryProgress) {
          return this.createRecommendation(
            aggregated.recommended_category as LearningCategory,
            categoryProgress,
            aggregated.categories
          );
        }
      }

      // Fallback to client-side recommendation
      return this.calculateRecommendation(userId, aggregated.categories);
    } catch (error) {
      console.error('Error getting recommended category:', error);
      return null;
    }
  }

  /**
   * Get learning path for user
   */
  async getLearningPath(userId: string): Promise<LearningPath> {
    try {
      const categories = await MultiCategoryProgressService.getAllCategoriesProgress(userId);
      const aggregated = await MultiCategoryProgressService.getAggregatedProgress(userId);

      const completedCategories = categories
        .filter(c => c.progress_percentage >= 80 || c.lessons_completed >= 10)
        .map(c => c.category);

      const currentCategory = aggregated.most_active_category as LearningCategory | null;
      const recommendedCategory = aggregated.recommended_category as LearningCategory | null;

      // Get next steps (up to 3 recommendations)
      const nextSteps = await this.getNextSteps(userId, categories);

      return {
        current_category: currentCategory,
        recommended_category: recommendedCategory,
        progression: this.CATEGORY_PROGRESSION,
        completed_categories: completedCategories,
        next_steps: nextSteps,
      };
    } catch (error) {
      console.error('Error getting learning path:', error);
      return {
        current_category: null,
        recommended_category: null,
        progression: this.CATEGORY_PROGRESSION,
        completed_categories: [],
        next_steps: [],
      };
    }
  }

  /**
   * Get next steps (multiple recommendations)
   */
  async getNextSteps(
    userId: string,
    categories: CategoryProgress[]
  ): Promise<CategoryRecommendation[]> {
    const recommendations: CategoryRecommendation[] = [];

    // Check progression order
    for (let i = 0; i < this.CATEGORY_PROGRESSION.length; i++) {
      const category = this.CATEGORY_PROGRESSION[i];
      const progress = categories.find(c => c.category === category);

      // If category not started, check if prerequisites met
      if (!progress) {
        if (i === 0) {
          // First category - always available
          recommendations.push({
            category,
            category_display: MultiCategoryProgressService.getCategoryDisplayName(category),
            route: MultiCategoryProgressService.getCategoryRoute(category),
            reason: 'Start your learning journey here!',
            confidence: 100,
            is_unlocked: true,
          });
          break;
        }

        // Check previous category progress
        const prevCategory = this.CATEGORY_PROGRESSION[i - 1];
        const prevProgress = categories.find(c => c.category === prevCategory);

        if (prevProgress) {
          const isReady = this.isReadyForNextCategory(prevProgress, category);
          if (isReady.ready) {
            recommendations.push({
              category,
              category_display: MultiCategoryProgressService.getCategoryDisplayName(category),
              route: MultiCategoryProgressService.getCategoryRoute(category),
              reason: isReady.reason,
              confidence: isReady.confidence,
              progress_towards_unlock: isReady.progress,
              is_unlocked: isReady.unlocked,
            });
            break;
          } else if (isReady.progress) {
            // Show progress towards unlock
            recommendations.push({
              category,
              category_display: MultiCategoryProgressService.getCategoryDisplayName(category),
              route: MultiCategoryProgressService.getCategoryRoute(category),
              reason: `Complete ${prevProgress.lessons_completed}/${isReady.progress.required} lessons to unlock`,
              confidence: isReady.confidence,
              progress_towards_unlock: isReady.progress,
              is_unlocked: false,
            });
          }
        }
      } else {
        // Category started - check if needs more practice
        if (progress.average_score < 70 && progress.lessons_completed < 5) {
          recommendations.push({
            category,
            category_display: MultiCategoryProgressService.getCategoryDisplayName(category),
            route: MultiCategoryProgressService.getCategoryRoute(category),
            reason: 'Continue practicing to improve your skills',
            confidence: 80,
            is_unlocked: true,
          });
          break;
        }
      }
    }

    // If no progression recommendation, suggest based on performance
    if (recommendations.length === 0 && categories.length > 0) {
      // Find category with good progress but room for improvement
      const improvingCategory = categories.find(
        c => c.average_score >= 70 && c.progress_percentage < 80
      );

      if (improvingCategory) {
        recommendations.push({
          category: improvingCategory.category,
          category_display: improvingCategory.category_display,
          route: MultiCategoryProgressService.getCategoryRoute(improvingCategory.category),
          reason: 'You\'re doing great! Continue to master this category',
          confidence: 75,
          is_unlocked: true,
        });
      } else {
        // Default to most active category
        const mostActive = categories.reduce((prev, curr) => {
          const prevDate = prev.last_activity ? new Date(prev.last_activity) : new Date(0);
          const currDate = curr.last_activity ? new Date(curr.last_activity) : new Date(0);
          return currDate > prevDate ? curr : prev;
        });

        recommendations.push({
          category: mostActive.category,
          category_display: mostActive.category_display,
          route: MultiCategoryProgressService.getCategoryRoute(mostActive.category),
          reason: 'Continue your learning journey here',
          confidence: 70,
          is_unlocked: true,
        });
      }
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  /**
   * Calculate recommendation based on categories
   */
  private calculateRecommendation(
    userId: string,
    categories: CategoryProgress[]
  ): CategoryRecommendation | null {
    const nextSteps = this.getNextSteps(userId, categories);
    return nextSteps.length > 0 ? nextSteps[0] : null;
  }

  /**
   * Check if user is ready for next category
   */
  private isReadyForNextCategory(
    currentProgress: CategoryProgress,
    nextCategory: LearningCategory
  ): {
    ready: boolean;
    reason: string;
    confidence: number;
    unlocked: boolean;
    progress?: { current: number; required: number; percentage: number };
  } {
    // Define unlock criteria for each category
    const unlockCriteria: Record<LearningCategory, { lessons: number; points: number; score?: number }> = {
      young_kids: { lessons: 0, points: 0 }, // Always unlocked
      teen_kids: { lessons: 3, points: 200 },
      adults_beginner: { lessons: 0, points: 0 }, // Unlocked after survey
      adults_intermediate: { lessons: 10, points: 500, score: 70 },
      adults_advanced: { lessons: 15, points: 1000, score: 75 },
      ielts_pte: { lessons: 0, points: 1500 }, // Can be unlocked with high points or survey
    };

    const criteria = unlockCriteria[nextCategory];
    if (!criteria) {
      return {
        ready: false,
        reason: 'Category not available',
        confidence: 0,
        unlocked: false,
      };
    }

    // Check if criteria met
    const lessonsMet = currentProgress.lessons_completed >= criteria.lessons;
    const pointsMet = currentProgress.total_points >= criteria.points;
    const scoreMet = criteria.score ? currentProgress.average_score >= criteria.score : true;

    const allMet = lessonsMet && pointsMet && scoreMet;

    if (allMet) {
      return {
        ready: true,
        reason: 'You\'ve completed the prerequisites! Ready to advance.',
        confidence: 95,
        unlocked: true,
      };
    }

    // Calculate progress
    const progress = {
      current: Math.min(
        Math.floor((currentProgress.lessons_completed / criteria.lessons) * 50) +
        Math.floor((currentProgress.total_points / criteria.points) * 50),
        100
      ),
      required: 100,
      percentage: 0,
    };
    progress.percentage = progress.current;

    let reason = 'Complete more lessons to unlock';
    if (!lessonsMet) {
      reason = `Complete ${criteria.lessons - currentProgress.lessons_completed} more lessons`;
    } else if (!pointsMet) {
      reason = `Earn ${criteria.points - currentProgress.total_points} more points`;
    } else if (!scoreMet && criteria.score) {
      reason = `Improve your average score to ${criteria.score}%`;
    }

    return {
      ready: false,
      reason,
      confidence: progress.percentage,
      unlocked: false,
      progress,
    };
  }

  /**
   * Create recommendation object
   */
  private createRecommendation(
    category: LearningCategory,
    progress: CategoryProgress,
    allCategories: CategoryProgress[]
  ): CategoryRecommendation {
    const isUnlocked = progress.total_points > 0 || progress.lessons_completed > 0;
    
    let reason = 'Continue your learning journey';
    if (progress.lessons_completed === 0) {
      reason = 'Start exploring this category';
    } else if (progress.average_score >= 80) {
      reason = 'Excellent progress! Keep up the great work';
    } else if (progress.average_score >= 70) {
      reason = 'Good progress! Continue practicing';
    } else {
      reason = 'Practice more to improve your skills';
    }

    return {
      category,
      category_display: progress.category_display,
      route: MultiCategoryProgressService.getCategoryRoute(category),
      reason,
      confidence: progress.average_score > 0 ? Math.min(progress.average_score, 100) : 50,
      is_unlocked: isUnlocked,
    };
  }
}

export const LearningPathRecommendationService = new LearningPathRecommendationServiceClass();
export default LearningPathRecommendationService;

