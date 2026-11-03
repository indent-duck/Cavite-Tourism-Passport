import { IdentityCard } from '@/components/passport/IdentityCard';
import { StampsCard } from '@/components/passport/StampsCard';
import { SummaryCard } from '@/components/passport/SummaryCard';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useEvents } from '@/hooks/useEvents';
import { useSites } from '@/hooks/useSites';
import { useStamps } from '@/hooks/useStamps';
import { colors, spacing, typography } from '@/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type PassportView = 'identity' | 'stamps';

/**
 * Passport Tab Screen
 * 
 * Displays the user's digital tourism passport with:
 * - Summary card showing stamps collected, points balance, and overall completion
 * - Segmented toggle to switch between Identity Page and Visas & Stamps views
 * - Identity Page card with holder details, passport ID, and validity dates
 * - Visas & Stamps card with stamp slots grouped by category
 * - View Rewards button to navigate to rewards list
 * 
 * Validates: Requirements 2.9, 2.10, 2.11
 */
export default function PassportScreen() {
  const [view, setView] = useState<PassportView>('identity');
  
  // Fetch data
  const {
    data: stamps = [],
    isLoading: stampsLoading,
    isError: stampsError,
    refetch: refetchStamps,
  } = useStamps();
  
  // Sites and events hooks are needed - SummaryCard uses them to calculate total stamp slots
  const {
    data: sites = [],
    isLoading: sitesLoading,
    isError: sitesError,
    refetch: refetchSites,
  } = useSites();
  
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useEvents();

  // Loading state
  const isLoading = stampsLoading || sitesLoading || eventsLoading;
  
  // Error state
  const hasError = stampsError || sitesError || eventsError;

  // Handle retry
  const handleRetry = () => {
    refetchStamps();
    refetchSites();
    refetchEvents();
  };

  // Handle View Rewards button
  const handleViewRewards = () => {
    router.push('/rewards');
  };

  // Segmented control options
  const segmentedOptions = [
    { label: 'Identity Page', value: 'identity' },
    { label: `Visas & Stamps (${stamps.length})`, value: 'stamps' },
  ];

  return (
    <ScreenContainer
      scrollable={true}
      edges={['left', 'right']}
      withTabBarPadding={true}
      testID="passport-screen"
    >
      <View style={styles.container}>
        {/* Loading State */}
        {isLoading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading passport...</Text>
          </View>
        )}

        {/* Error State */}
        {!isLoading && hasError && (
          <View style={styles.centerContainer}>
            <Text style={styles.errorTitle}>Unable to load passport</Text>
            <Text style={styles.errorMessage}>
              Please check your connection and try again.
            </Text>
            <Button
              title="Retry"
              onPress={handleRetry}
              variant="accent"
              testID="passport-retry-button"
            />
          </View>
        )}

        {/* Loaded State */}
        {!isLoading && !hasError && (
          <>
            {/* Summary Card */}
            <SummaryCard />

            {/* Segmented Toggle */}
            <View style={styles.toggleContainer}>
              <SegmentedControl
                options={segmentedOptions}
                selectedValue={view}
                onValueChange={(value) => setView(value as PassportView)}
                testID="passport-view-toggle"
              />
            </View>

            {/* Passport Card - Identity or Stamps */}
            <View style={styles.cardContainer}>
              {view === 'identity' ? (
                <IdentityCard />
              ) : (
                <StampsCard stamps={stamps} />
              )}
            </View>

            {/* View Rewards Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="View Rewards"
                onPress={handleViewRewards}
                variant="accent"
                fullWidth
                testID="view-rewards-button"
              />
            </View>

            {/* Note Text */}
            <Text style={styles.noteText}>
              Collect stamps by scanning the QR code at each partner site.
            </Text>
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  errorTitle: {
    ...typography.headlineMedium,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  toggleContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  cardContainer: {
    marginBottom: spacing.base,
  },
  buttonContainer: {
    marginBottom: spacing.md,
  },
  noteText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
});
