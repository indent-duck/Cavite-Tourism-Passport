import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/data/api';
import type { User } from '@/data/types';

/**
 * Hook for fetching current user data
 * 
 * Wraps getCurrentUser API call with React Query for caching and state management.
 * 
 * Pass `refetchOnMount: 'always'` on screens that need the server's latest
 * (Personal details: the name and address change locks).
 *
 * Validates: Requirements 1.2.9 (Data Hooks)
 */
export function useCurrentUser(options?: { refetchOnMount?: 'always' }) {
  return useQuery<User, Error>({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: options?.refetchOnMount ?? true,
  });
}
