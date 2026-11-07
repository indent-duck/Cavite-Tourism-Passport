import { CaviteMap } from '@/components/map/CaviteMap';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { POINTS_PER_CATEGORY } from '@/data/types';
import { useEventById } from '@/hooks/useEventById';
import { formatEventDate, getEventStatus } from '@/lib/event-utils';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

/**
 * Event Information Panel
 * 
 * Detail screen showing complete event information.
 * Shows event details, date/time, location, description, and "Open in Maps" button.
 */
export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading, error, refetch } = useEventById(id as string);

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer
        scrollable={false}
        showHeader={true}
        headerTitle="Event Information"
        testID="event-detail-screen"
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenContainer
        scrollable={false}
        showHeader={true}
        headerTitle="Event Information"
        testID="event-detail-screen"
      >
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Unable to load event</Text>
          <Text style={styles.errorMessage}>
            {error.message || 'Something went wrong'}
          </Text>
          <Button title="Retry" onPress={() => refetch()} variant="primary" />
        </View>
      </ScreenContainer>
    );
  }

  // Event not found state
  if (!event) {
    return (
      <ScreenContainer
        scrollable={false}
        showHeader={true}
        headerTitle="Event Information"
        testID="event-detail-screen"
      >
        <View style={styles.centerContainer}>
          <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Event not found</Text>
          <Text style={styles.errorMessage}>
            The event you&apos;re looking for could not be found.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const status = getEventStatus(event);
  const statusLabel = status === 'happening' ? 'Happening now' : 'Upcoming';
  const statusColor = status === 'happening' ? colors.success : colors.primary;

  const handleOpenMaps = async () => {
    const geoUri = `geo:${event.latitude},${event.longitude}?q=${encodeURIComponent(event.title)}`;
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;

    try {
      await Linking.openURL(geoUri);
    } catch {
      // Fallback to Google Maps
      await Linking.openURL(fallbackUrl);
    }
  };

  // Truncate address for button label (first part before comma)
  const truncatedAddress = event.address.split(',')[0];

  return (
    <ScreenContainer
      scrollable={true}
      showHeader={true}
      headerTitle="Event Information"
      testID="event-detail-screen"
    >
      {/* Photo area */}
      <View style={styles.photoPlaceholder}>
        <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
      </View>

      <View style={styles.content}>
        {/* Chips row */}
        <View style={styles.chipsRow}>
          <Chip label={event.category} selected={false} />
          <Chip
            label={statusLabel}
            selected={true}
            icon={
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: status === 'happening' ? colors.background : statusColor },
                ]}
              />
            }
          />
          {event.festivalStamp?.available && (
            <Chip
              label={`+${POINTS_PER_CATEGORY.Festival} pts`}
              selected={false}
              icon={
                <Ionicons name="star-outline" size={16} color={colors.primary} />
              }
            />
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.locationText}>{event.municipality}</Text>
        </View>

        {/* Festival stamp bonus card (conditional) */}
        {event.festivalStamp?.available && (
          <View
            style={[
              styles.stampBonusCard,
              {
                backgroundColor:
                  status === 'happening'
                    ? `${colors.success}10` // 10% opacity
                    : `${colors.primary}10`,
              },
            ]}
          >
            <Ionicons
              name="star"
              size={24}
              color={status === 'happening' ? colors.success : colors.primary}
            />
            <View style={styles.stampBonusTextContainer}>
              <Text
                style={[
                  styles.stampBonusTitle,
                  {
                    color: status === 'happening' ? colors.success : colors.primary,
                  },
                ]}
              >
                {status === 'happening' ? 'Happening Now' : 'Upcoming'}:{' '}
                +{POINTS_PER_CATEGORY.Festival} Bonus Pts
              </Text>
              <Text style={styles.stampBonusSubtext}>
                Available during event dates at {event.municipality}
              </Text>
            </View>
          </View>
        )}

        {/* Date & Time section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>DATE & TIME</Text>
          <View style={styles.sectionContent}>
            <Ionicons name="calendar-outline" size={20} color={colors.text} />
            <Text style={styles.sectionText}>
              {formatEventDate(event.startDate, event.endDate)}
            </Text>
          </View>
        </View>

        {/* Venue Address section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>VENUE ADDRESS</Text>
          <View style={styles.sectionContent}>
            <Ionicons name="location-outline" size={20} color={colors.text} />
            <Text style={styles.sectionText}>{event.address}</Text>
          </View>
        </View>

        {/* Description section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>ABOUT THE FESTIVAL</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </View>

        {/* Location & Directions section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>LOCATION & DIRECTIONS</Text>
          <CaviteMap height={200} />
          <Text style={styles.navigateLabel}>Navigate to {truncatedAddress}</Text>
          <Button
            title="Open in Maps"
            onPress={handleOpenMaps}
            variant="primary"
            fullWidth
            icon={<Ionicons name="navigate-outline" size={20} color={colors.background} />}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  photoPlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.xxl,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  locationText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  stampBonusCard: {
    flexDirection: 'row',
    padding: spacing.base,
    borderRadius: radii.card,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  stampBonusTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  stampBonusTitle: {
    ...typography.labelLarge,
  },
  stampBonusSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeading: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  sectionText: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  descriptionText: {
    ...typography.bodyMedium,
    color: colors.text,
    lineHeight: 22,
  },
  navigateLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorTitle: {
    ...typography.headlineMedium,
    color: colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
});
