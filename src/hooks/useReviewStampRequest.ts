import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewStampRequest } from '@/data/api';
import type { StampRequest } from '@/data/types';

/**
 * Hook for simulating an admin approving/rejecting a stamp request (dev-only)
 *
 * On success, refreshes requests, stamps, points and reward progress, since an
 * approval adds a stamp and its points.
 *
 * **Dev-only:** Should only be called when __DEV__ is true
 */
export function useReviewStampRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    StampRequest,
    Error,
    { requestId: string; decision: 'approve' | 'reject'; reason?: string }
  >({
    mutationFn: ({ requestId, decision, reason }) => reviewStampRequest(requestId, decision, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stampRequests'] });
      queryClient.invalidateQueries({ queryKey: ['stamps'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });
}
