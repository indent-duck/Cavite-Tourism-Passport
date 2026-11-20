import { queryClient } from '@/lib/query-client';
import { router, type Href } from 'expo-router';

/**
 * Leave the signed-in part of the app after signing out or deleting the account.
 *
 * Clears every cached query (the AsyncStorage persister follows the cache, so
 * the saved copy is cleared too), closes any screens stacked above the tabs,
 * and replaces what's left so the back gesture can't return to the app.
 *
 * @param href Where to land, `/` by default (redirects to login)
 */
export function endSession(href: Href = '/') {
  queryClient.clear();
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(href);
}
