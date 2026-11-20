import type { StampRequest } from '@/data/types';
import { formatVisitDate } from '@/lib/stamp-requests';
import { colors, radii, spacing, typography } from '@/theme';
import { CATEGORY_ICONS } from '@/theme/categories';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface PendingStampSlotProps {
  request: StampRequest;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pending stamp slot - a physical-stamp request awaiting admin review
 *
 * Same footprint as StampSlot so it sits in the stamps grid, but drawn as a
 * faint, un-inked outline with a "Pending review" status. Opens the Stamp
 * requests screen.
 */
export function PendingStampSlot({ request, style }: PendingStampSlotProps) {
  return (
    <Pressable
      onPress={() => router.push('/stamp-requests')}
      style={({ pressed }) => [styles.slot, pressed && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel={`${request.siteName}, pending review. View stamp requests`}
      testID={`pending-stamp-${request.id}`}
    >
      <Text style={styles.categoryLabel} numberOfLines={1}>
        {request.siteCategory.toUpperCase()}
      </Text>

      <View style={styles.stampOuter}>
        <View style={styles.stampInner}>
          <Ionicons name={CATEGORY_ICONS[request.siteCategory]} size={18} color={colors.textSecondary} />
          <Text style={styles.siteName} numberOfLines={2}>
            {request.siteName}
          </Text>
          <Text style={styles.municipality} numberOfLines={1}>
            {request.municipality}
          </Text>
          <Text style={styles.date}>{formatVisitDate(request.visitedOn).toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <Ionicons name="time-outline" size={14} color={colors.accent} />
        <Text style={styles.statusText}>Pending review</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.passportPaperBorder,
    backgroundColor: colors.passportCream,
  },
  pressed: {
    opacity: 0.7,
  },
  categoryLabel: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stampOuter: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.md + 4,
    padding: 3,
  },
  stampInner: {
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 3,
    minHeight: 132,
    justifyContent: 'center',
    opacity: 0.7,
  },
  siteName: {
    ...typography.labelMedium,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: colors.textSecondary,
  },
  municipality: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  date: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  statusText: {
    ...typography.labelSmall,
    fontFamily: 'Inter_600SemiBold',
    color: colors.accent,
  },
});
