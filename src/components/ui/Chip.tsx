import { colors, radii, spacing, typography } from '@/theme';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  size?: 'default' | 'small';
  testID?: string;
}

/**
 * Chip Component
 * 
 * A pill-shaped button used for filters, categories, and toggles.
 * 
 * Visual specifications:
 * - Height: 36px (default), 32px (small)
 * - Border radius: 16px (pill shape)
 * - Unselected: white background, border, primary text
 * - Selected: primary blue background, white text, no border
 * - Padding: 12px horizontal (default), 8px horizontal (small)
 * - Icon spacing: 6px from text
 * 
 * Note: When providing an icon, ensure it uses the appropriate color:
 * - Unselected state: colors.primary
 * - Selected state: colors.background (white)
 * 
 * Usage:
 * ```tsx
 * <Chip label="Dining" selected onPress={() => {}} />
 * <Chip 
 *   label="Heritage" 
 *   icon={<Ionicons name="restaurant" size={16} color={colors.primary} />} 
 *   size="small" 
 * />
 * ```
 */
export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  size = 'default',
  testID,
}: ChipProps) {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const isSmall = size === 'small';
  const textColor = selected ? colors.background : colors.primary;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        isSmall ? styles.containerSmall : styles.containerDefault,
        selected ? styles.containerSelected : styles.containerUnselected,
        pressed && styles.containerPressed,
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <Text
        style={[
          styles.label,
          isSmall && styles.labelSmall,
          { color: textColor },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.chip,
  },
  containerDefault: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
  containerSmall: {
    height: 32,
    paddingHorizontal: spacing.sm,
  },
  containerUnselected: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerSelected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  containerPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: 6,
  },
  label: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
  labelSmall: {
    ...typography.labelMedium,
  },
});
