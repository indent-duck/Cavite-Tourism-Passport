import { useMutation, useQueryClient } from '@tanstack/react-query';
import { simulateClaim } from '@/data/api';

/**
 * Hook for simulating officer scanning and claiming a reward (dev-only)
 * 
 * Wraps simulateClaim API call with React Query mutation for state management.
 * On success, invalidates currentUser, rewards, reward detail, eligibility, and activeClaim queries to refresh UI.
 * 
 * **Dev-only:** Should only be called when __DEV__ is true
 * 
 * Validates: Dev-Only Testing Features (Simulate Officer Scan)
 */
export function useSimulateClaim(rewardId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { claimId: string; rewardId: string }
  >({
    mutationFn: ({ claimId, rewardId }) => simulateClaim(claimId, rewardId),
    onSuccess: () => {
      // Invalidate currentUser to refresh points in header
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Invalidate rewards list to refresh availability
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      
      // Invalidate specific reward detail
      queryClient.invalidateQueries({ queryKey: ['reward', rewardId] });
      
      // Invalidate eligibility for this reward
      queryClient.invalidateQueries({ queryKey: ['rewardEligibility', rewardId] });
      
      // Invalidate active claim for this reward
      queryClient.invalidateQueries({ queryKey: ['activeClaim', rewardId] });
    },
  });
}
