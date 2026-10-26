/**
 * PasswordCriteria Usage Example
 * 
 * This file demonstrates how to use the PasswordCriteria component.
 * It is not part of the application bundle - for documentation only.
 */

import { spacing } from '@/theme';
import { useState } from 'react';
import { View } from 'react-native';
import { PasswordCriteria } from './PasswordCriteria';
import { TextInput } from './TextInput';

export function PasswordCriteriaExample() {
  const [password, setPassword] = useState('');

  return (
    <View style={{ padding: spacing.base }}>
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Enter your password"
      />
      
      {/* PasswordCriteria updates live as user types */}
      <PasswordCriteria 
        password={password}
        style={{ marginTop: spacing.sm }}
      />
    </View>
  );
}

/**
 * Example passwords and their validation results:
 * 
 * "" (empty)
 * ✗ At least 8 characters
 * ✗ Includes a number (0-9)
 * ✗ Includes uppercase letter (A-Z)
 * ✗ Includes special character (!@#$%^&*)
 * 
 * "password"
 * ✓ At least 8 characters
 * ✗ Includes a number (0-9)
 * ✗ Includes uppercase letter (A-Z)
 * ✗ Includes special character (!@#$%^&*)
 * 
 * "Password1!"
 * ✓ At least 8 characters
 * ✓ Includes a number (0-9)
 * ✓ Includes uppercase letter (A-Z)
 * ✓ Includes special character (!@#$%^&*)
 * 
 * "Pass1!"
 * ✗ At least 8 characters (only 6 characters)
 * ✓ Includes a number (0-9)
 * ✓ Includes uppercase letter (A-Z)
 * ✓ Includes special character (!@#$%^&*)
 */
