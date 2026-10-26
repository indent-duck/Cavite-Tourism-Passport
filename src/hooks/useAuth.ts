import {
    resetPassword as apiResetPassword,
    sendVerificationCode as apiSendVerificationCode,
    signIn as apiSignIn,
    signUp as apiSignUp,
} from '@/data/api';
import type { User } from '@/data/types';
import { useCallback, useState } from 'react';

/**
 * Hook for authentication operations with loading and error state management
 * 
 * Wraps auth API functions with loading and error state.
 * Navigation is handled by screens, not by this hook.
 * Mock rule: password "wrong" throws error for testing.
 * 
 * Requirements: Auth API abstraction with UI state
 */
export function useAuth() {
  // Sign In
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string): Promise<User> => {
    setSignInLoading(true);
    setSignInError(null);

    try {
      // Mock rule: password "wrong" throws error for testing
      if (password === 'wrong') {
        throw new Error('Invalid email or password');
      }

      const user = await apiSignIn(email, password);
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
    async (email: string, name: string, address: string, password: string): Promise<User> => {
      setSignUpLoading(true);
      setSignUpError(null);

      try {
        const user = await apiSignUp(email, name, address, password);
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

  const sendCode = useCallback(async (email: string): Promise<void> => {
    setSendCodeLoading(true);
    setSendCodeError(null);

    try {
      await apiSendVerificationCode(email);
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

  const resetPassword = useCallback(async (email: string, newPassword: string): Promise<void> => {
    setResetPasswordLoading(true);
    setResetPasswordError(null);

    try {
      await apiResetPassword(email, newPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      setResetPasswordError(errorMessage);
      throw error;
    } finally {
      setResetPasswordLoading(false);
    }
  }, []);

  return {
    signIn: {
      fn: signIn,
      loading: signInLoading,
      error: signInError,
    },
    signUp: {
      fn: signUp,
      loading: signUpLoading,
      error: signUpError,
    },
    sendCode: {
      fn: sendCode,
      loading: sendCodeLoading,
      error: sendCodeError,
    },
    resetPassword: {
      fn: resetPassword,
      loading: resetPasswordLoading,
      error: resetPasswordError,
    },
  };
}
