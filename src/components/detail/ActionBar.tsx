import { colors, spacing } from '@/theme';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ActionBarProps {
  /** Buttons; several are laid out side by side with equal width */
  children: ReactNode;
}

/**
 * Bottom action bar pinned below a detail screen's scroll view, clear of the
 * home indicator. Matches the reward detail screen's pinned action.
 */
export function ActionBar({ children }: ActionBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>{children}</View>
  );
}

/** Wrap each button in a multi-button bar so they share the width */
export function ActionBarItem({ children }: { children: ReactNode }) {
  return <View style={styles.item}>{children}</View>;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: {
    flex: 1,
  },
});
