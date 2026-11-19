import { colors, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Button } from "./Button";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface StateViewProps {
  /**
   * - loading: spinner (plus optional title)
   * - error: alert icon, error-colored title, primary action
   * - empty: neutral icon and title, outline action
   */
  variant: "loading" | "error" | "empty";
  title?: string;
  message?: string;
  /** Overrides the variant's default icon */
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  /** Shows a spinner in the action button (e.g. while retrying) */
  actionLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * StateView Component
 *
 * Centered placeholder for loading, error, and empty states so screens
 * don't each re-implement the same icon + title + action layout.
 */
export function StateView({
  variant,
  title,
  message,
  icon,
  actionLabel,
  onAction,
  actionLoading,
  style,
  testID,
}: StateViewProps) {
  const isError = variant === "error";

  return (
    <View style={[styles.container, style]} testID={testID}>
      {variant === "loading" ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Ionicons
          name={icon ?? (isError ? "alert-circle-outline" : "search-outline")}
          size={48}
          color={isError ? colors.error : colors.textSecondary}
        />
      )}

      {title && (
        <Text
          style={[styles.title, isError && styles.titleError]}
          accessibilityRole={isError ? "alert" : undefined}
        >
          {title}
        </Text>
      )}

      {message && <Text style={styles.message}>{message}</Text>}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant={isError ? "primary" : "outline"}
          loading={actionLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...typography.titleMedium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  titleError: {
    color: colors.error,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
