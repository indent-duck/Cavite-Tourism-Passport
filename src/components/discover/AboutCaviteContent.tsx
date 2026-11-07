import { CaviteMap } from '@/components/map/CaviteMap';
import { Button } from '@/components/ui/Button';
import type { Event } from '@/data/types';
import { useAboutCavite } from '@/hooks/useAboutCavite';
import { useEvents } from '@/hooks/useEvents';
import { useExpressways } from '@/hooks/useExpressways';
import { formatDateBadge, getEventStatus } from '@/lib/event-utils';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ExpresswayCard } from './ExpresswayCard';

export interface AboutCaviteContentProps {
  onEventPress: (id: string) => void;
}

export function AboutCaviteContent({ onEventPress }: AboutCaviteContentProps) {
  const [selectedExpresswayId, setSelectedExpresswayId] = useState<string | null>(null);

  const aboutCaviteQuery = useAboutCavite();
  const expresswaysQuery = useExpressways();
  const eventsQuery = useEvents();

  // Loading state - show while any query is loading
  if (aboutCaviteQuery.isLoading || expresswaysQuery.isLoading || eventsQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Error state - show if any query has error
  const error = aboutCaviteQuery.error || expresswaysQuery.error || eventsQuery.error;
  if (error) {
    const refetch = () => {
      aboutCaviteQuery.refetch();
      expresswaysQuery.refetch();
      eventsQuery.refetch();
    };

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Unable to load content</Text>
        <Button title="Retry" onPress={refetch} variant="primary" />
      </View>
    );
  }

  // Empty state - show if no data
  const aboutCavite = aboutCaviteQuery.data;
  const expressways = expresswaysQuery.data;
  const events = eventsQuery.data;

  if (!aboutCavite || !expressways || !events) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No content available</Text>
      </View>
    );
  }

  // Filter festivals: exclude Cultural events and past events
  const festivals = events
    .filter((event) => event.category === 'Festival')
    .filter((event) => getEventStatus(event) !== 'past')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Get selected expressway for map label
  const selectedExpressway = expressways.find((e) => e.id === selectedExpresswayId);
  const selectedLabel = selectedExpressway ? `Selected: ${selectedExpressway.name}` : undefined;

  return (
    <View style={styles.container}>
      {/* Text sections */}
      {aboutCavite.sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionHeading}>{section.heading}</Text>
          <Text style={styles.sectionContent}>{section.content}</Text>
        </View>
      ))}

      {/* Festival calendar */}
      <View style={styles.festivalCalendarSection}>
        <Text style={styles.festivalCalendarHeading}>Quick Festival Calendar</Text>
        {festivals.length === 0 ? (
          <Text style={styles.emptyText}>No festivals available at this time</Text>
        ) : (
          <View style={styles.festivalList}>
            {festivals.map((event) => (
              <FestivalCalendarItem
                key={event.id}
                event={event}
                onPress={() => onEventPress(event.id)}
              />
            ))}
          </View>
        )}
      </View>

      {/* Map section */}
      <View style={styles.mapSection}>
        <Text style={styles.mapHeading}>Expressway & Province Map</Text>
        <CaviteMap height={300} selectedLabel={selectedLabel} />
        
        {/* Legend */}
        <View style={styles.legend}>
          <LegendItem icon="business" label="Partner establishments" />
          <LegendItem icon="home" label="Heritage sites" />
          <LegendItem icon="restaurant" label="Signature food/product" />
        </View>
      </View>

      {/* Expressway cards */}
      <View style={styles.expresswayCards}>
        {expressways.map((expressway) => (
          <ExpresswayCard
            key={expressway.id}
            expressway={expressway}
            selected={expressway.id === selectedExpresswayId}
            onPress={(id) => setSelectedExpresswayId(id)}
          />
        ))}
      </View>
    </View>
  );
}

interface FestivalCalendarItemProps {
  event: Event;
  onPress: () => void;
}

function FestivalCalendarItem({ event, onPress }: FestivalCalendarItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.festivalItem,
        pressed && styles.festivalItemPressed,
      ]}
    >
      <View style={styles.festivalItemContent}>
        <Text style={styles.festivalItemTitle}>{event.title}</Text>
        <Text style={styles.festivalItemMunicipality}>{event.municipality}</Text>
      </View>
      <Text style={styles.festivalItemDate}>
        {formatDateBadge(event.startDate, event.endDate)}
      </Text>
    </Pressable>
  );
}

interface LegendItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

function LegendItem({ icon, label }: LegendItemProps) {
  return (
    <View style={styles.legendItem}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.base,
    paddingVertical: spacing.xxl,
  },
  errorText: {
    ...typography.bodyLarge,
    color: colors.error,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Text sections
  section: {
    gap: spacing.sm,
  },
  sectionHeading: {
    ...typography.headlineMedium,
    color: colors.text,
  },
  sectionContent: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  
  // Festival calendar
  festivalCalendarSection: {
    marginTop: spacing.xxl,
  },
  festivalCalendarHeading: {
    ...typography.headlineMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  festivalList: {
    gap: spacing.sm,
  },
  festivalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
  },
  festivalItemPressed: {
    opacity: 0.7,
  },
  festivalItemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  festivalItemTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  festivalItemMunicipality: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  festivalItemDate: {
    ...typography.labelMedium,
    color: colors.primary,
    marginLeft: spacing.md,
  },
  
  // Map section
  mapSection: {
    marginTop: spacing.xxl,
  },
  mapHeading: {
    ...typography.headlineMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  legendLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  
  // Expressway cards
  expresswayCards: {
    gap: spacing.md,
  },
});
