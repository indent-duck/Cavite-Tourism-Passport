import { getOpenStatus } from "@/lib/hours";
import { colors, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export interface OpenStatusLabelProps {
  operatingHours?: string;
}

/**
 * "Open now · until 5:00 PM" / "Closed · opens 8:00 AM" / "Open 24 hours".
 * Falls back to the raw hours text when it can't be parsed, and renders
 * nothing when a site has no hours.
 */
export function OpenStatusLabel({ operatingHours }: OpenStatusLabelProps) {
  if (!operatingHours) return null;
  const status = getOpenStatus(operatingHours);

  let state: string | null = null;
  let detail = operatingHours;
  let stateColor: string = colors.textSecondary;

  if (status?.kind === "always") {
    state = "Open 24 hours";
    detail = "";
    stateColor = colors.success;
  } else if (status?.kind === "open") {
    state = "Open now";
    detail = `until ${status.closesAt}`;
    stateColor = colors.success;
  } else if (status?.kind === "closed") {
    state = "Closed";
    detail = `opens ${status.opensAt}`;
    stateColor = colors.error;
  }

  return (
    <View style={styles.row}>
      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
      <Text style={styles.text} numberOfLines={1}>
        {state && <Text style={[styles.state, { color: stateColor }]}>{state}</Text>}
        {state && detail ? " · " : ""}
        {detail}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  text: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  state: {
    fontFamily: "Inter_600SemiBold",
  },
});
