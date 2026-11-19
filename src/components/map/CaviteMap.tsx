/**
 * CaviteMap Component
 * 
 * Renders an interactive map using MapLibre with Protomaps tiles.
 * Displays site pins, handles pin selection, and fits camera to visible sites.
 */

import type { Site } from '@/data/types';
import { colors, radii, spacing, typography } from '@/theme';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/theme/categories';
import { Ionicons } from '@expo/vector-icons';
import { Camera, Map, Marker, type CameraRef, type LngLat } from '@maplibre/maplibre-react-native';
import { memo, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

// Default top offset for 'right-below-controls' (Explore's floating filters)
const BELOW_CONTROLS_TOP = spacing.xl * 4;

// Cavite center coordinates
const CAVITE_CENTER: LngLat = [120.8833, 14.25]; // [lng, lat]

export interface CaviteMapProps {
  sites?: Site[];
  onSitePress?: (siteId: string) => void;
  /** Sites the user has stamped; their pins get a check mark */
  visitedSiteIds?: ReadonlySet<string>;
  /** Pin drawn enlarged, e.g. the one whose preview is open */
  selectedSiteId?: string | null;
  /** Tap on the map itself (not a pin), e.g. to dismiss a preview */
  onMapPress?: () => void;
  /**
   * Fixed map height. Omit to fill the parent (flex: 1) — the parent must
   * then have a bounded height.
   */
  height?: number;
  selectedLabel?: string;
  /**
   * Callback to control parent ScrollView's scroll state
   * Pass setScrollEnabled from parent to disable scrolling during map interaction
   */
  onMapInteractionChange?: (isInteracting: boolean) => void;
  /**
   * Whether to show control buttons (re-center, compass)
   * @default true
   */
  showControls?: boolean;
  /**
   * Whether to show blue border when interacting
   * @default true
   */
  showInteractionBorder?: boolean;
  /**
   * Position of control buttons
   * - 'top-right': Top right corner (12px from top)
   * - 'right-below-controls': Right side, positioned below floating controls (for Explore map)
   * @default 'top-right'
   */
  controlsPosition?: 'top-right' | 'right-below-controls';
  /**
   * With 'right-below-controls': how far from the top the controls start,
   * i.e. the measured height of the overlay above them. Defaults to 96.
   */
  controlsTop?: number;
}

function CaviteMapView({
  sites = [], 
  onSitePress, 
  visitedSiteIds,
  selectedSiteId,
  onMapPress,
  height, 
  selectedLabel, 
  onMapInteractionChange,
  showControls = true,
  showInteractionBorder = true,
  controlsPosition = 'top-right',
  controlsTop = BELOW_CONTROLS_TOP,
}: CaviteMapProps) {
  const cameraRef = useRef<CameraRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  // A pin tap can also reach the map's own onPress; ignore map taps briefly
  // after a pin tap so the pin's selection isn't immediately cleared.
  const pinPressGuard = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (pinPressGuard.current) clearTimeout(pinPressGuard.current);
  }, []);

  const handlePinPress = (siteId: string) => {
    if (pinPressGuard.current) clearTimeout(pinPressGuard.current);
    pinPressGuard.current = setTimeout(() => {
      pinPressGuard.current = null;
    }, 400);
    onSitePress?.(siteId);
  };

  const handleMapPress = () => {
    if (pinPressGuard.current) return;
    onMapPress?.();
  };

  const sizeStyle = height != null ? { height } : styles.fill;

  const apiKey = process.env.EXPO_PUBLIC_PROTOMAPS_API_KEY;

  // Style URL for Protomaps with API key
  const mapStyle = apiKey 
    ? `https://api.protomaps.com/styles/v2/light.json?key=${apiKey}`
    : 'https://demotiles.maplibre.org/style.json'; // Fallback demo style

  // Fit camera to sites when they change
  useEffect(() => {
    if (sites.length > 0 && cameraRef.current) {
      const coordinates: LngLat[] = sites.map(site => [site.longitude, site.latitude]);
      
      if (coordinates.length === 1) {
        // Single site: center on it
        cameraRef.current.flyTo({
          center: coordinates[0],
          zoom: 14,
          duration: 1000,
        });
      } else if (coordinates.length > 1) {
        // Multiple sites: fit bounds
        const lngs = coordinates.map(c => c[0]);
        const lats = coordinates.map(c => c[1]);
        
        // bounds: [west, south, east, north]
        const bounds: [number, number, number, number] = [
          Math.min(...lngs), // west
          Math.min(...lats), // south
          Math.max(...lngs), // east
          Math.max(...lats), // north
        ];
        
        cameraRef.current.fitBounds(bounds, {
          padding: { top: spacing.xl * 4, right: spacing.xl, bottom: spacing.xl, left: spacing.xl },
          duration: 1000,
        });
      }
    }
  }, [sites]);

  const handleRecenter = () => {
    if (!cameraRef.current) return;

    if (sites.length === 0) {
      // No sites: fly to Cavite center
      cameraRef.current.flyTo({
        center: CAVITE_CENTER,
        zoom: 9,
        duration: 1000,
      });
    } else if (sites.length === 1) {
      // Single site: fly to it
      const site = sites[0];
      cameraRef.current.flyTo({
        center: [site.longitude, site.latitude],
        zoom: 14,
        duration: 1000,
      });
    } else {
      // Multiple sites: fit bounds
      const lngs = sites.map(s => s.longitude);
      const lats = sites.map(s => s.latitude);
      
      const bounds: [number, number, number, number] = [
        Math.min(...lngs),
        Math.min(...lats),
        Math.max(...lngs),
        Math.max(...lats),
      ];
      
      cameraRef.current.fitBounds(bounds, {
        padding: { top: spacing.xl * 4, right: spacing.xl, bottom: spacing.xl, left: spacing.xl },
        duration: 1000,
      });
    }
  };

  if (!apiKey) {
    return (
      <View style={[styles.errorContainer, sizeStyle]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Map API key not configured</Text>
        <Text style={styles.errorSubtext}>
          Add EXPO_PUBLIC_PROTOMAPS_API_KEY to .env
        </Text>
      </View>
    );
  }

  // Handle map touch start - disable parent scrolling
  const handleTouchStart = (event: any) => {
    // Only handle touches on the map itself, not on buttons
    setIsInteracting(true);
    onMapInteractionChange?.(true);
  };

  // Handle map touch end - re-enable parent scrolling
  const handleTouchEnd = (event: any) => {
    setIsInteracting(false);
    onMapInteractionChange?.(false);
  };

  return (
    <View 
      style={[
        styles.container,
        sizeStyle,
        showInteractionBorder && isInteracting && styles.containerInteracting
      ]}
    >
      <View
        style={{ flex: 1 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
      <Map 
        style={styles.map} 
        mapStyle={mapStyle}
        onDidFinishLoadingMap={() => setIsMapLoaded(true)}
        onPress={onMapPress ? handleMapPress : undefined}
        compass={true}
        compassPosition={
          controlsPosition === 'right-below-controls'
            ? { top: controlsTop + 48, right: spacing.base } // Below re-center button (Explore map)
            : { top: spacing.md + 48, right: spacing.md } // Below re-center button (Detail screens)
        }
        logo={false}
        attribution={false}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: CAVITE_CENTER,
            zoom: 9,
          }}
        />

        {/* Site markers */}
        {sites.map((site) => {
          const isSelected = site.id === selectedSiteId;
          const isVisited = visitedSiteIds?.has(site.id) ?? false;

          return (
            // Taps go through the Marker's own onPress: MapLibre hit-tests
            // markers natively, so touch handlers on the child view never fire.
            <Marker
              key={site.id}
              id={site.id}
              lngLat={[site.longitude, site.latitude]}
              anchor="center"
              onPress={onSitePress ? () => handlePinPress(site.id) : undefined}
            >
              <View
                accessible
                accessibilityRole={onSitePress ? 'button' : 'image'}
                accessibilityLabel={`${site.name}, ${site.category}${isVisited ? ', visited' : ''}`}
                style={styles.markerHitArea}
              >
                <View
                  style={[
                    styles.marker,
                    isSelected && styles.markerSelected,
                    { backgroundColor: CATEGORY_COLORS[site.category] },
                  ]}
                >
                  <Ionicons
                    name={CATEGORY_ICONS[site.category]}
                    size={isSelected ? 20 : 16}
                    color={colors.background}
                  />
                </View>
                {isVisited && (
                  <View style={styles.visitedBadge}>
                    <Ionicons name="checkmark" size={10} color={colors.background} />
                  </View>
                )}
              </View>
            </Marker>
          );
        })}
      </Map>
      </View>

      {/* Control buttons - only show if showControls is true */}
      {showControls && (
        <>
          {/* Re-center button */}
          <Pressable 
            style={[
              styles.recenterButton,
              controlsPosition === 'right-below-controls' && [
                styles.recenterButtonBelowControls,
                { top: controlsTop },
              ],
            ]}
            onPress={handleRecenter}
            onPressIn={(e) => e.stopPropagation()}
          >
            <Ionicons name="locate" size={20} color={colors.primary} />
          </Pressable>
        </>
      )}

      {/* Loading banner */}
      {!isMapLoaded && (
        <View
          style={[
            styles.loadingBanner,
            controlsPosition === 'right-below-controls' && [
              styles.loadingBannerBelowControls,
              { top: controlsTop },
            ],
          ]}
        >
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>
            Loading map... This may take a few moments
          </Text>
        </View>
      )}

      {/* Floating label - bottom right */}
      {selectedLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{selectedLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radii.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fill: {
    flex: 1,
  },
  containerInteracting: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  map: {
    flex: 1,
  },
  // Fixed box big enough for the selected pin plus the visited badge, so a
  // pin growing on selection doesn't shift its anchor. Also the tap target:
  // MapLibre hit-tests against the marker view's bounds.
  markerHitArea: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  markerSelected: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
  },
  visitedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    bottom: spacing.lg, // More space from tab bar
    right: spacing.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelText: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingBanner: {
    position: 'absolute',
    top: spacing.md + 48, // Below re-center button only (40px button + 8px gap)
    left: spacing.base,
    right: spacing.base,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingBannerBelowControls: {
    // Explore map: the floating search row + chips cover the top, so sit in
    // the re-center button's row instead (top set from `controlsTop`) and
    // stop short of the button (40px wide + 8px gap).
    right: spacing.base + 40 + spacing.sm,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  recenterButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Below floating controls (search bar + chips); top set from `controlsTop`
  recenterButtonBelowControls: {
    right: spacing.base,
  },
  errorContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  errorText: {
    ...typography.titleMedium,
    color: colors.error,
    textAlign: 'center',
  },
  errorSubtext: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

/**
 * Memoized: the map renders a native marker per site, so it should only
 * re-render when its own props change. Pass stable callbacks (setters or
 * useCallback) and memoized `sites`/`visitedSiteIds` to benefit.
 */
export const CaviteMap = memo(CaviteMapView);
