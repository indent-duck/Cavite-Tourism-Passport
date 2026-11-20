import { AuthLink, FormBanner, linkTextStyle } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { CodeInput } from '@/components/ui/CodeInput';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { PasswordCriteria } from '@/components/ui/PasswordCriteria';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextInput, type TextInputRef } from '@/components/ui/TextInput';
import { useChangePassword, useCurrentUser } from '@/hooks';
import { RESEND_CODE_TIMEOUT } from '@/lib/constants';
import { FieldError, getErrorMessage } from '@/lib/errors';
import { hapticError, hapticSuccess } from '@/lib/haptics';
import { isValidPassword } from '@/lib/password';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

type Method = 'password' | 'code';

/**
 * Change Password Screen (Settings → Account → Change password)
 *
 * The user proves it's them, then picks a new password:
 * - Current password (default), or
 * - "Forgot your current password?" emails a 6-digit code to the account's
 *   address and swaps the current-password field for a code input.
 *
 * New password uses the same rules and live checklist as sign up. The user
 * stays signed in; a success dialog confirms the change and returns to Settings.
 * Mock: current password "wrong" fails; the email code is "123456".
 */
export default function ChangePasswordScreen() {
  const { data: user } = useCurrentUser();
  const { changePassword, sendCode } = useChangePassword();

  const [method, setMethod] = useState<Method>('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  // Several ways close the success dialog (button, backdrop, Android back); leave only once
  const leaving = useRef(false);

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const currentPasswordRef = useRef<TextInputRef>(null);
  const newPasswordRef = useRef<TextInputRef>(null);
  const confirmPasswordRef = useRef<TextInputRef>(null);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleSendCode = async () => {
    setFormError('');
    try {
      await sendCode.mutateAsync();
      setMethod('code');
      setCode('');
      setCodeError('');
      setCurrentPasswordError('');
      setResendCountdown(RESEND_CODE_TIMEOUT);
    } catch (error) {
      setFormError(
        error instanceof Error ? getErrorMessage(error) : 'Failed to send the code. Please try again.'
      );
      hapticError();
    }
  };

  const handleUsePassword = () => {
    setMethod('password');
    setCode('');
    setCodeError('');
    setFormError('');
  };

  const handleSubmit = async () => {
    setFormError('');

    const errors = {
      currentPassword:
        method === 'password' && !currentPassword ? 'Enter your current password' : '',
      code: method === 'code' && code.length !== 6 ? 'Enter the 6-digit code from your email' : '',
      newPassword: !newPassword
        ? 'New password is required'
        : !isValidPassword(newPassword)
          ? 'Password must meet all criteria'
          : method === 'password' && newPassword === currentPassword
            ? 'Choose a password different from your current one'
            : '',
      confirmPassword: !confirmPassword
        ? 'Please confirm your new password'
        : newPassword !== confirmPassword
          ? 'Passwords do not match'
          : '',
    };

    setCurrentPasswordError(errors.currentPassword);
    setCodeError(errors.code);
    setNewPasswordError(errors.newPassword);
    setConfirmPasswordError(errors.confirmPassword);

    // Take the user to the first problem, top to bottom
    if (errors.currentPassword || errors.code || errors.newPassword || errors.confirmPassword) {
      hapticError();
      if (errors.currentPassword) currentPasswordRef.current?.focus();
      else if (errors.newPassword) newPasswordRef.current?.focus();
      else if (errors.confirmPassword) confirmPasswordRef.current?.focus();
      return;
    }

    try {
      await changePassword.mutateAsync({
        newPassword,
        proof: method === 'password' ? { currentPassword } : { code },
      });
      Keyboard.dismiss();
      setShowSuccess(true);
      hapticSuccess();
    } catch (error) {
      hapticError();
      if (error instanceof FieldError && error.field === 'currentPassword') {
        setCurrentPasswordError(error.message);
        currentPasswordRef.current?.focus();
      } else if (error instanceof FieldError && error.field === 'code') {
        setCodeError(error.message);
      } else {
        setFormError(
          error instanceof Error
            ? getErrorMessage(error)
            : 'Failed to update your password. Please try again.'
        );
      }
    }
  };

  const handleDone = () => {
    if (leaving.current) return;
    leaving.current = true;
    router.back();
  };

  return (
    <ScreenContainer
      showHeader
      headerTitle="Change password"
      onBackPress={() => router.back()}
      scrollable
      keyboardAware
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.content}
      testID="change-password-screen"
      keyboardFooter={
        <Button
          title="Update password"
          onPress={handleSubmit}
          variant="accent"
          fullWidth
          loading={changePassword.isPending}
          icon={<Ionicons name="lock-closed" size={18} color={colors.background} />}
          testID="change-password-submit"
        />
      }
    >
      <StatusBar style="dark" />

      <Text style={styles.intro}>
        {method === 'password'
          ? 'Enter your current password, then choose a new one. You’ll stay logged in on this device.'
          : 'Enter the code we emailed you, then choose a new password. You’ll stay logged in on this device.'}
      </Text>

      <View style={styles.form}>
        {method === 'password' ? (
          <View>
            <TextInput
              ref={currentPasswordRef}
              label="Current password"
              leftIcon="lock-closed-outline"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setCurrentPasswordError('');
                setFormError('');
              }}
              placeholder="Enter your current password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => newPasswordRef.current?.focus()}
              error={currentPasswordError}
              testID="change-password-current"
            />
            <AuthLink
              title={sendCode.isPending ? 'Sending code…' : 'Forgot your current password?'}
              onPress={handleSendCode}
              disabled={sendCode.isPending}
              style={styles.inlineLink}
            />
          </View>
        ) : (
          <View style={styles.codeCard}>
            <View style={styles.codeHeader}>
              <View style={styles.codeIcon}>
                <Ionicons name="mail" size={18} color={colors.accent} />
              </View>
              <Text style={styles.codeText}>
                We emailed a 6-digit code to{' '}
                <Text style={styles.codeEmail}>{user ? maskEmail(user.email) : 'your email'}</Text>
              </Text>
            </View>

            <CodeInput
              value={code}
              onChangeText={(text) => {
                setCode(text);
                setCodeError('');
                setFormError('');
              }}
              length={6}
              error={codeError}
              testID="change-password-code"
            />

            <View style={styles.codeActions}>
              {resendCountdown > 0 ? (
                <Text style={styles.resendCountdown}>
                  Resend in {formatCountdown(resendCountdown)}
                </Text>
              ) : (
                <Pressable
                  onPress={handleSendCode}
                  disabled={sendCode.isPending}
                  hitSlop={spacing.sm}
                  accessibilityRole="button"
                >
                  <Text style={[linkTextStyle, sendCode.isPending && styles.dimmed]}>
                    {sendCode.isPending ? 'Sending…' : 'Resend code'}
                  </Text>
                </Pressable>
              )}
              <Pressable onPress={handleUsePassword} hitSlop={spacing.sm} accessibilityRole="button">
                <Text style={linkTextStyle}>Use current password</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.passwordGroup}>
          <TextInput
            ref={newPasswordRef}
            label="New password"
            leftIcon="lock-closed-outline"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setNewPasswordError('');
              setFormError('');
            }}
            placeholder="Create a new password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            error={newPasswordError}
            testID="change-password-new"
          />
          <PasswordCriteria password={newPassword} style={styles.criteria} />
        </View>

        <TextInput
          ref={confirmPasswordRef}
          label="Confirm new password"
          leftIcon="lock-closed-outline"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setConfirmPasswordError('');
            setFormError('');
          }}
          placeholder="Re-enter your new password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          error={confirmPasswordError}
          testID="change-password-confirm"
        />

        {formError ? <FormBanner message={formError} /> : null}
      </View>

      <FeedbackModal
        visible={showSuccess}
        onDone={handleDone}
        icon="lock-closed"
        title="Password updated"
        message="Use your new password the next time you log in."
        note={{ icon: 'phone-portrait-outline', text: 'You’re still logged in on this device.' }}
        buttonTitle="Back to Settings"
        testID="password-updated"
      />
    </ScreenContainer>
  );
}

/** "juan.delacruz@example.com" -> "j•••@example.com" */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local[0]}•••@${domain}`;
}

/** 45 -> "0:45" */
function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.base,
  },
  intro: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
  },
  form: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  inlineLink: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: -spacing.sm,
  },

  // Email code
  codeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    gap: spacing.base,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  codeIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
    flex: 1,
  },
  codeEmail: {
    fontFamily: 'Inter_600SemiBold',
  },
  codeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resendCountdown: {
    ...typography.labelLarge,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },
  dimmed: {
    opacity: 0.5,
  },

  // New password
  passwordGroup: {
    gap: spacing.md,
  },
  criteria: {
    paddingHorizontal: spacing.xs,
    marginBottom: -spacing.sm, // last criteria row carries its own bottom margin
  },
});
