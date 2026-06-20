import { useQuery } from '@tanstack/react-query';
import { activityApiService } from '../../services';
import type { ActivityType } from '../../types/activity.types';

export function useActivitiesQuery(options?: {
  take?: number;
  skip?: number;
  type?: ActivityType;
}) {
  return useQuery({
    queryKey: ['activities', options],
    queryFn: async () => {
      const res = await activityApiService.listActivities(options);
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
      return { data: sorted, total: res.total };
    },
  });
}
