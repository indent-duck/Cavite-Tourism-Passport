import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * OperatingHoursCard Component
 * 
 * Displays operating hours information in a card format.
 * Used in Site Information screen.
 * Returns null if no operating hours are provided.
 * 
 * Validates: Requirements 3.2
 */

export interface OperatingHoursCardProps {
  /**
   * Operating hours text (optional)
   */
  operatingHours: string | undefined;

  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

export function OperatingHoursCard({ operatingHours, testID }: OperatingHoursCardProps) {
  // Don't render if no operating hours provided
  if (!operatingHours) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <Ionicons name="time-outline" size={24} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Operating Hours</Text>
        <Text style={styles.hours}>{operatingHours}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginVertical: spacing.md,
    ...shadows.card,
  },
  iconContainer: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  heading: {
    ...typography.titleMedium,
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.xs,
  },
  hours: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
});
