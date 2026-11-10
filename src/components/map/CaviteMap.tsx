/**
 * CaviteMap Component
 * 
 * Renders an interactive map using MapLibre with Protomaps tiles.
 * Displays site pins, handles pin selection, and fits camera to visible sites.
 */

import type { Site } from '@/data/types';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Camera, Map, Marker, type CameraRef, type LngLat } from '@maplibre/maplibre-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

// Cavite center coordinates
const CAVITE_CENTER: LngLat = [120.8833, 14.25]; // [lng, lat]

export interface CaviteMapProps {
  sites?: Site[];
  onSitePress?: (siteId: string) => void;
  height: number;
  selectedLabel?: string;
}

export function CaviteMap({ sites = [], onSitePress, height, selectedLabel }: CaviteMapProps) {
  const cameraRef = useRef<CameraRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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
    if (cameraRef.current) {
      if (sites.length === 1) {
        // Single site: fly to it
        const site = sites[0];
        cameraRef.current.flyTo({
          center: [site.longitude, site.latitude],
          zoom: 14,
          duration: 1000,
        });
      } else if (sites.length > 1) {
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
    }
  };

  if (!apiKey) {
    return (
      <View style={[styles.errorContainer, { height }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Map API key not configured</Text>
        <Text style={styles.errorSubtext}>
          Add EXPO_PUBLIC_PROTOMAPS_API_KEY to .env
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <Map 
        style={styles.map} 
        mapStyle={mapStyle}
        onDidFinishLoadingMap={() => setIsMapLoaded(true)}
        compass={false}
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
        {sites.map((site) => (
          <Marker
            key={site.id}
            id={site.id}
            lngLat={[site.longitude, site.latitude]}
            anchor="center"
          >
            <Pressable onPress={() => onSitePress?.(site.id)}>
              <View style={[styles.marker, getCategoryMarkerStyle(site.category)]}>
                <Ionicons 
                  name={getCategoryIcon(site.category)} 
                  size={16} 
                  color={colors.background} 
                />
              </View>
            </Pressable>
          </Marker>
        ))}
      </Map>

      {/* Re-center button - right side below chips */}
      <Pressable 
        style={styles.recenterButton}
        onPress={handleRecenter}
      >
        <Ionicons name="locate" size={20} color={colors.primary} />
      </Pressable>

      {/* Compass button - below re-center button */}
      <Pressable 
        style={styles.compassButton}
        onPress={() => {
          // Reset map to north orientation at current center
          cameraRef.current?.easeTo({ 
            center: CAVITE_CENTER,
            bearing: 0, 
            zoom: 9,
            duration: 500 
          });
        }}
      >
        <Ionicons name="compass" size={20} color={colors.primary} />
      </Pressable>

      {/* Loading banner */}
      {!isMapLoaded && (
        <View style={styles.loadingBanner}>
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

// Helper: Get category-specific marker color
function getCategoryMarkerStyle(category: string) {
  switch (category) {
    case 'Dining':
      return { backgroundColor: '#F47B20' }; // accent
    case 'Staycation':
      return { backgroundColor: '#004987' }; // primary
    case 'Adventure':
      return { backgroundColor: '#2E9E5B' }; // success
    case 'Heritage':
      return { backgroundColor: '#8B5CF6' }; // purple
    case 'Festival':
      return { backgroundColor: '#EAB308' }; // yellow
    default:
      return { backgroundColor: colors.primary };
  }
}

// Helper: Get category-specific icon
function getCategoryIcon(category: string): any {
  switch (category) {
    case 'Dining':
      return 'restaurant';
    case 'Staycation':
      return 'bed';
    case 'Adventure':
      return 'trail-sign';
    case 'Heritage':
      return 'library';
    case 'Festival':
      return 'musical-notes';
    default:
      return 'location';
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    flex: 1,
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
    top: spacing.xl * 4.5, // Below re-center/compass buttons
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
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  recenterButton: {
    position: 'absolute',
    top: spacing.xl * 4, // More spacing below chips
    right: spacing.base,
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
  compassButton: {
    position: 'absolute',
    top: spacing.xl * 4 + 48, // Below re-center button (40px button + 8px gap)
    right: spacing.base,
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
