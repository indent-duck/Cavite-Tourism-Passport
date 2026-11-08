import { useQuery } from '@tanstack/react-query';
import { getSites } from '@/data/api';
import type { Category, Site } from '@/data/types';

/**
 * Hook for fetching sites data
 * 
 * Wraps getSites API call with React Query for caching and state management.
 * Optionally filters by category.
 * 
 * Validates: Requirements 1.1 (Data Hooks)
 */
export function useSites(category?: Category) {
  return useQuery<Site[], Error>({
    queryKey: ['sites', category],
    queryFn: () => getSites(category),
    staleTime: 1000 * 60 * 60, // 1 hour (sites catalog changes infrequently)
  });
}
