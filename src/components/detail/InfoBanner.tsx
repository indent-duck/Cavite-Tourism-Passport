import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  testID?: string;
}

/**
 * Tinted status banner: icon, bold title, one-line explanation.
 * Same look as the reward detail status banner, for site and event screens
 * ("Stamp collected", "Happening now", ...).
 */
export function InfoBanner({ icon, leading, tint, color, title, body, testID }: InfoBannerProps) {
  return (
    <View
      style={[styles.banner, { backgroundColor: tint }]}
      accessible
      accessibilityLabel={body ? `${title}. ${body}` : title}
      testID={testID}
    >
      {leading ?? (icon && <Ionicons name={icon} size={24} color={color} />)}
      <View style={styles.text}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        {body && <Text style={styles.body}>{body}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    borderRadius: radii.card,
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
