import { Card } from "@/components/ui/Card";
import type { ClaimDenial } from "@/data/types";
import { describeDenial } from "@/lib/rewards";
import { colors, radii, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface ClaimDeniedBannerProps {
  denial: ClaimDenial;
  /** Opens the reward, where the user can get a new code */
  onOpen: () => void;
  /** Hides the notice for good (this denial) */
  onDismiss: () => void;
  testID?: string;
}

/**
 * ClaimDeniedBanner
 *
 * Top of the Rewards hub after an admin denied the user's claim code, in the
 * place the code's banner was: which reward, the admin's reason, and that no
 * points were deducted. Tapping it opens the reward; × dismisses it. It
 * stays until it's seen (useSeenClaimDenial) or the user gets a new code.
 */
export function ClaimDeniedBanner({
  denial,
  onOpen,
  onDismiss,
  testID,
}: ClaimDeniedBannerProps) {
  const title = denial.rewardTitle
    ? `Your claim for ${denial.rewardTitle} wasn't approved`
    : "Your claim wasn't approved";
  const body = describeDenial(denial.reason);

  return (
    <Card
      onPress={onOpen}
      style={styles.banner}
      contentStyle={styles.content}
      accessibilityLabel={`${title}. ${body}`}
      accessibilityHint="Opens the reward"
      testID={testID}
    >
      <View style={styles.icon}>
        <Ionicons name="alert-circle" size={20} color={colors.background} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <View style={styles.hintRow}>
          <Text style={styles.hint}>Tap to open the reward</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.error} />
        </View>
      </View>
      <Pressable
        onPress={onDismiss}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        style={styles.close}
        testID={testID ? `${testID}-dismiss` : undefined}
      >
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.errorTint,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.labelLarge,
    fontFamily: "Inter_700Bold",
    color: colors.error,
  },
  body: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 18,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.labelMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.error,
  },
  close: {
    padding: 2,
  },
});
