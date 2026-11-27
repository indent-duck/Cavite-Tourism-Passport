import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getLivePass } from '@/data/api';
import type { ActiveClaim, LivePass } from '@/data/types';

// How often the Rewards hub checks a live code, so it notices soon after an
// admin grants or denies it (the same as the reward screen)
const LIVE_PASS_POLL_MS = 5000;

/**
 * Hook for the user's one live claim code, for any reward (null if none)
 *
 * Feeds the Rewards hub banner and "Code ready" chip, and the claim
 * confirmation's "this replaces your code" warning. With `poll` (the hub,
 * while it's on screen) it checks every 5 seconds while a code is live;
 * otherwise it's refreshed when the user returns to the app, on pull to
 * refresh, and by the claim hooks. The moment the code expires it is dropped
 * from the cache, so nothing shows it as live.
 *
 * When a code that hadn't expired stops being live, an admin granted or
 * denied it (or a newer code replaced it): the user's points, the rewards
 * and the denial are refreshed *before* the code is dropped, so the hub goes
 * straight to the result instead of briefly showing nothing.
 */
export function useLivePass({ poll = false }: { poll?: boolean } = {}) {
  const queryClient = useQueryClient();
  const query = useQuery<LivePass | null, Error>({
    queryKey: ['livePass'],
    queryFn: async () => {
      const shown = queryClient.getQueryData<LivePass | null>(['livePass']);
      const pass = await getLivePass();

      const ended = shown && !pass && new Date(shown.expiresAt).getTime() > Date.now();
      if (ended) {
        // Its reward's screen must not show the old code, not even briefly
        queryClient.setQueryData<ActiveClaim | null>(['activeClaim', shown.rewardId], null);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['currentUser'] }),
          queryClient.invalidateQueries({ queryKey: ['rewards'] }),
          queryClient.invalidateQueries({ queryKey: ['rewardEligibility'] }),
          queryClient.invalidateQueries({ queryKey: ['reward', shown.rewardId] }),
          queryClient.invalidateQueries({ queryKey: ['claimDenial'] }),
        ]);
      }
      return pass;
    },
    staleTime: 1000 * 15,
    refetchOnWindowFocus: true, // Returning to the app (focusManager in query-client.ts)
    refetchInterval: (q) => (poll && q.state.data ? LIVE_PASS_POLL_MS : false),
  });

  const expiresAtMs = query.data ? new Date(query.data.expiresAt).getTime() : null;
  useEffect(() => {
    if (expiresAtMs === null) return;
    const timer = setTimeout(
      () => queryClient.setQueryData<LivePass | null>(['livePass'], null),
      Math.max(0, expiresAtMs - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [expiresAtMs, queryClient]);

  return query;
}
