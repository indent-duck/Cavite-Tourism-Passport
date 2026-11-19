import { colors, spacing, typography } from '@/theme';
import { StyleSheet } from 'react-native';

/**
 * Layout shared by the multi-step auth screens so every step lines up the
 * same way: left-aligned headline under the AuthHeader, content, then a
 * flexible spacer that pushes footer content to the bottom.
 */
export const authScreenStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.base,
  },
  headline: {
    ...typography.displayLargeMobile,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  spacer: {
    flexGrow: 1,
    minHeight: spacing.xl,
  },
});
