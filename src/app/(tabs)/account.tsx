import { LogoutConfirmModal } from "@/components/account/LogoutConfirmModal";
import { PassportIdCard } from "@/components/account/PassportIdCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StatusPill } from "@/components/ui/StatusPill";
import { getStamps } from "@/data/api";
import type { User } from "@/data/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePromoPeriod } from "@/hooks/usePromoPeriod";
import { useSignOut } from "@/hooks/useSignOut";
import { useSites } from "@/hooks/useSites";
import { APP_VERSION } from "@/lib/constants";
import { getFullName } from "@/lib/names";
import { colors, radii, shadows, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

/**
 * Account Tab Screen
 *
 * Displays the digital passport ID card, activity stats, account details,
 * navigation links, and logout.
 *
 * Features:
 * - Digital Cavite Tourism Passport ID card (name, address, passport ID)
 * - Activity stats (stamps → Passport tab, points → Rewards) and promo period
 * - Account details (email, sign-in method, member since)
 * - Navigation to Settings, Redemptions, Privacy Policy
 * - Sign out functionality
 */
export default function AccountScreen() {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: promoPeriod } = usePromoPeriod();
  const { data: sites } = useSites();
  const { data: stamps } = useQuery({
    queryKey: ["stamps"],
    queryFn: getStamps,
  });
  const { signOut } = useSignOut();

  if (userLoading || !user) {
    return <AccountSkeleton />;
  }

  const stampCount = stamps?.length ?? 0;
  const totalStamps = sites?.length;
  const stampProgress = totalStamps ? Math.min(stampCount / totalStamps, 1) : 0;

  return (
    <ScreenContainer
      scrollable={true}
      edges={["top", "left", "right"]}
      withTabBarPadding={true}
      testID="account-screen"
    >
      <View style={styles.container}>
        <Text style={styles.screenTitle} accessibilityRole="header">
          Account
        </Text>

        {/* Digital ID Card */}
        <PassportIdCard
          userName={getFullName(user)}
          municipality={user.address}
          passportId={user.passportId}
        />

        {/* Activity Stats */}
        <View style={styles.statsGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.navigate("/passport")}
            accessibilityRole="button"
            accessibilityLabel={`${stampCount}${totalStamps ? ` of ${totalStamps}` : ""} stamps collected. Open passport`}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Stamps</Text>
              <Ionicons name="ribbon" size={16} color={colors.primary} />
            </View>
            <View style={styles.statValue}>
              <Text style={styles.statCount}>{stampCount}</Text>
              {totalStamps !== undefined && (
                <Text style={styles.statUnit}>/ {totalStamps}</Text>
              )}
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stampProgress * 100}%` },
                ]}
              />
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push("/rewards")}
            accessibilityRole="button"
            accessibilityLabel={`${user.points} points. View rewards`}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Points</Text>
              <Ionicons name="star" size={16} color={colors.accent} />
            </View>
            <View style={styles.statValue}>
              <Text style={[styles.statCount, styles.statCountAccent]}>
                {user.points}
              </Text>
              <Text style={[styles.statUnit, styles.statUnitAccent]}>pts</Text>
            </View>
            <View style={styles.statFooter}>
              <Text style={styles.statFooterText}>View rewards</Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={colors.primary}
              />
            </View>
          </Pressable>
        </View>

        {/* Promo Period */}
        {promoPeriod && (
          <View style={styles.promoCard}>
            <View style={[styles.iconChip, styles.iconChipAccent]}>
              <Ionicons
                name="megaphone-outline"
                size={18}
                color={colors.accent}
              />
            </View>
            <View style={styles.promoText}>
              <Text style={styles.promoLabel}>Promo period</Text>
              <Text style={styles.promoDate}>
                {formatDateRange(promoPeriod.startDate, promoPeriod.endDate)}
              </Text>
            </View>
            <StatusPill
              label={promoPeriod.active ? "Active" : "Inactive"}
              tone={promoPeriod.active ? "success" : "neutral"}
            />
          </View>
        )}

        {/* Account Details */}
        <View style={[styles.card, styles.listCard]}>
          <Text style={[styles.sectionTitle, styles.listSectionTitle]}>
            Account details
          </Text>

          <DetailRow icon="mail-outline" label="Email" value={user.email} />
          <View style={styles.listDivider} />
          <DetailRow
            icon="key-outline"
            label="Sign-in method"
            value={getSignInMethod(user)}
          />
          <View style={styles.listDivider} />
          <DetailRow
            icon="calendar-outline"
            label="Member since"
            value={formatMemberSince(user.createdAt)}
          />
        </View>

        {/* Navigation Links */}
        <View style={[styles.card, styles.listCard]}>
          <LinkRow
            icon="settings-outline"
            tone="neutral"
            title="Settings & Preferences"
            subtitle="Account, notifications & help FAQs"
            onPress={() => router.push("/settings")}
          />
          <View style={styles.listDivider} />
          <LinkRow
            icon="gift-outline"
            tone="accent"
            title="Redemptions & Vouchers"
            subtitle="View claimed rewards & active QR passes"
            onPress={() => router.push("/rewards")}
          />
          <View style={styles.listDivider} />
          <LinkRow
            icon="document-text-outline"
            tone="primary"
            title="Stamp requests"
            subtitle="Physical passport stamps sent for review"
            onPress={() => router.push("/stamp-requests")}
          />
          <View style={styles.listDivider} />
          <LinkRow
            icon="shield-checkmark-outline"
            tone="success"
            title="Privacy Policy & Terms"
            subtitle="Cavite Tourism Registry guidelines & data privacy"
            onPress={() => router.push("/privacy")}
          />
        </View>

        {/* Log Out */}
        <View style={[styles.card, styles.listCard]}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutRow,
              pressed && styles.logoutRowPressed,
            ]}
            onPress={() => setLogoutModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        </View>

        <Text style={styles.versionText}>
          Cavite Tourism Passport • v{APP_VERSION}
        </Text>
      </View>

      <LogoutConfirmModal
        visible={logoutModalVisible}
        onDismiss={() => setLogoutModalVisible(false)}
        onConfirm={() => {
          setLogoutModalVisible(false);
          signOut();
        }}
      />
    </ScreenContainer>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDateRange(startDate: Date | string, endDate: Date | string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const sameYear = start.getFullYear() === end.getFullYear();
  const endYear = end.getFullYear();

  if (startMonth === endMonth && sameYear) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${endYear}`;
  }
  const startPart = sameYear
    ? `${startMonth} ${start.getDate()}`
    : `${startMonth} ${start.getDate()}, ${start.getFullYear()}`;
  return `${startPart} – ${endMonth} ${end.getDate()}, ${endYear}`;
}

