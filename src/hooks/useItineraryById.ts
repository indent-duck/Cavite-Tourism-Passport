import { useQuery } from '@tanstack/react-query';
import { getItineraryById } from '@/data/api';
import type { Itinerary } from '@/data/types';

/**
 * Hook for fetching a single itinerary by ID
 * 
 * Wraps getItineraryById API call with React Query for caching and state management.
 * Returns null if itinerary is not found.
 * 
 * Validates: Requirements 6.1 (Data Hooks)
 */
export function useItineraryById(id: string) {
  return useQuery<Itinerary | null, Error>({
    queryKey: ['itineraries', id],
    queryFn: () => getItineraryById(id),
    staleTime: 1000 * 60 * 60, // 1 hour (itineraries change infrequently)
    enabled: !!id, // Only fetch if id is provided
  });
}
