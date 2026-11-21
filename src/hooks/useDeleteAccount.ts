import { deleteAccount, getAccountDeletionSummary } from '@/data/api';
import type { AccountDeletionSummary, DeleteAccountConfirmation } from '@/data/types';
import { forgetGoogleAccount } from '@/lib/google-sign-in';
import { endSession } from '@/lib/session';
import { useMutation, useQuery } from '@tanstack/react-query';

/**
 * What deleting the account would remove (stamps, points, pending requests,
 * active voucher). Always refetched when the delete screen opens.
 */
export function useAccountDeletionSummary() {
  return useQuery<AccountDeletionSummary, Error>({
    queryKey: ['accountDeletionSummary'],
    queryFn: getAccountDeletionSummary,
    staleTime: 0,
  });
}

/**
 * Hook for permanently deleting the account (Settings → Delete account)
 *
 * On success, clears all cached data and lands on the login screen, which
 * confirms the deletion in a feedback dialog. There is no way back into the app.
 */
export function useDeleteAccount() {
  return useMutation<void, Error, DeleteAccountConfirmation>({
    mutationFn: deleteAccount,
    onSuccess: () => {
      void forgetGoogleAccount();
      endSession({ pathname: '/login', params: { notice: 'account-deleted' } });
    },
  });
}
