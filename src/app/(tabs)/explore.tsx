import { ItineraryCard } from "@/components/explore/ItineraryCard";
import { SiteCard } from "@/components/explore/SiteCard";
import {
  SiteFilters,
  type CategoryFilter,
} from "@/components/explore/SiteFilters";
import { CaviteMap } from "@/components/map/CaviteMap";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StateView } from "@/components/ui/StateView";
import type { Itinerary, Site } from "@/data/types";
import { POINTS_PER_CATEGORY } from "@/data/types";
import { useItineraries } from "@/hooks/useItineraries";
import { useSites } from "@/hooks/useSites";
import { useStamps } from "@/hooks/useStamps";
import { TAB_BAR_HEIGHT } from "@/lib/constants";
import { colors, radii, shadows, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ExploreView = "Sites" | "Itineraries";

type ItineraryWithProgress = {
  itinerary: Itinerary;
  stampedCount: number;
  totalStops: number;
  pointsAvailable: number;
};

const NETWORK_ERROR_MESSAGE = "Check your connection and try again.";

/** Show the raw error in development only; users get a friendly message. */
const errorMessage = (error: Error) =>
  __DEV__ ? error.message : NETWORK_ERROR_MESSAGE;

const CardSeparator = () => <View style={styles.separator} />;

/**
 * Explore Tab Screen
 *
 * Contains Sites and Itineraries toggle views.
 * - Sites view: search, category filter, list/map toggle
 * - Itineraries view: curated tour cards with progress
 *
 * Layout: the map (once first opened) stays mounted as the bottom layer of
 * the body, and the lists render on an opaque layer above it. Switching
 * list/map or Sites/Itineraries therefore never reloads the map's tiles or
 * loses its camera position.
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 7.2
 */
export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  // Active view toggle: Sites or Itineraries (Requirement 2.1)
  const [activeView, setActiveView] = useState<ExploreView>("Sites");

  // Search query for Sites view (Requirement 2.2.1)
  const [searchQuery, setSearchQuery] = useState("");

  // Category filter for Sites view (Requirement 2.2.2)
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("All");

  // List/Map view toggle for Sites view (Requirement 2.2.3)
  const [isMapView, setIsMapView] = useState(false);

  // The map is mounted lazily on first open, then kept alive
  const [isMapMounted, setIsMapMounted] = useState(false);

  // Fetch data (Requirement 6.1)
  const {
    data: sites,
    isLoading: sitesLoading,
    isFetching: sitesFetching,
    error: sitesError,
    refetch: refetchSites,
  } = useSites();
  const {
    data: stamps,
    isLoading: stampsLoading,
    isFetching: stampsFetching,
    error: stampsError,
    refetch: refetchStamps,
  } = useStamps();
  const {
    data: itineraries,
    isLoading: itinerariesLoading,
    isFetching: itinerariesFetching,
    error: itinerariesError,
    refetch: refetchItineraries,
  } = useItineraries();

  // Site IDs the user has stamped (Requirement 8.3)
  const visitedSiteIds = useMemo(
    () => new Set(stamps?.map((stamp) => stamp.siteId)),
    [stamps],
  );

  // Filter sites client-side (Requirement 8.1)
  const filteredSites = useMemo(() => {
    if (!sites) return [];

    const query = searchQuery.trim().toLowerCase();

    return sites.filter((site) => {
      const matchesCategory =
        selectedCategory === "All" || site.category === selectedCategory;

      // Case-insensitive match on name, address, or municipality
      const matchesSearch =
        query === "" ||
        [site.name, site.address, site.municipality].some((field) =>
          field.toLowerCase().includes(query),
        );

      return matchesCategory && matchesSearch;
    });
  }, [sites, selectedCategory, searchQuery]);

  // Calculate itinerary progress (Requirement 2.3.1, 8.3)
  const itinerariesWithProgress = useMemo<ItineraryWithProgress[]>(() => {
    if (!itineraries || !sites) return [];

    const sitesById = new Map(sites.map((site) => [site.id, site]));

    return itineraries.map((itinerary) => {
      const stops = itinerary.siteIds
        .map((siteId) => sitesById.get(siteId))
        .filter((site): site is Site => site !== undefined);

      return {
        itinerary,
        totalStops: stops.length,
        stampedCount: stops.filter((site) => visitedSiteIds.has(site.id))
          .length,
        // Sum of points per category for all stops
        pointsAvailable: stops.reduce(
          (sum, site) => sum + POINTS_PER_CATEGORY[site.category],
          0,
        ),
      };
    });
  }, [itineraries, sites, visitedSiteIds]);

  // Sites view waits for stamps too, so "Visited" badges don't pop in late.
  // A stamps failure alone still shows the list (just without badges).
  const sitesPending = sitesLoading || stampsLoading;
  const sitesReady = !sitesPending && !sitesError;

  // Itinerary progress needs all three queries.
  const itinerariesPending =
    itinerariesLoading || sitesLoading || stampsLoading;
  const itinerariesFailure = itinerariesError ?? sitesError ?? stampsError;

  const handleRetryItineraries = () => {
    if (itinerariesError) refetchItineraries();
    if (sitesError) refetchSites();
    if (stampsError) refetchStamps();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const handleModeChange = (mode: "list" | "map") => {
    if (mode === "map") setIsMapMounted(true);
    setIsMapView(mode === "map");
  };

  const handleSitePress = (siteId: string) => {
    router.push(`/sites/${siteId}`);
  };

  const handleItineraryPress = (itineraryId: string) => {
    router.push(`/itineraries/${itineraryId}`);
  };

  const isMapMode = activeView === "Sites" && isMapView;

  const filters = (mode: "list" | "map", style: StyleProp<ViewStyle>) => (
    <SiteFilters
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
      mode={mode}
      onModeChange={handleModeChange}
      style={style}
    />
  );

  /** Loading/error/empty state for the Sites view, or null when there are results */
  const renderSitesState = (style?: StyleProp<ViewStyle>) => {
    if (sitesPending) {
      return <StateView variant="loading" style={style} />;
    }
    if (sitesError) {
      return (
        <StateView
          variant="error"
          title="Unable to load sites"
          message={errorMessage(sitesError)}
          actionLabel="Retry"
          onAction={refetchSites}
          actionLoading={sitesFetching}
          style={style}
        />
      );
    }
    if (filteredSites.length > 0) return null;

    return sites && sites.length > 0 ? (
      <StateView
        variant="empty"
        title="No sites match your search"
        message="Try a different name, town, or category."
        actionLabel="Clear filters"
        onAction={handleClearFilters}
        style={style}
      />
    ) : (
      <StateView
        variant="empty"
        icon="location-outline"
        title="No sites available yet"
        style={style}
      />
    );
  };

  const renderItinerariesState = () => {
    if (itinerariesPending) return <StateView variant="loading" />;
    if (itinerariesFailure) {
      return (
        <StateView
          variant="error"
          title="Unable to load itineraries"
          message={errorMessage(itinerariesFailure)}
          actionLabel="Retry"
          onAction={handleRetryItineraries}
          actionLoading={itinerariesFetching || sitesFetching || stampsFetching}
        />
      );
    }
    return (
      <StateView
        variant="empty"
        icon="map-outline"
        title="No itineraries available"
      />
    );
  };

  const renderSite: ListRenderItem<Site> = ({ item: site }) => (
    <SiteCard
      site={site}
      isVisited={visitedSiteIds.has(site.id)}
      onPress={() => handleSitePress(site.id)}
      testID={`site-card-${site.id}`}
    />
  );

  const renderItinerary: ListRenderItem<ItineraryWithProgress> = ({
    item: { itinerary, stampedCount, totalStops, pointsAvailable },
  }) => (
    <ItineraryCard
      itinerary={itinerary}
      stampedCount={stampedCount}
      totalStops={totalStops}
      pointsAvailable={pointsAvailable}
      onPress={() => handleItineraryPress(itinerary.id)}
      testID={`itinerary-card-${itinerary.id}`}
    />
  );

  const listContentStyle = [
    styles.listContent,
    // Matches the bottom padding ScreenContainer gave scrollable tab screens
    { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
  ];

  const tabIcon = (view: ExploreView, name: "location" | "map-outline") => (
    <Ionicons
      name={name}
      size={16}
      color={activeView === view ? colors.background : colors.textSecondary}
    />
  );

  const mapOverlay = isMapMode ? renderSitesState(styles.mapOverlayContent) : null;

  return (
    <ScreenContainer edges={["left", "right"]} testID="explore-screen">
      {/* SegmentedControl Toggle (Requirement 2.1, 7.1) */}
      <View style={styles.segmentedControlWrapper}>
        <SegmentedControl<ExploreView>
          options={[
            { label: "Sites", value: "Sites", icon: tabIcon("Sites", "location") },
            {
              label: "Itineraries",
              value: "Itineraries",
              icon: tabIcon("Itineraries", "map-outline"),
            },
          ]}
          selectedValue={activeView}
          onValueChange={setActiveView}
          testID="explore-segmented-control"
        />
      </View>

      <View style={styles.body}>
        {/* Map layer (Requirement 2.2.3) — stays mounted once opened */}
        {isMapMounted && (
          <View
            style={StyleSheet.absoluteFill}
            importantForAccessibility={
              isMapMode ? "auto" : "no-hide-descendants"
            }
            accessibilityElementsHidden={!isMapMode}
          >
            <CaviteMap
              sites={filteredSites}
              onSitePress={handleSitePress}
              selectedLabel={
                sitesReady && filteredSites.length > 0
                  ? `${filteredSites.length} ${filteredSites.length === 1 ? "site" : "sites"}`
                  : undefined
              }
              showControls={true}
              showInteractionBorder={false}
              controlsPosition="right-below-controls"
            />

            {isMapMode && (
              <>
                {/* Floating controls over map */}
                {filters("map", styles.floatingFilters)}

                {mapOverlay && (
                  <View style={styles.mapOverlayCard}>{mapOverlay}</View>
                )}
              </>
            )}
          </View>
        )}

        {/* List layer — opaque, covers the map when it is mounted */}
        {!isMapMode && (
          <View style={styles.listLayer}>
            {activeView === "Sites" ? (
              // Sites — List View (Requirement 2.2.1–2.2.4)
              <FlatList
                data={sitesReady ? filteredSites : []}
                keyExtractor={(site) => site.id}
                renderItem={renderSite}
                // Header is an element (not a component), so the search
                // input keeps focus while results change.
                ListHeaderComponent={filters("list", styles.listFilters)}
                ListEmptyComponent={renderSitesState() ?? undefined}
                ItemSeparatorComponent={CardSeparator}
                contentContainerStyle={listContentStyle}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                testID="explore-sites-list"
              />
            ) : (
              // Itinerary Cards (Requirement 2.3.1)
              <FlatList
                data={
                  itinerariesPending || itinerariesFailure
                    ? []
                    : itinerariesWithProgress
                }
                keyExtractor={({ itinerary }) => itinerary.id}
                renderItem={renderItinerary}
                ListEmptyComponent={renderItinerariesState()}
                ItemSeparatorComponent={CardSeparator}
                contentContainerStyle={listContentStyle}
                showsVerticalScrollIndicator={false}
                testID="explore-itineraries-list"
              />
            )}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  segmentedControlWrapper: {
    marginBottom: spacing.sm,
  },
  // Full-bleed body: cancels ScreenContainer's horizontal padding so the map
  // and chip rows reach the screen edges; lists re-apply it on their content.
  body: {
    flex: 1,
    marginHorizontal: -spacing.base,
  },
  listLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.base,
  },
  // SiteFilters pads itself; cancel the list's horizontal padding so the
  // chip row scrolls edge to edge.
  listFilters: {
    marginHorizontal: -spacing.base,
  },
  separator: {
    height: spacing.md,
  },
  floatingFilters: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    // Let touches in empty gaps fall through to the map
    pointerEvents: "box-none",
  },
  mapOverlayCard: {
    position: "absolute",
    top: "35%",
    left: spacing.base,
    right: spacing.base,
    backgroundColor: colors.background,
    borderRadius: radii.card,
    ...shadows.card,
  },
  mapOverlayContent: {
    paddingVertical: spacing.lg,
  },
});
