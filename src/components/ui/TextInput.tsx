import { colors, radii, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentRef, type Ref } from 'react';
import {
    Pressable,
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    View,
    type KeyboardTypeOptions,
    type ReturnKeyTypeOptions,
    type TextInputProps as RNTextInputProps,
} from 'react-native';

export type TextInputRef = ComponentRef<typeof RNTextInput>;

export interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  /** Hides the text and shows a show/hide toggle on the right */
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Autofill hint (Android + iOS), e.g. 'email', 'current-password', 'new-password', 'name' */
  autoComplete?: RNTextInputProps['autoComplete'];
  /** iOS autofill hint, e.g. 'emailAddress', 'password', 'newPassword', 'name' */
  textContentType?: RNTextInputProps['textContentType'];
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  /** 'submit' keeps the keyboard open when moving to the next field */
  submitBehavior?: RNTextInputProps['submitBehavior'];
  /** Ionicons glyph shown inside the field, before the text */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  testID?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  ref?: Ref<TextInputRef>;
}

/**
 * TextInput Component
 *
 * The single text field used across the app's forms.
 *
 * **Visual Specifications:**
 * - Height: 52px (single line), auto (multiline)
 * - Background: white, 1.5px border (border color, primary when focused, error when invalid)
 * - Label above the field (labelMedium, text color), error below with an alert icon
 * - Optional left icon; password fields get a show/hide toggle on the right
 *
 * Pass `ref`, `returnKeyType` and `onSubmitEditing` to chain fields so the
 * keyboard's return key moves to the next input.
 *
 * **Validates:** Requirements 1.2.2
 */
export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'sentences',
  autoComplete,
  textContentType,
  returnKeyType,
  onSubmitEditing,
  submitBehavior,
  leftIcon,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  testID,
  onFocus,
  onBlur,
  ref,
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);

  const borderColor = error ? colors.error : isFocused ? colors.primary : colors.border;
  const iconColor = isFocused ? colors.primary : colors.textSecondary;

  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.field,
          { borderColor },
          multiline && styles.fieldMultiline,
          !editable && styles.fieldDisabled,
        ]}
      >
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color={iconColor} style={styles.leftIcon} />
        )}

        <RNTextInput
          ref={ref}
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry && !isTextVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={!secureTextEntry && keyboardType !== 'email-address'}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          submitBehavior={submitBehavior}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          accessibilityLabel={label}
          accessibilityHint={error}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          testID={testID ? `${testID}-input` : undefined}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setIsTextVisible((visible) => !visible)}
            style={styles.toggle}
            hitSlop={spacing.xs}
            accessibilityRole="button"
            accessibilityLabel={isTextVisible ? 'Hide password' : 'Show password'}
          >
            {/* Icon shows the current state: open eye = visible, crossed eye = hidden */}
            <Ionicons
              name={isTextVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <View style={styles.errorRow} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.xs + 2,
  },
  label: {
    ...typography.labelMedium,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text,
    paddingHorizontal: spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: colors.background,
    borderRadius: radii.input,
    borderWidth: 1.5,
    paddingLeft: spacing.base,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  leftIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.bodyLarge,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
    paddingVertical: spacing.md,
    paddingRight: spacing.base,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  // 44px touch target for the show/hide toggle
  toggle: {
    width: 44,
    height: 44,
    marginRight: spacing.xs,
    marginLeft: -spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },
});
