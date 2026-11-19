import { spacing } from '@/theme';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KeyboardFooterProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Reports the footer's height, e.g. so a form can keep content above it */
  onHeightChange?: (height: number) => void;
}

/**
 * KeyboardFooter
 *
 * Bottom bar (e.g. a form's submit button) that sits at the bottom of the
 * screen and rides on top of the on-screen keyboard while it is open.
 * Must be the last child of a full-height screen.
 */
export function KeyboardFooter({ children, style, onHeightChange }: KeyboardFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardStickyView
      // The footer sits above the bottom safe area (or pads for it itself),
      // so drop that gap when it is lifted onto the keyboard
      offset={{ closed: 0, opened: insets.bottom }}
      onLayout={(event) => onHeightChange?.(event.nativeEvent.layout.height)}
      style={[styles.footer, style]}
    >
      {children}
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
});
