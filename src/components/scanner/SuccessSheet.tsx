import type { Stamp } from '@/data/types';
import { colors, radii, spacing, typography } from '@/theme';
import { CATEGORY_COLORS } from '@/theme/categories';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { ResultSheet } from './ResultSheet';

/**
 * Success Result Sheet
 *
 * Displays stamp collected success modal with:
 * - The stamp, inked in its category color like it appears in the Passport
 *   (category, site name, municipality, verification code), pressing onto
 *   the card with a verified check
 * - Date and time collected
 * - Points earned and total balance
 * - "Dismiss" button, which opens the stamp in the Passport
 *
 * Matches design: design/screens/06-scanner/qr_modal_stamp_collected_success/screen.png
 */

export interface SuccessSheetProps {
  visible: boolean;
  /** Tapping outside the modal or pressing back */
  onDismiss: () => void;
  stamp: Stamp;
  totalBalance: number;
  onViewPassport: () => void;
}

export function SuccessSheet({
  visible,
  onDismiss,
  stamp,
  totalBalance,
  onViewPassport,
}: SuccessSheetProps) {
  return (
    <ResultSheet
      visible={visible}
      onDismiss={onDismiss}
      tone="success"
      hero={<CollectedStamp stamp={stamp} />}
      title="Stamp Collected!"
      message="You have earned exploration points for this visit."
      primaryAction={{ title: 'Dismiss', onPress: onViewPassport }}
    >
      <View style={styles.points}>
        <View style={styles.reward}>
          <View style={styles.starChip}>
            <Ionicons name="star" size={18} color={colors.accent} />
          </View>
          <View style={styles.pointsText}>
            <Text style={styles.pointsLabel}>VISIT REWARD</Text>
            <Text style={styles.rewardValue} numberOfLines={1} adjustsFontSizeToFit>
              +{stamp.pointsEarned.toLocaleString('en-US')}
              <Text style={styles.rewardUnit}> pts</Text>
            </Text>
          </View>
        </View>

        <View style={styles.balance}>
          <Text style={styles.pointsLabel}>TOTAL BALANCE</Text>
          <Text style={styles.balanceValue} numberOfLines={1} adjustsFontSizeToFit>
            {totalBalance.toLocaleString('en-US')}
            <Text style={styles.balanceUnit}> pts</Text>
          </Text>
        </View>
      </View>
    </ResultSheet>
  );
}

// ============================================================================
// Stamp hero
// ============================================================================

const STAMP_SIZE = 176;
const HALO_SIZE = STAMP_SIZE + 36;
/** Resting tilt, for a hand-stamped look */
const STAMP_TILT_DEG = -4;
/** Waits for the card to settle before the stamp lands */
const STAMP_DELAY_MS = 120;
const STAMP_SPRING = { damping: 12, stiffness: 200 };
const BADGE_DELAY_MS = STAMP_DELAY_MS + 260;
const BADGE_SPRING = { damping: 10, stiffness: 260 };

const MONO_FONT = Platform.select({ ios: 'Menlo', default: 'monospace' });

/** "March 15, 2027 · 10:24 AM" */
function formatCollectedAt(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const day = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  return `${day} · ${time}`;
}

/**
 * The collected stamp: double ink ring in the category color on a soft halo.
 * It presses down onto the card (scales in from above and settles at a
 * slight tilt), then the verified check pops in. Static with reduce motion.
 */
function CollectedStamp({ stamp }: { stamp: Stamp }) {
  const ink = CATEGORY_COLORS[stamp.siteCategory] ?? colors.primary;
  const reduceMotion = useReducedMotion();
  const press = useSharedValue(reduceMotion ? 1 : 0);
  const check = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    press.value = withDelay(STAMP_DELAY_MS, withSpring(1, STAMP_SPRING));
    check.value = withDelay(BADGE_DELAY_MS, withSpring(1, BADGE_SPRING));
  }, [press, check]);

  const stampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(press.value, [0, 0.4], [0, 1], Extrapolation.CLAMP),
    transform: [
      { scale: 1.35 - press.value * 0.35 },
      { rotate: `${STAMP_TILT_DEG - (1 - press.value) * 10}deg` },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(check.value, [0, 0.3], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: check.value }],
  }));

  return (
    <View style={styles.hero}>
      <View style={[styles.halo, { backgroundColor: `${ink}12` }]}>
        <Animated.View style={[styles.stampOuter, { borderColor: ink }, stampStyle]}>
          <View style={[styles.stampInner, { borderColor: ink }]}>
            <Text style={[styles.stampCategory, { color: ink }]} numberOfLines={1}>
              {stamp.siteCategory.toUpperCase()}
            </Text>
            <Text
              style={[styles.stampName, { color: ink }]}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {stamp.siteName}
            </Text>
            <Text style={[styles.stampPlace, { color: ink }]} numberOfLines={1}>
              {stamp.municipality ? `${stamp.municipality} • Cavite` : 'Cavite'}
            </Text>
            <View style={[styles.stampCode, { backgroundColor: `${ink}1A` }]}>
              <Text style={[styles.stampCodeText, { color: ink }]}>
                #{stamp.id.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.verifiedBadge, checkStyle]}>
          <Ionicons name="checkmark" size={18} color={colors.background} />
        </Animated.View>
      </View>

      <View style={styles.collectedAt}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.collectedAtText}>{formatCollectedAt(stamp.collectedAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Stamp hero
  hero: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  halo: {
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampOuter: {
    width: STAMP_SIZE,
    height: STAMP_SIZE,
    borderRadius: radii.full,
    borderWidth: 2.5,
    padding: 4,
    backgroundColor: colors.background,
  },
  stampInner: {
    flex: 1,
    borderRadius: radii.full,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 3,
  },
  stampCategory: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  stampName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    lineHeight: 19,
    textAlign: 'center',
  },
  stampPlace: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.6,
    opacity: 0.8,
  },
  stampCode: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: 2,
  },
  stampCodeText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    position: 'absolute',
    right: (HALO_SIZE - STAMP_SIZE) / 2 + 6,
    bottom: (HALO_SIZE - STAMP_SIZE) / 2 + 6,
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectedAt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  collectedAtText: {
    ...typography.bodySmall,
    fontFamily: 'Inter_500Medium',
    color: colors.textSecondary,
  },

  // Points
  points: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    gap: spacing.md,
  },
  reward: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  starChip: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: {
    flexShrink: 1,
  },
  pointsLabel: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  rewardValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
    // Dark orange: accent orange is too light for text on the gray panel
    color: colors.textTertiary,
  },
  rewardUnit: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  balance: {
    alignItems: 'flex-end',
  },
  balanceValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 28,
    color: colors.primary,
  },
  balanceUnit: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
});
