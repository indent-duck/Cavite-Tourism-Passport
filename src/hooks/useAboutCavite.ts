import { useQuery } from '@tanstack/react-query';
import { getAboutCavite } from '@/data/api';
import type { AboutCaviteContent } from '@/data/types';

/**
 * Hook for fetching About Cavite content
 * 
 * Wraps getAboutCavite API call with React Query for caching and state management.
 * Static content, cached indefinitely (staleTime: Infinity).
 * 
 * @returns React Query result with About Cavite content
 */
export function useAboutCavite() {
  return useQuery<AboutCaviteContent, Error>({
    queryKey: ['about-cavite'],
    queryFn: getAboutCavite,
    staleTime: Infinity, // Static content
  });
}
