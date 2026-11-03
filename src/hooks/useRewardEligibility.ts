import { useQuery } from '@tanstack/react-query';
import { checkRewardEligibility } from '@/data/api';
import type { RewardEligibility } from '@/data/types';

/**
 * Hook for checking reward eligibility
 * 
 * Wraps checkRewardEligibility API call with React Query for caching and state management.
 * Enabled only when rewardId is provided.
 * 
 * Requirements: Viewing Reward Detail states
 */
export function useRewardEligibility(rewardId?: string) {
  return useQuery<RewardEligibility, Error>({
    queryKey: ['rewardEligibility', rewardId],
    queryFn: () => {
      if (!rewardId) {
        throw new Error('Reward ID is required');
      }
      return checkRewardEligibility(rewardId);
    },
    enabled: !!rewardId,
    staleTime: 1000 * 60, // 1 minute (eligibility can change as user collects stamps)
  });
}
