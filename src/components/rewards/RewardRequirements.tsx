import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Category, POINTS_PER_CATEGORY, RewardEligibility } from '@/data/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * RewardRequirements Component
 * 
 * Displays points progress and category stamp requirements for a reward.
 * 
 * Requirements: Viewing Reward Detail - Locked State
 * Design Differences: #1 - Uses "N of 4 categories collected" not "Pillar Stamps"
 */

export interface RewardRequirementsProps {
  eligibility: RewardEligibility;
  pointsCost: number;
  testID?: string;
}

export function RewardRequirements({
  eligibility,
  pointsCost,
  testID,
}: RewardRequirementsProps) {
  const { currentPoints, hasEnoughPoints, hasAllCategories, missingCategories } =
    eligibility;

  // Calculate progress percentage
  const progress = Math.min((currentPoints / pointsCost) * 100, 100);

  // Main categories (excluding Festival)
  const mainCategories: Category[] = [
    'Dining',
    'Staycation',
    'Heritage',
    'Adventure',
  ];

  // Count completed categories
  const completedCount = mainCategories.length - missingCategories.length;

  // Get icon for category
  const getCategoryIcon = (category: Category): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'Dining':
        return 'restaurant';
      case 'Staycation':
        return 'bed';
      case 'Adventure':
        return 'compass';
      case 'Heritage':
        return 'business';
      default:
        return 'checkmark-circle';
    }
  };

  // Get color for category
  const getCategoryColor = (category: Category): string => {
    switch (category) {
      case 'Dining':
        return colors.categoryDining;
      case 'Staycation':
        return colors.categoryStaycation;
      case 'Adventure':
        return colors.categoryAdventure;
      case 'Heritage':
        return colors.categoryHeritage;
      default:
        return colors.textSecondary;
    }
  };

  // Check if category is collected
  const isCategoryCollected = (category: Category): boolean => {
    return !missingCategories.includes(category);
  };

  // Generate "What's left" message
  const getWhatsLeftMessage = (): string => {
    const parts: string[] = [];

    if (missingCategories.length > 0) {
      const categoryList = missingCategories
        .map((cat) => cat)
        .join(' and ');
      parts.push(
        `Collect ${missingCategories.length} ${missingCategories.length === 1 ? 'stamp' : 'stamps'} (${categoryList})`
      );
    }

    if (!hasEnoughPoints) {
      const pointsNeeded = pointsCost - currentPoints;
      parts.push(`${pointsNeeded} more points`);
    }

    return parts.join(' and ');
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Points Progress Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Points Progress</Text>
          <Text
            style={[
              styles.progressText,
              hasEnoughPoints && styles.progressTextSuccess,
            ]}
          >
            {currentPoints} / {pointsCost} pts ({Math.round(progress)}%)
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: hasEnoughPoints ? colors.success : colors.accent,
              },
            ]}
          />
        </View>

        {/* Labels below progress bar */}
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Current Balance: {currentPoints} pts</Text>
          {hasEnoughPoints ? (
            <Text style={[styles.progressLabel, styles.targetReached]}>
              TARGET REACHED
            </Text>
          ) : (
            <Text style={styles.progressLabel}>Target: {pointsCost} pts</Text>
          )}
        </View>

        {/* What's left message */}
        {!eligibility.eligible && (
          <View style={styles.whatsLeftContainer}>
            <Ionicons
              name="information-circle"
              size={16}
              color={colors.textSecondary}
              style={styles.whatsLeftIcon}
            />
            <Text style={styles.whatsLeftText}>{getWhatsLeftMessage()}</Text>
          </View>
        )}
      </View>

      {/* Category Passport Stamps Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category Passport Stamps</Text>
          <View
            style={[
              styles.badge,
              hasAllCategories ? styles.badgeSuccess : styles.badgeDefault,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                hasAllCategories ? styles.badgeTextSuccess : styles.badgeTextDefault,
              ]}
            >
              {completedCount} of 4 Ready
            </Text>
          </View>
        </View>

        {/* Category Rows */}
        <View style={styles.categoryList}>
          {mainCategories.map((category) => {
            const collected = isCategoryCollected(category);
            const categoryColor = getCategoryColor(category);
            const iconName = getCategoryIcon(category);
            const points = POINTS_PER_CATEGORY[category];

            return (
              <View key={category} style={styles.categoryRow}>
                {/* Category Icon Circle */}
                <View
                  style={[
                    styles.categoryIconCircle,
                    { backgroundColor: `${categoryColor}1A` }, // 10% opacity
                  ]}
                >
                  <Ionicons name={iconName} size={24} color={categoryColor} />
                </View>

                {/* Category Name and Status */}
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category} Category</Text>
                  <Text style={styles.categoryStatus}>
                    {collected ? `Collected • ${points} pts` : `Missing • Needs 1 stamp`}
                  </Text>
                </View>

                {/* Status Icon */}
                <Ionicons
                  name={collected ? 'checkmark-circle' : 'alert-circle'}
                  size={24}
                  color={collected ? colors.success : colors.error}
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
  container: {
    gap: spacing.base,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.text,
  },
  progressText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  progressTextSuccess: {
    color: colors.success,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  targetReached: {
    color: colors.success,
    fontWeight: '600',
  },
  whatsLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  whatsLeftIcon: {
    marginRight: spacing.sm,
  },
  whatsLeftText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: spacing.sm,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  badgeDefault: {
    backgroundColor: colors.surface,
  },
  badgeText: {
    ...typography.labelSmall,
  },
  badgeTextSuccess: {
    color: colors.background,
  },
  badgeTextDefault: {
    color: colors.text,
  },
  categoryList: {
    gap: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.titleMedium,
    color: colors.text,
  },
  categoryStatus: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
