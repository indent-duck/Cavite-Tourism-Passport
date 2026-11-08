import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ResultSheet } from './ResultSheet';
import type { SimpleModalSheetRef } from './SimpleModalSheet';

/**
 * No Internet Sheet
 * 
 * Displays no internet connection modal with:
 * - Offline icon
 * - "No Internet Connection" title
 * - Message
 * - "Retry Connection" and "Close Scanner" buttons
 * 
 * Matches design: design/screens/06-scanner/qr_modal_no_internet_connection/screen.png
 * 
 * Note: Omits "Pending verification" row and "Detected Target" section per product.md
 */

export interface NoInternetSheetProps {
  onRetry: () => void;
  onClose: () => void;
}

export const NoInternetSheet = forwardRef<SimpleModalSheetRef, NoInternetSheetProps>(
  ({ onRetry, onClose }, ref) => {
    return (
      <ResultSheet ref={ref} heightPercentage={60}>
        <View style={styles.container}>
          {/* Offline Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="cloud-offline" size={48} color={colors.textSecondary} />
            </View>
          </View>

          {/* Title and Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>No Internet Connection</Text>
            <Text style={styles.subtitle}>
              Scanning needs an internet connection.
            </Text>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              A live network connection is required to verify the digital stamp with the provincial database and credit points to your account.
            </Text>
          </View>

          {/* Network Tip */}
          <View style={styles.tipCard}>
            <Ionicons name="cellular" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              Please check your mobile data or Wi-Fi settings and try again.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Dismiss"
              onPress={onRetry}
              variant="primary"
              fullWidth
            />
          </View>
        </View>
      </ResultSheet>
    );
  }
);

NoInternetSheet.displayName = 'NoInternetSheet';

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
    backgroundColor: colors.surface,
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
  infoText: {
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
  tipCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.primary}10`,
    borderRadius: spacing.md,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  tipText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    ...typography.bodyMedium,
    color: colors.text,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.base,
  },
});
