import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Dev Test Panel Component
 *
 * Development-only preview of the scanner's failure popups, with sample
 * content and without scanning or calling the database.
 * Overlaid on bottom-left corner of scanner viewfinder with collapsible UI.
 * Only renders when __DEV__ is true.
 *
 * Successful and repeat scans go through the database (which also checks the
 * GPS distance), so test those by scanning a real QR code, e.g. a [TEST]
 * site's from supabase/seed-dev.sql.
 *
 * Validates: Requirements 3.7 (Dev test panel for QR-free testing)
 */

interface DevTestPanelProps {
  onPreviewInvalid: () => void;
  onPreviewLocationFailed: () => void;
  onPreviewNoActivePeriod: () => void;
  onPreviewEventNotActive: () => void;
  onPreviewOffline: () => void;
}

export function DevTestPanel({
  onPreviewInvalid,
  onPreviewLocationFailed,
  onPreviewNoActivePeriod,
  onPreviewEventNotActive,
  onPreviewOffline,
}: DevTestPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only render in development builds
  if (!__DEV__) {
    return null;
  }

  const previews = [
    { label: '✗ Invalid QR', onPress: onPreviewInvalid },
    { label: '⚠ Location Failed', onPress: onPreviewLocationFailed },
    { label: '◷ No Active Season', onPress: onPreviewNoActivePeriod },
    { label: '◷ Festival Not Open', onPress: onPreviewEventNotActive },
    { label: '⊘ No Internet', onPress: onPreviewOffline },
  ];

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

          {/* Popup previews */}
          <View style={styles.buttonList}>
            {previews.map((preview) => (
              <Pressable key={preview.label} style={styles.testButton} onPress={preview.onPress}>
                <Text style={styles.testButtonText}>{preview.label}</Text>
              </Pressable>
            ))}
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
