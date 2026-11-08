import { useQuery } from '@tanstack/react-query';
import { getSiteById } from '@/data/api';
import type { Site } from '@/data/types';

/**
 * Hook for fetching a single site by ID
 * 
 * Wraps getSiteById API call with React Query for caching and state management.
 * Returns null if site is not found.
 * 
 * Validates: Requirements 6.1 (Data Hooks)
 */
export function useSiteById(id: string) {
  return useQuery<Site | null, Error>({
    queryKey: ['sites', id],
    queryFn: () => getSiteById(id),
    staleTime: 1000 * 60 * 60, // 1 hour (sites catalog changes infrequently)
    enabled: !!id, // Only fetch if id is provided
  });
}
