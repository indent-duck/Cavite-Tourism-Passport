import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { AppState } from 'react-native';

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

// React Native has no window focus: count the app coming to the foreground
// instead. Queries are not refetched on focus by default (above); the ones
// that opt in (stamp requests, reviewed on the server) refetch when the user
// returns to the app, if stale.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active');
  });
  return () => subscription.remove();
});

// Create persister with custom deserializer
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'CAVITE_TOURISM_CACHE',
  deserialize,
});

// Bump when the shape of cached data changes, so caches saved by an older
// build are discarded instead of rendered (v2: User.name -> firstName/lastName,
// v3: catalog moved from mock IDs to Supabase IDs, v4: stamps from Supabase,
// v5: stamp requests from Supabase, v6: claim passes from Supabase,
// v7: the user has hasPassword / hasGoogleSignIn, v8: expressways have a route,
// v9: the user has name/address change locks)
const CACHE_VERSION = '9';

// Configure persistence
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  buster: CACHE_VERSION,
});
