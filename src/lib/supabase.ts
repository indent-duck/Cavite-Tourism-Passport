import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

// Inlined by Expo at bundle time, so they must be written out in full
// (no destructuring or process.env[name]). Values live in .env locally and
// must be added as EAS environment variables for preview/production builds.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Add them to .env (or the EAS environment) and restart Expo.',
  );
}

/**
 * The app's Supabase client. Only src/data/api.ts should import it, so
 * screens and hooks stay independent of the backend.
 *
 * The session (login) is kept in AsyncStorage, which is already in the
 * development build. Phones have no URL to read a session from, hence
 * detectSessionInUrl: false.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Keep the session fresh only while the app is in the foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
