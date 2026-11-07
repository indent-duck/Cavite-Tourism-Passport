import { useQuery } from '@tanstack/react-query';
import { getExpressways } from '@/data/api';
import type { Expressway } from '@/data/types';

/**
 * Hook for fetching all expressways
 * 
 * Wraps getExpressways API call with React Query for caching and state management.
 * Static content, cached indefinitely (staleTime: Infinity).
 * 
 * @returns React Query result with expressways data
 */
export function useExpressways() {
  return useQuery<Expressway[], Error>({
    queryKey: ['expressways'],
    queryFn: getExpressways,
    staleTime: Infinity, // Static data
  });
}
