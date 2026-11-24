import { Button } from '@/components/ui/Button';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface DetailsChangeConfirmModalProps {
  visible: boolean;
  /** Date the name unlocks again if this save changes it, e.g. "Dec 24, 2026" */
  nameUntil?: string;
  /** Date the address unlocks again if this save changes it */
  addressUntil?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shown before Personal details saves a new name or address. Each can change
 * only once every few weeks (the database enforces it), so this spells out
 * how long the new one stays before the user commits to it.
 */
export function DetailsChangeConfirmModal({
  visible,
  nameUntil,
  addressUntil,
  onConfirm,
  onCancel,
}: DetailsChangeConfirmModalProps) {
  const title =
    nameUntil && addressUntil
      ? 'Save your new details?'
      : nameUntil
        ? 'Save your new name?'
        : 'Save your new address?';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Close" />

        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={26} color={colors.accent} />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>

          <View style={styles.facts}>
            {nameUntil ? (
              <Fact icon="person" emphasis>
                You won’t be able to change your name again until{' '}
                <Text style={styles.bold}>{nameUntil}</Text>.
              </Fact>
            ) : null}
            {addressUntil ? (
              <Fact icon="location" emphasis>
                You won’t be able to change your address again until{' '}
                <Text style={styles.bold}>{addressUntil}</Text>.
              </Fact>
            ) : null}
            <Fact icon="help-circle">
              Made a mistake? The helpdesk can still fix it for you.
            </Fact>
          </View>

          <View style={styles.actions}>
            <Button
              title="Save changes"
              onPress={onConfirm}
              variant="accent"
              fullWidth
              testID="confirm-details-change"
            />
            <Button
              title="Keep editing"
              onPress={onCancel}
              variant="text"
              fullWidth
              testID="cancel-details-change"
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
  icon: ComponentProps<typeof Ionicons>['name'];
  emphasis?: boolean;
  children: ReactNode;
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
