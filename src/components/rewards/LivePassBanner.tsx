import { ClaimCodeDigits } from "@/components/rewards/ClaimCodeDigits";
import { Card } from "@/components/ui/Card";
import type { LivePass } from "@/data/types";
import { formatCountdown, spellClaimCode } from "@/lib/rewards";
import { colors, radii, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface LivePassBannerProps {
  pass: LivePass;
  /** Opens the reward screen, which shows the code */
  onShowPass: () => void;
  testID?: string;
}

const BORDER = 2;

/**
 * LivePassBanner
 *
 * Top of the Rewards hub while the user has a live claim code. The code is
 * the point of the banner, so it's the biggest thing on it, in the same
 * digit tiles as the code screen:
 * - Orange header strip: "Your claim code" and the time left (red in the
 *   last minute)
 * - The 6 digits, in two groups of three
 * - One line under it: the reward it's for · "Tap to show it"
 *
 * The whole banner is the tap target and opens the code's screen, with the
 * same press feedback as the reward cards. useLivePass removes the code when
 * it expires, which hides this banner. Key it by claim ID so the countdown
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

  // Same as the code screen's timer: red in the last minute
  const urgent = remainingMs <= 60_000;
  const timeColor = urgent ? colors.error : colors.accent;

  return (
    <Card
      onPress={onShowPass}
      style={styles.banner}
      contentStyle={styles.content}
      accessibilityLabel={`Your claim code for ${pass.rewardTitle}: ${spellClaimCode(pass.code)}. ${formatCountdown(remainingMs)} left`}
      accessibilityHint="Opens your claim code"
      testID={testID}
    >
      {/* Header strip */}
      <View style={styles.header}>
        <Ionicons name="keypad" size={16} color={colors.background} />
        <Text style={styles.headerLabel}>Your claim code</Text>
        <View style={styles.timePill}>
          <Ionicons name="time-outline" size={13} color={timeColor} />
          <Text style={[styles.timeText, { color: timeColor }]}>
            {formatCountdown(remainingMs)} left
          </Text>
        </View>
      </View>

      {/* Code */}
      <View style={styles.body}>
        <ClaimCodeDigits code={pass.code} variant="banner" />
        {/* The reward's name gives way first when the line is short */}
        <View style={styles.footer}>
          <Text style={styles.reward} numberOfLines={1}>
            {pass.rewardTitle}
          </Text>
          <Text style={styles.hint}> · Tap to show it</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.accent} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: BORDER,
    borderColor: colors.accent,
  },
  content: {
    // Inside the border, so the strip's corners meet it cleanly
    borderRadius: radii.card - BORDER,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.accent,
  },
  headerLabel: {
    ...typography.labelMedium,
    fontFamily: "Inter_700Bold",
    color: colors.background,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    flex: 1,
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radii.full,
    backgroundColor: colors.background,
  },
  timeText: {
    ...typography.labelMedium,
    fontFamily: "Inter_700Bold",
    fontVariant: ["tabular-nums"],
  },
  body: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
  },
  reward: {
    ...typography.labelMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
    flexShrink: 1,
  },
  hint: {
    ...typography.labelMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.accent,
  },
});
