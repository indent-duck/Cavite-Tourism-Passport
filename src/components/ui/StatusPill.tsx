import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

export type StatusPillTone = 'success' | 'neutral' | 'warning' | 'error';

export interface StatusPillProps {
  label: string;
  tone: StatusPillTone;
  /** Leading icon; a small dot is shown when omitted */
  icon?: IconName;
  testID?: string;
}

const TONES: Record<StatusPillTone, { background: string; icon: string; text: string }> = {
  success: { background: colors.successLight, icon: colors.success, text: colors.successDark },
  neutral: { background: colors.surface, icon: colors.textSecondary, text: colors.textSecondary },
  warning: { background: colors.accentTint, icon: colors.accent, text: colors.textTertiary },
  error: { background: colors.errorTint, icon: colors.error, text: colors.error },
};

/**
 * StatusPill
 *
 * Small rounded status label (e.g. "Active", "Verified", "Pending review")
 * with a leading icon or dot, tinted by tone.
 */
export function StatusPill({ label, tone, icon, testID }: StatusPillProps) {
  const palette = TONES[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.background }]} testID={testID}>
      {icon ? (
        <Ionicons name={icon} size={14} color={palette.icon} />
      ) : (
        <View style={[styles.dot, { backgroundColor: palette.icon }]} />
      )}
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
  },
});
