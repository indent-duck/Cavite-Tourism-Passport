import { registerPushToken } from '@/data/api';
import { useSettings } from '@/hooks/useSettings';
import { getPushToken, notificationRoute, notificationUrl } from '@/lib/push-notifications';
import { useQueryClient } from '@tanstack/react-query';
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
 * - A stamp request result (sent when an admin reviews one) refreshes the
 *   requests as soon as it arrives in the open app, and again when tapped,
 *   so the screen it opens already shows the result.
 */
export function usePushNotifications() {
  const queryClient = useQueryClient();
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

    // A review result: fetch the requests again (useStampRequests then
    // refreshes the new stamp and points too)
    const refresh = (route: string | null) => {
      if (route?.startsWith('/stamp-requests')) {
        queryClient.invalidateQueries({ queryKey: ['stampRequests'] });
      }
    };

    const open = (response: Notifications.NotificationResponse) => {
      // Handled once: a later remount (e.g. after signing in again) mustn't reopen it
      Notifications.clearLastNotificationResponseAsync();
      const route = notificationRoute(response);
      refresh(route);
      if (route) router.push(route as Href);
    };

    // The notification that started the app, if any
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (active && response) open(response);
    });
    const tapped = Notifications.addNotificationResponseReceivedListener(open);
    const received = Notifications.addNotificationReceivedListener((notification) =>
      refresh(notificationUrl(notification)),
    );
    return () => {
      active = false;
      tapped.remove();
      received.remove();
    };
  }, [queryClient]);
}
