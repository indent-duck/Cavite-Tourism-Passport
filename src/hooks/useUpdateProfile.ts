import { updateProfile } from '@/data/api';
import type { ProfileUpdate, User } from '@/data/types';
import { FieldError } from '@/lib/errors';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook for saving the user's name and address (Settings → Personal details)
 *
 * Writes the returned user straight into the `currentUser` cache, so the
 * passport ID card, tab header and Settings row update without a refetch.
 * When the server says the name or address is locked (changed on another
 * phone since), refetches the user so the screen shows the lock.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, ProfileUpdate>({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(['currentUser'], user);
    },
    onError: (error) => {
      if (error instanceof FieldError) {
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }
    },
  });
}
