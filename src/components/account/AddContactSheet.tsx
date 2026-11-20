import { CodeInput } from '@/components/ui/CodeInput';
import { FeedbackContent } from '@/components/ui/FeedbackModal';
import { useContactVerification } from '@/hooks/useContactVerification';
import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AddContactSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
  /** Unverified number already on the account (+63XXXXXXXXXX), prefilled so it can be verified */
  initialNumber?: string;
}

type Stage = 'phone-input' | 'otp-verification' | 'success';

/**
 * AddContactSheet Component
 * 
 * Full-screen modal that slides up from bottom for adding and verifying a contact number.
 * Three stages: phone input, OTP verification, and success confirmation.
 * 
 * Validates Philippine mobile format (09XXXXXXXXX or 9XXXXXXXXX after +63)
 * Uses Modal with slide animation for better keyboard handling
 * 
 * Requirements: Modal component for contact number verification flow
 */
export function AddContactSheet({ visible, onDismiss, onSuccess, initialNumber }: AddContactSheetProps) {
  const insets = useSafeAreaInsets();
  const isVerifying = Boolean(initialNumber);
  
  const [stage, setStage] = useState<Stage>('phone-input');
  const [phoneNumber, setPhoneNumber] = useState(() => toLocalDigits(initialNumber));
  // Prefill again each time the sheet opens (the account's number may have loaded since mount)
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setPhoneNumber(toLocalDigits(initialNumber));
  }
  const [code, setCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  const { sendCode, verifyCode, isLoading, error } = useContactVerification();

  // Reset state when sheet is dismissed
  const handleDismiss = useCallback(() => {
    setStage('phone-input');
    setPhoneNumber('');
    setCode('');
    setLocalError(null);
    setResendCountdown(0);
    onDismiss();
  }, [onDismiss]);

  // Format phone number with spaces for display (917 123 4567)
  const formatPhoneForDisplay = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return cleaned;
    const [, first, second, third] = match;
    return [first, second, third].filter(Boolean).join(' ');
  };

  // Validate Philippine mobile format
  const validatePhoneNumber = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    // Accept 10 digits starting with 9 (9XXXXXXXXX)
    return /^9\d{9}$/.test(cleaned);
  };

  // Handle phone number input change
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
      setLocalError(null);
    }
  };

  // Handle send verification code
  const handleSendCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setLocalError('Please enter a valid 10-digit mobile number');
      return;
    }

    const fullNumber = `+63${phoneNumber}`;
    const success = await sendCode(fullNumber);
    
    if (success) {
      setStage('otp-verification');
      setResendCountdown(30);
      setCode('');
    }
  };

  // Handle resend code countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle resend code
  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    
    const fullNumber = `+63${phoneNumber}`;
    const success = await sendCode(fullNumber);
    
    if (success) {
      setResendCountdown(30);
      setCode('');
    }
  };

  // Handle verify code
  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setLocalError('Please enter the complete 6-digit code');
      return;
    }

    const fullNumber = `+63${phoneNumber}`;
    const success = await verifyCode(fullNumber, code);
    
    if (success) {
      setStage('success');
      setLocalError(null);
    } else {
      setLocalError(null); // Clear local error, use hook error
    }
  };

  // Handle done (success stage)
  const handleDone = () => {
    onSuccess();
    handleDismiss();
  };

  // Handle back to phone input
  const handleBack = () => {
    setStage('phone-input');
    setCode('');
    setLocalError(null);
  };

  // Mask phone number for display (917 ••• ••••)
  const maskPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return phone;
    return `${cleaned.slice(0, 3)} ••• ${cleaned.slice(-4)}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDismiss}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior="padding"
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Pressable
            style={styles.closeButton}
            onPress={handleDismiss}
            hitSlop={8}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {stage === 'phone-input' && (
            <View style={styles.stageContainer}>
              {/* Stage Header */}
              <View style={styles.inputHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name="chatbox-outline" size={18} color={colors.accent} />
                </View>
                <Text style={styles.stageTitle}>
                  {isVerifying ? 'Verify Contact Number' : 'Add Contact Number'}
                </Text>
              </View>

              {/* Description */}
              <Text style={styles.description}>
                {isVerifying
                  ? 'Confirm your 10-digit mobile number and we’ll text you a code to verify it.'
                  : 'Enter your 10-digit mobile number to receive instant SMS codes for verified tourist perks and stamp claims.'}
              </Text>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Phone</Text>
                <View style={[styles.phoneInputContainer, localError && styles.phoneInputError]}>
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>+63</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    value={formatPhoneForDisplay(phoneNumber)}
                    onChangeText={handlePhoneChange}
                    placeholder="917 123 4567"
                    placeholderTextColor={`${colors.textSecondary}99`}
                    keyboardType="phone-pad"
                    maxLength={12}
                    editable={!isLoading}
                    autoFocus
                  />
                </View>
                {(localError || error) && (
                  <Text style={styles.inputError}>{localError || error}</Text>
                )}
              </View>

              {/* Send Code Button */}
              <Pressable
                style={[styles.accentButton, isLoading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <>
                    <Text style={styles.accentButtonText}>Send Verification Code</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.background} />
                  </>
                )}
              </Pressable>
            </View>
          )}

          {stage === 'otp-verification' && (
            <View style={styles.stageContainer}>
              {/* Stage Header */}
              <View style={styles.verifyHeader}>
                <Pressable
                  style={styles.backButton}
                  onPress={handleBack}
                  hitSlop={8}
                >
                  <Ionicons name="arrow-back" size={16} color={colors.primary} />
                  <Text style={styles.backButtonText}>Back</Text>
                </Pressable>
                <View style={styles.sentBadge}>
                  <Text style={styles.sentBadgeText}>SMS CODE SENT</Text>
                </View>
              </View>

              {/* Title and Description */}
              <View style={styles.centerContent}>
                <Text style={styles.verifyTitle}>Verify Mobile Number</Text>
                <Text style={styles.verifyDescription}>
                  Code sent to +63 {maskPhoneNumber(phoneNumber)}
                </Text>
              </View>

              {/* Code Input */}
              <View style={styles.codeInputContainer}>
                <CodeInput
                  value={code}
                  onChangeText={setCode}
                  length={6}
                  error={error || localError || undefined}
                />
              </View>

              {/* Resend Code */}
              <View style={styles.resendRow}>
                <Text style={styles.resendLabel}>Didn&apos;t receive code?</Text>
                <Pressable
                  onPress={handleResendCode}
                  disabled={resendCountdown > 0}
                  hitSlop={8}
                >
                  <Text
                    style={[
                      styles.resendButton,
                      resendCountdown > 0 && styles.resendButtonDisabled,
                    ]}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend'}
                  </Text>
                </Pressable>
              </View>

              {/* Verify Button */}
              <Pressable
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color={colors.background} />
                    <Text style={styles.primaryButtonText}>Verify & Link</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {stage === 'success' && (
            <View style={[styles.stageContainer, styles.successStage]}>
              {/* Same feedback layout as the other account actions */}
              <FeedbackContent
                icon="phone-portrait"
                title="Contact number verified"
                message="Your passport will now get SMS codes for verified tourist perks and stamp claims."
                note={{ icon: 'chatbox-outline', text: `+63 ${formatPhoneForDisplay(phoneNumber)}` }}
                buttonTitle="Done"
                onPress={handleDone}
                testID="contact-verified"
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** "+63 917 123 4567" / "09171234567" -> "9171234567" (empty if it isn't a PH mobile number) */
function toLocalDigits(number?: string): string {
  const digits = (number ?? '').replace(/\D/g, '');
  const local = digits.replace(/^(63|0)(?=9\d{9}$)/, '');
  return /^9\d{9}$/.test(local) ? local : '';
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  stageContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  
  // Phone input stage - header styles
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stageTitle: {
    ...typography.titleMedium,
    color: colors.primary,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFDBC8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.titleMedium,
    color: colors.primary,
  },
  
  // Description styles
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  
  // Input group styles
  inputGroup: {
    marginBottom: spacing.base,
    flex: 1,
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  phoneInputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  phonePrefix: {
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  phonePrefixText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primary,
  },
  phoneInput: {
    flex: 1,
    paddingLeft: spacing.md,
    ...typography.bodyMedium,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.primary,
  },
  inputError: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  // Button styles
  accentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  accentButtonText: {
    ...typography.labelLarge,
    color: colors.background,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  
  // OTP Verification stage
  verifyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
  },
  sentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: `${colors.accent}1A`,
    borderRadius: radii.chip,
  },
  sentBadgeText: {
    ...typography.labelSmall,
    color: colors.accent,
    letterSpacing: 0.8,
  },
  centerContent: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.base,
  },
  verifyTitle: {
    ...typography.titleMedium,
    color: colors.primary,
  },
  verifyDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  codeInputContainer: {
    marginBottom: spacing.base,
    flex: 1,
    justifyContent: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  resendLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  resendButton: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  resendButtonDisabled: {
    opacity: 0.4,
    textDecorationLine: 'none',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    ...typography.labelLarge,
    color: colors.background,
  },
  
  // Success stage
  successStage: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
  },
});
