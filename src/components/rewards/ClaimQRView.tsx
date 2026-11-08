import { Button } from '@/components/ui/Button';
import { ActiveClaim } from '@/data/types';
import { REDEMPTION_LOCATION } from '@/lib/constants';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

/**
 * ClaimQRView Component
 * 
 * Displays a single-use claim QR code with countdown timer for reward redemption.
 * The QR code expires after a set time (CLAIM_QR_EXPIRY_MINUTES), and the timer
 * stays accurate even after app backgrounding by computing from Date.now() on each tick.
 * 
 * Supports two display modes:
 * 1. QR Generated state (default): Shows active QR with countdown and "Done" button
 * 2. Expired state: Shows "Expired" text, grayed-out QR, and "Generate New QR" button
 * 
 * Props:
 * - activeClaim: Active claim object with QR payload and expiration time
 * - rewardTitle: Title of the reward being claimed
 * - rewardPoints: Points cost of the reward
 * - onDone: Callback when user dismisses the QR view (QR Generated state)
 * - isExpired: Whether the claim is expired (switches to Expired state)
 * - onGenerateNewQR: Callback for generating new QR (Expired state only)
 * - isGeneratingNewQR: Loading state for Generate New QR mutation (Expired state only)
 * - testID: Optional test identifier
 * 
 * Layout:
 * - Summary card with reward icon, title, points, and location
 * - QR card with countdown timer, QR code, ticket reference ID, and instructions
 * - Action button at bottom (Done or Generate New QR depending on state)
 * 
 * Timer Logic:
 * - Computed from activeClaim.expiresAt using Date.now() on each tick
 * - Updates every second
 * - Stays correct after app backgrounding
 * - Shows "Expired" when isExpired prop is true
 * 
 * Validates: Requirements 6.5 (QR Generated State), 6.6 (Expired State), Timer Logic, QR Code Generation
 */

export interface ClaimQRViewProps {
  /** Active claim with QR payload and expiration */
  activeClaim: ActiveClaim;
  /** Title of the reward */
  rewardTitle: string;
  /** Points cost of the reward */
  rewardPoints: number;
  /** Callback when Done button is pressed */
  onDone: () => void;
  /** Whether the claim is expired (for Expired state rendering) */
  isExpired?: boolean;
  /** Callback when Generate New QR button is pressed (Expired state only) */
  onGenerateNewQR?: () => void;
  /** Whether Generate New QR mutation is loading (Expired state only) */
  isGeneratingNewQR?: boolean;
  /** Optional test identifier */
  testID?: string;
}

export function ClaimQRView({
  activeClaim,
  rewardTitle,
  rewardPoints,
  onDone,
  isExpired = false,
  onGenerateNewQR,
  isGeneratingNewQR = false,
  testID,
}: ClaimQRViewProps) {
  // Calculate remaining time in milliseconds
  const calculateRemainingTime = React.useCallback(() => {
    return Math.max(0, activeClaim.expiresAt.getTime() - Date.now());
  }, [activeClaim.expiresAt]);

  const [remainingMs, setRemainingMs] = useState(() => calculateRemainingTime());

  // Format milliseconds to MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(calculateRemainingTime());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [calculateRemainingTime]);

  // Extract claim ID from payload (format: cvt:claim:<claimId>:<token>)
  const extractClaimId = (payload: string): string => {
    const match = payload.match(/^cvt:claim:([^:]+):/);
    return match?.[1] || activeClaim.claimId;
  };

  const claimId = extractClaimId(activeClaim.qrPayload);
  const timeDisplay = isExpired ? 'Expired' : formatTime(remainingMs);

  return (
    <View style={styles.container} testID={testID}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        {/* Reward Icon Circle */}
        <View style={styles.rewardIconCircle}>
          <Ionicons name="gift" size={32} color={colors.primary} />
        </View>

        {/* Reward Info */}
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle} numberOfLines={2}>
            {rewardTitle}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={14}
              color={colors.textSecondary}
              style={styles.locationIcon}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {REDEMPTION_LOCATION}
            </Text>
          </View>
        </View>

        {/* Points Badge */}
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>{rewardPoints} pts</Text>
        </View>
      </View>

      {/* QR Card */}
      <View style={styles.qrCard}>
        {/* Timer Header */}
        <View style={styles.qrHeader}>
          <Text style={styles.qrHeaderText}>
            Single-Use Pass • Valid for{' '}
            <Text style={styles.timerText}>{timeDisplay}</Text>
          </Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrCodeContainer}>
          {isExpired ? (
            /* Expired: Gray out QR code */
            <View style={{ opacity: 0.3 }}>
              <QRCode
                value={activeClaim.qrPayload}
                size={200}
                color={colors.textSecondary}
                backgroundColor={colors.background}
              />
            </View>
          ) : (
            <QRCode
              value={activeClaim.qrPayload}
              size={200}
              color={colors.primary}
              backgroundColor={colors.background}
            />
          )}
        </View>

        {/* Ticket Reference ID */}
        <View style={styles.ticketSection}>
          <Text style={styles.ticketLabel}>TICKET REFERENCE ID</Text>
          <Text style={styles.ticketId}>{claimId}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsRow}>
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.textSecondary}
            style={styles.instructionsIcon}
          />
          <Text style={styles.instructionsText}>
            Show this code to a tourism office officer. Points are deducted when
            the reward is claimed.
          </Text>
        </View>
      </View>

      {/* Action Button */}
      {isExpired ? (
        <Button
          title="Generate New QR"
          onPress={onGenerateNewQR || (() => {})}
          variant="accent"
          fullWidth
          loading={isGeneratingNewQR}
          testID={testID ? `${testID}-generate-new-qr-button` : undefined}
        />
      ) : (
        <Button
          title="Done ✓"
          onPress={onDone}
          variant="primary"
          fullWidth
          testID={testID ? `${testID}-done-button` : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rewardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  rewardTitle: {
    ...typography.titleMedium,
    color: colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationIcon: {
    marginTop: 1, // Optical alignment
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  pointsBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  pointsBadgeText: {
    ...typography.labelMedium,
    color: colors.background,
  },
  qrCard: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.base,
    alignItems: 'center',
    ...shadows.card,
    gap: spacing.base,
  },
  qrHeader: {
    alignItems: 'center',
  },
  qrHeaderText: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
  timerText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.accent,
  },
  qrCodeContainer: {
    padding: spacing.base,
    backgroundColor: colors.background,
    borderRadius: radii.md,
  },
  qrPlaceholder: {
    // Container for grayed-out QR code in expired state
  },
  ticketSection: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  ticketLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  ticketId: {
    ...typography.titleMedium,
    color: colors.text,
    textAlign: 'center',
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  instructionsIcon: {
    marginTop: 2, // Optical alignment with first line of text
  },
  instructionsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
});
