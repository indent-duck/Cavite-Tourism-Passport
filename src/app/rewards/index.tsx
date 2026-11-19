import { PointsSummaryCard, type PointsSummaryCardProps } from '@/components/rewards/PointsSummaryCard';
import { RewardCard } from '@/components/rewards/RewardCard';
import { StateView } from '@/components/ui/StateView';
import type { Category, User } from '@/data/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';
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
  type RewardStatus,
} from '@/lib/rewards';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RewardRow = RewardWithEligibility & { status: RewardStatus };

const ItemSeparator = () => <View style={styles.separator} />;

/**
 * Rewards List Screen (Rewards Hub)
 *
 * Layout:
 * - Blue header matching the tab screens' Header (entry is the points pill)
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
  const { data: promoPeriod } = usePromoPeriod();

  const user = userQuery.data;
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
            onPress={() => router.push(`/rewards/${item.reward.id}`)}
            testID={`reward-card-${item.reward.id}`}
          />
        )}
        ItemSeparatorComponent={ItemSeparator}
        ListHeaderComponent={
          <View style={styles.listHeader}>
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
