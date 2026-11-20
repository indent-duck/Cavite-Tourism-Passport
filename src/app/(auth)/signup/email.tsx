import {
  AuthHeader,
  AuthSwitchPrompt,
  TermsSheet,
  authScreenStyles,
  linkTextStyle,
  type TermsSheetRef,
} from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextInput, type TextInputRef } from '@/components/ui/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { EMAIL_REGEX } from '@/lib/constants';
import { hapticError } from '@/lib/haptics';
import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';


/**
 * Sign Up - Step 1: Email Entry
 *
 * First step of the signup process where user enters their email address
 * and agrees to the terms of service. Sends verification code on success.
 *
 * Validates: Requirements 1.2 (Sign up step 1)
 */
export default function SignupEmailScreen() {
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [termsError, setTermsError] = useState('');

  const { sendCode } = useAuth();
  const emailRef = useRef<TextInputRef>(null);
  const termsSheetRef = useRef<TermsSheetRef>(null);

  const handleContinue = async () => {
    setEmailError('');
    setTermsError('');

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
        setTermsError('Please accept the Terms of Service and Privacy Policy to continue');
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

  const toggleTerms = () => {
    setTermsAccepted((accepted) => !accepted);
    setTermsError('');
  };

  const acceptTerms = () => {
    setTermsAccepted(true);
    setTermsError('');
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

        {/* Terms: the whole row toggles the checkbox; the links open the terms sheet */}
        <View style={styles.termsBlock}>
          <Pressable
            onPress={toggleTerms}
            style={styles.termsRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: termsAccepted }}
            accessibilityLabel="I agree to the Terms of Service and Privacy Policy"
          >
            <View
              style={[
                styles.checkbox,
                termsAccepted && styles.checkboxChecked,
                !!termsError && styles.checkboxError,
              ]}
            >
              {termsAccepted && <Ionicons name="checkmark" size={16} color={colors.background} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text
                style={styles.termsLink}
                onPress={() => termsSheetRef.current?.present('terms')}
                accessibilityRole="link"
              >
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text
                style={styles.termsLink}
                onPress={() => termsSheetRef.current?.present('privacy')}
                accessibilityRole="link"
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </Pressable>
          {termsError ? (
            <View style={styles.errorRow} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={14} color={colors.error} />
              <Text style={styles.errorText}>{termsError}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <TermsSheet ref={termsSheetRef} accepted={termsAccepted} onAccept={acceptTerms} />
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
  termsBlock: {
    gap: spacing.xs,
  },
  // Row is at least 44px tall so the checkbox is easy to hit
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.error,
  },
  termsText: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    flex: 1,
  },
  // Same size as the sentence so the links sit on the same baseline
  termsLink: {
    ...typography.bodyMedium,
    fontFamily: linkTextStyle.fontFamily,
    color: linkTextStyle.color,
    textDecorationLine: 'underline',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },
});
