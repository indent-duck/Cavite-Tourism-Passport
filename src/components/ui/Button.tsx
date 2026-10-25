import { colors, radii, shadows, spacing, typography } from '@/theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

/**
 * Button Component
 * 
 * A versatile button with multiple variants, loading states, and haptic feedback.
 * Supports four visual styles (accent, primary, outline, text) and two sizes.
 * 
 * Validates: Requirements 1.2.1 (Button Component)
 */

export interface ButtonProps {
  /**
   * Text displayed on the button
   */
  title: string;

  /**
   * Callback function when button is pressed
   */
  onPress: () => void;

  /**
   * Visual style variant of the button
   * - accent: Orange solid background (primary CTA)
   * - primary: Navy blue solid background
   * - outline: Transparent with border
   * - text: Text only, no background or border
   * @default 'accent'
   */
  variant?: 'accent' | 'primary' | 'outline' | 'text';

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the button is in loading state (shows spinner)
   * @default false
   */
  loading?: boolean;

  /**
   * Whether the button should take full width of container
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Size of the button
   * - default: 48px height
   * - compact: 40px height
   * @default 'default'
   */
  size?: 'default' | 'compact';

  /**
   * Optional icon to display before the title
   */
  icon?: React.ReactNode;

  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'accent',
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'default',
  icon,
  testID,
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      // Provide haptic feedback on press
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  // Determine button styles based on variant
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      height: size === 'compact' ? 40 : 48,
      ...(fullWidth && {
        alignSelf: 'stretch',
        width: '100%',
      }),
    };

    // Apply variant-specific styles
    switch (variant) {
      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: colors.accent,
          ...shadows.button,
        };
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.primary,
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  // Determine text styles based on variant
  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.buttonText,
    };

    switch (variant) {
      case 'accent':
      case 'primary':
        return {
          ...baseTextStyle,
          color: colors.background, // White text on solid backgrounds
        };
      case 'outline':
      case 'text':
        return {
          ...baseTextStyle,
          color: colors.primary, // Blue text on transparent backgrounds
        };
      default:
        return baseTextStyle;
    }
  };

  // Determine spinner color based on variant
  const getSpinnerColor = (): string => {
    switch (variant) {
      case 'accent':
      case 'primary':
        return colors.background; // White spinner on solid backgrounds
      case 'outline':
      case 'text':
        return colors.primary; // Blue spinner on transparent backgrounds
      default:
        return colors.background;
    }
  };

  const buttonStyle = getButtonStyle();
  const textStyle = getTextStyle();
  const spinnerColor = getSpinnerColor();

  // Apply disabled opacity
  const containerStyle = [
    buttonStyle,
    (disabled || loading) && styles.disabled,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.button, // 24px for pill shape
    paddingHorizontal: spacing.xl, // 24px
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontFamily: typography.fontFamily,
    ...typography.labelLarge,
  },
  disabled: {
    opacity: 0.4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm, // 8px spacing between icon and text
  },
});
