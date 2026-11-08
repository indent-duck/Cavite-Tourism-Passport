import { Category, Stamp } from '@/data/types';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface StampSlotProps {
  stamp: Stamp;
}

/**
 * Hash a string to generate a deterministic rotation angle
 * @param str - String to hash (siteId)
 * @returns Rotation angle between -2 and 2 degrees
 */
function hashStringToRotation(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  // Map hash to range -2 to 2 degrees
  const rotation = (hash % 5) - 2;
  return rotation;
}

/**
 * Format date as "JAN 14, 2027"
 */
function formatStampDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Get category color from theme
 */
function getCategoryColor(category: Category): string {
  const categoryColors: Record<Category, string> = {
    Dining: colors.categoryDining,
    Staycation: colors.categoryStaycation,
    Adventure: colors.categoryAdventure,
    Heritage: colors.categoryHeritage,
    Festival: colors.categoryFestival,
  };
  return categoryColors[category];
}

/**
 * Stamp slot component - shows a collected stamp with category badge
 * 
 * Displays stamp in chronological order with:
 * - Category badge at top (color-coded)
 * - Site name and municipality
 * - Collection date (date only)
 * - Points earned
 * - Stamped status with checkmark
 * - Deterministic rotation for visual variety
 * 
 * Validates: Requirements 2.7
 */
export function StampSlot({ stamp }: StampSlotProps) {
  const categoryColor = getCategoryColor(stamp.siteCategory);
  const rotation = hashStringToRotation(stamp.siteId);

  return (
    <View
      style={[
        styles.slot,
        {
          borderColor: categoryColor,
          backgroundColor: `${categoryColor}10`, // 10% opacity tint
          transform: [{ rotate: `${rotation}deg` }],
        },
      ]}
    >
      {/* Category badge */}
      <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
        <Text style={styles.categoryBadgeText}>{stamp.siteCategory.toUpperCase()}</Text>
      </View>

      {/* Site name */}
      <Text style={styles.siteName} numberOfLines={2}>
        {stamp.siteName}
      </Text>

      {/* Municipality */}
      <Text style={styles.municipality} numberOfLines={1}>
        {stamp.municipality}
      </Text>

      {/* Date */}
      <Text style={styles.date}>{formatStampDate(stamp.collectedAt)}</Text>

      {/* Points */}
      <Text style={[styles.points, { color: categoryColor }]}>
        +{stamp.pointsEarned} pts
      </Text>

      {/* Stamped badge */}
      <View style={styles.statusBadge}>
        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
        <Text style={styles.stampedText}>Stamped</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '48%',
    padding: spacing.md,
    borderRadius: radii.chip,
    borderWidth: 2,
    borderStyle: 'dashed',
    minHeight: 140,
  },
  categoryBadge: {
    borderRadius: radii.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    ...typography.labelSmall,
    color: colors.background,
    fontWeight: '700',
  },
  siteName: {
    ...typography.labelMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  municipality: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  points: {
    ...typography.labelMedium,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stampedText: {
    ...typography.labelSmall,
    color: colors.success,
  },
});
