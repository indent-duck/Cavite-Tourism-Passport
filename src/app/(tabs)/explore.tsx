import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/theme';

/**
 * Explore Tab Screen (Placeholder)
 * 
 * Will contain Sites and Itineraries toggle views.
 * Implemented in Explore spec.
 */
export default function ExploreScreen() {
  return (
    <ScreenContainer
      scrollable={true}
      edges={['left', 'right']}
      withTabBarPadding={true}
      testID="explore-screen"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Sites and Itineraries coming soon</Text>
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
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
