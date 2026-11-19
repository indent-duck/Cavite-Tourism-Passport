import { colors, radii, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text } from "react-native";

export interface ListMapSwitchProps {
  value: "list" | "map";
  onValueChange: (value: "list" | "map") => void;
}

/**
 * ListMapSwitch Component
 *
 * A button that toggles between list and map view modes.
 *
 * **Visual Specifications:**
 * - Button with icon and label
 * - Icon/label show the destination: "Map" while in list view,
 *   "List" while in map view
 * - List view: surface background, primary text/icon, with border
 * - Map view: primary background, white text/icon (reversed colors)
 * - Rounded corners
 * - Height: 40px to match search bar
 *
 * **Behavior:**
 * - Toggles between "list" and "map" on press
 * - Provides haptic feedback on press
 *
 * **Validates:** Requirements 2.2.3
 */
export function ListMapSwitch({ value, onValueChange }: ListMapSwitchProps) {
  const isMapView = value === "map";
  const target = isMapView ? "list" : "map";

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(target);
  };

  const iconName = isMapView ? "list" : "map";
  const label = isMapView ? "List" : "Map";

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        isMapView && styles.containerMapView,
        pressed && styles.containerPressed,
      ]}
      accessibilityLabel={`Switch to ${target} view`}
      accessibilityRole="button"
    >
      <Ionicons
        name={iconName}
        size={20}
        color={isMapView ? colors.background : colors.primary}
      />
      <Text style={[styles.label, isMapView && styles.labelMapView]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  containerMapView: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  containerPressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: "600",
  },
  labelMapView: {
    color: colors.background,
  },
});
