import { registerPushToken } from '@/data/api';
import { useSettings } from '@/hooks/useSettings';
import { getPushToken, notificationRoute } from '@/lib/push-notifications';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

/**
 * Push notifications for the signed-in part of the app (used by the tabs
 * layout, which stays mounted under every other signed-in screen):
 *
 * - While "Push notifications" is on in Settings, saves this phone's Expo
 *   push token to Supabase, asking for Android's permission the first time.
 *   Turning the setting off keeps the token; the server checks the setting
 *   before sending. The token is saved again if Expo/FCM replaces it.
 * - A tapped notification opens the screen in its `data.url`, both when it
 *   started the app and while the app is running.
 */
export function usePushNotifications() {
  const { settings } = useSettings();
  const enabled = settings?.pushNotificationsEnabled ?? false;

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    const register = async (ask: boolean) => {
      try {
        const token = await getPushToken({ ask });
        if (token && active) await registerPushToken(token);
      } catch (error) {
        // Offline or Expo unreachable: the next app start tries again
        console.warn('Saving the push token failed', error);
      }
    };

    register(true);
    const subscription = Notifications.addPushTokenListener(() => register(false));
    return () => {
      active = false;
      subscription.remove();
    };
  }, [enabled]);

  useEffect(() => {
    let active = true;

    const open = (response: Notifications.NotificationResponse) => {
      // Handled once: a later remount (e.g. after signing in again) mustn't reopen it
      Notifications.clearLastNotificationResponseAsync();
      const route = notificationRoute(response);
      if (route) router.push(route as Href);
    };

    // The notification that started the app, if any
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (active && response) open(response);
    });
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
}
