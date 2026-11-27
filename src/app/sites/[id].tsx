import { OperatingHoursCard } from "@/components/explore/OperatingHoursCard";
import { SiteDescription } from "@/components/explore/SiteDescription";
import { SiteHeader } from "@/components/explore/SiteHeader";
import { SiteStampSection } from "@/components/explore/SiteStampSection";
import { LocationMapSection } from "@/components/map/LocationMapSection";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useSiteById } from "@/hooks/useSiteById";
import { useStampRequests } from "@/hooks/useStampRequests";
import { useStamps } from "@/hooks/useStamps";
import { getPendingRequest, getSiteStampState } from "@/lib/stamp-requests";
import { colors, spacing, typography } from "@/theme";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/theme/categories";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/**
 * Site Information Panel
 *
 * Detail screen showing complete site information including:
 * - Header with visited badge, name, category, points, address
 * - Single placeholder photo
 * - Description section
 * - Operating hours
 * - Collect this stamp (request a digital stamp for a physical one, or the
 *   pending request's status)
 *
 * Validates: Requirements 3.2
 */
export default function SiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: site,
    isLoading: siteLoading,
    error: siteError,
    refetch: refetchSite,
  } = useSiteById(id);
  const { data: stamps, isLoading: stampsLoading } = useStamps();
  // Optional: without requests the site still shows, just without the pending state
  const { data: stampRequests } = useStampRequests();

  // Scroll control state for map interaction
  const [scrollEnabled, setScrollEnabled] = React.useState(true);
  const scrollViewRef = React.useRef<any>(null);

  // Derive visited state from stamps
  const isVisited = React.useMemo(() => {
    if (!stamps || !site) return false;
    return stamps.some((stamp) => stamp.siteId === site.id);
  }, [stamps, site]);

  const stampState = site
    ? getSiteStampState(site.id, stamps ?? [], stampRequests ?? [])
    : "available";
  const pendingRequest = site ? getPendingRequest(site.id, stampRequests ?? []) : undefined;

  const isLoading = siteLoading || stampsLoading;

  // Handle back navigation
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/explore");
    }
  };

  // Handle map interaction state changes
  const handleMapInteractionChange = React.useCallback((isInteracting: boolean) => {
    setScrollEnabled(!isInteracting);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer
        showHeader
        headerTitle="Site Information"
        onBackPress={handleBackPress}
        scrollable={false}
        edges={["top", "left", "right", "bottom"]}
        testID="site-detail-screen"
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // Error state
  if (siteError) {
    return (
      <ScreenContainer
        showHeader
        headerTitle="Site Information"
        onBackPress={handleBackPress}
        scrollable={false}
        edges={["top", "left", "right", "bottom"]}
        testID="site-detail-screen"
      >
        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.error}
          />
          <Text style={styles.errorTitle}>Unable to load site</Text>
          <Text style={styles.errorMessage}>{siteError.message}</Text>
          <Button
            title="Retry"
            onPress={() => refetchSite()}
            variant="primary"
          />
        </View>
      </ScreenContainer>
    );
  }

  // Not found state
  if (!site) {
    return (
      <ScreenContainer
        showHeader
        headerTitle="Site Information"
        onBackPress={handleBackPress}
        scrollable={false}
        edges={["top", "left", "right", "bottom"]}
        testID="site-detail-screen"
      >
        <View style={styles.centerContainer}>
          <Ionicons
            name="location-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>Site not found</Text>
          <Text style={styles.emptyMessage}>
            The site you&apos;re looking for could not be found.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Main content
  return (
    <ScreenContainer
      showHeader
      headerTitle="Site Information"
      onBackPress={handleBackPress}
      scrollable={true}
      scrollEnabled={scrollEnabled}
      scrollViewRef={scrollViewRef}
      edges={["top", "left", "right", "bottom"]}
      testID="site-detail-screen"
    >
      {/* Single placeholder photo */}
      <View style={styles.photo}>
        <Ionicons name="image-outline" size={64} color={colors.textSecondary} />
      </View>

      {/* Site header with visited badge, name, category, points, address */}
      <SiteHeader site={site} isVisited={isVisited} />

      {/* Description section */}
      <SiteDescription
        category={site.category}
        description={site.description}
      />

      {/* Operating hours card */}
      <OperatingHoursCard operatingHours={site.operatingHours} />

      {/* Collect this stamp / request under review */}
      <SiteStampSection
        siteId={site.id}
        state={stampState}
        pendingRequest={pendingRequest}
        testID="site-stamp-section"
      />

      {/* Location map and button */}
      <LocationMapSection
        latitude={site.latitude}
        longitude={site.longitude}
        locationName={site.name}
        pinColor={CATEGORY_COLORS[site.category]}
        pinIcon={CATEGORY_ICONS[site.category]}
        onMapInteractionChange={handleMapInteractionChange}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.base,
  },
  photo: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  errorTitle: {
    ...typography.headlineMedium,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  errorMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  emptyTitle: {
    ...typography.headlineMedium,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  emptyMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
