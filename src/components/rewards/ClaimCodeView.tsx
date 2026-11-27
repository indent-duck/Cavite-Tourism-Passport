import { ClaimCodeDigits } from '@/components/rewards/ClaimCodeDigits';
import { RewardPhoto } from '@/components/rewards/RewardPhoto';
import { ActiveClaim, Reward } from '@/data/types';
import { REDEMPTION_LOCATION } from '@/lib/constants';
import { formatCountdown, spellClaimCode } from '@/lib/rewards';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

/**
 * ClaimCodeView Component
 *
 * The claim code the user reads out at the tourism desk, styled as a
 * passport-paper ticket:
 * - Reward thumbnail, title and points
 * - The 6-digit code in two groups of digit tiles ("042 917"); stamped
 *   "EXPIRED" once it lapses
 * - Countdown with a shrinking bar (orange under 3 min, red under 1 min)
 * - The holder's name and passport ID, which the admin compares with what
 *   the admin dashboard shows for the code
 *
 * While the code is live the screen is kept awake so it doesn't dim at the
 * counter. The timer is computed from `expiresAt` on every tick, so it stays
 * correct after the app is backgrounded.
 *
 * Actions (Done / Get a new code) live in the screen's bottom bar.
 */

export interface ClaimCodeViewProps {
  /** Live (or just expired) claim with its code and expiry */
  activeClaim: ActiveClaim;
  /** The reward being claimed */
  reward: Reward;
  /** The holder, e.g. "Juan Dela Cruz" */
  holderName: string;
  /** The holder's passport ID, e.g. "CVT-2026-000123" */
  passportId: string;
  /** Whether the code is expired */
  isExpired?: boolean;
  /** Optional test identifier */
  testID?: string;
}

const MONO_FONT = Platform.select({ ios: 'Menlo', default: 'monospace' });

/** Keeps the display on for as long as it's mounted */
function KeepScreenAwake() {
  useKeepAwake('claim-code');
  return null;
}

export function ClaimCodeView({
  activeClaim,
  reward,
  holderName,
  passportId,
  isExpired = false,
  testID,
}: ClaimCodeViewProps) {
  const expiresAt = activeClaim.expiresAt.getTime();
  const totalMs = Math.max(1, expiresAt - activeClaim.createdAt.getTime());

  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, expiresAt - Date.now()),
  );

  useEffect(() => {
    if (isExpired) return;
    // The parent keys this view by claim ID, so the initial state is fresh
    const interval = setInterval(
      () => setRemainingMs(Math.max(0, expiresAt - Date.now())),
      1000,
    );
    return () => clearInterval(interval);
  }, [expiresAt, isExpired]);

  const shownMs = isExpired ? 0 : remainingMs;
  const timerColor =
    isExpired || shownMs <= 60_000
      ? colors.error
      : shownMs <= 180_000
        ? colors.accent
        : colors.primary;
  const points = reward.pointsCost.toLocaleString('en-US');

  return (
    <View style={styles.ticket} testID={testID}>
      {!isExpired && <KeepScreenAwake />}

      {/* Reward summary */}
      <View style={styles.summary}>
        <RewardPhoto reward={reward} iconSize={24} style={styles.thumb} />
        <View style={styles.summaryText}>
          <Text style={styles.passLabel}>Reward claim code</Text>
          <Text style={styles.rewardTitle} numberOfLines={2}>
            {reward.title}
          </Text>
          <Text style={styles.rewardPoints}>{points} pts</Text>
        </View>
      </View>

      <Perforation />

      {/* Code */}
      <View
        style={styles.codeBlock}
        accessible
        accessibilityLabel={
          isExpired
            ? `Expired claim code ${spellClaimCode(activeClaim.code)}`
            : `Claim code ${spellClaimCode(activeClaim.code)}`
        }
        testID="claim-code"
      >
        <View style={styles.codeFrame}>
          <ClaimCodeDigits code={activeClaim.code} variant="ticket" dimmed={isExpired} />
          {isExpired && (
            <View style={styles.expiredStamp} pointerEvents="none">
              <Text style={styles.expiredStampText}>EXPIRED</Text>
            </View>
          )}
        </View>
      </View>

      {/* Countdown */}
      <View
        style={styles.timerBlock}
        accessible
        accessibilityRole="timer"
        accessibilityLabel={
          isExpired ? 'Code expired' : `Code valid for ${formatCountdown(shownMs)}`
        }
      >
        <Text style={styles.timerLabel}>{isExpired ? 'Code expired' : 'Valid for'}</Text>
        <Text style={[styles.timer, { color: timerColor }]}>{formatCountdown(shownMs)}</Text>
        <View style={styles.timerTrack}>
          <View
            style={[
              styles.timerFill,
              {
                width: `${(shownMs / totalMs) * 100}%`,
                backgroundColor: timerColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Holder, for the admin to compare */}
      <View style={styles.holder}>
        <View style={styles.holderField}>
          <Text style={styles.holderLabel}>Name</Text>
          <Text style={styles.holderValue} numberOfLines={2}>
            {holderName}
          </Text>
        </View>
        <View style={styles.holderField}>
          <Text style={styles.holderLabel}>Passport ID</Text>
          <Text style={[styles.holderValue, styles.passportId]}>
            {passportId}
          </Text>
        </View>
      </View>

      <Perforation />

      {/* Where and how */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.footerText}>{REDEMPTION_LOCATION}</Text>
        </View>
        <View style={styles.footerRow}>
          <Ionicons name="person" size={16} color={colors.primary} />
          <Text style={styles.footerText}>
            {isExpired
              ? 'Get a new code when you are at the desk.'
              : `Tell this code to the staff at the desk. ${points} pts are deducted only when they approve it.`}
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Dashed tear line with semicircle notches cut into both edges */
function Perforation() {
  return (
    <View style={styles.perforation}>
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={styles.perforationLine} />
      <View style={[styles.notch, styles.notchRight]} />
    </View>
  );
}

const NOTCH = 20;

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.passportPaper,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
    overflow: 'hidden',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
  },
  summaryText: {
    flex: 1,
  },
  passLabel: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  rewardTitle: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  rewardPoints: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.accent,
    marginTop: 2,
  },
  perforation: {
    height: NOTCH,
    flexDirection: 'row',
    alignItems: 'center',
  },
  perforationLine: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.passportPaperBorder,
  },
  notch: {
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
  },
  notchLeft: {
    marginLeft: -NOTCH / 2,
  },
  notchRight: {
    marginRight: -NOTCH / 2,
  },
  codeBlock: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
  },
  // Holds the tiles, and centers the EXPIRED stamp over them
  codeFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiredStamp: {
    position: 'absolute',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderWidth: 3,
    borderColor: colors.error,
    borderRadius: radii.sm,
    transform: [{ rotate: '-12deg' }],
  },
  expiredStampText: {
    ...typography.headlineMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.error,
    letterSpacing: 4,
  },
  timerBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },
  timerLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  timer: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  timerTrack: {
    alignSelf: 'stretch',
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.passportPaperBorder,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  holder: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  holderField: {
    flex: 1,
    gap: 2,
  },
  holderLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  holderValue: {
    ...typography.labelLarge,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  passportId: {
    fontFamily: MONO_FONT,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    gap: spacing.sm,
    padding: spacing.base,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
});
