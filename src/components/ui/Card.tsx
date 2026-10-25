import { colors, radii, shadows, spacing } from '@/theme';
import React from 'react';
import {
    Animated,
    Pressable,
    StyleProp,
    StyleSheet,
    ViewStyle,
} from 'react-native';

/**
 * Card Component
 * 
 * A container with white background, rounded corners, and subtle shadow.
 * Optionally pressable with spring animation feedback.
 * 
 * Validates: Requirements 1.2.3 (Card Component)
 */

export interface CardProps {
  /** Content to render inside the card */
  children: React.ReactNode;
  /** Optional press handler - makes the card touchable */
  onPress?: () => void;
  /** Optional custom styles to merge with base card styles */
  style?: StyleProp<ViewStyle>;
  /** Optional test identifier */
  testID?: string;
}

export function Card({ children, onPress, style, testID }: CardProps) {
  // Animated.Value pattern requires accessing .current during initialization
  // eslint-disable-next-line react-hooks/refs
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        style,
        onPress && { transform: [{ scale: scaleAnim }] },
      ]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressableContainer}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  pressableContainer: {
    // No styles needed - just a wrapper for press handling
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadows.card,
  },
});
