import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';

const readIsOn = () => Location.hasServicesEnabledAsync().catch(() => false);

/**
 * Whether the device's location setting is on. This is separate from the
 * app's location permission: a user can grant the permission and still have
 * location switched off.
 *
 * `isOn` is null until the first check finishes. It doesn't update by itself;
 * call `refresh` when the setting may have changed (e.g. with `useOnAppFocus`).
 */
export function useLocationServices() {
  const [isOn, setIsOn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    readIsOn().then((on) => {
      if (!cancelled) setIsOn(on);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Checks the setting again. Resolves whether location is on. */
  const refresh = async () => {
    const on = await readIsOn();
    setIsOn(on);
    return on;
  };

  /**
   * Android only: shows the system "Turn on location?" dialog inside the app.
   * Resolves whether location is on afterwards: false when the user declines
   * or the phone can't show the dialog (no Google Play services). iOS has no
   * such dialog and always resolves false.
   */
  const turnOn = async () => {
    if (Platform.OS !== 'android') return false;
    try {
      await Location.enableNetworkProviderAsync();
    } catch {
      // Declined, or the dialog isn't available
    }
    return refresh();
  };

  /**
   * Opens the system location settings on Android. iOS apps can only open
   * their own Settings page, so that opens instead.
   */
  const openSettings = async () => {
    if (Platform.OS === 'android') {
      try {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        return;
      } catch {
        // No location settings screen; fall back to the app's own page
      }
    }
    await Linking.openSettings();
  };

  return { isOn, refresh, turnOn, openSettings };
}
