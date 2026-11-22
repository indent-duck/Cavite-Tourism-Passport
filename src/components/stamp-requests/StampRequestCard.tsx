import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { StampRequest, StampRequestStatus } from '@/data/types';
import { formatVisitDate, toDateKey } from '@/lib/stamp-requests';
import { colors, radii, spacing, typography } from '@/theme';
import { CATEGORY_COLORS } from '@/theme/categories';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

interface StatusStyle {
  label: string;
  icon: IconName;
  /** Footer band background */
  tint: string;
  iconColor: string;
  textColor: string;
}

// Same palette as StatusPill's warning / success / error tones
const STATUS: Record<StampRequestStatus, StatusStyle> = {
  pending: {
    label: 'Pending review',
    icon: 'time-outline',
    tint: colors.accentTint,
    iconColor: colors.accent,
    textColor: colors.textTertiary,
  },
  approved: {
    label: 'Approved',
    icon: 'checkmark-circle',
    tint: colors.successLight,
    iconColor: colors.success,
    textColor: colors.successDark,
  },
  rejected: {
    label: 'Not approved',
    icon: 'alert-circle',
    tint: colors.errorTint,
    iconColor: colors.error,
    textColor: colors.error,
  },
};

/** "Sent Nov 20, 2026" while pending; "Reviewed Nov 21, 2026" once reviewed */
function getStatusDate(request: StampRequest): string {
  if (request.status !== 'pending' && request.reviewedAt) {
    return `Reviewed ${formatVisitDate(toDateKey(new Date(request.reviewedAt)))}`;
  }
  return `Sent ${formatVisitDate(toDateKey(new Date(request.createdAt)))}`;
}

interface StampRequestCardProps {
  request: StampRequest;
  /** Shown on rejected requests whose site can still be requested */
  onResubmit?: () => void;
}

/**
 * StampRequestCard
 *
 * One stamp request in the history list, on an elevated card: photo, site,
 * municipality and visit date on top; a footer band tinted by review status
 * with the status and when it was sent/reviewed. Rejected requests also show
 * the admin's reason and a "Submit again" action in the footer.
 */
export function StampRequestCard({ request, onResubmit }: StampRequestCardProps) {
  const status = STATUS[request.status];
  const isRejected = request.status === 'rejected';

  return (
    <Card style={styles.card} testID={`stamp-request-${request.id}`}>
      <View style={styles.body}>
        {request.photoUri ? (
          <Image
            // The signed URL changes on every refetch; the path doesn't, so
            // the photo is downloaded once and then read from the disk cache
            source={{ uri: request.photoUri, cacheKey: request.photoPath }}
            style={styles.thumb}
            contentFit="cover"
            accessibilityLabel={`Stamp photo for ${request.siteName}`}
          />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.category, { color: CATEGORY_COLORS[request.siteCategory] }]}>
            {request.siteCategory.toUpperCase()}
          </Text>
          <Text style={styles.siteName} numberOfLines={2}>
            {request.siteName}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.meta} numberOfLines={1}>
              {request.municipality}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.meta} numberOfLines={1}>
              Visited {formatVisitDate(request.visitedOn)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: status.tint }]}>
        <View style={styles.statusRow}>
          <View style={styles.status}>
            <Ionicons name={status.icon} size={18} color={status.iconColor} />
            <Text style={[styles.statusLabel, { color: status.textColor }]}>{status.label}</Text>
          </View>
          <Text style={styles.statusDate} numberOfLines={1}>
            {getStatusDate(request)}
          </Text>
        </View>

        {isRejected && request.rejectionReason ? (
          <Text style={styles.reason}>
            <Text style={styles.reasonLabel}>Reason: </Text>
            {request.rejectionReason}
          </Text>
        ) : null}

        {isRejected && onResubmit && (
          <View style={styles.action}>
            <Button
              title="Submit again"
              onPress={onResubmit}
              variant="primary"
              size="compact"
              fullWidth
              icon={<Ionicons name="camera-outline" size={18} color={colors.background} />}
              testID={`stamp-request-resubmit-${request.id}`}
            />
          </View>
        )}
      </View>
    </Card>
  );
}

const THUMB_SIZE = 84;

const styles = StyleSheet.create({
  // Off-white so the card stands apart from the white screen
  card: {
    backgroundColor: colors.surface,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  footer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  statusLabel: {
    ...typography.labelLarge,
    fontFamily: 'Inter_600SemiBold',
  },
  statusDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  reason: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  reasonLabel: {
    fontFamily: 'Inter_600SemiBold',
  },
  action: {
    marginTop: spacing.xs,
    marginBottom: 2,
  },
});
