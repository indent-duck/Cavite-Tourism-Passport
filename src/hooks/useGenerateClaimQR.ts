import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClaimQR } from '@/data/api';
import type { ActiveClaim } from '@/data/types';

/**
 * Hook for generating claim QR codes for rewards
 * 
 * Wraps generateClaimQR API call with React Query mutation for state management.
 * On success, invalidates activeClaim query to refetch the new QR data.
 * 
 * Validates: Requirements - Viewing Reward Detail - Eligible State #6
 */
export function useGenerateClaimQR() {
  const queryClient = useQueryClient();

  return useMutation<ActiveClaim, Error, string>({
    mutationFn: (rewardId: string) => generateClaimQR(rewardId),
    onSuccess: (_data, rewardId) => {
      // Invalidate activeClaim query to refetch the new QR data
      queryClient.invalidateQueries({ queryKey: ['activeClaim', rewardId] });
    },
  });
}
