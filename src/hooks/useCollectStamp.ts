import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collectStamp } from '@/data/api';
import type { CollectStampResult } from '@/data/types';

/**
 * Hook for collecting stamps via QR code scanning
 * 
 * Wraps collectStamp API call with React Query mutation for state management.
 * On success, invalidates currentUser and stamps queries to refresh UI.
 * 
 * Validates: Requirements 2.3 (Scanner hooks)
 */
export function useCollectStamp() {
  const queryClient = useQueryClient();

  return useMutation<
    CollectStampResult,
    Error,
    { payload: string; coords: { latitude: number; longitude: number } | null }
  >({
    mutationFn: ({ payload, coords }) => collectStamp(payload, coords),
    onSuccess: (result) => {
      // Only invalidate queries on successful stamp collection
      if (result.success) {
        // Invalidate currentUser to refresh points in header
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        // Invalidate stamps to refresh Passport screen
        queryClient.invalidateQueries({ queryKey: ['stamps'] });
        // Invalidate rewards so eligibility / next-reward progress updates
        queryClient.invalidateQueries({ queryKey: ['rewards'] });
      }
    },
  });
}
