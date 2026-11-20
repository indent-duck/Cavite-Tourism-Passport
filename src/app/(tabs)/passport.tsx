import { IdentityCard } from '@/components/passport/IdentityCard';
import { PassportPager } from '@/components/passport/PassportPager';
import { PassportSkeleton } from '@/components/passport/PassportSkeleton';
import { StampRequestsCard } from '@/components/passport/StampRequestsCard';
import type { StampHighlight } from '@/components/passport/StampReveal';
import { StampsCard } from '@/components/passport/StampsCard';
import { SummaryCard } from '@/components/passport/SummaryCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StateView } from '@/components/ui/StateView';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useEvents } from '@/hooks/useEvents';
import { useMarkStampRequestsSeen } from '@/hooks/useMarkStampRequestsSeen';
import { useRewardsWithEligibility } from '@/hooks/useRewardsWithEligibility';
import { useSites } from '@/hooks/useSites';
import { useStampRequests } from '@/hooks/useStampRequests';
import { useStamps } from '@/hooks/useStamps';
import { getUnseenResults } from '@/lib/stamp-requests';
import { colors, spacing } from '@/theme';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

const IDENTITY_PAGE = 0;
const STAMPS_PAGE = 1;

/**
 * Passport Tab Screen
 *
 * - Progress card: next reward to work toward + stamps collected per category
 * - Swipeable booklet pages: Identity Page and Visas & Stamps
 * - Opens on the Stamps page when the holder has any stamps
 * - Pull to refresh
 * - Coming back from the scanner (`?stamp=<id>&new=1&t=<nonce>`) switches to
 *   the Stamps page and animates that stamp in
 * - Physical-stamp requests: pending ones show as "Pending review" slots, a
 *   card below the booklet links to the request form / history and shows
 *   rejections, and a newly approved stamp animates in when the tab is focused
 *
 * Validates: Requirements 2.9, 2.10, 2.11
 */
export default function PassportScreen() {
  const params = useLocalSearchParams<{ stamp?: string; new?: string; t?: string }>();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [refreshing, setRefreshing] = useState(false);

  // null = not chosen by the user yet, so the default page applies
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const stampsQuery = useStamps();
  const sitesQuery = useSites();
  const eventsQuery = useEvents();
  const userQuery = useCurrentUser();
  // Rewards only feed the progress card's goal; failure hides the goal instead of the screen
  const rewardsQuery = useRewardsWithEligibility();
  const requestsQuery = useStampRequests();
  const { mutate: markRequestsSeen } = useMarkStampRequestsSeen();

  const stamps = stampsQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const user = userQuery.data;

  // Arriving from the scanner: highlight the stamp and switch to its page.
  // Adjusting state during render (keyed on the nonce) avoids an extra pass.
  const [handledScanKey, setHandledScanKey] = useState<string | undefined>(undefined);
  const [highlight, setHighlight] = useState<StampHighlight | null>(null);
  if (params.stamp && params.t && params.t !== handledScanKey) {
    setHandledScanKey(params.t);
    setHighlight({ stampId: params.stamp, celebrate: params.new === '1', key: params.t });
    setSelectedPage(STAMPS_PAGE);
  }

  // Bring the booklet into view for the highlighted stamp
  const highlightKey = highlight?.key;
  useEffect(() => {
    if (highlightKey) scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [highlightKey]);

  // Approved stamp requests the user hasn't seen, once their stamp has loaded:
  // animate the newest one in (like a fresh scan) while this tab is visible
  const unseenApprovals = getUnseenResults(requests).filter(
    (request) =>
      request.status === 'approved' && stamps.some((stamp) => stamp.id === request.stampId),
  );
  const newestApproval = unseenApprovals.reduce<(typeof unseenApprovals)[number] | undefined>(
    (newest, request) =>
      !newest || new Date(request.reviewedAt ?? 0) > new Date(newest.reviewedAt ?? 0) ? request : newest,
    undefined,
  );
  const approvalIds = unseenApprovals.map((request) => request.id).join(',');
  const revealStampId = newestApproval?.stampId;
  const revealRequestId = newestApproval?.id;
  useFocusEffect(
    useCallback(() => {
      if (!approvalIds || !revealStampId) return;
      setHighlight({ stampId: revealStampId, celebrate: true, key: `approved-${revealRequestId}` });
      setSelectedPage(STAMPS_PAGE);
      markRequestsSeen(approvalIds.split(','));
    }, [approvalIds, revealStampId, revealRequestId, markRequestsSeen]),
  );

  const page =
    selectedPage ?? (stamps.length > 0 || pendingRequests.length > 0 ? STAMPS_PAGE : IDENTITY_PAGE);

  const isLoading =
    stampsQuery.isLoading ||
    sitesQuery.isLoading ||
    eventsQuery.isLoading ||
    userQuery.isLoading ||
    requestsQuery.isLoading;
  const hasError =
    stampsQuery.isError || sitesQuery.isError || eventsQuery.isError || userQuery.isError;

  const refetchAll = () =>
    Promise.all([
      stampsQuery.refetch(),
      sitesQuery.refetch(),
      eventsQuery.refetch(),
      userQuery.refetch(),
      rewardsQuery.refetch(),
      requestsQuery.refetch(),
    ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenContainer
      scrollable={true}
      edges={['left', 'right']}
      withTabBarPadding={true}
      scrollViewRef={scrollRef}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      testID="passport-screen"
    >
      {isLoading ? (
        <PassportSkeleton />
      ) : hasError || !user ? (
        <StateView
          variant="error"
          title="Unable to load passport"
          message="Please check your connection and try again."
          actionLabel="Retry"
          onAction={refetchAll}
          style={styles.error}
          testID="passport-error"
        />
      ) : (
        <>
          <SummaryCard
            user={user}
            stamps={stamps}
            sites={sitesQuery.data ?? []}
            events={eventsQuery.data ?? []}
            rewards={rewardsQuery.data}
          />

          <View style={styles.pager}>
            <PassportPager
              index={page}
              onIndexChange={setSelectedPage}
              testID="passport-pager"
              pages={[
                { key: 'identity', label: 'Identity', content: <IdentityCard /> },
                {
                  key: 'stamps',
                  label: 'Stamps',
                  content: (
                    <StampsCard
                      stamps={stamps}
                      highlight={highlight}
                      pendingRequests={pendingRequests}
                    />
                  ),
                },
              ]}
            />
          </View>

          {/* Requests fail quietly: the booklet still works without them */}
          {!requestsQuery.isError && (
            <View style={styles.requests}>
              <StampRequestsCard
                requests={requests}
                stamps={stamps}
                onMarkSeen={markRequestsSeen}
              />
            </View>
          )}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pager: {
    marginTop: spacing.md,
  },
  requests: {
    marginTop: spacing.base,
  },
  error: {
    paddingVertical: spacing.huge,
  },
});
