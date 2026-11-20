import { Button } from '@/components/ui/Button';
import { StatusPill, type StatusPillTone } from '@/components/ui/StatusPill';
import type { StampRequest, StampRequestStatus } from '@/data/types';
import { formatVisitDate } from '@/lib/stamp-requests';
import { colors, radii, spacing, typography } from '@/theme';
import { CATEGORY_COLORS } from '@/theme/categories';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

const STATUS: Record<StampRequestStatus, { label: string; tone: StatusPillTone; icon: IconName }> = {
  pending: { label: 'Pending review', tone: 'warning', icon: 'time-outline' },
  approved: { label: 'Approved', tone: 'success', icon: 'checkmark-circle' },
  rejected: { label: 'Not approved', tone: 'error', icon: 'alert-circle' },
};

interface StampRequestCardProps {
  request: StampRequest;
  /** Shown on rejected requests whose site can still be requested */
  onResubmit?: () => void;
}

/**
 * StampRequestCard
 *
 * One stamp request in the history list: photo thumbnail, site, visit date,
 * status pill, and for rejected requests the admin's reason and a
 * "Submit again" action.
 */
export function StampRequestCard({ request, onResubmit }: StampRequestCardProps) {
  const status = STATUS[request.status];

  return (
    <View style={styles.card} testID={`stamp-request-${request.id}`}>
      <View style={styles.row}>
        <Image
          source={{ uri: request.photoUri }}
          style={styles.thumb}
          contentFit="cover"
          accessibilityLabel={`Stamp photo for ${request.siteName}`}
        />
        <View style={styles.info}>
          <Text style={[styles.category, { color: CATEGORY_COLORS[request.siteCategory] }]}>
            {request.siteCategory.toUpperCase()}
          </Text>
          <Text style={styles.siteName} numberOfLines={2}>
            {request.siteName}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {request.municipality} · Visited {formatVisitDate(request.visitedOn)}
          </Text>
          <View style={styles.pillRow}>
            <StatusPill label={status.label} tone={status.tone} icon={status.icon} />
          </View>
        </View>
      </View>

      {request.status === 'rejected' && (
        <View style={styles.rejection}>
          {request.rejectionReason ? (
            <Text style={styles.reason}>
              <Text style={styles.reasonLabel}>Reason: </Text>
              {request.rejectionReason}
            </Text>
          ) : null}
          {onResubmit && (
            <Button
              title="Submit again"
              onPress={onResubmit}
              variant="outline"
              size="compact"
              icon={<Ionicons name="refresh" size={16} color={colors.primary} />}
              testID={`stamp-request-resubmit-${request.id}`}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  category: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
  },
  siteName: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  pillRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  rejection: {
    gap: spacing.sm,
    alignItems: 'flex-start',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reason: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  reasonLabel: {
    fontFamily: 'Inter_600SemiBold',
  },
});
