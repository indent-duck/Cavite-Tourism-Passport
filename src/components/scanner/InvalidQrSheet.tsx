import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { ResultSheet } from './ResultSheet';

/**
 * Invalid QR Sheet
 *
 * Displays invalid QR code modal with:
 * - Error icon
 * - "Invalid QR Code" title
 * - Troubleshooting tips (3 items)
 * - "Scan again" (keeps the scanner open) and "Close scanner" buttons
 *
 * Matches design: design/screens/06-scanner/qr_modal_invalid_qr_code/screen.png
 */

export interface InvalidQrSheetProps {
  visible: boolean;
  /** Tapping outside the modal or pressing back */
  onDismiss: () => void;
  onTryAgain: () => void;
  onClose: () => void;
}

export function InvalidQrSheet({ visible, onDismiss, onTryAgain, onClose }: InvalidQrSheetProps) {
  return (
    <ResultSheet visible={visible} onDismiss={onDismiss} heightPercentage={70}>
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
            title="Scan again"
            onPress={onTryAgain}
            variant="primary"
            fullWidth
            testID="invalid-qr-try-again"
          />
          <Button
            title="Close scanner"
            onPress={onClose}
            variant="text"
            fullWidth
            testID="invalid-qr-close"
          />
        </View>
      </View>
    </ResultSheet>
  );
}

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
    backgroundColor: `${colors.error}15`,
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
    paddingHorizontal: spacing.base,
  },
  tipsContainer: {
    width: '100%',
    marginBottom: spacing.lg,
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
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  tipItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipNumberText: {
    fontFamily: typography.fontFamily,
    ...typography.labelSmall,
    color: colors.background,
  },
  tipText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    ...typography.bodySmall,
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
    gap: spacing.sm,
  },
  sealIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealTextContainer: {
    flex: 1,
  },
  sealTitle: {
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  sealText: {
    fontFamily: typography.fontFamily,
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.base,
    gap: spacing.sm,
  },
});
