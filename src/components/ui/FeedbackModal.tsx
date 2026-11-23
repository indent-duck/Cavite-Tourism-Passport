import { Button } from '@/components/ui/Button';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

const TONES: Record<
  'success' | 'neutral' | 'error',
  { background: string; icon: string; badge: string; badgeIcon: IconName }
> = {
  success: {
    background: colors.successLight,
    icon: colors.success,
    badge: colors.success,
    badgeIcon: 'checkmark',
  },
  neutral: {
    background: colors.surface,
    icon: colors.textSecondary,
    badge: colors.success,
    badgeIcon: 'checkmark',
  },
  error: {
    background: colors.errorTint,
    icon: colors.error,
    badge: colors.error,
    badgeIcon: 'alert',
  },
};

export interface FeedbackContentProps {
  /** What the action was about, e.g. 'lock-closed' for a password change */
  icon: IconName;
  /**
   * 'success' (green) by default; 'neutral' (gray) for removals like a
   * deleted account; 'error' (red, "!" badge) when the action didn't go through
   */
  tone?: keyof typeof TONES;
  title: string;
  message: string;
  /** Optional detail pill under the message, e.g. the saved name or a session hint */
  note?: { icon: IconName; text: string };
  buttonTitle: string;
  onPress: () => void;
  testID?: string;
}

/**
 * FeedbackContent
 *
 * The body of a result popup: icon with a badge (green check, or a red "!"
 * when the action didn't go through), title, message, optional note pill,
 * and one button.
 * FeedbackModal wraps it in a centered dialog; a sheet with its own success
 * step can render it directly so both look the same.
 */
export function FeedbackContent({
  icon,
  tone = 'success',
  title,
  message,
  note,
  buttonTitle,
  onPress,
  testID,
}: FeedbackContentProps) {
  const palette = TONES[tone];

  return (
    <View style={styles.content} testID={testID}>
      <View style={[styles.iconCircle, { backgroundColor: palette.background }]}>
        <Ionicons name={icon} size={32} color={palette.icon} />
        <View style={[styles.badge, { backgroundColor: palette.badge }]}>
          <Ionicons name={palette.badgeIcon} size={14} color={colors.background} />
        </View>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.message}>{message}</Text>

      {note ? (
        <View style={styles.note}>
          <Ionicons name={note.icon} size={16} color={colors.textSecondary} />
          <Text style={styles.noteText} numberOfLines={1}>
            {note.text}
          </Text>
        </View>
      ) : null}

      <Button
        title={buttonTitle}
        variant="primary"
        fullWidth
        onPress={onPress}
        testID={testID ? `${testID}-button` : undefined}
      />
    </View>
  );
}

export interface FeedbackModalProps extends Omit<FeedbackContentProps, 'onPress'> {
  visible: boolean;
  /** The button, tapping outside, and Android back all call this: the action is already done */
  onDone: () => void;
}

/**
 * FeedbackModal
 *
 * Centered dialog with the result of an action: a confirmation when it
 * succeeds (password changed, details saved, account deleted), or why it
 * didn't go through (tone 'error', e.g. a reward that just sold out). Same
 * frame as the log out dialog: dimmed backdrop, white card, fades in.
 */
export function FeedbackModal({ visible, onDone, ...content }: FeedbackModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDone}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDone}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />
        <View style={styles.card} accessibilityViewIsModal>
          <FeedbackContent {...content} onPress={onDone} />
        </View>
      </View>
    </Modal>
  );
}

const ICON_SIZE = 72;
const BADGE_SIZE = 26;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    maxWidth: 320,
    width: '100%',
    padding: spacing.xl,
    ...shadows.card,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    marginTop: -spacing.base, // sits closer to the message than the button does
    marginBottom: spacing.xl,
  },
  noteText: {
    ...typography.bodySmall,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
    flexShrink: 1,
  },
});
