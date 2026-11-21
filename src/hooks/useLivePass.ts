import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getLivePass } from '@/data/api';
import type { LivePass } from '@/data/types';

/**
 * Hook for the user's one live claim pass, for any reward (null if none)
 *
 * Feeds the Rewards hub banner and "Pass ready" chip, and the claim
 * confirmation's "this replaces your pass" warning. It doesn't poll: it's
 * refreshed when the user returns to the app, on pull to refresh, and by
 * the claim hooks when a pass is made, redeemed or cancelled. The moment
 * the pass expires it is dropped from the cache, so nothing shows it as live.
 */
export function useLivePass() {
  const queryClient = useQueryClient();
  const query = useQuery<LivePass | null, Error>({
    queryKey: ['livePass'],
    queryFn: getLivePass,
    staleTime: 1000 * 15,
    refetchOnWindowFocus: true, // Returning to the app (focusManager in query-client.ts)
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
