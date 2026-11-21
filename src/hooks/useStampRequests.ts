import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getStampRequests } from '@/data/api';
import type { Stamp, StampRequest } from '@/data/types';

/**
 * Hook for fetching the current user's stamp requests (physical passport
 * stamps sent for admin review), in every status.
 *
 * Admins review on the server, so results arrive on a refetch: after the
 * short stale time, when the user returns to the app, or on pull to refresh.
 * A new approval also brings a new stamp and points, so those are refreshed
 * too (the Passport reveal waits for the stamp to load).
 */
export function useStampRequests() {
  const queryClient = useQueryClient();
  const query = useQuery<StampRequest[], Error>({
    queryKey: ['stampRequests'],
    queryFn: getStampRequests,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true, // Returning to the app (see focusManager in query-client.ts)
  });

  // Stamps of approvals the user hasn't seen yet, e.g. "12,15"
  const newApprovalStampIds = (query.data ?? [])
    .filter((request) => request.status === 'approved' && request.stampId && !request.resultSeenAt)
    .map((request) => request.stampId)
    .join(',');

  useEffect(() => {
    if (!newApprovalStampIds) return;
    const stamps = queryClient.getQueryData<Stamp[]>(['stamps']);
    const missing = newApprovalStampIds
      .split(',')
      .some((stampId) => !stamps?.some((stamp) => stamp.id === stampId));
    if (!missing) return;

    // Several screens use this hook at once; join a refetch already running
    // instead of restarting it
    const options = { cancelRefetch: false };
    queryClient.invalidateQueries({ queryKey: ['stamps'] }, options);
    queryClient.invalidateQueries({ queryKey: ['currentUser'] }, options);
    queryClient.invalidateQueries({ queryKey: ['rewards'] }, options);
  }, [newApprovalStampIds, queryClient]);

  return query;
}
