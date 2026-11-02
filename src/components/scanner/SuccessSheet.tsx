import { Button } from '@/components/ui/Button';
import type { Stamp } from '@/data/types';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ResultSheet } from './ResultSheet';

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

export const SuccessSheet = forwardRef<BottomSheetModal, SuccessSheetProps>(
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
              title="View in Passport"
              onPress={onViewPassport}
              variant="primary"
              fullWidth
            />
            <Button
              title="Scan Another Code"
              onPress={onScanAnother}
              variant="outline"
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
    flex: 1,
    alignItems: 'center',
  },
  stampContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stampBadge: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.md,
  },
  stampInner: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stampLabel: {
    fontFamily: typography.fontFamily,
    ...typography.labelSmall,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  stampSiteName: {
    fontFamily: typography.fontFamily,
    ...typography.titleMedium,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  stampMunicipality: {
    fontFamily: typography.fontFamily,
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stampCode: {
    fontFamily: typography.fontFamily,
    ...typography.labelMedium,
    color: colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTime: {
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.fontFamily,
    ...typography.headlineLarge,
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
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pointsEarned: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.base,
    gap: spacing.md,
  },
  starIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 24,
    lineHeight: 32,
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
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    marginTop: 'auto',
  },
});
