import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/theme';

/**
 * Scanner Screen (Placeholder)
 * 
 * Opens from the center Scan tab button.
 * Will contain permission gate, QR scanner viewfinder, and result modals.
 * Implemented in Scanner spec.
 */
export default function ScannerScreen() {
  return (
    <ScreenContainer
      scrollable={false}
      edges={['top', 'left', 'right', 'bottom']}
      testID="scanner-screen"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Scanner</Text>
        <Text style={styles.subtitle}>QR scanner coming soon</Text>
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
