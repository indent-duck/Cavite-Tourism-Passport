import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { useStamps } from '@/hooks/useStamps';
import { useSites } from '@/hooks/useSites';
import { useEvents } from '@/hooks/useEvents';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';

/**
 * Summary Card Component
 * 
 * Displays Digital Passport summary with:
 * - Active Season badge (when promo is active)
 * - Stamps Collected tile (N of TOTAL)
 * - Passport Balance tile (POINTS PTS)
 * - Overall completion progress bar
 * 
 * Validates: Requirements 2.1, 2.2
 */

export function SummaryCard() {
  const { data: stamps = [], isLoading: stampsLoading } = useStamps();
  const { data: sites = [], isLoading: sitesLoading } = useSites();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: promoPeriod, isLoading: promoLoading } = usePromoPeriod();

  // Loading state
  const isLoading = stampsLoading || sitesLoading || eventsLoading || userLoading || promoLoading;

  // Calculate totals
  const collectedCount = stamps.length;
  const festivalStampCount = events.filter(event => event.festivalStamp?.available).length;
  const totalSlots = sites.length + festivalStampCount;
  const points = currentUser?.points ?? 0;
  const completionPercentage = totalSlots > 0 ? (collectedCount / totalSlots) * 100 : 0;
  const isPromoActive = promoPeriod?.active ?? false;

  if (isLoading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header: Title and Active Season Badge */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="book" size={20} color={colors.primary} style={styles.titleIcon} />
          <Text style={styles.title}>Digital Passport</Text>
        </View>
        {isPromoActive && (
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeBadgeText} numberOfLines={1}>
              Active Season
            </Text>
          </View>
        )}
      </View>

      {/* Stats Tiles */}
      <View style={styles.tilesContainer}>
        {/* Stamps Collected Tile */}
        <View style={[styles.tile, styles.stampsTile]}>
          <Text style={styles.tileLabel}>Stamps Collected</Text>
          <Text style={styles.tileValue}>
            {collectedCount} of {totalSlots}
          </Text>
        </View>

        {/* Passport Balance Tile */}
        <View style={[styles.tile, styles.balanceTile]}>
          <Text style={styles.tileLabel}>Passport Balance</Text>
          <Text style={styles.tileValue}>{points} PTS</Text>
        </View>
      </View>

      {/* Completion Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall Completion</Text>
          <Text style={styles.progressPercentage}>{Math.round(completionPercentage)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadows.card,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIcon: {
    marginRight: spacing.sm,
  },
  title: {
    ...typography.titleMedium,
    color: colors.text,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5', // Light emerald background
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  activeBadgeText: {
    ...typography.labelSmall,
    color: colors.success,
  },
  tilesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tile: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.chip,
    minHeight: 80,
    justifyContent: 'center',
  },
  stampsTile: {
    backgroundColor: '#E0F2FE', // Light blue background
  },
  balanceTile: {
    backgroundColor: '#FFF3E0', // Light orange background
  },
  tileLabel: {
    ...typography.labelMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tileValue: {
    ...typography.headlineMedium,
    color: colors.text,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.labelMedium,
    color: colors.text,
  },
  progressPercentage: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
});
