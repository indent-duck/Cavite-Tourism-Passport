import { Reward, RewardEligibility } from '@/data/types';
import { REDEMPTION_LOCATION } from '@/lib/constants';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

/**
 * RewardCard Component
 * 
 * Individual reward card displayed in the rewards list.
 * Shows reward image (local placeholder with gift icon), title, description,
 * location, status badge, and optional points progress bar.
 * 
 * Design specifications:
 * - Card: white background, 16px radius, card shadow, 16px margin bottom
 * - Image: Local placeholder (neutral tinted background + gift icon), aspect ratio 16:10, rounded top corners
 * - Image overlays: "Limited: N left" badge (top-left, orange), points badge (bottom-right, navy)
 * - Content: 16px padding with title, description (2 lines max), location, progress bar (if not eligible), status badge
 * - Pressable with scale animation to 0.98
 * 
 * Status badges:
 * - Locked: surface background, text color, 1px border
 * - Eligible: success background, white text
 * - Claimed: textSecondary background, white text
 * - No longer available: error background, white text
 * 
 * Validates: Requirements 4.2 (RewardCard Component)
 */

export interface RewardCardProps {
  reward: Reward;
  onPress: () => void;
  eligibility?: RewardEligibility;
  testID?: string;
}

export function RewardCard({
  reward,
  onPress,
  eligibility,
  testID,
}: RewardCardProps) {
  // Animated.Value pattern requires accessing .current during initialization
  // eslint-disable-next-line react-hooks/refs
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  // Determine status badge
  const getStatusBadge = () => {
    if (reward.claimedByUser) {
      return {
        label: 'Claimed',
        backgroundColor: colors.textSecondary,
        textColor: colors.background,
      };
    }

    if (!reward.available && reward.limited && reward.remainingClaims === 0) {
      return {
        label: 'No longer available',
        backgroundColor: colors.error,
        textColor: colors.background,
      };
    }

    if (eligibility?.eligible) {
      return {
        label: 'Ready to Claim',
        backgroundColor: colors.success,
        textColor: colors.background,
      };
    }

    return {
      label: 'Locked',
      backgroundColor: colors.surface,
      textColor: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    };
  };

  const statusBadge = getStatusBadge();

  // Calculate points progress percentage
  const pointsProgress = eligibility
    ? (eligibility.currentPoints / reward.pointsCost) * 100
    : 0;

  const showProgressBar = eligibility && !eligibility.eligible;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${reward.title}, ${reward.pointsCost} points${reward.limited ? `, ${reward.remainingClaims} left` : ''}, ${statusBadge.label}`}
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Reward Image with Overlays */}
        <View style={styles.imageContainer}>
          <Image
            source={reward.imageSource || require('@/assets/images/icon.png')}
            style={styles.image}
            contentFit="cover"
            placeholder={{ blurhash: 'LKN]Rv%2Tw=w]~RBVZRi};RPxuwH' }}
            transition={200}
          />
          
          {/* Placeholder fallback: neutral background with gift icon */}
          {!reward.imageSource && (
            <View style={styles.placeholderOverlay}>
              <Ionicons name="gift" size={48} color={colors.primary} />
            </View>
          )}

          {/* Gradient overlay at bottom */}
          <View style={styles.gradientOverlay} />

          {/* Points badge - Top-left */}
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={styles.pointsBadgeText}>
              {reward.pointsCost} pts
            </Text>
          </View>

          {/* Limited badge - Top-right */}
          {reward.limited && reward.remainingClaims !== undefined && (
            <View style={styles.limitedBadge}>
              <View style={styles.pulsingDot} />
              <Text style={styles.limitedBadgeText}>
                Limited: {reward.remainingClaims} left
              </Text>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={1}>
            {reward.title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {reward.description}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.textSecondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {REDEMPTION_LOCATION}
            </Text>
          </View>

          {/* Points Progress Bar (if not eligible) */}
          {showProgressBar && eligibility && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Points Progress</Text>
                <Text style={styles.progressValue}>
                  {eligibility.currentPoints} / {reward.pointsCost} pts ({Math.round(pointsProgress)}%)
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(pointsProgress, 100)}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusBadge.backgroundColor,
                borderWidth: statusBadge.borderWidth || 0,
                borderColor: statusBadge.borderColor,
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: statusBadge.textColor },
              ]}
            >
              {statusBadge.label}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    marginBottom: spacing.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${colors.border}60`,
    ...shadows.card,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#D1D5DB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D1D5DB',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'transparent',
  },
  pointsBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: `${colors.primary}F0`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: `${colors.background}30`,
  },
  pointsBadgeText: {
    ...typography.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: 0.3,
  },
  limitedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: `${colors.background}F5`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: `${colors.border}50`,
    shadowColor: '#1B2A49',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  limitedBadgeText: {
    ...typography.bodySmall,
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    ...typography.titleMedium,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  locationText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  progressSection: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.border}30`,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.bodySmall,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  progressValue: {
    ...typography.bodySmall,
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  statusBadge: {
    alignSelf: 'stretch',
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  statusBadgeText: {
    ...typography.bodySmall,
    fontSize: 13,
    fontWeight: '700',
  },
});
