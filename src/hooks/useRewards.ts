import { useQuery } from '@tanstack/react-query';
import { getRewards } from '@/data/api';
import type { Reward } from '@/data/types';

/**
 * Hook for fetching all rewards
 * 
 * Wraps getRewards API call with React Query for caching and state management.
 * 
 * Validates: Requirements 1.1 (Browsing Rewards)
 */
export function useRewards() {
  return useQuery<Reward[], Error>({
    queryKey: ['rewards'],
    queryFn: getRewards,
    staleTime: 1000 * 60 * 30, // 30 minutes (rewards catalog changes infrequently)
  });
}
