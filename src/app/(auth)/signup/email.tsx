import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextInput } from '@/components/ui/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { EMAIL_REGEX } from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Sign Up - Step 1: Email Entry
 * 
 * First step of the signup process where user enters their email address
 * and agrees to the terms of service. Sends verification code on success.
 * 
 * Validates: Requirements 1.2 (Sign up step 1)
 */
export default function SignupEmailScreen() {
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { sendCode } = useAuth();
  const scrollViewRef = useRef<any>(null);

  // Listen to keyboard events and scroll
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: 200,
            animated: true,
          });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Email validation runs on every keystroke
  const isEmailValid = EMAIL_REGEX.test(email) && email.length > 0;

  const handleContinue = async () => {
    // Reset errors
    setEmailError('');

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      await sendCode.fn(email);
      // On success, navigate to verification screen with email
      router.push({
        pathname: '/signup/verify',
        params: { email },
      });
    } catch {
      // Error is already set by useAuth hook
      if (sendCode.error) {
        setEmailError(sendCode.error);
      }
    }
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']} scrollViewRef={scrollViewRef} contentContainerStyle={{ paddingBottom: spacing.xxl * 6 }}>
      <View style={styles.container}>
        {/* Top Bar - Back Button and Step Indicator */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.replace('/login')} style={styles.backButton} hitSlop={spacing.sm}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 1 OF 3</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '33.33%' }]} />
          </View>
        </View>

        {/* Delight Badge - Book Icon */}
        <View style={styles.delightBadge}>
          <View style={styles.iconContainer}>
            <Ionicons name="book" size={24} color={colors.primary} />
          </View>
          <View style={styles.delightTextContainer}>
            <Text style={styles.delightLabel}>OFFICIAL TOURISM IDENTITY</Text>
            <Text style={styles.delightSubtext}>Province of Cavite</Text>
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Create your digital passport</Text>

        {/* Description */}
        <Text style={styles.description}>
          Begin your journey through Cavite&apos;s heritage sites, dining experiences, and cultural festivals.
        </Text>

        {/* Email Input */}
        <View style={styles.inputSection}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.labelHint}>Official verification</Text>
          </View>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            placeholder="juandelacruz@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />
          {!emailError && (
            <Text style={styles.hint}>We will never share your private details.</Text>
          )}
        </View>

        {/* Info Card - Civic Exploration ID */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Civic Exploration ID</Text>
            <Text style={styles.infoBody}>
              Your passport is an official identity linked to the Provincial Tourism Office.
            </Text>
          </View>
        </View>

        {/* Terms Checkbox */}
        <View style={styles.termsContainer}>
          <Pressable
            onPress={() => setTermsAccepted(!termsAccepted)}
            style={styles.checkboxContainer}
            hitSlop={spacing.sm}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && (
                <Ionicons name="checkmark" size={16} color={colors.background} />
              )}
            </View>
          </Pressable>
          <Text style={styles.termsText}>
            By continuing, you agree to the{' '}
            <Pressable onPress={() => router.push('/privacy')}>
              <Text style={styles.termsLink}>Provincial Tourism Terms of Service</Text>
            </Pressable>{' '}
            &{' '}
            <Pressable onPress={() => router.push('/privacy')}>
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Pressable>
            .
          </Text>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            fullWidth
            loading={sendCode.loading}
            disabled={!isEmailValid || !termsAccepted}
            icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
          />
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/login')}>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
  },
  stepBadgeText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  progressBarContainer: {
    marginBottom: spacing.xxl,
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
  delightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radii.input,
    backgroundColor: '#d4e3ff', // primary-fixed
    justifyContent: 'center',
    alignItems: 'center',
  },
  delightTextContainer: {
    flex: 1,
  },
  delightLabel: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  delightSubtext: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  headline: {
    ...typography.displayLargeMobile,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: 4,
  },
  label: {
    ...typography.labelMedium,
    color: colors.text,
    fontWeight: '600',
  },
  labelHint: {
    ...typography.labelSmall,
    color: colors.accent,
    fontWeight: '600',
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    paddingHorizontal: 4,
    minHeight: 16,
    marginTop: spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d4e3ff', // primary-fixed
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    ...typography.titleMedium,
    color: colors.primary,
    marginBottom: 2,
  },
  infoBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  termsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  checkboxContainer: {
    paddingTop: 2, // Align with first line of text
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  termsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  termsLink: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginBottom: spacing.xxl,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  loginText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.labelLarge,
    color: colors.accent,
    fontWeight: '700',
  },
});
