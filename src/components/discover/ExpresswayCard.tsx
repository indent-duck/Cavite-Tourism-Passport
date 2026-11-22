import type { Expressway } from '@/data/types';
import { Card } from '@/components/ui/Card';
import { colors, radii, spacing, typography } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export interface ExpresswayCardProps {
  expressway: Expressway;
  selected: boolean;
  onPress: (id: string) => void;
}

/**
 * Compact expressway card, sized for a horizontal row under the province map
 * so the map stays in view while the user picks one.
 */
export function ExpresswayCard({ expressway, selected, onPress }: ExpresswayCardProps) {
  return (
    <Card
      onPress={() => onPress(expressway.id)}
      accessibilityState={{ selected }}
      accessibilityLabel={`${expressway.name}, ${expressway.locationSpan}`}
      style={[styles.container, selected && styles.containerSelected]}
      contentStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={[styles.iconChip, selected && styles.iconChipSelected]}>
          <MaterialCommunityIcons
            name="highway"
            size={18}
            color={selected ? colors.background : colors.primary}
          />
        </View>
        {expressway.length ? (
          <Text style={[styles.length, selected && styles.lengthSelected]}>
            {expressway.length}
          </Text>
        ) : null}
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {expressway.name}
      </Text>
      <Text style={styles.locationSpan} numberOfLines={1}>
        {expressway.locationSpan}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 176,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipSelected: {
    backgroundColor: colors.primary,
  },
  length: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  lengthSelected: {
    color: colors.primary,
  },
  name: {
    ...typography.titleMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
  locationSpan: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
