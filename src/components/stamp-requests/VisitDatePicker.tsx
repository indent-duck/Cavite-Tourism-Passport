import { formatVisitDate, type VisitDateOption } from '@/lib/stamp-requests';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PickerField, renderSheetBackdrop, sheetStyles } from './PickerField';

interface VisitDatePickerProps {
  /** Selectable dates, newest first (see getVisitDateOptions) */
  options: VisitDateOption[];
  /** Selected date as 'YYYY-MM-DD' */
  value: string | null;
  onChange: (key: string) => void;
  error?: string;
}

/**
 * VisitDatePicker
 *
 * Form field that opens a bottom sheet listing the days of the current promo
 * period up to today, newest first ("Today", "Yesterday", "Wed, Nov 18", ...).
 */
export function VisitDatePicker({ options, value, onChange, error }: VisitDatePickerProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  const selectedOption = options.find((option) => option.key === value);
  const displayValue = selectedOption
    ? selectedOption.label === 'Today' || selectedOption.label === 'Yesterday'
      ? `${selectedOption.label}, ${formatVisitDate(selectedOption.key)}`
      : formatVisitDate(selectedOption.key)
    : undefined;

  const open = () => {
    Keyboard.dismiss();
    sheetRef.current?.present();
  };

  const select = (key: string) => {
    onChange(key);
    sheetRef.current?.dismiss();
  };

  return (
    <PickerField
      label="Date of visit"
      value={displayValue}
      placeholder="When was your passport stamped?"
      icon="calendar-outline"
      error={error}
      onPress={open}
      accessibilityHint="Opens a list of dates in the current promo period"
      testID="stamp-request-date-field"
    >
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['60%']}
        enableDynamicSizing={false}
        backdropComponent={renderSheetBackdrop}
        handleIndicatorStyle={sheetStyles.handle}
      >
        <Text style={sheetStyles.title}>Date of visit</Text>
        <BottomSheetFlatList
          data={options}
          keyExtractor={(option: VisitDateOption) => option.key}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.base }}
          renderItem={({ item: option }: { item: VisitDateOption }) => {
            const selected = option.key === value;
            return (
              <Pressable
                onPress={() => select(option.key)}
                style={({ pressed }) => [sheetStyles.option, (pressed || selected) && sheetStyles.optionActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${option.label}, ${formatVisitDate(option.key)}`}
              >
                <View style={sheetStyles.optionText}>
                  <Text style={[sheetStyles.optionName, selected && sheetStyles.optionNameSelected]}>
                    {option.label}
                  </Text>
                  {(option.label === 'Today' || option.label === 'Yesterday') && (
                    <Text style={sheetStyles.optionMeta}>{formatVisitDate(option.key)}</Text>
                  )}
                </View>
                {selected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </Pressable>
            );
          }}
        />
      </BottomSheetModal>
    </PickerField>
  );
}
