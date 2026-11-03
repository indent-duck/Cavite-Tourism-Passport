import { PointsSummaryCard } from '@/components/rewards/PointsSummaryCard';
import { RewardCard } from '@/components/rewards/RewardCard';
import type { Category } from '@/data/types';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRewardsWithEligibility } from '@/hooks/useRewardsWithEligibility';
import { useStamps } from '@/hooks/useStamps';
import { colors, spacing, typography } from '@/theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Rewards List Screen
 * 
 * Displays the points summary card and a list of all available rewards
 * with their eligibility status. Users can browse rewards and tap to
 * view details.
 * 
 * Entry points:
 * - Header points tap
 * - Passport "View Rewards" button
 * - Account "Redemptions & Vouchers" row (if exists)
 * 
 * Layout:
 * - Custom header with back button, Cavite seal, title, and points badge
 * - Points summary card showing total points and category stamp progress
 * - Section header "Official Souvenirs & Perks" with item count
 * - Scrollable list of reward cards
 * 
 * Validates: Requirements 5.1 (Rewards List Screen)
 */
export default function RewardsScreen() {
  const insets = useSafeAreaInsets();

  // Fetch user data for points
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useCurrentUser();

  // Fetch user's stamps to determine collected categories
  const {
    data: stamps,
    isLoading: isLoadingStamps,
    error: stampsError,
  } = useStamps();

  // Fetch all rewards with eligibility in a single query
  const {
    data: rewardsWithEligibility,
    isLoading: isLoadingRewards,
    error: rewardsError,
  } = useRewardsWithEligibility();

  // Determine which categories have stamps
  const collectedCategories = React.useMemo(() => {
    if (!stamps || stamps.length === 0) return [];
    
    // Get unique categories from user's stamps
    const uniqueCategories = new Set<Category>();
    stamps.forEach(stamp => {
      uniqueCategories.add(stamp.siteCategory);
    });
    
    return Array.from(uniqueCategories);
  }, [stamps]);

  // Handle loading state
  const isLoading = isLoadingUser || isLoadingStamps || isLoadingRewards;
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {/* Custom Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={spacing.md}
              >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </Pressable>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1VAqK3yvSmlr7OU4VVIPwngssTm7naSnr1EMiWEdbNqDtb_u6sSniMylGsdG573XPEX60s7yHY4nbQtCvMNC7EyHvdzZ8Yogoaexxlua7GW0cXFQba-ym8m5lYpV9G8R689XKm5nt1rBtn2aAiLxrjlAkkIIrxMkvvMBmPCLonpDaTL_9eveCZX9ztzo8p8mCYg58NCG7sZVFfl6s609Dq4kvg9dVE1HMvbV7WeWa0YR7njnw_zA750dQQ8' }}
                style={styles.caviteSeal}
              />
              <Text style={styles.headerTitle}>Rewards Hub</Text>
            </View>
            <View style={styles.pointsBadge}>
              <MaterialIcons name="stars" size={16} color={colors.accent} />
              <Text style={styles.pointsBadgeText}>{user?.points || 0} pts</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </View>
    );
  }

  // Handle error state
  const error = userError || stampsError || rewardsError;
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {/* Custom Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={spacing.md}
              >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </Pressable>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1VAqK3yvSmlr7OU4VVIPwngssTm7naSnr1EMiWEdbNqDtb_u6sSniMylGsdG573XPEX60s7yHY4nbQtCvMNC7EyHvdzZ8Yogoaexxlua7GW0cXFQba-ym8m5lYpV9G8R689XKm5nt1rBtn2aAiLxrjlAkkIIrxMkvvMBmPCLonpDaTL_9eveCZX9ztzo8p8mCYg58NCG7sZVFfl6s609Dq4kvg9dVE1HMvbV7WeWa0YR7njnw_zA750dQQ8' }}
                style={styles.caviteSeal}
              />
              <Text style={styles.headerTitle}>Rewards Hub</Text>
            </View>
            <View style={styles.pointsBadge}>
              <MaterialIcons name="stars" size={16} color={colors.accent} />
              <Text style={styles.pointsBadgeText}>{user?.points || 0} pts</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Unable to Load Rewards</Text>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </Text>
        </View>
      </View>
    );
  }

  // Handle empty state
  if (!rewardsWithEligibility || rewardsWithEligibility.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {/* Custom Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={spacing.md}
              >
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
              </Pressable>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1VAqK3yvSmlr7OU4VVIPwngssTm7naSnr1EMiWEdbNqDtb_u6sSniMylGsdG573XPEX60s7yHY4nbQtCvMNC7EyHvdzZ8Yogoaexxlua7GW0cXFQba-ym8m5lYpV9G8R689XKm5nt1rBtn2aAiLxrjlAkkIIrxMkvvMBmPCLonpDaTL_9eveCZX9ztzo8p8mCYg58NCG7sZVFfl6s609Dq4kvg9dVE1HMvbV7WeWa0YR7njnw_zA750dQQ8' }}
                style={styles.caviteSeal}
              />
              <Text style={styles.headerTitle}>Rewards Hub</Text>
            </View>
            <View style={styles.pointsBadge}>
              <MaterialIcons name="stars" size={16} color={colors.accent} />
              <Text style={styles.pointsBadgeText}>{user?.points || 0} pts</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>No Rewards Available</Text>
          <Text style={styles.emptyText}>
            Check back later for new rewards and prizes
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={spacing.md}
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </Pressable>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1VAqK3yvSmlr7OU4VVIPwngssTm7naSnr1EMiWEdbNqDtb_u6sSniMylGsdG573XPEX60s7yHY4nbQtCvMNC7EyHvdzZ8Yogoaexxlua7GW0cXFQba-ym8m5lYpV9G8R689XKm5nt1rBtn2aAiLxrjlAkkIIrxMkvvMBmPCLonpDaTL_9eveCZX9ztzo8p8mCYg58NCG7sZVFfl6s609Dq4kvg9dVE1HMvbV7WeWa0YR7njnw_zA750dQQ8' }}
              style={styles.caviteSeal}
            />
            <Text style={styles.headerTitle}>Rewards Hub</Text>
          </View>
          <View style={styles.pointsBadge}>
            <MaterialIcons name="stars" size={16} color={colors.accent} />
            <Text style={styles.pointsBadgeText}>{user?.points || 0} pts</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Points Summary Card */}
        <PointsSummaryCard
          points={user?.points || 0}
          stampCategories={collectedCategories}
          testID="rewards-points-summary"
        />

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Official Souvenirs & Perks</Text>
            <Text style={styles.sectionSubtitle}>
              Redeem in-person at Cavite Provincial Tourism Desks
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {rewardsWithEligibility.length} {rewardsWithEligibility.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>
        </View>

        {/* Rewards List */}
        <FlatList
          data={rewardsWithEligibility}
          keyExtractor={(item) => item.reward.id}
          renderItem={({ item }) => (
            <RewardCard
              reward={item.reward}
              eligibility={item.eligibility}
              onPress={() => router.push(`/rewards/${item.reward.id}`)}
              testID={`reward-card-${item.reward.id}`}
            />
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.rewardsList}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  caviteSeal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: spacing.xs,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent}15`,
    borderWidth: 1,
    borderColor: `${colors.accent}25`,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    gap: 4,
  },
  pointsBadgeText: {
    ...typography.labelMedium,
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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
  errorText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyTitle: {
    ...typography.headlineMedium,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: spacing.base,
    marginBottom: spacing.base,
  },
  sectionHeaderText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineMedium,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  countBadgeText: {
    ...typography.labelSmall,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  rewardsList: {
    gap: spacing.base,
  },
});
