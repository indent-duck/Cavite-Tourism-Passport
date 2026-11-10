import { OperatingHoursCard } from "@/components/explore/OperatingHoursCard";
import { SiteDescription } from "@/components/explore/SiteDescription";
import { SiteHeader } from "@/components/explore/SiteHeader";
import { CaviteMap } from "@/components/map/CaviteMap";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useSiteById } from "@/hooks/useSiteById";
import { useStamps } from "@/hooks/useStamps";
import { openInMaps } from "@/lib/open-maps";
import { colors, spacing, typography } from "@/theme";
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

  // Derive visited state from stamps
  const isVisited = React.useMemo(() => {
    if (!stamps || !site) return false;
    return stamps.some((stamp) => stamp.siteId === site.id);
  }, [stamps, site]);

  const isLoading = siteLoading || stampsLoading;

  // Handle back navigation
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/explore");
    }
  };

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

      {/* Location map and button */}
      <View style={styles.locationSection}>
        <CaviteMap height={200} />
        <Text style={styles.coordinates}>
          {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
        </Text>
        <Button
          title="Open in Maps"
          onPress={() => openInMaps(site.latitude, site.longitude, site.name)}
          variant="primary"
          fullWidth
        />
      </View>
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
  locationSection: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  coordinates: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
