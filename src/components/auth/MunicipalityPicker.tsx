import { CAVITE_LGUS, OUTSIDE_CAVITE } from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetModal,
    type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Props for the text field under the picker. It holds the barangay and street
 * (optional) for a Cavite LGU, or the whole place for "Outside Cavite"
 * (required, checked with getOutsidePlaceError).
 */
export function getAddressLineFieldProps(municipality: string | null) {
  return municipality === OUTSIDE_CAVITE
    ? ({
        label: 'City and province, or country',
        placeholder: 'e.g. Quezon City, Metro Manila',
        leftIcon: 'globe-outline',
        autoComplete: 'postal-address-locality',
        textContentType: 'addressCityAndState',
      } as const)
    : ({
        label: 'Barangay and street (optional)',
        placeholder: 'e.g. Brgy. Poblacion, Rizal St.',
        leftIcon: 'home-outline',
        autoComplete: 'address-line1',
        textContentType: 'streetAddressLine1',
      } as const);
}

/** The field's text only carries over between two Cavite LGUs */
export function isSameAddressKind(a: string | null, b: string | null): boolean {
  return (a === OUTSIDE_CAVITE) === (b === OUTSIDE_CAVITE);
}

interface MunicipalityPickerProps {
  label: string;
  value: string | null;
  onChange: (municipality: string) => void;
  error?: string;
  /** Read-only, like a TextInput with editable={false} */
  disabled?: boolean;
}

/**
 * MunicipalityPicker
 *
 * Form field that opens a bottom sheet listing all of Cavite's cities and
 * municipalities, plus an "Outside Cavite" choice (OUTSIDE_CAVITE) at the top
 * for non-residents. Styled to match the shared TextInput so it sits in a form
 * alongside regular fields.
 */
export function MunicipalityPicker({
  label,
  value,
  onChange,
  error,
  disabled = false,
}: MunicipalityPickerProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  const open = () => {
    Keyboard.dismiss();
    sheetRef.current?.present();
  };

  const select = (name: string) => {
    onChange(name);
    sheetRef.current?.dismiss();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={open}
        disabled={disabled}
        style={[
          styles.field,
          { borderColor: error ? colors.error : colors.border },
          disabled && styles.fieldDisabled,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={`${label}: ${value ?? 'not selected'}`}
        accessibilityHint={error ?? 'Opens a list of Cavite cities and municipalities, or choose Outside Cavite'}
      >
        <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value ?? 'Select city or municipality'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['70%']}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <Text style={styles.sheetTitle}>City or municipality</Text>
        <BottomSheetFlatList
          data={CAVITE_LGUS}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.base }}
          // Non-residents go first so they don't scroll past all 23 LGUs looking for it
          ListHeaderComponent={
            <View style={styles.outsideGroup}>
              <Option
                name={OUTSIDE_CAVITE}
                detail="From another province or country"
                selected={value === OUTSIDE_CAVITE}
                onPress={() => select(OUTSIDE_CAVITE)}
              />
            </View>
          }
          renderItem={({ item }) => (
            <Option
              name={item.name}
              detail={item.type}
              selected={item.name === value}
              onPress={() => select(item.name)}
            />
          )}
        />
      </BottomSheetModal>
    </View>
  );
}

function Option({
  name,
  detail,
  selected,
  onPress,
}: {
  name: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, (pressed || selected) && styles.optionActive]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={styles.optionText}>
        <Text style={[styles.optionName, selected && styles.optionNameSelected]}>{name}</Text>
        <Text style={styles.optionType}>{detail}</Text>
      </View>
      {selected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
    </Pressable>
  );
}

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
  fieldDisabled: {
    opacity: 0.6, // same as TextInput
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
  handle: {
    backgroundColor: colors.border,
    width: 40,
  },
  sheetTitle: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  outsideGroup: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  optionActive: {
    backgroundColor: colors.primaryTint,
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
  optionType: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
