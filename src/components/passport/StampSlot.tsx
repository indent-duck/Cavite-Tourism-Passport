import { Category, Stamp } from '@/data/types';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';

interface StampSlotProps {
  stamp: Stamp;
}

const MONO_FONT = Platform.select({ ios: 'Menlo', default: 'monospace' });

const CATEGORY_COLORS: Record<Category, string> = {
  Dining: colors.categoryDining,
  Staycation: colors.categoryStaycation,
  Adventure: colors.categoryAdventure,
  Heritage: colors.categoryHeritage,
  Festival: colors.categoryFestival,
};

const CATEGORY_ICONS: Record<Category, keyof typeof Ionicons.glyphMap> = {
  Dining: 'restaurant',
  Staycation: 'bed',
  Adventure: 'trail-sign',
  Heritage: 'library',
  Festival: 'sparkles',
};

/**
 * Hash a string to generate a deterministic rotation angle
 * @param str - String to hash (siteId)
 * @returns Rotation angle between -3 and 3 degrees
 */
function hashStringToRotation(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 7) - 3;
}

/**
 * Format date as "JAN 14, 2027"
 */
function formatStampDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[dateObj.getMonth()];
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Stamp slot component - shows a collected stamp as an inked passport stamp
 *
 * Displays:
 * - Category label above the stamp
 * - Double-ruled ink frame (color-coded by category) with category icon,
 *   site name, municipality, collection date, and points earned
 * - Stamped status with checkmark
 * - Deterministic rotation for a hand-stamped feel
 *
 * Validates: Requirements 2.7
 */
export function StampSlot({ stamp }: StampSlotProps) {
  const inkColor = CATEGORY_COLORS[stamp.siteCategory];
  const rotation = hashStringToRotation(stamp.siteId);

  return (
    <View style={styles.slot}>
      <Text style={[styles.categoryLabel, { color: inkColor }]} numberOfLines={1}>
        {stamp.siteCategory.toUpperCase()}
      </Text>

      {/* Ink stamp */}
      <View
        style={[
          styles.stampOuter,
          { borderColor: inkColor, transform: [{ rotate: `${rotation}deg` }] },
        ]}
      >
        <View style={[styles.stampInner, { borderColor: inkColor }]}>
          <Ionicons name={CATEGORY_ICONS[stamp.siteCategory]} size={18} color={inkColor} />

          <Text style={[styles.siteName, { color: inkColor }]} numberOfLines={2}>
            {stamp.siteName}
          </Text>

          <Text style={[styles.municipality, { color: inkColor }]} numberOfLines={1}>
            {stamp.municipality}
          </Text>

          <View style={[styles.datePill, { backgroundColor: `${inkColor}1A` }]}>
            <Text style={[styles.dateText, { color: inkColor }]}>
              {formatStampDate(stamp.collectedAt)}
            </Text>
          </View>

          <Text style={[styles.points, { color: inkColor }]}>+{stamp.pointsEarned} PTS</Text>
        </View>
      </View>

      {/* Status */}
      <View style={styles.statusRow}>
        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
        <Text style={styles.statusText}>Stamped</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '48.5%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.passportPaperBorder,
    backgroundColor: colors.passportPaper,
  },
  categoryLabel: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },

  // Ink stamp: solid outer ring + dashed inner ring
  stampOuter: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderRadius: radii.md + 4,
    padding: 3,
    opacity: 0.9,
  },
  stampInner: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 3,
    minHeight: 132,
    justifyContent: 'center',
  },
  siteName: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  municipality: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.75,
  },
  datePill: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: 2,
  },
  dateText: {
    fontFamily: MONO_FONT,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  points: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  statusText: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    color: colors.success,
  },
});
