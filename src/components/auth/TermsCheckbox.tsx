import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { linkTextStyle } from './AuthLink';
import { TermsSheet, type TermsSheetRef } from './TermsSheet';

/**
 * "I agree to the Terms of Service and Privacy Policy" checkbox for sign-up.
 * The whole row toggles the box; the two links open the terms sheet, whose
 * "I agree" button ticks it. `error` shows under the row.
 */
export function TermsCheckbox({
  accepted,
  onChange,
  error,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  error?: string;
}) {
  const sheetRef = useRef<TermsSheetRef>(null);

  return (
    <View style={styles.block}>
      <Pressable
        onPress={() => onChange(!accepted)}
        style={styles.row}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
      >
        <View style={[styles.checkbox, accepted && styles.checkboxChecked, !!error && styles.checkboxError]}>
          {accepted && <Ionicons name="checkmark" size={16} color={colors.background} />}
        </View>
        <Text style={styles.text}>
          I agree to the{' '}
          <Text
            style={styles.link}
            onPress={() => sheetRef.current?.present('terms')}
            accessibilityRole="link"
          >
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text
            style={styles.link}
            onPress={() => sheetRef.current?.present('privacy')}
            accessibilityRole="link"
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </Pressable>
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <TermsSheet ref={sheetRef} accepted={accepted} onAccept={() => onChange(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.xs,
  },
  // Row is at least 44px tall so the checkbox is easy to hit
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.error,
  },
  text: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    flex: 1,
  },
  // Same size as the sentence so the links sit on the same baseline
  link: {
    ...typography.bodyMedium,
    fontFamily: linkTextStyle.fontFamily,
    color: linkTextStyle.color,
    textDecorationLine: 'underline',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },
});
