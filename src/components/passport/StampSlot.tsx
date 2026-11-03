import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '@/theme';
import { Category, Event, Site, Stamp } from '@/data/types';

interface StampSlotProps {
  site: Site | Event;
  stamp: Stamp | undefined;
  category: Category;
  siteId: string;
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
function formatStampDate(date: Date): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
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
 * Extract site name and municipality from Site or Event
 */
function getSiteInfo(site: Site | Event): { name: string; municipality: string } {
  if ('municipality' in site) {
    return { name: site.name, municipality: site.municipality };
  }
  // Event type - extract municipality from location
  return { name: site.title, municipality: site.location };
}

/**
 * Get points for category or event
 */
function getPoints(site: Site | Event): number {
  if ('category' in site) {
    // Site - use category points
    const categoryPoints: Record<Category, number> = {
      Dining: 150,
      Staycation: 200,
      Adventure: 100,
      Heritage: 50,
      Festival: 50,
    };
    return categoryPoints[site.category];
  }
  // Event - use festival stamp bonus
  return site.festivalStamp?.pointsBonus || 50;
}

export function StampSlot({ site, stamp, category, siteId }: StampSlotProps) {
  const isCollected = !!stamp;
  const categoryColor = getCategoryColor(category);
  const { name, municipality } = getSiteInfo(site);
  const points = getPoints(site);
  const rotation = isCollected ? hashStringToRotation(siteId) : 0;

  if (isCollected) {
    // Collected stamp slot
    return (
      <View
        style={[
          styles.slot,
          styles.collectedSlot,
          { borderColor: categoryColor, transform: [{ rotate: `${rotation}deg` }] },
        ]}
      >
        {/* Category label */}
        <Text
          style={[
            styles.categoryLabel,
            { color: categoryColor, borderColor: categoryColor },
          ]}
        >
          {category.toUpperCase()}
        </Text>

        {/* Site name */}
        <Text style={styles.siteName} numberOfLines={2}>
          {name}
        </Text>

        {/* Municipality */}
        <Text style={styles.municipality} numberOfLines={1}>
          {municipality}
        </Text>

        {/* Date */}
        <Text style={styles.date}>{formatStampDate(stamp.collectedAt)}</Text>

        {/* Points */}
        <Text style={[styles.points, { color: categoryColor }]}>+{points} pts</Text>

        {/* Stamped badge */}
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.stampedText}>Stamped</Text>
        </View>
      </View>
    );
  }

  // Uncollected stamp slot
  return (
    <View style={[styles.slot, styles.uncollectedSlot]}>
      {/* Lock icon */}
      <Ionicons
        name="lock-closed"
        size={20}
        color={colors.textSecondary}
        style={styles.lockIcon}
      />

      {/* Site name */}
      <Text style={styles.uncollectedSiteName} numberOfLines={2}>
        {name}
      </Text>

      {/* Municipality */}
      <Text style={styles.uncollectedMunicipality} numberOfLines={1}>
        {municipality}
      </Text>

      {/* Points badge */}
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsBadgeText}>+{points} pts</Text>
      </View>

      {/* Uncollected badge */}
      <View style={styles.statusBadge}>
        <Ionicons name="ellipse-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.uncollectedText}>Uncollected</Text>
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
  collectedSlot: {
    backgroundColor: colors.passportCream,
  },
  uncollectedSlot: {
    backgroundColor: colors.background,
    borderColor: colors.textSecondary,
  },
  categoryLabel: {
    ...typography.labelSmall,
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
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
  lockIcon: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  uncollectedSiteName: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  uncollectedMunicipality: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  pointsBadge: {
    backgroundColor: colors.accent,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  pointsBadgeText: {
    ...typography.labelSmall,
    color: colors.background,
  },
  uncollectedText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
});
