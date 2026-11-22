import { AboutCaviteContent } from '@/components/discover/AboutCaviteContent';
import { EventCard } from '@/components/discover/EventCard';
import {
  EventFilters,
  matchesEventFilter,
  type EventFilter,
} from '@/components/discover/EventFilters';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StateView } from '@/components/ui/StateView';
import { FESTIVAL_PREVIEW_COUNT } from '@/data/about-cavite-content';
import type { Category, Event } from '@/data/types';
import { useEvents } from '@/hooks/useEvents';
import { useExpressways } from '@/hooks/useExpressways';
import { useSites } from '@/hooks/useSites';
import { TAB_BAR_HEIGHT } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { getEventSections, getUpcomingEvents, type EventSection } from '@/lib/event-utils';
import { colors, spacing, typography } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
  type SectionListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DiscoverView = 'events' | 'about';

const handleEventPress = (id: string) => router.push(`/events/${id}`);
const handleSitePress = (id: string) => router.push(`/sites/${id}`);
// Opens the Explore tab with its category filter preset
const handleExploreCategory = (category: Category) =>
  router.navigate({ pathname: '/explore', params: { category } });
const handleExploreSites = () => router.navigate('/explore');

const CardSeparator = () => <View style={styles.separator} />;

/**
 * Discover Tab Screen
 *
 * Toggle between Events view (festival/event cards) and About Cavite view (info sections).
 * Events are filtered to exclude past events and sorted chronologically.
 *
 * The screen itself doesn't scroll: Events is a SectionList and About Cavite
 * owns its ScrollView (which it locks while the user drags its map).
 *
 * Layout (same approach as Explore): both views stay mounted so switching is
 * a style change, not a rebuild, and each keeps its scroll position. About
 * Cavite is the bottom layer and Events an opaque layer above it, hidden
 * while About Cavite is selected. About Cavite is never `display: none`
 * itself, since that would drop its map's native view and reload the tiles.
 */
export default function DiscoverScreen() {
  const [selectedView, setSelectedView] = useState<DiscoverView>('events');
  const eventsQuery = useEvents();
  const expresswaysQuery = useExpressways();
  const isAboutView = selectedView === 'about';

  // About Cavite (map, carousels, timeline) is the heavy view. It's built in
  // the background once Events has painted, so even the first switch is
  // instant, then kept alive. Opening it before that mounts it right away.
  const [isAboutMounted, setIsAboutMounted] = useState(false);
  if (isAboutView && !isAboutMounted) {
    setIsAboutMounted(true);
  }
  useEffect(() => {
    const handle = requestIdleCallback(() => setIsAboutMounted(true));
    return () => cancelIdleCallback(handle);
  }, []);

  return (
    <ScreenContainer edges={['left', 'right']} testID="discover-screen">
      {/* Segmented control */}
      <View style={styles.segmentedControlWrapper}>
        <SegmentedControl<DiscoverView>
          options={[
            {
              label: 'Events',
              value: 'events',
              icon: (color) => renderTabIcon('party-popper', color),
            },
            {
              label: 'About Cavite',
              value: 'about',
              icon: (color) => renderTabIcon('map', color),
            },
          ]}
          selectedValue={selectedView}
          onValueChange={setSelectedView}
          testID="discover-segmented-control"
        />
      </View>

      <View style={styles.body}>
        {/* About Cavite layer — covered by Events unless selected */}
        {isAboutMounted && (
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents={isAboutView ? 'auto' : 'none'}
            importantForAccessibility={isAboutView ? 'auto' : 'no-hide-descendants'}
            accessibilityElementsHidden={!isAboutView}
          >
            <AboutCaviteView
              eventsQuery={eventsQuery}
              expresswaysQuery={expresswaysQuery}
              onViewAllEvents={() => setSelectedView('events')}
            />
          </View>
        )}

        {/* Events layer — opaque; hidden (not unmounted) on About Cavite */}
        <View style={[styles.eventsLayer, isAboutView && styles.hidden]}>
          <EventsView query={eventsQuery} />
        </View>
      </View>
    </ScreenContainer>
  );
}

/** Segmented control icon; the control picks the color as its pill slides */
function renderTabIcon(name: 'party-popper' | 'map', color: string) {
  return <MaterialCommunityIcons name={name} size={16} color={color} />;
}

interface EventsViewProps {
  query: ReturnType<typeof useEvents>;
}

