/**
 * LocationMapSection Component
 * 
 * Reusable component that displays a map zoomed in on the location's pin,
 * its coordinates, and an "Open in Maps" button. Used in Site and Event
 * detail screens.
 */

import { CaviteMap, type MapPin } from '@/components/map/CaviteMap';
import { Button } from '@/components/ui/Button';
import { openInMaps } from '@/lib/open-maps';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface LocationMapSectionProps {
  /**
   * Latitude coordinate
   */
  latitude: number;

  /**
   * Longitude coordinate
   */
  longitude: number;

  /**
   * Location name for opening in maps
   */
  locationName: string;

  /**
   * Pin color, e.g. the site's or event's category color
   */
  pinColor: string;

  /**
   * Pin icon, e.g. the site's or event's category icon
   */
  pinIcon: MapPin['icon'];

  /**
   * Optional label to show above the coordinates
   * e.g., "Navigate to Aguinaldo Shrine"
   */
  label?: string;

  /**
   * Callback when map interaction state changes
   */
  onMapInteractionChange: (isInteracting: boolean) => void;
}

export function LocationMapSection({
  latitude,
  longitude,
  locationName,
  pinColor,
  pinIcon,
  label,
  onMapInteractionChange,
}: LocationMapSectionProps) {
  const handleOpenMaps = () => {
    openInMaps(latitude, longitude, locationName);
  };

  const pins: MapPin[] = [
    {
      id: 'location',
      latitude,
      longitude,
      color: pinColor,
      icon: pinIcon,
      accessibilityLabel: locationName,
    },
  ];

  return (
    <View style={styles.container}>
      {/* fitOnLoad: open on the pin. A camera move after mount would be
          dropped on Android, since the map's style hasn't loaded yet. */}
      <CaviteMap
        height={280}
        pins={pins}
        fitOnLoad
        onMapInteractionChange={onMapInteractionChange}
      />
      
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Text style={styles.coordinates}>
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Text>
      
      <Button
        title="Open in Maps"
        onPress={handleOpenMaps}
        variant="primary"
        fullWidth
        icon={<Ionicons name="navigate-outline" size={20} color={colors.background} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  coordinates: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
