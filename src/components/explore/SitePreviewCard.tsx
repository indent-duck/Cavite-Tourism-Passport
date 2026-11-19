import { POINTS_PER_CATEGORY, type Site } from "@/data/types";
import { formatDistance } from "@/lib/geo";
import { Card } from "@/components/ui/Card";
import { colors, radii, spacing, typography } from "@/theme";
import { CATEGORY_COLORS } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SitePhoto } from "./SitePhoto";

export interface SitePreviewCardProps {
  site: Site;
  isVisited: boolean;
  distanceMeters?: number;
  /** Opens the site's detail screen */
  onPress: () => void;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Compact site summary shown over the Explore map when a pin is tapped, so
 * users can browse pins without leaving the map.
 */
export function SitePreviewCard({
  site,
  isVisited,
  distanceMeters,
  onPress,
  onClose,
  style,
}: SitePreviewCardProps) {
  const color = CATEGORY_COLORS[site.category];
  const points = POINTS_PER_CATEGORY[site.category];

  return (
    <Card
      onPress={onPress}
      style={[styles.wrapper, style]}
      contentStyle={styles.card}
      accessibilityLabel={`${site.name}, ${site.category}, ${site.municipality}. View details.`}
      testID="site-preview-card"
    >
      <View style={styles.thumb}>
        <SitePhoto site={site} iconSize={28} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.category, { color }]}>
          {site.category.toUpperCase()}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {site.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {site.municipality}
          {distanceMeters !== undefined &&
            ` · ${formatDistance(distanceMeters)}`}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.points}>+{points} pts</Text>
          {isVisited && (
            <View style={styles.visited}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={colors.success}
              />
              <Text style={styles.visitedText}>Visited</Text>
            </View>
          )}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textSecondary}
      />

      <Pressable
        onPress={onClose}
        hitSlop={spacing.sm}
        style={styles.close}
        accessibilityRole="button"
        accessibilityLabel="Close preview"
      >
        <Ionicons name="close" size={16} color={colors.textSecondary} />
      </Pressable>
    </Card>
  );
}

const THUMB_SIZE = 80;

const styles = StyleSheet.create({
  // Stronger shadow than list cards: it floats over the map
  wrapper: {
    shadowOpacity: 0.16,
    elevation: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    paddingRight: spacing.xl,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  body: {
    flex: 1,
    gap: 2,
  },
  category: {
    ...typography.labelSmall,
    letterSpacing: 0.8,
  },
  name: {
    ...typography.titleMedium,
    fontFamily: "Inter_700Bold",
    color: colors.text,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: 2,
  },
  points: {
    ...typography.labelMedium,
    fontFamily: "Inter_700Bold",
    color: colors.accent,
  },
  visited: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  visitedText: {
    ...typography.labelMedium,
    color: colors.success,
  },
  close: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
