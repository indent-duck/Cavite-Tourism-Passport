import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
 * - Debounced scanning to prevent duplicate reads
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
   * Whether scanning should be paused (e.g., while modal is visible)
   * @default false
   */
  isPaused?: boolean;
}

export const ScannerViewfinder: React.FC<ScannerViewfinderProps> = ({
  onScanCode,
  isPaused = false,
}) => {
  // Get safe area insets for proper positioning
  const insets = useSafeAreaInsets();
  
  // Track last scanned payload and timestamp for debouncing
  const lastScanRef = useRef<{
    payload: string;
    timestamp: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

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
    // Don't process if paused or already processing
    if (isPaused || isProcessing) {
      return;
    }

    const now = Date.now();
    const lastScan = lastScanRef.current;

    // Debounce: ignore if same payload scanned within 2 seconds
    if (
      lastScan &&
      lastScan.payload === data &&
      now - lastScan.timestamp < 2000
    ) {
      return;
    }

    // Update last scan reference
    lastScanRef.current = {
      payload: data,
      timestamp: now,
    };

    // Set processing flag to prevent multiple simultaneous scans
    setIsProcessing(true);

    // Fire callback
    onScanCode(data);

    // Reset processing flag after a short delay
    // This gives the parent time to show a modal or start verification
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
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
        </View>
      </View>
    </View>
  );
};

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
});
