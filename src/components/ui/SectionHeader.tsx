import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

export interface SectionHeaderProps {
  title: string;
  /** Small uppercase label above the title */
  eyebrow?: string;
  /** Optional trailing link, e.g. "View all" */
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * SectionHeader Component
 *
 * Eyebrow + title with an optional trailing link. Keeps section headings on
 * long scrolling screens consistent in size and spacing.
 */
export function SectionHeader({ title, eyebrow, actionLabel, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titles}>
        {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      </View>

      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          hitSlop={spacing.sm}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    ...typography.labelSmall,
    color: colors.accent,
    letterSpacing: 1,
  },
  title: {
    ...typography.headlineMedium,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: colors.text,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: 4,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionText: {
    ...typography.labelLarge,
    color: colors.accent,
  },
});
