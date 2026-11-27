import { StampReveal } from '@/components/passport/StampReveal';
import { ClaimConfirmModal } from '@/components/rewards/ClaimConfirmModal';
import { ClaimCodeView } from '@/components/rewards/ClaimCodeView';
import { RewardPhoto } from '@/components/rewards/RewardPhoto';
import { RewardRequirements } from '@/components/rewards/RewardRequirements';
import { Button } from '@/components/ui/Button';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StateView } from '@/components/ui/StateView';
import type {
  ActiveClaim,
  Category,
  ClaimDenial,
  GenerateClaimResult,
  RewardEligibility,
} from '@/data/types';
import { useActiveClaim } from '@/hooks/useActiveClaim';
import { useClaimDenial } from '@/hooks/useClaimDenial';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGenerateClaimCode } from '@/hooks/useGenerateClaimCode';
import { useLivePass } from '@/hooks/useLivePass';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';
import { useRewardById } from '@/hooks/useRewardById';
import { useRewardEligibility } from '@/hooks/useRewardEligibility';
import { useSeenClaimDenial } from '@/hooks/useSeenClaimDenial';
import { CLAIM_CODE_EXPIRY_MINUTES, REDEMPTION_LOCATION } from '@/lib/constants';
import { hapticError } from '@/lib/haptics';
import { getFullName } from '@/lib/names';
import {
  describeDenial,
  describeRemaining,
  formatShortDate,
  getRewardStatus,
  showsClaimCode,
  type RewardStatus,
} from '@/lib/rewards';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Reward status plus the claim-code states */
type ScreenState = RewardStatus | 'code-active' | 'code-expired' | 'denied';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Why a code wasn't made: the server's reason, or no connection */
type ClaimFailure = Extract<GenerateClaimResult, { success: false }>['reason'] | 'network';

/**
 * The popup for each failure. For the server's reasons the screen also
 * refreshes behind it, so closing the popup shows where things stand.
 */
const CLAIM_FAILURES: Record<ClaimFailure, { icon: IconName; title: string; message: string }> = {
  soldOut: {
    icon: 'gift-outline',
    title: 'This reward just sold out',
    message: 'All claims were taken before your code was made. No points were used.',
  },
  alreadyClaimedThisPeriod: {
    icon: 'ribbon-outline',
    title: 'Already claimed',
    message: "You've already claimed a reward this promo period.",
  },
  notEnoughPoints: {
    icon: 'star-outline',
    title: 'Not enough points',
    message: "You don't have enough points for this reward yet.",
  },
  missingCategories: {
    icon: 'albums-outline',
    title: 'Stamps still missing',
    message: 'You need a stamp from each of the 4 categories to claim a reward.',
  },
  noActivePeriod: {
    icon: 'calendar-outline',
    title: 'Rewards are closed',
    message: "The promo period isn't running, so rewards can't be claimed right now.",
  },
  rewardNotFound: {
    icon: 'gift-outline',
    title: 'Reward unavailable',
    message: 'This reward is no longer offered.',
  },
  network: {
    icon: 'cloud-offline-outline',
    title: "Couldn't get your code",
    message: 'Check your connection and try again.',
  },
};

/**
 * Reward Detail Screen
 *
 * One layout for every state: hero photo, title and points, a status banner
 * that says exactly where the user stands, then details. Only the banner and
 * the pinned bottom action change between states:
 *
 * - locked:      "250 pts + Adventure stamp to go" → Find Adventure sites
 * - ready:        unlocked                         → Claim (with confirmation)
 * - code-active:  claim code ticket                → Done
 * - code-expired: expired ticket                   → Get a new code
 * - denied:       an admin didn't approve the code → Get a new code (if still ready)
 * - claimed:     claimed stamp (animated on claim) → Back to rewards
 * - period-used: another reward was claimed        → Back to rewards
 * - sold-out:    no claims left                   → Back to rewards
 *
 * Requirements: Viewing Reward Detail states
 */
