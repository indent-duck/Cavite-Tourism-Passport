import { colors, spacing, typography } from '@/theme';
import { useEffect, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type TextInputKeyPressEvent = NativeSyntheticEvent<{ key: string }>;

export interface CodeInputProps {
  value: string;
  onChangeText: (code: string) => void;
  length?: number;
  error?: string;
  testID?: string;
}

/**
 * CodeInput Component
 * 
 * A 6-digit verification code input with individual boxes.
 * Auto-advances to next box on digit entry and auto-backspaces on delete.
 * 
 * **Visual Specifications:**
 * - 6 boxes in horizontal row with 8px gap
 * - Each box: 54px height, 12px border radius, surface background
 * - Filled box: headlineLarge digit in primary color
 * - Focused box: lighter background with blinking cursor
 * - Empty box: 8px dot indicator (outline-variant at 60% opacity)
 * 
 * **Validates:** Requirements 6-digit verification code input
 */
export function CodeInput({
  value,
  onChangeText,
  length = 6,
  error,
  testID,
}: CodeInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<any[]>(Array(length).fill(null));

  // Auto-focus first box on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Split value into array of digits
  const digits = value.padEnd(length, ' ').split('').slice(0, length);

  const handleChangeText = (text: string, index: number) => {
    // Only allow single digit
    if (text.length > 1) {
      text = text.slice(-1);
    }

    // Only allow numbers
    if (text && !/^\d$/.test(text)) {
      return;
    }

    // Build new code string
    const newDigits = [...digits];
    newDigits[index] = text || ' ';
    const newCode = newDigits.join('').trim();
    
    onChangeText(newCode);

    // Auto-advance to next box if digit entered
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: TextInputKeyPressEvent,
    index: number
  ) => {
    // Handle backspace on empty box - move to previous box
    if (e.nativeEvent.key === 'Backspace' && !digits[index].trim()) {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.boxesContainer}>
        {digits.map((digit, index) => {
          const isFilled = digit.trim().length > 0;
          const isFocused = focusedIndex === index;
          const isEmpty = !isFilled;

          return (
            <View
              key={index}
              style={[
                styles.box,
                isFocused && styles.boxFocused,
                error && styles.boxError,
              ]}
            >
              <RNTextInput
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.input}
                value={isFilled ? digit : ''}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                testID={testID ? `${testID}-box-${index}` : undefined}
              />
              
              {/* Show digit if filled */}
              {isFilled && (
                <Text style={styles.digit} pointerEvents="none">
                  {digit}
                </Text>
              )}

              {/* Show dot indicator if empty and not focused */}
              {isEmpty && !isFocused && (
                <View style={styles.emptyIndicator} pointerEvents="none" />
              )}

              {/* Show cursor if focused */}
              {isFocused && (
                <View style={styles.cursor} pointerEvents="none" />
              )}
            </View>
          );
        })}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  boxesContainer: {
    flexDirection: 'row',
    gap: spacing.sm, // 8px
    maxWidth: 340,
    paddingHorizontal: spacing.xs, // 4px
  },
  box: {
    flex: 1,
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  boxFocused: {
    backgroundColor: '#FAFBFC', // Lighter than surface (#F4F6FA)
  },
  boxError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  input: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0, // Hide the actual input, show custom rendering
    padding: 0,
  },
  digit: {
    ...typography.headlineLarge,
    color: colors.primary,
  },
  emptyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF', // outline-variant color
    opacity: 0.6,
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: colors.accent,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.base, // 16px below boxes
    textAlign: 'center',
  },
});
