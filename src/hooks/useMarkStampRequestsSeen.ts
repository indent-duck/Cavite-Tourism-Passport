import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markStampRequestResultsSeen } from '@/data/api';
import type { StampRequest } from '@/data/types';

/**
 * Hook for recording that the user has seen review results (approved or
 * rejected stamp requests). Clears the Passport tab dot and rejection banner.
 *
 * The cache is updated optimistically so the dot/banner disappear at once.
 */
export function useMarkStampRequestsSeen() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: markStampRequestResultsSeen,
    onMutate: (ids) => {
      const seenAt = new Date();
      queryClient.setQueryData<StampRequest[]>(['stampRequests'], (requests) =>
        requests?.map((request) =>
          ids.includes(request.id) && !request.resultSeenAt
            ? { ...request, resultSeenAt: seenAt }
            : request,
        ),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stampRequests'] });
    },
  });
}
