import { Category, POINTS_PER_CATEGORY } from "@/data/types";
import { colors, radii, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

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
const MAIN_CATEGORIES: Category[] = [
  "Dining",
  "Staycation",
  "Heritage",
  "Adventure",
];

// Category icon mapping
const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dining: "restaurant",
  Staycation: "bed",
  Heritage: "business",
  Adventure: "compass",
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
  const collectedCount = MAIN_CATEGORIES.filter((cat) =>
    stampCategories.includes(cat),
  ).length;

  return (
    <View style={styles.card} testID={testID}>
      {/* Points Balance Section */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
        <View style={styles.pointsRow}>
          <Text style={styles.pointsNumber}>{points}</Text>
          <Text style={styles.pointsLabel}> pts</Text>
        </View>
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
          {MAIN_CATEGORIES.map((category) => {
            const isCollected = stampCategories.includes(category);
            const categoryColor = CATEGORY_COLORS[category];
            const categoryIcon = CATEGORY_ICONS[category];
            const categoryPoints = POINTS_PER_CATEGORY[category];

            return (
              <View
                key={category}
                style={[
                  styles.chip,
                  {
                    borderWidth: isCollected ? 0 : 1,
                    borderColor: isCollected ? "transparent" : colors.border,
                    backgroundColor: isCollected
                      ? colors.successLight
                      : "#FFF3E0",
                  },
                ]}
              >
                {/* Category Icon */}
                <Ionicons
                  name={categoryIcon}
                  size={16}
                  color={isCollected ? colors.successDark : colors.accent}
                  style={styles.chipIcon}
                />

                {/* Category Info */}
                <View style={styles.chipContent}>
                  <Text
                    style={[
                      styles.chipName,
                      {
                        color: isCollected ? colors.successDark : colors.accent,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                  <Text
                    style={[
                      styles.chipStatus,
                      {
                        color: isCollected ? colors.successDark : colors.accent,
                      },
                    ]}
                  >
                    {isCollected
                      ? `Collected • ${categoryPoints} pts`
                      : "Missing (Need 1)"}
                  </Text>
                </View>

                {/* Status Icon */}
                <Ionicons
                  name={isCollected ? "checkmark-circle" : "alert-circle"}
                  size={18}
                  color={isCollected ? colors.successDark : colors.accent}
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
    backgroundColor: "#E9EDFF", // Light blue gradient background
    borderRadius: radii.card,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: `${colors.border}50`,
    shadowColor: "#1B2A49",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  balanceSection: {
    alignItems: "flex-start",
    paddingBottom: spacing.sm,
  },
  balanceLabel: {
    ...typography.labelMedium,
    fontFamily: "Inter_700Bold",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  pointsNumber: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.accent,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  pointsLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.accent,
  },
  balanceSubtext: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: `${colors.border}50`,
    marginVertical: spacing.sm,
  },
  milestonesSection: {
    gap: spacing.sm,
  },
  milestonesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  milestonesLabel: {
    ...typography.labelMedium,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: colors.primary,
  },
  badge: {
    backgroundColor: `${colors.accent}30`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    ...typography.bodySmall,
    fontSize: 11,
    fontWeight: "700",
    color: colors.accent,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 52,
    marginBottom: spacing.sm,
    // 2 chips per row with space between
    width: "48.5%",
    shadowColor: "#1B2A49",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipIcon: {
    marginRight: spacing.sm,
  },
  chipContent: {
    flex: 1,
  },
  chipName: {
    ...typography.labelMedium,
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: colors.text,
    marginBottom: 2,
  },
  chipStatus: {
    ...typography.bodySmall,
    fontSize: 10,
    fontWeight: "600",
  },
  statusIcon: {
    marginLeft: spacing.xs,
  },
});
