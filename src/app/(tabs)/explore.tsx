import { ItineraryCard } from "@/components/explore/ItineraryCard";
import { ListMapSwitch } from "@/components/explore/ListMapSwitch";
import { SearchBar } from "@/components/explore/SearchBar";
import { SiteCard } from "@/components/explore/SiteCard";
import { CaviteMap } from "@/components/map/CaviteMap";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { Category } from "@/data/types";
import { POINTS_PER_CATEGORY } from "@/data/types";
import { useItineraries } from "@/hooks/useItineraries";
import { useSites } from "@/hooks/useSites";
import { useStamps } from "@/hooks/useStamps";
import { colors, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

/**
 * Explore Tab Screen
 *
 * Contains Sites and Itineraries toggle views.
 * - Sites view: search, category filter, list/map toggle
 * - Itineraries view: curated tour cards with progress
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 7.2
 */
export default function ExploreScreen() {
  // Active view toggle: Sites or Itineraries (Requirement 2.1)
  const [activeView, setActiveView] = useState<"Sites" | "Itineraries">(
    "Sites",
  );

  // Search query for Sites view (Requirement 2.2.1)
  const [searchQuery, setSearchQuery] = useState("");

  // Category filter for Sites view (Requirement 2.2.2)
  const [selectedCategory, setSelectedCategory] = useState<"All" | Category>(
    "All",
  );

  // List/Map view toggle for Sites view (Requirement 2.2.3)
  const [isMapView, setIsMapView] = useState(false);

  // Fetch data (Requirement 6.1)
  const {
    data: sites,
    isLoading: sitesLoading,
    error: sitesError,
    refetch: refetchSites,
  } = useSites();
  const { data: stamps, isLoading: stampsLoading } = useStamps();
  const {
    data: itineraries,
    isLoading: itinerariesLoading,
    error: itinerariesError,
    refetch: refetchItineraries,
  } = useItineraries();

  // Filter sites client-side (Requirement 8.1)
  const filteredSites = useMemo(() => {
    if (!sites) return [];

    return sites.filter((site) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "All" || site.category === selectedCategory;

      // Search filter (case-insensitive, matches name, address, municipality)
      const matchesSearch =
        searchQuery.trim() === "" ||
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.municipality.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [sites, selectedCategory, searchQuery]);

  // Derive visited state for each site (Requirement 8.3)
  const isVisited = (siteId: string): boolean => {
    return stamps?.some((stamp) => stamp.siteId === siteId) ?? false;
  };

  // Calculate itinerary progress (Requirement 2.3.1, 8.3)
  const itinerariesWithProgress = useMemo(() => {
    if (!itineraries || !sites || !stamps) return [];

    return itineraries.map((itinerary) => {
      // Get sites for this itinerary
      const itinerarySites = itinerary.siteIds
        .map((siteId) => sites.find((site) => site.id === siteId))
        .filter((site): site is NonNullable<typeof site> => site !== undefined);

      const totalStops = itinerarySites.length;

      // Count stamped stops
      const stampedCount = itinerarySites.filter((site) =>
        stamps.some((stamp) => stamp.siteId === site.id),
      ).length;

      // Calculate total points available (sum of points per category for all stops)
      const pointsAvailable = itinerarySites.reduce(
        (sum, site) => sum + POINTS_PER_CATEGORY[site.category],
        0,
      );

      return {
        itinerary,
        stampedCount,
        totalStops,
        pointsAvailable,
      };
    });
  }, [itineraries, sites, stamps]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const handleSitePress = (siteId: string) => {
    router.push(`/sites/${siteId}`);
  };

  const handleItineraryPress = (itineraryId: string) => {
    router.push(`/itineraries/${itineraryId}`);
  };

  // Category options for chips
  const categories: ("All" | Category)[] = [
    "All",
    "Dining",
    "Staycation",
    "Adventure",
    "Heritage",
  ];

  return (
    <ScreenContainer
      scrollable={true}
      edges={["left", "right"]}
      withTabBarPadding={true}
      testID="explore-screen"
    >
      <View style={styles.content}>
        {/* SegmentedControl Toggle (Requirement 2.1, 7.1) */}
        <View style={styles.segmentedControlWrapper}>
          <SegmentedControl
            options={[
              {
                label: "Sites",
                value: "Sites",
                icon: (
                  <Ionicons
                    name="location"
                    size={16}
                    color={
                      activeView === "Sites"
                        ? colors.background
                        : colors.textSecondary
                    }
                  />
                ),
              },
              {
                label: "Itineraries",
                value: "Itineraries",
                icon: (
                  <Ionicons
                    name="map-outline"
                    size={16}
                    color={
                      activeView === "Itineraries"
                        ? colors.background
                        : colors.textSecondary
                    }
                  />
                ),
              },
            ]}
            selectedValue={activeView}
            onValueChange={(value) =>
              setActiveView(value as "Sites" | "Itineraries")
            }
            testID="explore-segmented-control"
          />
        </View>

        {/* Sites View */}
        {activeView === "Sites" && (
          <>
            {/* Search Bar (Requirement 2.2.1) */}
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search sites..."
              onClear={() => setSearchQuery("")}
            />

            {/* Category Chips (Requirement 2.2.2) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScrollView}
              contentContainerStyle={styles.chipsContainer}
              keyboardShouldPersistTaps="handled"
            >
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  testID={`category-chip-${category}`}
                />
              ))}
            </ScrollView>

            {/* List/Map Switch (Requirement 2.2.3) */}
            <View style={styles.viewSwitchRow}>
              <ListMapSwitch
                value={isMapView ? "map" : "list"}
                onValueChange={(value) => setIsMapView(value === "map")}
              />
            </View>

            {/* Loading State */}
            {(sitesLoading || stampsLoading) && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}

            {/* Error State */}
            {sitesError && (
              <View style={styles.centerContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color={colors.error}
                />
                <Text style={styles.errorTitle}>Unable to load sites</Text>
                <Text style={styles.errorMessage}>{sitesError.message}</Text>
                <Button
                  title="Retry"
                  onPress={refetchSites}
                  variant="primary"
                />
              </View>
            )}

            {/* Empty State */}
            {!sitesLoading && !sitesError && filteredSites.length === 0 && (
              <View style={styles.centerContainer}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyTitle}>
                  No sites match your search
                </Text>
                <Button
                  title="Clear filters"
                  onPress={handleClearFilters}
                  variant="outline"
                />
              </View>
            )}

            {/* Map View (Requirement 2.2.3) */}
            {!sitesLoading &&
              !sitesError &&
              filteredSites.length > 0 &&
              isMapView && (
                <View style={styles.mapContainer}>
                  <CaviteMap
                    height={400}
                    selectedLabel={`${filteredSites.length} ${filteredSites.length === 1 ? "site" : "sites"} on the map`}
                  />
                </View>
              )}

            {/* List View (Requirement 2.2.4) */}
            {!sitesLoading &&
              !sitesError &&
              filteredSites.length > 0 &&
              !isMapView && (
                <View style={styles.sitesList}>
                  {filteredSites.map((site) => (
                    <SiteCard
                      key={site.id}
                      site={site}
                      isVisited={isVisited(site.id)}
                      onPress={() => handleSitePress(site.id)}
                      testID={`site-card-${site.id}`}
                    />
                  ))}
                </View>
              )}
          </>
        )}

        {/* Itineraries View (Requirement 2.3) */}
        {activeView === "Itineraries" && (
          <>
            {/* Loading State */}
            {(itinerariesLoading || sitesLoading || stampsLoading) && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}

            {/* Error State */}
            {itinerariesError && (
              <View style={styles.centerContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color={colors.error}
                />
                <Text style={styles.errorTitle}>
                  Unable to load itineraries
                </Text>
                <Text style={styles.errorMessage}>
                  {itinerariesError.message}
                </Text>
                <Button
                  title="Retry"
                  onPress={refetchItineraries}
                  variant="primary"
                />
              </View>
            )}

            {/* Empty State */}
            {!itinerariesLoading &&
              !itinerariesError &&
              itinerariesWithProgress.length === 0 && (
                <View style={styles.centerContainer}>
                  <Ionicons
                    name="map-outline"
                    size={48}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.emptyTitle}>
                    No itineraries available
                  </Text>
                </View>
              )}

            {/* Itinerary Cards (Requirement 2.3.1) */}
            {!itinerariesLoading &&
              !itinerariesError &&
              itinerariesWithProgress.length > 0 && (
                <View style={styles.itinerariesList}>
                  {itinerariesWithProgress.map(
                    ({
                      itinerary,
                      stampedCount,
                      totalStops,
                      pointsAvailable,
                    }) => (
                      <ItineraryCard
                        key={itinerary.id}
                        itinerary={itinerary}
                        stampedCount={stampedCount}
                        totalStops={totalStops}
                        pointsAvailable={pointsAvailable}
                        onPress={() => handleItineraryPress(itinerary.id)}
                        testID={`itinerary-card-${itinerary.id}`}
                      />
                    ),
                  )}
                </View>
              )}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    // No top padding
  },
  segmentedControlWrapper: {
    marginBottom: spacing.md,
  },
  chipsScrollView: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: -spacing.base, // Negative margin to allow full-width scroll
    paddingHorizontal: spacing.base,
  },
  chipsContainer: {
    gap: spacing.sm,
    paddingRight: spacing.base * 2, // Extra padding for last chip to have proper right margin
  },
  viewSwitchRow: {
    alignItems: "flex-end",
    marginBottom: spacing.md,
  },
  mapContainer: {
    marginTop: spacing.md,
  },
  sitesList: {
    gap: spacing.md,
  },
  itinerariesList: {
    gap: spacing.md,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    ...typography.titleMedium,
    color: colors.error,
    textAlign: "center",
  },
  errorMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.titleMedium,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
