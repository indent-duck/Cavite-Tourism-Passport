import { useQuery } from '@tanstack/react-query';
import { getActiveClaim } from '@/data/api';
import type { ActiveClaim } from '@/data/types';

/**
 * Hook for fetching active claim QR for a reward
 * 
 * Wraps getActiveClaim API call with React Query for caching and state management.
 * Returns active claim or null if none exists or expired.
 * 
 * Validates: Requirements for Viewing Reward Detail - QR Generated State
 */
export function useActiveClaim(rewardId: string) {
  return useQuery<ActiveClaim | null, Error>({
    queryKey: ['activeClaim', rewardId],
    queryFn: () => getActiveClaim(rewardId),
    staleTime: 1000 * 10, // 10 seconds - short stale time for real-time QR expiry
    refetchInterval: 1000 * 30, // Refetch every 30 seconds to check for expiry
    enabled: !!rewardId, // Only run query if rewardId is provided
  });
}
