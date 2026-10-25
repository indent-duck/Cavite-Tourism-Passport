import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/theme';

/**
 * Login Screen
 * 
 * Placeholder screen for user login.
 * Will be implemented in Auth spec.
 * 
 * Validates: Requirements 1.3.2 (Auth Layout)
 */
export default function LoginScreen() {
  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.description}>
          This screen will be implemented in the Auth spec.
        </Text>
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
  title: {
    ...typography.headlineLarge,
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
