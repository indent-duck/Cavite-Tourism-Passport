import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getActiveClaim } from '@/data/api';
import type { ActiveClaim } from '@/data/types';

// How often to check a live code, so the screen notices soon after an
// admin grants or denies it
const LIVE_PASS_POLL_MS = 5000;

/**
 * Hook for the user's live claim code for a reward (null if none or expired)
 *
 * Polls only while a code is live (and the app is in the foreground). When a
 * code that hadn't expired stops being live, an admin granted or denied it
 * (or the user made another code elsewhere): the user's points, claimed
 * reward, the rewards and the denial are refreshed *before* the code is
 * dropped, so the screen goes straight to "claimed" or "not approved"
 * instead of briefly offering the claim again.
 */
export function useActiveClaim(rewardId: string) {
  const queryClient = useQueryClient();

  return useQuery<ActiveClaim | null, Error>({
    queryKey: ['activeClaim', rewardId],
    queryFn: async () => {
      const shown = queryClient.getQueryData<ActiveClaim | null>(['activeClaim', rewardId]);
      const claim = await getActiveClaim(rewardId);

      const ended = shown && !claim && new Date(shown.expiresAt).getTime() > Date.now();
      if (ended) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['currentUser'] }),
          queryClient.invalidateQueries({ queryKey: ['livePass'] }),
          queryClient.invalidateQueries({ queryKey: ['rewards'] }),
          queryClient.invalidateQueries({ queryKey: ['rewardEligibility'] }),
          queryClient.invalidateQueries({ queryKey: ['reward', rewardId] }),
          queryClient.invalidateQueries({ queryKey: ['claimDenial', rewardId] }),
        ]);
      }
      return claim;
    },
    staleTime: 1000 * 10,
    refetchInterval: (query) => (query.state.data ? LIVE_PASS_POLL_MS : false),
    enabled: !!rewardId, // Only run query if rewardId is provided
  });
}
