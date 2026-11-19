import { type Category, type Itinerary } from "@/data/types";
import { Card } from "@/components/ui/Card";
import { colors, radii, spacing, typography } from "@/theme";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

/**
 * ItineraryCard Component
 *
 * Displays itinerary summary with progress tracking.
 * Used in Explore tab Itineraries view.
 *
 * - One tour-type label on the photo (plus a "Completed" stamp when done)
 * - Stops, duration and points on one line, with the stop categories as icons
 * - Progress adapts: "Not started" prompt, progress bar, or completed state
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
   * Distinct categories of the stops, in route order
   */
  stopCategories: Category[];

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
  stopCategories,
  onPress,
  testID,
}: ItineraryCardProps) {
  const isDayTour = itinerary.type === "Day Tour";
  const isCompleted = totalStops > 0 && stampedCount >= totalStops;
  const isStarted = stampedCount > 0;
  const percentage =
    totalStops > 0 ? Math.round((stampedCount / totalStops) * 100) : 0;

  const progressLabel = isCompleted
    ? "Completed"
    : isStarted
      ? `${stampedCount} of ${totalStops} stamped`
      : "Not started";

  return (
    <Card
      onPress={onPress}
      testID={testID}
      accessibilityLabel={`${itinerary.title}, ${itinerary.type}, ${totalStops} stops${itinerary.duration ? `, ${itinerary.duration}` : ""}. ${progressLabel}. Earn up to ${pointsAvailable} points.`}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {itinerary.imageUrl ? (
          <Image
            source={{ uri: itinerary.imageUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={itinerary.id}
            accessible={false}
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Ionicons
              name="map"
              size={48}
              color={colors.primary}
              style={styles.placeholderIcon}
            />
          </View>
        )}

        {/* Tour type (top-left) */}
        <View style={styles.typeBadge}>
          <Ionicons
            name={isDayTour ? "sunny" : "moon"}
            size={12}
            color={isDayTour ? colors.textTertiary : colors.primary}
          />
          <Text
            style={[
              styles.typeBadgeText,
              { color: isDayTour ? colors.textTertiary : colors.primary },
            ]}
          >
            {isDayTour ? "Day tour" : "Overnight"}
          </Text>
        </View>

        {/* Completed stamp (top-right) */}
        {isCompleted && (
          <View style={styles.completedStamp}>
            <Ionicons name="ribbon" size={14} color={colors.background} />
            <Text style={styles.completedStampText}>Completed</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {itinerary.title}
        </Text>

        {!!itinerary.description && (
          <Text style={styles.description} numberOfLines={2}>
            {itinerary.description}
          </Text>
        )}

        {/* Stops · duration · points */}
        <View style={styles.metaRow}>
          <MetaItem icon="flag-outline" text={`${totalStops} stops`} />
          {!!itinerary.duration && (
            <MetaItem icon="time-outline" text={itinerary.duration} />
          )}
          <Text style={styles.points}>+{pointsAvailable} pts</Text>
        </View>

        {/* What the stops involve */}
        {stopCategories.length > 0 && (
          <View style={styles.categoryRow}>
            {stopCategories.map((category) => (
              <View
                key={category}
                style={[
                  styles.categoryIcon,
                  { backgroundColor: CATEGORY_COLORS[category] },
                ]}
                accessibilityLabel={category}
              >
                <Ionicons
                  name={CATEGORY_ICONS[category]}
                  size={12}
                  color={colors.background}
                />
              </View>
            ))}
          </View>
        )}

        {/* Progress */}
        <View style={styles.progressSection}>
          {isCompleted ? (
            <View style={styles.progressRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.success}
              />
              <Text style={styles.completedText}>
                All {totalStops} stops stamped
              </Text>
            </View>
          ) : isStarted ? (
            <>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{progressLabel}</Text>
                <Text style={styles.progressPercentage}>{percentage}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[styles.progressBarFill, { width: `${percentage}%` }]}
                />
              </View>
            </>
          ) : (
            <View style={[styles.progressRow, styles.notStartedRow]}>
              <Text style={styles.notStartedText}>Not started</Text>
              <View style={styles.progressRow}>
                <Text style={styles.startText}>Start tour</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={colors.accent}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

function MetaItem({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnailContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.primaryTint,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    opacity: 0.4,
  },
  typeBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  typeBadgeText: {
    ...typography.labelSmall,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
  },
  completedStamp: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  completedStampText: {
    ...typography.labelSmall,
    color: colors.background,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
  },
  content: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineSmall,
    color: colors.text,
    fontFamily: "Inter_600SemiBold",
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: spacing.md,
    rowGap: spacing.xs,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  points: {
    ...typography.labelMedium,
    color: colors.accent,
    fontFamily: "Inter_700Bold",
  },
  categoryRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  progressSection: {
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  notStartedRow: {
    justifyContent: "space-between",
  },
  notStartedText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  startText: {
    ...typography.labelLarge,
    color: colors.accent,
  },
  completedText: {
    ...typography.labelLarge,
    color: colors.successDark,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontFamily: "Inter_400Regular",
  },
  progressPercentage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontFamily: "Inter_600SemiBold",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: radii.full,
  },
});
