import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextInput } from '@/components/ui/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { EMAIL_REGEX } from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Login Screen
 * 
 * User login with email and password.
 * Mock rule: password "wrong" shows error, others succeed.
 * Navigates to Explore on success.
 * 
 * Validates: Requirements 1.1 (Login screen)
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signIn } = useAuth();

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    try {
      await signIn.fn(email, password);
      // On success, navigate to Explore
      router.push('/(tabs)/explore');
    } catch {
      // Error is already set by useAuth hook
      // Display in password field as it's the auth error
      if (signIn.error) {
        setPasswordError(signIn.error);
      }
    }
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Heritage Seal */}
        <View style={styles.sealContainer}>
          <View style={styles.seal}>
            <Ionicons name="shield" size={36} color={colors.passportFoil} />
            <Text style={styles.sealYear}>1898</Text>
          </View>
        </View>

        {/* Official Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>OFFICIAL DIGITAL PASS</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Cavite Tourism Passport</Text>

        {/* Description */}
        <Text style={styles.description}>
          Explore historic Cavite, collect official stamps, and redeem exclusive provincial rewards.
        </Text>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email address</Text>
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
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                placeholder="••••••••••••"
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                error={passwordError}
              />
              <Pressable
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.visibilityToggle}
                hitSlop={spacing.sm}
              >
                <Ionicons
                  name={passwordVisible ? 'eye' : 'eye-off'}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => router.push('/forgot/email')}
              style={styles.forgotPasswordLink}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* Login Button */}
          <View style={styles.buttonWrapper}>
            <Button
              title="Log in"
              onPress={handleLogin}
              variant="primary"
              fullWidth
              loading={signIn.loading}
              icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
            />
          </View>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don&apos;t have an account? </Text>
          <Pressable onPress={() => router.push('/signup/email')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </Pressable>
        </View>

        {/* Provincial Footnote */}
        <View style={styles.footer}>
          <View style={styles.footerHeader}>
            <Ionicons name="shield" size={14} color={colors.textSecondary} />
            <Text style={styles.footerTitle}>
              LALAWIGAN NG KABITE • REPUBLIC OF THE PHILIPPINES
            </Text>
          </View>
          <Text style={styles.footerSubtext}>
            Department of Tourism &amp; Cultural Heritage Office
          </Text>
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
  sealContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seal: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.passportLeather,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sealYear: {
    ...typography.labelSmall,
    color: colors.passportFoil,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: -4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    marginBottom: spacing.xs,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  badgeText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
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
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xxl,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    padding: spacing.base,
    marginBottom: spacing.lg,
    gap: spacing.base,
  },
  inputWrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.labelMedium,
    color: colors.text,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  visibilityToggle: {
    position: 'absolute',
    right: 16,
    top: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    paddingTop: 4,
    paddingRight: 4,
  },
  forgotPasswordText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  buttonWrapper: {
    marginTop: spacing.sm,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  signupText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  signupLink: {
    ...typography.labelLarge,
    color: colors.accent,
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
    opacity: 0.7,
  },
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  footerTitle: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  footerSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
