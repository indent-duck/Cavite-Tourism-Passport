import { Button } from '@/components/ui/Button';
import { PasswordCriteria } from '@/components/ui/PasswordCriteria';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useAuth } from '@/hooks/useAuth';
import {
    MIN_PASSWORD_LENGTH,
    PASSWORD_REQUIRES_NUMBER,
    PASSWORD_REQUIRES_SPECIAL,
    PASSWORD_REQUIRES_UPPERCASE,
} from '@/lib/constants';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    Pressable,
    TextInput as RNTextInput,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

/**
 * Sign Up - Step 3: Personal Details
 * 
 * Final step of signup where user enters name, address, and creates a password.
 * Includes live password strength validation and municipality quick selectors.
 * 
 * Validates: Requirements 1.4 (Sign up step 3)
 */
export default function SignupDetailsScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [nameError, setNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { signUp } = useAuth();

  // Ref for programmatic scrolling
  const scrollViewRef = useRef<any>(null);
  const [focusedField, setFocusedField] = useState<'name' | 'address' | 'password' | 'confirmPassword' | null>(null);

  // Listen to keyboard events and scroll based on focused field
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (focusedField) {
          // Small delay to ensure keyboard is fully shown
          setTimeout(() => {
            let scrollY = 0;
            
            // Different scroll positions based on which field is focused
            switch (focusedField) {
              case 'name':
              case 'address':
                scrollY = 100; // Light scroll for top fields
                break;
              case 'password':
              case 'confirmPassword':
                scrollY = 350; // Larger scroll for password fields to show criteria
                break;
            }
            
            scrollViewRef.current?.scrollTo({
              y: scrollY,
              animated: true,
            });
          }, 100);
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Scroll back to top when keyboard closes
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [focusedField]);

  // Municipalities for quick selection
  const municipalities = ['Imus', 'Bacoor', 'Dasmariñas', 'Tagaytay', 'Kawit'];

  // Password validation helper
  const validatePassword = (pwd: string): boolean => {
    if (pwd.length < MIN_PASSWORD_LENGTH) return false;
    if (PASSWORD_REQUIRES_NUMBER && !/\d/.test(pwd)) return false;
    if (PASSWORD_REQUIRES_UPPERCASE && !/[A-Z]/.test(pwd)) return false;
    if (PASSWORD_REQUIRES_SPECIAL && !/[!@#$%^&*]/.test(pwd)) return false;
    return true;
  };

  const handleMunicipalitySelect = (municipality: string) => {
    setAddress(`${municipality}, Cavite, Philippines`);
    setAddressError('');
  };

  const handleCreateAccount = async () => {
    // Reset errors
    setNameError('');
    setAddressError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate all fields
    let hasError = false;

    if (!name.trim()) {
      setNameError('Full name is required');
      hasError = true;
    }

    if (!address.trim()) {
      setAddressError('Residential address is required');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must meet all criteria');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    try {
      await signUp.fn(email, name.trim(), address.trim(), password);
      // On success, navigate to main app and clear auth stack
      router.replace('/(tabs)/explore');
    } catch {
      // Error is handled by useAuth hook
      if (signUp.error) {
        setPasswordError(signUp.error);
      }
    }
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']} contentContainerStyle={styles.scrollContent} scrollViewRef={scrollViewRef}>
      <View style={styles.container}>
        {/* Top Bar - Back Button and Step Indicator */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={spacing.sm}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.stepBadge}>
            <View style={styles.stepDot} />
            <Text style={styles.stepBadgeText}>STEP 3 OF 3</Text>
          </View>
          <View style={styles.spacer} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headline}>Your personal details</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Full Name</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-circle-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <RNTextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setNameError('');
                }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. Juan Dela Cruz"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
            {nameError && <Text style={styles.errorText}>{nameError}</Text>}
          </View>

          {/* Residential Address */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Residential Address</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <RNTextInput
                style={styles.input}
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  setAddressError('');
                }}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
                placeholder="Barangay, City or Municipality"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
            </View>
            {addressError && <Text style={styles.errorText}>{addressError}</Text>}

            {/* Municipality Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsContainer}
              contentContainerStyle={styles.chipsContent}
            >
              {municipalities.map((municipality) => (
                <Pressable
                  key={municipality}
                  onPress={() => handleMunicipalitySelect(municipality)}
                  style={[
                    styles.chip,
                    address.startsWith(municipality) && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      address.startsWith(municipality) && styles.chipTextActive,
                    ]}
                  >
                    {municipality}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Password */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              {password && validatePassword(password) && (
                <View style={styles.strengthIndicator}>
                  <View style={styles.strengthDots}>
                    {[...Array(4)].map((_, i) => (
                      <View key={i} style={styles.strengthDot} />
                    ))}
                  </View>
                  <Text style={styles.strengthText}>Strong</Text>
                </View>
              )}
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <RNTextInput
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Create secure password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.inputRightIcon}
                hitSlop={spacing.sm}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-open-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <RNTextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError('');
                }}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.inputRightIcon}
                hitSlop={spacing.sm}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>
            {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
          </View>

          {/* Password Criteria - Always visible */}
          <View style={styles.criteriaContainer}>
            <PasswordCriteria password={password} />
          </View>

          {/* Create Account Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Create account"
              onPress={handleCreateAccount}
              variant="primary"
              fullWidth
              loading={signUp.loading}
              icon={<Ionicons name="checkmark" size={20} color={colors.background} />}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl * 4, // Bottom padding for natural scrolling
  },
  container: {
    flex: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
    marginLeft: -8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    gap: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  stepBadgeText: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  spacer: {
    width: 40,
  },
  progressBarContainer: {
    marginBottom: spacing.xl,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radii.full,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headline: {
    ...typography.displayLargeMobile,
    color: colors.primary,
  },
  form: {
    gap: spacing.md,
  },
  fieldContainer: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  label: {
    ...typography.labelMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radii.input,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text,
    padding: 0,
  },
  inputRightIcon: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    paddingHorizontal: 4,
  },
  chipsContainer: {
    marginTop: 4,
  },
  chipsContent: {
    gap: 6,
    paddingRight: spacing.base,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
  },
  chipActive: {
    backgroundColor: '#d4e3ff', // primary-fixed
  },
  chipText: {
    ...typography.labelSmall,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.primary,
  },
  strengthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strengthDots: {
    flexDirection: 'row',
    gap: 2,
  },
  strengthDot: {
    width: 10,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.success,
  },
  strengthText: {
    ...typography.labelSmall,
    color: colors.success,
    fontWeight: '600',
  },
  criteriaContainer: {
    marginTop: -4,
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
});
