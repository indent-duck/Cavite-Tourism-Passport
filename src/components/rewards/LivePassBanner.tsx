import { Card } from "@/components/ui/Card";
import type { LivePass } from "@/data/types";
import { formatCountdown } from "@/lib/rewards";
import { colors, radii, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface LivePassBannerProps {
  pass: LivePass;
  /** Opens the reward screen, which shows the pass */
  onShowPass: () => void;
  testID?: string;
}

/**
 * LivePassBanner
 *
 * Top of the Rewards hub while the user has a live claim pass: which reward
 * it's for and the time left. The whole banner is the tap target and opens
 * the pass (e.g. at the desk after leaving the screen), with the same press
 * feedback as the reward cards. useLivePass removes the pass when it
 * expires, which hides this banner. Key it by claim ID so the countdown
 * starts fresh.
 */
export function LivePassBanner({
  pass,
  onShowPass,
  testID,
}: LivePassBannerProps) {
  const expiresAt = new Date(pass.expiresAt).getTime();
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, expiresAt - Date.now()),
  );

  useEffect(() => {
    const interval = setInterval(
      () => setRemainingMs(Math.max(0, expiresAt - Date.now())),
      1000,
    );
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Same colors as the pass's own timer: red in the last minute
  const timeColor = remainingMs <= 60_000 ? colors.error : colors.accent;

  return (
    <Card
      onPress={onShowPass}
      style={styles.banner}
      contentStyle={styles.content}
      accessibilityLabel={`Your claim pass for ${pass.rewardTitle} is ready, ${formatCountdown(remainingMs)} left`}
      accessibilityHint="Opens your claim pass"
      testID={testID}
    >
      <View style={styles.icon}>
        <Ionicons name="qr-code" size={20} color={colors.background} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Your claim pass is ready:</Text>
        <Text style={styles.reward} numberOfLines={1}>
          {pass.rewardTitle}
        </Text>
        <Text style={styles.meta}>
          <Text style={[styles.time, { color: timeColor }]}>
            {formatCountdown(remainingMs)}
          </Text>{" "}
          left · tap to show it at the desk
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.accent} />
    </Card>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.labelLarge,
    fontFamily: "Inter_700Bold",
    color: colors.text,
  },
  reward: {
    ...typography.bodyMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  time: {
    fontFamily: "Inter_700Bold",
    fontVariant: ["tabular-nums"],
  },
});
