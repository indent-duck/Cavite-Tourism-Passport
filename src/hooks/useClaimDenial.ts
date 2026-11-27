import { useQuery } from '@tanstack/react-query';
import { getLatestDenial } from '@/data/api';
import type { ClaimDenial } from '@/data/types';

/**
 * Hook for why an admin denied the user's latest claim (null if it wasn't)
 *
 * With a reward ID, only a denial for that reward (its screen shows it until
 * the user gets another code). Without, a denial for any reward (the Rewards
 * hub). Refreshed by useActiveClaim and useLivePass the moment a live code is
 * reviewed, and cleared by useGenerateClaimCode when a new code is made.
 */
export function useClaimDenial(rewardId?: string) {
  return useQuery<ClaimDenial | null, Error>({
    queryKey: ['claimDenial', rewardId ?? 'any'],
    queryFn: () => getLatestDenial(rewardId),
    staleTime: 1000 * 30,
    enabled: rewardId === undefined || rewardId !== '',
  });
}
