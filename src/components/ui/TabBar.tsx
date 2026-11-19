import { TAB_BAR_HEIGHT } from '@/lib/constants';
import { colors, radii, shadows, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Custom bottom tab bar
 *
 * - Material-style active indicator pill behind the focused icon
 * - Raised orange Scan button with a white ring and its own label,
 *   so all five labels sit on the same baseline
 * - Emits `tabPress` so screens can react (e.g. scroll-to-top) and
 *   navigates through the navigator instead of pushing routes
 */

type IconName = keyof typeof Ionicons.glyphMap;

type TabConfig = {
  label: string;
  icon: IconName;
  iconFocused: IconName;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  explore: { label: 'Explore', icon: 'compass-outline', iconFocused: 'compass' },
  passport: { label: 'Passport', icon: 'book-outline', iconFocused: 'book' },
  scan: { label: 'Scan', icon: 'scan-outline', iconFocused: 'scan' },
  discover: { label: 'Discover', icon: 'calendar-outline', iconFocused: 'calendar' },
  account: { label: 'Account', icon: 'person-outline', iconFocused: 'person' },
};

const SCAN_ROUTE = 'scan';

const ICON_SIZE = 22;
const INDICATOR_WIDTH = 56;
const INDICATOR_HEIGHT = 30;
const SCAN_BUTTON_SIZE = 60;
const SCAN_RING_WIDTH = 4;
/** How far the Scan button rises above the top edge of the bar. */
const SCAN_OVERHANG =
  SCAN_BUTTON_SIZE - INDICATOR_HEIGHT - (TAB_BAR_HEIGHT - INDICATOR_HEIGHT - 18) / 2;

export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    // The wrapper reaches above the bar so the raised Scan button stays
    // tappable; `box-none` lets touches in the empty area hit the screen.
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { marginTop: -SCAN_OVERHANG, paddingTop: SCAN_OVERHANG }]}
    >
      <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
        <View style={styles.row} accessibilityRole="tablist">
          {state.routes.map((route, index) => {
            const config = TAB_CONFIG[route.name];
            if (!config) return null;

            if (route.name === SCAN_ROUTE) {
              return <ScanTab key={route.key} label={config.label} />;
            }

            const focused = state.index === index;

            const onPress = () => {
              const event = emitter.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                Haptics.selectionAsync();
                navigateToTab(route.key);
              }
            };

            const onLongPress = () => {
              emitter.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <TabItem
                key={route.key}
                config={config}
                focused={focused}
                onPress={onPress}
                onLongPress={onLongPress}
                testID={`${route.name}-tab-button`}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

type TabItemProps = {
  config: TabConfig;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  testID: string;
};

function TabItem({ config, focused, onPress, onLongPress, testID }: TabItemProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(focused ? 1 : 0, { duration: 220 }));
  }, [focused, progress]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [0.5, 1]) }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.textSecondary, colors.primary]),
  }));

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={config.label}
      accessibilityState={{ selected: focused }}
      testID={testID}
    >
      <View style={styles.iconSlot}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />
        <Ionicons
          name={focused ? config.iconFocused : config.icon}
          size={ICON_SIZE}
          color={focused ? colors.primary : colors.textSecondary}
        />
      </View>
      <Animated.Text
        style={[styles.label, focused ? styles.labelFocused : null, labelStyle]}
        numberOfLines={1}
      >
        {config.label}
      </Animated.Text>
    </Pressable>
  );
}

function ScanTab({ label }: { label: string }) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={styles.tab}
      onPressIn={() => {
        scale.set(withSpring(0.92, { damping: 15, stiffness: 300 }));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, { damping: 12, stiffness: 250 }));
      }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/scanner');
      }}
      accessibilityRole="button"
      accessibilityLabel="Scan a QR code"
      accessibilityHint="Opens the camera to collect a stamp"
      testID="scan-tab-button"
    >
      <View style={styles.iconSlot}>
        <Animated.View style={[styles.scanButton, buttonStyle]}>
          <Ionicons name="qr-code" size={26} color={colors.background} />
        </Animated.View>
      </View>
      <Text style={[styles.label, styles.scanLabel]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
  },
  bar: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    ...shadows.tabBar,
  },
  row: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.full,
    backgroundColor: colors.primaryTint,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  labelFocused: {
    fontFamily: 'Inter_700Bold',
  },
  scanLabel: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.accent,
  },
  scanButton: {
    position: 'absolute',
    bottom: 0,
    width: SCAN_BUTTON_SIZE,
    height: SCAN_BUTTON_SIZE,
    borderRadius: radii.full,
    borderWidth: SCAN_RING_WIDTH,
    borderColor: colors.background,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
});
