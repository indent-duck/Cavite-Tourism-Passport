import { TAB_BAR_HEIGHT } from '@/lib/constants';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

/**
 * ScreenContainer Component
 * 
 * A standardized wrapper for all screens providing safe area handling,
 * optional header, keyboard avoidance, and tab bar padding.
 * 
 * Validates: Requirements 1.2.6 (ScreenContainer Component)
 */

export interface ScreenContainerProps {
  /**
   * Content to render inside the container
   */
  children: React.ReactNode;

  /**
   * Whether the content should be scrollable
   * @default false
   */
  scrollable?: boolean;

  /**
   * Whether to show the header with back button
   * @default false
   */
  showHeader?: boolean;

  /**
   * Title text for the header
   */
  headerTitle?: string;

  /**
   * Callback when back button is pressed
   */
  onBackPress?: () => void;

  /**
   * Additional styles for content container
   */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Whether to add bottom padding for tab bar
   * Only used inside (tabs) routes
   * @default false
   */
  withTabBarPadding?: boolean;

  /**
   * Safe area edges to apply
   * @default ['top', 'left', 'right']
   * Inside (tabs) routes, pass ['left', 'right'] only
   */
  edges?: readonly Edge[];

  /**
   * Test identifier for automated testing
   */
  testID?: string;

  /**
   * Ref to the ScrollView for programmatic scrolling
   */
  scrollViewRef?: React.RefObject<any>;
}

export function ScreenContainer({
  children,
  scrollable = false,
  showHeader = false,
  headerTitle,
  onBackPress,
  contentContainerStyle,
  withTabBarPadding = false,
  edges = ['top', 'left', 'right'],
  testID,
  scrollViewRef,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  // Calculate bottom padding if tab bar padding is enabled
  const bottomPadding = withTabBarPadding ? TAB_BAR_HEIGHT + insets.bottom : 0;

  const content = (
    <View style={styles.content}>
      {showHeader && (
        <View style={styles.header}>
          {onBackPress && (
            <Pressable
              onPress={onBackPress}
              style={styles.backButton}
              hitSlop={spacing.md}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          )}
          {headerTitle && (
            <Text style={styles.headerTitle}>{headerTitle}</Text>
          )}
        </View>
      )}

      {scrollable ? (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: bottomPadding || spacing.lg },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, { paddingBottom: bottomPadding }, contentContainerStyle]}>
          {children}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={edges} testID={testID}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.headlineSmall,
    color: colors.text,
    fontFamily: 'Inter_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
});