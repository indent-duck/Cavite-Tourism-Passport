import { colors, radii, shadows, spacing, typography } from "@/theme";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface SegmentedControlOption<T extends string = string> {
  label: string;
  value: T;
  icon?: ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  testID?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  selectedValue,
  onValueChange,
  testID,
}: SegmentedControlProps<T>) {
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
              <View style={styles.iconContainer}>{option.icon}</View>
            )}
            <Text
              style={[styles.optionText, isSelected && styles.optionTextActive]}
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
  // Light navy track: the grey surface color barely shows against white
  container: {
    flexDirection: "row",
    backgroundColor: colors.primaryTint,
    borderRadius: radii.button,
    padding: spacing.xs,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  // Raised above the track
  optionActive: {
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    ...shadows.card,
  },
  optionPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    ...typography.labelMedium,
    fontFamily: "Inter_700Bold",
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.background,
  },
});
