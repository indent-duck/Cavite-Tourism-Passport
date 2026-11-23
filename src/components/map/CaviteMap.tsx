/**
 * CaviteMap Component
 * 
 * Renders an interactive map using MapLibre with Protomaps tiles.
 * Displays site pins and route lines (e.g. expressways), handles selecting
 * either, and fits the camera to the selected route or everything shown.
 */

import type { Site } from '@/data/types';
import { getBounds, linePoints } from '@/lib/geo';
import { colors, radii, spacing, typography } from '@/theme';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/theme/categories';
import { Ionicons } from '@expo/vector-icons';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
  type CameraRef,
  type LineLayerSpecification,
  type LngLat,
  type LngLatBounds,
  type PressEventWithFeatures,
  type ViewPadding,
} from '@maplibre/maplibre-react-native';
import { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
} from 'react-native';

// Default top offset for 'right-below-controls' (Explore's floating filters)
const BELOW_CONTROLS_TOP = spacing.xl * 4;

// Cavite center coordinates
const CAVITE_CENTER: LngLat = [120.8833, 14.25]; // [lng, lat]
const CAVITE_ZOOM = 9;
const SINGLE_SITE_ZOOM = 14;
const CAMERA_DURATION = 1000;

// The re-center button, and the name label at the bottom (labelMedium line
// plus vertical padding): the camera keeps what it frames clear of both
const CONTROL_SIZE = 40;
const LABEL_HEIGHT = 32;

/**
 * Route lines go under this layer of the Protomaps style, so road and place
 * names stay readable on top of them. It must exist in the style: on Android
 * a layer whose beforeId is missing waits for it and is never drawn.
 */
const ROUTES_BELOW_LAYER = 'roads_labels_minor';

// Stable defaults, so a render without these props doesn't pass a new array
const NO_SITES: Site[] = [];
const NO_ROUTES: MapRoute[] = [];

/** A line on the map, e.g. an expressway */
export interface MapRoute {
  id: string;
  color: string;
  geometry: GeoJSON.LineString | GeoJSON.MultiLineString;
}

type CameraMove =
  | { kind: 'fly'; center: LngLat; zoom: number }
  | { kind: 'fit'; bounds: LngLatBounds; padding: ViewPadding };

/**
 * Where the camera goes: to the selected route, else to every route and pin
 * together. Null when there's nothing to frame.
 */
function getCameraMove(
  sites: Site[],
  routes: MapRoute[],
  selectedRouteId: string | null | undefined,
  padding: ViewPadding,
): CameraMove | null {
  const selectedRoute = routes.find((route) => route.id === selectedRouteId);
  const points = selectedRoute
    ? linePoints(selectedRoute.geometry)
    : [
        ...routes.flatMap((route) => linePoints(route.geometry)),
        ...sites.map((site) => [site.longitude, site.latitude]),
      ];

  const bounds = getBounds(points);
  if (!bounds) return null;

  const [west, south, east, north] = bounds;
  // A single pin: zoom in on it
  if (west === east && south === north) {
    return { kind: 'fly', center: [west, south], zoom: SINGLE_SITE_ZOOM };
  }
  return { kind: 'fit', bounds, padding };
}

function moveCamera(camera: CameraRef, move: CameraMove) {
  if (move.kind === 'fly') {
    camera.flyTo({ center: move.center, zoom: move.zoom, duration: CAMERA_DURATION });
  } else {
    camera.fitBounds(move.bounds, { padding: move.padding, duration: CAMERA_DURATION });
  }
}

type LinePaint = NonNullable<LineLayerSpecification['paint']>;
type LineLayout = NonNullable<LineLayerSpecification['layout']>;

/**
 * Route line styles. A selected route is drawn on top and wider, and the
 * others fade. Each line has a white casing so it stands out from the
 * basemap's own road lines.
 */
function getRouteStyles(selectedRouteId: string | null | undefined) {
  const selected = selectedRouteId ?? '';

  const opacity: LinePaint['line-opacity'] = selectedRouteId
    ? ['case', ['==', ['get', 'id'], selected], 1, 0.35]
    : 1;

  const layout: LineLayout = {
    'line-join': 'round',
    'line-cap': 'round',
    'line-sort-key': ['case', ['==', ['get', 'id'], selected], 1, 0],
  };

  const casing: LinePaint = {
    'line-color': colors.background,
    'line-width': ['case', ['==', ['get', 'id'], selected], 9, 7],
    'line-opacity': opacity,
  };

  const line: LinePaint = {
    'line-color': ['get', 'color'],
    'line-width': ['case', ['==', ['get', 'id'], selected], 6, 4],
    'line-opacity': opacity,
  };

  return { layout, casing, line };
}

