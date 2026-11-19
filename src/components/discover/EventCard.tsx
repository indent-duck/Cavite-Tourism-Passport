import { Card } from '@/components/ui/Card';
import type { Event } from '@/data/types';
import {
  formatEventDate,
  formatShortDateRange,
  getEventPoints,
  getEventStatus,
  getEventTiming,
} from '@/lib/event-utils';
import { colors, radii, spacing, typography } from '@/theme';
import { EVENT_CATEGORY_COLORS } from '@/theme/categories';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { EventDateBlock } from './EventDateBlock';
import { EventPhoto } from './EventPhoto';

export interface EventCardProps {
  event: Event;
  onPress: (id: string) => void;
}

/**
 * EventCard Component
 *
 * Event summary for the Discover tab's Events list. Laid out like SiteCard:
 * photo with the category tag (plus a date tile), then title, where and
 * when, a short description, and a footer with relative timing and points.
 */
export function EventCard({ event, onPress }: EventCardProps) {
  const isHappening = getEventStatus(event) === 'happening';
  const timing = getEventTiming(event);
  const points = getEventPoints(event);
  // Multi-day events lead with their date range; the tile only shows day one
  const schedule = event.endDate
    ? `${formatShortDateRange(event.startDate, event.endDate)} · ${event.time}`
    : event.time;

  const accessibilityLabel = [
    `${event.title}, ${event.category}`,
    `${formatEventDate(event.startDate, event.endDate)}, ${event.time}`,
    `${event.municipality}, ${event.venue}`,
    isHappening ? `Happening now, ${timing}` : timing,
    points !== undefined ? `Earn ${points} points` : undefined,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Card onPress={() => onPress(event.id)} accessibilityLabel={accessibilityLabel}>
      {/* Photo with category tag and date tile */}
      <View style={styles.photoContainer}>
        <EventPhoto event={event} iconSize={48} />
        <View
          style={[styles.categoryTag, { backgroundColor: EVENT_CATEGORY_COLORS[event.category] }]}
        >
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        <EventDateBlock date={event.startDate} variant="raised" style={styles.dateBlock} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            <Text style={styles.metaStrong}>{event.municipality}</Text> · {event.venue}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={1}>
            {schedule}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.timing}>
            {isHappening && <View style={styles.liveDot} />}
            <Text style={[styles.timingText, isHappening && styles.timingTextLive]}>
              {isHappening ? `Happening now · ${timing}` : timing}
            </Text>
          </View>
          {points !== undefined && <Text style={styles.points}>+{points} pts</Text>}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  categoryTag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  categoryText: {
    ...typography.labelSmall,
    color: colors.background,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
  },
  dateBlock: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  content: {
    padding: spacing.base,
    gap: spacing.xs,
  },
  title: {
    ...typography.titleMedium,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  metaStrong: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  timing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  timingText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  timingTextLive: {
    color: colors.successDark,
  },
  points: {
    ...typography.labelLarge,
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
});
