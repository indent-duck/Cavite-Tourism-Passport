import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Category, POINTS_PER_CATEGORY } from '@/data/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * PointsSummaryCard Component
 * 
 * Displays the user's total points balance and category stamp collection progress.
 * Shows which of the 4 main categories (Dining, Staycation, Heritage, Adventure) 
 * have been collected and which are still missing.
 * 
 * Props:
 * - points: Current user's total points
 * - stampCategories: Array of Category enums representing collected stamps
 * - testID: Optional test identifier
 * 
 * Layout:
 * - Top: "TOTAL BALANCE" label, large points display, subtext
 * - Bottom: "Category Stamp Milestones" label with "N of 4 categories collected" badge
 * - Four category chips in 2x2 grid showing Dining, Staycation, Heritage, Adventure
 * 
 * Validates: Requirements 1.2.1 (Points Summary Card)
 */

export interface PointsSummaryCardProps {
  /** User's current total points */
  points: number;
  /** Categories for which user has collected stamps */
  stampCategories: Category[];
  /** Optional test identifier */
  testID?: string;
}

// Define the 4 main categories in display order
const MAIN_CATEGORIES: Category[] = ['Dining', 'Staycation', 'Heritage', 'Adventure'];

// Category icon mapping
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dining: 'restaurant',
  Staycation: 'bed',
  Heritage: 'business',
  Adventure: 'compass',
};

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  Dining: colors.categoryDining,
  Staycation: colors.categoryStaycation,
  Heritage: colors.categoryHeritage,
  Adventure: colors.categoryAdventure,
};

export function PointsSummaryCard({
  points,
  stampCategories,
  testID,
}: PointsSummaryCardProps) {
  // Count how many of the 4 main categories have been collected
  const collectedCount = MAIN_CATEGORIES.filter(cat => 
    stampCategories.includes(cat)
  ).length;

  return (
    <View style={styles.card} testID={testID}>
      {/* Points Balance Section */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
        <Text style={styles.pointsDisplay}>{points} pts</Text>
        <Text style={styles.balanceSubtext}>
          Earned across 4 Cavite Passport categories
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Category Milestones Section */}
      <View style={styles.milestonesSection}>
        <View style={styles.milestonesHeader}>
          <Text style={styles.milestonesLabel}>Category Stamp Milestones</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {collectedCount} of 4 categories collected
            </Text>
          </View>
        </View>

        {/* Category Chips Grid */}
        <View style={styles.chipsGrid}>
          {MAIN_CATEGORIES.map(category => {
            const isCollected = stampCategories.includes(category);
            const categoryColor = CATEGORY_COLORS[category];
            const categoryIcon = CATEGORY_ICONS[category];
            const categoryPoints = POINTS_PER_CATEGORY[category];

            return (
              <View
                key={category}
                style={[
                  styles.chip,
                  { borderColor: isCollected ? categoryColor : colors.border },
                ]}
              >
                {/* Category Icon */}
                <Ionicons
                  name={categoryIcon}
                  size={16}
                  color={categoryColor}
                  style={styles.chipIcon}
                />

                {/* Category Info */}
                <View style={styles.chipContent}>
                  <Text style={styles.chipName}>{category}</Text>
                  <Text
                    style={[
                      styles.chipStatus,
                      { color: isCollected ? colors.text : colors.error },
                    ]}
                  >
                    {isCollected
                      ? `Collected • ${categoryPoints} pts`
                      : 'Missing • Needs 1 stamp'}
                  </Text>
                </View>

                {/* Status Icon */}
                <Ionicons
                  name={isCollected ? 'checkmark-circle' : 'alert-circle'}
                  size={20}
                  color={isCollected ? colors.success : colors.error}
                  style={styles.statusIcon}
                />
              </View>
            );
          })}
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
  balanceSection: {
    alignItems: 'center',
    paddingBottom: spacing.base,
  },
  balanceLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  pointsDisplay: {
    ...typography.displayLarge,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  balanceSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.base,
  },
  milestonesSection: {
    gap: spacing.base,
  },
  milestonesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  milestonesLabel: {
    ...typography.titleMedium,
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  badgeText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 36,
    // 2 chips per row with gap between them
    // (container width - horizontal padding - gap) / 2
    // Assuming typical screen width and card padding
    flexBasis: '47%',
    flexGrow: 0,
    flexShrink: 0,
  },
  chipIcon: {
    marginRight: spacing.sm,
  },
  chipContent: {
    flex: 1,
    marginRight: spacing.xs,
  },
  chipName: {
    ...typography.labelMedium,
    color: colors.text,
    marginBottom: 2,
  },
  chipStatus: {
    ...typography.bodySmall,
  },
  statusIcon: {
    marginLeft: spacing.xs,
  },
});
