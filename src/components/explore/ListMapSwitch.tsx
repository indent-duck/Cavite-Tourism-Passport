import { colors, radii } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet } from "react-native";

export interface ListMapSwitchProps {
  value: "list" | "map";
  onValueChange: (value: "list" | "map") => void;
}

/**
 * ListMapSwitch Component
 *
 * Icon button beside the Explore search bar that flips the Sites view
 * between list and map. It shows the icon of the mode it switches to, and
 * sits in the same pinned row in both modes, so nothing at the bottom of the
 * screen (map preview card, tab bar) can move it.
 */
export function ListMapSwitch({ value, onValueChange }: ListMapSwitchProps) {
  const target = value === "map" ? "list" : "map";

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onValueChange(target);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      accessibilityLabel={`Switch to ${target} view`}
      accessibilityRole="button"
      testID="list-map-switch"
    >
      <Ionicons
        name={target === "map" ? "map-outline" : "list"}
        size={20}
        color={colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Matches the search bar beside it
  container: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerPressed: {
    opacity: 0.6,
  },
});
