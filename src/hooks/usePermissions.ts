import { useCameraPermissions as useExpoCameraPermissions } from 'expo-camera';
import { useForegroundPermissions as useExpoLocationPermissions } from 'expo-location';

/**
 * Hook for camera permission management
 *
 * Wraps expo-camera's useCameraPermissions hook.
 * Returns status, canAskAgain flag, and functions to request or re-read it.
 * `status` reads 'undetermined' until the saved status loads (`isLoaded`).
 *
 * Validates: Requirements 3.2 (Permission handling)
 */
export function useCameraPermission() {
  const [permission, requestPermission, getPermission] = useExpoCameraPermissions();

  return {
    isLoaded: permission !== null,
    status: permission?.status || 'undetermined',
    canAskAgain: permission?.canAskAgain ?? true,
    requestPermission,
    /** Re-reads the status, e.g. after the user may have changed it in Settings */
    refresh: getPermission,
  };
}

/**
 * Hook for location permission management
 *
 * Wraps expo-location's useForegroundPermissions hook.
 * Returns status, canAskAgain flag, and functions to request or re-read it.
 * `status` reads 'undetermined' until the saved status loads (`isLoaded`).
 *
 * Validates: Requirements 3.2 (Permission handling)
 */
export function useLocationPermission() {
  const [permission, requestPermission, getPermission] = useExpoLocationPermissions();

  return {
    isLoaded: permission !== null,
    status: permission?.status || 'undetermined',
    canAskAgain: permission?.canAskAgain ?? true,
    requestPermission,
    /** Re-reads the status, e.g. after the user may have changed it in Settings */
    refresh: getPermission,
  };
}
