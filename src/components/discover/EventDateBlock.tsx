import { colors, radii, shadows, typography } from "@/theme";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export interface EventDateBlockProps {
  /** ISO date; the block shows its month and day */
  date: string;
  /**
   * - tint: orange-tinted tile, for rows on a white card
   * - raised: white tile with a shadow, for sitting on top of a photo
   */
  variant?: "tint" | "raised";
  style?: StyleProp<ViewStyle>;
}

/**
 * Calendar-leaf date tile: short month above a large day number.
 * Shared by the Events list cards and the About Cavite festival preview.
 * Decorative for screen readers; the parent's label carries the date.
 */
export function EventDateBlock({ date, variant = "tint", style }: EventDateBlockProps) {
  const start = new Date(date);
  const month = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

  return (
    <View
      style={[styles.block, variant === "raised" ? styles.raised : styles.tint, style]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={styles.month}>{month}</Text>
      <Text style={styles.day}>{start.getDate()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: 52,
    height: 56,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tint: {
    backgroundColor: colors.accentTint,
  },
  raised: {
    backgroundColor: colors.background,
    ...shadows.card,
  },
  month: {
    ...typography.labelSmall,
    color: colors.accent,
  },
  day: {
    ...typography.headlineMedium,
    fontFamily: "Inter_700Bold",
    color: colors.text,
  },
});
