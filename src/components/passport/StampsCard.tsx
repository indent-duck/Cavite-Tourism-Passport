import { Button } from '@/components/ui/Button';
import { Stamp } from '@/data/types';
import {
    PASSPORT_ISSUER_LINE,
    PASSPORT_STAMPS_HEADER,
    PASSPORT_STAMPS_TITLE,
} from '@/lib/constants';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PassportPage } from './PassportPage';
import { StampHighlight, StampReveal } from './StampReveal';
import { StampSlot } from './StampSlot';

interface StampsCardProps {
  stamps: Stamp[];
  /** Stamp to animate into view (e.g. right after scanning it) */
  highlight?: StampHighlight | null;
}

/**
 * Visas & Stamps card component
 *
 * Displays collected stamps in chronological order (most recent first).
 * Shows only collected stamps with category badges - no uncollected placeholders.
 * A highlighted stamp (just scanned) animates onto the page.
 *
 * Validates: Requirements 2.6, 2.7
 */
export function StampsCard({ stamps, highlight }: StampsCardProps) {
  // Sort stamps chronologically (most recent first)
  const sortedStamps = [...stamps].sort(
    (a, b) => b.collectedAt.getTime() - a.collectedAt.getTime()
  );

  return (
    <PassportPage
      icon="ribbon"
      title={PASSPORT_STAMPS_TITLE}
      subtitle={PASSPORT_ISSUER_LINE}
      badge={`${stamps.length} STAMPED`}
      footerText={PASSPORT_STAMPS_HEADER}
      pageNumber="02"
      testID="passport-stamps-page"
    >
      {sortedStamps.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyStamp}>
            <Ionicons name="map-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Start Your Journey!</Text>
          <Text style={styles.emptyMessage}>
            Scan QR codes at partner sites to collect your first stamp.
          </Text>
          <View style={styles.emptyAction}>
            <Button
              title="Scan a QR code"
              onPress={() => router.push('/scanner')}
              variant="accent"
              size="compact"
              icon={<Ionicons name="qr-code-outline" size={18} color={colors.background} />}
              testID="passport-empty-scan-button"
            />
          </View>
        </View>
      ) : (
        <View style={styles.grid}>
          {sortedStamps.map((stamp, index) => (
            <StampReveal
              key={`${stamp.id}-${index}`}
              style={styles.slot}
              highlight={highlight?.stampId === stamp.id ? highlight : undefined}
            >
              <StampSlot stamp={stamp} style={styles.slotInner} />
            </StampReveal>
          ))}
        </View>
      )}
    </PassportPage>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStamp: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
    marginBottom: spacing.base,
    transform: [{ rotate: '-8deg' }],
  },
  emptyTitle: {
    ...typography.headlineSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyAction: {
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  slot: {
    width: '48.5%',
  },
  slotInner: {
    width: '100%',
  },
});
