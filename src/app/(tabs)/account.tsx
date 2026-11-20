import { AddContactSheet } from "@/components/account/AddContactSheet";
import { LogoutConfirmModal } from "@/components/account/LogoutConfirmModal";
import { PassportIdCard } from "@/components/account/PassportIdCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StatusPill } from "@/components/ui/StatusPill";
import { getStamps } from "@/data/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePromoPeriod } from "@/hooks/usePromoPeriod";
import { useSignOut } from "@/hooks/useSignOut";
import { useSites } from "@/hooks/useSites";
import { APP_VERSION } from "@/lib/constants";
import { colors, radii, shadows, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

/**
 * Account Tab Screen
 *
 * Displays the digital passport ID card, activity stats, account details with
 * contact number management, navigation links, and logout.
 *
 * Features:
 * - Digital Cavite Tourism Passport ID card (name, address, passport ID)
 * - Activity stats (stamps → Passport tab, points → Rewards) and promo period
 * - Account details (email, contact number with add/verify flow)
 * - Navigation to Settings, Redemptions, Privacy Policy
 * - Sign out functionality
 */
export default function AccountScreen() {
  const [contactSheetVisible, setContactSheetVisible] = useState(false);
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
  const stampProgress = totalStamps
    ? Math.min(stampCount / totalStamps, 1)
    : 0;

  const hasContact = Boolean(user.contactNumber);

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
          userName={user.name}
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
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account details</Text>

          <DetailRow icon="mail-outline" label="Email" value={user.email} />

          <View style={styles.divider} />

          <DetailRow
            icon="phone-portrait-outline"
            label="Contact number"
            value={user.contactNumber ?? "Not added"}
            muted={!hasContact}
            trailing={
              user.contactVerified ? (
                <StatusPill label="Verified" tone="success" icon="checkmark-circle" />
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.contactButton,
                    pressed && styles.contactButtonPressed,
                  ]}
                  onPress={() => setContactSheetVisible(true)}
                  hitSlop={spacing.sm}
                  accessibilityRole="button"
                  accessibilityLabel={
                    hasContact ? "Verify contact number" : "Add contact number"
                  }
                >
                  <Ionicons
                    name={hasContact ? "shield-checkmark-outline" : "add"}
                    size={14}
                    color={colors.background}
                  />
                  <Text style={styles.contactButtonText}>
                    {hasContact ? "Verify" : "Add"}
                  </Text>
                </Pressable>
              )
            }
          />
        </View>

        {/* Navigation Links */}
        <View style={[styles.card, styles.listCard]}>
          <LinkRow
            icon="settings-outline"
            tone="primary"
            title="Settings & Preferences"
            subtitle="Push notifications & help FAQs"
            onPress={() => router.push("/settings")}
          />
          <View style={styles.linkDivider} />
          <LinkRow
            icon="gift-outline"
            tone="accent"
            title="Redemptions & Vouchers"
            subtitle="View claimed rewards & active QR passes"
            onPress={() => router.push("/rewards")}
          />
          <View style={styles.linkDivider} />
          <LinkRow
            icon="document-text-outline"
            tone="primary"
            title="Stamp requests"
            subtitle="Physical passport stamps sent for review"
            onPress={() => router.push("/stamp-requests")}
          />
          <View style={styles.linkDivider} />
          <LinkRow
            icon="shield-checkmark-outline"
            tone="primary"
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

      {/* Add / Verify Contact Number Sheet (refetch is handled by React Query) */}
      <AddContactSheet
        visible={contactSheetVisible}
        onDismiss={() => setContactSheetVisible(false)}
        onSuccess={() => {}}
      />

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

type IconName = keyof typeof Ionicons.glyphMap;

function DetailRow({
  icon,
  label,
  value,
  muted,
  trailing,
}: {
  icon: IconName;
  label: string;
  value: string;
  muted?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text
          style={[styles.detailValue, muted && styles.detailValueMuted]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {value}
        </Text>
      </View>
      {trailing}
    </View>
  );
}

function LinkRow({
  icon,
  tone,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  tone: "primary" | "accent";
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const isAccent = tone === "accent";
  return (
    <Pressable
      style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View
        style={[
          styles.iconChip,
          isAccent ? styles.iconChipAccent : styles.iconChipPrimary,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isAccent ? colors.accent : colors.primary}
        />
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
        <View style={[styles.skeleton, { height: 180, borderRadius: radii.card }]} />
        <View style={styles.statsGrid}>
          <View style={[styles.skeleton, styles.skeletonStat]} />
          <View style={[styles.skeleton, styles.skeletonStat]} />
        </View>
        <View style={[styles.skeleton, { height: 64, borderRadius: radii.card }]} />
        <View style={[styles.skeleton, { height: 140, borderRadius: radii.card }]} />
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

  // Shared card
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardPressed: {
    backgroundColor: colors.surface,
  },
  listCard: {
    padding: 0,
    overflow: "hidden",
  },
  sectionTitle: {
    ...typography.labelMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
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
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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

  // Status pill
  // Account details
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
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
  detailValueMuted: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    color: colors.textSecondary,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.accent,
    borderRadius: radii.button,
  },
  contactButtonPressed: {
    opacity: 0.85,
  },
  contactButtonText: {
    ...typography.labelMedium,
    fontFamily: "Inter_600SemiBold",
    color: colors.background,
  },

  // Navigation links
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  linkRowPressed: {
    backgroundColor: colors.surface,
  },
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
  linkDivider: {
    height: 1,
    backgroundColor: colors.border,
    // Align with the text column: row padding + icon chip + gap
    marginLeft: spacing.base + ICON_CHIP_SIZE + spacing.md,
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
