import { colors, spacing, typography } from '@/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

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
 * Uses the single-input pattern for reliable Android keyboard behavior.
 * 
 * **Architecture:**
 * - ONE TextInput that overlays the entire component (invisible, opacity: 0)
 * - The TextInput receives all touch events and keyboard interactions
 * - Six visual boxes that display individual digits underneath
 * - The overlay pattern ensures keyboard reliably reopens on tap
 * - The focused box is determined by value.length
 * 
 * **Visual Specifications:**
 * - 6 boxes in horizontal row with 8px gap
 * - Each box: 54px height, 12px border radius, surface background
 * - Filled box: headlineLarge digit in primary color
 * - Focused box: lighter background with custom cursor
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
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Split value into array of digits for display
  const digits = value.padEnd(length, ' ').split('').slice(0, length);
  
  // Focused box is the next empty box (determined by value.length)
  const focusedIndex = isFocused ? value.length : -1;

  const handleChangeText = (text: string) => {
    // Filter to digits only, limit to length
    const filtered = text.replace(/[^\d]/g, '').slice(0, length);
    onChangeText(filtered);
  };

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.inputWrapper}>
        {/* Visual boxes - rendered first so TextInput overlays them */}
        <View style={styles.boxesContainer} pointerEvents="box-none">
          {digits.map((digit, index) => {
            const isFilled = digit.trim().length > 0;
            const isBoxFocused = focusedIndex === index;

            return (
              <View
                key={index}
                style={[
                  styles.box,
                  isBoxFocused && styles.boxFocused,
                  error && styles.boxError,
                ]}
              >
                {/* Show digit text if filled */}
                {isFilled && (
                  <Text style={styles.digit}>{digit}</Text>
                )}

                {/* Show dot indicator if empty and not focused */}
                {!isFilled && !isBoxFocused && (
                  <View style={styles.emptyIndicator} />
                )}

                {/* Show cursor if focused on this box */}
                {isBoxFocused && (
                  <View style={styles.cursor} />
                )}
              </View>
            );
          })}
        </View>

        {/* Invisible overlay input - receives all touch events */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          maxLength={length}
          style={styles.hiddenInput}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          showSoftInputOnFocus={true}
          blurOnSubmit={false}
          caretHidden={true}
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
    alignItems: 'center',
    // Height removed - let container grow to accommodate error message
  },
  inputWrapper: {
    height: 54, // Fixed height for boxes + overlay input only
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  boxesContainer: {
    flexDirection: 'row',
    gap: spacing.sm, // 8px
    maxWidth: 340,
    paddingHorizontal: spacing.xs, // 4px
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // Fill the inputWrapper height
    opacity: 0, // Completely invisible
    color: 'transparent',
    fontSize: 1,
    textAlign: 'center',
  },
  box: {
    flex: 1,
    height: 54,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    backgroundColor: '#FAFBFC', // Lighter than surface (#F4F6FA)
  },
  boxError: {
    borderWidth: 1,
    borderColor: colors.error,
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
