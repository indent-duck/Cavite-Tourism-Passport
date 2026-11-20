import { ItineraryCard } from "@/components/explore/ItineraryCard";
import { ListMapSwitch } from "@/components/explore/ListMapSwitch";
import { SiteCard } from "@/components/explore/SiteCard";
import {
  CATEGORY_FILTERS,
  SiteFilters,
  type CategoryFilter,
} from "@/components/explore/SiteFilters";
import { SitePreviewCard } from "@/components/explore/SitePreviewCard";
import { CaviteMap } from "@/components/map/CaviteMap";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StateView } from "@/components/ui/StateView";
import { SCAN_OVERHANG } from "@/components/ui/TabBar";
import type { Category, Itinerary, Site } from "@/data/types";
import { POINTS_PER_CATEGORY } from "@/data/types";
import { useItineraries } from "@/hooks/useItineraries";
import { useSites } from "@/hooks/useSites";
import { useStamps } from "@/hooks/useStamps";
import { useUserLocation } from "@/hooks/useUserLocation";
import { TAB_BAR_HEIGHT } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { getDistanceMeters } from "@/lib/geo";
import { colors, radii, shadows, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
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
  stopCategories: Category[];
};

/**
 * Bottom offset for full-width floating UI (the map preview card): clears the
 * tab bar's raised Scan button, which overlaps the bottom-center of the screen
 */
const FLOATING_BOTTOM = SCAN_OVERHANG + spacing.base;

const CardSeparator = () => <View style={styles.separator} />;

const handleSitePress = (siteId: string) => {
  router.push(`/sites/${siteId}`);
};

const handleItineraryPress = (itineraryId: string) => {
  router.push(`/itineraries/${itineraryId}`);
};

/** Itinerary list order: in progress, then not started, then completed */
function progressRank({ stampedCount, totalStops }: ItineraryWithProgress) {
  if (totalStops > 0 && stampedCount >= totalStops) return 2;
  return stampedCount > 0 ? 0 : 1;
}

