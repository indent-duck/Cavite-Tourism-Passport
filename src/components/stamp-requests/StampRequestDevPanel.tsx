import { Button } from '@/components/ui/Button';
import type { StampRequest } from '@/data/types';
import { useReviewStampRequest } from '@/hooks/useReviewStampRequest';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const DEV_REJECTION_REASON =
  'The stamp in the photo is unclear. Please retake it with the whole stamp and its date visible.';

interface StampRequestDevPanelProps {
  requests: StampRequest[];
}

/**
 * Dev-only tools for the Stamp requests screen: plays the admin and approves
 * or rejects pending requests. Collapsed by default so the real layout can be
 * judged as users will see it. Render only under __DEV__.
 */
export function StampRequestDevPanel({ requests }: StampRequestDevPanelProps) {
  const [open, setOpen] = useState(false);
  const review = useReviewStampRequest();
  const pending = requests.filter((request) => request.status === 'pending');

  const busyId = review.isPending ? review.variables?.requestId : undefined;

  return (
    <View style={styles.panel}>
      <Pressable
        style={styles.toggle}
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        testID="stamp-request-dev-panel-toggle"
      >
        <Ionicons name="construct" size={14} color={colors.textSecondary} />
        <Text style={styles.toggleText}>Dev tools · admin review</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textSecondary} />
      </Pressable>

      {open && (
        <View style={styles.body}>
          {pending.length === 0 ? (
            <Text style={styles.hint}>No pending requests. Submit one to review it here.</Text>
          ) : (
            pending.map((request) => (
              <View key={request.id} style={styles.item}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {request.siteName}
                </Text>
                <View style={styles.actions}>
                  <View style={styles.action}>
                    <Button
                      title="Approve"
                      onPress={() => review.mutate({ requestId: request.id, decision: 'approve' })}
                      variant="primary"
                      size="compact"
                      fullWidth
                      loading={busyId === request.id && review.variables?.decision === 'approve'}
                      disabled={review.isPending}
                      testID={`dev-approve-${request.id}`}
                    />
                  </View>
                  <View style={styles.action}>
                    <Button
                      title="Reject"
                      onPress={() =>
                        review.mutate({
                          requestId: request.id,
                          decision: 'reject',
                          reason: DEV_REJECTION_REASON,
                        })
                      }
                      variant="outline"
                      size="compact"
                      fullWidth
                      loading={busyId === request.id && review.variables?.decision === 'reject'}
                      disabled={review.isPending}
                      testID={`dev-reject-${request.id}`}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.xl,
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  toggleText: {
    ...typography.labelMedium,
    color: colors.textSecondary,
  },
  body: {
    gap: spacing.md,
    padding: spacing.md,
    paddingTop: 0,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  item: {
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  itemTitle: {
    ...typography.labelLarge,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
