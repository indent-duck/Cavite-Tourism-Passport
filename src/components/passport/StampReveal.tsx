import { colors, radii } from '@/theme';
import * as Haptics from 'expo-haptics';
import { ReactNode, useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/** Lets the navigation back from the scanner finish before the stamp lands */
const REVEAL_DELAY_MS = 450;

export interface StampHighlight {
  stampId: string;
  /** True for a freshly collected stamp: plays the "stamp slam" + haptic */
  celebrate: boolean;
  /** Changes on every scan so the same stamp can be highlighted again */
  key: string;
}

interface StampRevealProps {
  highlight?: StampHighlight;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * StampReveal
 *
 * Wraps a stamp slot. When highlighted, a new stamp drops onto the page
 * (scale + rotate settle with a success haptic) and an accent ring pulses
 * around it. Already-collected stamps only get the ring. Respects the
 * system reduce-motion setting.
 */
export function StampReveal({ highlight, style, children }: StampRevealProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const ring = useSharedValue(0);

  const highlightKey = highlight?.key;
  const celebrate = highlight?.celebrate ?? false;

  useEffect(() => {
    if (!highlightKey) return;

    if (celebrate && !reduceMotion) {
      scale.value = withSequence(
        withTiming(1.4, { duration: 0 }),
        withDelay(REVEAL_DELAY_MS, withSpring(1, { damping: 11, stiffness: 220 })),
      );
      rotate.value = withSequence(
        withTiming(-10, { duration: 0 }),
        withDelay(REVEAL_DELAY_MS, withSpring(0, { damping: 12, stiffness: 180 })),
      );
      opacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(REVEAL_DELAY_MS, withTiming(1, { duration: 120 })),
      );
    }

    ring.value = withDelay(
      REVEAL_DELAY_MS + 150,
      withRepeat(
        withSequence(withTiming(1, { duration: 250 }), withTiming(0, { duration: 650 })),
        3,
      ),
    );

    if (!celebrate) return;
    const hapticTimer = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, REVEAL_DELAY_MS + 120);
    return () => clearTimeout(hapticTimer);
  }, [highlightKey, celebrate, reduceMotion, scale, rotate, opacity, ring]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value }));

  return (
    <View style={style}>
      <Animated.View style={stampStyle}>{children}</Animated.View>
      <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    top: -3,
    right: -3,
    bottom: -3,
    left: -3,
    borderRadius: radii.md + 3,
    borderWidth: 2,
    borderColor: colors.accent,
  },
});