/**
 * Explore Tab Screen
 *
 * Contains Sites and Itineraries toggle views.
 * - Sites view: stamp progress, search, category filter with counts,
 *   "Nearest" sort, and a floating list/map switch. On the map, tapping a
 *   pin opens a preview card instead of leaving the map.
 * - Itineraries view: curated tour cards with progress, in-progress first
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

  // Other screens (e.g. Discover → About Cavite) can open Explore with a
  // category preset via `?category=<Category>`. Apply it once, then clear the
  // param so the same link works again after the user changes the filter.
  const { category: categoryParam } = useLocalSearchParams<{
    category?: string;
  }>();
  const [appliedCategoryParam, setAppliedCategoryParam] = useState<string>();
  if (categoryParam !== appliedCategoryParam) {
    setAppliedCategoryParam(categoryParam);
    const preset = CATEGORY_FILTERS.find((filter) => filter === categoryParam);
    if (preset) {
      setActiveView("Sites");
      setSearchQuery("");
      setSelectedCategory(preset);
    }
  }
  useEffect(() => {
    if (categoryParam) router.setParams({ category: undefined });
  }, [categoryParam]);

  // List/Map view toggle for Sites view (Requirement 2.2.3)
  const [isMapView, setIsMapView] = useState(false);

  // The map is mounted lazily on first open, then kept alive
  const [isMapMounted, setIsMapMounted] = useState(false);

  // Pin whose preview card is open on the map
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Height of the search + chips rows pinned over the Sites view; the list
  // starts below them and the map's controls sit under them
  const [filtersHeight, setFiltersHeight] = useState(0);

  // "Nearest" sort; distances show on cards whenever location is known
  const [sortByDistance, setSortByDistance] = useState(false);
  const location = useUserLocation();

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

  const stampedSiteCount = useMemo(
    () => (sites ?? []).filter((site) => visitedSiteIds.has(site.id)).length,
    [sites, visitedSiteIds],
  );

  // Sites matching the search box, before the category filter (Requirement 8.1)
  const searchMatches = useMemo(() => {
    if (!sites) return [];
    const query = searchQuery.trim().toLowerCase();
    if (query === "") return sites;

    // Case-insensitive match on name, address, or municipality
    return sites.filter((site) =>
      [site.name, site.address, site.municipality].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }, [sites, searchQuery]);

  // Per-chip counts for the current search
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<CategoryFilter, number>> = {
      All: searchMatches.length,
    };
    for (const filter of CATEGORY_FILTERS) {
      if (filter !== "All") {
        counts[filter] = searchMatches.filter(
          (site) => site.category === filter,
        ).length;
      }
    }
    return counts;
  }, [searchMatches]);

  const filteredSites = useMemo(
    () =>
      selectedCategory === "All"
        ? searchMatches
        : searchMatches.filter((site) => site.category === selectedCategory),
    [searchMatches, selectedCategory],
  );

  const distances = useMemo(() => {
    const coords = location.coords;
    if (!coords || !sites) return undefined;
    return new Map(
      sites.map((site) => [
        site.id,
        getDistanceMeters(
          coords.latitude,
          coords.longitude,
          site.latitude,
          site.longitude,
        ),
      ]),
    );
  }, [location.coords, sites]);

  // List order; the map keeps `filteredSites` so its camera doesn't refit
  // when only the sort changes
  const listedSites = useMemo(() => {
    if (!sortByDistance || !distances) return filteredSites;
    return [...filteredSites].sort(
      (a, b) => (distances.get(a.id) ?? 0) - (distances.get(b.id) ?? 0),
    );
  }, [filteredSites, sortByDistance, distances]);

  // Preview closes on its own if filters hide its site
  const selectedSite = selectedSiteId
    ? filteredSites.find((site) => site.id === selectedSiteId)
    : undefined;

  // Calculate itinerary progress (Requirement 2.3.1, 8.3)
  const itinerariesWithProgress = useMemo<ItineraryWithProgress[]>(() => {
    if (!itineraries || !sites) return [];

    const sitesById = new Map(sites.map((site) => [site.id, site]));

    const withProgress = itineraries.map((itinerary) => {
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
        stopCategories: [...new Set(stops.map((site) => site.category))],
      };
    });

    // In progress first, then not started, then completed; day tours before
    // overnight within each group (sort is stable, so API order breaks ties)
    return withProgress.sort(
      (a, b) =>
        progressRank(a) - progressRank(b) ||
        Number(a.itinerary.type !== "Day Tour") -
          Number(b.itinerary.type !== "Day Tour"),
    );
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

  // Pull-to-refresh. Own flag per list rather than the queries' isRefetching,
  // so background refetches don't flash the spinner, and a refresh started on
  // one list doesn't show a spinner on the other.
  const [refreshingList, setRefreshingList] = useState<ExploreView | null>(
    null,
  );

  const refreshList = async (view: ExploreView) => {
    setRefreshingList(view);
    try {
      // Stamps drive "Visited" badges and itinerary progress, so they refresh
      // with either list
      await Promise.all([
        refetchSites(),
        refetchStamps(),
        view === "Itineraries" ? refetchItineraries() : undefined,
      ]);
    } finally {
      setRefreshingList(null);
    }
  };

  const renderRefreshControl = (view: ExploreView) => (
    <RefreshControl
      refreshing={refreshingList === view}
      onRefresh={() => refreshList(view)}
      tintColor={colors.primary}
      colors={[colors.primary]}
    />
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const handleModeChange = (mode: "list" | "map") => {
    if (mode === "map") setIsMapMounted(true);
    setSelectedSiteId(null);
    setIsMapView(mode === "map");
  };

  const handleToggleNearest = async () => {
    if (sortByDistance) {
      setSortByDistance(false);
      return;
    }

    if (location.permissionStatus !== "granted") {
      if (!location.canAskAgain) {
        Alert.alert(
          "Location access is off",
          "Allow location access in Settings to sort sites by distance.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const result = await location.requestPermission();
      if (!result.granted) return;
    }

    // Permission alone isn't enough when device location is switched off.
    // Android shows its own dialog for that (declining it needs no message);
    // iOS can't, so explain.
    if (!(await location.ensureLocationOn())) {
      if (Platform.OS === "ios") {
        Alert.alert(
          "Location Services are off",
          "Turn on Location Services in Settings to sort sites by distance.",
        );
      }
      return;
    }

    setSortByDistance(true);
  };

  // Stable so the memoized map doesn't re-render on unrelated state changes
  const handleMapPress = useCallback(() => setSelectedSiteId(null), []);

  const isSitesView = activeView === "Sites";
  const isMapMode = isSitesView && isMapView;

  // One instance for both modes, so the search input keeps its text and
  // focus when switching between list and map
  const pinnedFilters = (
    <View
      style={[
        styles.pinnedFilters,
        !isMapMode && styles.pinnedFiltersList,
        !isSitesView && styles.hidden,
      ]}
      onLayout={(event) => {
        // Ignore the 0 reported while hidden on the Itineraries view, so the
        // list's top padding doesn't jump when switching back
        const { height } = event.nativeEvent.layout;
        if (height > 0) setFiltersHeight(height);
      }}
    >
      <SiteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        counts={sitesReady ? categoryCounts : undefined}
        trailing={
          <ListMapSwitch
            value={isMapView ? "map" : "list"}
            onValueChange={handleModeChange}
          />
        }
        // Let touches in empty gaps fall through to the map
        style={styles.boxNone}
      />
    </View>
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
          message={getErrorMessage(sitesError)}
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
          message={getErrorMessage(itinerariesFailure)}
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

  // Stable renderItems: FlatList cells only re-render when their inputs
  // change, not on every screen render (e.g. switching Sites/Itineraries)
  const renderSite = useCallback<ListRenderItem<Site>>(
    ({ item: site }) => (
      <SiteCard
        site={site}
        isVisited={visitedSiteIds.has(site.id)}
        distanceMeters={distances?.get(site.id)}
        onPress={() => handleSitePress(site.id)}
        testID={`site-card-${site.id}`}
      />
    ),
    [visitedSiteIds, distances],
  );

  const renderItinerary = useCallback<ListRenderItem<ItineraryWithProgress>>(
    ({
      item: { itinerary, stampedCount, totalStops, pointsAvailable, stopCategories },
    }) => (
      <ItineraryCard
        itinerary={itinerary}
        stampedCount={stampedCount}
        totalStops={totalStops}
        pointsAvailable={pointsAvailable}
        stopCategories={stopCategories}
        onPress={() => handleItineraryPress(itinerary.id)}
        testID={`itinerary-card-${itinerary.id}`}
      />
    ),
    [],
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

  const totalSites = sites?.length ?? 0;
  const progressPercent =
    totalSites > 0 ? Math.round((stampedSiteCount / totalSites) * 100) : 0;
  const resultsLabel = `${filteredSites.length} ${
    selectedCategory === "All" ? "" : `${selectedCategory} `
  }${filteredSites.length === 1 ? "site" : "sites"}`;
  const isLocating = sortByDistance && location.isLocating;

  const sitesListHeader = (
    <View>
      {sitesReady && totalSites > 0 && (
        <View
          style={styles.progressStrip}
          accessible
          accessibilityLabel={`${stampedSiteCount} of ${totalSites} sites stamped`}
        >
          <View style={styles.progressStripText}>
            <Ionicons name="ribbon" size={16} color={colors.accent} />
            <Text style={styles.progressStripLabel}>
              <Text style={styles.progressStripCount}>
                {stampedSiteCount} of {totalSites}
              </Text>{" "}
              sites stamped
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>
      )}

      {sitesReady && filteredSites.length > 0 && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsLabel}>{resultsLabel}</Text>
          <Pressable
            onPress={handleToggleNearest}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityState={{ selected: sortByDistance }}
            accessibilityLabel="Sort by nearest"
            style={({ pressed }) => [
              styles.sortPill,
              sortByDistance && styles.sortPillActive,
              pressed && styles.pressed,
            ]}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Ionicons
                name="navigate"
                size={12}
                color={sortByDistance ? colors.background : colors.primary}
              />
            )}
            <Text
              style={[
                styles.sortPillText,
                sortByDistance && styles.sortPillTextActive,
              ]}
            >
              {isLocating ? "Locating…" : "Nearest"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );

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
              onSitePress={setSelectedSiteId}
              visitedSiteIds={visitedSiteIds}
              selectedSiteId={selectedSite?.id ?? null}
              onMapPress={handleMapPress}
              showControls={true}
              showInteractionBorder={false}
              controlsPosition="right-below-controls"
              controlsTop={filtersHeight > 0 ? filtersHeight : undefined}
            />

            {isMapMode && (
              <>
                {mapOverlay && (
                  <View style={styles.mapOverlayCard}>{mapOverlay}</View>
                )}

                {selectedSite && (
                  <SitePreviewCard
                    site={selectedSite}
                    isVisited={visitedSiteIds.has(selectedSite.id)}
                    distanceMeters={distances?.get(selectedSite.id)}
                    onPress={() => handleSitePress(selectedSite.id)}
                    onClose={() => setSelectedSiteId(null)}
                    style={styles.previewCard}
                  />
                )}
              </>
            )}
          </View>
        )}

        {/* List layer — opaque, covers the map when it is mounted. Stays
            mounted (hidden) in map mode, like the map in list mode. Both
            lists stay mounted too and the inactive one is hidden, so
            switching Sites/Itineraries is a style change rather than
            tearing down one list and building the other — and each keeps
            its scroll position. */}
        <View style={[styles.listLayer, isMapMode && styles.hidden]}>
          {/* Sites — List View (Requirement 2.2.1–2.2.4). The list's frame
              starts below the pinned search + chips rows (padding here, not
              on the list content), so the pull-to-refresh spinner appears
              below them instead of behind them. */}
          <View
            style={[
              styles.fill,
              { paddingTop: filtersHeight },
              !isSitesView && styles.hidden,
            ]}
          >
            <FlatList
              data={sitesReady ? listedSites : []}
              keyExtractor={(site) => site.id}
              renderItem={renderSite}
              ListHeaderComponent={sitesListHeader}
              ListEmptyComponent={renderSitesState() ?? undefined}
              ItemSeparatorComponent={CardSeparator}
              contentContainerStyle={listContentStyle}
              refreshControl={renderRefreshControl("Sites")}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              testID="explore-sites-list"
            />
          </View>

          {/* Itinerary Cards (Requirement 2.3.1) */}
          <View style={[styles.fill, isSitesView && styles.hidden]}>
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
              refreshControl={renderRefreshControl("Itineraries")}
              showsVerticalScrollIndicator={false}
              testID="explore-itineraries-list"
            />
          </View>
        </View>

        {/* Search, list/map switch and chips — pinned at the top of the
            Sites view in both modes; hidden (not unmounted) on Itineraries
            so the search text, focus and chip scroll survive */}
        {pinnedFilters}
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
  fill: {
    flex: 1,
  },
  // Hidden but mounted: display none also hides it from screen readers
  hidden: {
    display: "none",
  },
  listContent: {
    paddingHorizontal: spacing.base,
  },
  separator: {
    height: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },

  // Stamp progress
  progressStrip: {
    backgroundColor: colors.accentTint,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressStripText: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  progressStripLabel: {
    ...typography.bodySmall,
    color: colors.text,
  },
  progressStripCount: {
    fontFamily: "Inter_700Bold",
  },
  progressTrack: {
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.full,
    backgroundColor: colors.accent,
  },

  // Result count + sort
  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  resultsLabel: {
    ...typography.labelLarge,
    color: colors.textSecondary,
  },
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  sortPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortPillText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  sortPillTextActive: {
    color: colors.background,
  },

  // Pinned filters: float over the map, or sit on an opaque bar above the list
  pinnedFilters: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: "box-none",
  },
  pinnedFiltersList: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  boxNone: {
    pointerEvents: "box-none",
  },

  // Map mode
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
  previewCard: {
    position: "absolute",
    left: spacing.base,
    right: spacing.base,
    bottom: FLOATING_BOTTOM,
  },
});