export default function RewardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rewardId = Array.isArray(id) ? id[0] : id;
  const insets = useSafeAreaInsets();

  const rewardQuery = useRewardById(rewardId);
  const eligibilityQuery = useRewardEligibility(rewardId);
  const userQuery = useCurrentUser();
  const activeClaimQuery = useActiveClaim(rewardId);
  const denialQuery = useClaimDenial(rewardId);
  // The user's live code for any reward: a code for another reward gets
  // replaced if they claim this one (useLivePass drops it once expired)
  const { data: livePass } = useLivePass();
  const { data: promoPeriod } = usePromoPeriod();

  const reward = rewardQuery.data;
  const eligibility = eligibilityQuery.data;
  const user = userQuery.data;
  const activeClaim = activeClaimQuery.data ?? null;
  const denial = denialQuery.data ?? null;
  const { markSeen: markDenialSeen } = useSeenClaimDenial();
  // Once the denial shows here, the hub's notice for it can go
  const shownDenialId = !activeClaim && denial ? denial.claimId : null;
  useEffect(() => {
    if (shownDenialId) markDenialSeen(shownDenialId);
  }, [shownDenialId, markDenialSeen]);

  const generateClaimCode = useGenerateClaimCode();

  const [confirmVisible, setConfirmVisible] = useState(false);
  // Kept after the popup closes, so its text doesn't change while it fades out
  const [claimFailure, setClaimFailure] = useState<ClaimFailure>('network');
  const [failureVisible, setFailureVisible] = useState(false);
  // Whether a live code was shown on this visit: if the reward then turns
  // claimed, an admin just granted it, so the CLAIMED stamp animates in
  const [sawLivePass, setSawLivePass] = useState(false);

  // When the code lapses, switch to the expired view right away instead of
  // waiting for the next refetch, and keep showing it after the API drops
  // the expired claim.
  const [now, setNow] = useState(() => Date.now());
  const [expiredClaim, setExpiredClaim] = useState<ActiveClaim | null>(null);
  useEffect(() => {
    if (!activeClaim) return;
    const msLeft = activeClaim.expiresAt.getTime() - Date.now();
    const timer = setTimeout(() => {
      setNow(Date.now());
      setExpiredClaim(activeClaim);
    }, Math.max(0, msLeft) + 50);
    return () => clearTimeout(timer);
  }, [activeClaim]);

  const periodEnd = promoPeriod ? formatShortDate(promoPeriod.endDate) : undefined;

  const isLoading =
    rewardQuery.isLoading ||
    eligibilityQuery.isLoading ||
    userQuery.isLoading ||
    activeClaimQuery.isLoading ||
    denialQuery.isLoading;

  const shell = (children: React.ReactNode) => (
    <ScreenContainer
      showHeader
      headerTitle="Reward Details"
      onBackPress={() => router.back()}
      contentContainerStyle={styles.shellContent}
      testID="reward-detail-screen"
    >
      <StatusBar style="dark" />
      {children}
    </ScreenContainer>
  );

  if (rewardQuery.error) {
    return shell(
      <StateView
        variant="error"
        title="Unable to load this reward"
        message={rewardQuery.error.message}
        actionLabel="Try again"
        onAction={() => rewardQuery.refetch()}
        style={styles.state}
      />,
    );
  }

  if (isLoading) {
    return shell(<StateView variant="loading" style={styles.state} />);
  }

  if (!reward) {
    return shell(
      <StateView
        variant="empty"
        icon="gift-outline"
        title="Reward not found"
        message="It may have been removed from this promo period."
        actionLabel="Back to rewards"
        onAction={() => router.back()}
        style={styles.state}
      />,
    );
  }

  // ---- State ---------------------------------------------------------------

  const status = getRewardStatus(reward, eligibility, user);
  let state: ScreenState = status;
  if (showsClaimCode(status)) {
    if (activeClaim && activeClaim.expiresAt.getTime() > now) {
      state = 'code-active';
    } else if (activeClaim ?? expiredClaim) {
      state = 'code-expired';
    } else if (denial) {
      state = 'denied';
    }
  }
  const shownClaim = activeClaim ?? expiredClaim;
  const isPass = (state === 'code-active' || state === 'code-expired') && shownClaim;

  // Adjusting state during render (guarded) avoids an extra effect pass
  if (state === 'code-active' && !sawLivePass) {
    setSawLivePass(true);
  }
  const justClaimed = sawLivePass && state === 'claimed';

  // ---- Actions -------------------------------------------------------------

  const showClaimFailure = (failure: ClaimFailure) => {
    setConfirmVisible(false);
    setClaimFailure(failure);
    setFailureVisible(true);
    hapticError();
  };

  const generateCode = async () => {
    try {
      const result = await generateClaimCode.mutateAsync(rewardId);
      if (!result.success) {
        showClaimFailure(result.reason);
        return;
      }
      setConfirmVisible(false);
      setExpiredClaim(null);
    } catch {
      showClaimFailure('network');
    }
  };

  const findSites = (category?: Category) => {
    router.dismissTo({
      pathname: '/explore',
      params: category ? { category } : {},
    });
  };

  const firstMissing = eligibility?.missingCategories[0];
  const findSitesButton = (
    <Button
      title={firstMissing ? `Find ${firstMissing} sites` : 'Explore sites to earn points'}
      onPress={() => findSites(firstMissing)}
      variant="primary"
      fullWidth
      icon={<Ionicons name="compass" size={18} color={colors.background} />}
      testID="find-sites-button"
    />
  );
  const newCodeButton = (
    <Button
      title="Get a new code"
      onPress={generateCode}
      variant="accent"
      fullWidth
      loading={generateClaimCode.isPending}
      icon={<Ionicons name="refresh" size={18} color={colors.background} />}
      testID="new-code-button"
    />
  );
  let cta: React.ReactNode;
  switch (state) {
    case 'locked':
      cta = findSitesButton;
      break;
    case 'ready':
      cta = (
        <Button
          title="Claim this reward"
          onPress={() => setConfirmVisible(true)}
          variant="accent"
          fullWidth
          icon={<Ionicons name="gift" size={18} color={colors.background} />}
          testID="claim-button"
        />
      );
      break;
    case 'code-active':
      cta = (
        <Button
          title="Done"
          onPress={() => router.back()}
          variant="primary"
          fullWidth
          icon={<Ionicons name="checkmark" size={18} color={colors.background} />}
          testID="done-button"
        />
      );
      break;
    case 'code-expired':
      cta = newCodeButton;
      break;
    case 'denied':
      // A denial ends only that code; the server checks the rules again
      cta = status === 'ready' ? newCodeButton : findSitesButton;
      break;
    default:
      cta = (
        <Button
          title="Back to rewards"
          onPress={() => router.back()}
          variant="outline"
          fullWidth
          testID="back-to-rewards-button"
        />
      );
  }

  // ---- Render --------------------------------------------------------------

  return shell(
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID={`reward-detail-${state}`}
      >
        {isPass ? (
          <View style={styles.passIntro}>
            <Text style={styles.passHeading} accessibilityRole="header">
              {state === 'code-active' ? 'Your claim code' : 'This code has expired'}
            </Text>
            <Text style={styles.passSubheading}>
              {state === 'code-active'
                ? 'Read it out at the tourism desk, and keep this screen open until they approve it.'
                : `Codes last ${CLAIM_CODE_EXPIRY_MINUTES} minutes for security. Get a new one at the desk.`}
            </Text>
            <ClaimCodeView
              key={shownClaim.claimId}
              activeClaim={shownClaim}
              reward={reward}
              holderName={user ? getFullName(user) : ''}
              passportId={user?.passportId ?? ''}
              isExpired={state === 'code-expired'}
              testID="claim-code-view"
            />
          </View>
        ) : (
          <>
            {/* Hero */}
            <View style={styles.hero}>
              <RewardPhoto reward={reward} iconSize={64} style={styles.heroImage} />
              {reward.limited &&
                (reward.remainingClaims ?? 0) > 0 &&
                state !== 'sold-out' && (
                  <View style={styles.limitedPill}>
                    <Ionicons name="flame" size={12} color={colors.accent} />
                    <Text style={styles.limitedPillText}>
                      Only {reward.remainingClaims} left
                    </Text>
                  </View>
                )}
            </View>

            {/* Title */}
            <View style={styles.titleBlock}>
              <Text style={styles.title} testID="reward-title">
                {reward.title}
              </Text>
              <View style={styles.pointsPill}>
                <Ionicons name="star" size={14} color={colors.accent} />
                <Text style={styles.pointsPillText}>
                  {reward.pointsCost.toLocaleString('en-US')} pts
                </Text>
              </View>
            </View>

            <StatusBanner
              state={state}
              eligibility={eligibility}
              periodEnd={periodEnd}
              justClaimed={justClaimed}
              denial={denial}
            />

            <Text style={styles.description} testID="reward-description">
              {reward.description}
            </Text>

            {/* Where to redeem */}
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={18} color={colors.primary} />
              </View>
              <View style={styles.locationText}>
                <Text style={styles.locationLabel}>Redeem at</Text>
                <Text style={styles.locationValue}>{REDEMPTION_LOCATION}</Text>
              </View>
            </View>

            {(state === 'locked' || state === 'ready' || state === 'denied') && eligibility && (
              <>
                <Text style={styles.sectionTitle} accessibilityRole="header">
                  Requirements
                </Text>
                <RewardRequirements
                  eligibility={eligibility}
                  pointsCost={reward.pointsCost}
                  onCategoryPress={state === 'locked' ? findSites : undefined}
                  testID="reward-requirements"
                />

                <Text style={styles.sectionTitle} accessibilityRole="header">
                  How to claim
                </Text>
                <HowToClaim requirementsMet={status === 'ready'} />
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Pinned action */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.md }]}>
        {cta}
      </View>

      <ClaimConfirmModal
        visible={confirmVisible}
        reward={reward}
        periodEnd={periodEnd}
        replacesPassFor={
          livePass && livePass.rewardId !== rewardId ? livePass.rewardTitle : undefined
        }
        loading={generateClaimCode.isPending}
        onConfirm={generateCode}
        onCancel={() => setConfirmVisible(false)}
      />

      <FeedbackModal
        visible={failureVisible}
        onDone={() => setFailureVisible(false)}
        tone="error"
        {...CLAIM_FAILURES[claimFailure]}
        buttonTitle="OK"
        testID="claim-failed"
      />
    </>,
  );
}

