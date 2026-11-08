/**
 * Placeholder map component.
 * 
 * Replace the body with a MapLibre implementation later and keep the props.
 * The real map will use @maplibre/maplibre-react-native with Protomaps tiles.
 */

import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { Expressway, MapPin } from '@/data/types';

export interface CaviteMapProps {
  // For future real map implementation:
  pins?: MapPin[];
  expressways?: Expressway[];
  selectedId?: string;
  onPinPress?: (id: string) => void;
  interactive?: boolean;

  // Used by placeholder:
  height: number;
  selectedLabel?: string; // e.g., "Selected: CAVITEX"
}

export function CaviteMap({ height, selectedLabel }: CaviteMapProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Ionicons name="map-outline" size={48} color={colors.textSecondary} />
      <Text style={styles.text}>Map coming soon</Text>
      {selectedLabel && (
        <Text style={styles.selectedText}>{selectedLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  selectedText: {
    ...typography.labelLarge,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
