import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useActiveClaim } from '@/hooks/useActiveClaim';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGenerateClaimQR } from '@/hooks/useGenerateClaimQR';
import { useRewardById } from '@/hooks/useRewardById';
import { useRewardEligibility } from '@/hooks/useRewardEligibility';
import { useSimulateClaim } from '@/hooks/useSimulateClaim';
import { colors, spacing, typography } from '@/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * Reward Detail Screen
 * 
 * Shows complete reward information and redemption options.
 * Six states: Locked, Eligible, QR Generated, Expired, Already Claimed, No Longer Available
 * 
 * Requirements: Viewing Reward Detail states
 */
export default function RewardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Extract reward ID from params
  const rewardId = Array.isArray(id) ? id[0] : id;

  // Fetch reward data, eligibility, user data, and active claim status
  const { data: reward, isLoading: isLoadingReward, error: rewardError } = useRewardById(rewardId);
  const { data: eligibility, isLoading: isLoadingEligibility } = useRewardEligibility(rewardId);
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { data: activeClaim, isLoading: isLoadingActiveClaim } = useActiveClaim(rewardId);

  // Mutations for generating claim QR and simulating officer scan (dev only)
  const generateClaimQRMutation = useGenerateClaimQR();
  const simulateClaimMutation = useSimulateClaim(rewardId);

  // Loading state - show loading indicator while any required data is loading
  const isLoading = isLoadingReward || isLoadingEligibility || isLoadingUser || isLoadingActiveClaim;

  // Error state - show error message if reward not found
  if (rewardError) {
    return (
      <ScreenContainer
        scrollable={true}
        showHeader={true}
        headerTitle="Reward Details"
        onBackPress={() => router.back()}
        testID="reward-detail-screen"
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load reward</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            testID="error-back-button"
          />
        </View>
      </ScreenContainer>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <ScreenContainer
        scrollable={true}
        showHeader={true}
        headerTitle="Reward Details"
        onBackPress={() => router.back()}
        testID="reward-detail-screen"
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading reward details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Reward not found
  if (!reward) {
    return (
      <ScreenContainer
        scrollable={true}
        showHeader={true}
        headerTitle="Reward Details"
        onBackPress={() => router.back()}
        testID="reward-detail-screen"
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Reward not found</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            testID="not-found-back-button"
          />
        </View>
      </ScreenContainer>
    );
  }

  // State determination logic (task 6.2)
  // Determines which of the six reward states to display based on user data, reward availability, and active claims
  
  type RewardState = 'locked' | 'eligible' | 'qr-generated' | 'expired' | 'already-claimed' | 'no-longer-available';
  
  const determineRewardState = (): RewardState => {
    // Priority 1: User has already claimed a reward this promo period (affects all rewards)
    if (user?.hasClaimedThisPeriod) {
      return 'already-claimed';
    }
    
    // Priority 2: Reward is no longer available (sold out limited reward)
    if (!reward.available && reward.limited && reward.remainingClaims === 0) {
      return 'no-longer-available';
    }
    
    // Priority 3: Active claim exists - check if QR is generated or expired
    if (activeClaim) {
      const now = Date.now();
      const expiresAt = activeClaim.expiresAt.getTime();
      
      if (expiresAt > now) {
        return 'qr-generated';
      } else {
        return 'expired';
      }
    }
    
    // Priority 4: Check eligibility
    if (eligibility?.eligible) {
      return 'eligible';
    }
    
    // Default: Locked state
    return 'locked';
  };
  
  const rewardState = determineRewardState();
  
  // TODO: Render different states based on state determination (tasks 6.3-6.9)

  return (
    <ScreenContainer
      scrollable={true}
      showHeader={true}
      headerTitle="Reward Details"
      onBackPress={() => router.back()}
      testID="reward-detail-screen"
    >
      <View style={styles.container}>
        <Text style={styles.title}>{reward.title}</Text>
        <Text style={styles.subtitle}>Reward ID: {rewardId}</Text>
        <Text style={styles.description}>
          State determination and rendering will be implemented in tasks 6.2-6.9
        </Text>
        
        {/* Dev info for testing */}
        {__DEV__ && (
          <View style={styles.devInfo}>
            <Text style={styles.devInfoTitle}>Dev Info:</Text>
            <Text style={styles.devInfoText}>
              - Current State: {rewardState.toUpperCase()}
            </Text>
            <Text style={styles.devInfoText}>
              - Reward: {reward.title}
            </Text>
            <Text style={styles.devInfoText}>
              - Eligibility: {eligibility?.eligible ? 'Eligible' : 'Not Eligible'}
            </Text>
            <Text style={styles.devInfoText}>
              - Active Claim: {activeClaim ? 'Yes' : 'No'}
            </Text>
            {activeClaim && (
              <Text style={styles.devInfoText}>
                - QR Expires: {new Date(activeClaim.expiresAt).toLocaleTimeString()}
              </Text>
            )}
            <Text style={styles.devInfoText}>
              - User Points: {user?.points ?? 0}
            </Text>
            <Text style={styles.devInfoText}>
              - Has Claimed: {user?.hasClaimedThisPeriod ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.devInfoText}>
              - Reward Available: {reward.available ? 'Yes' : 'No'}
            </Text>
            {reward.limited && (
              <Text style={styles.devInfoText}>
                - Remaining Claims: {reward.remainingClaims}
              </Text>
            )}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  centerContainer: {
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
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  errorText: {
    ...typography.titleMedium,
    color: colors.error,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  devInfo: {
    marginTop: spacing.lg,
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
  },
  devInfoTitle: {
    ...typography.titleMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  devInfoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
