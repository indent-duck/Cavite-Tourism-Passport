import { currentMockStamps, mockSites } from '@/data/mock-data';
import type { Site } from '@/data/types';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Dev Test Panel Component
 * 
 * Development-only testing tool for triggering scanner result modals without scanning QR codes.
 * Overlaid on bottom-left corner of scanner viewfinder with collapsible UI.
 * Only renders when __DEV__ is true.
 * 
 * Features:
 * - Collapsible panel with toggle button
 * - Test buttons for all 5 result types
 * - "Success" picks an unscanned site from mock data
 * - Never appears in release builds
 * 
 * Validates: Requirements 3.7 (Dev test panel for QR-free testing)
 */

interface DevTestPanelProps {
  onTriggerSuccess: (payload: string) => void;
  onTriggerInvalid: () => void;
  onTriggerAlreadyScanned: (payload: string) => void;
  onTriggerLocationFailed: (payload: string) => void;
  onTriggerOffline: () => void;
}

export function DevTestPanel({
  onTriggerSuccess,
  onTriggerInvalid,
  onTriggerAlreadyScanned,
  onTriggerLocationFailed,
  onTriggerOffline,
}: DevTestPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only render in development builds
  if (!__DEV__) {
    return null;
  }

  /**
   * Get a site that the user hasn't scanned yet
   * Used for testing the success flow
   */
  const getUnscannedSite = (): Site | null => {
    const scannedSiteIds = new Set(currentMockStamps.map((stamp) => stamp.siteId));
    const unscannedSite = mockSites.find((site) => !scannedSiteIds.has(site.id));
    return unscannedSite || null;
  };

  /**
   * Get a site that the user has already scanned
   * Used for testing the "already scanned" flow
   */
  const getScannedSite = (): Site | null => {
    if (currentMockStamps.length === 0) return null;
    const scannedSiteId = currentMockStamps[0].siteId;
    const scannedSite = mockSites.find((site) => site.id === scannedSiteId);
    return scannedSite || null;
  };

  /**
   * Handle "Success" test button
   * Picks an unscanned site and triggers scan with valid payload
   */
  const handleTestSuccess = () => {
    console.log('[DevTestPanel] Success button pressed');
    const site = getUnscannedSite();
    console.log('[DevTestPanel] Unscanned site:', site?.name);
    if (site) {
      const payload = `cvt:site:${site.id}`;
      console.log('[DevTestPanel] Triggering success with payload:', payload);
      onTriggerSuccess(payload);
    } else {
      console.warn('[DevTestPanel] No unscanned site found');
    }
  };

  /**
   * Handle "Invalid QR" test button
   * Triggers scan with malformed payload
   */
  const handleTestInvalid = () => {
    console.log('[DevTestPanel] Invalid QR button pressed');
    onTriggerInvalid();
  };

  /**
   * Handle "Already Scanned" test button
   * Picks a scanned site and triggers scan with its payload
   */
  const handleTestAlreadyScanned = () => {
    const site = getScannedSite();
    if (site) {
      const payload = `cvt:site:${site.id}`;
      onTriggerAlreadyScanned(payload);
    }
  };

  /**
   * Handle "Location Failed" test button
   * Picks an unscanned site and triggers scan (api.ts will fail the location check)
   */
  const handleTestLocationFailed = () => {
    const site = getUnscannedSite();
    if (site) {
      const payload = `cvt:site:${site.id}`;
      onTriggerLocationFailed(payload);
    }
  };

  /**
   * Handle "No Internet" test button
   * Triggers offline error
   */
  const handleTestOffline = () => {
    onTriggerOffline();
  };

  return (
    <View style={styles.container}>
      {/* Collapsed state: just the toggle button */}
      {!isExpanded && (
        <Pressable
          style={styles.toggleButton}
          onPress={() => setIsExpanded(true)}
          hitSlop={spacing.md}
        >
          <Ionicons name="build" size={20} color={colors.background} />
        </Pressable>
      )}

      {/* Expanded state: panel with test buttons */}
      {isExpanded && (
        <View style={styles.panel}>
          {/* Header with title and close button */}
          <View style={styles.header}>
            <Text style={styles.title}>Test Panel</Text>
            <Pressable
              onPress={() => setIsExpanded(false)}
              hitSlop={spacing.sm}
            >
              <Ionicons name="close" size={18} color={colors.background} />
            </Pressable>
          </View>

          {/* Test buttons */}
          <View style={styles.buttonList}>
            <Pressable
              style={styles.testButton}
              onPress={handleTestSuccess}
            >
              <Text style={styles.testButtonText}>✓ Success</Text>
            </Pressable>

            <Pressable
              style={styles.testButton}
              onPress={handleTestInvalid}
            >
              <Text style={styles.testButtonText}>✗ Invalid QR</Text>
            </Pressable>

            <Pressable
              style={styles.testButton}
              onPress={handleTestAlreadyScanned}
            >
              <Text style={styles.testButtonText}>⟳ Already Scanned</Text>
            </Pressable>

            <Pressable
              style={styles.testButton}
              onPress={handleTestLocationFailed}
            >
              <Text style={styles.testButtonText}>⚠ Location Failed</Text>
            </Pressable>

            <Pressable
              style={styles.testButton}
              onPress={handleTestOffline}
            >
              <Text style={styles.testButtonText}>⊘ No Internet</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.base,
    left: spacing.base,
    zIndex: 1000,
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0, 73, 135, 0.8)', // Semi-transparent primary
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Semi-transparent black
    borderRadius: radii.card,
    padding: spacing.md,
    minWidth: 180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.labelLarge,
    color: colors.background,
  },
  buttonList: {
    gap: spacing.sm,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testButtonText: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '600',
  },
});
