import { Button } from '@/components/ui/Button';
import type { Stamp } from '@/data/types';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ResultSheet } from './ResultSheet';
import { type SimpleModalSheetRef } from './SimpleModalSheet';

/**
 * Success Result Sheet
 * 
 * Displays stamp collected success modal with:
 * - Circular stamp badge (site name, municipality, verification code, date/time)
 * - Points earned label
 * - Total balance
 * - "View in Passport" and "Scan Another Code" buttons
 * 
 * Matches design: design/screens/06-scanner/qr_modal_stamp_collected_success/screen.png
 */

export interface SuccessSheetProps {
  stamp: Stamp;
  totalBalance: number;
  onViewPassport: () => void;
  onScanAnother: () => void;
}

export const SuccessSheet = forwardRef<SimpleModalSheetRef, SuccessSheetProps>(
  ({ stamp, totalBalance, onViewPassport, onScanAnother }, ref) => {
    // Format date and time
    const formatDateTime = (date: Date): string => {
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    };

    return (
      <ResultSheet ref={ref} heightPercentage={80}>
        <View style={styles.container}>
          {/* Stamp Badge */}
          <View style={styles.stampContainer}>
            <View style={styles.stampBadge}>
              <View style={styles.stampInner}>
                <Text style={styles.stampLabel}>CAVITE TOURISM</Text>
                <Text style={styles.stampSiteName}>{stamp.siteName}</Text>
                <Text style={styles.stampMunicipality}>
                  {stamp.municipality} • Cavite
                </Text>
                <Text style={styles.stampCode}>#{stamp.id.slice(0, 8).toUpperCase()}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
            </View>
            <Text style={styles.dateTime}>{formatDateTime(stamp.collectedAt)}</Text>
          </View>

          {/* Success Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Stamp Collected!</Text>
            <Text style={styles.subtitle}>
              You have earned exploration points for this visit.
            </Text>
          </View>

          {/* Points Display */}
          <View style={styles.pointsContainer}>
            <View style={styles.pointsEarned}>
              <View style={styles.starIconContainer}>
                <Ionicons name="star" size={24} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.pointsLabel}>VISIT REWARD</Text>
                <Text style={styles.pointsValue}>+{stamp.pointsEarned} pts</Text>
              </View>
            </View>
            <View style={styles.pointsBalance}>
              <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
              <Text style={styles.balanceValue}>{totalBalance} pts</Text>
            </View>
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

SuccessSheet.displayName = 'SuccessSheet';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  stampContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stampBadge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.sm,
  },
  stampInner: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xs,
  },
  stampLabel: {
    fontFamily: typography.fontFamily,
    ...typography.labelSmall,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  stampSiteName: {
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  stampMunicipality: {
    fontFamily: typography.fontFamily,
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  stampCode: {
    fontFamily: typography.fontFamily,
    ...typography.labelSmall,
    color: colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 10,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTime: {
    fontFamily: typography.fontFamily,
    ...typography.bodySmall,
    color: colors.textSecondary,
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
  pointsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pointsEarned: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  starIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsLabel: {
    fontFamily: typography.fontFamily,
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pointsValue: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  pointsBalance: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontFamily: typography.fontFamily,
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.base,
  },
});
