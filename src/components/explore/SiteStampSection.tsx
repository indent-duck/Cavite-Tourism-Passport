import { Button } from '@/components/ui/Button';
import type { StampRequest } from '@/data/types';
import { type SiteStampState } from '@/lib/stamp-requests';
import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatSubmitted(date: Date | string): string {
  const value = new Date(date);
  return `${MONTHS[value.getMonth()]} ${value.getDate()}`;
}

export interface SiteStampSectionProps {
  siteId: string;
  state: SiteStampState;
  /** The pending request for this site, when state is 'pending' */
  pendingRequest?: StampRequest;
  testID?: string;
}

/**
 * SiteStampSection Component
 *
 * "Collect this stamp" card on the Site Information screen:
 * - available: how to collect it, plus "Request digital stamp" for a stamp
 *   already in the physical passport
 * - pending: the request is under review, with a link to Stamp requests
 * - stamped: nothing (the header already shows the visited badge)
 */
export function SiteStampSection({ siteId, state, pendingRequest, testID }: SiteStampSectionProps) {
  if (state === 'stamped') return null;

  if (state === 'pending') {
    return (
      <View style={[styles.container, styles.pending]} testID={testID}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={24} color={colors.accent} />
        </View>
        <View style={styles.content}>
          <Text style={styles.heading}>Stamp request under review</Text>
          <Text style={styles.body}>
            {pendingRequest
              ? `Submitted ${formatSubmitted(pendingRequest.createdAt)}. We'll add the stamp to your passport once it's approved.`
              : "We'll add the stamp to your passport once it's approved."}
          </Text>
          <View style={styles.action}>
            <Button
              title="View request"
              onPress={() => router.push('/stamp-requests')}
              variant="text"
              size="compact"
              testID="site-view-stamp-request"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <Ionicons name="ribbon-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.heading}>Collect this stamp</Text>
        <Text style={styles.body}>
          Scan the QR code at the site. If staff stamped your physical passport instead, request the
          digital stamp here.
        </Text>
        <View style={styles.action}>
          <Button
            title="Request digital stamp"
            onPress={() =>
              router.push({ pathname: '/stamp-requests/new', params: { siteId } })
            }
            variant="outline"
            size="compact"
            icon={<Ionicons name="document-text-outline" size={16} color={colors.primary} />}
            testID="site-request-stamp"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginVertical: spacing.md,
    ...shadows.card,
  },
  pending: {
    backgroundColor: colors.accentTint,
  },
  iconContainer: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  heading: {
    ...typography.titleMedium,
    color: colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  action: {
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
});
