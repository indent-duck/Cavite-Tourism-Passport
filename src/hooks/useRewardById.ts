import { useQuery } from '@tanstack/react-query';
import { getRewardById } from '@/data/api';
import type { Reward } from '@/data/types';

/**
 * Hook for fetching a single reward by ID
 * 
 * Wraps getRewardById API call with React Query for caching and state management.
 * 
 * Validates: Requirements for Viewing Reward Detail states
 */
export function useRewardById(id: string) {
  return useQuery<Reward | null, Error>({
    queryKey: ['reward', id],
    queryFn: () => getRewardById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id, // Only run query if id is provided
  });
}
