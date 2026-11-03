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

          {/* Limited badge - Top-left */}
          {reward.limited && reward.remainingClaims !== undefined && (
            <View style={styles.limitedBadge}>
              <Text style={styles.limitedBadgeText}>
                Limited: {reward.remainingClaims} left
              </Text>
            </View>
          )}

          {/* Points badge - Bottom-right */}
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>
              {reward.pointsCost} pts
            </Text>
          </View>
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
              <Text style={styles.progressText}>
                {eligibility.currentPoints} / {reward.pointsCost} pts ({Math.round(pointsProgress)}%)
              </Text>
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
    backgroundColor: colors.background,
    borderRadius: radii.card,
    marginBottom: spacing.base,
    overflow: 'hidden',
    ...shadows.card,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
  },
  limitedBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.card,
  },
  limitedBadgeText: {
    ...typography.bodySmall,
    color: colors.background,
    fontWeight: '600',
  },
  pointsBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.card,
  },
  pointsBadgeText: {
    ...typography.bodyMedium,
    color: colors.background,
    fontWeight: '600',
  },
  content: {
    padding: spacing.base,
  },
  title: {
    ...typography.titleMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  progressSection: {
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.xs,
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
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  statusBadgeText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
});
