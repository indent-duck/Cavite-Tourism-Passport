import { AboutCaviteContent } from '@/components/discover/AboutCaviteContent';
import { EventCard } from '@/components/discover/EventCard';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useEvents } from '@/hooks/useEvents';
import { useExpressways } from '@/hooks/useExpressways';
import { getEventStatus } from '@/lib/event-utils';
import { colors, spacing, typography } from '@/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Discover Tab Screen
 * 
 * Toggle between Events view (festival/event cards) and About Cavite view (info sections).
 * Events are filtered to exclude past events and sorted chronologically.
 */
export default function DiscoverScreen() {
  const [selectedView, setSelectedView] = useState<'events' | 'about'>('events');
  const eventsQuery = useEvents();
  const expresswaysQuery = useExpressways();

  return (
    <ScreenContainer
      scrollable={true}
      edges={['left', 'right']}
      withTabBarPadding={true}
      testID="discover-screen"
    >
      {/* Segmented control */}
      <View style={styles.segmentedControlContainer}>
        <SegmentedControl
          options={[
            { label: 'Events', value: 'events' },
            { label: 'About Cavite', value: 'about' },
          ]}
          selectedValue={selectedView}
          onValueChange={(value) => setSelectedView(value as 'events' | 'about')}
          testID="discover-segmented-control"
        />
      </View>

      {/* Conditional render based on selected view */}
      {selectedView === 'events' ? (
        <EventsView query={eventsQuery} />
      ) : (
        <AboutCaviteView
          eventsQuery={eventsQuery}
          expresswaysQuery={expresswaysQuery}
        />
      )}
    </ScreenContainer>
  );
}

interface EventsViewProps {
  query: ReturnType<typeof useEvents>;
}

function EventsView({ query }: EventsViewProps) {
  // Loading state
  if (query.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Error state
  if (query.isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Unable to load events</Text>
        <Button title="Retry" onPress={() => query.refetch()} variant="primary" />
      </View>
    );
  }

  // Filter and sort events
  const events = query.data || [];
  const upcomingAndHappeningEvents = events
    .filter((event) => getEventStatus(event) !== 'past')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Empty state
  if (upcomingAndHappeningEvents.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No events at this time</Text>
      </View>
    );
  }

  return (
    <View style={styles.eventsContainer}>
      {/* Section heading */}
      <View style={styles.headingSection}>
        <Text style={styles.heading}>Provincial Festivals & Events</Text>
        <Text style={styles.subtitle}>
          Explore vibrant cultural fiestas across Cavite municipalities
        </Text>
      </View>

      {/* Event cards - using map instead of FlatList */}
      <View style={styles.eventsList}>
        {upcomingAndHappeningEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={(id) => router.push(`/events/${id}`)}
          />
        ))}
      </View>
    </View>
  );
}

interface AboutCaviteViewProps {
  eventsQuery: ReturnType<typeof useEvents>;
  expresswaysQuery: ReturnType<typeof useExpressways>;
}

function AboutCaviteView({ eventsQuery, expresswaysQuery }: AboutCaviteViewProps) {
  // Loading state
  if (eventsQuery.isLoading || expresswaysQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Error state
  if (eventsQuery.isError || expresswaysQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Unable to load content</Text>
        <Button
          title="Retry"
          onPress={() => {
            eventsQuery.refetch();
            expresswaysQuery.refetch();
          }}
          variant="primary"
        />
      </View>
    );
  }

  const events = eventsQuery.data || [];
  const expressways = expresswaysQuery.data || [];

  return (
    <AboutCaviteContent
      expressways={expressways}
      events={events}
      onEventPress={(id) => router.push(`/events/${id}`)}
    />
  );
}

const styles = StyleSheet.create({
  segmentedControlContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: 0,
    paddingBottom: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.base,
    paddingHorizontal: spacing.base,
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
  eventsContainer: {
    paddingHorizontal: spacing.base,
    gap: spacing.base,
  },
  headingSection: {
    gap: spacing.xs,
  },
  heading: {
    ...typography.headlineLarge,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  eventsList: {
    gap: spacing.base,
  },
});
