import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitStampRequest } from '@/data/api';
import type { SubmitStampRequestInput, SubmitStampRequestResult } from '@/data/types';

/**
 * Hook for submitting a physical-stamp request for admin review.
 * On success, refreshes the stamp requests list.
 */
export function useSubmitStampRequest() {
  const queryClient = useQueryClient();

  return useMutation<SubmitStampRequestResult, Error, SubmitStampRequestInput>({
    mutationFn: submitStampRequest,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['stampRequests'] });
      }
    },
  });
}
