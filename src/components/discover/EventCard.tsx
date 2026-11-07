import { colors, radii, shadows, spacing, typography } from '@/theme';
import type { Event } from '@/data/types';
import { POINTS_PER_CATEGORY } from '@/data/types';
import { getEventStatus, formatDateBadge } from '@/lib/event-utils';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface EventCardProps {
  event: Event;
  onPress: (id: string) => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const status = getEventStatus(event);
  const dateBadge = formatDateBadge(event.startDate, event.endDate);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(event.id)}
    >
      {/* Photo area with date badge */}
      <View style={styles.photoContainer}>
        <View style={styles.photoPlaceholder}>
          <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{dateBadge}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={colors.textSecondary} />
          <Text style={styles.locationText}>{event.municipality}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">
          {event.description}
        </Text>

        {/* Tags row */}
        {(status === 'happening' || event.festivalStamp?.available) && (
          <View style={styles.tagsRow}>
            {status === 'happening' && (
              <View style={styles.happeningTag}>
                <Text style={styles.happeningTagText}>Happening now</Text>
              </View>
            )}
            {event.festivalStamp?.available && (
              <View style={styles.festivalChip}>
                <Text style={styles.festivalChipText}>
                  +{POINTS_PER_CATEGORY.Festival} pts
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.8,
  },
  photoContainer: {
    position: 'relative',
  },
  photoPlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  dateBadgeText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.base,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  happeningTag: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.button,
  },
  happeningTagText: {
    ...typography.labelMedium,
    color: colors.background,
  },
  festivalChip: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.button,
  },
  festivalChipText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
});
