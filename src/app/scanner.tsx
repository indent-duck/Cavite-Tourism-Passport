import { AlreadyScannedSheet } from '@/components/scanner/AlreadyScannedSheet';
import { DevTestPanel } from '@/components/scanner/DevTestPanel';
import { InvalidQrSheet } from '@/components/scanner/InvalidQrSheet';
import { LocationFailedSheet } from '@/components/scanner/LocationFailedSheet';
import { NoInternetSheet } from '@/components/scanner/NoInternetSheet';
import { ScannerViewfinder } from '@/components/scanner/ScannerViewfinder';
import { SuccessSheet } from '@/components/scanner/SuccessSheet';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { mockSites } from '@/data/mock-data';
import type { Site, Stamp } from '@/data/types';
import { useCollectStamp } from '@/hooks/useCollectStamp';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCameraPermission, useLocationPermission } from '@/hooks/usePermissions';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Scanner Screen
 * 
 * Opens from the center Scan tab button.
 * Implements three-stage permission gate before showing scanner viewfinder:
 * 1. Primer screen: explains why camera and location are needed
 * 2. System prompts: sequential camera and location permission requests
 * 3. Blocked screen: shown when either permission is denied
 * 
 * After permissions are granted, shows full-screen camera viewfinder with QR detection.
 * On QR scan, reads location and calls collectStamp mutation.
 * 
 * Validates: Requirements 3.2 (Permission primer and blocked screens), 3.4 (Location read and mutation trigger)
 */

type PermissionStage = 'primer' | 'requesting' | 'blocked' | 'granted';
type ModalState = null | 'success' | 'invalid' | 'alreadyScanned' | 'locationFailed' | 'offline';

