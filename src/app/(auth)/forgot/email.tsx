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
 * Forgot Password - Step 1: Email Entry
 * 
 * First step of password recovery where user enters their email address.
 * Sends verification code on success and navigates to code verification.
 * 
 * Validates: Requirements 1.5 (Forgot password step 1)
 */
export default function ForgotEmailScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const { sendCode } = useAuth();

  // Scroll management refs
  const scrollViewRef = useRef<any>(null);
  const [inputLayout, setInputLayout] = useState({ y: 0, height: 0 });

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Scroll content up by 150px when keyboard appears
      scrollViewRef.current?.scrollTo({ y: 150, animated: true });
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Scroll back to top when keyboard closes
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Helper function to scroll to input when focused
  const scrollToInput = (offsetAdjustment = 100) => {
    if (inputLayout.y > 0) {
      scrollViewRef.current?.scrollTo({
        y: inputLayout.y - offsetAdjustment,
        animated: true,
      });
    }
  };

  const handleSendCode = async () => {
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
        pathname: '/forgot/verify',
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
    <ScreenContainer 
      scrollable 
      edges={['top', 'left', 'right']}
      scrollViewRef={scrollViewRef}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {/* Top Bar - Back Button and Title Badge */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={spacing.sm}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.titleBadge}>
            <Ionicons name="shield" size={16} color={colors.primary} />
            <Text style={styles.titleBadgeText}>PASSWORD RECOVERY</Text>
          </View>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>STEP 1 OF 3</Text>
        </View>

        {/* Mail Icon Section */}
        <View style={styles.iconSection}>
          <View style={styles.iconOuterCircle}>
            <View style={styles.iconInnerCircle}>
              <Ionicons name="mail" size={32} color={colors.accent} />
            </View>
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Forgot your password?</Text>

        {/* Description */}
        <Text style={styles.description}>
          Enter your email address and we&apos;ll send you a 6-digit verification code to reset your password.
        </Text>

        {/* Email Input */}
        <View 
          style={styles.inputSection}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setInputLayout({ y, height });
          }}
        >
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
            onFocus={() => scrollToInput(100)}
          />
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={18} color={colors.textSecondary} />
          <Text style={styles.securityText}>
            For your security, we&apos;ll verify your identity before allowing password changes.
          </Text>
        </View>

        {/* Send Verification Code Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Send verification code"
            onPress={handleSendCode}
            variant="accent"
            fullWidth
            loading={sendCode.loading}
            icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
          />
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Remember your password? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
        </View>

        {/* Help Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>PROVINCIAL TOURISM ASSISTANCE</Text>
          <Text style={styles.footerSubtext}>
            Need help? Contact support@cavite.gov.ph
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl * 6, // Increased padding for keyboard
  },
  container: {
    paddingTop: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
  },
  titleBadgeText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    marginBottom: spacing.xl,
  },
  stepBadgeText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  iconOuterCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInnerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headline: {
    ...typography.displayLargeMobile,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  inputSection: {
    marginBottom: spacing.base,
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
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  securityText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
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
  footer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    opacity: 0.7,
  },
  footerTitle: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  footerSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
