import {
    resetPassword as apiResetPassword,
    sendVerificationCode as apiSendVerificationCode,
    signIn as apiSignIn,
    signUp as apiSignUp,
} from '@/data/api';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Hook for authentication operations with loading and error state management
 * 
 * Wraps auth API functions and handles navigation on success.
 * Mock rule: password "wrong" throws error for testing.
 * 
 * Validates: Requirements 1.2.9 (Auth Hook)
 */
export function useAuth() {
  // Sign In
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    setSignInLoading(true);
    setSignInError(null);

    try {
      // Mock rule: password "wrong" throws error for testing
      if (password === 'wrong') {
        throw new Error('Invalid email or password');
      }

      const user = await apiSignIn(email, password);
      
      // On success, navigate to Explore tab
      router.replace('/(tabs)/explore');
      
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in. Please try again.';
      setSignInError(errorMessage);
      throw error;
    } finally {
      setSignInLoading(false);
    }
  }, []);

  // Sign Up
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const signUp = useCallback(
    async (email: string, name: string, address: string, password: string) => {
      setSignUpLoading(true);
      setSignUpError(null);

      try {
        const user = await apiSignUp(email, name, address, password);
        
        // On success, navigate to Explore tab (replace to clear auth stack)
        router.replace('/(tabs)/explore');
        
        return user;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
        setSignUpError(errorMessage);
        throw error;
      } finally {
        setSignUpLoading(false);
      }
    },
    []
  );

  // Send Verification Code
  const [sendCodeLoading, setSendCodeLoading] = useState(false);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);

  const sendCode = useCallback(async (email: string) => {
    setSendCodeLoading(true);
    setSendCodeError(null);

    try {
      await apiSendVerificationCode(email);
      // Note: Navigation is handled by the caller (e.g., navigate to verify screen with email param)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code. Please try again.';
      setSendCodeError(errorMessage);
      throw error;
    } finally {
      setSendCodeLoading(false);
    }
  }, []);

  // Reset Password
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    setResetPasswordLoading(true);
    setResetPasswordError(null);

    try {
      await apiResetPassword(email, newPassword);
      // Note: Navigation is handled by the caller (e.g., navigate to success screen)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      setResetPasswordError(errorMessage);
      throw error;
    } finally {
      setResetPasswordLoading(false);
    }
  }, []);

  return {
    signIn,
    signInLoading,
    signInError,
    signUp,
    signUpLoading,
    signUpError,
    sendCode,
    sendCodeLoading,
    sendCodeError,
    resetPassword,
    resetPasswordLoading,
    resetPasswordError,
  };
}
