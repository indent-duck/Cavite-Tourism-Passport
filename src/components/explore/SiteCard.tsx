import { POINTS_PER_CATEGORY, type Site } from "@/data/types";
import { formatDistance } from "@/lib/geo";
import { Card } from "@/components/ui/Card";
import { colors, radii, spacing, typography } from "@/theme";
import { CATEGORY_COLORS } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { OpenStatusLabel } from "./OpenStatusLabel";
import { SitePhoto } from "./SitePhoto";

/**
 * SiteCard Component
 *
 * Displays site summary with visited indicator.
 * Used in Explore tab Sites view.
 *
 * Only the category tag sits on the photo; town, distance, opening status,
 * points and visited state live in the text area below it.
 *
 * Validates: Requirements 2.2.4, 5.2
 */

export interface SiteCardProps {
  /**
   * Site data to display
   */
  site: Site;

  /**
   * Whether user has visited this site (has stamp)
   */
  isVisited: boolean;

  /**
   * Distance from the user, when their location is known
   */
  distanceMeters?: number;

  /**
   * Callback when card is pressed
   */
  onPress: () => void;

  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

export function SiteCard({
  site,
  isVisited,
  distanceMeters,
  onPress,
  testID,
}: SiteCardProps) {
  const points = POINTS_PER_CATEGORY[site.category];
  const distance =
    distanceMeters !== undefined ? formatDistance(distanceMeters) : undefined;

  return (
    <Card
      onPress={onPress}
      testID={testID}
      accessibilityLabel={`${site.name}, ${site.category}, ${site.municipality}${distance ? `, ${distance} away` : ""}. Earn ${points} points.${isVisited ? " Visited." : ""}`}
    >
      {/* Photo with category tag */}
      <View style={styles.photoContainer}>
        <SitePhoto site={site} iconSize={48} />
        <View
          style={[
            styles.categoryTag,
            { backgroundColor: CATEGORY_COLORS[site.category] },
          ]}
        >
          <Text style={styles.categoryText}>{site.category}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {site.name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {site.municipality}
            {distance && <Text style={styles.distance}> · {distance}</Text>}
          </Text>
        </View>

        <OpenStatusLabel operatingHours={site.operatingHours} />

        <View style={styles.footer}>
          <Text style={styles.points}>+{points} pts</Text>
          {isVisited && (
            <View style={styles.visitedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text style={styles.visitedText}>Visited</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  categoryTag: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  categoryText: {
    ...typography.labelSmall,
    color: colors.background,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
  },
  content: {
    padding: spacing.base,
    gap: spacing.xs,
  },
  name: {
    ...typography.titleMedium,
    color: colors.text,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  distance: {
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  points: {
    ...typography.labelLarge,
    color: colors.accent,
    fontFamily: "Inter_700Bold",
  },
  visitedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  visitedText: {
    ...typography.labelMedium,
    color: colors.success,
    fontFamily: "Inter_600SemiBold",
  },
});
