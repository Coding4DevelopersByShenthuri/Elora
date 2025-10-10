import { userDataService } from '@/services/UserDataService';

export type KidsProgress = {
  userId: string;
  points: number;
  streak: number;
  readAloud: Record<string, { bestScore: number; attempts: number }>;
  vocabulary: Record<string, { bestScore: number; attempts: number }>;
  pronunciation: Record<string, { bestScore: number; attempts: number }>;
};

const DEFAULT_PROGRESS: Omit<KidsProgress, 'userId'> = {
  points: 0,
  streak: 0,
  readAloud: {},
  vocabulary: {},
  pronunciation: {}
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
}

export default KidsProgressService;


