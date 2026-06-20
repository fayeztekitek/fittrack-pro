import { useQuery } from '@tanstack/react-query';
import { achievementService } from '../../services';

export function useAchievementsQuery() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => achievementService.getAchievements(),
  });
}
