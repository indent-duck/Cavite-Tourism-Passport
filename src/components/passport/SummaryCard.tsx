import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEvents } from "@/hooks/useEvents";
import { usePromoPeriod } from "@/hooks/usePromoPeriod";
import { useSites } from "@/hooks/useSites";
import { useStamps } from "@/hooks/useStamps";
import { colors, radii, shadows, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

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
  const isLoading =
    stampsLoading ||
    sitesLoading ||
    eventsLoading ||
    userLoading ||
    promoLoading;

  // Calculate totals
  const collectedCount = stamps.length;
  const festivalStampCount = events.filter(
    (event) => event.festivalStamp?.available,
  ).length;
  const totalSlots = sites.length + festivalStampCount;
  const points = currentUser?.points ?? 0;
  const completionPercentage =
    totalSlots > 0 ? (collectedCount / totalSlots) * 100 : 0;
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
          <Ionicons
            name="book"
            size={20}
            color={colors.primary}
            style={styles.titleIcon}
          />
          <Text style={styles.title}>DIGITAL PASSPORT</Text>
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
          <Text style={[styles.tileLabel, styles.tileLabelStamps]}>
            STAMPS COLLECTED
          </Text>
          <Text>
            <Text style={[styles.amountTypography, styles.collectedCount]}>
              {collectedCount}
            </Text>
            <Text
              style={[
                styles.tileValueSecondary,
                { color: colors.textSecondary },
              ]}
            >
              {" "}
              of {totalSlots}
            </Text>
          </Text>
        </View>

        {/* Passport Balance Tile */}
        <View style={[styles.tile, styles.balanceTile]}>
          <Text style={[styles.tileLabel, styles.tileLabelBalance]}>
            PASSPORT BALANCE
          </Text>
          <Text>
            <Text style={[styles.amountTypography, styles.balanceCount]}>
              {points}
            </Text>
            <Text style={[styles.tileValueSecondary, { color: colors.accent }]}>
              {" "}
              PTS{" "}
            </Text>
          </Text>
        </View>
      </View>

      {/* Completion Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Overall Completion</Text>
          <Text style={styles.progressPercentage}>
            {Math.round(completionPercentage)}%
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${completionPercentage}%` },
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
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleIcon: {
    marginRight: spacing.sm,
  },
  title: {
    ...typography.titleMedium,
    color: colors.text,
    fontFamily: "Inter_700Bold",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5", // Light emerald background
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
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tile: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.chip,
    minHeight: 80,
    justifyContent: "center",
  },
  stampsTile: {
    backgroundColor: colors.surface, // Light blue background
  },
  balanceTile: {
    backgroundColor: "#FFF3E0", // Light orange background
  },
  tileLabel: {
    ...typography.labelSmall,
    marginBottom: spacing.xs,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  tileLabelStamps: {
    color: colors.textSecondary,
  },
  tileLabelBalance: {
    color: colors.textTertiary,
  },
  amountTypography: {
    ...typography.headlineLarge,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  collectedCount: {
    // Inherits from parent tileValue
    color: colors.primary,
  },
  balanceCount: {
    color: colors.accent,
  },
  tileValueSecondary: {
    // Inherits from parent tileValue
    ...typography.labelMedium,
  },
  totalSlots: {
    // Inherits from parent tileValue
    color: colors.textSecondary,
  },
  progressSection: {
    marginTop: spacing.xs,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  progressPercentage: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
});
