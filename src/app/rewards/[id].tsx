import { ClaimQRView } from '@/components/rewards/ClaimQRView';
import { RewardRequirements } from '@/components/rewards/RewardRequirements';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { setMockScenario } from '@/data/api';
import { useActiveClaim } from '@/hooks/useActiveClaim';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGenerateClaimQR } from '@/hooks/useGenerateClaimQR';
import { useRewardById } from '@/hooks/useRewardById';
import { useRewardEligibility } from '@/hooks/useRewardEligibility';
import { useSimulateClaim } from '@/hooks/useSimulateClaim';
import { REDEMPTION_LOCATION } from '@/lib/constants';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

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

  // Query client for invalidation (dev only)
  const queryClient = useQueryClient();

  // Loading state - show loading indicator while any required data is loading
  const isLoading = isLoadingReward || isLoadingEligibility || isLoadingUser || isLoadingActiveClaim;

  // State determination logic (task 6.2) - Must be called before early returns
  type RewardState = 'locked' | 'eligible' | 'qr-generated' | 'expired' | 'already-claimed' | 'no-longer-available';
  
  // Capture current time once per render for purity (use useState initializer to satisfy linter)
  const [currentTime] = useState(() => Date.now());
  
  const rewardState = useMemo<RewardState>(() => {
    if (!reward || !user) return 'locked';

    // Already Claimed state (user-level check)
    if (user.hasClaimedThisPeriod) {
      return 'already-claimed';
    }

    // No Longer Available state (limited reward fully claimed)
    if (!reward.available && reward.limited && reward.remainingClaims === 0) {
      return 'no-longer-available';
    }

    // QR Generated state (active claim not expired)
    if (activeClaim && activeClaim.expiresAt.getTime() > currentTime) {
      return 'qr-generated';
    }

    // Expired state (active claim expired)
    if (activeClaim && activeClaim.expiresAt.getTime() <= currentTime) {
      return 'expired';
    }

    // Eligible state
    if (eligibility?.eligible) {
      return 'eligible';
    }

    // Default to Locked state
    return 'locked';
  }, [reward, user, activeClaim, eligibility, currentTime]);

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

  // Render Locked state (task 6.3)
  const renderLockedState = () => {
    if (!reward || !eligibility) return null;

    return (
      <View style={styles.stateContainer} testID="reward-detail-locked">
        {/* Reward Image with overlays */}
        <View style={styles.imageContainer}>
          <Image
            source={reward.imageSource}
            style={styles.rewardImage}
            contentFit="cover"
            testID="reward-image"
          />
          
          {/* Limited badge overlay (top-left) */}
          {reward.limited && reward.remainingClaims !== undefined && reward.remainingClaims > 0 && (
            <View style={[styles.imageOverlay, styles.imageOverlayTopLeft]}>
              <View style={styles.limitedBadge}>
                <Text style={styles.limitedBadgeText}>
                  Limited: {reward.remainingClaims} left
                </Text>
              </View>
            </View>
          )}
          
          {/* Points badge overlay (bottom-right) */}
          <View style={[styles.imageOverlay, styles.imageOverlayBottomRight]}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                {reward.pointsCost} pts required
              </Text>
            </View>
          </View>
        </View>

        {/* Title and Description */}
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle} testID="reward-title">
            {reward.title}
          </Text>
          
          {/* Category badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>OFFICIAL MERCH</Text>
          </View>
          
          <Text style={styles.rewardDescription} testID="reward-description">
            {reward.description}
          </Text>
        </View>

        {/* Redemption Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionLabel}>REDEMPTION LOCATION</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={colors.textSecondary} style={styles.locationIcon} />
            <Text style={styles.locationText}>{REDEMPTION_LOCATION}</Text>
          </View>
        </View>

        {/* Reward Requirements Component */}
        <RewardRequirements
          eligibility={eligibility}
          pointsCost={reward.pointsCost}
          testID="reward-requirements"
        />

        {/* Claim Procedure Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="qr-code" size={24} color={colors.primary} style={styles.infoBoxIcon} />
          <View style={styles.infoBoxContent}>
            <Text style={styles.infoBoxTitle}>Claim Procedure</Text>
            <Text style={styles.infoBoxText}>
              Once all 4 categories are stamped and {reward.pointsCost} pts are reached, your unique claim QR code will be generated to redeem this kit on-site.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <Button
          title="Reward Locked (Requirements Incomplete)"
          onPress={() => {}}
          disabled={true}
          testID="locked-button"
        />
      </View>
    );
  };

  // Render Eligible state (task 6.4)
  const renderEligibleState = () => {
    if (!reward || !eligibility) return null;

    const handleGenerateQR = async () => {
      try {
        await generateClaimQRMutation.mutateAsync(rewardId);
        // State will automatically transition to QR Generated when mutation succeeds
      } catch (error) {
        console.error('Failed to generate claim QR:', error);
      }
    };

    return (
      <View style={styles.stateContainer} testID="reward-detail-eligible">
        {/* Status chips at top */}
        <View style={styles.statusChipsRow}>
          {/* Ready to Claim chip */}
          <View style={styles.readyToClaimChip}>
            <Ionicons name="checkmark" size={16} color={colors.background} style={styles.chipIcon} />
            <Text style={styles.readyToClaimText}>READY TO CLAIM</Text>
          </View>
          
          {/* Limited badge if applicable */}
          {reward.limited && reward.remainingClaims !== undefined && reward.remainingClaims > 0 && (
            <View style={styles.limitedChip}>
              <Text style={styles.limitedChipText}>
                Limited: {reward.remainingClaims} left
              </Text>
            </View>
          )}
        </View>

        {/* Reward Image */}
        <View style={styles.imageContainer}>
          <Image
            source={reward.imageSource}
            style={styles.rewardImage}
            contentFit="cover"
            testID="reward-image"
          />
          
          {/* Points badge overlay (bottom-right) */}
          <View style={[styles.imageOverlay, styles.imageOverlayBottomRight]}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                {reward.pointsCost} pts
              </Text>
            </View>
          </View>
        </View>

        {/* Title and Description */}
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle} testID="reward-title">
            {reward.title}
          </Text>
          
          {/* Category badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>OFFICIAL MERCH</Text>
          </View>
          
          <Text style={styles.rewardDescription} testID="reward-description">
            {reward.description}
          </Text>
        </View>

        {/* Redemption Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionLabel}>REDEMPTION LOCATION</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={colors.textSecondary} style={styles.locationIcon} />
            <Text style={styles.locationText}>{REDEMPTION_LOCATION}</Text>
          </View>
        </View>

        {/* Reward Requirements Component (all complete) */}
        <RewardRequirements
          eligibility={eligibility}
          pointsCost={reward.pointsCost}
          testID="reward-requirements"
        />

        {/* All Requirements Met Info Box */}
        <View style={[styles.infoBox, styles.successInfoBox]}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} style={styles.infoBoxIcon} />
          <View style={styles.infoBoxContent}>
            <Text style={styles.infoBoxTitle}>All Requirements Met!</Text>
            <Text style={styles.infoBoxText}>
              You have unlocked this reward. You may generate your single-use claim QR now or continue saving for higher rewards.
            </Text>
          </View>
        </View>

        {/* Generate Claim QR Button */}
        <Button
          title="Generate Claim QR"
          onPress={handleGenerateQR}
          disabled={false}
          variant="accent"
          loading={generateClaimQRMutation.isPending}
          testID="generate-qr-button"
        />

        {/* Note below button */}
        <Text style={styles.eligibleNote}>
          Generating a code is optional. You can keep collecting points toward higher rewards.
        </Text>
      </View>
    );
  };

  // Render QR Generated state (task 6.5)
  const renderQRGeneratedState = () => {
    if (!reward || !activeClaim) return null;

    const handleDone = () => {
      router.back();
    };

    const handleSimulateOfficerScan = async () => {
      try {
        await simulateClaimMutation.mutateAsync({
          claimId: activeClaim.claimId,
          rewardId: rewardId,
        });
        
        // Show success message
        Alert.alert(
          'Claim Simulated',
          `Successfully claimed ${reward.title}. Points deducted and reward marked as claimed.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to rewards list
                router.back();
              },
            },
          ]
        );
      } catch (error) {
        console.error('Failed to simulate claim:', error);
        Alert.alert(
          'Simulation Failed',
          'Failed to simulate officer scan. Please try again.',
          [{ text: 'OK' }]
        );
      }
    };

    return (
      <View style={styles.stateContainer} testID="reward-detail-qr-generated">
        <ClaimQRView
          activeClaim={activeClaim}
          rewardTitle={reward.title}
          rewardPoints={reward.pointsCost}
          onDone={handleDone}
          testID="claim-qr-view"
        />
        
        {/* Dev-only: Simulate Officer Scan button (task 6.9) */}
        {__DEV__ && (
          <View style={styles.devSimulateSection}>
            <Text style={styles.devSectionTitle}>Dev Testing:</Text>
            <Button
              title="Simulate Officer Scan"
              onPress={handleSimulateOfficerScan}
              variant="primary"
              loading={simulateClaimMutation.isPending}
              testID="dev-simulate-claim-button"
            />
            <Text style={styles.devNote}>
              This simulates an officer scanning the QR code to claim the reward.
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render Expired state (task 6.6)
  const renderExpiredState = () => {
    if (!reward || !activeClaim) return null;

    const handleGenerateNewQR = async () => {
      try {
        await generateClaimQRMutation.mutateAsync(rewardId);
        // State will automatically transition to QR Generated when mutation succeeds
      } catch (error) {
        console.error('Failed to generate new claim QR:', error);
      }
    };

    return (
      <View style={styles.stateContainer} testID="reward-detail-expired">
        <ClaimQRView
          activeClaim={activeClaim}
          rewardTitle={reward.title}
          rewardPoints={reward.pointsCost}
          onDone={() => router.back()}
          isExpired={true}
          onGenerateNewQR={handleGenerateNewQR}
          isGeneratingNewQR={generateClaimQRMutation.isPending}
          testID="claim-qr-view-expired"
        />
      </View>
    );
  };

  // Render Already Claimed state (task 6.7)
  const renderAlreadyClaimedState = () => {
    if (!reward) return null;

    return (
      <View style={styles.stateContainer} testID="reward-detail-already-claimed">
        {/* Reward Image */}
        <View style={styles.imageContainer}>
          <Image
            source={reward.imageSource}
            style={styles.rewardImage}
            contentFit="cover"
            testID="reward-image"
          />
          
          {/* Points badge overlay (bottom-right) */}
          <View style={[styles.imageOverlay, styles.imageOverlayBottomRight]}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                {reward.pointsCost} pts
              </Text>
            </View>
          </View>
        </View>

        {/* Title and Description */}
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle} testID="reward-title">
            {reward.title}
          </Text>
          
          {/* Category badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>OFFICIAL MERCH</Text>
          </View>
          
          <Text style={styles.rewardDescription} testID="reward-description">
            {reward.description}
          </Text>
        </View>

        {/* Redemption Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionLabel}>REDEMPTION LOCATION</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={colors.textSecondary} style={styles.locationIcon} />
            <Text style={styles.locationText}>{REDEMPTION_LOCATION}</Text>
          </View>
        </View>

        {/* Already Claimed Message Card */}
        <View style={styles.messageCard}>
          <Ionicons name="information-circle" size={24} color={colors.textSecondary} style={styles.messageIcon} />
          <Text style={styles.messageText}>
            You&apos;ve already claimed a prize this promo period
          </Text>
        </View>

        {/* Action Button */}
        <Button
          title="Already Claimed"
          onPress={() => {}}
          disabled={true}
          testID="already-claimed-button"
        />
      </View>
    );
  };

  // Render No Longer Available state (task 6.8)
  const renderNoLongerAvailableState = () => {
    if (!reward) return null;

    return (
      <View style={styles.stateContainer} testID="reward-detail-no-longer-available">
        {/* Reward Image */}
        <View style={styles.imageContainer}>
          <Image
            source={reward.imageSource}
            style={styles.rewardImage}
            contentFit="cover"
            testID="reward-image"
          />
          
          {/* Points badge overlay (bottom-right) */}
          <View style={[styles.imageOverlay, styles.imageOverlayBottomRight]}>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                {reward.pointsCost} pts
              </Text>
            </View>
          </View>
        </View>

        {/* Title and Description */}
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardTitle} testID="reward-title">
            {reward.title}
          </Text>
          
          {/* Category badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>OFFICIAL MERCH</Text>
          </View>
          
          <Text style={styles.rewardDescription} testID="reward-description">
            {reward.description}
          </Text>
        </View>

        {/* Redemption Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionLabel}>REDEMPTION LOCATION</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={colors.textSecondary} style={styles.locationIcon} />
            <Text style={styles.locationText}>{REDEMPTION_LOCATION}</Text>
          </View>
        </View>

        {/* No Longer Available Message Card */}
        <View style={styles.messageCard}>
          <Ionicons name="information-circle" size={24} color={colors.textSecondary} style={styles.messageIcon} />
          <Text style={styles.messageText}>
            This reward is no longer available
          </Text>
        </View>

        {/* Action Button */}
        <Button
          title="No Longer Available"
          onPress={() => {}}
          disabled={true}
          testID="no-longer-available-button"
        />
      </View>
    );
  };

  // Main render
  return (
    <ScreenContainer
      scrollable={true}
      showHeader={true}
      headerTitle="Reward Details"
      onBackPress={() => router.back()}
      testID="reward-detail-screen"
    >
      <View style={styles.container}>
        {/* Dev-only: Scenario Switcher (task 6.9) */}
        {__DEV__ && (
          <View style={styles.devScenarioSwitcher}>
            <Text style={styles.devSectionTitle}>Dev Mock Scenario:</Text>
            <View style={styles.scenarioButtonsRow}>
              <Pressable
                style={styles.scenarioButton}
                onPress={() => {
                  setMockScenario('default');
                  queryClient.invalidateQueries();
                }}
                testID="dev-scenario-default"
              >
                <Text style={styles.scenarioButtonText}>Default</Text>
                <Text style={styles.scenarioButtonSubtext}>
                  450 pts, missing Adventure
                </Text>
              </Pressable>
              
              <Pressable
                style={styles.scenarioButton}
                onPress={() => {
                  setMockScenario('eligible');
                  queryClient.invalidateQueries();
                }}
                testID="dev-scenario-eligible"
              >
                <Text style={styles.scenarioButtonText}>Eligible</Text>
                <Text style={styles.scenarioButtonSubtext}>
                  900 pts, all categories
                </Text>
              </Pressable>
              
              <Pressable
                style={styles.scenarioButton}
                onPress={() => {
                  setMockScenario('claimed');
                  queryClient.invalidateQueries();
                }}
                testID="dev-scenario-claimed"
              >
                <Text style={styles.scenarioButtonText}>Claimed</Text>
                <Text style={styles.scenarioButtonSubtext}>
                  Already claimed
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        
        {/* Render current state */}
        {rewardState === 'locked' && renderLockedState()}
        {rewardState === 'eligible' && renderEligibleState()}
        {rewardState === 'qr-generated' && renderQRGeneratedState()}
        {rewardState === 'expired' && renderExpiredState()}
        {rewardState === 'already-claimed' && renderAlreadyClaimedState()}
        {rewardState === 'no-longer-available' && renderNoLongerAvailableState()}
        
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
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  stateContainer: {
    gap: spacing.base,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  rewardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
  },
  imageOverlayTopLeft: {
    top: spacing.sm,
    left: spacing.sm,
  },
  imageOverlayBottomRight: {
    bottom: spacing.sm,
    right: spacing.sm,
  },
  limitedBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.card,
  },
  limitedBadgeText: {
    ...typography.labelSmall,
    color: colors.background,
    fontWeight: '600',
  },
  pointsBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.card,
  },
  pointsBadgeText: {
    ...typography.bodyMedium,
    color: colors.background,
    fontWeight: '600',
  },
  rewardInfo: {
    marginTop: spacing.base,
  },
  rewardTitle: {
    ...typography.headlineLarge,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    ...typography.labelSmall,
    color: colors.text,
    fontWeight: '600',
  },
  rewardDescription: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  locationSection: {
    marginTop: spacing.base,
  },
  sectionLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: spacing.xs,
  },
  locationText: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.base,
    ...shadows.card,
  },
  infoBoxIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  infoBoxContent: {
    flex: 1,
  },
  infoBoxTitle: {
    ...typography.titleMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  infoBoxText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
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
  placeholderContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  placeholderText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
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
  // Eligible state styles (task 6.4)
  statusChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  readyToClaimChip: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  readyToClaimText: {
    ...typography.labelMedium,
    color: colors.background,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  limitedChip: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.chip,
  },
  limitedChipText: {
    ...typography.labelSmall,
    color: colors.background,
    fontWeight: '600',
  },
  successInfoBox: {
    // Additional styles for success variant of info box
  },
  eligibleNote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  // Already Claimed state styles (task 6.7)
  messageCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.base,
    ...shadows.card,
  },
  messageIcon: {
    marginRight: spacing.md,
  },
  messageText: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  // Dev scenario switcher styles (task 6.9)
  devScenarioSwitcher: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  devSectionTitle: {
    ...typography.titleMedium,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  scenarioButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  scenarioButton: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.background,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  scenarioButtonText: {
    ...typography.labelMedium,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  scenarioButtonSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  devSimulateSection: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    marginTop: spacing.base,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  devNote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
});









