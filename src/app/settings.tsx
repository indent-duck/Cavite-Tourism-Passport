import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/theme';

/**
 * Settings Screen (Placeholder)
 * 
 * Opened from gear icon on Account screen.
 * Contains app settings and preferences.
 * Implemented in Settings spec.
 */
export default function SettingsScreen() {
  return (
    <ScreenContainer
      scrollable={true}
      edges={['left', 'right']}
      testID="settings-screen"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>App settings coming soon</Text>
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
