import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography, radii } from '@/theme';

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  testID?: string;
}

export function SegmentedControl({
  options,
  selectedValue,
  onValueChange,
  testID,
}: SegmentedControlProps) {
  return (
    <View style={styles.container} testID={testID}>
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.option,
              isSelected && styles.optionActive,
              isFirst && styles.optionFirst,
              isLast && styles.optionLast,
              pressed && styles.optionPressed,
            ]}
            onPress={() => onValueChange(option.value)}
            testID={testID ? `${testID}-option-${option.value}` : undefined}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
          >
            <Text
              style={[
                styles.optionText,
                isSelected && styles.optionTextActive,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    padding: spacing.xs,
    height: 32,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    minHeight: 44, // Accessible touch target
  },
  optionFirst: {
    borderTopLeftRadius: radii.button,
    borderBottomLeftRadius: radii.button,
  },
  optionLast: {
    borderTopRightRadius: radii.button,
    borderBottomRightRadius: radii.button,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.background,
  },
});
