import { useEffect, useEffectEvent } from 'react';
import { AppState, Platform } from 'react-native';

/**
 * Calls `callback` whenever the user comes back to the app: from another app
 * (e.g. Settings) and, on Android, from the notification / quick-settings
 * panel or a system dialog, which don't change the app state.
 *
 * Use it to re-read settings the user may have changed outside the app.
 * It can fire more than once for one return, so keep the callback cheap.
 */
export function useOnAppFocus(callback: () => void) {
  const onFocus = useEffectEvent(callback);

  useEffect(() => {
    const subscriptions = [
      AppState.addEventListener('change', (state) => {
        if (state === 'active') onFocus();
      }),
    ];
    if (Platform.OS === 'android') {
      subscriptions.push(AppState.addEventListener('focus', () => onFocus()));
    }

    return () => {
      for (const subscription of subscriptions) subscription.remove();
    };
  }, []);
}
