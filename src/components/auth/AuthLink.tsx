import { colors, spacing, typography } from '@/theme';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Link styling rule for auth screens:
 * - Orange (accent) is reserved for the main action: the solid submit button.
 * - Every text link is navy (primary) and bold.
 */
export const linkTextStyle: TextStyle = {
  ...typography.labelLarge,
  fontFamily: 'Inter_700Bold',
  color: colors.primary,
};

interface AuthLinkProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * AuthLink
 *
 * A standalone text link with a 44px-tall touch target.
 * For links inside a sentence, use a nested <Text onPress> with `linkTextStyle`.
 */
export function AuthLink({ title, onPress, disabled, style }: AuthLinkProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.link, style]}
      accessibilityRole="link"
      accessibilityState={{ disabled }}
    >
      {({ pressed }) => (
        <Text style={[linkTextStyle, (pressed || disabled) && styles.dimmed]}>{title}</Text>
      )}
    </Pressable>
  );
}

interface AuthSwitchPromptProps {
  prompt: string;
  linkTitle: string;
  onPress: () => void;
}

/**
 * AuthSwitchPrompt
 *
 * "Don't have an account? Sign up" row shown at the bottom of auth screens.
 */
export function AuthSwitchPrompt({ prompt, linkTitle, onPress }: AuthSwitchPromptProps) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchPrompt}>{prompt}</Text>
      <AuthLink title={linkTitle} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  dimmed: {
    opacity: 0.5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchPrompt: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
});
