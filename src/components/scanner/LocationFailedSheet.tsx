import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { ResultSheet } from './ResultSheet';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/theme';

/**
 * Location Failed Sheet
 * 
 * Displays location check failed modal with:
 * - Warning icon
 * - "Location Check Failed" title
 * - Message and target site name
 * - "Check Location & Retry" and "Dismiss" buttons
 * 
 * Matches design: design/screens/06-scanner/qr_modal_location_check_failed/screen.png
 * 
 * Note: Omits hardcoded distances ("150m boundary") per product.md
 */

export interface LocationFailedSheetProps {
  targetSiteName: string;
  targetMunicipality: string;
  onRetry: () => void;
  onDismiss: () => void;
}

export const LocationFailedSheet = forwardRef<BottomSheetModal, LocationFailedSheetProps>(
  ({ targetSiteName, targetMunicipality, onRetry, onDismiss }, ref) => {
    return (
      <ResultSheet ref={ref} snapPoints={['70%']}>
        <View style={styles.container}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={48} color={colors.accent} />
            </View>
          </View>

          {/* Title and Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Location Check Failed</Text>
            <Text style={styles.subtitle}>
              You need to be at this site to collect its stamp.
            </Text>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Our verification system uses GPS to ensure you are physically present at the official partner establishment.
            </Text>
          </View>

          {/* Target Site Card */}
          <View style={styles.targetCard}>
            <View style={styles.targetHeader}>
              <Ionicons name="business" size={20} color={colors.primary} />
              <Text style={styles.targetLabel}>TARGET SITE</Text>
            </View>
            <Text style={styles.targetSite}>
              {targetSiteName}, {targetMunicipality}
            </Text>
          </View>

          {/* Error Message */}
          <View style={styles.errorCard}>
            <Ionicons name="close-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>
              Device is outside the site verification zone.
            </Text>
          </View>

          {/* GPS Tip */}
          <View style={styles.tipCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.tipText}>
              Check that high-accuracy GPS location is turned on in your device settings.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Check Location & Retry"
              onPress={onRetry}
              variant="primary"
              fullWidth
            />
            <Button
              title="Dismiss"
              onPress={onDismiss}
              variant="outline"
              fullWidth
            />
          </View>
        </View>
      </ResultSheet>
    );
  }
);

LocationFailedSheet.displayName = 'LocationFailedSheet';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.accent}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: spacing.base,
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
  infoCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  infoText: {
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
  targetCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  targetLabel: {
    fontFamily: typography.fontFamily,
    ...typography.labelSmall,
    color: colors.textSecondary,
  },
  targetSite: {
    fontFamily: typography.fontFamily,
    ...typography.titleMedium,
    color: colors.primary,
  },
  errorCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.error}10`,
    borderRadius: spacing.md,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  errorText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.error,
  },
  tipCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.accent}10`,
    borderRadius: spacing.md,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  tipText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    ...typography.bodySmall,
    color: colors.text,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    marginTop: 'auto',
  },
});
