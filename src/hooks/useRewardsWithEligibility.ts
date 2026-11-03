import { useQuery } from '@tanstack/react-query';
import { getRewards, checkRewardEligibility } from '@/data/api';
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
 * _Requirements: Browsing Rewards (List Screen)_
 */
export function useRewardsWithEligibility() {
  return useQuery<RewardWithEligibility[], Error>({
    queryKey: ['rewards', 'withEligibility'],
    queryFn: async () => {
      // Fetch all rewards first
      const rewards = await getRewards();
      
      // Check eligibility for all rewards in parallel
      const eligibilityPromises = rewards.map((reward) =>
        checkRewardEligibility(reward.id)
      );
      
      const eligibilities = await Promise.all(eligibilityPromises);
      
      // Combine rewards with their eligibility status
      return rewards.map((reward, index) => ({
        reward,
        eligibility: eligibilities[index],
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
