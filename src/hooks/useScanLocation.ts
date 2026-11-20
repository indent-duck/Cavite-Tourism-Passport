import * as Location from 'expo-location';
import { useEffect, useRef } from 'react';

export interface ScanCoords {
  latitude: number;
  longitude: number;
}

/** How long a scan waits for a GPS fix before giving up */
const FIX_TIMEOUT_MS = 10_000;

/** A watched fix older than this isn't used to verify a scan */
const MAX_FIX_AGE_MS = 30_000;

/**
 * The device position for verifying a QR scan at a site.
 *
 * While `enabled` (the scanner is open, with location permission and the
 * device's location on), it watches the position so a fresh fix is usually
 * ready by the time a code is scanned. `getCoords` returns that fix while it's
 * recent; otherwise it waits up to 10 seconds for a new one. It resolves
 * `null` when location is off or there is no fix in time, so a scan never
 * hangs on "Verifying...".
 */
export function useScanLocation(enabled: boolean) {
  const latestRef = useRef<{ coords: ScanCoords; receivedAt: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        // Keep updates coming while standing still, so the fix stays recent
        timeInterval: 5000,
        distanceInterval: 0,
        // The scanner's "Turn on location" screen asks for that instead
        mayShowUserSettingsDialog: false,
      },
      (position) => {
        latestRef.current = {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          receivedAt: Date.now(),
        };
      },
    )
      .then((watch) => {
        if (cancelled) watch.remove();
        else subscription = watch;
      })
      .catch(() => {
        // No watch; `getCoords` reads a fix when a code is scanned
      });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);

  const getCoords = async (): Promise<ScanCoords | null> => {
    const latest = latestRef.current;
    if (latest && Date.now() - latest.receivedAt < MAX_FIX_AGE_MS) {
      return latest.coords;
    }

    try {
      // Switched off since the scanner opened
      if (!(await Location.hasServicesEnabledAsync())) return null;

      const position = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          mayShowUserSettingsDialog: false,
        }),
        FIX_TIMEOUT_MS,
      );
      if (!position) return null;

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      return null;
    }
  };

  return { getCoords };
}

/** Resolves `null` if `promise` hasn't settled within `ms` */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
