import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getActiveClaim } from '@/data/api';
import type { ActiveClaim } from '@/data/types';

// How often to check a live pass, so the screen notices soon after an
// officer redeems it
const LIVE_PASS_POLL_MS = 5000;

/**
 * Hook for the user's live claim pass for a reward (null if none or expired)
 *
 * Polls only while a pass is live (and the app is in the foreground). When a
 * pass that hadn't expired stops being live, an officer redeemed it (or the
 * user made another pass elsewhere): the user's points, claimed reward and
 * the rewards are refreshed *before* the pass is dropped, so the screen goes
 * straight to "claimed" instead of briefly offering the claim again.
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
          queryClient.invalidateQueries({ queryKey: ['rewards'] }),
          queryClient.invalidateQueries({ queryKey: ['rewardEligibility'] }),
          queryClient.invalidateQueries({ queryKey: ['reward', rewardId] }),
        ]);
      }
      return claim;
    },
    staleTime: 1000 * 10,
    refetchInterval: (query) => (query.state.data ? LIVE_PASS_POLL_MS : false),
    enabled: !!rewardId, // Only run query if rewardId is provided
  });
}
