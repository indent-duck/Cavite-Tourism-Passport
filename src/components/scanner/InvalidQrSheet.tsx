import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { ResultSheet } from './ResultSheet';
import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/theme';

/**
 * Invalid QR Sheet
 * 
 * Displays invalid QR code modal with:
 * - Error icon
 * - "Invalid QR Code" title
 * - Troubleshooting tips (3 items)
 * - "Try Again" and "Cancel" buttons
 * 
 * Matches design: design/screens/06-scanner/qr_modal_invalid_qr_code/screen.png
 */

export interface InvalidQrSheetProps {
  onTryAgain: () => void;
  onCancel: () => void;
}

export const InvalidQrSheet = forwardRef<BottomSheetModal, InvalidQrSheetProps>(
  ({ onTryAgain, onCancel }, ref) => {
    return (
      <ResultSheet ref={ref} snapPoints={['70%']}>
        <View style={styles.container}>
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle" size={48} color={colors.error} />
            </View>
          </View>

          {/* Title and Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Invalid QR Code</Text>
            <Text style={styles.subtitle}>
              This QR code is not recognized as a registered Cavite Tourism partner establishment.
            </Text>
          </View>

          {/* Troubleshooting Tips */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              <Text style={styles.tipsTitle}>Troubleshooting Tips</Text>
            </View>

            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>1</Text>
                </View>
                <Text style={styles.tipText}>
                  Make sure you are scanning the official <Text style={styles.bold}>Cavite Tourism Passport</Text> standee or counter plaque.
                </Text>
              </View>

              <View style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>2</Text>
                </View>
                <Text style={styles.tipText}>
                  Ensure adequate lighting and hold your camera steady within the viewfinder frame.
                </Text>
              </View>

              <View style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>3</Text>
                </View>
                <Text style={styles.tipText}>
                  Maintain a distance of 15-30 cm from the code to prevent motion blur or glare.
                </Text>
              </View>
            </View>

            {/* Official Seal Partner Note */}
            <View style={styles.sealNote}>
              <View style={styles.sealIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.sealTextContainer}>
                <Text style={styles.sealTitle}>Official Seal Partner</Text>
                <Text style={styles.sealText}>Look for the Gold Provincial seal</Text>
              </View>
              <Ionicons name="shield" size={24} color={colors.accent} />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Try Again"
              onPress={onTryAgain}
              variant="primary"
              fullWidth
            />
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="outline"
              fullWidth
            />
          </View>
        </View>
      </ResultSheet>
    );
  }
);

InvalidQrSheet.displayName = 'InvalidQrSheet';

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
    backgroundColor: `${colors.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: spacing.base,
  },
  tipsContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  tipsTitle: {
    fontFamily: typography.fontFamily,
    ...typography.titleMedium,
    color: colors.text,
  },
  tipsList: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  tipItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipNumberText: {
    fontFamily: typography.fontFamily,
    ...typography.labelMedium,
    color: colors.background,
  },
  tipText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.text,
  },
  bold: {
    fontWeight: '600',
  },
  sealNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.base,
    gap: spacing.md,
  },
  sealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealTextContainer: {
    flex: 1,
  },
  sealTitle: {
    fontFamily: typography.fontFamily,
    ...typography.titleMedium,
    color: colors.text,
  },
  sealText: {
    fontFamily: typography.fontFamily,
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    marginTop: 'auto',
  },
});
