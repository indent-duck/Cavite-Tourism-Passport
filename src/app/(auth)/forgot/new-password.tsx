import { Button } from '@/components/ui/Button';
import { PasswordCriteria } from '@/components/ui/PasswordCriteria';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAuth } from '@/hooks/useAuth';
import {
    MIN_PASSWORD_LENGTH,
    PASSWORD_REQUIRES_NUMBER,
    PASSWORD_REQUIRES_SPECIAL,
    PASSWORD_REQUIRES_UPPERCASE,
} from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    Pressable,
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    View
} from 'react-native';

/**
 * Forgot Password - Step 3: New Password Entry
 * 
 * Final step of forgot password where user creates a new password.
 * Includes live password strength validation with criteria checklist.
 * 
 * Validates: Requirements 1.7 (Forgot password step 3)
 */
export default function ForgotNewPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { resetPassword } = useAuth();

  // Refs for scroll-to-input behavior
  const scrollViewRef = useRef<any>(null);
  const [inputLayouts, setInputLayouts] = useState<Record<string, number>>({});

  // Listen to keyboard events and scroll when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Small delay to ensure keyboard is fully shown
        setTimeout(() => {
          // Scroll to make room for keyboard and password criteria
          scrollViewRef.current?.scrollTo({
            y: 150,
            animated: true,
          });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Scroll back to top when keyboard closes
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

  // Helper to scroll to an input based on stored layout
  const scrollToInput = (inputKey: string, extraOffset = 150) => {
    const yPosition = inputLayouts[inputKey];
    if (yPosition !== undefined && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, yPosition - extraOffset),
          animated: true,
        });
      }, 100);
    }
  };

  // Password validation helper
  const validatePassword = (pwd: string): boolean => {
    if (pwd.length < MIN_PASSWORD_LENGTH) return false;
    if (PASSWORD_REQUIRES_NUMBER && !/\d/.test(pwd)) return false;
    if (PASSWORD_REQUIRES_UPPERCASE && !/[A-Z]/.test(pwd)) return false;
    if (PASSWORD_REQUIRES_SPECIAL && !/[!@#$%^&*]/.test(pwd)) return false;
    return true;
  };

  const handleResetPassword = async () => {
    // Reset errors
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Validate all fields
    let hasError = false;

    if (!newPassword) {
      setNewPasswordError('Password is required');
      hasError = true;
    } else if (!validatePassword(newPassword)) {
      setNewPasswordError('Password must meet all criteria');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    try {
      await resetPassword.fn(email, newPassword);
      // Navigate to success screen on successful password reset
      // Use replace to prevent adding to navigation stack
      router.replace('/forgot/success');
    } catch {
      // Error is already captured in the hook's state
      setNewPasswordError(resetPassword.error || 'Failed to reset password. Please try again.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCancel = () => {
    // Dismiss all forgot password screens and return to login
    router.dismissAll();
    router.replace('/login');
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']} contentContainerStyle={styles.scrollContent} scrollViewRef={scrollViewRef}>
      <View style={styles.container}>
        {/* Top Bar - Back Button and Step Indicator */}
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={spacing.sm}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>STEP 3 OF 3</Text>
          </View>
        </View>

        {/* Step Label */}
        <Text style={styles.stepLabel}>ACCOUNT RECOVERY</Text>

        {/* Icon Section - Lock with Refresh */}
        <View style={styles.iconSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color={colors.primary} />
            <View style={styles.refreshBadge}>
              <Ionicons name="refresh" size={14} color={colors.background} />
            </View>
          </View>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Set new password</Text>

        {/* Description */}
        <Text style={styles.description}>
          Create a strong new password with at least 8 characters, consisting letters, numbers, and symbols.
        </Text>

        {/* New Password Input */}
        <View
          style={styles.inputGroup}
          onLayout={(event) => {
            setInputLayouts((prev) => ({
              ...prev,
              newPassword: event.nativeEvent.layout.y,
            }));
          }}
        >
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="lock-closed" size={20} color={colors.text} />
            </View>
            <RNTextInput
              style={styles.input}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setNewPasswordError('');
              }}
              onFocus={() => scrollToInput('newPassword', 100)}
              placeholder="Enter new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.visibilityToggle}
              hitSlop={spacing.sm}
            >
              <Ionicons
                name={showNewPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
          {newPasswordError ? (
            <Text style={styles.errorText}>{newPasswordError}</Text>
          ) : null}
        </View>

        {/* Confirm Password Input */}
        <View
          style={styles.inputGroup}
          onLayout={(event) => {
            setInputLayouts((prev) => ({
              ...prev,
              confirmPassword: event.nativeEvent.layout.y,
            }));
          }}
        >
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="lock-closed" size={20} color={colors.text} />
            </View>
            <RNTextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
              onFocus={() => scrollToInput('confirmPassword', 150)}
              placeholder="Re-enter new password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.visibilityToggle}
              hitSlop={spacing.sm}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
          {confirmPasswordError ? (
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          ) : null}
        </View>

        {/* Password Criteria Checklist */}
        <View style={styles.criteriaContainer}>
          <PasswordCriteria password={newPassword} />
        </View>

        {/* Reset Password Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            variant="primary"
            fullWidth
            loading={resetPassword.loading}
            disabled={!validatePassword(newPassword) || newPassword !== confirmPassword}
            icon={<Ionicons name="checkmark-circle" size={20} color={colors.background} />}
          />
        </View>

        {/* Cancel Link */}
        <View style={styles.cancelContainer}>
          <Pressable onPress={handleCancel} hitSlop={spacing.sm}>
            <Text style={styles.cancelText}>
              Cancel and <Text style={styles.cancelLink}>return to sign in</Text>
            </Text>
          </Pressable>
        </View>

        {/* Trust Seal Footer */}
        <View style={styles.trustSeal}>
          <View style={styles.trustSealIconContainer}>
            <Ionicons name="shield-checkmark" size={15} color={colors.primary} />
          </View>
          <Text style={styles.trustSealText}>
            Your password is encrypted and protected under the{' '}
            <Text style={styles.trustSealBold}>Philippine Data Privacy Act of 2012</Text>. We never
            share your personal information.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl * 6, // Significant padding to allow scrolling above keyboard
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
  },
  stepBadgeText: {
    ...typography.labelSmall,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  stepLabel: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d4e3ff', // primary-fixed
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  refreshBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    ...typography.displayLargeMobile,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  label: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  inputContainer: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  iconWrapper: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...typography.bodyLarge,
    color: colors.text,
    padding: 0,
  },
  visibilityToggle: {
    padding: 4,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
  criteriaContainer: {
    marginBottom: spacing.base,
  },
  buttonContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },
  cancelContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cancelText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cancelLink: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  trustSeal: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    padding: 12,
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  trustSealIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d4e3ff', // primary-fixed
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustSealText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  trustSealBold: {
    fontWeight: '700',
  },
});
