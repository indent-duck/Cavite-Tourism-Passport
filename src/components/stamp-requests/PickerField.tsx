import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

interface PickerFieldProps {
  label: string;
  /** Selected value text; the placeholder shows when empty */
  value?: string;
  placeholder: string;
  icon: IconName;
  error?: string;
  /** Pre-filled and not changeable (shows a lock instead of the chevron) */
  locked?: boolean;
  onPress: () => void;
  accessibilityHint?: string;
  testID?: string;
  /** The field's bottom sheet */
  children?: ReactNode;
}

/**
 * PickerField
 *
 * Form field that opens a bottom sheet to choose a value. Styled like the
 * shared TextInput and MunicipalityPicker so it sits in a form with them.
 */
export function PickerField({
  label,
  value,
  placeholder,
  icon,
  error,
  locked = false,
  onPress,
  accessibilityHint,
  testID,
  children,
}: PickerFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={onPress}
        disabled={locked}
        style={[
          styles.field,
          { borderColor: error ? colors.error : colors.border },
          locked && styles.fieldLocked,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ?? 'not selected'}`}
        accessibilityHint={error ?? accessibilityHint}
        accessibilityState={{ disabled: locked }}
        testID={testID}
      >
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value ?? placeholder}
        </Text>
        <Ionicons
          name={locked ? 'lock-closed' : 'chevron-down'}
          size={locked ? 16 : 18}
          color={colors.textSecondary}
        />
      </Pressable>
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Dimmed backdrop that closes the sheet when tapped */
export function renderSheetBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
  );
}

/** Shared bottom-sheet styles for the stamp request pickers */
export const sheetStyles = StyleSheet.create({
  handle: {
    backgroundColor: colors.border,
    width: 40,
  },
  title: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  optionActive: {
    backgroundColor: colors.primaryTint,
  },
  optionDisabled: {
    opacity: 0.45,
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    ...typography.bodyLarge,
    fontFamily: 'Inter_500Medium',
    color: colors.text,
  },
  optionNameSelected: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  optionMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs + 2,
  },
  label: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    paddingHorizontal: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    backgroundColor: colors.background,
    borderRadius: radii.input,
    borderWidth: 1.5,
    paddingHorizontal: spacing.base,
  },
  fieldLocked: {
    backgroundColor: colors.surface,
  },
  value: {
    ...typography.bodyLarge,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },
});