// ---- Status banner ----------------------------------------------------------

interface StatusBannerProps {
  state: ScreenState;
  eligibility?: RewardEligibility;
  periodEnd?: string;
  justClaimed: boolean;
  /** Why the latest code was denied (state 'denied') */
  denial: ClaimDenial | null;
}

function StatusBanner({ state, eligibility, periodEnd, justClaimed, denial }: StatusBannerProps) {
  const reopen = periodEnd ? `New rewards open after ${periodEnd}.` : 'New rewards open next promo period.';

  if (state === 'claimed') {
    return (
      <View style={[styles.banner, { backgroundColor: colors.primaryTint }]}>
        <StampReveal
          highlight={
            justClaimed ? { stampId: 'claimed', celebrate: true, key: 'claimed' } : undefined
          }
        >
          <View style={styles.claimedStamp}>
            <Ionicons name="ribbon" size={18} color={colors.primary} />
            <Text style={styles.claimedStampText}>CLAIMED</Text>
          </View>
        </StampReveal>
        <View style={styles.bannerText}>
          <Text style={[styles.bannerTitle, { color: colors.primary }]}>
            You claimed this reward
          </Text>
          <Text style={styles.bannerBody}>Enjoy your souvenir! {reopen}</Text>
        </View>
      </View>
    );
  }

  let icon: IconName;
  let tint: string;
  let fg: string;
  let title: string;
  let body: string;

  switch (state) {
    case 'ready':
      icon = 'checkmark-circle';
      tint = colors.successLight;
      fg = colors.successDark;
      title = "You've unlocked this reward";
      body = 'Claiming it uses your one reward for this promo period.';
      break;
    case 'period-used':
      icon = 'time-outline';
      tint = colors.surface;
      fg = colors.text;
      title = "You've already claimed a reward this period";
      body = reopen;
      break;
    case 'sold-out':
      icon = 'close-circle';
      tint = colors.errorTint;
      fg = colors.error;
      title = 'Sold out';
      body = 'All claims for this reward have been taken.';
      break;
    case 'denied':
      icon = 'alert-circle';
      tint = colors.errorTint;
      fg = colors.error;
      title = "Your claim wasn't approved";
      body = describeDenial(denial?.reason ?? '');
      break;
    default:
      icon = 'lock-closed';
      tint = colors.accentTint;
      fg = colors.accent;
      title = (eligibility && describeRemaining(eligibility)) ?? 'Not unlocked yet';
      body = 'Visit more sites around Cavite to unlock this reward.';
  }

  return (
    <View
      style={[styles.banner, { backgroundColor: tint }]}
      accessible
      accessibilityLabel={`${title}. ${body}`}
      testID="reward-status-banner"
    >
      <Ionicons name={icon} size={24} color={fg} />
      <View style={styles.bannerText}>
        <Text style={[styles.bannerTitle, { color: fg }]}>{title}</Text>
        <Text style={styles.bannerBody}>{body}</Text>
      </View>
    </View>
  );
}

