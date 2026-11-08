import { useQuery } from '@tanstack/react-query';
import { getItineraries } from '@/data/api';
import type { Itinerary } from '@/data/types';

/**
 * Hook for fetching all itineraries
 * 
 * Wraps getItineraries API call with React Query for caching and state management.
 * Returns all 4 itineraries (Day Tour A, Day Tour B, Overnight Tour A, Overnight Tour B).
 * 
 * Validates: Requirements 6.1 (Data Hooks)
 */
export function useItineraries() {
  return useQuery<Itinerary[], Error>({
    queryKey: ['itineraries'],
    queryFn: getItineraries,
    staleTime: 1000 * 60 * 60, // 1 hour (itineraries change infrequently)
  });
}
