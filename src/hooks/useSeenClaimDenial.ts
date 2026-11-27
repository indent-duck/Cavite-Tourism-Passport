import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const STORAGE_KEY = 'CLAIM_DENIAL_SEEN';
const QUERY_KEY = ['seenClaimDenial'];

/**
 * The claim denial the user has already seen (its claim ID), kept on the
 * phone so it survives restarts.
 *
 * The Rewards hub shows a denial until it's seen: dismissed on the hub, or
 * opened on the reward's own screen. A newer denial has another claim ID, so
 * it shows again.
 */
export function useSeenClaimDenial() {
  const queryClient = useQueryClient();
  const { data } = useQuery<string | null>({
    queryKey: QUERY_KEY,
    queryFn: async () => (await AsyncStorage.getItem(STORAGE_KEY)) ?? null,
    staleTime: Infinity,
  });

  const markSeen = useCallback(
    (claimId: string) => {
      if (queryClient.getQueryData(QUERY_KEY) === claimId) return;
      queryClient.setQueryData(QUERY_KEY, claimId);
      // Best effort: if it isn't saved, the notice shows again after a restart
      AsyncStorage.setItem(STORAGE_KEY, claimId).catch(() => {});
    },
    [queryClient],
  );

  return {
    /** null when none was seen; undefined while it's being read */
    seenClaimId: data,
    markSeen,
  };
}
