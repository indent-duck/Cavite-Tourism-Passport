import { colors, radii, shadows, spacing, typography } from "@/theme";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  size?: "default" | "small";
  testID?: string;
  backgroundColor?: string;
  textColor?: string;
  /** Optional count shown after the label, e.g. number of matching items */
  count?: number;
  /**
   * Raised with the card shadow instead of a border, for filter rows. The
   * row's ScrollView needs vertical padding or it clips the shadow.
   */
  elevated?: boolean;
}

// Pads the touch area to the 44pt platform minimum without changing visuals
const HIT_SLOP = {
  default: { top: 4, bottom: 4 },
  small: { top: 6, bottom: 6 },
} as const;

/**
 * Chip Component
 *
 * A pill-shaped button used for filters, categories, and toggles.
 *
 * Visual specifications:
 * - Height: 36px (default), 32px (small)
 * - Border radius: 16px (pill shape)
 * - Unselected: white background, border, primary text
 * - Selected: primary blue background, white text, no border
 * - Elevated: card shadow instead of the border, in either state
 * - Padding: 12px horizontal (default), 8px horizontal (small)
 * - Icon spacing: 6px from text
 * - Touch area: padded to 44px tall via hitSlop
 *
 * Note: When providing an icon, ensure it uses the appropriate color:
 * - Unselected state: colors.primary
 * - Selected state: colors.background (white)
 *
 * Usage:
 * ```tsx
 * <Chip label="Dining" selected onPress={() => {}} />
 * <Chip
 *   label="Heritage"
 *   icon={<Ionicons name="restaurant" size={16} color={colors.primary} />}
 *   size="small"
 * />
 * ```
 */
export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  size = "default",
  testID,
  backgroundColor,
  textColor: customTextColor,
  count,
  elevated = false,
}: ChipProps) {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const isSmall = size === "small";
  const textColor = customTextColor || (selected ? colors.background : colors.primary);
  const bgColor = backgroundColor || (selected ? colors.primary : colors.background);

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      hitSlop={HIT_SLOP[size]}
      style={({ pressed }) => [
        styles.container,
        isSmall ? styles.containerSmall : styles.containerDefault,
        selected ? styles.containerSelected : styles.containerUnselected,
        elevated && styles.containerElevated,
        pressed && styles.containerPressed,
        backgroundColor && { backgroundColor: bgColor },
        backgroundColor && !selected && { borderWidth: 0 },
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={count === undefined ? label : `${label}, ${count}`}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.label,
          isSmall && styles.labelSmall,
          { color: textColor },
        ]}
        numberOfLines={1}
      >
        {label}
        {count !== undefined && <Text style={styles.count}> {count}</Text>}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.chip,
  },
  containerDefault: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
  containerSmall: {
    height: 32,
    paddingHorizontal: spacing.sm,
  },
  containerUnselected: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerSelected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  containerElevated: {
    borderWidth: 0,
    ...shadows.card,
  },
  containerPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: 6,
  },
  label: {
    ...typography.labelLarge,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
  },
  count: {
    opacity: 0.7,
  },
  labelSmall: {
    ...typography.labelMedium,
  },
});
