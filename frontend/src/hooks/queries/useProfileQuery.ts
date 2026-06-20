import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../services';
import type { UpdateProfileRequest } from '../../services';

export function useProfileQuery() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileService.updateProfile(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.setQueryData(['profile'], (old: any) => {
        if (!old) return old;
        return { ...old, profile: { ...old.profile, ...variables } };
      });
    },
  });
}
