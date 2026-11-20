import { useQuery } from '@tanstack/react-query';
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
 * _Requirements: Browsing Rewards (List Screen)_
 */
export function useRewardsWithEligibility() {
  return useQuery<RewardWithEligibility[], Error>({
    queryKey: ['rewards', 'withEligibility'],
    // Reads the user and their stamps once for all rewards
    queryFn: getRewardsWithEligibility,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
