import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

/**
 * The Android channel every notification uses (also the expo-notifications
 * plugin's defaultChannel in app.json). Server messages must send this
 * channelId, or Android drops them.
 */
export const DEFAULT_CHANNEL_ID = 'default';

// The Expo push token this phone last saved to Supabase, so signing out can
// remove it without asking Expo again
const SAVED_TOKEN_KEY = 'push-token';

/** Show notifications that arrive while the app is open, like when it's closed */
export function showNotificationsInForeground() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export type PushPermission = 'granted' | 'undetermined' | 'denied';

/** Whether this phone lets the app show notifications ('denied' = only system settings can change it) */
export async function getPushPermission(): Promise<PushPermission> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  return canAskAgain ? 'undetermined' : 'denied';
}

/**
 * This phone's Expo push token, or null when notifications aren't allowed.
 *
 * Android 13+ only shows the permission prompt once a channel exists, so
 * the channel is created first. With `ask`, an undecided permission is
 * requested; otherwise the user isn't bothered.
 */
export async function getPushToken({ ask }: { ask: boolean }): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: 'Passport updates',
      // The enum is exported (export * from its types file), but the lint rule can't follow it
      // eslint-disable-next-line import/namespace
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  let permission = await getPushPermission();
  if (permission === 'undetermined' && ask) {
    const { status } = await Notifications.requestPermissionsAsync();
    permission = status === 'granted' ? 'granted' : 'denied';
  }
  if (permission !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

export async function rememberPushToken(token: string): Promise<void> {
  await AsyncStorage.setItem(SAVED_TOKEN_KEY, token);
}

/** The token this phone last saved to Supabase, and forget it */
export async function takeSavedPushToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(SAVED_TOKEN_KEY);
  await AsyncStorage.removeItem(SAVED_TOKEN_KEY);
  return token;
}

/** Open the app's page in system settings, where blocked notifications can be allowed */
export function openNotificationSettings() {
  Linking.openSettings();
}

/**
 * The app route a notification should open when tapped: its `data.url`, if
 * it's an in-app path such as "/stamp-requests" or "/rewards/12"
 */
export function notificationRoute(response: Notifications.NotificationResponse): string | null {
  const url = response.notification.request.content.data?.url;
  return typeof url === 'string' && url.startsWith('/') ? url : null;
}
