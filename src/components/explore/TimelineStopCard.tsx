import { POINTS_PER_CATEGORY, type Site } from '@/data/types';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

/**
 * TimelineStopCard Component
 * 
 * Displays a stop in the itinerary timeline with number/check circle,
 * stop info, status tag, thumbnail, and operating hours.
 * 
 * Includes dashed connector line using react-native-svg Line with strokeDasharray.
 * 
 * Validates: Requirements 4.2.3, 5.4
 */

export interface TimelineStopCardProps {
  /**
   * Site data for this stop
   */
  stop: Site;

  /**
   * Stop number in the itinerary (1-indexed)
   */
  stopNumber: number;

  /**
   * Whether user has stamped this stop
   */
  isStamped: boolean;

  /**
   * Whether to show the dashed connector line above this stop
   * Should be false for the first stop, true for all others
   */
  showConnector?: boolean;

  /**
   * Callback when stop card is pressed
   */
  onPress: () => void;

  /**
   * Test identifier for automated testing
   */
  testID?: string;
}

export function TimelineStopCard({
  stop,
  stopNumber,
  isStamped,
  showConnector = true,
  onPress,
  testID,
}: TimelineStopCardProps) {
  const points = POINTS_PER_CATEGORY[stop.category];
  const statusLabel = isStamped
    ? `Stamped • +${points} pts`
    : `Not stamped • +${points} pts`;
  const statusColor = isStamped ? colors.success : colors.textSecondary;
  const statusBgColor = isStamped
    ? `${colors.success}26` // 15% opacity
    : `${colors.textSecondary}14`; // ~8% opacity

  return (
    <View style={styles.container} testID={testID}>
      {/* Dashed Connector Line (above card) */}
      {showConnector && (
        <View style={styles.connectorContainer}>
          <Svg height={40} width={2} style={styles.connectorSvg}>
            <Line
              x1="1"
              y1="0"
              x2="1"
              y2="40"
              stroke={colors.border}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </Svg>
        </View>
      )}

      {/* Stop Content Row */}
      <View style={styles.contentRow}>
        {/* Circle Marker */}
        <View style={styles.markerContainer}>
          {isStamped ? (
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={20} color={colors.background} />
            </View>
          ) : (
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{stopNumber}</Text>
            </View>
          )}
        </View>

        {/* Stop Card */}
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          {/* Header Row: Stop badge, Category, Status tag */}
          <View style={styles.cardHeader}>
            <View style={styles.leftHeader}>
              <View style={styles.stopBadge}>
                <Text style={styles.stopBadgeText}>Stop {stopNumber}</Text>
              </View>
              <Text style={styles.categoryText}>{stop.category}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: statusBgColor }]}>
              {isStamped && (
                <Ionicons
                  name="checkmark-circle"
                  size={13}
                  color={statusColor}
                  style={styles.statusIcon}
                />
              )}
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Content Row: Thumbnail and Details */}
          <View style={styles.cardContent}>
            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              <Image
                source={require('@/assets/images/react-logo.png')}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </View>

            {/* Details */}
            <View style={styles.details}>
              <View style={styles.detailsTop}>
                <Text style={styles.siteName} numberOfLines={1}>
                  {stop.name}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                  {stop.description}
                </Text>
              </View>

              {/* Operating Hours */}
              {stop.operatingHours && (
                <View style={styles.hoursRow}>
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={colors.primary}
                    style={styles.clockIcon}
                  />
                  <Text style={styles.hoursText}>{stop.operatingHours}</Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  connectorContainer: {
    position: 'absolute',
    left: 19, // Center of 40px circle
    top: -40,
    width: 2,
    height: 40,
  },
  connectorSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  markerContainer: {
    width: 40,
    height: 40,
    flexShrink: 0,
  },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
    borderWidth: 4,
    borderColor: colors.background,
  },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
    borderWidth: 4,
    borderColor: colors.background,
  },
  numberText: {
    ...typography.titleMedium,
    color: colors.primary,
    fontFamily: 'Inter_700Bold',
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  stopBadge: {
    backgroundColor: '#D4E3FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.chip,
    borderWidth: 0,
  },
  stopBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  categoryText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.chip,
    gap: spacing.xs,
  },
  statusIcon: {
    marginTop: -1,
  },
  statusText: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
  },
  cardContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  detailsTop: {
    marginBottom: spacing.xs,
  },
  siteName: {
    ...typography.titleMedium,
    color: colors.primary,
    fontFamily: 'Inter_700Bold',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySmall,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clockIcon: {
    marginTop: -1,
  },
  hoursText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
});
