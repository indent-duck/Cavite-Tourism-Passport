import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';

/**
 * Forgot Password Success Screen
 * 
 * Terminal state after password reset showing success confirmation.
 * No back button - navigates to login with router.replace to clear stack.
 * Android back button intercepted to navigate to login.
 * 
 * Validates: Requirements 1.8 (Forgot password success)
 */
export default function ForgotSuccessScreen() {
  // Intercept Android back button to navigate to login
  useEffect(() => {
    const onBackPress = () => {
      // Dismiss all screens in the navigation stack before navigating to login
      router.dismissAll();
      router.replace('/login');
      return true; // Prevent default back behavior
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  }, []);

  const handleLoginPress = () => {
    // Dismiss all screens in the navigation stack before navigating to login
    router.dismissAll();
    router.replace('/login');
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={styles.iconBackground}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Password reset successful!</Text>

        {/* Message */}
        <Text style={styles.message}>
          Your password has been successfully reset. You can now log in with your new password.
        </Text>

        {/* Log in Button */}
        <Button
          title="Log in"
          onPress={handleLoginPress}
          variant="primary"
          fullWidth
          icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success + '1A', // 10% opacity (1A in hex)
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headline: {
    ...typography.displayLargeMobile,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: spacing.xxl,
  },
});
