import { signOut as apiSignOut } from '@/data/api';
import { endSession } from '@/lib/session';
import { useCallback, useState } from 'react';

/**
 * Hook for signing out the current user
 *
 * Calls signOut API, clears React Query cache (both in-memory and persisted),
 * and navigates to login screen with router.replace to prevent back navigation.
 *
 * Requirements: Hook for sign out with cache clearing
 */
export function useSignOut() {
  const [isLoading, setIsLoading] = useState(false);

  const signOut = useCallback(async () => {
    setIsLoading(true);

    try {
      // Call API to sign out (resets mock user state)
      await apiSignOut();
    } catch (error) {
      // Even if the API call fails, still leave the app locally
      console.error('Sign out error:', error);
    } finally {
      // Clears the cache and goes to the root index, which redirects to login
      endSession();
      setIsLoading(false);
    }
  }, []);

  return {
    signOut,
    isLoading,
  };
}
