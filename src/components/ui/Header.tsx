import { colors, shadows, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
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
        <Text style={styles.userName}>{userName}</Text>
        <Pressable
          onPress={handlePointsPress}
          style={styles.pointsContainer}
          hitSlop={spacing.sm}
        >
          <Ionicons name="star" size={16} color={colors.accent} />
          <Text style={styles.pointsText}>{points} pts</Text>
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
    alignItems: "flex-start",
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    backgroundColor: colors.primary,
    ...shadows.tabBar,
  },
  leftContent: {
    flex: 1,
  },
  userName: {
    ...typography.headlineLarge,
    color: colors.background,
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  pointsText: {
    ...typography.bodyMedium,
    color: colors.accent,
    marginLeft: spacing.xs,
  },
  rightSlot: {
    marginLeft: spacing.md,
    marginTop: spacing.sm,
  },
});
