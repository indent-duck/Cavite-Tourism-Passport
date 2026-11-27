import { ClaimDeniedBanner } from '@/components/rewards/ClaimDeniedBanner';
import { LivePassBanner } from '@/components/rewards/LivePassBanner';
import { PointsSummaryCard, type PointsSummaryCardProps } from '@/components/rewards/PointsSummaryCard';
import { RewardCard } from '@/components/rewards/RewardCard';
import { StateView } from '@/components/ui/StateView';
import type { Category, User } from '@/data/types';
import { useClaimDenial } from '@/hooks/useClaimDenial';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLivePass } from '@/hooks/useLivePass';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';
import { useSeenClaimDenial } from '@/hooks/useSeenClaimDenial';
import {
  useRewardsWithEligibility,
  type RewardWithEligibility,
} from '@/hooks/useRewardsWithEligibility';
import { useStamps } from '@/hooks/useStamps';
import { REDEMPTION_LOCATION } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import {
  compareRewards,
  describeRemaining,
  formatShortDate,
  getRewardStatus,
  showsClaimCode,
  type RewardStatus,
} from '@/lib/rewards';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RewardRow = RewardWithEligibility & { status: RewardStatus };

const ItemSeparator = () => <View style={styles.separator} />;

/**
 * Rewards List Screen (Rewards Hub)
 *
 * Layout:
 * - Blue header matching the tab screens' Header (entry is the points pill)
 * - While a claim code is live: the code, which reward it's for, time
 *   left, and a tap to open it (that reward's card also says "Code ready").
 *   Checked every 5 seconds while the hub is on screen, so a grant or denial
 *   at the desk shows here too
 * - After a denial: which reward, the admin's reason, a tap to open it, and
 *   × to dismiss it (shown until seen or until the user gets a new code)
 * - Points summary: balance, next goal, required stamp slots
 * - "One reward per period" rule, shown before the user picks anything
 * - Rewards sorted by what's actionable: claimed, ready, closest locked,
 *   then rewards that can't be claimed
 *
 * Entry points:
 * - Header points tap
 * - Passport "View Rewards" button
 * - Account "Redemptions & Vouchers" row
 *
 * Validates: Requirements 5.1 (Rewards List Screen)
 */
export default function RewardsScreen() {
  const userQuery = useCurrentUser();
  const stampsQuery = useStamps();
  const rewardsQuery = useRewardsWithEligibility();
  // Poll the live code only while the hub is the screen in front
  const isFocused = useIsFocused();
  const livePassQuery = useLivePass({ poll: isFocused });
  const denialQuery = useClaimDenial();
  const { seenClaimId, markSeen } = useSeenClaimDenial();
  const { data: promoPeriod } = usePromoPeriod();

  const user = userQuery.data;
  const livePass = livePassQuery.data ?? null;
  const denial = denialQuery.data ?? null;
  // undefined while the seen ID is still being read: wait, so a seen
  // denial doesn't flash
  const showDenial =
    !livePass && denial !== null && seenClaimId !== undefined && seenClaimId !== denial.claimId;
  const stamps = stampsQuery.data;
  const rewards = rewardsQuery.data;

  const collectedCategories = React.useMemo(() => {
    const unique = new Set<Category>();
    stamps?.forEach((stamp) => unique.add(stamp.siteCategory));
    return Array.from(unique);
  }, [stamps]);

  const rows = React.useMemo<RewardRow[]>(() => {
    if (!rewards) return [];
    return rewards
      .map((item) => ({
        ...item,
        status: getRewardStatus(item.reward, item.eligibility, user),
      }))
      .sort(compareRewards);
  }, [rewards, user]);

  // The banner follows the same rule as the reward's card and screen: a
  // code for a reward that sold out (or was hidden) can't be granted, so it
  // isn't shown, and the banner can't open a reward the list won't open
  const passRow = livePass ? rows.find((row) => row.reward.id === livePass.rewardId) : undefined;
  const bannerPass = passRow && showsClaimCode(passRow.status) ? livePass : null;

  const periodEnd = promoPeriod ? formatShortDate(promoPeriod.endDate) : undefined;
  const goal = React.useMemo(
    () => pickGoal(rows, user, periodEnd),
    [rows, user, periodEnd],
  );

  const isLoading = userQuery.isLoading || stampsQuery.isLoading || rewardsQuery.isLoading;
  const error = userQuery.error || stampsQuery.error || rewardsQuery.error;

  const retry = () => {
    userQuery.refetch();
    stampsQuery.refetch();
    rewardsQuery.refetch();
  };

  // Pull to refresh: points, claims and stock change on the server (an
  // admin granting a claim, a stamp request approved). The rewards fetch also
  // updates each reward screen's cache (see useRewardsWithEligibility).
  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        userQuery.refetch(),
        stampsQuery.refetch(),
        rewardsQuery.refetch(),
        livePassQuery.refetch(),
        denialQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  let body: React.ReactNode;
  if (isLoading) {
    body = <StateView variant="loading" title="Loading rewards…" style={styles.state} />;
  } else if (error) {
    body = (
      <StateView
        variant="error"
        title="Unable to load rewards"
        message={getErrorMessage(error)}
        actionLabel="Try again"
        onAction={retry}
        style={styles.state}
      />
    );
  } else if (rows.length === 0) {
    body = (
      <StateView
        variant="empty"
        icon="gift-outline"
        title="No rewards yet"
        message="Check back later for new souvenirs and perks."
        style={styles.state}
      />
    );
  } else {
    body = (
      <FlatList
        data={rows}
        keyExtractor={(item) => item.reward.id}
        renderItem={({ item }) => (
          <RewardCard
            reward={item.reward}
            status={item.status}
            eligibility={item.eligibility}
            hasLivePass={livePass?.rewardId === item.reward.id}
            onPress={() => router.push(`/rewards/${item.reward.id}`)}
            testID={`reward-card-${item.reward.id}`}
          />
        )}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {bannerPass && (
              <LivePassBanner
                key={bannerPass.claimId}
                pass={bannerPass}
                onShowPass={() => router.push(`/rewards/${bannerPass.rewardId}`)}
                testID="live-pass-banner"
              />
            )}
            {showDenial && denial && (
              <ClaimDeniedBanner
                key={denial.claimId}
                denial={denial}
                onOpen={() => {
                  markSeen(denial.claimId);
                  router.push(`/rewards/${denial.rewardId}`);
                }}
                onDismiss={() => markSeen(denial.claimId)}
                testID="claim-denied-banner"
              />
            )}

            <PointsSummaryCard
              points={user?.points ?? 0}
              stampCategories={collectedCategories}
              goal={goal}
              testID="rewards-points-summary"
            />

            {!user?.hasClaimedThisPeriod && <OneRewardBanner periodEnd={periodEnd} />}

            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle} accessibilityRole="header">
                  Souvenirs & Perks
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Redeem in person at the {REDEMPTION_LOCATION}
                </Text>
              </View>
              <Text style={styles.countBadge}>
                {rows.length} {rows.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <RewardsHeader />
      {body}
    </View>
  );
}

/** Same look as the tab screens' blue Header, with a back button */
function RewardsHeader() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
        hitSlop={spacing.sm}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={colors.background} />
      </Pressable>
      <View style={styles.headerTitles}>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Rewards Hub
        </Text>
        <Text style={styles.headerSubtitle}>Cavite Tourism Passport</Text>
      </View>
    </View>
  );
}

