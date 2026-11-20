import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ResultDivider, ResultInfoRow, ResultPanel, ResultSheet } from './ResultSheet';

/**
 * Invalid QR Sheet
 *
 * Displays invalid QR code modal with:
 * - QR icon with an error badge
 * - "Invalid QR Code" title
 * - Troubleshooting tips (3 items) and the official seal to look for, in one panel
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
    <ResultSheet
      visible={visible}
      onDismiss={onDismiss}
      tone="error"
      icon="qr-code-outline"
      badge="close"
      title="Invalid QR Code"
      message="This QR code is not recognized as a registered Cavite Tourism partner establishment."
      primaryAction={{ title: 'Scan again', onPress: onTryAgain, testID: 'invalid-qr-try-again' }}
      secondaryAction={{ title: 'Close scanner', onPress: onClose, testID: 'invalid-qr-close' }}
    >
      <ResultPanel>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb-outline" size={18} color={colors.primary} />
          <Text style={styles.tipsTitle}>Troubleshooting tips</Text>
        </View>

        <Tip number={1}>
          Make sure you are scanning the official{' '}
          <Text style={styles.bold}>Cavite Tourism Passport</Text> standee or counter plaque.
        </Tip>
        <Tip number={2}>
          Ensure adequate lighting and hold your camera steady within the viewfinder frame.
        </Tip>
        <Tip number={3}>
          Maintain a distance of 15–30 cm from the code to prevent motion blur or glare.
        </Tip>

        <ResultDivider />

        <ResultInfoRow
          icon="shield-checkmark"
          label="OFFICIAL SEAL PARTNER"
          value="Look for the Gold Provincial seal"
          color={colors.accent}
        />
      </ResultPanel>
    </ResultSheet>
  );
}

function Tip({ number, children }: { number: number; children: ReactNode }) {
  return (
    <View style={styles.tip}>
      <View style={styles.tipNumber}>
        <Text style={styles.tipNumberText}>{number}</Text>
      </View>
      <Text style={styles.tipText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tipsTitle: {
    ...typography.titleMedium,
    fontFamily: 'Inter_700Bold',
    color: colors.text,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipNumber: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumberText: {
    ...typography.labelSmall,
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
  tipText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  bold: {
    fontFamily: 'Inter_600SemiBold',
  },
});
