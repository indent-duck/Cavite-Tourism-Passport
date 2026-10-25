import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/theme';

/**
 * Itinerary Detail Screen (Placeholder)
 * 
 * Detail screen showing complete itinerary information and included sites.
 * Implemented in Itineraries spec.
 */
export default function ItineraryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenContainer
      scrollable={true}
      edges={['left', 'right']}
      testID="itinerary-detail-screen"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Itinerary Detail</Text>
        <Text style={styles.subtitle}>Itinerary ID: {id}</Text>
        <Text style={styles.description}>Itinerary information coming soon</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
