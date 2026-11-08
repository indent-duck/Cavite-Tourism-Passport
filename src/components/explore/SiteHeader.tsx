import { colors, radii, spacing, typography } from '@/theme';
import { POINTS_PER_CATEGORY, type Category, type Site } from '@/data/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * SiteHeader Component
 * 
 * Displays site header information with visited badge, name, category, points, and address.
 * Used in Site Information screen.
 * 
 * Validates: Requirements 3.2
 */

export interface SiteHeaderProps {
  /**
   * Site data to display
   */
  site: Site;

  /**
   * Whether user has visited this site (has stamp)
   */
  isVisited: boolean;

  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

// Category colors for pills
const CATEGORY_COLORS: Record<Category, string> = {
  Dining: colors.categoryDining,
  Staycation: colors.categoryStaycation,
  Adventure: colors.categoryAdventure,
  Heritage: colors.categoryHeritage,
  Festival: colors.categoryFestival,
};

export function SiteHeader({ site, isVisited, testID }: SiteHeaderProps) {
  const points = POINTS_PER_CATEGORY[site.category];
  const categoryColor = CATEGORY_COLORS[site.category];

  return (
    <View style={styles.container} testID={testID}>
      {/* Visited badge (conditional) */}
      {isVisited && (
        <View style={styles.visitedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.visitedText}>Visited</Text>
        </View>
      )}

      {/* Name */}
      <Text style={styles.name}>{site.name}</Text>

      {/* Category pill and points badge row */}
      <View style={styles.badgeRow}>
        <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{site.category}</Text>
        </View>

        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>+{points} pts</Text>
        </View>
      </View>

      {/* Address with location icon */}
      <View style={styles.addressRow}>
        <Ionicons
          name="location-outline"
          size={20}
          color={colors.textSecondary}
          style={styles.addressIcon}
        />
        <Text style={styles.address}>{site.address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  visitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  visitedText: {
    ...typography.labelMedium,
    color: colors.success,
    fontFamily: 'Inter_600SemiBold',
  },
  name: {
    ...typography.headlineLarge,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryPill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  categoryText: {
    ...typography.labelMedium,
    color: colors.background,
    fontFamily: 'Inter_600SemiBold',
  },
  pointsBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  pointsText: {
    ...typography.labelMedium,
    color: colors.background,
    fontFamily: 'Inter_600SemiBold',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginTop: 2,
    marginRight: spacing.xs,
  },
  address: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
});
