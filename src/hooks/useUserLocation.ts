import { useLocationPermission } from '@/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';

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
 */
export function useUserLocation() {
  const permission = useLocationPermission();
  const granted = permission.status === 'granted';

  const query = useQuery<UserCoords, Error>({
    queryKey: ['user-location'],
    enabled: granted,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const position =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    },
  });

  return {
    coords: granted ? query.data : undefined,
    isLocating: granted && query.isLoading,
    permissionStatus: permission.status,
    canAskAgain: permission.canAskAgain,
    requestPermission: permission.requestPermission,
  };
}
