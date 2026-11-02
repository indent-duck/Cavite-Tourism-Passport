import { colors, radii, spacing } from '@/theme';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Simple Modal Component
 * 
 * A centered modal dialog using React Native's built-in Modal.
 * Displays content in a card at the center of the screen with a backdrop.
 */

export interface SimpleModalSheetProps {
  children: React.ReactNode;
  heightPercentage?: number;
}

export interface SimpleModalSheetRef {
  present: () => void;
  close: () => void;
  dismiss: () => void;
}

export const SimpleModalSheet = forwardRef<SimpleModalSheetRef, SimpleModalSheetProps>(
  ({ children, heightPercentage = 75 }, ref) => {
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const { height } = Dimensions.get('window');

    // Limit max height to 85% of screen to prevent overflow
    const maxHeight = height * 0.85;

    useImperativeHandle(ref, () => ({
      present: () => {
        console.log('[SimpleModalSheet] present() called');
        setVisible(true);
      },
      close: () => {
        console.log('[SimpleModalSheet] close() called');
        setVisible(false);
      },
      dismiss: () => {
        console.log('[SimpleModalSheet] dismiss() called');
        setVisible(false);
      },
    }));

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          {/* Backdrop */}
          <Pressable
            style={styles.backdrop}
            onPress={() => setVisible(false)}
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
);

SimpleModalSheet.displayName = 'SimpleModalSheet';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
