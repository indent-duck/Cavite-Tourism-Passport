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
import type { CollectStampResult, Site, Stamp } from '@/data/types';
import { useCollectStamp } from '@/hooks/useCollectStamp';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useOnAppFocus } from '@/hooks/useOnAppFocus';
import { useCameraPermission, useLocationPermission } from '@/hooks/usePermissions';
import { useScanLocation, type ScanCoords } from '@/hooks/useScanLocation';
import { parseSiteQr } from '@/lib/constants';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Scanner Screen
 * 
 * Opens from the center Scan tab button.
 * Gates the scanner viewfinder behind these screens:
 * 1. Primer screen: explains why camera and location are needed
 * 2. System prompts: sequential camera and location permission requests
 * 3. Blocked screen: shown when either permission is denied
 * 4. Location-off screen: permissions are granted but the device's location
 *    setting is off, so a scan couldn't be verified
 * Permissions and the location setting are re-checked whenever the user comes
 * back to the app, so changes made in Settings show up right away.
 *
 * Once all of that is in place, shows full-screen camera viewfinder with QR detection.
 * On QR scan, reads location and calls collectStamp mutation.
 * The viewfinder, blocked and location-off screens link to the stamp request
 * form, for a stamp received in the physical passport instead (no QR code on-site).
 * 
 * Validates: Requirements 3.2 (Permission primer and blocked screens), 3.4 (Location read and mutation trigger)
 */

type ScannerStage =
  | 'checking'
  | 'primer'
  | 'requesting'
  | 'blocked'
  | 'locationOff'
  | 'ready';

/** What the last scan (or dev panel test) came back with, shown in a result popup */
type ScanResult =
  | { kind: 'success'; stamp: Stamp }
  | { kind: 'invalid' }
  | { kind: 'alreadyScanned'; stamp: Stamp }
  | { kind: 'locationFailed'; payload: string; site: Site | null }
  // `payload` is missing only for the dev panel's simulated outage
  | { kind: 'offline'; payload?: string };

/** The catalog site a QR payload points to, for the location-failed popup */
function findSite(payload: string): Site | null {
  const siteId = parseSiteQr(payload);
  return mockSites.find((site) => site.id === siteId) ?? null;
}

function toScanResult(outcome: CollectStampResult, payload: string): ScanResult {
  if (outcome.success) {
    return { kind: 'success', stamp: outcome.stamp };
  }
  switch (outcome.reason) {
    case 'invalid':
      return { kind: 'invalid' };
    case 'alreadyScanned':
      return { kind: 'alreadyScanned', stamp: outcome.existingStamp };
    case 'locationFailed':
      return { kind: 'locationFailed', payload, site: findSite(payload) };
    case 'offline':
      return { kind: 'offline', payload };
  }
}

