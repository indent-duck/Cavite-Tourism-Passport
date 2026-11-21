import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRewardsWithEligibility } from '@/data/api';
import type { Reward, RewardEligibility } from '@/data/types';

export interface RewardWithEligibility {
  reward: Reward;
  eligibility: RewardEligibility;
}

/**
 * Hook for fetching all rewards with their eligibility status
 * 
 * Combines reward data with eligibility checks for efficient list rendering.
 * Single query prevents creating separate queries per reward card.
 *
 * Each fetch also refreshes the reward screen's own caches (['reward', id]
 * and ['rewardEligibility', id]), so a reward never shows one status in the
 * list and another on its screen (e.g. still "sold out" after a restock).
 *
 * _Requirements: Browsing Rewards (List Screen)_
 */
export function useRewardsWithEligibility() {
  const queryClient = useQueryClient();

  return useQuery<RewardWithEligibility[], Error>({
    queryKey: ['rewards', 'withEligibility'],
    // Reads the user and their stamps once for all rewards
    queryFn: async () => {
      const items = await getRewardsWithEligibility();
      for (const { reward, eligibility } of items) {
        queryClient.setQueryData(['reward', reward.id], reward);
        queryClient.setQueryData(['rewardEligibility', reward.id], eligibility);
      }
      return items;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
