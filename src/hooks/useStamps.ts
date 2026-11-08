import { useQuery } from '@tanstack/react-query';
import { getStamps } from '@/data/api';
import type { Stamp } from '@/data/types';

/**
 * Hook for fetching stamps data
 * 
 * Wraps getStamps API call with React Query for caching and state management.
 * 
 * Validates: Requirements 1.1 (Data Hooks)
 */
export function useStamps() {
  return useQuery<Stamp[], Error>({
    queryKey: ['stamps'],
    queryFn: getStamps,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
