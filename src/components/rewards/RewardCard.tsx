import { RewardPhoto } from '@/components/rewards/RewardPhoto';
import { Card } from '@/components/ui/Card';
import { Reward, RewardEligibility } from '@/data/types';
import { describeRemaining, type RewardStatus } from '@/lib/rewards';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * RewardCard Component
 *
 * One reward in the Rewards Hub list. Uses the app's shared Card surface
 * (same press feedback as Explore's SiteCard).
 *
 * - Photo with points pill (top-left) and "N left" pill for limited rewards
 * - Title and two-line description
 * - Locked rewards: slim points bar + "250 pts + Adventure stamp to go"
 * - Footer: status chip and a chevron (the whole card is the tap target)
 * - Rewards that can't be claimed (sold out, period used) are dimmed
 *
 * Validates: Requirements 4.2 (RewardCard Component)
 */

export interface RewardCardProps {
  reward: Reward;
  status: RewardStatus;
  eligibility?: RewardEligibility;
  onPress: () => void;
  testID?: string;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const STATUS_CHIP: Record<
  RewardStatus,
  { label: string; icon: IconName; fg: string; bg: string }
> = {
  ready: {
    label: 'Ready to claim',
    icon: 'checkmark-circle',
    fg: colors.successDark,
    bg: colors.successLight,
  },
  locked: {
    label: 'Locked',
    icon: 'lock-closed',
    fg: colors.textSecondary,
    bg: colors.surface,
  },
  claimed: {
    label: 'Claimed by you',
    icon: 'ribbon',
    fg: colors.primary,
    bg: colors.primaryTint,
  },
  'period-used': {
    label: 'Unavailable this period',
    icon: 'time-outline',
    fg: colors.textSecondary,
    bg: colors.surface,
  },
  'sold-out': {
    label: 'Sold out',
    icon: 'close-circle',
    fg: colors.error,
    bg: colors.errorTint,
  },
};

export function RewardCard({
  reward,
  status,
  eligibility,
  onPress,
  testID,
}: RewardCardProps) {
  const chip = STATUS_CHIP[status];
  const isDimmed = status === 'sold-out' || status === 'period-used';
  const showProgress = status === 'locked' && eligibility;
  const remaining = eligibility ? describeRemaining(eligibility) : null;
  const progress = eligibility
    ? Math.min(eligibility.currentPoints / reward.pointsCost, 1)
    : 0;
  const showLimited =
    reward.limited && (reward.remainingClaims ?? 0) > 0 && !isDimmed;

  return (
    <Card
      onPress={onPress}
      testID={testID}
      accessibilityLabel={[
        reward.title,
        `${reward.pointsCost} points`,
        showLimited ? `${reward.remainingClaims} left` : null,
        chip.label,
        showProgress ? remaining : null,
      ]
        .filter(Boolean)
        .join(', ')}
    >
      <View style={isDimmed && styles.dimmed}>
        {/* Photo */}
        <View style={styles.imageContainer}>
          <RewardPhoto reward={reward} style={styles.image} />

          <View style={[styles.pill, styles.pointsPill]}>
            <Ionicons name="star" size={12} color={colors.accent} />
            <Text style={styles.pointsPillText}>
              {reward.pointsCost.toLocaleString('en-US')} pts
            </Text>
          </View>

          {showLimited && (
            <View style={[styles.pill, styles.limitedPill]}>
              <Ionicons name="flame" size={12} color={colors.accent} />
              <Text style={styles.limitedPillText}>
                {reward.remainingClaims} left
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {reward.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {reward.description}
          </Text>

          {showProgress && (
            <View style={styles.progress}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
              {remaining && <Text style={styles.remaining}>{remaining}</Text>}
            </View>
          )}

          <View style={styles.footer}>
            <View style={[styles.statusChip, { backgroundColor: chip.bg }]}>
              <Ionicons name={chip.icon} size={14} color={chip.fg} />
              <Text style={[styles.statusText, { color: chip.fg }]}>
                {chip.label}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  dimmed: {
    opacity: 0.55,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pill: {
    position: 'absolute',
    top: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  pointsPill: {
    left: spacing.sm,
    backgroundColor: colors.primary,
  },
  pointsPillText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.background,
  },
  limitedPill: {
    right: spacing.sm,
    backgroundColor: colors.background,
  },
  limitedPillText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  content: {
    padding: spacing.base,
    gap: spacing.xs,
  },
  title: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  progress: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: colors.accent,
  },
  remaining: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.accent,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  statusText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
  },
});
