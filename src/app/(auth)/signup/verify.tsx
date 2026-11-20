import { AuthHeader, AuthLink, authScreenStyles } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { CodeInput } from '@/components/ui/CodeInput';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useVerification } from '@/hooks/useVerification';
import { VERIFICATION_CODE_LENGTH } from '@/lib/constants';
import { hapticError } from '@/lib/haptics';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Sign Up - Step 2: Code Verification
 *
 * Second step of the signup process where user enters the 6-digit verification
 * code sent to their email. Submits automatically once all digits are entered.
 * Includes countdown timer and resend functionality.
 *
 * Validates: Requirements 1.3 (Sign up step 2)
 */
export default function SignupVerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const { verifyCode, resendCode, loading, error, countdown, canResend } = useVerification('signup');

  const handleVerify = async (codeToVerify: string = code) => {
    setCodeError('');

    if (codeToVerify.length !== VERIFICATION_CODE_LENGTH) {
      setCodeError('Please enter the complete 6-digit code');
      hapticError();
      return;
    }

    const success = await verifyCode(email, codeToVerify);

    if (success) {
      router.push({
        pathname: '/signup/details',
        params: { email },
      });
    } else {
      // The hook's `error` (shown first, see CodeInput below) carries the API's message;
      // this is the fallback if verification fails without one
      setCodeError('Invalid verification code. Please try again.');
      hapticError();
    }
  };

  const handleChangeCode = (newCode: string) => {
    setCode(newCode);
    setCodeError('');
    // Submit as soon as the last digit is typed or pasted
    if (newCode.length === VERIFICATION_CODE_LENGTH && !loading) {
      handleVerify(newCode);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCodeError('');
    setCode('');
    await resendCode(email);
  };

  // Format countdown as "00:45", "00:15", etc.
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenContainer
      scrollable
      keyboardAware
      // Keep the resend timer visible under the code boxes
      keyboardBottomOffset={80}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={authScreenStyles.scrollContent}
      // The button rides on top of the number pad so it is never covered
      keyboardFooter={
        <Button
          title="Verify"
          onPress={() => handleVerify()}
          variant="accent"
          fullWidth
          loading={loading}
          disabled={code.length !== VERIFICATION_CODE_LENGTH}
          icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
        />
      }
    >
      <AuthHeader step={2} totalSteps={3} onBack={() => router.back()} backLabel="Back to email" />

      <Text style={authScreenStyles.headline} accessibilityRole="header">
        Check your email
      </Text>
      <Text style={authScreenStyles.description}>
        Enter the 6-digit code we sent to <Text style={styles.emailText}>{email}</Text>
      </Text>

      <CodeInput
        value={code}
        onChangeText={handleChangeCode}
        length={VERIFICATION_CODE_LENGTH}
        error={error || codeError || undefined}
        testID="verification-code-input"
      />

      {/* Countdown timer or resend link (fixed height prevents layout shift) */}
      <View style={styles.timerContainer}>
        {canResend ? (
          <AuthLink title="Resend code" onPress={handleResend} disabled={loading} />
        ) : (
          <View style={styles.countdownRow}>
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.countdownText}>
              Resend code in <Text style={styles.countdownValue}>{formatCountdown(countdown)}</Text>
            </Text>
          </View>
        )}
      </View>

      <View style={authScreenStyles.spacer} />

      <View style={styles.helpCard}>
        <View style={styles.helpIconContainer}>
          <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.helpTextContainer}>
          <Text style={styles.helpTitle}>Can&apos;t find the email?</Text>
          <Text style={styles.helpBody}>Check your spam or promotions folder.</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emailText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginVertical: spacing.md,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countdownText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  countdownValue: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    padding: spacing.base,
    gap: spacing.md,
  },
  helpIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    ...typography.titleMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
  },
  helpBody: {
    ...typography.bodySmall,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
});
