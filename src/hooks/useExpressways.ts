import { useQuery } from '@tanstack/react-query';
import { getExpressways } from '@/data/api';
import type { Expressway } from '@/data/types';

/**
 * Hook for fetching all expressways
 *
 * Wraps getExpressways API call with React Query for caching and state management.
 * Rarely changes, but not never: a new section opening means a new route
 * line, and the Tourism Office's descriptions are still to come. Refetched
 * once a day so phones with a saved cache pick those up.
 *
 * @returns React Query result with expressways data
 */
export function useExpressways() {
  return useQuery<Expressway[], Error>({
    queryKey: ['expressways'],
    queryFn: getExpressways,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
