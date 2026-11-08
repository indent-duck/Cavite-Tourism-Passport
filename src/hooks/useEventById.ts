import { useQuery } from '@tanstack/react-query';
import { getEventById } from '@/data/api';
import type { Event } from '@/data/types';

/**
 * Hook for fetching a single event by ID
 * 
 * Wraps getEventById API call with React Query for caching and state management.
 * 
 * @param id - Event ID to fetch
 * @returns React Query result with event data
 */
export function useEventById(id: string) {
  return useQuery<Event, Error>({
    queryKey: ['events', id],
    queryFn: () => getEventById(id),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id, // Only run query if id is provided
  });
}
