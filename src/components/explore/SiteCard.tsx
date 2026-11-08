import { POINTS_PER_CATEGORY, type Category, type Site } from "@/data/types";
import { colors, radii, shadows, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

/**
 * SiteCard Component
 *
 * Displays site summary with visited indicator.
 * Used in Explore tab Sites view.
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
   * Callback when card is pressed
   */
  onPress: () => void;

  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

// Category colors for tags
const CATEGORY_COLORS: Record<Category, string> = {
  Dining: colors.categoryDining,
  Staycation: colors.categoryStaycation,
  Adventure: colors.categoryAdventure,
  Heritage: colors.categoryHeritage,
  Festival: colors.categoryFestival,
};

export function SiteCard({ site, isVisited, onPress, testID }: SiteCardProps) {
  const points = POINTS_PER_CATEGORY[site.category];
  const categoryColor = CATEGORY_COLORS[site.category];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      testID={testID}
    >
      {/* Photo with overlays */}
      <View style={styles.photoContainer}>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.photo}
          resizeMode="cover"
        />

        {/* Category tag overlay (top-left) */}
        <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{site.category}</Text>
        </View>

        {/* Visited indicator overlay (bottom-left) */}
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

        {/* Points badge (top-right) */}
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>+{points} pts</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {site.name}
        </Text>

        <View style={styles.addressRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={colors.textSecondary}
            style={styles.addressIcon}
          />
          <Text style={styles.address} numberOfLines={2}>
            {site.address}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...shadows.card,
  },
  containerPressed: {
    opacity: 0.7,
  },
  photoContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
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
  visitedBadge: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
    gap: spacing.xs,
  },
  visitedText: {
    ...typography.labelMedium,
    color: colors.success,
    fontFamily: "Inter_600SemiBold",
  },
  pointsBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  pointsText: {
    ...typography.labelMedium,
    color: colors.background,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    padding: spacing.base,
  },
  name: {
    ...typography.titleMedium,
    color: colors.text,
    fontFamily: "Inter_600SemiBold",
    marginBottom: spacing.xs,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressIcon: {
    marginTop: 2,
    marginRight: spacing.xs,
  },
  address: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
});
