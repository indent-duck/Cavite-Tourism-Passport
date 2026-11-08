import { colors, radii, shadows, spacing, typography } from '@/theme';
import { type Itinerary } from '@/data/types';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * ItineraryCard Component
 * 
 * Displays itinerary summary with progress tracking.
 * Used in Explore tab Itineraries view.
 * 
 * Validates: Requirements 2.3.1, 5.3
 */

export interface ItineraryCardProps {
  /**
   * Itinerary data to display
   */
  itinerary: Itinerary;

  /**
   * Number of stops that have been stamped
   */
  stampedCount: number;

  /**
   * Total number of stops in itinerary
   */
  totalStops: number;

  /**
   * Total points available for all stops
   */
  pointsAvailable: number;

  /**
   * Callback when card is pressed
   */
  onPress: () => void;

  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

export function ItineraryCard({
  itinerary,
  stampedCount,
  totalStops,
  pointsAvailable,
  onPress,
  testID,
}: ItineraryCardProps) {
  const percentage = totalStops > 0 ? Math.round((stampedCount / totalStops) * 100) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      testID={testID}
    >
      {/* Thumbnail with overlays */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Tour type badge (top-left) */}
        <View style={styles.tourTypeBadge}>
          <Text style={styles.badgeText}>
            {itinerary.type === 'Day Tour' ? 'Day tour' : 'Overnight'}
          </Text>
        </View>

        {/* Stop count badge (top-right) */}
        <View style={styles.stopCountBadge}>
          <Text style={styles.badgeText}>{totalStops} stops</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {itinerary.title}
        </Text>

        {/* Description */}
        {itinerary.description && (
          <Text style={styles.description} numberOfLines={2}>
            {itinerary.description}
          </Text>
        )}

        {/* Points */}
        <Text style={styles.points}>+{pointsAvailable} pts</Text>

        {/* Progress section */}
        <View style={styles.progressSection}>
          {/* Progress label */}
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {stampedCount} of {totalStops} stops stamped
            </Text>
            <Text style={styles.progressPercentage}>{percentage}% complete</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${percentage}%` },
              ]}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: 'hidden',
    marginBottom: spacing.base,
    ...shadows.card,
  },
  containerPressed: {
    opacity: 0.7,
  },
  thumbnailContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  tourTypeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  stopCountBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.background,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
  },
  content: {
    padding: spacing.base,
  },
  title: {
    ...typography.headlineSmall,
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: spacing.sm,
  },
  points: {
    ...typography.labelLarge,
    color: colors.accent,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.md,
  },
  progressSection: {
    gap: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
  },
  progressPercentage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: radii.full,
  },
});
