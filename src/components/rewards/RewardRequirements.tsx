import { Category, POINTS_PER_CATEGORY, RewardEligibility } from '@/data/types';
import { REQUIRED_CATEGORIES } from '@/lib/rewards';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/theme/categories';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * RewardRequirements Component
 *
 * The two things a reward needs: enough points and one stamp from each of
 * the four categories. Missing stamps are shown as empty passport slots
 * (neutral, not an error) and, when `onCategoryPress` is given, are tappable
 * so the user can go find a site in that category.
 *
 * Requirements: Viewing Reward Detail - Locked State
 */

export interface RewardRequirementsProps {
  eligibility: RewardEligibility;
  pointsCost: number;
  /** Called when a missing category row is tapped */
  onCategoryPress?: (category: Category) => void;
  testID?: string;
}

export function RewardRequirements({
  eligibility,
  pointsCost,
  onCategoryPress,
  testID,
}: RewardRequirementsProps) {
  const { currentPoints, pointsNeeded, hasEnoughPoints, hasAllCategories, missingCategories } =
    eligibility;

  // pointsNeeded can include a program-wide minimum above the reward's cost
  const target = hasEnoughPoints ? pointsCost : currentPoints + pointsNeeded;
  const progress = Math.min(currentPoints / target, 1);
  const collectedCount = REQUIRED_CATEGORIES.length - missingCategories.length;

  return (
    <View style={styles.container} testID={testID}>
      {/* Points */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Points</Text>
          <Text style={[styles.badge, hasEnoughPoints ? styles.badgeDone : styles.badgeTodo]}>
            {currentPoints.toLocaleString('en-US')} / {target.toLocaleString('en-US')}
          </Text>
        </View>

        <View
          style={styles.progressTrack}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Points progress"
          accessibilityValue={{ min: 0, max: target, now: Math.min(currentPoints, target) }}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: hasEnoughPoints ? colors.success : colors.accent,
              },
            ]}
          />
        </View>

        <View style={styles.progressFooter}>
          {hasEnoughPoints ? (
            <>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[styles.progressNote, styles.progressNoteDone]}>
                Target reached
              </Text>
            </>
          ) : (
            <Text style={styles.progressNote}>
              {pointsNeeded.toLocaleString('en-US')} more pts needed
            </Text>
          )}
        </View>
      </View>

      {/* Category stamps */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Category stamps</Text>
          <Text style={[styles.badge, hasAllCategories ? styles.badgeDone : styles.badgeTodo]}>
            {collectedCount} of 4
          </Text>
        </View>

        <View style={styles.categoryList}>
          {REQUIRED_CATEGORIES.map((category) => {
            const collected = !missingCategories.includes(category);
            const canFind = !collected && !!onCategoryPress;

            const row = (
              <>
                <View
                  style={[
                    styles.stamp,
                    collected
                      ? { backgroundColor: CATEGORY_COLORS[category] }
                      : styles.stampEmpty,
                  ]}
                >
                  <Ionicons
                    name={CATEGORY_ICONS[category]}
                    size={18}
                    color={collected ? colors.background : colors.textSecondary}
                  />
                </View>

                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryStatus}>
                    {collected
                      ? `Collected · +${POINTS_PER_CATEGORY[category]} pts`
                      : 'Not collected yet'}
                  </Text>
                </View>

                {collected ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                ) : canFind ? (
                  <View style={styles.findLink}>
                    <Text style={styles.findLinkText}>Find sites</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.accent} />
                  </View>
                ) : null}
              </>
            );

            return canFind ? (
              <Pressable
                key={category}
                style={({ pressed }) => [styles.categoryRow, pressed && styles.rowPressed]}
                onPress={() => onCategoryPress(category)}
                accessibilityRole="button"
                accessibilityLabel={`${category} stamp not collected. Find ${category} sites`}
              >
                {row}
              </Pressable>
            ) : (
              <View
                key={category}
                style={styles.categoryRow}
                accessible
                accessibilityLabel={`${category} stamp ${collected ? 'collected' : 'not collected'}`}
              >
                {row}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const STAMP_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.background,
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
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  badge: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  badgeDone: {
    color: colors.successDark,
    backgroundColor: colors.successLight,
  },
  badgeTodo: {
    color: colors.accent,
    backgroundColor: colors.accentTint,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  progressNote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressNoteDone: {
    color: colors.success,
    fontFamily: 'Inter_600SemiBold',
  },
  categoryList: {
    gap: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  stamp: {
    width: STAMP_SIZE,
    height: STAMP_SIZE,
    borderRadius: STAMP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampEmpty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.textSecondary,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...typography.labelLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  categoryStatus: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 1,
  },
  findLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  findLinkText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.accent,
  },
});
