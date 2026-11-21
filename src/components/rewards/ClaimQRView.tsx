import { RewardPhoto } from '@/components/rewards/RewardPhoto';
import { ActiveClaim, Reward } from '@/data/types';
import { REDEMPTION_LOCATION } from '@/lib/constants';
import { formatCountdown } from '@/lib/rewards';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

/**
 * ClaimQRView Component
 *
 * The single-use claim pass shown to a tourism officer, styled as a
 * passport-paper ticket:
 * - Reward thumbnail, title and points
 * - Large countdown with a shrinking bar (orange under 3 min, red under 1 min)
 * - Black-on-white QR for reliable scanning; stamped "EXPIRED" once it lapses
 * - Reference ID in monospace so it can be read aloud
 *
 * While the pass is active the screen is kept awake so it doesn't dim at the
 * counter. The timer is computed from `expiresAt` on every tick, so it stays
 * correct after the app is backgrounded.
 *
 * Actions (Done / Generate new QR) live in the screen's bottom bar.
 *
 * Validates: Requirements 6.5 (QR Generated State), 6.6 (Expired State), Timer Logic, QR Code Generation
 */

export interface ClaimQRViewProps {
  /** Active claim with QR payload and expiration */
  activeClaim: ActiveClaim;
  /** The reward being claimed */
  reward: Reward;
  /** Whether the claim is expired */
  isExpired?: boolean;
  /** Optional test identifier */
  testID?: string;
}

const MONO_FONT = Platform.select({ ios: 'Menlo', default: 'monospace' });

/** Extract claim ID from payload (format: cvt:claim:<claimId>:<token>) */
function extractClaimId(claim: ActiveClaim): string {
  const match = claim.qrPayload.match(/^cvt:claim:([^:]+):/);
  return match?.[1] || claim.claimId;
}

/** Keeps the display on for as long as it's mounted */
function KeepScreenAwake() {
  useKeepAwake('claim-qr');
  return null;
}

export function ClaimQRView({
  activeClaim,
  reward,
  isExpired = false,
  testID,
}: ClaimQRViewProps) {
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

  return (
    <View style={styles.ticket} testID={testID}>
      {!isExpired && <KeepScreenAwake />}

      {/* Reward summary */}
      <View style={styles.summary}>
        <RewardPhoto reward={reward} iconSize={24} style={styles.thumb} />
        <View style={styles.summaryText}>
          <Text style={styles.passLabel}>Single-use claim pass</Text>
          <Text style={styles.rewardTitle} numberOfLines={2}>
            {reward.title}
          </Text>
          <Text style={styles.rewardPoints}>
            {reward.pointsCost.toLocaleString('en-US')} pts
          </Text>
        </View>
      </View>

      <Perforation />

      {/* Countdown */}
      <View
        style={styles.timerBlock}
        accessible
        accessibilityRole="timer"
        accessibilityLabel={
          isExpired ? 'Pass expired' : `Pass valid for ${formatCountdown(shownMs)}`
        }
      >
        <Text style={styles.timerLabel}>{isExpired ? 'Pass expired' : 'Valid for'}</Text>
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

      {/* QR */}
      <View style={styles.qrFrame}>
        <View style={isExpired && styles.qrExpired}>
          <QRCode
            value={activeClaim.qrPayload}
            size={208}
            color={colors.qrInk}
            backgroundColor={colors.background}
            quietZone={8}
          />
        </View>
        {isExpired && (
          <View style={styles.expiredStamp} pointerEvents="none">
            <Text style={styles.expiredStampText}>EXPIRED</Text>
          </View>
        )}
      </View>

      {/* Reference */}
      <View style={styles.reference}>
        <Text style={styles.referenceLabel}>Ticket reference</Text>
        <Text style={styles.referenceId} selectable>
          {extractClaimId(activeClaim)}
        </Text>
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
              ? 'Generate a new pass when you are at the desk.'
              : `Show this to a tourism officer. ${reward.pointsCost.toLocaleString('en-US')} pts are deducted only when they scan it.`}
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
  timerBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  timerLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  timer: {
    fontSize: 40,
    lineHeight: 48,
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
  qrFrame: {
    alignSelf: 'center',
    marginTop: spacing.base,
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrExpired: {
    opacity: 0.15,
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
  reference: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  referenceLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  referenceId: {
    fontFamily: MONO_FONT,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1,
    color: colors.text,
    textAlign: 'center',
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
