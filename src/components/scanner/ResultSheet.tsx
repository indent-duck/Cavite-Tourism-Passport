import { Button } from '@/components/ui/Button';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Result Sheet
 *
 * The shared frame for every scanner result popup, so they all look and
 * behave the same: a centered card over a dimmed backdrop that springs in,
 * with a tone-colored icon, title, message, an optional body, and one or two
 * buttons. Same frame as the app's other dialogs (claim, log out, feedback).
 *
 * Opening it plays the tone's haptic (success, warning or error): the user is
 * usually looking at the QR code, not the screen, when a result comes back.
 *
 * Tapping the backdrop or pressing Android back calls `onDismiss`, so the
 * parent's state always matches what's on screen.
 *
 * Also exports the body pieces the popups share (ResultPanel, ResultInfoRow,
 * ResultNote, ResultDivider) so panels, rows and notes match across popups.
 */

type IconName = keyof typeof Ionicons.glyphMap;

export type ResultTone = 'success' | 'error' | 'warning' | 'info';

/** `tint` is the icon circle background, `ink` the icon color */
const TONES = {
  success: {
    tint: colors.successLight,
    ink: colors.success,
    haptic: Haptics.NotificationFeedbackType.Success,
  },
  error: {
    tint: colors.errorTint,
    ink: colors.error,
    haptic: Haptics.NotificationFeedbackType.Error,
  },
  warning: {
    tint: colors.accentTint,
    ink: colors.accent,
    haptic: Haptics.NotificationFeedbackType.Warning,
  },
  info: {
    tint: colors.primaryTint,
    ink: colors.primary,
    haptic: Haptics.NotificationFeedbackType.Warning,
  },
} as const;

/** Quick settle with a hint of overshoot */
const CARD_SPRING = { damping: 18, stiffness: 260 };

export interface ResultAction {
  title: string;
  onPress: () => void;
  testID?: string;
}

export interface ResultSheetProps {
  visible: boolean;
  /** Tapping outside the popup or pressing back */
  onDismiss: () => void;
  /** Colors the icon and picks the haptic played when the popup opens */
  tone: ResultTone;
  /** Header icon; not shown when `hero` is given */
  icon?: IconName;
  /** Small badge on the icon's corner, e.g. 'close' on a rejected code */
  badge?: IconName;
  /** Replaces the icon, e.g. the collected stamp */
  hero?: ReactNode;
  title: string;
  message?: ReactNode;
  /** Content between the message and the buttons */
  children?: ReactNode;
  primaryAction: ResultAction;
  /** Text button under the primary one */
  secondaryAction?: ResultAction;
}

export function ResultSheet({
  visible,
  onDismiss,
  tone,
  icon,
  badge,
  hero,
  title,
  message,
  children,
  primaryAction,
  secondaryAction,
}: ResultSheetProps) {
  const insets = useSafeAreaInsets();
  const palette = TONES[tone];

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(TONES[tone].haptic);
    }
  }, [visible, tone]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDismiss}
    >
      <View
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + spacing.base,
            paddingBottom: insets.bottom + spacing.base,
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityLabel="Close"
          accessibilityRole="button"
        />

        <AnimatedCard>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {hero ??
              (icon && (
                <View style={[styles.iconCircle, { backgroundColor: palette.tint }]}>
                  <Ionicons name={icon} size={34} color={palette.ink} />
                  {badge && (
                    <View style={[styles.iconBadge, { backgroundColor: palette.ink }]}>
                      <Ionicons name={badge} size={14} color={colors.background} />
                    </View>
                  )}
                </View>
              ))}

            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}

            {children ? <View style={styles.body}>{children}</View> : null}

            <View style={styles.actions}>
              <Button
                title={primaryAction.title}
                onPress={primaryAction.onPress}
                variant="primary"
                fullWidth
                testID={primaryAction.testID}
              />
              {secondaryAction && (
                <Button
                  title={secondaryAction.title}
                  onPress={secondaryAction.onPress}
                  variant="text"
                  fullWidth
                  testID={secondaryAction.testID}
                />
              )}
            </View>
          </ScrollView>
        </AnimatedCard>
      </View>
    </Modal>
  );
}

/**
 * The card springs up into place while the modal fades in. It mounts each
 * time the modal opens, so the entrance replays for every result. Skipped
 * when the system's reduce-motion setting is on.
 */
function AnimatedCard({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const entrance = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    entrance.value = withSpring(1, CARD_SPRING);
  }, [entrance]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - entrance.value) * 24 },
      { scale: 0.94 + entrance.value * 0.06 },
    ],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]} accessibilityViewIsModal>
      {children}
    </Animated.View>
  );
}

// ============================================================================
// Body pieces
// ============================================================================

/** Gray rounded panel that groups related details */
export function ResultPanel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

/** Hairline between rows inside a ResultPanel */
export function ResultDivider() {
  return <View style={styles.divider} />;
}

export interface ResultInfoRowProps {
  icon: IconName;
  /** Small caps label, e.g. 'TARGET SITE' */
  label: string;
  value: string;
  /** Second line under the value, e.g. the municipality */
  detail?: string;
  /** Icon and chip color; must be a 6-digit hex */
  color?: string;
}

/** Icon chip with a label and value, e.g. the site a code belongs to */
export function ResultInfoRow({
  icon,
  label,
  value,
  detail,
  color = colors.primary,
}: ResultInfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoChip, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
        {detail ? (
          <Text style={styles.infoDetail} numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export interface ResultNoteProps {
  icon: IconName;
  /**
   * 'neutral' (default) is plain gray text for background info;
   * a tone gives the note a tinted background for something to act on.
   */
  tone?: ResultTone | 'neutral';
  children: ReactNode;
}

/** One line of guidance with a leading icon */
export function ResultNote({ icon, tone = 'neutral', children }: ResultNoteProps) {
  if (tone === 'neutral') {
    return (
      <View style={styles.note}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
        <Text style={styles.noteText}>{children}</Text>
      </View>
    );
  }

  const palette = TONES[tone];
  return (
    <View style={[styles.note, styles.noteTinted, { backgroundColor: palette.tint }]}>
      <Ionicons name={icon} size={18} color={palette.ink} />
      <Text style={[styles.noteText, styles.noteTextTinted]}>{children}</Text>
    </View>
  );
}

const ICON_SIZE = 72;
const BADGE_SIZE = 26;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.scrim,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '100%',
    backgroundColor: colors.background,
    borderRadius: radii.card + 4,
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 0,
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
  },

  // Header
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  iconBadge: {
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
    ...typography.headlineMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  body: {
    alignSelf: 'stretch',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },

  // Panel
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoChip: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
  infoDetail: {
    ...typography.bodySmall,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Note
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  noteTinted: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  noteText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  noteTextTinted: {
    fontFamily: 'Inter_500Medium',
    color: colors.text,
  },
});
