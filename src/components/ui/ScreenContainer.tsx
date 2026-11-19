import { TAB_BAR_HEIGHT } from '@/lib/constants';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    type RefreshControlProps,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';
import { KeyboardFooter } from './KeyboardFooter';

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

  /**
   * Whether scrolling is enabled (useful for nested scrollable components like maps)
   * @default true
   */
  scrollEnabled?: boolean;

  /**
   * Pull-to-refresh control (only used when `scrollable` is true)
   */
  refreshControl?: React.ReactElement<RefreshControlProps>;

  /**
   * Keep the focused TextInput visible above the on-screen keyboard by
   * scrolling to it automatically (react-native-keyboard-controller).
   * Only used when `scrollable` is true. Use this for any form screen
   * instead of manual Keyboard listeners or scrollTo offsets.
   * @default false
   */
  keyboardAware?: boolean;

  /**
   * Space kept between the keyboard (or the keyboard footer) and the focused
   * input when `keyboardAware` is on.
   * @default 24
   */
  keyboardBottomOffset?: number;

  /**
   * Content pinned below the scroll view that rides on top of the keyboard
   * while it is open, e.g. a form's submit button. Only used with
   * `scrollable` + `keyboardAware`. The focused input is kept above it.
   */
  keyboardFooter?: React.ReactNode;

  /**
   * Style for the keyboard footer container (e.g. a background color or
   * bottom padding when the screen does not apply the bottom safe area edge)
   */
  keyboardFooterStyle?: StyleProp<ViewStyle>;

  /**
   * Screen background color
   * @default colors.background
   */
  backgroundColor?: string;
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
  scrollEnabled = true,
  refreshControl,
  keyboardAware = false,
  keyboardBottomOffset = spacing.xl,
  backgroundColor = colors.background,
  keyboardFooter,
  keyboardFooterStyle,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  // Measured so the focused input is scrolled above the footer, not just the keyboard
  const [footerHeight, setFooterHeight] = useState(0);

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

      {scrollable && keyboardAware ? (
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: bottomPadding || spacing.lg },
            contentContainerStyle,
          ]}
          bottomOffset={keyboardBottomOffset + (keyboardFooter ? footerHeight : 0)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          scrollEnabled={scrollEnabled}
          refreshControl={refreshControl}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : scrollable ? (
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
          keyboardDismissMode="on-drag"
          scrollEnabled={scrollEnabled}
          refreshControl={refreshControl}
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

  // KeyboardAwareScrollView already makes room for the keyboard. Wrapping it in
  // KeyboardAvoidingView as well would shift the content twice.
  if (scrollable && keyboardAware) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges} testID={testID}>
        {content}
        {keyboardFooter ? (
          <KeyboardFooter
            onHeightChange={setFooterHeight}
            style={[{ backgroundColor }, keyboardFooterStyle]}
          >
            {keyboardFooter}
          </KeyboardFooter>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges} testID={testID}>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});