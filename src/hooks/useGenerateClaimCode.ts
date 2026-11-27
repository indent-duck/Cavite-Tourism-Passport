import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateClaimCode } from '@/data/api';
import type { ActiveClaim, ClaimDenial, GenerateClaimResult, LivePass, Reward } from '@/data/types';

/**
 * Hook for generating a claim code for a reward
 *
 * On success the new code shows at once. The server cancels the user's
 * previous code, possibly for another reward, so other rewards' codes are
 * dropped from the cache, and so is any denial (it was the user's latest
 * claim; now this one is).
 * When the server refuses (e.g. the reward just sold out), the user and
 * rewards are refetched so the screen shows where things really stand.
 */
export function useGenerateClaimCode() {
  const queryClient = useQueryClient();

  return useMutation<GenerateClaimResult, Error, string>({
    mutationFn: (rewardId: string) => generateClaimCode(rewardId),
    onSuccess: (result, rewardId) => {
      if (result.success) {
        // The server cancelled any other live code (one per user): drop them
        // now, so another reward's screen never shows a code that no longer
        // works, not even for a moment while it refetches
        queryClient.setQueriesData<ActiveClaim | null>(
          { queryKey: ['activeClaim'], predicate: (query) => query.queryKey[1] !== rewardId },
          null,
        );
        queryClient.setQueryData(['activeClaim', rewardId], result.claim);
        queryClient.invalidateQueries({ queryKey: ['activeClaim', rewardId] });
        queryClient.setQueriesData<ClaimDenial | null>({ queryKey: ['claimDenial'] }, null);

        // The hub banner shows the new code at once (the reward screen has
        // already loaded the reward's name), then confirms with the server
        const reward = queryClient.getQueryData<Reward | null>(['reward', rewardId]);
        if (reward) {
          const pass: LivePass = { ...result.claim, rewardTitle: reward.title };
          queryClient.setQueryData(['livePass'], pass);
        }
        queryClient.invalidateQueries({ queryKey: ['livePass'] });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['livePass'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['rewardEligibility'] });
      queryClient.invalidateQueries({ queryKey: ['reward', rewardId] });
    },
  });
}
