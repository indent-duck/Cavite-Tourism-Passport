import { colors, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Button } from '../ui/Button';

/**
 * LogoutConfirmModal Component
 * 
 * Confirmation modal for the logout action.
 * Prevents accidental logout by requiring explicit confirmation.
 * 
 * Validates: Requirements 3 (Log out confirmation modal)
 */

export interface LogoutConfirmModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;

  /**
   * Callback when the modal should be dismissed (Cancel or back button)
   */
  onDismiss: () => void;

  /**
   * Callback when the user confirms logout
   */
  onConfirm: () => void;

  /**
   * Whether the logout action is in progress
   */
  isLoading?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  onDismiss,
  onConfirm,
  isLoading = false,
}) => {
  // Handle Android back button
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onDismiss();
        return true; // Prevent default behavior
      }
    );

    return () => backHandler.remove();
  }, [visible, onDismiss]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      {/* Overlay */}
      <Pressable style={styles.overlay} onPress={onDismiss}>
        {/* Modal Container */}
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={56}
              color={colors.error}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Log Out?</Text>

          {/* Message */}
          <Text style={styles.message}>
            Are you sure you want to log out? You&apos;ll need to sign in again to access your passport.
          </Text>

          {/* Button Row */}
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={onDismiss}
                disabled={isLoading}
                fullWidth
              />
            </View>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.confirmButton,
                  isLoading && styles.confirmButtonDisabled,
                ]}
                onPress={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Log Out</Text>
                )}
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: 20,
    maxWidth: 320,
    width: '100%',
    padding: spacing.xl, // 24px
    alignItems: 'center',
    ...shadows.card,
    shadowOpacity: 0.2, // Increase shadow for large shadow effect
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: spacing.md, // 12px
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm, // 8px
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl, // 24px
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md, // 12px between buttons
  },
  buttonContainer: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: colors.error,
    borderRadius: radii.button, // 24px for pill shape
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl, // 24px
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.background, // White text
    letterSpacing: 0.14,
  },
});
