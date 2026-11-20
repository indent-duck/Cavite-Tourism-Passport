import { colors, radii, spacing } from '@/theme';
import React from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Simple Modal Component
 *
 * A centered modal dialog using React Native's built-in Modal.
 * Displays content in a card at the center of the screen with a backdrop.
 * The parent controls `visible`; tapping the backdrop or pressing Android back
 * calls `onDismiss`, so the parent's state always matches what's on screen.
 */

export interface SimpleModalSheetProps {
  /** Whether the modal is showing */
  visible: boolean;
  /** Called when the user closes the modal by tapping outside it or pressing back */
  onDismiss: () => void;
  children: React.ReactNode;
  heightPercentage?: number;
}

export function SimpleModalSheet({ visible, onDismiss, children }: SimpleModalSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = Dimensions.get('window');

  // Limit max height to 85% of screen to prevent overflow
  const maxHeight = height * 0.85;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Pressable
          style={styles.backdrop}
          onPress={onDismiss}
        />

        {/* Modal Card */}
        <View style={[styles.modalCard, { maxHeight }]}>
          {/* Content with ScrollView */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderRadius: radii.card + 8,
    maxWidth: 600,
    width: '90%',
    overflow: 'hidden',
  },
  scrollView: {
    maxHeight: '100%',
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
});
