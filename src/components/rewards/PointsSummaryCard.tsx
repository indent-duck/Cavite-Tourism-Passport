import { Category, POINTS_PER_CATEGORY } from "@/data/types";
import { REQUIRED_CATEGORIES } from "@/lib/rewards";
import { colors, radii, shadows, spacing, typography } from "@/theme";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

/**
 * PointsSummaryCard Component
 *
 * Top of the Rewards Hub: the user's point balance, the one goal worth
 * chasing next, and the four category stamps every reward requires.
 *
 * Stamps read like passport slots: a collected category is a filled stamp in
 * its category color, a missing one is an empty dashed slot (not an error).
 *
 * Validates: Requirements 1.2.1 (Points Summary Card)
 */

export interface PointsSummaryCardProps {
  /** User's current total points */
  points: number;
  /** Categories for which user has collected stamps */
  stampCategories: Category[];
  /**
   * The next thing to aim for, e.g. "250 pts + Adventure stamp to go for
   * Heritage Books". Hidden when undefined.
   */
  goal?: { text: string; tone: "ready" | "next" | "claimed" };
  /** Optional test identifier */
  testID?: string;
}

const GOAL_ICONS = {
  ready: "gift",
  next: "flag",
  claimed: "checkmark-circle",
} as const;

export function PointsSummaryCard({
  points,
  stampCategories,
  goal,
  testID,
}: PointsSummaryCardProps) {
  const collectedCount = REQUIRED_CATEGORIES.filter((cat) =>
    stampCategories.includes(cat),
  ).length;
  const allCollected = collectedCount === REQUIRED_CATEGORIES.length;

  return (
    <View
      style={styles.card}
      testID={testID}
      accessible
      accessibilityLabel={`Balance ${points} points. ${collectedCount} of 4 category stamps collected.${goal ? ` ${goal.text}.` : ""}`}
    >
      {/* Balance */}
      <Text style={styles.balanceLabel}>Your balance</Text>
      <View style={styles.pointsRow}>
        <Text style={styles.pointsNumber}>{points.toLocaleString("en-US")}</Text>
        <Text style={styles.pointsUnit}>pts</Text>
      </View>

      {/* Next goal */}
      {goal && (
        <View
          style={[
            styles.goalRow,
            goal.tone === "ready" && styles.goalRowReady,
          ]}
        >
          <Ionicons
            name={GOAL_ICONS[goal.tone]}
            size={16}
            color={goal.tone === "next" ? colors.primary : colors.successDark}
          />
          <Text
            style={[
              styles.goalText,
              goal.tone !== "next" && styles.goalTextReady,
            ]}
            numberOfLines={2}
          >
            {goal.text}
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Stamp slots */}
      <View style={styles.stampsHeader}>
        <Text style={styles.stampsLabel}>Required stamps</Text>
        <Text
          style={[styles.stampsCount, allCollected && styles.stampsCountDone]}
        >
          {collectedCount} of 4
        </Text>
      </View>

      <View style={styles.stampsRow}>
        {REQUIRED_CATEGORIES.map((category) => {
          const isCollected = stampCategories.includes(category);
          return (
            <View key={category} style={styles.stampItem}>
              <View
                style={[
                  styles.stamp,
                  isCollected
                    ? { backgroundColor: CATEGORY_COLORS[category] }
                    : styles.stampEmpty,
                ]}
              >
                <Ionicons
                  name={CATEGORY_ICONS[category]}
                  size={20}
                  color={isCollected ? colors.background : colors.textSecondary}
                />
                {isCollected && (
                  <View style={styles.stampCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.success}
                    />
                  </View>
                )}
              </View>
              <Text
                style={[styles.stampName, !isCollected && styles.stampNameEmpty]}
                numberOfLines={1}
              >
                {category}
              </Text>
              <Text style={styles.stampMeta} numberOfLines={1}>
                {isCollected ? `+${POINTS_PER_CATEGORY[category]}` : "Needed"}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const STAMP_SIZE = 48;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryTint,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadows.card,
  },
  balanceLabel: {
    ...typography.labelMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  pointsNumber: {
    fontSize: 36,
    lineHeight: 44,
    fontFamily: "Inter_700Bold",
    color: colors.primary,
    letterSpacing: -0.8,
  },
  pointsUnit: {
    ...typography.titleMedium,
    fontFamily: "Inter_700Bold",
    color: colors.primary,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  goalRowReady: {
    backgroundColor: colors.successLight,
  },
  goalText: {
    ...typography.bodySmall,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
    flex: 1,
  },
  goalTextReady: {
    color: colors.successDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
    marginVertical: spacing.base,
  },
  stampsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  stampsLabel: {
    ...typography.labelLarge,
    fontFamily: "Inter_700Bold",
    color: colors.text,
  },
  stampsCount: {
    ...typography.labelMedium,
    fontFamily: "Inter_700Bold",
    color: colors.accent,
    backgroundColor: colors.accentTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  stampsCountDone: {
    color: colors.successDark,
    backgroundColor: colors.successLight,
  },
  stampsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stampItem: {
    flex: 1,
    alignItems: "center",
  },
  stamp: {
    width: STAMP_SIZE,
    height: STAMP_SIZE,
    borderRadius: STAMP_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stampEmpty: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.textSecondary,
    backgroundColor: colors.background,
  },
  stampCheck: {
    position: "absolute",
    right: -4,
    bottom: -2,
    backgroundColor: colors.background,
    borderRadius: radii.full,
  },
  stampName: {
    ...typography.labelMedium,
    fontFamily: "Inter_700Bold",
    color: colors.text,
    marginTop: spacing.sm,
  },
  stampNameEmpty: {
    color: colors.textSecondary,
  },
  stampMeta: {
    ...typography.labelSmall,
    fontFamily: "Inter_600SemiBold",
    color: colors.textSecondary,
  },
});
