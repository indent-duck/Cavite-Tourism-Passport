import { colors, radii, spacing, typography } from '@/theme';
import { useState } from 'react';
import {
    KeyboardTypeOptions,
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  testID?: string;
  onFocus?: () => void;
}

/**
 * TextInput Component
 * 
 * A styled text input with label, error states, and focus handling.
 * 
 * **Visual Specifications:**
 * - Container height: 56px (single line), auto (multiline)
 * - Background: surface color (#F4F6FA)
 * - Border: 1px transparent default, 1.5px primary when focused, 1.5px error when error
 * - Label above input with 4px spacing
 * - Error message below input with 4px spacing
 * - 12px border radius, 16px padding
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
  editable = true,
  multiline = false,
  numberOfLines = 1,
  testID,
  onFocus,
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Handle focus with both internal and external handlers
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  // Determine border style based on state
  const getBorderStyle = () => {
    if (error) {
      return {
        borderColor: colors.error,
        borderWidth: 1.5,
      };
    }
    if (isFocused) {
      return {
        borderColor: colors.primary,
        borderWidth: 1.5,
      };
    }
    return {
      borderColor: 'transparent',
      borderWidth: 1,
    };
  };

  const inputContainerStyle = [
    styles.inputContainer,
    getBorderStyle(),
    multiline && styles.inputContainerMultiline,
    !editable && styles.inputContainerDisabled,
  ];

  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={inputContainerStyle}>
        <RNTextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          testID={testID ? `${testID}-input` : undefined}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.xs, // 4px
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.input, // 12px
    paddingHorizontal: spacing.base, // 16px
    paddingVertical: spacing.base, // 16px
    minHeight: 56,
    justifyContent: 'center',
  },
  inputContainerMultiline: {
    minHeight: 56,
    height: 'auto',
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  input: {
    ...typography.bodyLarge,
    color: colors.text,
    padding: 0, // Remove default padding to control via container
    minHeight: 24, // lineHeight from bodyLarge
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs, // 4px
  },
});
