import { signOut as apiSignOut } from '@/data/api';
import { queryClient } from '@/lib/query-client';
import { router } from 'expo-router';
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

      // Clear in-memory React Query cache
      queryClient.clear();

      // Remove all queries from persisted cache
      await queryClient.removeQueries();

      // Navigate to root index which redirects to login, clearing navigation stack
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API call fails, still clear cache and navigate
      queryClient.clear();
      await queryClient.removeQueries();
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    signOut,
    isLoading,
  };
}
