import { Stamp } from '@/data/types';
import {
    PASSPORT_STAMPS_HEADER,
    PASSPORT_STAMPS_TITLE,
} from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { StampSlot } from './StampSlot';

interface StampsCardProps {
  stamps: Stamp[];
}

/**
 * Visas & Stamps card component
 * 
 * Displays collected stamps in chronological order (most recent first).
 * Shows only collected stamps with category badges - no uncollected placeholders.
 * 
 * Validates: Requirements 2.6, 2.7
 */
export function StampsCard({ stamps }: StampsCardProps) {
  // Sort stamps chronologically (most recent first)
  const sortedStamps = [...stamps].sort(
    (a, b) => b.collectedAt.getTime() - a.collectedAt.getTime()
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{PASSPORT_STAMPS_TITLE}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{stamps.length} STAMPED</Text>
        </View>
      </View>

      {/* Body - Collected stamps or empty state */}
      <View style={styles.body}>
        {sortedStamps.length === 0 ? (
          // Empty state
          <View style={styles.emptyState}>
            <Ionicons
              name="map-outline"
              size={64}
              color={colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>Start Your Journey!</Text>
            <Text style={styles.emptyMessage}>
              Scan QR codes at partner sites to collect your first stamp.
            </Text>
          </View>
        ) : (
          // Stamp grid
          <View style={styles.grid}>
            {sortedStamps.map((stamp, index) => (
              <StampSlot
                key={`${stamp.id}-${index}`}
                stamp={stamp}
              />
            ))}
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{PASSPORT_STAMPS_HEADER}</Text>
        <Text style={styles.footerPageNumber}>PAGE 02</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.primary,
    borderBottomWidth: 3,
    borderBottomColor: colors.passportHeaderBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.titleMedium,
    color: colors.background,
  },
  badge: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.background,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.background,
  },
  body: {
    backgroundColor: colors.passportCream,
    padding: spacing.base,
    minHeight: 200,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: spacing.base,
  },
  emptyTitle: {
    ...typography.headlineMedium,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  footer: {
    backgroundColor: '#F5E6D3',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    ...typography.labelSmall,
    color: colors.text,
  },
  footerPageNumber: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
});
