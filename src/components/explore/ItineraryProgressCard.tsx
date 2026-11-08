import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * ItineraryProgressCard Component
 * 
 * Displays itinerary completion summary with stamps, points, progress bar, and percentage.
 * Used in Itinerary Detail screen to show overall progress.
 * 
 * Validates: Requirements 4.2.2, 5.5
 */

export interface ItineraryProgressCardProps {
  /**
   * Number of stops with stamps collected
   */
  stampedCount: number;

  /**
   * Total number of stops in the itinerary
   */
  totalStops: number;

  /**
   * Total points available from all stops
   */
  pointsAvailable: number;

  /**
   * Points collected so far from stamped stops
   */
  pointsCollected: number;

  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

export function ItineraryProgressCard({
  stampedCount,
  totalStops,
  pointsAvailable,
  pointsCollected,
  testID,
}: ItineraryProgressCardProps) {
  const percentage = totalStops > 0 ? Math.round((stampedCount / totalStops) * 100) : 0;
  const pointsRemaining = pointsAvailable - pointsCollected;

  return (
    <View style={styles.container} testID={testID}>
      {/* Top Row: Stamps and Points */}
      <View style={styles.topRow}>
        {/* Stamps Section */}
        <View style={styles.section}>
          <Text style={styles.labelText}>PASSPORT JOURNEY</Text>
          <View style={styles.valueRow}>
            <Text style={styles.mainValue}>
              {stampedCount} of {totalStops}
            </Text>
            <Text style={styles.secondaryText}>stops stamped</Text>
          </View>
        </View>

        {/* Points Section */}
        <View style={[styles.section, styles.sectionRight]}>
          <Text style={styles.labelText}>POTENTIAL REWARD</Text>
          <View style={styles.valueRow}>
            <Text style={styles.pointsValue}>+{pointsAvailable} pts</Text>
            <View style={styles.collectedBadge}>
              <Text style={styles.collectedText}>{pointsCollected} collected</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>

        {/* Progress Details Row */}
        <View style={styles.progressDetails}>
          <View style={styles.percentageRow}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={colors.success}
              style={styles.checkIcon}
            />
            <Text style={styles.percentageText}>{percentage}% Complete</Text>
          </View>
          <Text style={styles.remainingText}>{pointsRemaining} pts remaining</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  section: {
    flex: 1,
  },
  sectionRight: {
    alignItems: 'flex-end',
  },
  labelText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  mainValue: {
    ...typography.headlineMedium,
    color: colors.primary,
    fontFamily: 'Inter_700Bold',
  },
  secondaryText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  pointsValue: {
    ...typography.titleMedium,
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
  collectedBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  collectedText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  progressSection: {
    gap: spacing.xs,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: radii.full,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  checkIcon: {
    marginTop: -1,
  },
  percentageText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.success,
    fontFamily: 'Inter_600SemiBold',
  },
  remainingText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
});
