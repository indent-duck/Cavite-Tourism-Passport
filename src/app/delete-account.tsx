import { FormBanner } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextInput } from '@/components/ui/TextInput';
import type { DeleteAccountConfirmation } from '@/data/types';
import { useAccountDeletionSummary, useCurrentUser, useDeleteAccount } from '@/hooks';
import { FieldError, getErrorMessage } from '@/lib/errors';
import { pickGoogleAccount } from '@/lib/google-sign-in';
import { hapticError } from '@/lib/haptics';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Delete Account Screen (Settings → Account → Delete account)
 *
 * Spells out what is permanently removed (with the user's real counts) and
 * warns about things still in progress: an active voucher pass and stamp
 * requests waiting for review.
 *
 * Deleting needs both the "I understand" checkbox and proof it's the owner:
 * the account password, or for accounts that use Google, picking that Google
 * account again (they may not have a password at all).
 * On success the cache is cleared and the user lands on the login screen,
 * which shows an "Account deleted" feedback dialog. A wrong password shows
 * under the password field; staff accounts and a different Google account
 * are refused with a form message.
 */
export default function DeleteAccountScreen() {
  const { data: summary } = useAccountDeletionSummary();
  const { data: user } = useCurrentUser();
  const deleteAccount = useDeleteAccount();
  const confirmWithGoogle = user?.hasGoogleSignIn ?? false;

  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [pickingGoogle, setPickingGoogle] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const canDelete = confirmed && (confirmWithGoogle || password.length > 0);

  const handleDelete = async () => {
    if (!canDelete) return;
    setPasswordError('');
    setFormError('');

    let confirmation: DeleteAccountConfirmation;
    if (confirmWithGoogle) {
      setPickingGoogle(true);
      try {
        const credential = await pickGoogleAccount();
        if (!credential) return; // Picker closed: nothing happens
        confirmation = { google: { idToken: credential.idToken, nonce: credential.nonce } };
      } catch (error) {
        hapticError();
        setFormError(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
        return;
      } finally {
        setPickingGoogle(false);
      }
    } else {
      confirmation = { password };
    }

    try {
      await deleteAccount.mutateAsync(confirmation);
      // useDeleteAccount takes the user to the login screen
    } catch (error) {
      hapticError();
      if (error instanceof FieldError && error.field === 'password') {
        setPasswordError(error.message);
      } else {
        setFormError(
          error instanceof Error
            ? getErrorMessage(error)
            : 'Failed to delete your account. Please try again.'
        );
      }
    }
  };

  const deletedItems: { icon: IconName; text: string }[] = [
    {
      icon: 'id-card-outline',
      text: summary ? `Passport ${summary.passportId}` : 'Your digital passport',
    },
    {
      icon: 'ribbon-outline',
      text: summary ? pluralize(summary.stampCount, 'stamp') + ' collected' : 'Your collected stamps',
    },
    {
      icon: 'star-outline',
      text: summary
        ? `${summary.points.toLocaleString('en-US')} points and the rewards they could claim`
        : 'Your points and the rewards they could claim',
    },
    { icon: 'gift-outline', text: 'Reward history and voucher passes' },
    { icon: 'document-text-outline', text: 'Stamp requests and their photos' },
    { icon: 'person-outline', text: 'Your name, address, email and contact number' },
  ];

  const warnings: string[] = [];
  if (summary?.hasActiveVoucher) {
    warnings.push('You have an active voucher pass. It will stop working right away.');
  }
  if (summary && summary.pendingStampRequests > 0) {
    warnings.push(
      `You have ${pluralize(summary.pendingStampRequests, 'stamp request')} waiting for review. ${
        summary.pendingStampRequests === 1 ? 'It' : 'They'
      } will be withdrawn.`
    );
  }

  return (
    <ScreenContainer
      showHeader
      headerTitle="Delete account"
      onBackPress={() => router.back()}
      scrollable
      keyboardAware
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.content}
      testID="delete-account-screen"
      keyboardFooter={
        <Button
          title="Delete my account"
          onPress={handleDelete}
          variant="danger"
          fullWidth
          disabled={!canDelete}
          loading={pickingGoogle || deleteAccount.isPending}
          icon={<Ionicons name="trash-outline" size={18} color={colors.background} />}
          testID="delete-account-submit"
        />
      }
    >
      <StatusBar style="dark" />

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="trash-outline" size={28} color={colors.error} />
        </View>
        <Text style={styles.headline} accessibilityRole="header">
          Delete your account?
        </Text>
        <Text style={styles.body}>
          This permanently deletes your Cavite Tourism Passport and everything in it. You can’t
          undo this.
        </Text>
      </View>

      {/* What gets deleted */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          What will be deleted
        </Text>
        <View style={styles.card}>
          {deletedItems.map((item, index) => (
            <Fragment key={item.icon}>
              {index > 0 && <View style={styles.rowDivider} />}
              <View style={styles.itemRow}>
                <Ionicons name={item.icon} size={20} color={colors.error} />
                <Text style={styles.itemText}>{item.text}</Text>
              </View>
            </Fragment>
          ))}
        </View>
      </View>

      {/* In-progress items that deletion cuts short */}
      {warnings.map((warning) => (
        <View key={warning} style={styles.warning} accessibilityRole="alert">
          <Ionicons name="warning-outline" size={20} color={colors.accent} />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      ))}

      <Text style={styles.note}>
        Signing up again later with the same email starts a new, empty passport.
      </Text>

      {/* Confirmation */}
      <View style={styles.confirm}>
        {confirmWithGoogle ? (
          <View style={styles.googleNote} testID="delete-account-google-note">
            <Ionicons name="logo-google" size={20} color={colors.textSecondary} />
            <Text style={styles.googleNoteText}>
              To confirm, you’ll choose your Google account
              {user?.email ? ` (${user.email})` : ''} after tapping Delete.
            </Text>
          </View>
        ) : (
          <TextInput
            label="Enter your password to confirm"
            leftIcon="lock-closed-outline"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
              setFormError('');
            }}
            placeholder="Your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleDelete}
            error={passwordError}
            testID="delete-account-password"
          />
        )}

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setConfirmed((value) => !value)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmed }}
          testID="delete-account-confirm"
        >
          <Ionicons
            name={confirmed ? 'checkbox' : 'square-outline'}
            size={24}
            color={confirmed ? colors.error : colors.textSecondary}
          />
          <Text style={styles.checkboxText}>
            I understand my stamps, points and rewards will be permanently deleted.
          </Text>
        </Pressable>

        {formError ? <FormBanner message={formError} /> : null}
      </View>
    </ScreenContainer>
  );
}

function pluralize(count: number, noun: string): string {
  return `${count.toLocaleString('en-US')} ${noun}${count === 1 ? '' : 's'}`;
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },

  // Hero
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.errorTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  headline: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // What gets deleted
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xs,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  itemText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_500Medium',
    color: colors.text,
    flex: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    // Align with the text column: row padding + icon + gap
    marginLeft: spacing.base + 20 + spacing.md,
  },

  // Warnings
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.accentTint,
    borderRadius: radii.input,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  warningText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_500Medium',
    color: colors.text,
    flex: 1,
  },
  note: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
  },

  // Confirmation
  confirm: {
    gap: spacing.base,
  },
  googleNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  googleNoteText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_500Medium',
    color: colors.text,
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  checkboxText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_500Medium',
    color: colors.text,
    flex: 1,
  },
});
