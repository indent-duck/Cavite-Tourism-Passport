import { colors, radii, spacing, typography } from '@/theme';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface SegmentedControlOption {
  label: string;
  value: string;
  icon?: ReactNode;
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
            {option.icon && (
              <View style={styles.iconContainer}>
                {option.icon}
              </View>
            )}
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
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 36, // Reduced from 44 for a thinner appearance
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
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.background,
  },
});
