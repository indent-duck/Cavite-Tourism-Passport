import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

/**
 * Centralized React Query configuration with AsyncStorage persistence.
 * 
 * **Validates: Requirements 1.4.4**
 * - 5-minute stale time balances freshness with network efficiency
 * - 24-hour cache keeps data available offline
 * - 7-day persistence maximum prevents indefinite stale data
 * - 2 retries handle transient network failures
 */

/**
 * Custom deserializer that converts date strings back to Date objects
 * Handles Date serialization from AsyncStorage persistence
 */
function deserialize(cachedString: string) {
  const parsed = JSON.parse(cachedString);
  
  // Recursively traverse and convert date strings to Date objects
  function reviveDates(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(reviveDates);
    }
    
    const result: any = {};
    for (const key in obj) {
      const value = obj[key];
      
      // Check if this looks like an ISO date string
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        result[key] = new Date(value);
      } else if (typeof value === 'object') {
        result[key] = reviveDates(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  return reviveDates(parsed);
}

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

// Create persister with custom deserializer
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'CAVITE_TOURISM_CACHE',
  deserialize,
});

// Configure persistence
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});
