import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useCameraPermission, useLocationPermission } from '@/hooks/usePermissions';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { BackHandler, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Scanner Screen
 * 
 * Opens from the center Scan tab button.
 * Implements three-stage permission gate before showing scanner viewfinder:
 * 1. Primer screen: explains why camera and location are needed
 * 2. System prompts: sequential camera and location permission requests
 * 3. Blocked screen: shown when either permission is denied
 * 
 * Validates: Requirements 3.2 (Permission primer and blocked screens)
 */

type PermissionStage = 'primer' | 'requesting' | 'blocked' | 'granted';

export default function ScannerScreen() {
  const cameraPermission = useCameraPermission();
  const locationPermission = useLocationPermission();
  const [isRequesting, setIsRequesting] = useState(false);

  // Determine the current stage based on permission statuses
  const getStage = (): PermissionStage => {
    if (isRequesting) {
      return 'requesting';
    }

    const cameraGranted = cameraPermission.status === 'granted';
    const locationGranted = locationPermission.status === 'granted';

    if (cameraGranted && locationGranted) {
      return 'granted';
    } else if (
      cameraPermission.status === 'denied' ||
      locationPermission.status === 'denied'
    ) {
      return 'blocked';
    }

    return 'primer';
  };

  const stage = getStage();

  // Determine which permission is missing for the blocked screen
  const missingPermission = (): string => {
    const missing: string[] = [];
    if (cameraPermission.status !== 'granted') missing.push('Camera');
    if (locationPermission.status !== 'granted') missing.push('Location');
    return missing.join(' and ');
  };

  // Handle Android back button
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        router.back();
        return true; // Prevent default behavior
      });

      return () => backHandler.remove();
    }, [])
  );

  // Handle "Continue" button on primer screen
  const handleContinue = async () => {
    setIsRequesting(true);

    // Request camera permission first
    const cameraResult = await cameraPermission.requestPermission();
    if (!cameraResult.granted) {
      setIsRequesting(false);
      return;
    }

    // Then request location permission
    await locationPermission.requestPermission();
    setIsRequesting(false);
  };

  // Handle "Not now" button
  const handleNotNow = () => {
    router.back();
  };

  // Handle "Grant permission" button on blocked screen
  const handleGrantPermission = async () => {
    setIsRequesting(true);
    // Try requesting permissions again
    await cameraPermission.requestPermission();
    await locationPermission.requestPermission();
    setIsRequesting(false);
  };

  // Handle "Open settings" button on blocked screen
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  // Close button handler
  const handleClose = () => {
    router.back();
  };

  // Render based on stage
  if (stage === 'granted') {
    // TODO: Task 5 will implement the viewfinder
    return (
      <ScreenContainer
        scrollable={false}
        edges={['top', 'left', 'right', 'bottom']}
        testID="scanner-screen"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Scanner Viewfinder</Text>
          <Text style={styles.subtitle}>Camera viewfinder coming in task 5</Text>
          <View style={styles.buttonGroup}>
            <Button
              title="Close"
              onPress={handleClose}
              variant="outline"
              fullWidth
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (stage === 'blocked') {
    // Determine if we can ask again or need to direct to settings
    const canAskAgain = cameraPermission.canAskAgain && locationPermission.canAskAgain;

    return (
      <ScreenContainer
        scrollable={false}
        edges={['top', 'left', 'right', 'bottom']}
        testID="scanner-blocked"
      >
        {/* Close button */}
        <View style={styles.closeButtonContainer}>
          <Pressable onPress={handleClose} hitSlop={spacing.md}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={colors.textSecondary} />
          </View>

          <Text style={styles.title}>Camera and location access needed</Text>
          <Text style={styles.subtitle}>
            {missingPermission()} permission is required to scan QR codes and verify your
            location at partner sites.
          </Text>

          <View style={styles.buttonGroup}>
            {canAskAgain ? (
              <Button
                title="Grant permission"
                onPress={handleGrantPermission}
                variant="accent"
                fullWidth
              />
            ) : (
              <Button
                title="Open settings"
                onPress={handleOpenSettings}
                variant="accent"
                fullWidth
              />
            )}
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (stage === 'requesting') {
    return (
      <ScreenContainer
        scrollable={false}
        edges={['top', 'left', 'right', 'bottom']}
        testID="scanner-requesting"
      >
        <View style={styles.container}>
          <Text style={styles.subtitle}>Requesting permissions...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Default: primer screen
  return (
    <ScreenContainer
      scrollable={false}
      edges={['top', 'left', 'right', 'bottom']}
      testID="scanner-primer"
    >
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="camera-outline" size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>Ready to collect stamps?</Text>
        <Text style={styles.subtitle}>
          To scan QR codes and verify your location, we need access to:
        </Text>

        <View style={styles.permissionList}>
          <View style={styles.permissionItem}>
            <View style={styles.permissionIconContainer}>
              <Ionicons name="camera" size={20} color={colors.primary} />
            </View>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Camera</Text>
              <Text style={styles.permissionDescription}>Scan QR codes</Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            <View style={styles.permissionIconContainer}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Location</Text>
              <Text style={styles.permissionDescription}>Confirm you are at the site</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="accent"
            fullWidth
          />
          <Button
            title="Not now"
            onPress={handleNotNow}
            variant="text"
            fullWidth
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionList: {
    width: '100%',
    gap: spacing.base,
    marginBottom: spacing.xxxl,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: 12,
  },
  permissionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    ...typography.titleMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  permissionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.md,
  },
});
