import { ItineraryProgressCard } from '@/components/explore/ItineraryProgressCard';
import { TimelineStopCard } from '@/components/explore/TimelineStopCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { POINTS_PER_CATEGORY } from '@/data/types';
import { useItineraryById } from '@/hooks/useItineraryById';
import { useSites } from '@/hooks/useSites';
import { useStamps } from '@/hooks/useStamps';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Itinerary Detail Screen
 * 
 * Shows detailed information about a specific itinerary including:
 * - Header with tour type, stop count, title, and description
 * - Progress card with stamps and points tracking
 * - Timeline with all stops (with dashed connectors and stop cards)
 * 
 * Validates: Requirements 4.1, 4.2.1, 4.2.2, 4.2.3
 */
export default function ItineraryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Fetch itinerary, stamps, and sites data
  const { 
    data: itinerary, 
    isLoading: isLoadingItinerary, 
    error: itineraryError, 
    refetch: refetchItinerary 
  } = useItineraryById(id);
  const { data: stamps = [], isLoading: isLoadingStamps } = useStamps();
  const { data: sites = [], isLoading: isLoadingSites } = useSites();

  const isLoading = isLoadingItinerary || isLoadingStamps || isLoadingSites;

  // Handle back navigation
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/explore');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer
        showHeader
        headerTitle="Itinerary Detail"
        onBackPress={handleBackPress}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // Error state
  if (itineraryError) {
    return (
      <ScreenContainer
        showHeader
        headerTitle="Itinerary Detail"
        onBackPress={handleBackPress}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Unable to load itinerary</Text>
          <Text style={styles.errorMessage}>
            {itineraryError?.message || 'An error occurred'}
          </Text>
          <Button title="Retry" onPress={() => refetchItinerary()} variant="primary" />
        </View>
      </ScreenContainer>
    );
  }

  // Not found state
  if (!itinerary) {
    return (
      <ScreenContainer
        showHeader
        headerTitle="Itinerary Detail"
        onBackPress={handleBackPress}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <View style={styles.centerContainer}>
          <Ionicons name="map-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Itinerary not found</Text>
          <Text style={styles.emptyMessage}>
            The itinerary you&apos;re looking for could not be found.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Derive stop sites from itinerary.siteIds
  const stopSites = itinerary.siteIds
    .map(siteId => sites.find(s => s.id === siteId))
    .filter(Boolean) as typeof sites;

  // Calculate progress values
  const totalStops = itinerary.siteIds.length;
  
  const stampedCount = stopSites.filter(site =>
    stamps.some(stamp => stamp.siteId === site.id)
  ).length;

  const pointsAvailable = stopSites.reduce(
    (sum, site) => sum + POINTS_PER_CATEGORY[site.category],
    0
  );

  const pointsCollected = stopSites
    .filter(site => stamps.some(stamp => stamp.siteId === site.id))
    .reduce((sum, site) => sum + POINTS_PER_CATEGORY[site.category], 0);

  return (
    <ScreenContainer
      scrollable
      showHeader
      headerTitle="Itinerary Detail"
      onBackPress={handleBackPress}
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Chips */}
      <View style={styles.chipsRow}>
        <Chip
          label={itinerary.type}
          size="small"
          icon={
            <Ionicons
              name={itinerary.type === 'Day Tour' ? 'sunny' : 'moon'}
              size={14}
              color={colors.primary}
            />
          }
        />
        <Chip
          label={`${totalStops} curated stops`}
          size="small"
          icon={
            <Ionicons
              name="location"
              size={14}
              color={colors.primary}
            />
          }
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>{itinerary.title}</Text>

      {/* Description */}
      {itinerary.description && (
        <Text style={styles.description}>{itinerary.description}</Text>
      )}

      {/* Progress Card */}
      <ItineraryProgressCard
        stampedCount={stampedCount}
        totalStops={totalStops}
        pointsAvailable={pointsAvailable}
        pointsCollected={pointsCollected}
      />

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>Itinerary Timeline</Text>
        {stopSites.map((site, index) => {
          const isStamped = stamps.some(stamp => stamp.siteId === site.id);
          const stopNumber = index + 1;
          const showConnector = index > 0;

          return (
            <TimelineStopCard
              key={site.id}
              stop={site}
              stopNumber={stopNumber}
              isStamped={isStamped}
              showConnector={showConnector}
              onPress={() => router.push(`/sites/${site.id}`)}
              testID={`timeline-stop-${site.id}`}
            />
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  timelineContainer: {
    marginTop: spacing.lg,
  },
  timelineTitle: {
    ...typography.titleMedium,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.headlineSmall,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    marginTop: spacing.md,
  },
  errorMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  emptyTitle: {
    ...typography.headlineSmall,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
});
