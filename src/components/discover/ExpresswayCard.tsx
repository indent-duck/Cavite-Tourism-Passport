import type { Expressway } from '@/data/types';
import { Card } from '@/components/ui/Card';
import { colors, radii, spacing, typography } from '@/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

/** Card width, for scrolling the row to a card */
export const EXPRESSWAY_CARD_WIDTH = 176;

const BORDER_WIDTH = 2;

export interface ExpresswayCardProps {
  expressway: Expressway;
  selected: boolean;
  onPress: (id: string) => void;
  /** The expressway's line color on the map, so the card matches its line */
  color?: string;
}

/**
 * Compact expressway card, sized for a horizontal row under the province map
 * so the map stays in view while the user picks one.
 */
export function ExpresswayCard({
  expressway,
  selected,
  onPress,
  color = colors.primary,
}: ExpresswayCardProps) {
  return (
    <Card
      onPress={() => onPress(expressway.id)}
      accessibilityState={{ selected }}
      accessibilityLabel={`${expressway.name}, ${expressway.locationSpan}`}
      style={[
        styles.container,
        selected && { borderColor: color, backgroundColor: colors.background },
      ]}
      contentStyle={[
        styles.content,
        // 8% tint of the line color on the inner layer, over the outer
        // layer's opaque white: on the outer layer (which draws the shadow)
        // Android shows the shadow through a translucent background
        selected && { backgroundColor: `${color}14` },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconChip,
            // 12% tint while not selected, solid once selected
            { backgroundColor: selected ? color : `${color}1F` },
          ]}
        >
          <MaterialCommunityIcons
            name="highway"
            size={18}
            color={selected ? colors.background : color}
          />
        </View>
        {expressway.length ? (
          <Text style={[styles.length, selected && { color }]}>
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
    width: EXPRESSWAY_CARD_WIDTH,
    backgroundColor: colors.surface,
    borderWidth: BORDER_WIDTH,
    borderColor: 'transparent',
  },
  content: {
    // Follows the inside edge of the border, so the selected tint reaches
    // into the corners
    borderRadius: radii.card - BORDER_WIDTH,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  length: {
    ...typography.labelMedium,
    color: colors.textSecondary,
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
