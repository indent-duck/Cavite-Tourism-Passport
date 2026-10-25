import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/theme';

/**
 * Rewards List Screen (Placeholder)
 * 
 * List of available rewards and redemption options.
 * Opened from header points tap or passport "View rewards" button.
 * Implemented in Rewards spec.
 */
export default function RewardsScreen() {
  return (
    <ScreenContainer
      scrollable={true}
      edges={['left', 'right']}
      testID="rewards-screen"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Rewards</Text>
        <Text style={styles.subtitle}>Available rewards and redemption coming soon</Text>
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
