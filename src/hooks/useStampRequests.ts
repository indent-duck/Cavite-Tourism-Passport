import { useQuery } from '@tanstack/react-query';
import { getStampRequests } from '@/data/api';
import type { StampRequest } from '@/data/types';

/**
 * Hook for fetching the current user's stamp requests (physical passport
 * stamps sent for admin review), in every status.
 *
 * Short stale time so review results show up soon after the admin acts.
 */
export function useStampRequests() {
  return useQuery<StampRequest[], Error>({
    queryKey: ['stampRequests'],
    queryFn: getStampRequests,
    staleTime: 1000 * 60, // 1 minute
  });
}
