import type { Expressway } from '@/data/types';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

export interface ExpresswayCardProps {
  expressway: Expressway;
  selected: boolean;
  onPress: (id: string) => void;
}

export function ExpresswayCard({ expressway, selected, onPress }: ExpresswayCardProps) {
  return (
    <Pressable
      onPress={() => onPress(expressway.id)}
      style={({ pressed }) => [
        styles.container,
        selected && styles.containerSelected,
        pressed && styles.containerPressed,
      ]}
    >
      <Ionicons name="git-network-outline" size={24} color={colors.textSecondary} />
      
      <Text style={styles.name}>{expressway.name}</Text>
      
      <Text style={styles.locationSpan}>{expressway.locationSpan}</Text>
      
      <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
        {expressway.description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.base,
    gap: spacing.sm,
  },
  containerSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}0D`, // 5% opacity
  },
  containerPressed: {
    opacity: 0.7,
  },
  name: {
    ...typography.headlineMedium,
    color: colors.text,
  },
  locationSpan: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
});