export default function ScannerScreen() {
  const cameraPermission = useCameraPermission();
  const locationPermission = useLocationPermission();
  const locationServices = useLocationServices();
  const collectStampMutation = useCollectStamp();
  const { data: currentUser } = useCurrentUser();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  // The last result stays set after its popup closes, so the popup keeps its
  // content while it fades out
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  // Android: set once the in-app "turn on location" dialog fails (declined, or
  // no Google Play services), so the button opens the location settings instead
  const [turnOnFailed, setTurnOnFailed] = useState(false);

  // Determine the current stage based on permission statuses and the location setting
  const getStage = (): ScannerStage => {
    if (isRequesting) {
      return 'requesting';
    }

    // Saved statuses take a moment to load; until then they read as
    // 'undetermined', which would flash the primer screen
    if (!cameraPermission.isLoaded || !locationPermission.isLoaded) {
      return 'checking';
    }

    const cameraGranted = cameraPermission.status === 'granted';
    const locationGranted = locationPermission.status === 'granted';

    if (cameraGranted && locationGranted) {
      if (locationServices.isOn === null) return 'checking';
      return locationServices.isOn ? 'ready' : 'locationOff';
    } else if (
      cameraPermission.status === 'denied' ||
      locationPermission.status === 'denied'
    ) {
      return 'blocked';
    }

    return 'primer';
  };

  const stage = getStage();

  // Starts watching the position once the camera is up, so a fix is ready by scan time
  const scanLocation = useScanLocation(stage === 'ready');

  // Re-check when the user comes back to the app (from Settings, or on Android
  // the quick-settings panel), so granting a permission or switching location
  // on or off there updates this screen right away
  useOnAppFocus(() => {
    void cameraPermission.refresh();
    void locationPermission.refresh();
    void locationServices.refresh();
  });

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

  // "Turn on location" on the location-off screen. Android first tries the
  // in-app dialog; if that fails, the button opens the location settings.
  // iOS can't turn location on for the user, so it opens Settings.
  const handleTurnOnLocation = async () => {
    if (Platform.OS === 'android' && !turnOnFailed) {
      const isOn = await locationServices.turnOn();
      if (!isOn) setTurnOnFailed(true);
      return;
    }
    await locationServices.openSettings();
  };

  const turnOnLocationTitle =
    Platform.OS === 'ios'
      ? 'Open Settings'
      : turnOnFailed
        ? 'Open location settings'
        : 'Turn on location';

  // Close button handler
  const handleClose = () => {
    router.back();
  };

  // Physical-stamp request: replace the scanner so the camera is released and
  // going back from the form returns to where the scanner was opened
  const handleRequestStamp = () => {
    router.replace('/stamp-requests/new');
  };

  // ============================================================================
  // QR Code Scanning
  // ============================================================================

  const showResult = (next: ScanResult) => {
    setResult(next);
    setIsResultOpen(true);
  };

  /**
   * Verify a scanned code
   *
   * Shows "Verifying...", reads the device location, and calls the
   * collectStamp mutation, then opens the popup for the result. "Try again"
   * on the location-failed and offline popups runs it again for the same code.
   *
   * Validates: Requirements 3.4 (Location read and mutation trigger)
   */
  const verifyCode = async (
    payload: string,
    readCoords: () => Promise<ScanCoords | null> = scanLocation.getCoords,
  ) => {
    setIsResultOpen(false);
    setIsVerifying(true);

    let next: ScanResult;
    try {
      // Null when location is off or there's no fix within 10 seconds
      const coords = await readCoords();
      if (!coords && !(await locationServices.refresh())) {
        // Location was switched off without the app noticing: the
        // "Turn on location" screen takes over instead of a failed check
        setIsVerifying(false);
        return;
      }
      const outcome = await collectStampMutation.mutateAsync({ payload, coords });
      next = toScanResult(outcome, payload);
    } catch (error) {
      // Treat mutation errors as offline errors
      console.error('Stamp collection error:', error);
      next = { kind: 'offline', payload };
    }

    setIsVerifying(false);
    showResult(next);
  };

  const handleScanCode = (payload: string) => {
    void verifyCode(payload);
  };

  // ============================================================================
  // Dev Test Panel Handlers
  // ============================================================================

  // Dev tests don't wait for a GPS fix: dev builds skip the location check
  // (DEV_SKIP_LOCATION_CHECK)
  const readMockCoords = async () => ({ latitude: 0, longitude: 0 });

  /** Dev test: "Success" and "Already Scanned" run a real verification */
  const handleDevTestScan = (payload: string) => {
    void verifyCode(payload, readMockCoords);
  };

  const handleDevTestInvalid = () => {
    showResult({ kind: 'invalid' });
  };

  const handleDevTestLocationFailed = (payload: string) => {
    showResult({ kind: 'locationFailed', payload, site: findSite(payload) });
  };

  const handleDevTestOffline = () => {
    showResult({ kind: 'offline' });
  };

  // ============================================================================
  // Result Popup Actions
  // ============================================================================

  /** "Scan again", or closing a popup by tapping outside it or pressing back */
  const resumeScanning = () => {
    setIsResultOpen(false);
  };

  /** "Close scanner": exits the scanner and returns to the previous screen */
  const closeScanner = () => {
    setIsResultOpen(false);
    router.back();
  };

  /** "Try again" on the location-failed and offline popups: verifies the same code again */
  const retryCode = (payload: string | undefined) => {
    if (payload) {
      void verifyCode(payload);
    } else {
      resumeScanning();
    }
  };

  /**
   * "Dismiss" on the success and already-scanned popups: exits the scanner and
   * opens the Passport tab with the stamp highlighted (a fresh stamp also gets
   * the "stamp slam" animation)
   */
  const openInPassport = (stamp: Stamp, isNew: boolean) => {
    setIsResultOpen(false);
    router.dismissTo({
      pathname: '/passport',
      // `t` makes every visit distinct so the same stamp can be highlighted again
      params: { stamp: stamp.id, new: isNew ? '1' : '0', t: String(Date.now()) },
    });
  };

  // Render based on stage
  if (stage === 'checking') {
    // Blank for the moment it takes to read the saved statuses. Dark like the
    // camera, which is what usually comes next.
    return <View style={styles.checking} testID="scanner-checking" />;
  }

  if (stage === 'ready') {
    return (
      <View style={styles.fullScreen}>
        {/* Scanner Viewfinder */}
        <ScannerViewfinder
          onScanCode={handleScanCode}
          isPaused={isVerifying || isResultOpen}
          onRequestStamp={handleRequestStamp}
        />

        {/* Dev Test Panel (only visible in __DEV__) */}
        <DevTestPanel
          onTriggerSuccess={handleDevTestScan}
          onTriggerInvalid={handleDevTestInvalid}
          onTriggerAlreadyScanned={handleDevTestScan}
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

        {/* Result popup for the last scan. Tapping outside it or pressing
            back closes it and resumes scanning. */}
        {result?.kind === 'success' && (
          <SuccessSheet
            visible={isResultOpen}
            onDismiss={resumeScanning}
            stamp={result.stamp}
            totalBalance={currentUser?.points || 0}
            onViewPassport={() => openInPassport(result.stamp, true)}
          />
        )}

        {result?.kind === 'invalid' && (
          <InvalidQrSheet
            visible={isResultOpen}
            onDismiss={resumeScanning}
            onTryAgain={resumeScanning}
            onClose={closeScanner}
          />
        )}

        {result?.kind === 'alreadyScanned' && (
          <AlreadyScannedSheet
            visible={isResultOpen}
            onDismiss={resumeScanning}
            siteName={result.stamp.siteName}
            collectedDate={result.stamp.collectedAt}
            onViewPassport={() => openInPassport(result.stamp, false)}
          />
        )}

        {result?.kind === 'locationFailed' && (
          <LocationFailedSheet
            visible={isResultOpen}
            onDismiss={resumeScanning}
            targetSiteName={result.site?.name || ''}
            targetMunicipality={result.site?.municipality || ''}
            onTryAgain={() => retryCode(result.payload)}
            onClose={closeScanner}
          />
        )}

        {result?.kind === 'offline' && (
          <NoInternetSheet
            visible={isResultOpen}
            onDismiss={resumeScanning}
            onTryAgain={() => retryCode(result.payload)}
            onClose={closeScanner}
          />
        )}
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
            {/* The request form works without camera access (gallery photo) */}
            <Button
              title="Stamped your physical passport instead?"
              onPress={handleRequestStamp}
              variant="text"
              fullWidth
              testID="scanner-blocked-request-stamp"
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (stage === 'locationOff') {
    return (
      <ScreenContainer
        scrollable={false}
        edges={['top', 'left', 'right', 'bottom']}
        testID="scanner-location-off"
      >
        {/* Close button */}
        <View style={styles.closeButtonContainer}>
          <Pressable
            onPress={handleClose}
            hitSlop={spacing.md}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
          </View>

          <Text style={styles.title}>Turn on location</Text>
          <Text style={styles.subtitle}>
            {"Your phone's location is off. It's needed to confirm you're at the site when you scan its QR code."}
            {Platform.OS === 'ios' &&
              ' Turn on Location Services in Settings > Privacy & Security.'}
          </Text>

          <View style={styles.buttonGroup}>
            <Button
              title={turnOnLocationTitle}
              onPress={handleTurnOnLocation}
              variant="accent"
              fullWidth
              testID="scanner-turn-on-location"
            />
            {/* The request form doesn't need location (it's reviewed by staff) */}
            <Button
              title="Stamped your physical passport instead?"
              onPress={handleRequestStamp}
              variant="text"
              fullWidth
              testID="scanner-location-off-request-stamp"
            />
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
  checking: {
    flex: 1,
    backgroundColor: colors.text, // Same as the viewfinder before the camera loads
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
