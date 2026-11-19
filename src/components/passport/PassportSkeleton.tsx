import { colors, radii, spacing } from '@/theme';
import { useEffect } from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface BoneProps {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

function Bone({ width, height, radius = radii.sm, style }: BoneProps) {
  return <View style={[styles.bone, { width, height, borderRadius: radius }, style]} />;
}

/**
 * PassportSkeleton
 *
 * Pulsing placeholder shaped like the loaded Passport screen (progress card,
 * page tabs, booklet page) so the layout doesn't jump when data arrives.
 */
export function PassportSkeleton() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.45, { duration: 800 }), -1, true);
  }, [opacity]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={pulseStyle}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading passport"
      testID="passport-skeleton"
    >
      {/* Progress card */}
      <View style={styles.summary}>
        <View style={styles.row}>
          <Bone width={24} height={24} radius={12} />
          <Bone width="35%" height={10} />
        </View>
        <Bone width="70%" height={20} style={styles.gapMd} />
        <Bone width="45%" height={12} style={styles.gapSm} />
        <Bone width="100%" height={8} radius={4} style={styles.gapMd} />
        <View style={styles.divider} />
        <View style={styles.chips}>
          {[76, 96, 92, 84, 80].map((w, i) => (
            <Bone key={i} width={w} height={28} radius={radii.chip} />
          ))}
        </View>
      </View>

      {/* Page tabs */}
      <View style={styles.tabs}>
        <Bone width={88} height={12} />
        <Bone width={88} height={12} />
      </View>

      {/* Booklet page */}
      <View style={styles.booklet}>
        <View style={styles.bookletHeader} />
        <View style={styles.bookletBody}>
          <View style={styles.row}>
            <Bone width={96} height={128} radius={radii.sm} />
            <View style={styles.fields}>
              <Bone width="100%" height={48} radius={radii.md} />
              <Bone width="100%" height={48} radius={radii.md} />
            </View>
          </View>
          <Bone width="100%" height={48} radius={radii.md} style={styles.gapSm} />
          <Bone width="100%" height={48} radius={radii.md} style={styles.gapSm} />
        </View>
        <View style={styles.bookletFooter} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: colors.passportFooter,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  gapSm: {
    marginTop: spacing.sm,
  },
  gapMd: {
    marginTop: spacing.md,
  },
  summary: {
    backgroundColor: colors.passportCream,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
    padding: spacing.base,
  },
  divider: {
    height: 1,
    backgroundColor: colors.passportPaperBorder,
    marginVertical: spacing.base,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: colors.passportPaperBorder,
  },
  booklet: {
    marginTop: spacing.base,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
    overflow: 'hidden',
  },
  bookletHeader: {
    height: 60,
    backgroundColor: colors.passportLeather,
    opacity: 0.85,
  },
  bookletBody: {
    backgroundColor: colors.passportCream,
    padding: spacing.base,
  },
  fields: {
    flex: 1,
    gap: spacing.sm,
  },
  bookletFooter: {
    height: 34,
    backgroundColor: colors.passportFooter,
  },
});
