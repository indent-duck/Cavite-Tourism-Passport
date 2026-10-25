import { useQuery } from '@tanstack/react-query';
import { getPromoPeriod } from '@/data/api';
import type { PromoPeriod } from '@/data/types';

/**
 * Hook for fetching promo period data
 * 
 * Wraps getPromoPeriod API call with React Query for caching and state management.
 * 
 * Validates: Requirements 1.2.9 (Data Hooks)
 */
export function usePromoPeriod() {
  return useQuery<PromoPeriod, Error>({
    queryKey: ['promoPeriod'],
    queryFn: getPromoPeriod,
    staleTime: 1000 * 60 * 60, // 1 hour (promo period changes infrequently)
  });
}
