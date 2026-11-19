import { colors, radii, shadows, spacing, typography } from "@/theme";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Header Component
 *
 * Displays user name and points with optional right slot for additional content.
 * Applied at the top of tab screens with safe area handling.
 *
 * Validates: Requirements 1.2.7 (Header Component)
 */

export interface HeaderProps {
  /**
   * User display name
   */
  userName: string;

  /**
   * User current points total
   */
  points: number;

  /**
   * Callback when points are pressed
   */
  onPointsPress: () => void;

  /**
   * Optional content to render in the top-right corner
   */
  rightSlot?: React.ReactNode;

  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

export function Header({
  userName,
  points,
  onPointsPress,
  rightSlot,
  testID,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  const handlePointsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPointsPress();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.base,
        },
      ]}
      testID={testID}
    >
      <View style={styles.leftContent}>
        <Text style={styles.userName} numberOfLines={1}>
          {userName}
        </Text>
        {/* Same pill shape/icon as the Rewards Hub badge, recolored for blue */}
        <Pressable
          onPress={handlePointsPress}
          style={styles.pointsPill}
          hitSlop={spacing.sm}
        >
          <MaterialIcons name="stars" size={16} color={colors.accent} />
          <Text style={styles.pointsText}>
            {points.toLocaleString("en-US")} pts
          </Text>
        </Pressable>
      </View>

      {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    backgroundColor: colors.secondary,
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
    ...shadows.header,
    // Keep the header (and its shadow) drawn above the tab content below it
    zIndex: 1,
  },
  leftContent: {
    flex: 1,
  },
  userName: {
    ...typography.headlineSmall,
    color: colors.background,
    fontFamily: "Inter_700Bold",
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.onPrimaryOverlay,
    borderWidth: 1,
    borderColor: colors.onPrimaryBorder,
    borderRadius: radii.chip,
  },
  pointsText: {
    ...typography.labelMedium,
    fontSize: 13,
    color: colors.background,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  rightSlot: {
    marginLeft: spacing.md,
    flexShrink: 0,
  },
});
