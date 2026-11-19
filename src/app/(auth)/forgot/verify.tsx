import { Button } from '@/components/ui/Button';
import { CodeInput } from '@/components/ui/CodeInput';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useVerification } from '@/hooks/useVerification';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Forgot Password - Step 2: Code Verification
 * 
 * Second step of the forgot password process where user enters the 6-digit verification
 * code sent to their email. Includes countdown timer and resend functionality.
 * 
 * Validates: Requirements 1.6 (Forgot password step 2)
 */
export default function ForgotVerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const { verifyCode, resendCode, loading, error, countdown, canResend } = useVerification();

  const handleVerify = async () => {
    setVerificationError('');

    if (code.length !== 6) {
      setVerificationError('Please enter the complete 6-digit code');
      return;
    }

    const success = await verifyCode(email, code);
    
    if (success) {
      // Navigate to step 3 (new password entry)
      router.push({
        pathname: '/forgot/new-password',
        params: { email },
      });
    } else {
      setVerificationError(error || 'Invalid verification code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setVerificationError('');
    setCode(''); // Clear the code input
    await resendCode(email);
  };

  const handleEditEmail = () => {
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  // Format countdown as "00:45", "00:15", etc.
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']} contentContainerStyle={styles.scrollContent} keyboardAware keyboardBottomOffset={130}>
      <View style={styles.container}>
        {/* Top Bar - Back Button and Step Indicator */}
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={spacing.sm}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.stepBadge}>
            <Ionicons name="shield" size={16} color={colors.primary} style={styles.stepBadgeIcon} />
            <Text style={styles.stepBadgeText}>STEP 2 OF 3</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '66.67%' }]} />
          </View>
        </View>

        {/* Hero Section - Mail Icon */}
        <View style={styles.heroSection}>
          <View style={styles.iconOuterCircle}>
            <View style={styles.iconInnerContainer}>
              <Ionicons name="mail" size={32} color={colors.accent} />
            </View>
            <View style={styles.pinBadge}>
              <Ionicons name="key" size={14} color={colors.background} />
            </View>
          </View>
        </View>

        {/* Headline - Password Recovery Context */}
        <Text style={styles.headline}>Otp Verification</Text>

        {/* Description with Email */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            We sent a 6-digit verification code to{' '}
            <Text style={styles.emailText}>{email}</Text>
            {' '}to verify your identity and reset your password.
          </Text>
        </View>

        {/* Edit Email Link */}
        <Pressable onPress={handleEditEmail} style={styles.editEmailLink} hitSlop={spacing.sm}>
          <Ionicons name="create-outline" size={14} color={colors.accent} />
          <Text style={styles.editEmailText}>Edit email</Text>
        </Pressable>

        {/* Code Input */}
        <View style={styles.codeInputContainer}>
          <CodeInput
            value={code}
            onChangeText={(newCode) => {
              setCode(newCode);
              setVerificationError('');
            }}
            length={6}
            error={verificationError}
            testID="verification-code-input"
          />
        </View>

        {/* Countdown Timer or Resend Link */}
        <View style={styles.timerContainer}>
          {canResend ? (
            <Pressable onPress={handleResend} disabled={loading} hitSlop={spacing.sm}>
              <Text style={styles.resendLink}>Resend code</Text>
            </Pressable>
          ) : (
            <View style={styles.countdownRow}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.countdownText}>
                Resend code in{' '}
                <Text style={styles.countdownValue}>{formatCountdown(countdown)}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Verify Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Verify Code"
            onPress={handleVerify}
            variant="primary"
            fullWidth
            loading={loading}
            disabled={code.length !== 6}
            icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
          />
        </View>

        {/* Help Card - Password Reset Context */}
        <View style={styles.helpCard}>
          <View style={styles.helpIconContainer}>
            <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.helpTextContainer}>
            <Text style={styles.helpTitle}>Can&apos;t find the email?</Text>
            <Text style={styles.helpBody}>
              Check your spam folder or wait a few minutes for the email to arrive. For security reasons, the code will expire in 15 minutes.
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  container: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
    marginLeft: -8, // Align back button to edge
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    gap: 6,
  },
  stepBadgeIcon: {
    marginRight: -2,
  },
  stepBadgeText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  progressBarContainer: {
    marginBottom: spacing.xl,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radii.full,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  iconOuterCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconInnerContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE8D9', // Light orange background for mail icon
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    ...typography.displayLargeMobile,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  descriptionContainer: {
    maxWidth: 310,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emailText: {
    ...typography.titleMedium,
    color: colors.text,
    fontWeight: '600',
  },
  editEmailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    marginBottom: spacing.xl,
  },
  editEmailText: {
    ...typography.labelMedium,
    color: colors.accent,
    fontWeight: '600',
  },
  codeInputContainer: {
    marginBottom: spacing.base,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    minHeight: 24, // Prevent layout shift
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countdownText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  countdownValue: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  resendLink: {
    ...typography.labelLarge,
    color: colors.accent,
    fontWeight: '700',
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    padding: spacing.base,
    gap: spacing.md,
    marginTop: 'auto', // Push to bottom if space available
  },
  helpIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d4e3ff', // primary-fixed
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    ...typography.titleMedium,
    color: colors.primary,
    marginBottom: 2,
  },
  helpBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
