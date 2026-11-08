import { useCameraPermissions as useExpoCameraPermissions } from 'expo-camera';
import { useForegroundPermissions as useExpoLocationPermissions } from 'expo-location';

/**
 * Hook for camera permission management
 * 
 * Wraps expo-camera's useCameraPermissions hook.
 * Returns status, canAskAgain flag, and requestPermission function.
 * 
 * Validates: Requirements 3.2 (Permission handling)
 */
export function useCameraPermission() {
  const [permission, requestPermission] = useExpoCameraPermissions();

  return {
    status: permission?.status || 'undetermined',
    canAskAgain: permission?.canAskAgain ?? true,
    requestPermission,
  };
}

/**
 * Hook for location permission management
 * 
 * Wraps expo-location's useForegroundPermissions hook.
 * Returns status, canAskAgain flag, and requestPermission function.
 * 
 * Validates: Requirements 3.2 (Permission handling)
 */
export function useLocationPermission() {
  const [permission, requestPermission] = useExpoLocationPermissions();

  return {
    status: permission?.status || 'undetermined',
    canAskAgain: permission?.canAskAgain ?? true,
    requestPermission,
  };
}
