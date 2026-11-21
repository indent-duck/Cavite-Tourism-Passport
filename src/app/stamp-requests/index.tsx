import { ActionBar } from '@/components/detail/ActionBar';
import { InfoBanner } from '@/components/detail/InfoBanner';
import { StampRequestCard } from '@/components/stamp-requests/StampRequestCard';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StateView } from '@/components/ui/StateView';
import type { StampRequest } from '@/data/types';
import { useMarkStampRequestsSeen } from '@/hooks/useMarkStampRequestsSeen';
import { useStampRequests } from '@/hooks/useStampRequests';
import { useStamps } from '@/hooks/useStamps';
import { getSiteStampState, getUnseenResults } from '@/lib/stamp-requests';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

/**
 * Stamp Requests (history)
 *
 * Every physical-stamp request the user has sent, newest first, with its
 * review status. Rejected requests show the admin's reason and can be sent
 * again. Opening this screen marks the listed review results as seen (clears
 * the Passport tab dot).
 *
 * `?submitted=1` shows a confirmation banner after sending a request.
 */
export default function StampRequestsScreen() {
  const { submitted } = useLocalSearchParams<{ submitted?: string }>();
  const requestsQuery = useStampRequests();
  const stampsQuery = useStamps();
  const markSeen = useMarkStampRequestsSeen();
  const [refreshing, setRefreshing] = useState(false);

  const requests = requestsQuery.data ?? [];
  const stamps = stampsQuery.data ?? [];
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Results listed when the screen comes into focus count as seen. Read from
  // the cache at focus time on purpose: results that arrive while the screen
  // is open (e.g. on pull to refresh) stay unseen, so the Passport tab can
  // still show the dot and play the approval reveal.
  const queryClient = useQueryClient();
  const { mutate: markSeenMutate } = markSeen;
  useFocusEffect(
    useCallback(() => {
      const cached = queryClient.getQueryData<StampRequest[]>(['stampRequests']) ?? [];
      const unseenIds = getUnseenResults(cached).map((request) => request.id);
      if (unseenIds.length > 0) markSeenMutate(unseenIds);
    }, [queryClient, markSeenMutate]),
  );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/passport');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([requestsQuery.refetch(), stampsQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  const isLoading = requestsQuery.isLoading || stampsQuery.isLoading;
  const hasError = requestsQuery.isError || stampsQuery.isError;

  return (
    <View style={styles.root}>
      <ScreenContainer
        showHeader
        headerTitle="Stamp requests"
        onBackPress={handleBack}
        scrollable
        edges={['top', 'left', 'right']}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        testID="stamp-requests-screen"
      >
        {submitted === '1' && (
          <InfoBanner
            icon="paper-plane"
            tint={colors.successLight}
            color={colors.successDark}
            title="Request sent"
            body="We'll review your photo and add the stamp to your passport once it's approved."
            testID="stamp-request-submitted-banner"
          />
        )}

        {isLoading ? (
          <StateView variant="loading" style={styles.state} />
        ) : hasError ? (
          <StateView
            variant="error"
            title="Unable to load your requests"
            message="Please check your connection and try again."
            actionLabel="Retry"
            onAction={handleRefresh}
            style={styles.state}
          />
        ) : sortedRequests.length === 0 ? (
          <StateView
            variant="empty"
            icon="document-text-outline"
            title="No stamp requests yet"
            message="Got a stamp in your physical passport? Send a photo of it and we'll add it to your digital passport."
            style={styles.state}
          />
        ) : (
          <View style={styles.list}>
            {sortedRequests.map((request) => {
              const canResubmit =
                request.status === 'rejected' &&
                getSiteStampState(request.siteId, stamps, requests) === 'available';
              return (
                <StampRequestCard
                  key={request.id}
                  request={request}
                  onResubmit={
                    canResubmit
                      ? () =>
                          router.push({
                            pathname: '/stamp-requests/new',
                            params: { siteId: request.siteId },
                          })
                      : undefined
                  }
                />
              );
            })}
          </View>
        )}
      </ScreenContainer>

      <ActionBar>
        <Button
          title="New request"
          onPress={() => router.push('/stamp-requests/new')}
          variant="accent"
          fullWidth
          icon={<Ionicons name="add" size={20} color={colors.background} />}
          testID="stamp-requests-new-button"
        />
      </ActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.base,
    gap: spacing.base,
  },
  list: {
    gap: spacing.md,
  },
  state: {
    paddingVertical: spacing.huge,
  },
});
