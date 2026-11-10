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
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Cavite center coordinates
const CAVITE_CENTER: LngLat = [120.8783, 14.2456]; // [lng, lat]

export interface CaviteMapProps {
  sites?: Site[];
  onSitePress?: (siteId: string) => void;
  height: number;
  selectedLabel?: string;
}

export function CaviteMap({ sites = [], onSitePress, height, selectedLabel }: CaviteMapProps) {
  const cameraRef = useRef<CameraRef>(null);

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
        cameraRef.current.easeTo({
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
      <Map style={styles.map} mapStyle={mapStyle}>
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: CAVITE_CENTER,
            zoom: 10,
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

      {/* Floating label */}
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
    borderRadius: radii.card,
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
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    alignItems: 'center',
  },
  labelText: {
    ...typography.labelLarge,
    color: colors.primary,
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
