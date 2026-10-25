import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/theme';

/**
 * Scan Tab Screen (Placeholder)
 * 
 * This screen is NOT shown in the UI. The Scan tab button opens /scanner instead.
 * This file exists only to satisfy Expo Router's requirement for a route file.
 */
export default function ScanScreen() {
  return (
    <ScreenContainer
      scrollable={false}
      edges={['left', 'right']}
      testID="scan-screen"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Scan Placeholder</Text>
        <Text style={styles.subtitle}>
          This screen should not be visible.{'\n'}
          The Scan tab opens /scanner route instead.
        </Text>
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
