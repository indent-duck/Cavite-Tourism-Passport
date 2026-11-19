import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface FormBannerProps {
  message: string;
}

/**
 * FormBanner
 *
 * Form-level error (e.g. "Incorrect email or password") shown above a
 * form's submit button, for failures that don't belong to a single field.
 * Announced to screen readers when it appears.
 */
export function FormBanner({ message }: FormBannerProps) {
  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Ionicons name="alert-circle" size={18} color={colors.error} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorTint,
    borderRadius: radii.input,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  text: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_500Medium',
    color: colors.error,
    flex: 1,
  },
});