export default function ScannerScreen() {
  const cameraPermission = useCameraPermission();
  const locationPermission = useLocationPermission();
  const collectStampMutation = useCollectStamp();
  const { data: currentUser } = useCurrentUser();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [scannedSite, setScannedSite] = useState<Site | null>(null);
  const [collectedStamp, setCollectedStamp] = useState<Stamp | null>(null);

  // Refs for bottom sheets
  const successSheetRef = useRef<SimpleModalSheetRef>(null);
  const invalidQrSheetRef = useRef<SimpleModalSheetRef>(null);
  const alreadyScannedSheetRef = useRef<SimpleModalSheetRef>(null);
  const locationFailedSheetRef = useRef<SimpleModalSheetRef>(null);
  const noInternetSheetRef = useRef<SimpleModalSheetRef>(null);

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

  // ============================================================================
  // Dev Test Panel Handlers
  // ============================================================================

  /**
   * Dev test: Trigger success modal with a valid unscanned site
   */
  const handleDevTestSuccess = async (payload: string) => {
    console.log('[Scanner] Dev test: Success with payload', payload);
    setIsVerifying(true);

    // For dev testing, use mock coordinates (we skip location check anyway)
    const mockCoords = { latitude: 0, longitude: 0 };

    collectStampMutation.mutate(
      { payload, coords: mockCoords },
      {
        onSuccess: (result) => {
          console.log('[Scanner] Dev test mutation result:', result);

          if (result.success) {
            setCollectedStamp(result.stamp);
            setModalState('success');
            setIsVerifying(false);
            // Small delay to ensure state updates before opening sheet
            setTimeout(() => {
              successSheetRef.current?.present();
            }, 100);
          } else {
            setIsVerifying(false);
            console.warn('[Scanner] Dev test failed:', result.reason);
            // This shouldn't happen for success test, but handle it
            setModalState('invalid');
            setTimeout(() => {
              invalidQrSheetRef.current?.present();
            }, 100);
          }
        },
        onError: (error) => {
          setIsVerifying(false);
          console.error('[Scanner] Dev test mutation error:', error);
          setModalState('offline');
          setTimeout(() => {
            noInternetSheetRef.current?.present();
          }, 100);
        },
      }
    );
  };

  /**
   * Dev test: Trigger invalid QR modal
   */
  const handleDevTestInvalid = () => {
    console.log('[Scanner] Dev test: Invalid QR');
    setModalState('invalid');
    // Direct call without timeout
    invalidQrSheetRef.current?.present();
  };

  /**
   * Dev test: Trigger already scanned modal with a scanned site
   */
  const handleDevTestAlreadyScanned = async (payload: string) => {
    console.log('[Scanner] Dev test: Already scanned with payload', payload);
    setIsVerifying(true);

    // For dev testing, use mock coordinates
    const mockCoords = { latitude: 0, longitude: 0 };

    collectStampMutation.mutate(
      { payload, coords: mockCoords },
      {
        onSuccess: (result) => {
          console.log('[Scanner] Dev test mutation result:', result);

          if (!result.success && result.reason === 'alreadyScanned') {
            const siteId = payload.replace('cvt:site:', '');
            const site = mockSites.find((s) => s.id === siteId);
            setScannedSite(site || null);
            setCollectedStamp(result.existingStamp);
            setModalState('alreadyScanned');
            setIsVerifying(false);
            // Small delay to ensure state updates before opening sheet
            setTimeout(() => {
              alreadyScannedSheetRef.current?.present();
            }, 100);
          } else {
            setIsVerifying(false);
            console.warn('[Scanner] Dev test: Expected alreadyScanned, got:', result);
            setModalState('invalid');
            setTimeout(() => {
              invalidQrSheetRef.current?.present();
            }, 100);
          }
        },
        onError: (error) => {
          setIsVerifying(false);
          console.error('[Scanner] Dev test mutation error:', error);
          setModalState('offline');
          setTimeout(() => {
            noInternetSheetRef.current?.present();
          }, 100);
        },
      }
    );
  };

  /**
   * Dev test: Trigger location failed modal
   * Note: Since DEV_SKIP_LOCATION_CHECK is true, we directly show the modal
   */
  const handleDevTestLocationFailed = (payload: string) => {
    console.log('[Scanner] Dev test: Location failed');
    const siteId = payload.replace('cvt:site:', '');
    const site = mockSites.find((s) => s.id === siteId);
    setScannedSite(site || null);
    setModalState('locationFailed');
    setTimeout(() => {
      locationFailedSheetRef.current?.present();
    }, 100);
  };

  /**
   * Dev test: Trigger offline modal
   */
  const handleDevTestOffline = () => {
    console.log('[Scanner] Dev test: Offline');
    setModalState('offline');
    setTimeout(() => {
      noInternetSheetRef.current?.present();
    }, 100);
  };

  // ============================================================================
  // QR Code Scanning
  // ============================================================================

  /**
   * Handle QR code scan
   * 
   * Called when viewfinder detects a QR code.
   * Shows "Verifying..." state, reads location, and calls collectStamp mutation.
   * 
   * Validates: Requirements 3.4 (Location read and mutation trigger)
   */
  const handleScanCode = async (payload: string) => {
    setIsVerifying(true);

    try {
      // Read device location with 10-second timeout
      let coords: { latitude: number; longitude: number } | null = null;
      
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // 10-second timeout
        });
        coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } catch (locationError) {
        // Location read timed out or services are off
        // Set coords to null, which will trigger locationFailed from mock
        console.warn('Location read failed:', locationError);
        coords = null;
      }

      // Call collectStamp mutation
      collectStampMutation.mutate(
        { payload, coords },
        {
          onSuccess: (result) => {
            setIsVerifying(false);

            // Show the appropriate modal based on result
            if (result.success) {
              setCollectedStamp(result.stamp);
              setModalState('success');
              successSheetRef.current?.present();
            } else {
              // For error cases, try to find the site info from the payload
              const siteId = payload.replace('cvt:site:', '');
              const site = mockSites.find((s) => s.id === siteId);
              setScannedSite(site || null);

              // Set existing stamp for alreadyScanned case
              if (result.reason === 'alreadyScanned') {
                setCollectedStamp(result.existingStamp);
              }

              switch (result.reason) {
                case 'invalid':
                  setModalState('invalid');
                  invalidQrSheetRef.current?.present();
                  break;
                case 'alreadyScanned':
                  setModalState('alreadyScanned');
                  alreadyScannedSheetRef.current?.present();
                  break;
                case 'locationFailed':
                  setModalState('locationFailed');
                  locationFailedSheetRef.current?.present();
                  break;
                case 'offline':
                  setModalState('offline');
                  noInternetSheetRef.current?.present();
                  break;
              }
            }
          },
          onError: (error) => {
            setIsVerifying(false);
            console.error('Stamp collection error:', error);
            // Treat mutation errors as offline errors
            setModalState('offline');
            noInternetSheetRef.current?.present();
          },
        }
      );
    } catch (error) {
      setIsVerifying(false);
      console.error('Scan handling error:', error);
      // Treat unexpected errors as offline errors
      setModalState('offline');
      noInternetSheetRef.current?.present();
    }
  };

  // ============================================================================
  // Modal Action Handlers
  // ============================================================================

  /**
   * "View in Passport" / "Dismiss" button handler for success/already scanned
   * Closes modal, exits scanner, and returns to previous screen
   */
  const handleViewPassport = () => {
    // Close the modals
    successSheetRef.current?.close();
    alreadyScannedSheetRef.current?.close();
    
    // Reset state
    setModalState(null);
    setCollectedStamp(null);
    setScannedSite(null);
    
    // Exit scanner and go back to previous screen
    router.back();
  };

  /**
   * "Scan Another Code" / "Back to Scanner" / "Try Again" / "Dismiss" button handler
   * Closes modal, exits scanner, and returns to previous screen
   */
  const handleResumeScanning = () => {
    // Close all modals
    successSheetRef.current?.close();
    invalidQrSheetRef.current?.close();
    alreadyScannedSheetRef.current?.close();
    locationFailedSheetRef.current?.close();
    noInternetSheetRef.current?.close();
    
    // Reset state
    setModalState(null);
    setCollectedStamp(null);
    setScannedSite(null);
    
    // Exit scanner and go back to previous screen
    router.back();
  };

  /**
   * "Check Location & Retry" / "Dismiss" button handler
   * Closes modal, exits scanner, and returns to previous screen
   */
  const handleRetryLocation = () => {
    // Close modal
    locationFailedSheetRef.current?.close();
    
    // Reset state
    setModalState(null);
    setScannedSite(null);
    
    // Exit scanner and go back to previous screen
    router.back();
  };

  /**
   * "Retry Connection" / "Dismiss" button handler
   * Closes modal, exits scanner, and returns to previous screen
   */
  const handleRetryConnection = () => {
    // Close modal
    noInternetSheetRef.current?.close();
    
    // Reset state
    setModalState(null);
    
    // Exit scanner and go back to previous screen
    router.back();
  };

  /**
   * "Cancel" / "Dismiss" / "Close Scanner" button handler (UNUSED NOW)
   * All Dismiss buttons now close scanner and return to previous screen
   */
  const handleCloseScanner = () => {
    // Close all modals
    invalidQrSheetRef.current?.close();
    locationFailedSheetRef.current?.close();
    noInternetSheetRef.current?.close();
    
    // Reset state
    setModalState(null);
    setCollectedStamp(null);
    setScannedSite(null);
    
    // Exit scanner and go back to previous screen
    router.back();
  };

  // Render based on stage
  if (stage === 'granted') {
    return (
      <View style={styles.fullScreen}>
        {/* Scanner Viewfinder */}
        <ScannerViewfinder
          onScanCode={handleScanCode}
          isPaused={isVerifying || modalState !== null}
        />

        {/* Dev Test Panel (only visible in __DEV__) */}
        <DevTestPanel
          onTriggerSuccess={handleDevTestSuccess}
          onTriggerInvalid={handleDevTestInvalid}
          onTriggerAlreadyScanned={handleDevTestAlreadyScanned}
          onTriggerLocationFailed={handleDevTestLocationFailed}
          onTriggerOffline={handleDevTestOffline}
        />

        {/* Verifying State Overlay */}
        {isVerifying && (
          <View style={styles.verifyingOverlay}>
            <View style={styles.verifyingCard}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.verifyingText}>Verifying...</Text>
            </View>
          </View>
        )}

        {/* Result Modal Bottom Sheets - Always rendered, controlled by refs */}
        
        {/* Success Sheet */}
        <SuccessSheet
          ref={successSheetRef}
          stamp={collectedStamp || {
            id: '',
            userId: '',
            siteId: '',
            siteName: '',
            siteCategory: 'Heritage',
            municipality: '',
            pointsEarned: 0,
            collectedAt: new Date(),
          }}
          totalBalance={currentUser?.points || 0}
          onViewPassport={handleViewPassport}
          onScanAnother={handleResumeScanning}
        />

        {/* Invalid QR Sheet */}
        <InvalidQrSheet
          ref={invalidQrSheetRef}
          onTryAgain={handleResumeScanning}
          onCancel={handleResumeScanning}
        />

        {/* Already Scanned Sheet */}
        <AlreadyScannedSheet
          ref={alreadyScannedSheetRef}
          siteName={scannedSite?.name || ''}
          collectedDate={collectedStamp?.collectedAt || new Date()}
          onViewPassport={handleViewPassport}
          onBackToScanner={handleViewPassport}
        />

        {/* Location Failed Sheet */}
        <LocationFailedSheet
          ref={locationFailedSheetRef}
          targetSiteName={scannedSite?.name || ''}
          targetMunicipality={scannedSite?.municipality || ''}
          onRetry={handleRetryLocation}
          onDismiss={handleRetryLocation}
        />

        {/* No Internet Sheet */}
        <NoInternetSheet
          ref={noInternetSheetRef}
          onRetry={handleRetryConnection}
          onClose={handleRetryConnection}
        />
      </View>
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
  fullScreen: {
    flex: 1,
  },
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
  verifyingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyingCard: {
    backgroundColor: colors.background,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  verifyingText: {
    ...typography.titleMedium,
    color: colors.text,
  },
});
