import { StampReveal } from '@/components/passport/StampReveal';
import { ClaimConfirmModal } from '@/components/rewards/ClaimConfirmModal';
import { ClaimQRView } from '@/components/rewards/ClaimQRView';
import { RewardDevPanel } from '@/components/rewards/RewardDevPanel';
import { RewardPhoto } from '@/components/rewards/RewardPhoto';
import { RewardRequirements } from '@/components/rewards/RewardRequirements';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StateView } from '@/components/ui/StateView';
import type { ActiveClaim, Category, RewardEligibility } from '@/data/types';
import { useActiveClaim } from '@/hooks/useActiveClaim';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGenerateClaimQR } from '@/hooks/useGenerateClaimQR';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';
import { useRewardById } from '@/hooks/useRewardById';
import { useRewardEligibility } from '@/hooks/useRewardEligibility';
import { useSimulateClaim } from '@/hooks/useSimulateClaim';
import { CLAIM_QR_EXPIRY_MINUTES, REDEMPTION_LOCATION } from '@/lib/constants';
import {
  describeRemaining,
  formatShortDate,
  getRewardStatus,
  type RewardStatus,
} from '@/lib/rewards';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Reward status plus the two claim-pass states */
type ScreenState = RewardStatus | 'qr-active' | 'qr-expired';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * Reward Detail Screen
 *
 * One layout for every state: hero photo, title and points, a status banner
 * that says exactly where the user stands, then details. Only the banner and
 * the pinned bottom action change between states:
 *
 * - locked:      "250 pts + Adventure stamp to go" → Find Adventure sites
 * - ready:       unlocked                         → Claim (with confirmation)
 * - qr-active:   claim pass ticket                → Done
 * - qr-expired:  expired ticket                   → Generate new pass
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
  const { data: promoPeriod } = usePromoPeriod();

  const reward = rewardQuery.data;
  const eligibility = eligibilityQuery.data;
  const user = userQuery.data;
  const activeClaim = activeClaimQuery.data ?? null;

  const generateClaimQR = useGenerateClaimQR();
  const simulateClaim = useSimulateClaim(rewardId);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [justClaimed, setJustClaimed] = useState(false);

  // When the pass lapses, switch to the expired view right away instead of
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
    activeClaimQuery.isLoading;

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
  if (status === 'ready' || status === 'locked') {
    if (activeClaim && activeClaim.expiresAt.getTime() > now) {
      state = 'qr-active';
    } else if (activeClaim ?? expiredClaim) {
      state = 'qr-expired';
    }
  }
  const shownClaim = activeClaim ?? expiredClaim;
  const isPass = (state === 'qr-active' || state === 'qr-expired') && shownClaim;

  // ---- Actions -------------------------------------------------------------

  const generatePass = async () => {
    try {
      await generateClaimQR.mutateAsync(rewardId);
      setExpiredClaim(null);
      setConfirmVisible(false);
    } catch {
      Alert.alert('Could not create your pass', 'Check your connection and try again.');
    }
  };

  const findSites = (category?: Category) => {
    router.dismissTo({
      pathname: '/explore',
      params: category ? { category } : {},
    });
  };

  const simulateScan = async () => {
    if (!shownClaim) return;
    try {
      await simulateClaim.mutateAsync({ claimId: shownClaim.claimId, rewardId });
      setJustClaimed(true);
    } catch {
      Alert.alert('Simulation failed', 'Failed to simulate officer scan. Please try again.');
    }
  };

  const firstMissing = eligibility?.missingCategories[0];
  let cta: React.ReactNode;
  switch (state) {
    case 'locked':
      cta = (
        <Button
          title={firstMissing ? `Find ${firstMissing} sites` : 'Explore sites to earn points'}
          onPress={() => findSites(firstMissing)}
          variant="primary"
          fullWidth
          icon={<Ionicons name="compass" size={18} color={colors.background} />}
          testID="find-sites-button"
        />
      );
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
    case 'qr-active':
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
    case 'qr-expired':
      cta = (
        <Button
          title="Generate new pass"
          onPress={generatePass}
          variant="accent"
          fullWidth
          loading={generateClaimQR.isPending}
          icon={<Ionicons name="refresh" size={18} color={colors.background} />}
          testID="generate-new-qr-button"
        />
      );
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
              {state === 'qr-active' ? 'Your claim pass' : 'This pass has expired'}
            </Text>
            <Text style={styles.passSubheading}>
              {state === 'qr-active'
                ? 'Keep this screen open at the tourism desk.'
                : 'Passes last a few minutes for security. Make a new one at the desk.'}
            </Text>
            <ClaimQRView
              key={shownClaim.claimId}
              activeClaim={shownClaim}
              reward={reward}
              isExpired={state === 'qr-expired'}
              testID="claim-qr-view"
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

            {(state === 'locked' || state === 'ready') && eligibility && (
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
                <HowToClaim requirementsMet={state === 'ready'} />
              </>
            )}
          </>
        )}

        {__DEV__ && (
          <RewardDevPanel
            info={[
              ['State', state],
              ['Points', String(user?.points ?? 0)],
              ['Eligible', eligibility?.eligible ? 'yes' : 'no'],
              ['Claimed this period', user?.hasClaimedThisPeriod ? 'yes' : 'no'],
              ['Pass expires', shownClaim ? shownClaim.expiresAt.toLocaleTimeString() : '—'],
              ['Remaining claims', reward.limited ? String(reward.remainingClaims) : '∞'],
            ]}
            onSimulateScan={state === 'qr-active' ? simulateScan : undefined}
            simulating={simulateClaim.isPending}
          />
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
        loading={generateClaimQR.isPending}
        onConfirm={generatePass}
        onCancel={() => setConfirmVisible(false)}
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
}

function StatusBanner({ state, eligibility, periodEnd, justClaimed }: StatusBannerProps) {
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
      title: 'Generate your pass at the desk',
      body: `It stays valid for ${CLAIM_QR_EXPIRY_MINUTES} minutes.`,
      done: false,
    },
    {
      title: 'Show it to a tourism officer',
      body: 'Points are deducted only when they scan it.',
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

  // Claim pass
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
