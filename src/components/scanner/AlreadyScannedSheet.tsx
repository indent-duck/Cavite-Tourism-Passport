import { Button } from '@/components/ui/Button';
import { usePromoPeriod } from '@/hooks/usePromoPeriod';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ResultSheet } from './ResultSheet';
import type { SimpleModalSheetRef } from './SimpleModalSheet';

/**
 * Already Scanned Sheet
 * 
 * Displays already scanned modal with:
 * - Info icon
 * - "Already Scanned" title
 * - Site name and collected date
 * - Promo period note
 * - "View in Passport" and "Back to Scanner" buttons
 * 
 * Matches design: design/screens/06-scanner/qr_modal_already_scanned/screen.png
 */

export interface AlreadyScannedSheetProps {
  siteName: string;
  collectedDate: Date;
  onViewPassport: () => void;
  onBackToScanner: () => void;
}

export const AlreadyScannedSheet = forwardRef<SimpleModalSheetRef, AlreadyScannedSheetProps>(
  ({ siteName, collectedDate, onViewPassport, onBackToScanner }, ref) => {
    const { data: promoPeriod } = usePromoPeriod();

    // Format collected date
    const formatDate = (date: Date): string => {
      // Ensure date is a Date object (might be a string from serialization)
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(dateObj);
    };

    // Format promo period dates
    const formatPromoPeriod = (): string => {
      if (!promoPeriod) return '';
      
      // Ensure dates are Date objects (they might be strings from serialization)
      const startDate = promoPeriod.startDate instanceof Date 
        ? promoPeriod.startDate 
        : new Date(promoPeriod.startDate);
      const endDate = promoPeriod.endDate instanceof Date 
        ? promoPeriod.endDate 
        : new Date(promoPeriod.endDate);
      
      const start = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(startDate);
      const end = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(endDate);
      return `${start} - ${end}`;
    };

    return (
      <ResultSheet ref={ref} snapPoints={['60%']}>
        <View style={styles.container}>
          {/* Info Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="information-circle" size={48} color={colors.primary} />
            </View>
          </View>

          {/* Title and Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Already Scanned</Text>
            <Text style={styles.subtitle}>
              You have already collected a stamp from this site.
            </Text>
          </View>

          {/* Site Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>SITE</Text>
                <Text style={styles.infoValue}>{siteName}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>COLLECTED ON</Text>
                <Text style={styles.infoValue}>{formatDate(collectedDate)}</Text>
              </View>
            </View>
          </View>

          {/* Promo Period Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.noteText}>
              You can collect one stamp per site during the promo period
              {promoPeriod && ` (${formatPromoPeriod()})`}.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Dismiss"
              onPress={onViewPassport}
              variant="primary"
              fullWidth
            />
          </View>
        </View>
      </ResultSheet>
    );
  }
);

AlreadyScannedSheet.displayName = 'AlreadyScannedSheet';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily,
    ...typography.headlineMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: typography.fontFamily,
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  noteText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.base,
  },
});
