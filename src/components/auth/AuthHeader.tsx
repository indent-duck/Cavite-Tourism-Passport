import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface AuthHeaderProps {
  /** 1-indexed current step */
  step: number;
  totalSteps: number;
  onBack: () => void;
  /** Accessibility label for the back button */
  backLabel?: string;
}

/**
 * AuthHeader
 *
 * Shared top bar for multi-step auth flows: back button, "Step X of Y"
 * and a progress bar that animates forward from the previous step when
 * the screen mounts.
 */
export function AuthHeader({ step, totalSteps, onBack, backLabel = 'Go back' }: AuthHeaderProps) {
  const progress = useSharedValue((step - 1) / totalSteps);

  useEffect(() => {
    progress.value = withTiming(step / totalSteps, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, step, totalSteps]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.stepText}>
          Step {step} of {totalSteps}
        </Text>
      </View>

      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: totalSteps, now: step }}
      >
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 44px touch target, nudged left so the arrow lines up with the content edge
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: colors.surface,
  },
  stepText: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  track: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radii.full,
  },
});
