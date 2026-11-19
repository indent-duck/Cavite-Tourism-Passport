import { Button } from '@/components/ui/Button';
import type { Reward } from '@/data/types';
import { CLAIM_QR_EXPIRY_MINUTES } from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface ClaimConfirmModalProps {
  visible: boolean;
  reward: Reward;
  /** End of the current promo period, e.g. "Mar 31, 2027" */
  periodEnd?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation shown before generating a claim QR. A user can claim only one
 * reward per promo period, so this spells out the consequence before they
 * walk up to the desk with a pass.
 */
export function ClaimConfirmModal({
  visible,
  reward,
  periodEnd,
  loading = false,
  onConfirm,
  onCancel,
}: ClaimConfirmModalProps) {
  const points = reward.pointsCost.toLocaleString('en-US');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={loading ? undefined : onCancel}
          accessibilityLabel="Close"
        />

        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.iconCircle}>
            <Ionicons name="gift" size={28} color={colors.accent} />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            Claim this reward?
          </Text>
          <Text style={styles.rewardName}>{reward.title}</Text>

          <View style={styles.facts}>
            <Fact icon="alert-circle" emphasis>
              You can claim only <Text style={styles.bold}>one reward</Text> this promo
              period. The others stay locked until {periodEnd ?? 'the period ends'}.
            </Fact>
            <Fact icon="qr-code">
              Your pass is valid for {CLAIM_QR_EXPIRY_MINUTES} minutes. Generate it
              when you are at the tourism desk.
            </Fact>
            <Fact icon="star">
              {points} pts are deducted only when an officer scans it.
            </Fact>
          </View>

          <View style={styles.actions}>
            <Button
              title="Generate claim QR"
              onPress={onConfirm}
              variant="accent"
              loading={loading}
              fullWidth
              testID="confirm-claim-button"
            />
            <Button
              title="Not yet"
              onPress={onCancel}
              variant="text"
              disabled={loading}
              fullWidth
              testID="cancel-claim-button"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Fact({
  icon,
  emphasis = false,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  emphasis?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.fact, emphasis && styles.factEmphasis]}>
      <Ionicons
        name={icon}
        size={18}
        color={emphasis ? colors.accent : colors.primary}
        style={styles.factIcon}
      />
      <Text style={styles.factText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
    backgroundColor: colors.scrim,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.background,
    borderRadius: radii.card + 4,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    textAlign: 'center',
  },
  rewardName: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  facts: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  factEmphasis: {
    backgroundColor: colors.accentTint,
  },
  factIcon: {
    marginTop: 1,
  },
  factText: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 18,
    flex: 1,
  },
  bold: {
    fontFamily: 'Inter_700Bold',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
});
