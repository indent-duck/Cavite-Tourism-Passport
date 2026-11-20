import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface AccordionRowProps {
  /** Question / heading shown in the always-visible row */
  title: string;
  /** Answer text revealed when open */
  body: string;
  isOpen: boolean;
  onToggle: () => void;
  /** Optional leading element, e.g. an icon chip */
  leading?: ReactNode;
  /**
   * Left padding of the revealed body so it lines up with the title column
   * @default spacing.base
   */
  bodyInset?: number;
  testID?: string;
}

/**
 * AccordionRow
 *
 * A single expandable row for grouped FAQ cards: rotating chevron and a
 * fade-in body. The parent owns which row is open (single-open accordions).
 */
export function AccordionRow({
  title,
  body,
  isOpen,
  onToggle,
  leading,
  bodyInset = spacing.base,
  testID,
}: AccordionRowProps) {
  const rotation = useSharedValue(isOpen ? 1 : 0);

  useEffect(() => {
    rotation.set(withTiming(isOpen ? 1 : 0, { duration: 200 }));
  }, [isOpen, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <View testID={testID}>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: isOpen }}
      >
        {leading}
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <Ionicons
            name="chevron-down"
            size={18}
            color={isOpen ? colors.primary : colors.textSecondary}
          />
        </Animated.View>
      </Pressable>
      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={[styles.body, { paddingLeft: bodyInset }]}
        >
          <Text style={styles.bodyText}>{body}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    minHeight: 56,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    flex: 1,
  },
  body: {
    paddingRight: spacing.base,
    paddingBottom: spacing.base,
    marginTop: -spacing.xs,
  },
  bodyText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
});
