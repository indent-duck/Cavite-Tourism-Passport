import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Stamp, StampRequest } from '@/data/types';
import { getSiteStampState, getUnseenResults } from '@/lib/stamp-requests';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

interface StampRequestsCardProps {
  requests: StampRequest[];
  stamps: Stamp[];
  /** Marks review results as seen (dismisses the rejection notice) */
  onMarkSeen: (ids: string[]) => void;
}

/**
 * Stamp requests card (Passport tab, below the booklet)
 *
 * Entry point for physical-stamp requests:
 * - Notice for a rejected request the user hasn't seen yet, with the reason
 *   and "Submit again" / "Dismiss"
 * - Count of requests under review, opening the Stamp requests screen
 * - Link to request a digital stamp for a physical one
 */
export function StampRequestsCard({ requests, stamps, onMarkSeen }: StampRequestsCardProps) {
  const unseenRejections = getUnseenResults(requests)
    .filter((request) => request.status === 'rejected')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const rejection = unseenRejections[0];
  const pendingCount = requests.filter((request) => request.status === 'pending').length;

  const canResubmit =
    !!rejection && getSiteStampState(rejection.siteId, stamps, requests) === 'available';

  const dismissRejections = () => onMarkSeen(unseenRejections.map((request) => request.id));

  return (
    <Card style={styles.card} testID="stamp-requests-card">
      {rejection && (
        <View style={styles.rejection} accessibilityRole="alert" testID="stamp-request-rejection">
          <View style={styles.rejectionHeader}>
            <Ionicons name="alert-circle" size={22} color={colors.error} />
            <Text style={styles.rejectionTitle}>
              Stamp request for {rejection.siteName} wasn&apos;t approved
            </Text>
          </View>
          {rejection.rejectionReason ? (
            <Text style={styles.rejectionReason}>{rejection.rejectionReason}</Text>
          ) : null}
          {unseenRejections.length > 1 && (
            <Text style={styles.rejectionMore}>
              +{unseenRejections.length - 1} more not approved. See Stamp requests.
            </Text>
          )}
          <View style={styles.rejectionActions}>
            {canResubmit && (
              <Button
                title="Submit again"
                onPress={() => {
                  dismissRejections();
                  router.push({
                    pathname: '/stamp-requests/new',
                    params: { siteId: rejection.siteId },
                  });
                }}
                variant="primary"
                size="compact"
                testID="stamp-request-rejection-resubmit"
              />
            )}
            <Button
              title="Dismiss"
              onPress={dismissRejections}
              variant="text"
              size="compact"
              testID="stamp-request-rejection-dismiss"
            />
          </View>
        </View>
      )}

      {pendingCount > 0 && (
        <>
          <CardRow
            icon="time-outline"
            iconColor={colors.accent}
            iconBackground={colors.accentTint}
            title={`${pendingCount} stamp ${pendingCount === 1 ? 'request' : 'requests'} under review`}
            subtitle="We'll add approved stamps to your passport"
            onPress={() => router.push('/stamp-requests')}
            testID="stamp-requests-pending-row"
          />
          <View style={styles.divider} />
        </>
      )}

      <CardRow
        icon="document-text-outline"
        iconColor={colors.primary}
        iconBackground={colors.primaryTint}
        title="Stamped your physical passport?"
        subtitle="Request the digital stamp for it"
        onPress={() => router.push('/stamp-requests/new')}
        testID="stamp-requests-new-row"
      />
    </Card>
  );
}

function CardRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  onPress,
  testID,
}: {
  icon: IconName;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      testID={testID}
    >
      <View style={[styles.iconChip, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const ICON_CHIP_SIZE = 40;

const styles = StyleSheet.create({
  // Elevated Card (rounded, shadow, clips the rejection tint and row press
  // highlights to its corners) in the same off-white as the cards on the
  // Stamp requests screen
  card: {
    backgroundColor: colors.surface,
  },
  rejection: {
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.errorTint,
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rejectionTitle: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.error,
    flex: 1,
  },
  rejectionReason: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  rejectionMore: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  rejectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  // A step darker than the card, so the press still shows
  rowPressed: {
    backgroundColor: colors.border,
  },
  iconChip: {
    width: ICON_CHIP_SIZE,
    height: ICON_CHIP_SIZE,
    borderRadius: ICON_CHIP_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
  rowSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.base + ICON_CHIP_SIZE + spacing.md,
  },
});
