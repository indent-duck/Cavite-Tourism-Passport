import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/theme';

/**
 * Passport Tab Screen (Placeholder)
 * 
 * Will contain passport summary card and Identity Page / Visas & Stamps toggle.
 * Implemented in Passport spec.
 */
export default function PassportScreen() {
  return (
    <ScreenContainer
      scrollable={true}
      edges={['left', 'right']}
      withTabBarPadding={true}
      testID="passport-screen"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Passport</Text>
        <Text style={styles.subtitle}>Digital passport coming soon</Text>
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