export interface CaviteMapProps {
  sites?: Site[];
  onSitePress?: (siteId: string) => void;
  /** Sites the user has stamped; their pins get a check mark */
  visitedSiteIds?: ReadonlySet<string>;
  /** Pin drawn enlarged, e.g. the one whose preview is open */
  selectedSiteId?: string | null;
  /** Tap on the map itself (not a pin or route), e.g. to dismiss a preview */
  onMapPress?: () => void;
  /** Lines drawn under the pins and the map's labels, e.g. expressways */
  routes?: MapRoute[];
  /** Route drawn on top and wider while the others fade; the camera frames it */
  selectedRouteId?: string | null;
  /** Tap on a route's line */
  onRoutePress?: (routeId: string) => void;
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
  sites = NO_SITES,
  onSitePress,
  visitedSiteIds,
  selectedSiteId,
  onMapPress,
  routes = NO_ROUTES,
  selectedRouteId,
  onRoutePress,
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
  // A pin or route tap can also reach the map's own onPress; ignore map taps
  // briefly after one so its selection isn't immediately cleared.
  const featurePressGuard = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (featurePressGuard.current) clearTimeout(featurePressGuard.current);
  }, []);

  const guardMapPress = () => {
    if (featurePressGuard.current) clearTimeout(featurePressGuard.current);
    featurePressGuard.current = setTimeout(() => {
      featurePressGuard.current = null;
    }, 400);
  };

  const handlePinPress = (siteId: string) => {
    guardMapPress();
    onSitePress?.(siteId);
  };

  const handleRoutePress = (event: NativeSyntheticEvent<PressEventWithFeatures>) => {
    const routeId = event.nativeEvent.features[0]?.properties?.id;
    if (typeof routeId !== 'string') return;
    event.stopPropagation();
    guardMapPress();
    onRoutePress?.(routeId);
  };

  const handleMapPress = () => {
    if (featurePressGuard.current) return;
    onMapPress?.();
  };

  const sizeStyle = height != null ? { height } : styles.fill;

  const apiKey = process.env.EXPO_PUBLIC_PROTOMAPS_API_KEY;

  // Style URL for Protomaps with API key
  const mapStyle = apiKey 
    ? `https://api.protomaps.com/styles/v2/light.json?key=${apiKey}`
    : 'https://demotiles.maplibre.org/style.json'; // Fallback demo style

  // Room the camera leaves around what it frames: clear of the floating
  // controls and, while it shows, the name label at the bottom
  const fitPadding: ViewPadding = {
    top:
      controlsPosition === 'right-below-controls'
        ? spacing.xl * 4
        : showControls
          ? spacing.md + CONTROL_SIZE + spacing.sm
          : spacing.xl,
    right: spacing.xl,
    bottom: selectedLabel ? spacing.lg + LABEL_HEIGHT + spacing.sm : spacing.xl,
    left: spacing.xl,
  };

  const cameraMove = getCameraMove(sites, routes, selectedRouteId, fitPadding);
  // Keyed on the serialized move, so the camera moves when what it frames
  // changes, not on every render that rebuilds an equal one (that would pull
  // the camera back while the user is panning). Nothing to frame: stay put.
  const cameraMoveKey = cameraMove && JSON.stringify(cameraMove);

  useEffect(() => {
    if (!cameraMoveKey || !cameraRef.current) return;
    moveCamera(cameraRef.current, JSON.parse(cameraMoveKey) as CameraMove);
  }, [cameraMoveKey]);

  const handleRecenter = () => {
    if (!cameraRef.current) return;
    moveCamera(
      cameraRef.current,
      cameraMove ?? { kind: 'fly', center: CAVITE_CENTER, zoom: CAVITE_ZOOM },
    );
  };

  const routeFeatures: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: routes.map((route) => ({
      type: 'Feature',
      id: route.id,
      properties: { id: route.id, color: route.color },
      geometry: route.geometry,
    })),
  };
  const routeStyles = getRouteStyles(selectedRouteId);

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
            zoom: CAVITE_ZOOM,
          }}
        />

        {/* Route lines: casing first, so each line draws on its casing */}
        {routes.length > 0 && (
          <GeoJSONSource
            id="routes"
            data={routeFeatures}
            onPress={onRoutePress ? handleRoutePress : undefined}
          >
            <Layer
              id="route-casings"
              type="line"
              beforeId={ROUTES_BELOW_LAYER}
              layout={routeStyles.layout}
              paint={routeStyles.casing}
            />
            <Layer
              id="route-lines"
              type="line"
              beforeId={ROUTES_BELOW_LAYER}
              layout={routeStyles.layout}
              paint={routeStyles.line}
            />
          </GeoJSONSource>
        )}

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
 * useCallback) and memoized `sites`/`visitedSiteIds`/`routes` to benefit.
 */
export const CaviteMap = memo(CaviteMapView);
