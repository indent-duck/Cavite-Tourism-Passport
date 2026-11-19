import { AboutCaviteContent } from '@/components/discover/AboutCaviteContent';
import { EventCard } from '@/components/discover/EventCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StateView } from '@/components/ui/StateView';
import type { Event } from '@/data/types';
import { useEvents } from '@/hooks/useEvents';
import { useExpressways } from '@/hooks/useExpressways';
import { TAB_BAR_HEIGHT } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { getEventStatus } from '@/lib/event-utils';
import { colors, spacing, typography } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DiscoverView = 'events' | 'about';

const handleEventPress = (id: string) => router.push(`/events/${id}`);

const CardSeparator = () => <View style={styles.separator} />;

/**
 * Discover Tab Screen
 *
 * Toggle between Events view (festival/event cards) and About Cavite view (info sections).
 * Events are filtered to exclude past events and sorted chronologically.
 *
 * The screen itself doesn't scroll: Events is a FlatList and About Cavite
 * owns its ScrollView (which it locks while the user drags its map).
 */
export default function DiscoverScreen() {
  const [selectedView, setSelectedView] = useState<DiscoverView>('events');
  const eventsQuery = useEvents();
  const expresswaysQuery = useExpressways();

  const tabIcon = (view: DiscoverView, name: 'party-popper' | 'map') => (
    <MaterialCommunityIcons
      name={name}
      size={16}
      color={selectedView === view ? colors.background : colors.textSecondary}
    />
  );

  return (
    <ScreenContainer edges={['left', 'right']} testID="discover-screen">
      {/* Segmented control */}
      <View style={styles.segmentedControlWrapper}>
        <SegmentedControl<DiscoverView>
          options={[
            { label: 'Events', value: 'events', icon: tabIcon('events', 'party-popper') },
            { label: 'About Cavite', value: 'about', icon: tabIcon('about', 'map') },
          ]}
          selectedValue={selectedView}
          onValueChange={setSelectedView}
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
  const insets = useSafeAreaInsets();

  // Upcoming and ongoing events, soonest first
  const upcomingEvents = useMemo(
    () =>
      (query.data ?? [])
        .filter((event) => getEventStatus(event) !== 'past')
        .sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        ),
    [query.data],
  );

  const isReady = !query.isLoading && !query.isError;
  const data = isReady ? upcomingEvents : [];

  const renderEvent: ListRenderItem<Event> = ({ item }) => (
    <EventCard event={item} onPress={handleEventPress} />
  );

  const emptyState = query.isLoading ? (
    <StateView variant="loading" />
  ) : query.isError ? (
    <StateView
      variant="error"
      title="Unable to load events"
      message={getErrorMessage(query.error)}
      actionLabel="Retry"
      onAction={() => query.refetch()}
      actionLoading={query.isFetching}
    />
  ) : (
    <StateView
      variant="empty"
      icon="calendar-outline"
      title="No events at this time"
    />
  );

  return (
    <FlatList
      style={styles.fullBleed}
      data={data}
      keyExtractor={(event) => event.id}
      renderItem={renderEvent}
      ListHeaderComponent={
        data.length > 0 ? (
          <View style={styles.headingSection}>
            <Text style={styles.heading}>Provincial Festivals & Events</Text>
            <Text style={styles.subtitle}>
              Explore vibrant cultural fiestas across Cavite municipalities
            </Text>
          </View>
        ) : undefined
      }
      ListEmptyComponent={emptyState}
      ItemSeparatorComponent={CardSeparator}
      contentContainerStyle={[
        styles.listContent,
        // Matches the bottom padding ScreenContainer gave scrollable tab screens
        { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
      testID="discover-events-list"
    />
  );
}

interface AboutCaviteViewProps {
  eventsQuery: ReturnType<typeof useEvents>;
  expresswaysQuery: ReturnType<typeof useExpressways>;
}

function AboutCaviteView({ eventsQuery, expresswaysQuery }: AboutCaviteViewProps) {
  // Loading state
  if (eventsQuery.isLoading || expresswaysQuery.isLoading) {
    return <StateView variant="loading" />;
  }

  // Error state
  const error = eventsQuery.error ?? expresswaysQuery.error;
  if (error) {
    return (
      <StateView
        variant="error"
        title="Unable to load content"
        message={getErrorMessage(error)}
        actionLabel="Retry"
        onAction={() => {
          if (eventsQuery.isError) eventsQuery.refetch();
          if (expresswaysQuery.isError) expresswaysQuery.refetch();
        }}
        actionLoading={eventsQuery.isFetching || expresswaysQuery.isFetching}
      />
    );
  }

  return (
    <AboutCaviteContent
      expressways={expresswaysQuery.data ?? []}
      events={eventsQuery.data ?? []}
      onEventPress={handleEventPress}
    />
  );
}

const styles = StyleSheet.create({
  segmentedControlWrapper: {
    marginBottom: spacing.sm,
  },
  // Cancels ScreenContainer's horizontal padding so the list scrolls (and
  // card shadows render) edge to edge; the list re-applies it on its content.
  fullBleed: {
    flex: 1,
    marginHorizontal: -spacing.base,
  },
  listContent: {
    paddingHorizontal: spacing.base,
  },
  separator: {
    height: spacing.base,
  },
  headingSection: {
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  heading: {
    ...typography.headlineLarge,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
});
