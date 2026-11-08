import { colors, spacing, typography } from '@/theme';
import { type Category } from '@/data/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * SiteDescription Component
 * 
 * Displays site description section with category-specific heading.
 * Used in Site Information screen.
 * 
 * Validates: Requirements 3.2
 */

export interface SiteDescriptionProps {
  /**
   * Site category (for heading)
   */
  category: Category;

  /**
   * Site description text
   */
  description: string;

  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

export function SiteDescription({ category, description, testID }: SiteDescriptionProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.heading}>About the {category}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  heading: {
    ...typography.headlineSmall,
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
});
