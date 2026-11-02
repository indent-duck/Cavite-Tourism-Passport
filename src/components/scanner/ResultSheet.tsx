import { colors, radii, spacing } from '@/theme';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { forwardRef, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Base Result Sheet Component
 * 
 * Wraps @gorhom/bottom-sheet with consistent styling for scanner result modals.
 * Provides drag handle, rounded top corners, white background, and bottom safe area padding.
 */

export interface ResultSheetProps {
  children: React.ReactNode;
  heightPercentage?: number; // Height as percentage (0-100)
}

export const ResultSheet = forwardRef<BottomSheetModal, ResultSheetProps>(
  ({ children, heightPercentage = 75 }, ref) => {
    const insets = useSafeAreaInsets();
    const { height } = Dimensions.get('window');

    // Calculate snap point as actual pixel value from percentage
    const snapPoints = useMemo(() => {
      const snapHeight = Math.round((height * heightPercentage) / 100);
      return [snapHeight];
    }, [height, heightPercentage]);

    // Render backdrop
    const renderBackdrop = useMemo(
      () => (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.xl }]}>
          {children}
        </View>
      </BottomSheetModal>
    );
  }
);

ResultSheet.displayName = 'ResultSheet';

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.card + 8, // 24px
    borderTopRightRadius: radii.card + 8, // 24px
  },
  handleIndicator: {
    backgroundColor: colors.border,
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
});
