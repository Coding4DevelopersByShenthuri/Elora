import { userDataService } from '@/services/UserDataService';
import StoryWordsService, { type StoryEnrollment } from './StoryWordsService';

export type KidsProgress = {
  userId: string;
  points: number;
  streak: number;
  readAloud: Record<string, { bestScore: number; attempts: number }>;
  vocabulary: Record<string, { bestScore: number; attempts: number }>;
  pronunciation: Record<string, { bestScore: number; attempts: number }>;
  storyEnrollments?: StoryEnrollment[];
};

const DEFAULT_PROGRESS: Omit<KidsProgress, 'userId'> = {
  points: 0,
  streak: 0,
  readAloud: {},
  vocabulary: {},
  pronunciation: {},
  storyEnrollments: []
};

export class KidsProgressService {
  static async get(userId: string): Promise<KidsProgress> {
    await userDataService.initDB();
    const data = await userDataService.getUserLearningData(userId as any as string);
    const kids = (data as any)?.kidsProgress as KidsProgress | undefined;
    return kids ?? ({ userId, ...DEFAULT_PROGRESS } as KidsProgress);
  }

  static async update(userId: string, updater: (p: KidsProgress) => KidsProgress): Promise<void> {
    await userDataService.initDB();
    const current = await this.get(userId);
    const updated = updater(current);
    await userDataService.saveUserLearningData(userId, { kidsProgress: updated } as any);
  }

  /**
   * Record story completion and enroll in story
   */
  static async recordStoryCompletion(
    userId: string, 
    storyId: string, 
    storyTitle: string, 
    storyType: string, 
    score: number
  ): Promise<void> {
    // Enroll in story using StoryWordsService
    StoryWordsService.enrollInStory(userId, storyId, storyTitle, storyType, score);
    
    // Update progress with story completion
    await this.update(userId, (progress) => {
      const storyEnrollments = progress.storyEnrollments || [];
      const existingIndex = storyEnrollments.findIndex(e => e.storyId === storyId);
      
      const enrollment: StoryEnrollment = {
        storyId,
        storyTitle,
        storyType,
        completed: true,
        completedAt: Date.now(),
        score,
        wordsExtracted: true
      };

      if (existingIndex >= 0) {
        storyEnrollments[existingIndex] = enrollment;
      } else {
        storyEnrollments.push(enrollment);
      }

      return {
        ...progress,
        storyEnrollments,
        points: progress.points + Math.round(score / 10) + 50 // Bonus points for story completion
      };
    });
  }

  /**
   * Get enrolled stories for a user
   */
  static getEnrolledStories(userId: string): StoryEnrollment[] {
    return StoryWordsService.getEnrolledStories(userId);
  }

  /**
   * Check if a story is enrolled
   */
  static isStoryEnrolled(userId: string, storyId: string): boolean {
    return StoryWordsService.isStoryEnrolled(userId, storyId);
  }
}

export default KidsProgressService;


