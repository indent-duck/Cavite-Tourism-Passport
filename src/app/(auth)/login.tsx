import { AuthLink, AuthSwitchPrompt, FormBanner, PassportCover } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { KeyboardFooter } from '@/components/ui/KeyboardFooter';
import { TextInput, type TextInputRef } from '@/components/ui/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { EMAIL_REGEX } from '@/lib/constants';
import { hapticError } from '@/lib/haptics';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, {
    useAnimatedRef,
    useAnimatedStyle,
    useScrollOffset,
    useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// How far the cream form page overlaps the leather cover
const PAGE_OVERLAP = 24;

/**
 * Login Screen
 *
 * Leather "passport cover" hero with the sign-in form on a cream page below.
 * Mock rule: password "wrong" shows error, others succeed.
 * Navigates to Explore on success.
 * Opened after deleting an account (`?notice=account-deleted`), it first
 * shows a feedback dialog confirming the deletion.
 *
 * Keyboard: the Log in button rides on top of the keyboard, and the page is
 * lifted by one amount so the whole form ends just above the button. The lift
 * does not depend on which field is focused, so both fields land in the same
 * place and switching between them does not move the screen.
 *
 * Validates: Requirements 1.1 (Login screen)
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const [showDeletedFeedback, setShowDeletedFeedback] = useState(notice === 'account-deleted');

  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  // The login screen stays mounted under the forgot-password screens, so only
  // force a light status bar while it is the visible screen
  const isFocused = useIsFocused();

  const emailRef = useRef<TextInputRef>(null);
  const passwordRef = useRef<TextInputRef>(null);

  // --- Keyboard lift -------------------------------------------------------
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useScrollOffset(scrollRef);
  // `height` is the keyboard height as a negative number, animated with the keyboard
  const keyboard = useReanimatedKeyboardAnimation();
  const screenHeight = useSharedValue(0);
  const footerHeight = useSharedValue(0);
  const pageY = useSharedValue(0);
  const formY = useSharedValue(0);
  const formHeight = useSharedValue(0);
  const topInset = insets.top;
  const bottomInset = insets.bottom;

  const liftStyle = useAnimatedStyle(() => {
    const formTop = pageY.value + formY.value - scrollY.value;
    const formBottom = formTop + formHeight.value;
    // Top edge of the footer as it rides up with the keyboard (see KeyboardFooter offset)
    const footerTop =
      screenHeight.value - footerHeight.value + keyboard.height.value + bottomInset * keyboard.progress.value;
    // Lift until the form ends just above the footer, but never push the
    // top of the form under the status bar
    const needed = formBottom + spacing.base - footerTop;
    const maxLift = formTop - topInset - spacing.base;
    const lift = Math.max(0, Math.min(needed, maxLift));
    return { transform: [{ translateY: -lift }] };
  });

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setFormError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      hapticError();
      emailRef.current?.focus();
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      hapticError();
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      hapticError();
      passwordRef.current?.focus();
      return;
    }

    try {
      await signIn.fn(email.trim(), password);
      // On success, navigate to Explore and reset navigation stack
      router.replace('/(tabs)/explore');
    } catch (error) {
      // Use the thrown error: the hook's error state is not updated yet in this closure
      setFormError(
        error instanceof Error ? error.message : 'Failed to sign in. Please try again.'
      );
      hapticError();
    }
  };

  return (
    <View
      style={styles.screen}
      onLayout={(event) => {
        screenHeight.value = event.nativeEvent.layout.height;
      }}
    >
      {isFocused && <StatusBar style="light" />}

      <Animated.View style={[styles.lift, liftStyle]}>
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          // Pulling past the top would show the cream background above the cover
          bounces={false}
          overScrollMode="never"
        >
          <PassportCover
            title="Cavite Tourism Passport"
            tagline="Explore Cavite and collect stamps."
            overlap={PAGE_OVERLAP}
          />

          <View
            style={styles.page}
            onLayout={(event) => {
              pageY.value = event.nativeEvent.layout.y;
            }}
          >
            <View
              style={styles.form}
              onLayout={(event) => {
                formY.value = event.nativeEvent.layout.y;
                formHeight.value = event.nativeEvent.layout.height;
              }}
            >
              <TextInput
                ref={emailRef}
                label="Email address"
                leftIcon="mail-outline"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                  setFormError('');
                }}
                placeholder="juandelacruz@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={emailError}
              />

              <View>
                <TextInput
                  ref={passwordRef}
                  label="Password"
                  leftIcon="lock-closed-outline"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                    setFormError('');
                  }}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  error={passwordError}
                />
                <AuthLink
                  title="Forgot password?"
                  onPress={() => router.push('/forgot/email')}
                  style={styles.forgotLink}
                />
              </View>

              {formError ? <FormBanner message={formError} /> : null}
            </View>
          </View>
        </Animated.ScrollView>
      </Animated.View>

      {/* The Log in button rides on top of the keyboard so it is never covered */}
      <KeyboardFooter
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
        onHeightChange={(height) => {
          footerHeight.value = height;
        }}
      >
        <Button
          title="Log in"
          onPress={handleLogin}
          variant="accent"
          fullWidth
          loading={signIn.loading}
          icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
        />
        <AuthSwitchPrompt
          prompt="Don't have an account?"
          linkTitle="Sign up"
          onPress={() => router.replace('/signup/email')}
        />
      </KeyboardFooter>

      <FeedbackModal
        visible={showDeletedFeedback}
        onDone={() => setShowDeletedFeedback(false)}
        icon="trash-outline"
        tone="neutral"
        title="Account deleted"
        message="Your passport, stamps, points and personal details have been permanently removed. Thanks for exploring Cavite with us."
        buttonTitle="OK"
        testID="account-deleted"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Cream behind everything so lifting the page never reveals a different color
  screen: {
    flex: 1,
    backgroundColor: colors.passportCream,
  },
  lift: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flexGrow: 1,
    marginTop: -PAGE_OVERLAP,
    backgroundColor: colors.passportCream,
    borderTopLeftRadius: PAGE_OVERLAP,
    borderTopRightRadius: PAGE_OVERLAP,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.base,
  },
  form: {
    gap: spacing.base,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: -spacing.sm,
  },
  footer: {
    backgroundColor: colors.passportCream,
    gap: spacing.xs,
  },
});
