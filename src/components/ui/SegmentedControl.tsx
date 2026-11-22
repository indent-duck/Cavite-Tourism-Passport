import { colors, radii, shadows, spacing, typography } from "@/theme";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface SegmentedControlOption<T extends string = string> {
  label: string;
  value: T;
  /** Draws the option's icon in the given color (it changes with selection) */
  icon?: (color: string) => ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  testID?: string;
}

const TRACK_PADDING = spacing.xs;
const SLIDE = { duration: 250, easing: Easing.out(Easing.cubic) };

const INACTIVE_COLOR = colors.textSecondary;
const ACTIVE_COLOR = colors.background;

/**
 * SegmentedControl Component
 *
 * A row of options on a light navy track, with a raised navy pill that
 * slides to the selected option.
 *
 * The pill carries its own white copy of every label, clipped to its edges
 * and shifted back by the pill's offset so it lines up with the grey labels
 * underneath. A label turns white exactly as the pill passes over it, and
 * it doesn't matter that Android draws the pill (it has elevation) above the
 * grey labels. The pill ignores touches, so taps reach the options below.
 */
export function SegmentedControl<T extends string = string>({
  options,
  selectedValue,
  onValueChange,
  testID,
}: SegmentedControlProps<T>) {
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === selectedValue),
  );
  const segmentWidth =
    trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / options.length : 0;
  const isMeasured = segmentWidth > 0;

  const offset = useSharedValue(0);
  // Where the pill is headed. A press starts the slide right away instead of
  // waiting for the screen to re-render with the new selection, which takes
  // longer on a heavy screen (Explore) and made its slide start late. The
  // effect then finds the pill already on its way and leaves it alone.
  const pillTarget = useRef<number | null>(null);

  // Selection changes that don't come from a press (e.g. Discover's
  // "View all"), and width changes
  useEffect(() => {
    if (segmentWidth === 0) return;
    const x = selectedIndex * segmentWidth;
    if (pillTarget.current !== x) {
      pillTarget.current = x;
      offset.set(withTiming(x, SLIDE));
    }
  }, [offset, selectedIndex, segmentWidth]);

  const handlePress = (index: number, value: T) => {
    const x = index * segmentWidth;
    if (segmentWidth > 0 && pillTarget.current !== x) {
      pillTarget.current = x;
      offset.set(withTiming(x, SLIDE));
    }
    onValueChange(value);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // First measurement: place the pill without sliding in from the left
    if (trackWidth === 0) {
      const x = selectedIndex * ((width - TRACK_PADDING * 2) / options.length);
      pillTarget.current = x;
      offset.set(x);
    }
    setTrackWidth(width);
  };

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.get() }],
  }));
  // Cancels the pill's movement so the white labels stay put
  const activeLabelsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -offset.get() }],
  }));

  return (
    <View style={styles.container} onLayout={handleLayout} testID={testID}>
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue;
        // Until the track is measured there's no pill, so the selected
        // option draws its own
        const showActive = isSelected && !isMeasured;

        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.option,
              showActive && styles.optionActive,
              pressed && styles.optionPressed,
            ]}
            onPress={() => handlePress(index, option.value)}
            testID={testID ? `${testID}-option-${option.value}` : undefined}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
          >
            <OptionContent
              option={option}
              color={showActive ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          </Pressable>
        );
      })}

      {isMeasured && (
        <Animated.View
          style={[styles.pill, { width: segmentWidth }, pillStyle]}
          // Visual only: screen readers get the options above
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <View style={styles.pillClip}>
            <Animated.View
              style={[
                styles.activeLabels,
                { width: segmentWidth * options.length },
                activeLabelsStyle,
              ]}
            >
              {options.map((option) => (
                <View key={option.value} style={styles.option}>
                  <OptionContent option={option} color={ACTIVE_COLOR} />
                </View>
              ))}
            </Animated.View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function OptionContent({
  option,
  color,
}: {
  option: SegmentedControlOption<string>;
  color: string;
}) {
  return (
    <>
      {option.icon && (
        <View style={styles.iconContainer}>{option.icon(color)}</View>
      )}
      <Text style={[styles.optionText, { color }]} numberOfLines={1}>
        {option.label}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  // Light navy track: the grey surface color barely shows against white
  container: {
    flexDirection: "row",
    backgroundColor: colors.primaryTint,
    borderRadius: radii.button,
    padding: TRACK_PADDING,
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
    borderRadius: radii.button,
  },
  // Stand-in for the pill before the track is measured
  optionActive: {
    backgroundColor: colors.primary,
  },
  optionPressed: {
    opacity: 0.7,
  },
  // Outer layer: color, shadow and movement. The inner layer clips, so the
  // shadow isn't clipped on iOS.
  pill: {
    position: "absolute",
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    left: TRACK_PADDING,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    pointerEvents: "none",
    ...shadows.card,
  },
  pillClip: {
    flex: 1,
    borderRadius: radii.button,
    overflow: "hidden",
  },
  activeLabels: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: "row",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    ...typography.labelMedium,
    fontFamily: "Inter_700Bold",
  },
});
