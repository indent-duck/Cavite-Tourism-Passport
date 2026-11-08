import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';

export interface ListMapSwitchProps {
  value: 'list' | 'map';
  onValueChange: (value: 'list' | 'map') => void;
}

/**
 * ListMapSwitch Component
 * 
 * A button that toggles between list and map view modes.
 * 
 * **Visual Specifications:**
 * - Button with icon and label
 * - Icon changes: "list" for list view, "map" for map view
 * - Label changes: "List" for list view, "Map" for map view
 * - Primary color for icon and text
 * - Surface background, border, rounded corners
 * - Height: 40px to match search bar
 * 
 * **Behavior:**
 * - Toggles between "list" and "map" on press
 * - Provides haptic feedback on press
 * - Shows current mode (not the mode it will switch to)
 * 
 * **Validates:** Requirements 2.2.3
 */
export function ListMapSwitch({
  value,
  onValueChange,
}: ListMapSwitchProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = value === 'list' ? 'map' : 'list';
    onValueChange(newValue);
  };

  const iconName = value === 'list' ? 'list' : 'map';
  const label = value === 'list' ? 'List' : 'Map';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      accessibilityLabel={`Switch to ${value === 'list' ? 'map' : 'list'} view`}
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
    >
      <Ionicons 
        name={iconName} 
        size={20} 
        color={colors.primary} 
      />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  containerPressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: '600',
  },
});
