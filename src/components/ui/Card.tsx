import { colors, radii, shadows } from '@/theme';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

/**
 * Card Component
 *
 * The app's one card surface: white, rounded, with the standard card shadow.
 * When pressable it shrinks slightly while pressed.
 *
 * Two layers, so the shadow isn't clipped on iOS: the outer layer draws the
 * background, shadow and press animation (`style`); the inner layer clips
 * children such as edge-to-edge photos to the rounded corners
 * (`contentStyle`). There is no default padding, so put padding in
 * `contentStyle` or on children.
 *
 * Usage:
 * ```tsx
 * <Card onPress={open} accessibilityLabel="Aguinaldo Shrine">
 *   <Image ... />
 *   <View style={{ padding: spacing.base }}>...</View>
 * </Card>
 * ```
 */

export interface CardProps extends Omit<PressableProps, 'style' | 'children'> {
  children: React.ReactNode;
  /** Outer layer: size, margins, background/shadow overrides */
  style?: StyleProp<ViewStyle>;
  /** Inner layer, clipped to the card's rounded corners */
  contentStyle?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESSED_SCALE = 0.98;
const SPRING = { damping: 20, stiffness: 400 };

export function Card({
  children,
  style,
  contentStyle,
  onPress,
  onPressIn,
  onPressOut,
  ...pressableProps
}: CardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  if (!onPress) {
    return (
      <View style={[styles.card, style]} testID={pressableProps.testID}>
        {content}
      </View>
    );
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...pressableProps}
      onPress={onPress}
      onPressIn={(event) => {
        scale.set(withSpring(PRESSED_SCALE, SPRING));
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(event);
      }}
      style={[styles.card, style, animatedStyle]}
    >
      {content}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    ...shadows.card,
  },
  content: {
    borderRadius: radii.card,
    overflow: 'hidden',
  },
});
