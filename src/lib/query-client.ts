import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Centralized React Query configuration with AsyncStorage persistence.
 * 
 * **Validates: Requirements 1.4.4**
 * - 5-minute stale time balances freshness with network efficiency
 * - 24-hour cache keeps data available offline
 * - 7-day persistence maximum prevents indefinite stale data
 * - 2 retries handle transient network failures
 */

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Create persister
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'CAVITE_TOURISM_CACHE',
});

// Configure persistence
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});