/** The one-claim-per-period rule, stated before the user commits to anything */
function OneRewardBanner({ periodEnd }: { periodEnd?: string }) {
  return (
    <View style={styles.banner} accessible accessibilityRole="text">
      <View style={styles.bannerIcon}>
        <Ionicons name="information" size={16} color={colors.accent} />
      </View>
      <View style={styles.bannerText}>
        <Text style={styles.bannerTitle}>You can claim 1 reward per promo period</Text>
        <Text style={styles.bannerBody}>
          Claiming one locks the others until{' '}
          {periodEnd ?? 'the period ends'}. Pick the one you want most.
        </Text>
      </View>
    </View>
  );
}

/**
 * What the summary card should point the user at: the reward they claimed,
 * rewards ready to claim, or the locked reward closest to unlocking.
 */
function pickGoal(
  rows: RewardRow[],
  user: User | undefined,
  periodEnd: string | undefined,
): PointsSummaryCardProps['goal'] {
  if (rows.length === 0) return undefined;

  const claimed = rows.find((row) => row.status === 'claimed');
  if (claimed) {
    return {
      tone: 'claimed',
      text: `You claimed ${claimed.reward.title}.${periodEnd ? ` New rewards open after ${periodEnd}.` : ''}`,
    };
  }

  const readyCount = rows.filter((row) => row.status === 'ready').length;
  if (readyCount > 0) {
    return {
      tone: 'ready',
      text: `${readyCount} ${readyCount === 1 ? 'reward is' : 'rewards are'} ready to claim`,
    };
  }

  // Rows are sorted, so the first locked one is the closest to unlocking
  const next = rows.find((row) => row.status === 'locked');
  if (!next || !user) return undefined;
  const remaining = describeRemaining(next.eligibility);
  if (!remaining) return undefined;
  return { tone: 'next', text: `${remaining} for ${next.reward.title}` };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.base,
    backgroundColor: colors.secondary,
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.card,
    ...shadows.header,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.onPrimaryOverlay,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.background,
  },
  headerSubtitle: {
    ...typography.labelMedium,
    color: colors.background,
    opacity: 0.8,
  },
  state: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xxl,
  },
  listHeader: {
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  separator: {
    height: spacing.base,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.accentTint,
  },
  bannerIcon: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  bannerBody: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionHeaderText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  countBadge: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
});