/** How the user can log in, from the identities linked to their account */
function getSignInMethod({
  hasGoogleSignIn,
  hasPassword,
}: Pick<User, "hasGoogleSignIn" | "hasPassword">) {
  if (hasGoogleSignIn && hasPassword) return "Google or email & password";
  if (hasGoogleSignIn) return "Google";
  return "Email & password";
}

/** e.g. "November 2026" */
function formatMemberSince(createdAt: Date | string) {
  return new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

type IconName = keyof typeof Ionicons.glyphMap;

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.listRow}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={[styles.iconChip, styles.iconChipPrimary]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text
          style={styles.detailValue}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/**
 * Link icon colors, each tied to what the link opens: navy for stamps and
 * orange for rewards (matching the stat cards above), gray for settings,
 * green for privacy
 */
const LINK_TONES = {
  primary: { icon: colors.primary, chip: colors.primaryTint },
  accent: { icon: colors.accent, chip: colors.accentTint },
  success: { icon: colors.success, chip: colors.successLight },
  neutral: { icon: colors.textSecondary, chip: colors.border },
} as const;

function LinkRow({
  icon,
  tone,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  tone: keyof typeof LINK_TONES;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const toneColors = LINK_TONES[tone];
  return (
    <Pressable
      style={({ pressed }) => [
        styles.listRow,
        pressed && styles.listRowPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View style={[styles.iconChip, { backgroundColor: toneColors.chip }]}>
        <Ionicons name={icon} size={20} color={toneColors.icon} />
      </View>
      <View style={styles.linkText}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

function AccountSkeleton() {
  return (
    <ScreenContainer
      scrollable={false}
      edges={["top", "left", "right"]}
      withTabBarPadding={true}
      testID="account-screen-loading"
    >
      <View
        style={styles.container}
        accessibilityLabel="Loading account"
        accessibilityRole="progressbar"
      >
        <View style={[styles.skeleton, { width: 140, height: 32 }]} />
        <View
          style={[styles.skeleton, { height: 180, borderRadius: radii.card }]}
        />
        <View style={styles.statsGrid}>
          <View style={[styles.skeleton, styles.skeletonStat]} />
          <View style={[styles.skeleton, styles.skeletonStat]} />
        </View>
        <View
          style={[styles.skeleton, { height: 64, borderRadius: radii.card }]}
        />
        <View
          style={[styles.skeleton, { height: 140, borderRadius: radii.card }]}
        />
      </View>
    </ScreenContainer>
  );
}

// ============================================================================
// Styles
// ============================================================================

const ICON_CHIP_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  screenTitle: {
    ...typography.headlineLarge,
    fontFamily: "Inter_700Bold",
    color: colors.text,
    marginTop: spacing.sm,
  },

  // Shared card: off-white on the white screen, lifted by the card shadow
  // (same look as the Passport tab's stamp requests card)
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadows.card,
  },
  // A step darker than the card, so the press still shows
  cardPressed: {
    backgroundColor: colors.border,
  },
  listCard: {
    padding: 0,
    overflow: "hidden",
  },
  // Rows in a list card: the details rows and the navigation links
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  listRowPressed: {
    backgroundColor: colors.border,
  },
  listDivider: {
    height: 1,
    backgroundColor: colors.border,
    // Align with the text column: row padding + icon chip + gap
    marginLeft: spacing.base + ICON_CHIP_SIZE + spacing.md,
  },
  sectionTitle: {
    ...typography.labelMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  // Title above list rows: the first row's top padding supplies the gap
  listSectionTitle: {
    paddingTop: spacing.base,
    paddingHorizontal: spacing.base,
    marginBottom: 0,
  },
  iconChip: {
    width: ICON_CHIP_SIZE,
    height: ICON_CHIP_SIZE,
    borderRadius: radii.input,
    alignItems: "center",
    justifyContent: "center",
  },
  iconChipPrimary: {
    backgroundColor: colors.primaryTint,
  },
  iconChipAccent: {
    backgroundColor: colors.accentTint,
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadows.card,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.labelMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statValue: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  statCount: {
    ...typography.headlineLarge,
    fontFamily: "Inter_700Bold",
    color: colors.primary,
  },
  statCountAccent: {
    color: colors.accent,
  },
  statUnit: {
    ...typography.bodyMedium,
    fontFamily: "Inter_500Medium",
    color: colors.textSecondary,
  },
  statUnitAccent: {
    color: colors.accent,
  },
  progressBar: {
    height: 6,
    width: "100%",
    // Track a step darker than the off-white card
    backgroundColor: colors.border,
    borderRadius: radii.full,
    marginTop: spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  statFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: spacing.sm,
  },
  statFooterText: {
    ...typography.labelMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.primary,
  },

  // Promo
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    ...shadows.card,
  },
  promoText: {
    flex: 1,
  },
  promoLabel: {
    ...typography.bodySmall,
    fontFamily: "Inter_400Regular",
    color: colors.textSecondary,
  },
  promoDate: {
    ...typography.labelLarge,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
  },

  // Account details
  detailText: {
    flex: 1,
  },
  detailLabel: {
    ...typography.bodySmall,
    fontFamily: "Inter_400Regular",
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.labelLarge,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
    marginTop: 2,
  },

  // Navigation links
  linkText: {
    flex: 1,
  },
  linkTitle: {
    ...typography.labelLarge,
    fontFamily: "Inter_600SemiBold",
    color: colors.text,
  },
  linkSubtitle: {
    ...typography.bodySmall,
    fontFamily: "Inter_400Regular",
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Log out
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.base,
  },
  logoutRowPressed: {
    backgroundColor: colors.errorTint,
  },
  logoutText: {
    ...typography.labelLarge,
    fontFamily: "Inter_600SemiBold",
    color: colors.error,
  },

  // Version
  versionText: {
    ...typography.bodySmall,
    fontFamily: "Inter_400Regular",
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Skeleton
  skeleton: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
  },
  skeletonStat: {
    flex: 1,
    height: 104,
    borderRadius: radii.card,
  },
});
