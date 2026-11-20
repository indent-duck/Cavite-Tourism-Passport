import { AuthHeader, authScreenStyles, FormBanner, MunicipalityPicker } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { PasswordCriteria } from '@/components/ui/PasswordCriteria';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextInput, type TextInputRef } from '@/components/ui/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { formatAddress } from '@/lib/address';
import { hapticError } from '@/lib/haptics';
import { getNameError, MAX_NAME_LENGTH, normalizeName } from '@/lib/names';
import { isValidPassword } from '@/lib/password';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { StyleSheet, Text, View, type ScrollView } from 'react-native';

/**
 * Sign Up - Step 3: Personal Details
 *
 * Final step of signup where user enters first and last name, address, and
 * creates a password.
 * The address is built from a city/municipality picked from all of Cavite's
 * LGUs plus an optional barangay/street line. Includes live password criteria.
 *
 * Validates: Requirements 1.4 (Sign up step 3)
 */
export default function SignupDetailsScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [street, setStreet] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [municipalityError, setMunicipalityError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  // The Create account button sits right under Confirm password. Keep that much
  // room (field bottom -> button bottom) between the focused field and the
  // keyboard so focusing Confirm password also reveals the button. Measured from
  // layout rather than switched per focused field, so it never lags behind focus.
  const [confirmBottom, setConfirmBottom] = useState(0);
  const [buttonBottom, setButtonBottom] = useState(0);
  const spaceBelowConfirm = Math.max(0, buttonBottom - confirmBottom);

  const { signUp } = useAuth();

  const scrollViewRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const firstNameRef = useRef<TextInputRef>(null);
  const lastNameRef = useRef<TextInputRef>(null);
  const streetRef = useRef<TextInputRef>(null);
  const passwordRef = useRef<TextInputRef>(null);
  const confirmPasswordRef = useRef<TextInputRef>(null);
  // Layout offsets used to scroll the municipality field (not a TextInput) into view
  const formY = useRef(0);
  const municipalityY = useRef(0);

  const handleCreateAccount = async () => {
    setFirstNameError('');
    setLastNameError('');
    setMunicipalityError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFormError('');

    const errors = {
      firstName: getNameError(firstName, 'First name'),
      lastName: getNameError(lastName, 'Last name'),
      municipality: !municipality ? 'Select your city or municipality' : '',
      password: !password
        ? 'Password is required'
        : !isValidPassword(password)
          ? 'Password must meet all criteria'
          : '',
      confirmPassword: !confirmPassword
        ? 'Please confirm your password'
        : password !== confirmPassword
          ? 'Passwords do not match'
          : '',
    };

    setFirstNameError(errors.firstName);
    setLastNameError(errors.lastName);
    setMunicipalityError(errors.municipality);
    setPasswordError(errors.password);
    setConfirmPasswordError(errors.confirmPassword);

    // Take the user to the first problem, top to bottom
    if (
      errors.firstName ||
      errors.lastName ||
      errors.municipality ||
      errors.password ||
      errors.confirmPassword
    ) {
      hapticError();
      if (errors.firstName) {
        firstNameRef.current?.focus();
      } else if (errors.lastName) {
        lastNameRef.current?.focus();
      } else if (errors.municipality) {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, formY.current + municipalityY.current - spacing.xl),
          animated: true,
        });
      } else if (errors.password) {
        passwordRef.current?.focus();
      } else {
        confirmPasswordRef.current?.focus();
      }
      return;
    }

    const address = formatAddress(street, municipality ?? '');

    try {
      await signUp.fn(email, normalizeName(firstName), normalizeName(lastName), address, password);
      // On success, navigate to main app and clear auth stack
      router.replace('/(tabs)/explore');
    } catch (error) {
      // Use the thrown error: the hook's error state is not updated yet in this closure
      setFormError(
        error instanceof Error ? error.message : 'Failed to create account. Please try again.'
      );
      hapticError();
    }
  };

  return (
    <ScreenContainer
      scrollable
      keyboardAware
      edges={['top', 'left', 'right', 'bottom']}
      scrollViewRef={scrollViewRef}
      contentContainerStyle={authScreenStyles.scrollContent}
      keyboardBottomOffset={spacing.base + spaceBelowConfirm}
    >
      <AuthHeader step={3} totalSteps={3} onBack={() => router.back()} backLabel="Back to verification" />

      <Text style={[authScreenStyles.headline, styles.headline]} accessibilityRole="header">
        Your personal details
      </Text>

      <View
        style={styles.form}
        onLayout={(event) => {
          formY.current = event.nativeEvent.layout.y;
        }}
      >
        <TextInput
          ref={firstNameRef}
          label="First name"
          leftIcon="person-outline"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            setFirstNameError('');
          }}
          placeholder="e.g. Juan"
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          maxLength={MAX_NAME_LENGTH}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => lastNameRef.current?.focus()}
          error={firstNameError}
        />

        <TextInput
          ref={lastNameRef}
          label="Last name"
          leftIcon="person-outline"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            setLastNameError('');
          }}
          placeholder="e.g. Dela Cruz"
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          maxLength={MAX_NAME_LENGTH}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => streetRef.current?.focus()}
          error={lastNameError}
        />

        <View
          onLayout={(event) => {
            municipalityY.current = event.nativeEvent.layout.y;
          }}
        >
          <MunicipalityPicker
            label="City or municipality"
            value={municipality}
            onChange={(selected) => {
              setMunicipality(selected);
              setMunicipalityError('');
            }}
            error={municipalityError}
          />
        </View>

        <TextInput
          ref={streetRef}
          label="Barangay and street (optional)"
          leftIcon="home-outline"
          value={street}
          onChangeText={setStreet}
          placeholder="e.g. Brgy. Poblacion, Rizal St."
          autoCapitalize="words"
          autoComplete="address-line1"
          textContentType="streetAddressLine1"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <View style={styles.passwordGroup}>
          <TextInput
            ref={passwordRef}
            label="Password"
            leftIcon="lock-closed-outline"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            placeholder="Create a password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            error={passwordError}
          />
          {/* Criteria sit directly under the field they describe */}
          <PasswordCriteria password={password} style={styles.criteria} />
        </View>

        <View
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setConfirmBottom(y + height);
          }}
        >
          <TextInput
            ref={confirmPasswordRef}
            label="Confirm password"
            leftIcon="lock-closed-outline"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError('');
            }}
            placeholder="Re-enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={handleCreateAccount}
            error={confirmPasswordError}
          />
        </View>

        {formError ? <FormBanner message={formError} /> : null}

        <View
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setButtonBottom(y + height);
          }}
        >
          <Button
            title="Create account"
            onPress={handleCreateAccount}
            variant="accent"
            fullWidth
            loading={signUp.loading}
            icon={<Ionicons name="checkmark" size={20} color={colors.background} />}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headline: {
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  passwordGroup: {
    gap: spacing.md,
  },
  criteria: {
    paddingHorizontal: spacing.xs,
    marginBottom: -spacing.sm, // last criteria row carries its own bottom margin
  },
});
