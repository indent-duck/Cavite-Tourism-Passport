import { colors } from '@/theme';
import { StyleSheet, Text } from 'react-native';
import { ResultNote, ResultSheet } from './ResultSheet';

/**
 * No Internet Sheet
 *
 * Displays no internet connection modal with:
 * - Offline icon
 * - "No Internet Connection" title
 * - Message
 * - Mobile data / Wi-Fi tip
 * - "Try again" (re-sends the same code) and "Close scanner" buttons
 *
 * Matches design: design/screens/06-scanner/qr_modal_no_internet_connection/screen.png
 *
 * Note: Omits "Pending verification" row and "Detected Target" section per product.md
 */

export interface NoInternetSheetProps {
  visible: boolean;
  /** Tapping outside the modal or pressing back */
  onDismiss: () => void;
  onTryAgain: () => void;
  onClose: () => void;
}

export function NoInternetSheet({ visible, onDismiss, onTryAgain, onClose }: NoInternetSheetProps) {
  return (
    <ResultSheet
      visible={visible}
      onDismiss={onDismiss}
      tone="info"
      icon="cloud-offline-outline"
      title="No Internet Connection"
      message={
        <>
          <Text style={styles.lead}>Scanning needs an internet connection.</Text> A live network
          connection is required to verify the digital stamp with the provincial database and
          credit points to your account.
        </>
      }
      primaryAction={{ title: 'Try again', onPress: onTryAgain, testID: 'no-internet-try-again' }}
      secondaryAction={{ title: 'Close scanner', onPress: onClose, testID: 'no-internet-close' }}
    >
      <ResultNote icon="cellular-outline" tone="info">
        Please check your mobile data or Wi-Fi settings and try again.
      </ResultNote>
    </ResultSheet>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
  },
});
