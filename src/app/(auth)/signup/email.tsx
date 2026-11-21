import {
  AuthHeader,
  AuthSwitchPrompt,
  FormBanner,
  GoogleButton,
  OrDivider,
  TermsCheckbox,
  authScreenStyles,
} from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextInput, type TextInputRef } from '@/components/ui/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { EMAIL_REGEX } from '@/lib/constants';
import { hapticError } from '@/lib/haptics';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TERMS_REQUIRED = 'Please accept the Terms of Service and Privacy Policy to continue';

/**
 * Sign Up - Step 1: Email Entry
 *
 * First step of the signup process where user enters their email address
 * and agrees to the terms of service. Sends verification code on success.
 * "Continue with Google" (also needs the terms) skips the code: a new
 * Google account goes straight to step 3, an existing one into the app.
 *
 * Validates: Requirements 1.2 (Sign up step 1)
 */
export default function SignupEmailScreen() {
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [googleError, setGoogleError] = useState('');

  const { sendCode, google } = useAuth();
  const emailRef = useRef<TextInputRef>(null);

  const handleContinue = async () => {
    setEmailError('');
    setTermsError('');
    setGoogleError('');

    const trimmed = email.trim();
    let emailProblem = '';
    if (!trimmed) {
      emailProblem = 'Email is required';
    } else if (!EMAIL_REGEX.test(trimmed)) {
      emailProblem = 'Please enter a valid email address';
    }

    if (emailProblem || !termsAccepted) {
      setEmailError(emailProblem);
      if (!termsAccepted) {
        setTermsError(TERMS_REQUIRED);
      }
      hapticError();
      if (emailProblem) emailRef.current?.focus();
      return;
    }

    try {
      await sendCode.fn(trimmed, 'signup');
      router.push({
        pathname: '/signup/verify',
        params: { email: trimmed },
      });
    } catch (error) {
      // Use the thrown error: the hook's error state is not updated yet in this closure
      setEmailError(
        error instanceof Error ? error.message : 'Failed to send verification code. Please try again.'
      );
      hapticError();
    }
  };

  const handleGoogle = async () => {
    setEmailError('');
    setTermsError('');
    setGoogleError('');

    if (!termsAccepted) {
      setTermsError(TERMS_REQUIRED);
      hapticError();
      return;
    }

    try {
      const result = await google.fn();
      if (!result) return; // Picker closed
      if (result.user.firstName) {
        // This Google account already has a passport
        router.replace('/(tabs)/explore');
      } else {
        router.replace({
          pathname: '/signup/details',
          params: {
            method: 'google',
            termsAccepted: 'yes',
            firstName: result.givenName ?? '',
            lastName: result.familyName ?? '',
          },
        });
      }
    } catch (error) {
      setGoogleError(
        error instanceof Error ? error.message : 'Google sign-in failed. Please try again.'
      );
      hapticError();
    }
  };

  return (
    <ScreenContainer
      scrollable
      keyboardAware
      edges={['top', 'left', 'right', 'bottom']}
      contentContainerStyle={authScreenStyles.scrollContent}
      // The button rides on top of the keyboard so it is never covered
      keyboardFooter={
        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="accent"
            fullWidth
            loading={sendCode.loading}
            disabled={google.loading}
            icon={<Ionicons name="arrow-forward" size={18} color={colors.background} />}
          />
          <AuthSwitchPrompt
            prompt="Already have an account?"
            linkTitle="Log in"
            onPress={() => router.replace('/login')}
          />
        </View>
      }
    >
      <AuthHeader step={1} totalSteps={3} onBack={() => router.replace('/login')} backLabel="Back to log in" />

      <Text style={authScreenStyles.headline} accessibilityRole="header">
        Create your passport
      </Text>

      <View style={styles.form}>
        <View style={styles.googleGroup}>
          <GoogleButton
            onPress={handleGoogle}
            loading={google.loading}
            disabled={sendCode.loading}
            testID="signup-google"
          />
          {googleError ? <FormBanner message={googleError} /> : null}
        </View>
        <OrDivider />

        <TextInput
          ref={emailRef}
          label="Email address"
          leftIcon="mail-outline"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
          }}
          placeholder="juandelacruz@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
          error={emailError}
        />

        {/* Applies to both ways of signing up */}
        <TermsCheckbox
          accepted={termsAccepted}
          onChange={(accepted) => {
            setTermsAccepted(accepted);
            setTermsError('');
          }}
          error={termsError}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.lg,
  },
  googleGroup: {
    gap: spacing.md,
  },
});