// ---- How to claim -------------------------------------------------------------

function HowToClaim({ requirementsMet }: { requirementsMet: boolean }) {
  const steps = [
    {
      title: 'Meet the requirements',
      body: 'Collect all 4 category stamps and enough points.',
      done: requirementsMet,
    },
    {
      title: 'Get your claim code at the desk',
      body: `It stays valid for ${CLAIM_CODE_EXPIRY_MINUTES} minutes.`,
      done: false,
    },
    {
      title: 'Tell the code to the staff',
      body: 'Points are deducted only when they approve it.',
      done: false,
    },
  ];

  return (
    <View style={styles.steps}>
      {steps.map((step, index) => (
        <View key={step.title} style={styles.step}>
          <View style={[styles.stepBadge, step.done && styles.stepBadgeDone]}>
            {step.done ? (
              <Ionicons name="checkmark" size={14} color={colors.background} />
            ) : (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.stepText}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepBody}>{step.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  state: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.base,
  },

  // Hero + title
  hero: {
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  limitedPill: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.background,
  },
  limitedPillText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  titleBlock: {
    gap: spacing.sm,
  },
  title: {
    ...typography.headlineLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
  pointsPillText: {
    ...typography.labelLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.background,
  },

  // Status banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radii.card,
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
  },
  bannerBody: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 18,
  },
  claimedStamp: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 2.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    transform: [{ rotate: '-8deg' }],
  },
  claimedStampText: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    letterSpacing: 1.5,
  },

  // Details
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  locationValue: {
    ...typography.labelLarge,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: -spacing.xs,
  },

  // How to claim
  steps: {
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radii.card,
    backgroundColor: colors.background,
    ...shadows.card,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  stepBadgeDone: {
    backgroundColor: colors.success,
  },
  stepNumber: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  stepBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Claim code
  passIntro: {
    gap: spacing.xs,
  },
  passHeading: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    textAlign: 'center',
  },
  passSubheading: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  // Pinned action bar
  actionBar: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
