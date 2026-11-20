import { useLocationPermission } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface UserCoords {
  latitude: number;
  longitude: number;
}

/**
 * The user's approximate position, for showing distances to sites.
 *
 * Never prompts on its own: it only reads the position once foreground
 * location permission is granted. Call `requestPermission` from a user action
 * (e.g. tapping "Nearest") to ask. Uses the last known fix when there is one,
 * so it resolves quickly; distances don't need a fresh GPS lock.
 *
 * The background read never asks to turn on device location either: if it's
 * off, the read just fails and distances stay hidden. Call
 * `ensureLocationOn` from a user action to ask for that.
 */
export function useUserLocation() {
  const permission = useLocationPermission();
  const granted = permission.status === 'granted';

  const query = useQuery<UserCoords, Error>({
    queryKey: ['user-location'],
    enabled: granted,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // A failure means device location is off or has no fix; retrying won't
    // change that. `ensureLocationOn` refetches once it's back on.
    retry: false,
    queryFn: async () => {
      const position =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          // Otherwise Android pops its "turn on device location" dialog
          // whenever location is off, unprompted
          mayShowUserSettingsDialog: false,
        }));
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    },
  });

  /**
   * Makes sure device location is on, for a user action that needs it. On
   * Android this shows the system "turn on device location" dialog when
   * needed; iOS has no such dialog, so it only checks. Re-reads the position
   * if there isn't one yet. Resolves `false` if location stays off.
   */
  const ensureLocationOn = async () => {
    try {
      if (Platform.OS === 'android') {
        // Resolves at once if already on; rejects if the user declines
        await Location.enableNetworkProviderAsync();
      } else if (!(await Location.hasServicesEnabledAsync())) {
        return false;
      }
    } catch {
      return false;
    }
    if (!query.data) void query.refetch();
    return true;
  };

  return {
    coords: granted ? query.data : undefined,
    // Covers the refetch after a failed read too, which isLoading doesn't
    isLocating: granted && !query.data && query.isFetching,
    permissionStatus: permission.status,
    canAskAgain: permission.canAskAgain,
    requestPermission: permission.requestPermission,
    ensureLocationOn,
  };
}
