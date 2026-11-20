import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    BackHandler,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ScannerViewfinder Component
 * 
 * Full-screen QR code scanner with camera viewfinder and overlay UI.
 * Features:
 * - QR code detection via expo-camera
 * - Centered reticle with orange corner brackets
 * - Close button with semi-transparent background
 * - Bottom instructional text
 * - Optional "Stamped your physical passport instead?" link (stamp requests)
 * - One read per scan, and a code still in view when scanning resumes is
 *   ignored until it leaves the frame
 * - Android back button handling
 * 
 * Validates: Requirements 3.3 (Viewfinder UI and scanning logic)
 */

export interface ScannerViewfinderProps {
  /**
   * Callback fired when a QR code is successfully scanned
   * @param payload - The decoded QR code data
   */
  onScanCode: (payload: string) => void;

  /**
   * Whether scanning should be paused (e.g., while modal is visible).
   * The parent must pause after `onScanCode`: no other code is read until
   * `isPaused` goes from true back to false.
   * @default false
   */
  isPaused?: boolean;

  /**
   * When given, shows a "Stamped your physical passport instead?" link under
   * the instructions (e.g. at a site with no QR code on display)
   */
  onRequestStamp?: () => void;
}

export const ScannerViewfinder: React.FC<ScannerViewfinderProps> = ({
  onScanCode,
  isPaused = false,
  onRequestStamp,
}) => {
  // Get safe area insets for proper positioning
  const insets = useSafeAreaInsets();
  
  // Set on a read and cleared when the parent resumes scanning. The camera
  // reports a code many times a second, so this keeps a burst to one read.
  const isLockedRef = useRef(false);

  // The last code read and when it was last seen. While it stays in view it's
  // ignored, so closing a result doesn't read the same code again at once.
  const lastCodeRef = useRef<{ data: string; seenAt: number } | null>(null);

  useEffect(() => {
    if (isPaused) return;
    isLockedRef.current = false;
    // The pause counts as time in view: a code still in frame stays ignored
    if (lastCodeRef.current) lastCodeRef.current.seenAt = Date.now();
  }, [isPaused]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.back();
        return true; // Prevent default behavior
      }
    );

    return () => backHandler.remove();
  }, []);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (isPaused || isLockedRef.current) {
      return;
    }

    const now = Date.now();
    const lastCode = lastCodeRef.current;

    // Same code, still in view (or back within the gap): keep ignoring it
    if (lastCode && lastCode.data === data && now - lastCode.seenAt < SAME_CODE_GAP_MS) {
      lastCode.seenAt = now;
      return;
    }

    lastCodeRef.current = { data, seenAt: now };
    isLockedRef.current = true;
    onScanCode(data);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={isPaused ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Close Button */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.base }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
            testID="scanner-close-button"
          >
            <Ionicons name="close" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Centered Reticle */}
        <View style={styles.reticleContainer}>
          <View style={styles.reticle}>
            {/* Top-left bracket */}
            <View style={[styles.bracket, styles.bracketTopLeft]} />
            {/* Top-right bracket */}
            <View style={[styles.bracket, styles.bracketTopRight]} />
            {/* Bottom-left bracket */}
            <View style={[styles.bracket, styles.bracketBottomLeft]} />
            {/* Bottom-right bracket */}
            <View style={[styles.bracket, styles.bracketBottomRight]} />
          </View>
        </View>

        {/* Bottom Instruction Text */}
        <View style={styles.bottomBar}>
          <View style={styles.instructionPill}>
            <Ionicons
              name="qr-code-outline"
              size={20}
              color={colors.background}
              style={styles.instructionIcon}
            />
            <Text style={styles.instructionText}>
              Point your camera at the site&apos;s QR code
            </Text>
          </View>

          {onRequestStamp && (
            <TouchableOpacity
              onPress={onRequestStamp}
              activeOpacity={0.7}
              style={styles.requestLink}
              accessibilityRole="link"
              accessibilityLabel="Stamped your physical passport instead? Request the digital stamp"
              testID="scanner-request-stamp-link"
            >
              <Text style={styles.requestLinkText}>Stamped your physical passport instead?</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

/** How long the last code must be out of view before it can be read again */
const SAME_CODE_GAP_MS = 2000;

const RETICLE_SIZE = 256;
const BRACKET_LENGTH = 48;
const BRACKET_THICKNESS = 4;
const CLOSE_BUTTON_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text, // Fallback while camera loads
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingHorizontal: spacing.base,
    alignItems: 'flex-start',
  },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // Backdrop blur effect (iOS only, Android shows solid background)
    ...(Platform.OS === 'ios' && {
      overflow: 'hidden',
    }),
  },
  reticleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticle: {
    width: RETICLE_SIZE,
    height: RETICLE_SIZE,
    position: 'relative',
  },
  bracket: {
    position: 'absolute',
    borderColor: colors.accent, // Orange brackets
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    width: BRACKET_LENGTH,
    height: BRACKET_LENGTH,
    borderTopWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    width: BRACKET_LENGTH,
    height: BRACKET_LENGTH,
    borderTopWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    width: BRACKET_LENGTH,
    height: BRACKET_LENGTH,
    borderBottomWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    width: BRACKET_LENGTH,
    height: BRACKET_LENGTH,
    borderBottomWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
  },
  bottomBar: {
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
  },
  instructionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 24, // Pill shape
    maxWidth: '90%',
  },
  instructionIcon: {
    marginRight: spacing.sm,
  },
  instructionText: {
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.background, // White text
    flexShrink: 1,
  },
  requestLink: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  requestLinkText: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.background, // White text
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
