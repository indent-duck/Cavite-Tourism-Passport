import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClaimQR } from '@/data/api';
import type { ActiveClaim, GenerateClaimResult } from '@/data/types';

/**
 * Hook for generating a claim pass (QR) for a reward
 *
 * On success the new pass shows at once. The server cancels the user's
 * previous pass, possibly for another reward, so other rewards' passes are
 * dropped from the cache.
 * When the server refuses (e.g. the reward just sold out), the user and
 * rewards are refetched so the screen shows where things really stand.
 */
export function useGenerateClaimQR() {
  const queryClient = useQueryClient();

  return useMutation<GenerateClaimResult, Error, string>({
    mutationFn: (rewardId: string) => generateClaimQR(rewardId),
    onSuccess: (result, rewardId) => {
      if (result.success) {
        // The server cancelled any other live pass (one per user): drop them
        // now, so another reward's screen never shows a pass that no longer
        // works, not even for a moment while it refetches
        queryClient.setQueriesData<ActiveClaim | null>(
          { queryKey: ['activeClaim'], predicate: (query) => query.queryKey[1] !== rewardId },
          null,
        );
        queryClient.setQueryData(['activeClaim', rewardId], result.claim);
        queryClient.invalidateQueries({ queryKey: ['activeClaim', rewardId] });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['rewardEligibility'] });
      queryClient.invalidateQueries({ queryKey: ['reward', rewardId] });
    },
  });
}