function EventsView({ query }: EventsViewProps) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<EventFilter>('All');
  // Own flag rather than query.isRefetching, so background refetches
  // (e.g. on app focus) don't flash the pull-to-refresh spinner
  const [refreshing, setRefreshing] = useState(false);

  // Upcoming and ongoing events, soonest first
  const upcomingEvents = useMemo(() => getUpcomingEvents(query.data ?? []), [query.data]);
  const sections = useMemo(
    () => getEventSections(upcomingEvents.filter((event) => matchesEventFilter(event, filter))),
    [upcomingEvents, filter],
  );

  const isReady = !query.isLoading && !query.isError;
  const hasEvents = isReady && upcomingEvents.length > 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // SectionList puts no separator between a section's last card and the next
  // month header, so that gap lives here: transparent space inside the card's
  // cell. Kept out of the header's padding, whose opaque background would
  // otherwise cut off the card's shadow and look glued to its underside.
  const renderEvent: SectionListRenderItem<Event, EventSection> = ({ item, index, section }) => {
    const endsSection =
      index === section.data.length - 1 && section !== sections[sections.length - 1];
    return (
      <View style={endsSection && styles.sectionEnd}>
        <EventCard event={item} onPress={handleEventPress} />
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: EventSection }) => (
    <View style={styles.sectionHeader} accessibilityRole="header">
      {section.live && <View style={styles.liveDot} />}
      <Text style={[styles.sectionTitle, section.live && styles.sectionTitleLive]}>
        {section.title}
      </Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
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
  ) : hasEvents ? (
    // Events exist, but none match the selected filter
    <StateView
      variant="empty"
      icon="filter-outline"
      title="No matching events"
      message="None of the upcoming events fit this filter."
      actionLabel="Show all events"
      onAction={() => setFilter('All')}
    />
  ) : (
    <StateView
      variant="empty"
      icon="calendar-outline"
      title="No upcoming events"
      message="Check back soon. In the meantime, there's plenty to see around Cavite."
      actionLabel="Explore sites"
      onAction={handleExploreSites}
    />
  );

  return (
    <SectionList
      style={styles.fill}
      sections={isReady ? sections : []}
      keyExtractor={(event) => event.id}
      renderItem={renderEvent}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled
      ListHeaderComponent={
        hasEvents ? (
          <View style={styles.headingSection}>
            <Text style={styles.heading}>Provincial Festivals & Events</Text>
            <EventFilters events={upcomingEvents} selected={filter} onChange={setFilter} />
          </View>
        ) : undefined
      }
      ListEmptyComponent={emptyState}
      ItemSeparatorComponent={CardSeparator}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
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
  onViewAllEvents: () => void;
}

function AboutCaviteView({
  eventsQuery,
  expresswaysQuery,
  onViewAllEvents,
}: AboutCaviteViewProps) {
  // Only used to decide which history milestones can link to a site, so the
  // view doesn't wait on it.
  const sitesQuery = useSites();
  const knownSiteIds = useMemo(
    () => new Set(sitesQuery.data?.map((site) => site.id)),
    [sitesQuery.data],
  );
  const previewEvents = useMemo(
    () => getUpcomingEvents(eventsQuery.data ?? []).slice(0, FESTIVAL_PREVIEW_COUNT),
    [eventsQuery.data],
  );

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
      events={previewEvents}
      knownSiteIds={knownSiteIds}
      onEventPress={handleEventPress}
      onViewAllEvents={onViewAllEvents}
      onSitePress={handleSitePress}
      onExploreCategory={handleExploreCategory}
    />
  );
}

const styles = StyleSheet.create({
  segmentedControlWrapper: {
    marginBottom: spacing.sm,
  },
  // Cancels ScreenContainer's horizontal padding so both views scroll (and
  // card shadows render) edge to edge; they re-apply it on their content.
  // Done here rather than on each view so the layers span the full width
  // (Android ignores touches outside a parent's bounds).
  body: {
    flex: 1,
    marginHorizontal: -spacing.base,
  },
  eventsLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  // Hidden but mounted: display none also hides it from screen readers
  hidden: {
    display: 'none',
  },
  fill: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.base,
  },
  separator: {
    height: spacing.base,
  },
  // Bottom padding keeps the first month header as far below the filters as
  // the old header padding did
  headingSection: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  // Space between a section's last card and the next month header
  sectionEnd: {
    paddingBottom: spacing.xl,
  },
  heading: {
    ...typography.headlineLarge,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
  },
  // Sticky, so it needs a solid background to cover cards scrolling under it.
  // Top padding stays small: the gap above it comes from `sectionEnd`.
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
  },
  sectionTitleLive: {
    color: colors.successDark,
  },
  sectionCount: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
});
