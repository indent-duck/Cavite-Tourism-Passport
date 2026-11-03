import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/data/api';
import type { Event } from '@/data/types';

/**
 * Hook for fetching events data
 * 
 * Wraps getEvents API call with React Query for caching and state management.
 * 
 * Validates: Requirements 1.1 (Data Hooks)
 */
export function useEvents() {
  return useQuery<Event[], Error>({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 60, // 1 hour (events catalog changes infrequently)
  });
}
