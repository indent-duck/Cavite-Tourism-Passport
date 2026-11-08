import { colors, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

/**
 * PasswordCriteria Component
 * 
 * Displays a live-updating checklist of password validation criteria.
 * Each criterion shows a checkmark icon when met, or an outline icon when not met.
 * 
 * Validates: Requirements 1.2.4 (Password strength validation)
 */

export interface PasswordCriteriaProps {
  /** The password string to validate */
  password: string;
  /** Optional custom styles to merge with base container styles */
  style?: StyleProp<ViewStyle>;
}

interface Criterion {
  label: string;
  test: (password: string) => boolean;
}

const criteria: Criterion[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    label: 'Includes a number (0-9)',
    test: (password) => /\d/.test(password),
  },
  {
    label: 'Includes uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Includes special character (!@#$%^&*)',
    test: (password) => /[!@#$%^&*]/.test(password),
  },
];

export function PasswordCriteria({ password, style }: PasswordCriteriaProps) {
  return (
    <View style={[styles.container, style]}>
      {criteria.map((criterion, index) => {
        const isMet = criterion.test(password);
        return (
          <View key={index} style={styles.row}>
            <Ionicons
              name={isMet ? 'checkmark-circle' : 'ellipse-outline'}
              size={16}
              color={isMet ? colors.success : colors.textSecondary}
              style={styles.icon}
            />
            <Text style={[styles.text, isMet && styles.textMet]}>
              {criterion.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No additional container styles needed - spacing is per row
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm, // 8px spacing between rows
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  textMet: {
    color: colors.success,
  },
});
