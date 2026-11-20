import { changePassword, sendReauthenticationCode } from '@/data/api';
import type { PasswordChangeProof } from '@/data/types';
import { useMutation } from '@tanstack/react-query';

/**
 * Hooks for changing the password while signed in (Settings → Change password)
 *
 * - `changePassword`: sets the new password, proven by the current password
 *   or by an emailed code
 * - `sendCode`: emails that code, for users who don't remember their current
 *   password
 */
export function useChangePassword() {
  const changePasswordMutation = useMutation<
    void,
    Error,
    { newPassword: string; proof: PasswordChangeProof }
  >({
    mutationFn: ({ newPassword, proof }) => changePassword(newPassword, proof),
  });

  const sendCodeMutation = useMutation<void, Error, void>({
    mutationFn: sendReauthenticationCode,
  });

  return {
    changePassword: changePasswordMutation,
    sendCode: sendCodeMutation,
  };
}
