import { activityApiService } from './activityApiService';
import type { Achievement } from '../types/activity.types';

class AchievementService {
  async getAchievements(): Promise<Achievement[]> {
    return activityApiService.getAchievements();
  }
}

export const achievementService = new AchievementService();
