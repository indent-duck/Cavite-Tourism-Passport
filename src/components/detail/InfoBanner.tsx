import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useEffectEvent, type ComponentProps, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface InfoBannerProps {
  /** Leading icon, drawn in `color`. Ignored when `leading` is given. */
  icon?: IconName;
  /** Custom leading element (e.g. a live dot) instead of an icon */
  leading?: ReactNode;
  /** Banner background */
  tint: string;
  /** Icon and title color */
  color: string;
  title: string;
  body?: string;
  /** Shows a close (X) button that calls this */
  onDismiss?: () => void;
  /**
   * Calls `onDismiss` after this long, with a bar along the bottom that
   * drains to show the time left
   */
  autoDismissMs?: number;
  testID?: string;
}

/**
 * Tinted status banner: icon, bold title, one-line explanation.
 * Same look as the reward detail status banner, for site and event screens
 * ("Stamp collected", "Happening now", ...).
 */
export function InfoBanner({
  icon,
  leading,
  tint,
  color,
  title,
  body,
  onDismiss,
  autoDismissMs,
  testID,
}: InfoBannerProps) {
  return (
    <View style={[styles.banner, { backgroundColor: tint }]} testID={testID}>
      {/* Grouped for screen readers; the close button stays outside so it
          can still be focused on its own */}
      <View style={styles.content} accessible accessibilityLabel={body ? `${title}. ${body}` : title}>
        {leading ?? (icon && <Ionicons name={icon} size={24} color={color} />)}
        <View style={styles.text}>
          <Text style={[styles.title, { color }]}>{title}</Text>
          {body && <Text style={styles.body}>{body}</Text>}
        </View>
      </View>
      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          style={({ pressed }) => pressed && styles.dismissPressed}
          hitSlop={spacing.sm}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          testID={testID && `${testID}-dismiss`}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      )}
      {onDismiss && autoDismissMs !== undefined && (
        <Countdown durationMs={autoDismissMs} color={color} onDone={onDismiss} />
      )}
    </View>
  );
}

/**
 * Thin bar along the banner's bottom edge that drains over `durationMs`,
 * then calls `onDone`. The bar and the timer start together, so the banner
 * closes as the bar empties.
 */
function Countdown({
  durationMs,
  color,
  onDone,
}: {
  durationMs: number;
  color: string;
  onDone: () => void;
}) {
  const remaining = useSharedValue(1);
  // A new onDone (e.g. a parent re-render) shouldn't restart the countdown
  const finish = useEffectEvent(onDone);

  useEffect(() => {
    // Not reduced: skipping to the end would show an empty bar for the whole
    // wait, and a slow linear drain is barely motion
    remaining.value = withTiming(0, {
      duration: durationMs,
      easing: Easing.linear,
      reduceMotion: ReduceMotion.Never,
    });
    const timer = setTimeout(finish, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, remaining]);

  // scaleX instead of width: no layout pass on every frame
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: remaining.value }],
  }));

  return (
    <Animated.View
      style={[styles.countdown, { backgroundColor: color }, barStyle]}
      importantForAccessibility="no"
    />
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radii.card,
    // Clips the countdown bar to the rounded corners
    overflow: 'hidden',
  },
  countdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    opacity: 0.6,
    transformOrigin: 'left',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dismissPressed: {
    opacity: 0.5,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
  },
  body: {
    ...typography.bodySmall,
    color: colors.text,
    lineHeight: 18,
  },
});
